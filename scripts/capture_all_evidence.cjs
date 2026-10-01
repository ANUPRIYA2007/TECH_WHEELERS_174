const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR_NAME = 'COOP HUB \u2013 APPLICATION TESTING';
const OUTPUT_DIR = path.join(__dirname, '..', OUTPUT_DIR_NAME);
const ALT_OUTPUT_DIR = path.join(__dirname, '..', 'COOP HUB - APPLICATION TESTING');

[OUTPUT_DIR, ALT_OUTPUT_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function saveScreenshot(page, filename) {
  const filePath1 = path.join(OUTPUT_DIR, filename);
  const filePath2 = path.join(ALT_OUTPUT_DIR, filename);

  try {
    await page.evaluate(async () => {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
    });
  } catch (e) {}

  await page.screenshot({ path: filePath1, fullPage: false });
  fs.copyFileSync(filePath1, filePath2);
  console.log(`[SAVED] ${filename} -> ${filePath1}`);
}

async function run() {
  console.log('Launching browser with 1440x900 desktop viewport...');
  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1.5 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });

  const results = [];

  async function setStorage(sessionConfig) {
    await page.evaluate((config) => {
      localStorage.clear();
      sessionStorage.clear();
      if (config) {
        for (const [key, value] of Object.entries(config)) {
          localStorage.setItem(key, typeof value === 'object' ? JSON.stringify(value) : value);
        }
      }
    }, sessionConfig);
  }

  // -------------------------------------------------------------
  // EV-001: Customer Landing / Hero
  // -------------------------------------------------------------
  try {
    console.log('\n--- Capturing EV-001: Customer Landing / Hero ---');
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await setStorage(null);
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    // Wait for splash screen to fade away
    await sleep(2600);
    await saveScreenshot(page, 'EV-001.png');
    results.push({ id: 'EV-001', page: 'Customer Landing / Hero', success: true });
  } catch (err) {
    console.error('EV-001 Error:', err.message);
    results.push({ id: 'EV-001', page: 'Customer Landing / Hero', success: false, error: err.message });
  }

  // -------------------------------------------------------------
  // EV-002: Customer Authentication
  // -------------------------------------------------------------
  try {
    console.log('\n--- Capturing EV-002: Customer Authentication ---');
    await setStorage(null);
    await page.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded' });
    await sleep(1500);
    await saveScreenshot(page, 'EV-002.png');
    results.push({ id: 'EV-002', page: 'Customer Authentication', success: true });
  } catch (err) {
    console.error('EV-002 Error:', err.message);
    results.push({ id: 'EV-002', page: 'Customer Authentication', success: false, error: err.message });
  }

  // -------------------------------------------------------------
  // EV-003: Customer Registration
  // -------------------------------------------------------------
  try {
    console.log('\n--- Capturing EV-003: Customer Registration ---');
    await setStorage(null);
    await page.goto('http://localhost:5173/register', { waitUntil: 'domcontentloaded' });
    await sleep(1500);
    await saveScreenshot(page, 'EV-003.png');
    results.push({ id: 'EV-003', page: 'Customer Registration', success: true });
  } catch (err) {
    console.error('EV-003 Error:', err.message);
    results.push({ id: 'EV-003', page: 'Customer Registration', success: false, error: err.message });
  }

  // Customer demo session
  const customerSession = {
    'coophub_demo_customer': 'true',
    'coophub_customer_user': {
      id: '11111111-1111-1111-1111-111111111111',
      full_name: 'Anupriya',
      email: 'customer@coophub.in',
      phone: '+91 98401 23456',
      role: 'customer'
    },
    'coophub_demo_profile': {
      full_name: 'Anupriya',
      email: 'customer@coophub.in',
      phone: '+91 98401 23456'
    }
  };

  // -------------------------------------------------------------
  // EV-004: Customer Service Discovery
  // -------------------------------------------------------------
  try {
    console.log('\n--- Capturing EV-004: Customer Service Discovery ---');
    await setStorage(customerSession);
    await page.goto('http://localhost:5173/services', { waitUntil: 'domcontentloaded' });
    await sleep(2000);
    await saveScreenshot(page, 'EV-004.png');
    results.push({ id: 'EV-004', page: 'Customer Service Discovery', success: true });
  } catch (err) {
    console.error('EV-004 Error:', err.message);
    results.push({ id: 'EV-004', page: 'Customer Service Discovery', success: false, error: err.message });
  }

  // -------------------------------------------------------------
  // EV-005: Customer Service Request / Booking
  // -------------------------------------------------------------
  try {
    console.log('\n--- Capturing EV-005: Customer Service Request / Booking ---');
    await setStorage(customerSession);
    await page.goto('http://localhost:5173/services/a0000000-0000-0000-0000-000000000001/request', { waitUntil: 'domcontentloaded' });
    await sleep(2000);
    await saveScreenshot(page, 'EV-005.png');
    results.push({ id: 'EV-005', page: 'Customer Service Request / Booking', success: true });
  } catch (err) {
    console.error('EV-005 Error:', err.message);
    results.push({ id: 'EV-005', page: 'Customer Service Request / Booking', success: false, error: err.message });
  }

  // -------------------------------------------------------------
  // EV-006: Customer Booking Status
  // -------------------------------------------------------------
  try {
    console.log('\n--- Capturing EV-006: Customer Booking Status ---');
    await setStorage(customerSession);
    await page.goto('http://localhost:5173/requests/REQ-8942', { waitUntil: 'domcontentloaded' });
    await sleep(2000);
    await saveScreenshot(page, 'EV-006.png');
    results.push({ id: 'EV-006', page: 'Customer Booking Status', success: true });
  } catch (err) {
    console.error('EV-006 Error:', err.message);
    results.push({ id: 'EV-006', page: 'Customer Booking Status', success: false, error: err.message });
  }

  // -------------------------------------------------------------
  // EV-007: Customer Support / Tickets
  // -------------------------------------------------------------
  try {
    console.log('\n--- Capturing EV-007: Customer Support / Tickets ---');
    await setStorage(customerSession);
    await page.goto('http://localhost:5173/support/tickets', { waitUntil: 'domcontentloaded' });
    await sleep(2000);
    await saveScreenshot(page, 'EV-007.png');
    results.push({ id: 'EV-007', page: 'Customer Support / Tickets', success: true });
  } catch (err) {
    console.error('EV-007 Error:', err.message);
    results.push({ id: 'EV-007', page: 'Customer Support / Tickets', success: false, error: err.message });
  }

  // -------------------------------------------------------------
  // EV-008: Pillar / Worker Onboarding
  // -------------------------------------------------------------
  try {
    console.log('\n--- Capturing EV-008: Pillar / Worker Onboarding ---');
    await setStorage(null);
    await page.goto('http://localhost:5173/pillar', { waitUntil: 'domcontentloaded' });
    await sleep(2000);
    await saveScreenshot(page, 'EV-008.png');
    results.push({ id: 'EV-008', page: 'Pillar / Worker Onboarding', success: true });
  } catch (err) {
    console.error('EV-008 Error:', err.message);
    results.push({ id: 'EV-008', page: 'Pillar / Worker Onboarding', success: false, error: err.message });
  }

  // -------------------------------------------------------------
  // EV-009: Pillar / Worker Authentication
  // -------------------------------------------------------------
  try {
    console.log('\n--- Capturing EV-009: Pillar / Worker Authentication ---');
    await setStorage(null);
    await page.goto('http://localhost:5173/pillar/login', { waitUntil: 'domcontentloaded' });
    await sleep(1500);
    await saveScreenshot(page, 'EV-009.png');
    results.push({ id: 'EV-009', page: 'Pillar / Worker Authentication', success: true });
  } catch (err) {
    console.error('EV-009 Error:', err.message);
    results.push({ id: 'EV-009', page: 'Pillar / Worker Authentication', success: false, error: err.message });
  }

  // -------------------------------------------------------------
  // EV-010: Pillar / Worker Registration
  // -------------------------------------------------------------
  try {
    console.log('\n--- Capturing EV-010: Pillar / Worker Registration ---');
    await setStorage(null);
    await page.goto('http://localhost:5173/pillar/register', { waitUntil: 'domcontentloaded' });
    await sleep(1500);
    await saveScreenshot(page, 'EV-010.png');
    results.push({ id: 'EV-010', page: 'Pillar / Worker Registration', success: true });
  } catch (err) {
    console.error('EV-010 Error:', err.message);
    results.push({ id: 'EV-010', page: 'Pillar / Worker Registration', success: false, error: err.message });
  }

  // Pillar demo session
  const pillarSession = {
    'coophub_demo_user': 'true',
    'coophub_pillar_available': 'true',
    'coophub_demo_user_name': 'Raj Kumar'
  };

  // -------------------------------------------------------------
  // EV-011: Pillar / Worker Dashboard
  // -------------------------------------------------------------
  try {
    console.log('\n--- Capturing EV-011: Pillar / Worker Dashboard ---');
    await setStorage(pillarSession);
    await page.goto('http://localhost:5173/dashboard', { waitUntil: 'domcontentloaded' });
    await sleep(2000);
    await saveScreenshot(page, 'EV-011.png');
    results.push({ id: 'EV-011', page: 'Pillar / Worker Dashboard', success: true });
  } catch (err) {
    console.error('EV-011 Error:', err.message);
    results.push({ id: 'EV-011', page: 'Pillar / Worker Dashboard', success: false, error: err.message });
  }

  // -------------------------------------------------------------
  // EV-012: Pillar KYC & Certifications
  // -------------------------------------------------------------
  try {
    console.log('\n--- Capturing EV-012: Pillar KYC & Certifications ---');
    await setStorage(pillarSession);
    await page.goto('http://localhost:5173/dashboard/certifications', { waitUntil: 'domcontentloaded' });
    await sleep(2000);
    await saveScreenshot(page, 'EV-012.png');
    results.push({ id: 'EV-012', page: 'Pillar KYC & Certifications', success: true });
  } catch (err) {
    console.error('EV-012 Error:', err.message);
    results.push({ id: 'EV-012', page: 'Pillar KYC & Certifications', success: false, error: err.message });
  }

  // -------------------------------------------------------------
  // EV-013: Pillar Earnings / Ledger
  // -------------------------------------------------------------
  try {
    console.log('\n--- Capturing EV-013: Pillar Earnings / Ledger ---');
    await setStorage(pillarSession);
    await page.goto('http://localhost:5173/dashboard/earnings', { waitUntil: 'domcontentloaded' });
    await sleep(2000);
    await saveScreenshot(page, 'EV-013.png');
    results.push({ id: 'EV-013', page: 'Pillar Earnings / Ledger', success: true });
  } catch (err) {
    console.error('EV-013 Error:', err.message);
    results.push({ id: 'EV-013', page: 'Pillar Earnings / Ledger', success: false, error: err.message });
  }

  // -------------------------------------------------------------
  // EV-014: Pillar Welfare / PF
  // -------------------------------------------------------------
  try {
    console.log('\n--- Capturing EV-014: Pillar Welfare / PF ---');
    await setStorage(pillarSession);
    await page.goto('http://localhost:5173/dashboard/welfare', { waitUntil: 'domcontentloaded' });
    await sleep(2000);
    await saveScreenshot(page, 'EV-014.png');
    results.push({ id: 'EV-014', page: 'Pillar Welfare / PF', success: true });
  } catch (err) {
    console.error('EV-014 Error:', err.message);
    results.push({ id: 'EV-014', page: 'Pillar Welfare / PF', success: false, error: err.message });
  }

  // -------------------------------------------------------------
  // EV-015: Admin Authentication
  // -------------------------------------------------------------
  try {
    console.log('\n--- Capturing EV-015: Admin Authentication ---');
    await setStorage(null);
    await page.goto('http://localhost:5173/admin/login', { waitUntil: 'domcontentloaded' });
    await sleep(1500);
    await saveScreenshot(page, 'EV-015.png');
    results.push({ id: 'EV-015', page: 'Admin Authentication', success: true });
  } catch (err) {
    console.error('EV-015 Error:', err.message);
    results.push({ id: 'EV-015', page: 'Admin Authentication', success: false, error: err.message });
  }

  // Admin demo session
  const adminSession = {
    'coophub_demo_admin': 'true',
    'coophub_admin_token': 'admin_session_token_xyz',
    'coophub_admin_id': 'ADM-CHE-001',
    'coophub_admin_profile': {
      id: 'ADM-CHE-001',
      role: 'admin',
      name: 'Cooperative Admin'
    }
  };

  // -------------------------------------------------------------
  // EV-016: Admin Operations Overview
  // -------------------------------------------------------------
  try {
    console.log('\n--- Capturing EV-016: Admin Operations Overview ---');
    await setStorage(adminSession);
    await page.goto('http://localhost:5173/admin', { waitUntil: 'domcontentloaded' });
    await sleep(2500);
    await saveScreenshot(page, 'EV-016.png');
    results.push({ id: 'EV-016', page: 'Admin Operations Overview', success: true });
  } catch (err) {
    console.error('EV-016 Error:', err.message);
    results.push({ id: 'EV-016', page: 'Admin Operations Overview', success: false, error: err.message });
  }

  // -------------------------------------------------------------
  // EV-017: Admin Worker Management
  // -------------------------------------------------------------
  try {
    console.log('\n--- Capturing EV-017: Admin Worker Management ---');
    await setStorage(adminSession);
    await page.goto('http://localhost:5173/admin/pillars', { waitUntil: 'domcontentloaded' });
    await sleep(2500);
    await saveScreenshot(page, 'EV-017.png');
    results.push({ id: 'EV-017', page: 'Admin Worker Management', success: true });
  } catch (err) {
    console.error('EV-017 Error:', err.message);
    results.push({ id: 'EV-017', page: 'Admin Worker Management', success: false, error: err.message });
  }

  // -------------------------------------------------------------
  // EV-018: Admin KYC Verification
  // -------------------------------------------------------------
  try {
    console.log('\n--- Capturing EV-018: Admin KYC Verification ---');
    await setStorage(adminSession);
    await page.goto('http://localhost:5173/admin/verification/c0000000-0000-0000-0000-000000000001', { waitUntil: 'domcontentloaded' });
    await sleep(2500);
    await saveScreenshot(page, 'EV-018.png');
    results.push({ id: 'EV-018', page: 'Admin KYC Verification', success: true });
  } catch (err) {
    console.error('EV-018 Error:', err.message);
    results.push({ id: 'EV-018', page: 'Admin KYC Verification', success: false, error: err.message });
  }

  // -------------------------------------------------------------
  // EV-019: Admin AI Demand Forecast
  // -------------------------------------------------------------
  try {
    console.log('\n--- Capturing EV-019: Admin AI Demand Forecast ---');
    await setStorage(adminSession);
    await page.goto('http://localhost:5173/admin/forecast', { waitUntil: 'domcontentloaded' });
    await sleep(2500);
    await saveScreenshot(page, 'EV-019.png');
    results.push({ id: 'EV-019', page: 'Admin AI Demand Forecast', success: true });
  } catch (err) {
    console.error('EV-019 Error:', err.message);
    results.push({ id: 'EV-019', page: 'Admin AI Demand Forecast', success: false, error: err.message });
  }

  // -------------------------------------------------------------
  // EV-020: Admin Workforce Allocation
  // -------------------------------------------------------------
  try {
    console.log('\n--- Capturing EV-020: Admin Workforce Allocation ---');
    await setStorage(adminSession);
    await page.goto('http://localhost:5173/admin/allocation', { waitUntil: 'domcontentloaded' });
    await sleep(2500);
    await saveScreenshot(page, 'EV-020.png');
    results.push({ id: 'EV-020', page: 'Admin Workforce Allocation', success: true });
  } catch (err) {
    console.error('EV-020 Error:', err.message);
    results.push({ id: 'EV-020', page: 'Admin Workforce Allocation', success: false, error: err.message });
  }

  // -------------------------------------------------------------
  // EV-021: Admin Live Operations / Dispatch Radar
  // -------------------------------------------------------------
  try {
    console.log('\n--- Capturing EV-021: Admin Live Operations / Dispatch Radar ---');
    await setStorage(adminSession);
    await page.goto('http://localhost:5173/admin/tracking', { waitUntil: 'domcontentloaded' });
    await sleep(2500);
    await saveScreenshot(page, 'EV-021.png');
    results.push({ id: 'EV-021', page: 'Admin Live Operations / Dispatch Radar', success: true });
  } catch (err) {
    console.error('EV-021 Error:', err.message);
    results.push({ id: 'EV-021', page: 'Admin Live Operations / Dispatch Radar', success: false, error: err.message });
  }

  // Super Admin session
  const superAdminSession = {
    'coophub_super_admin_session': {
      admin_id: 'SA-000001',
      email: 'superadmin@coophub.gov.in',
      role: 'SUPER_ADMIN',
      scope: 'GLOBAL',
      isSuperAdmin: true,
      authenticated_at: new Date().toISOString()
    },
    'coophub_demo_admin': 'true'
  };

  // -------------------------------------------------------------
  // EV-022: Super Admin Apex Command Center
  // -------------------------------------------------------------
  try {
    console.log('\n--- Capturing EV-022: Super Admin Apex Command Center ---');
    await setStorage(superAdminSession);
    await page.goto('http://localhost:5173/admin/super-admin', { waitUntil: 'domcontentloaded' });
    await sleep(2500);
    await saveScreenshot(page, 'EV-022.png');
    results.push({ id: 'EV-022', page: 'Super Admin Apex Command Center', success: true });
  } catch (err) {
    console.error('EV-022 Error:', err.message);
    results.push({ id: 'EV-022', page: 'Super Admin Apex Command Center', success: false, error: err.message });
  }

  // -------------------------------------------------------------
  // EV-023: Super Admin Zone Management
  // -------------------------------------------------------------
  try {
    console.log('\n--- Capturing EV-023: Super Admin Zone Management ---');
    await setStorage(superAdminSession);
    await page.goto('http://localhost:5173/admin/zone-management', { waitUntil: 'domcontentloaded' });
    await sleep(2500);
    await saveScreenshot(page, 'EV-023.png');
    results.push({ id: 'EV-023', page: 'Super Admin Zone Management', success: true });
  } catch (err) {
    console.error('EV-023 Error:', err.message);
    results.push({ id: 'EV-023', page: 'Super Admin Zone Management', success: false, error: err.message });
  }

  // -------------------------------------------------------------
  // EV-024: Super Admin RBAC / Security Audit
  // -------------------------------------------------------------
  try {
    console.log('\n--- Capturing EV-024: Super Admin RBAC / Security Audit ---');
    await setStorage(superAdminSession);
    await page.goto('http://localhost:5173/admin/access', { waitUntil: 'domcontentloaded' });
    await sleep(2500);
    await saveScreenshot(page, 'EV-024.png');
    results.push({ id: 'EV-024', page: 'Super Admin RBAC / Security Audit', success: true });
  } catch (err) {
    console.error('EV-024 Error:', err.message);
    results.push({ id: 'EV-024', page: 'Super Admin RBAC / Security Audit', success: false, error: err.message });
  }

  // -------------------------------------------------------------
  // EV-025: Backend REST API Health
  // -------------------------------------------------------------
  try {
    console.log('\n--- Capturing EV-025: Backend REST API Health ---');
    await page.goto('http://localhost:5000/api/health', { waitUntil: 'domcontentloaded' });
    await sleep(1000);
    await saveScreenshot(page, 'EV-025.png');
    results.push({ id: 'EV-025', page: 'Backend REST API Health', success: true });
  } catch (err) {
    console.error('EV-025 Error:', err.message);
    results.push({ id: 'EV-025', page: 'Backend REST API Health', success: false, error: err.message });
  }

  await browser.close();

  console.log('\n==================================================');
  console.log('CAPTURE RUN SUMMARY');
  console.log('==================================================');
  console.table(results);
}

run().catch(console.error);
