const mongoose = require('mongoose');
const Asset = require('../models/Asset');
const KnowledgeArticle = require('../models/KnowledgeArticle');
const Category = require('../models/Category');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Organization = require('../models/Organization');
const Department = require('../models/Department');

mongoose.connect('mongodb://127.0.0.1:27017/servicedeskpro').then(async () => {
  try {
    const org = await Organization.findOne();
    const itDept = await Department.findOne({ name: 'IT' });
    const hrDept = await Department.findOne({ name: 'Human Resources' });
    const emp1 = await User.findOne({ email: 'emma@techcorp.com' });
    const assetMgr = await User.findOne({ role: 'asset_manager' });
    const tech1 = await User.findOne({ role: 'technician' });

    const catNet = await Category.findOne({ name: 'Network' });
    const catSw = await Category.findOne({ name: 'Software' });

    let vendorCisco = await Vendor.findOne({ name: 'Cisco Systems' });
    if (!vendorCisco) {
      vendorCisco = await Vendor.create({ name: 'Cisco Systems', organization: org._id, contactName: 'Cisco Rep', email: 'support@cisco.com', phone: '+1-800-CISCO', services: ['Network Hardware'], isActive: true });
    }
    
    let vendorAdobe = await Vendor.findOne({ name: 'Adobe Inc.' });
    if (!vendorAdobe) {
      vendorAdobe = await Vendor.create({ name: 'Adobe Inc.', organization: org._id, contactName: 'Adobe Rep', email: 'support@adobe.com', phone: '+1-800-ADOBE', services: ['Software'], isActive: true });
    }

    const assetsData = [
      {
        name: 'Cisco Meraki MR46 Access Point',
        assetType: 'Hardware',
        category: 'Network',
        make: 'Cisco',
        model: 'MR46',
        serialNumber: 'CM46-991',
        organization: org._id,
        department: itDept._id,
        vendor: vendorCisco._id,
        purchaseDate: new Date('2023-01-15'),
        purchaseCost: 850,
        warrantyExpiresAt: new Date('2028-01-15'),
        status: 'Under Repair',
        history: [{ action: 'Asset Created', performedBy: assetMgr._id }],
      },
      {
        name: 'Adobe Acrobat Pro License (Seat 1)',
        assetType: 'Software',
        category: 'License',
        make: 'Adobe',
        model: 'Acrobat Pro DC',
        serialNumber: 'ADOBE-ACRO-001',
        organization: org._id,
        department: hrDept._id,
        assignedTo: emp1._id,
        vendor: vendorAdobe._id,
        purchaseDate: new Date('2024-02-01'),
        purchaseCost: 240,
        warrantyExpiresAt: new Date('2025-02-01'), // License expiry
        status: 'Assigned',
        history: [{ action: 'Asset Created', performedBy: assetMgr._id }],
      }
    ];
    for (let a of assetsData) {
      await Asset.create(a);
    }

    // New Knowledge Articles based on tickets
    await KnowledgeArticle.create([
      {
        title: 'Troubleshooting Missing Wi-Fi Networks',
        problemDescription: 'Wi-Fi network is not visible in the list of available networks or no routers are available nearby.',
        symptoms: ['No Wi-Fi networks found', 'Cannot see company SSID'],
        solution: '1. Check if the physical Wi-Fi switch on your laptop is turned ON.\n2. Move closer to the center of the office where Access Points are located.\n3. If you suspect an Access Point is down (e.g. no signal in a specific zone), please report the exact location in your ticket.\n4. Ensure your wireless driver is up to date via Windows Update.',
        category: catNet._id,
        organization: org._id,
        author: tech1._id,
        status: 'Published',
        tags: ['WiFi', 'Network', 'Router', 'Missing'],
      },
      {
        title: 'Fixing Microsoft Outlook Sync Issues',
        problemDescription: 'Outlook desktop app is not syncing new emails, but they appear in webmail.',
        symptoms: ['Emails not updating', 'Sync error icon in Outlook', 'Send/Receive error'],
        solution: '1. Check the bottom right of Outlook to see if it says "Working Offline". If yes, click it to reconnect.\n2. Go to Send/Receive tab and click "Update Folder".\n3. Restart Outlook.\n4. If the issue persists, your profile may be corrupted. IT can help rebuild your Outlook profile.',
        category: catSw._id,
        organization: org._id,
        author: tech1._id,
        status: 'Published',
        tags: ['Email', 'Outlook', 'Sync', 'Software'],
      }
    ]);

    console.log('Successfully added more data related to the present tickets.');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
});
