/*
  verifySite.js
  Smoke‑test the entire front‑end after recent changes.
  - Logs in as each demo user
  - Visits every defined route for that role
  - Takes a screenshot per page
  - Captures console errors & failed network requests
  - Writes a markdown report (verification_report.md) with a PASS/FAIL table

  Run with: `node ./scripts/verifySite.js`
*/

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Demo credentials as shown on the login page
const users = [
  { role: 'admin', email: 'admin@techcorp.com', password: 'Admin@123' },
  { role: 'manager', email: 'manager@techcorp.com', password: 'Admin@123' },
  { role: 'technician', email: 'taylor@techcorp.com', password: 'Admin@123' },
  { role: 'asset_manager', email: 'asset@techcorp.com', password: 'Admin@123' },
  { role: 'employee', email: 'emma@techcorp.com', password: 'Admin@123' },
];

// Routes per role (mirrors Sidebar component)
const roleRoutes = {
  admin: [
    '/admin',
    '/admin/tickets',
    '/admin/tickets/1',
    '/admin/users',
    '/admin/settings',
    '/admin/reports',
    '/admin/assets',
    '/admin/knowledge',
  ],
  manager: ['/manager', '/manager/tickets'],
  technician: ['/technician', '/technician/tickets'],
  asset_manager: ['/assets-dash', '/assets-dash/tickets'],
  employee: ['/employee', '/employee/tickets'],
};

(async () => {
  const reportLines = [];
  const screenshotsDir = path.resolve(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  for (const user of users) {
    const page = await context.newPage();
    const consoleErrors = [];
    const networkFailures = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('requestfailed', request => {
      networkFailures.push(`${request.method()} ${request.url()} – ${request.failure()?.errorText}`);
    });

    // Login
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', user.password);
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle' });

    const routes = roleRoutes[user.role] || [];
    for (const route of routes) {
      try {
        await page.goto(`http://localhost:5173${route}`, { waitUntil: 'networkidle', timeout: 15000 });
        const screenshotPath = path.join(screenshotsDir, `${user.role}-${route.replace(/\//g, '-')}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });
        const hasError = consoleErrors.length || networkFailures.length;
        reportLines.push(`| ${user.role} | ${route} | ${hasError ? 'FAIL' : 'PASS'} | ${hasError ? consoleErrors.concat(networkFailures).join(' ; ') : ''} |`);
        consoleErrors.length = 0;
        networkFailures.length = 0;
      } catch (err) {
        reportLines.push(`| ${user.role} | ${route} | FAIL | navigation error: ${err.message} |`);
      }
    }
    await page.close();
  }

  await browser.close();

  const reportContent = `# Site‑wide Verification Report\n\nGenerated on ${new Date().toISOString()}\n\n| Role | Route | Status | Notes |\n|------|-------|--------|-------|\n${reportLines.join('\n')}\n\nScreenshots are stored in **frontend/scripts/screenshots**.\n`;
  const reportPath = path.resolve(__dirname, 'verification_report.md');
  fs.writeFileSync(reportPath, reportContent);
  console.log('Verification completed – report written to', reportPath);
})();
