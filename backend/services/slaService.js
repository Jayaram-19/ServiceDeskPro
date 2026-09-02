const Ticket = require('../models/Ticket');
const SLAPolicy = require('../models/SLAPolicy');
const User = require('../models/User');
const { notifySLAWarning, notifySLABreach } = require('./notificationService');

/**
 * Calculate SLA deadline from a start date and minutes, optionally respecting business hours.
 */
const calculateDeadline = (startDate, minutes, businessHours) => {
  if (!businessHours || !businessHours.enabled) {
    return new Date(startDate.getTime() + minutes * 60 * 1000);
  }

  // Business hours calculation
  let remaining = minutes;
  let current = new Date(startDate);
  const { startHour, endHour, workDays } = businessHours;

  while (remaining > 0) {
    const day = current.getDay();
    if (workDays.includes(day)) {
      const dayStart = new Date(current);
      dayStart.setHours(startHour, 0, 0, 0);
      const dayEnd = new Date(current);
      dayEnd.setHours(endHour, 0, 0, 0);

      if (current < dayStart) current = dayStart;

      if (current >= dayEnd) {
        // Move to next day
        current.setDate(current.getDate() + 1);
        current.setHours(startHour, 0, 0, 0);
        continue;
      }

      const minutesLeftToday = (dayEnd - current) / 60000;
      if (remaining <= minutesLeftToday) {
        current = new Date(current.getTime() + remaining * 60000);
        remaining = 0;
      } else {
        remaining -= minutesLeftToday;
        current.setDate(current.getDate() + 1);
        current.setHours(startHour, 0, 0, 0);
      }
    } else {
      current.setDate(current.getDate() + 1);
      current.setHours(startHour, 0, 0, 0);
    }
  }
  return current;
};

/**
 * Apply SLA policy to a ticket when created or priority changes.
 */
const applySLAPolicy = async (ticket) => {
  try {
    const policy = await SLAPolicy.findOne({
      organization: ticket.organization,
      priority: ticket.priority,
      isActive: true,
    });

    if (!policy) return ticket;

    const now = ticket.createdAt || new Date();
    ticket.slaPolicy = policy._id;
    ticket.slaResponseDeadline = calculateDeadline(now, policy.responseTimeMinutes, policy.businessHours);
    ticket.slaDeadline = calculateDeadline(now, policy.resolutionTimeMinutes, policy.businessHours);

    return ticket;
  } catch (err) {
    console.error('[SLAService] applySLAPolicy error:', err.message);
    return ticket;
  }
};

/**
 * Check all active tickets for SLA warnings/breaches. Run on a cron job.
 */
const checkSLAStatus = async () => {
  try {
    const now = new Date();

    const activeTickets = await Ticket.find({
      status: { $nin: ['Resolved', 'Closed', 'Cancelled'] },
      slaDeadline: { $exists: true },
    }).populate('slaPolicy assignedTo requester');

    for (const ticket of activeTickets) {
      const policy = ticket.slaPolicy;
      if (!policy) continue;

      const deadline = new Date(ticket.slaDeadline);
      const totalMs = deadline - new Date(ticket.createdAt);
      const elapsedMs = now - new Date(ticket.createdAt);
      const percentConsumed = (elapsedMs / totalMs) * 100;

      // SLA Breach
      if (now > deadline && !ticket.slaBreached) {
        ticket.slaBreached = true;
        ticket.slaEscalated = true;
        ticket.history.push({
          action: 'SLA Breached',
          note: `SLA deadline passed at ${deadline.toISOString()}`,
          timestamp: now,
        });
        await ticket.save();

        // Notify assigned technician and requester
        if (ticket.assignedTo) await notifySLABreach(ticket, ticket.assignedTo._id);
        await notifySLABreach(ticket, ticket.requester._id);

        // Find manager and notify
        const managers = await User.find({
          organization: ticket.organization,
          role: 'manager',
          status: 'Active',
        });
        for (const mgr of managers) await notifySLABreach(ticket, mgr._id);

      } else if (!ticket.slaBreached && percentConsumed >= (policy.escalation?.warnAtPercent || 80)) {
        // SLA Warning — only fire once (no flag for this, skip if already escalated)
        if (!ticket.slaEscalated) {
          if (ticket.assignedTo) await notifySLAWarning(ticket, ticket.assignedTo._id);
        }
      }
    }
    console.log(`[SLAService] Checked ${activeTickets.length} active tickets`);
  } catch (err) {
    console.error('[SLAService] checkSLAStatus error:', err.message);
  }
};

module.exports = { applySLAPolicy, checkSLAStatus, calculateDeadline };
