const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');
const { applySLAPolicy } = require('../services/slaService');

mongoose.connect('mongodb://127.0.0.1:27017/servicedeskpro').then(async () => {
  try {
    const tickets = await Ticket.find({ slaPolicy: { $exists: false } });
    console.log(`Found ${tickets.length} tickets without SLA.`);
    
    for (let t of tickets) {
      const updatedTicket = await applySLAPolicy(t);
      // Simulate some breaches for realistic report data
      if (t.priority === 'Critical') {
        updatedTicket.slaBreached = true;
      }
      await updatedTicket.save();
    }
    
    console.log('Successfully applied SLA to seeded tickets.');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
});
