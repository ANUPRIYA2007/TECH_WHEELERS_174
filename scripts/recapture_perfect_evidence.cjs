const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const OUT_DIR_PRIMARY = 'd:\\coophub pillar dashboard\\COOP HUB – APPLICATION TESTING';
const OUT_DIR_SECONDARY = 'd:\\coophub pillar dashboard\\COOP HUB - APPLICATION TESTING';

async function waitClean(page, maxWaitMs = 8000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const hasSpinner = await page.evaluate(() => {
      // Check for spinners in the main content or buttons
      const spins = document.querySelectorAll('.animate-spin, .spinner');
      return spins.length > 0;
    }).catch(() => false);

    if (!hasSpinner) {
      break;
    }
    await new Promise(r => setTimeout(r, 400));
  }
  // Wait extra 1.5s for typewriters and animations to settle
  await new Promise(r => setTimeout(r, 1500));
}

async function saveBoth(page, filename) {
  const p1 = path.join(OUT_DIR_PRIMARY, filename);
  const p2 = path.join(OUT_DIR_SECONDARY, filename);
  await page.screenshot({ path: p1, fullPage: false });
  fs.copyFileSync(p1, p2);
  console.log(`Saved clean ${filename} to both directories`);
}

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });

  console.log('=== STARTING PRECISION RE-CAPTURE ===');

  // 1. Setup Customer Session
  await page.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('coophub_customer_session', JSON.stringify({
      user: { id: 'cust-demo-1', email: 'customer@coophub.in' },
      profile: { full_name: 'Anupriya', email: 'customer@coophub.in', role: 'customer' }
    }));
    localStorage.setItem('coophub_demo_user', 'true');
    localStorage.setItem('coophub_language', 'en');
  });

  // EV-001: Customer Home / Hero / Service Discovery
  console.log('Capturing EV-001...');
  await page.goto('http://localhost:5173/home', { waitUntil: 'domcontentloaded' });
  // Wait for typewriter and services cards to load completely
  await page.waitForSelector('#services-section .service-card, .service-card', { timeout: 10000 }).catch(() => {});
  await waitClean(page, 7000);
  await saveBoth(page, 'EV-001.png');

  // 2. Setup Worker Session
  await page.goto('http://localhost:5173/pillar/login', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('coophub_pillar_session', JSON.stringify({
      user: { id: '7842d4fd-ac93-4014-93ed-001c0237a36c', email: 'raj@coophub.in' },
      profile: {
        id: '7842d4fd-ac93-4014-93ed-001c0237a36c',
        full_name: 'Raj Kumar',
        email: 'raj@coophub.in',
        pillar_code: 'PIL-CHE-042',
        role: 'pillar',
        status: 'verified'
      }
    }));
    localStorage.setItem('coophub_demo_user', 'true');
    localStorage.setItem('coophub_language', 'en');
  });

  // EV-011: Worker Dashboard
  console.log('Capturing EV-011...');
  await page.goto('http://localhost:5173/dashboard', { waitUntil: 'domcontentloaded' });
  await waitClean(page, 8000);
  await saveBoth(page, 'EV-011.png');

  // EV-013: Worker Earnings / Ledger
  console.log('Capturing EV-013...');
  await page.goto('http://localhost:5173/dashboard/earnings', { waitUntil: 'domcontentloaded' });
  await waitClean(page, 8000);
  await saveBoth(page, 'EV-013.png');

  // EV-014: Worker Welfare / PF
  console.log('Capturing EV-014...');
  await page.goto('http://localhost:5173/dashboard/welfare', { waitUntil: 'domcontentloaded' });
  await waitClean(page, 8000);
  await saveBoth(page, 'EV-014.png');

  // 3. Setup Admin Session
  await page.goto('http://localhost:5173/admin/login', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('coophub_super_admin_session', JSON.stringify({
      admin_id: 'SA-000001',
      email: 'superadmin@coophub.gov.in',
      role: 'SUPER_ADMIN',
      scope: 'GLOBAL',
      isSuperAdmin: true,
      authenticated_at: new Date().toISOString()
    }));
    localStorage.setItem('coophub_demo_admin', 'true');
    localStorage.setItem('coophub_admin_token', 'demo-token');
    localStorage.setItem('coophub_admin_id', 'ADM-CHE-001');
    localStorage.setItem('coophub_language', 'en');
  });

  // EV-016: Admin Operations Overview
  console.log('Capturing EV-016...');
  await page.goto('http://localhost:5173/admin', { waitUntil: 'domcontentloaded' });
  await waitClean(page, 8000);
  await saveBoth(page, 'EV-016.png');

  // EV-018: Admin KYC Verification Dossier
  console.log('Capturing EV-018...');
  await page.goto('http://localhost:5173/admin/pillars/c0000000-0000-0000-0000-000000000001', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !document.querySelector('.spinner, .animate-spin'), { timeout: 15000 }).catch(() => {});
  await waitClean(page, 6000);
  await saveBoth(page, 'EV-018.png');

  // EV-021: Admin Live Operations / Dispatch Radar
  console.log('Capturing EV-021...');
  await page.goto('http://localhost:5173/admin/tracking', { waitUntil: 'domcontentloaded' });
  await waitClean(page, 8000);
  await saveBoth(page, 'EV-021.png');

  await browser.close();
  console.log('=== ALL TARGETED SCREENSHOTS RE-CAPTURED SUCCESSFULLY ===');
})();
