const Ticket = require('../models/Ticket');
const Asset = require('../models/Asset');
const { successResponse } = require('../utils/apiResponse');

const toCSV = (rows, headers) => {
  const escape = (v) => {
    if (v === null || v === undefined) return '';
    const s = String(v).replace(/"/g, '""');
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s;
  };
  const headerRow = headers.map(h => h.label).join(',');
  const dataRows = rows.map(row => headers.map(h => escape(row[h.key])).join(','));
  return [headerRow, ...dataRows].join('\n');
};

// GET /api/reports/tickets
const ticketReport = async (req, res, next) => {
  try {
    const { organization } = req.user;
    const { startDate, endDate, status, priority, format = 'json' } = req.query;

    let query = { organization };
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const tickets = await Ticket.find(query)
      .populate('requester', 'name email')
      .populate('assignedTo', 'name email')
      .populate('category', 'name')
      .populate('department', 'name')
      .sort({ createdAt: -1 });

    if (format === 'csv') {
      const headers = [
        { key: 'ticketId', label: 'Ticket ID' },
        { key: 'title', label: 'Title' },
        { key: 'status', label: 'Status' },
        { key: 'priority', label: 'Priority' },
        { key: 'category', label: 'Category' },
        { key: 'requester', label: 'Requester' },
        { key: 'assignedTo', label: 'Assigned To' },
        { key: 'slaBreached', label: 'SLA Breached' },
        { key: 'createdAt', label: 'Created At' },
        { key: 'resolvedAt', label: 'Resolved At' },
      ];
      const rows = tickets.map(t => ({
        ticketId: t.ticketId,
        title: t.title,
        status: t.status,
        priority: t.priority,
        category: t.category?.name || '',
        requester: t.requester?.name || '',
        assignedTo: t.assignedTo?.name || '',
        slaBreached: t.slaBreached ? 'Yes' : 'No',
        createdAt: t.createdAt?.toISOString(),
        resolvedAt: t.resolution?.resolvedAt?.toISOString() || '',
      }));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=tickets-report.csv');
      return res.send(toCSV(rows, headers));
    }

    return successResponse(res, { tickets, total: tickets.length });
  } catch (err) {
    next(err);
  }
};

// GET /api/reports/assets
const assetReport = async (req, res, next) => {
  try {
    const { organization } = req.user;
    const { format = 'json', status } = req.query;

    let query = { organization };
    if (status) query.status = status;

    const assets = await Asset.find(query)
      .populate('assignedTo', 'name email')
      .populate('department', 'name')
      .populate('vendor', 'name')
      .sort({ createdAt: -1 });

    if (format === 'csv') {
      const headers = [
        { key: 'assetId', label: 'Asset ID' },
        { key: 'name', label: 'Name' },
        { key: 'assetType', label: 'Type' },
        { key: 'serialNumber', label: 'Serial Number' },
        { key: 'status', label: 'Status' },
        { key: 'assignedTo', label: 'Assigned To' },
        { key: 'department', label: 'Department' },
        { key: 'vendor', label: 'Vendor' },
        { key: 'purchaseDate', label: 'Purchase Date' },
        { key: 'warrantyExpiresAt', label: 'Warranty Expires' },
      ];
      const rows = assets.map(a => ({
        assetId: a.assetId,
        name: a.name,
        assetType: a.assetType,
        serialNumber: a.serialNumber || '',
        status: a.status,
        assignedTo: a.assignedTo?.name || '',
        department: a.department?.name || '',
        vendor: a.vendor?.name || '',
        purchaseDate: a.purchaseDate?.toISOString().split('T')[0] || '',
        warrantyExpiresAt: a.warrantyExpiresAt?.toISOString().split('T')[0] || '',
      }));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=assets-report.csv');
      return res.send(toCSV(rows, headers));
    }

    return successResponse(res, { assets, total: assets.length });
  } catch (err) {
    next(err);
  }
};

// GET /api/reports/sla
const slaReport = async (req, res, next) => {
  try {
    const { organization } = req.user;
    const { startDate, endDate } = req.query;

    let match = { organization };
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate);
    }

    const slaStats = await Ticket.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$priority',
          total: { $sum: 1 },
          breached: { $sum: { $cond: ['$slaBreached', 1, 0] } },
          compliant: { $sum: { $cond: ['$slaBreached', 0, 1] } },
        },
      },
      {
        $addFields: {
          complianceRate: { $multiply: [{ $divide: ['$compliant', '$total'] }, 100] },
        },
      },
    ]);

    return successResponse(res, { slaStats });
  } catch (err) {
    next(err);
  }
};

module.exports = { ticketReport, assetReport, slaReport };
