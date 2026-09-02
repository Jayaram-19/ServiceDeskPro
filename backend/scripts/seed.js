require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');

const Organization = require('../models/Organization');
const Department = require('../models/Department');
const User = require('../models/User');
const Category = require('../models/Category');
const SLAPolicy = require('../models/SLAPolicy');
const Ticket = require('../models/Ticket');
const Asset = require('../models/Asset');
const Vendor = require('../models/Vendor');
const KnowledgeArticle = require('../models/KnowledgeArticle');
const Comment = require('../models/Comment');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    Organization.deleteMany({}), Department.deleteMany({}), User.deleteMany({}),
    Category.deleteMany({}), SLAPolicy.deleteMany({}), Ticket.deleteMany({}),
    Asset.deleteMany({}), Vendor.deleteMany({}), KnowledgeArticle.deleteMany({}),
    Comment.deleteMany({}),
  ]);
  
  // also clear counters collection for mongoose-sequence
  try {
    await mongoose.connection.db.collection('counters').deleteMany({});
  } catch(e) {}
  
  console.log('🗑️  Cleared existing data');

  // --- Organization ---
  const org = await Organization.create({
    name: 'TechCorp Solutions',
    description: 'A leading technology solutions company',
    domain: 'techcorp.com',
    settings: { ticketPrefix: 'TKT', allowEmployeeReopening: true, autoCloseAfterDays: 7 },
  });

  // --- Departments ---
  const [itDept, hrDept, financeDept, marketingDept, engineeringDept] = await Department.create([
    { name: 'IT', description: 'Information Technology', organization: org._id },
    { name: 'Human Resources', description: 'HR Department', organization: org._id },
    { name: 'Finance', description: 'Finance & Accounting', organization: org._id },
    { name: 'Marketing', description: 'Marketing & Communications', organization: org._id },
    { name: 'Engineering', description: 'Software Engineering', organization: org._id },
  ]);

  // --- Users ---
  const adminUser = await User.create({
    name: 'Alex Administrator',
    email: 'admin@techcorp.com',
    passwordHash: 'Admin@123',
    role: 'admin',
    organization: org._id,
    department: itDept._id,
    status: 'Active',
  });

  const managerUser = await User.create({
    name: 'Morgan Manager',
    email: 'manager@techcorp.com',
    passwordHash: 'Manager@123',
    role: 'manager',
    organization: org._id,
    department: itDept._id,
    status: 'Active',
  });

  const [tech1, tech2, tech3] = await User.create([
    {
      name: 'Taylor Tech',
      email: 'taylor@techcorp.com',
      passwordHash: 'Tech@123',
      role: 'technician',
      organization: org._id,
      department: itDept._id,
      status: 'Active',
      skills: ['Networking', 'Windows', 'Hardware'],
    },
    {
      name: 'Sam Support',
      email: 'sam@techcorp.com',
      passwordHash: 'Tech@123',
      role: 'technician',
      organization: org._id,
      department: itDept._id,
      status: 'Active',
      skills: ['Software', 'Email', 'VPN'],
    },
    {
      name: 'Riley Resolver',
      email: 'riley@techcorp.com',
      passwordHash: 'Tech@123',
      role: 'technician',
      organization: org._id,
      department: itDept._id,
      status: 'Active',
      skills: ['Hardware', 'Printers', 'macOS'],
    },
  ]);

  const [emp1, emp2, emp3, emp4] = await User.create([
    { name: 'Emma Employee', email: 'emma@techcorp.com', passwordHash: 'Employee@123', role: 'employee', organization: org._id, department: hrDept._id, status: 'Active' },
    { name: 'James Johnson', email: 'james@techcorp.com', passwordHash: 'Employee@123', role: 'employee', organization: org._id, department: financeDept._id, status: 'Active' },
    { name: 'Priya Patel', email: 'priya@techcorp.com', passwordHash: 'Employee@123', role: 'employee', organization: org._id, department: engineeringDept._id, status: 'Active' },
    { name: 'Carlos Cruz', email: 'carlos@techcorp.com', passwordHash: 'Employee@123', role: 'employee', organization: org._id, department: marketingDept._id, status: 'Active' },
  ]);

  const assetMgr = await User.create({
    name: 'Ashley AssetManager',
    email: 'assets@techcorp.com',
    passwordHash: 'Asset@123',
    role: 'asset_manager',
    organization: org._id,
    department: itDept._id,
    status: 'Active',
  });

  // --- Categories ---
  const [catHw, catSw, catNet, catAccount, catEmail, catPrinter, catOther] = await Category.create([
    { name: 'Hardware', description: 'Physical device issues', organization: org._id, icon: 'cpu' },
    { name: 'Software', description: 'Application and software issues', organization: org._id, icon: 'monitor' },
    { name: 'Network', description: 'Network and connectivity issues', organization: org._id, icon: 'wifi' },
    { name: 'Account/Access', description: 'Login, passwords, permissions', organization: org._id, icon: 'key' },
    { name: 'Email', description: 'Email and Outlook issues', organization: org._id, icon: 'mail' },
    { name: 'Printer', description: 'Printer and scanner issues', organization: org._id, icon: 'printer' },
    { name: 'Other', description: 'Other IT requests', organization: org._id, icon: 'tag' },
  ]);

  // --- SLA Policies ---
  await SLAPolicy.create([
    {
      name: 'Critical SLA',
      organization: org._id,
      priority: 'Critical',
      responseTimeMinutes: 30,
      resolutionTimeMinutes: 60,
      businessHours: { enabled: false },
      escalation: { warnAtPercent: 80, escalateOnBreach: true },
    },
    {
      name: 'High SLA',
      organization: org._id,
      priority: 'High',
      responseTimeMinutes: 60,
      resolutionTimeMinutes: 240,
      businessHours: { enabled: true, startHour: 9, endHour: 18, workDays: [1,2,3,4,5] },
      escalation: { warnAtPercent: 80, escalateOnBreach: true },
    },
    {
      name: 'Medium SLA',
      organization: org._id,
      priority: 'Medium',
      responseTimeMinutes: 120,
      resolutionTimeMinutes: 480,
      businessHours: { enabled: true, startHour: 9, endHour: 18, workDays: [1,2,3,4,5] },
      escalation: { warnAtPercent: 80, escalateOnBreach: true },
    },
    {
      name: 'Low SLA',
      organization: org._id,
      priority: 'Low',
      responseTimeMinutes: 480,
      resolutionTimeMinutes: 1440,
      businessHours: { enabled: true, startHour: 9, endHour: 18, workDays: [1,2,3,4,5] },
      escalation: { warnAtPercent: 80, escalateOnBreach: false },
    },
  ]);

  // --- Vendor ---
  const [vendorDell, vendorHP] = await Vendor.create([
    { name: 'Dell Technologies', organization: org._id, contactName: 'John Dell', email: 'support@dell.com', phone: '+1-800-DELL', services: ['Hardware', 'Support'], isActive: true },
    { name: 'HP Inc.', organization: org._id, contactName: 'Jane HP', email: 'support@hp.com', phone: '+1-800-HP', services: ['Hardware', 'Printers'], isActive: true },
  ]);

  // --- Assets ---
  const assetsData = [
    {
      name: 'Dell Latitude 5520', assetType: 'Hardware', category: 'Laptop',
      make: 'Dell', model: 'Latitude 5520', serialNumber: 'DL5520-001',
      organization: org._id, department: hrDept._id, assignedTo: emp1._id,
      vendor: vendorDell._id, purchaseDate: new Date('2023-06-01'),
      purchaseCost: 1299, warrantyExpiresAt: new Date('2026-06-01'),
      status: 'Assigned',
      history: [{ action: 'Asset Created', performedBy: assetMgr._id }],
    },
    {
      name: 'HP EliteBook 840', assetType: 'Hardware', category: 'Laptop',
      make: 'HP', model: 'EliteBook 840 G8', serialNumber: 'HP840-002',
      organization: org._id, department: financeDept._id, assignedTo: emp2._id,
      vendor: vendorHP._id, purchaseDate: new Date('2023-03-15'),
      purchaseCost: 1199, warrantyExpiresAt: new Date('2025-03-15'),
      status: 'Assigned',
      history: [{ action: 'Asset Created', performedBy: assetMgr._id }],
    },
    {
      name: 'Dell XPS 15', assetType: 'Hardware', category: 'Laptop',
      make: 'Dell', model: 'XPS 15 9510', serialNumber: 'DXPS15-003',
      organization: org._id, department: itDept._id,
      vendor: vendorDell._id, purchaseDate: new Date('2024-01-10'),
      purchaseCost: 1899, warrantyExpiresAt: new Date('2027-01-10'),
      status: 'Available',
      history: [{ action: 'Asset Created', performedBy: assetMgr._id }],
    },
    {
      name: 'HP LaserJet Pro M404dn', assetType: 'Hardware', category: 'Printer',
      make: 'HP', model: 'LaserJet Pro M404dn', serialNumber: 'HPLJ-004',
      organization: org._id, department: hrDept._id,
      vendor: vendorHP._id, purchaseDate: new Date('2022-11-01'),
      purchaseCost: 299, warrantyExpiresAt: new Date('2025-11-01'),
      status: 'Under Repair',
      history: [{ action: 'Asset Created', performedBy: assetMgr._id }],
    },
    {
      name: 'Dell UltraSharp 27" Monitor', assetType: 'Hardware', category: 'Monitor',
      make: 'Dell', model: 'U2722D', serialNumber: 'DU27-005',
      organization: org._id, department: engineeringDept._id, assignedTo: emp3._id,
      vendor: vendorDell._id, purchaseDate: new Date('2023-08-20'),
      purchaseCost: 699, warrantyExpiresAt: new Date('2026-08-20'),
      status: 'Assigned',
      history: [{ action: 'Asset Created', performedBy: assetMgr._id }],
    },
  ];
  const assets = [];
  for (let a of assetsData) { assets.push(await Asset.create(a)); }

  // --- Knowledge Articles ---
  const [art1, art2, art3, art4, art5] = await KnowledgeArticle.create([
    {
      title: 'How to Diagnose High CPU Usage on Windows',
      problemDescription: 'System is running slow, laptop fan is loud, applications are unresponsive',
      symptoms: ['Slow performance', 'High fan noise', 'Freezing applications', 'Unresponsive system'],
      solution: '1. Open Task Manager (Ctrl+Shift+Esc)\n2. Go to "Processes" tab and sort by CPU\n3. Identify the high-CPU process\n4. If it\'s a browser, clear cache or disable extensions\n5. If it\'s antivirus, schedule scans for off-hours\n6. Run Windows Update to ensure latest patches\n7. Consider increasing RAM if consistently high',
      category: catHw._id,
      organization: org._id,
      author: tech1._id,
      status: 'Published',
      tags: ['CPU', 'Performance', 'Windows', 'Slow', 'Task Manager'],
    },
    {
      title: 'Clearing Temporary Files to Improve System Performance',
      problemDescription: 'Disk space is low or system is slow due to accumulated temporary files',
      symptoms: ['Low disk space', 'Slow startup', 'Application crashes'],
      solution: '1. Press Win+R, type "%temp%" and press Enter\n2. Select all files (Ctrl+A) and delete\n3. Run Disk Cleanup (search in Start menu)\n4. Check "Temporary files", "Recycle Bin" etc.\n5. For advanced cleanup, use CCleaner or similar tools\n6. Clear browser cache in Settings',
      category: catSw._id,
      organization: org._id,
      author: tech2._id,
      status: 'Published',
      tags: ['Performance', 'Disk', 'Cleanup', 'Temp Files'],
    },
    {
      title: 'Troubleshooting Wi-Fi Connection Issues',
      problemDescription: 'Unable to connect to Wi-Fi or frequently disconnecting from the network',
      symptoms: ['No internet access', 'Frequent disconnections', 'Cannot see Wi-Fi network', 'Slow Wi-Fi speed'],
      solution: '1. Restart the Wi-Fi adapter: Device Manager > Network Adapters > Disable/Enable\n2. Forget and reconnect to the network\n3. Flush DNS: Run "ipconfig /flushdns" as admin\n4. Reset TCP/IP: Run "netsh int ip reset"\n5. Update Wi-Fi drivers\n6. Check if the issue is only on this device\n7. Contact IT if router/switch issue suspected',
      category: catNet._id,
      organization: org._id,
      author: tech1._id,
      status: 'Published',
      tags: ['WiFi', 'Network', 'Internet', 'Connectivity', 'Connection'],
    },
    {
      title: 'How to Reset Your Company Email Password',
      problemDescription: 'Forgot password or account locked out from email',
      symptoms: ['Cannot login to email', 'Account locked', 'Password expired'],
      solution: '1. Go to the password reset portal at reset.techcorp.com\n2. Enter your company email address\n3. Check your personal email for the reset link\n4. Set a new password (minimum 12 characters, must include uppercase, number, and symbol)\n5. If you do not receive the email within 5 minutes, contact IT helpdesk\n6. After reset, update saved passwords in your browser',
      category: catAccount._id,
      organization: org._id,
      author: tech2._id,
      status: 'Published',
      tags: ['Password', 'Account', 'Email', 'Login', 'Reset'],
    },
    {
      title: 'Printer Not Responding - Troubleshooting Guide',
      problemDescription: 'Printer is not printing, showing offline, or jobs are stuck in queue',
      symptoms: ['Printer offline', 'Print job stuck', 'No pages printing', 'Printer not detected'],
      solution: '1. Check physical connections and that the printer is powered on\n2. Clear print queue: Control Panel > Devices & Printers > right-click > See what\'s printing > Cancel all\n3. Restart Print Spooler service: Run "services.msc", find "Print Spooler", restart it\n4. Remove and re-add the printer\n5. Update or reinstall printer drivers\n6. Check paper and ink/toner levels\n7. Try printing a test page from printer settings',
      category: catPrinter._id,
      organization: org._id,
      author: tech3._id,
      status: 'Published',
      tags: ['Printer', 'Print', 'Offline', 'Queue', 'Spooler'],
    },
  ]);

  // --- Tickets ---
  const past = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const ticketsData = [
    {
      title: 'Laptop extremely slow and Chrome keeps freezing',
      description: 'My laptop has been very slow for the past 2 days. Chrome freezes every few minutes and the fan is running loudly. I cannot complete my work effectively.',
      requester: emp1._id,
      organization: org._id,
      department: hrDept._id,
      category: catHw._id,
      priority: 'High',
      status: 'In Progress',
      assignedTo: tech1._id,
      slaDeadline: new Date(Date.now() + 2 * 60 * 60 * 1000),
      aiClassification: { category: 'Hardware', priority: 'High', probableIssue: 'System performance degradation due to high CPU/RAM usage', confidence: 0.92, classifiedAt: past(1) },
      createdAt: past(1),
      history: [
        { action: 'Ticket Created', performedBy: emp1._id, newValue: 'Open', timestamp: past(1) },
        { action: 'Ticket Assigned', performedBy: managerUser._id, newValue: tech1._id.toString(), timestamp: past(1) },
        { action: 'Status Changed', performedBy: tech1._id, oldValue: 'Assigned', newValue: 'In Progress', timestamp: past(0.5) },
      ],
    },
    {
      title: 'Cannot connect to company VPN from home',
      description: 'Since yesterday morning I am unable to connect to the company VPN. I get an error "Authentication failed" even though my password is correct. I need access to work from home.',
      requester: emp2._id,
      organization: org._id,
      department: financeDept._id,
      category: catNet._id,
      priority: 'Critical',
      status: 'Open',
      slaDeadline: new Date(Date.now() - 30 * 60 * 1000), // Already breached
      slaBreached: true,
      aiClassification: { category: 'Network', priority: 'Critical', probableIssue: 'VPN authentication failure - possible credential sync issue or certificate expiry', confidence: 0.88, classifiedAt: past(0.5) },
      createdAt: past(0.5),
      history: [
        { action: 'Ticket Created', performedBy: emp2._id, newValue: 'Open', timestamp: past(0.5) },
        { action: 'SLA Breached', note: 'Critical SLA deadline exceeded', timestamp: new Date() },
      ],
    },
    {
      title: 'Printer on 3rd floor is not working',
      description: 'The HP printer on the 3rd floor (near the copy room) has not been working since this morning. Multiple people in our team need to print documents for a client meeting.',
      requester: emp4._id,
      organization: org._id,
      department: marketingDept._id,
      category: catPrinter._id,
      priority: 'Medium',
      status: 'Resolved',
      assignedTo: tech3._id,
      slaDeadline: past(1),
      resolution: { note: 'Cleared paper jam and restarted print spooler service. Printer is now operational.', resolvedBy: tech3._id, resolvedAt: past(0.2) },
      aiClassification: { category: 'Printer', priority: 'Medium', probableIssue: 'Hardware malfunction or paper jam', confidence: 0.85, classifiedAt: past(2) },
      createdAt: past(2),
      history: [
        { action: 'Ticket Created', performedBy: emp4._id, newValue: 'Open', timestamp: past(2) },
        { action: 'Ticket Assigned', performedBy: managerUser._id, newValue: tech3._id.toString(), timestamp: past(2) },
        { action: 'Status Changed', performedBy: tech3._id, oldValue: 'Assigned', newValue: 'In Progress', timestamp: past(1.5) },
        { action: 'Ticket Resolved', performedBy: tech3._id, newValue: 'Resolved', note: 'Paper jam cleared', timestamp: past(0.2) },
      ],
    },
    {
      title: 'Microsoft Outlook not syncing emails',
      description: 'My Outlook stopped syncing new emails since this morning. I can see emails in the webmail but not in the desktop app. The sync icon shows an error.',
      requester: emp3._id,
      organization: org._id,
      department: engineeringDept._id,
      category: catEmail._id,
      priority: 'Medium',
      status: 'Assigned',
      assignedTo: tech2._id,
      slaDeadline: new Date(Date.now() + 4 * 60 * 60 * 1000),
      aiClassification: { category: 'Email', priority: 'Medium', probableIssue: 'Outlook profile corruption or Exchange sync error', confidence: 0.79, classifiedAt: past(0.3) },
      createdAt: past(0.3),
      history: [
        { action: 'Ticket Created', performedBy: emp3._id, newValue: 'Open', timestamp: past(0.3) },
        { action: 'Ticket Assigned', performedBy: managerUser._id, newValue: tech2._id.toString(), timestamp: past(0.25) },
      ],
    },
    {
      title: 'Request to install Adobe Acrobat Pro',
      description: 'I need Adobe Acrobat Pro installed on my laptop for editing PDF documents and contracts. This is required for my daily work as I handle numerous client contracts.',
      requester: emp2._id,
      organization: org._id,
      department: financeDept._id,
      category: catSw._id,
      priority: 'Low',
      status: 'Closed',
      assignedTo: tech2._id,
      slaDeadline: past(3),
      resolution: { note: 'Adobe Acrobat Pro 2023 installed and activated with company license. User confirmed working.', resolvedBy: tech2._id, resolvedAt: past(4) },
      closedAt: past(3),
      createdAt: past(7),
      history: [
        { action: 'Ticket Created', performedBy: emp2._id, newValue: 'Open', timestamp: past(7) },
        { action: 'Ticket Assigned', performedBy: managerUser._id, newValue: tech2._id.toString(), timestamp: past(6) },
        { action: 'Ticket Resolved', performedBy: tech2._id, newValue: 'Resolved', timestamp: past(4) },
        { action: 'Status Changed', performedBy: emp2._id, oldValue: 'Resolved', newValue: 'Closed', timestamp: past(3) },
      ],
    },
    {
      title: 'Password reset needed - locked out of account',
      description: 'I have been locked out of my Windows account after entering the wrong password multiple times. I need urgent help as I have an important presentation in 2 hours.',
      requester: emp1._id,
      organization: org._id,
      department: hrDept._id,
      category: catAccount._id,
      priority: 'High',
      status: 'Pending',
      assignedTo: tech2._id,
      slaDeadline: new Date(Date.now() + 1 * 60 * 60 * 1000),
      aiClassification: { category: 'Account/Access', priority: 'High', probableIssue: 'Account lockout due to failed authentication attempts', confidence: 0.95, classifiedAt: past(0.1) },
      createdAt: past(0.1),
      history: [
        { action: 'Ticket Created', performedBy: emp1._id, newValue: 'Open', timestamp: past(0.1) },
        { action: 'Ticket Assigned', performedBy: managerUser._id, newValue: tech2._id.toString(), timestamp: past(0.08) },
        { action: 'Status Changed', performedBy: tech2._id, oldValue: 'Assigned', newValue: 'Pending', note: 'Waiting for user to provide employee ID for verification', timestamp: past(0.05) },
      ],
    },
  ];
  const tickets = [];
  for (let t of ticketsData) { tickets.push(await Ticket.create(t)); }

  // Add comments to some tickets
  await Comment.create([
    {
      ticket: tickets[0]._id,
      author: tech1._id,
      message: 'Hi Emma, I can see from the remote session that your Chrome has 47 tabs open! Let me help you optimize this. I\'ll also run a disk cleanup and check for malware.',
      isInternal: false,
      createdAt: past(0.5),
    },
    {
      ticket: tickets[0]._id,
      author: emp1._id,
      message: 'Thank you! Yes I tend to keep many tabs open. How long will the fix take?',
      isInternal: false,
      createdAt: past(0.4),
    },
    {
      ticket: tickets[0]._id,
      author: tech1._id,
      message: 'Internal note: Ran Malwarebytes scan - no threats. Issue is memory-related. Considering recommending RAM upgrade.',
      isInternal: true,
      createdAt: past(0.3),
    },
    {
      ticket: tickets[3]._id,
      author: tech2._id,
      message: 'Hi Priya, I can see the issue. Your Outlook profile is corrupted. I\'ll need to rebuild it. Please save any important drafts before I start.',
      isInternal: false,
      createdAt: past(0.2),
    },
  ]);

  console.log('✅ Seed data created successfully!');
  console.log('\n📋 Demo Credentials:');
  console.log('   Admin:         admin@techcorp.com    / Admin@123');
  console.log('   Manager:       manager@techcorp.com  / Manager@123');
  console.log('   Technician 1:  taylor@techcorp.com   / Tech@123');
  console.log('   Technician 2:  sam@techcorp.com      / Tech@123');
  console.log('   Employee 1:    emma@techcorp.com     / Employee@123');
  console.log('   Employee 2:    james@techcorp.com    / Employee@123');
  console.log('   Asset Manager: assets@techcorp.com   / Asset@123');

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
