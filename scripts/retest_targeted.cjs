const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR_NAME = 'COOP HUB \u2013 APPLICATION TESTING';
const OUTPUT_DIR = path.join(__dirname, '..', OUTPUT_DIR_NAME);
const ALT_OUTPUT_DIR = path.join(__dirname, '..', 'COOP HUB - APPLICATION TESTING');

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
  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1.5 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });

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
  // EV-001: Customer Landing / Hero (/home)
  // -------------------------------------------------------------
  console.log('Testing EV-001 (/home)...');
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await setStorage({
    'coophub_demo_customer': 'true',
    'coophub_customer_user': {
      id: '11111111-1111-1111-1111-111111111111',
      full_name: 'Anupriya',
      email: 'customer@coophub.in',
      phone: '+91 98401 23456',
      role: 'customer'
    }
  });
  await page.goto('http://localhost:5173/home', { waitUntil: 'domcontentloaded' });
  await sleep(2500);
  await saveScreenshot(page, 'EV-001.png');

  // -------------------------------------------------------------
  // EV-006: Customer Booking Status (/requests/REQ-8942)
  // -------------------------------------------------------------
  console.log('Testing EV-006 (/requests/REQ-8942)...');
  const demoOrder = {
    id: "REQ-8942",
    booking_code: "REQ-8942",
    order_id: "REQ-8942",
    service_code: "SRV-ELEC-101",
    customer_name: "Anupriya",
    customer_mobile: "+91 98401 23456",
    customer_email: "customer@coophub.in",
    status: "on_the_way",
    created_at: new Date().toISOString(),
    preferred_date: new Date().toISOString().split("T")[0],
    preferred_time: "10:30 AM",
    flexible_timing: false,
    location_type: "manual",
    address_line: "Flat 4B, Shanthi Apartments, 5th Cross St",
    area: "Guindy",
    city: "Chennai",
    state: "Tamil Nadu",
    postal_code: "600032",
    latitude: 13.0067,
    longitude: 80.2021,
    customer_description: "Ceiling fan making squeaking noise and 16A switch spark issue.",
    arrival_otp: "489201",
    extra_charge_status: "none",
    extra_charge_amount: 0,
    extra_charge_reason: "",
    services: {
      id: "srv-1",
      name: "Electrical Repair",
      name_translations: { en: "Electrical Repair", ta: "மின்சார பழுதுபார்ப்பு" }
    },
    sub_services: {
      id: "sub-1",
      name: "Ceiling Fan & Switchboard Wiring",
      name_translations: { en: "Ceiling Fan & Switchboard Wiring" }
    },
    pillar: {
      id: "PIL-CHE-042",
      full_name: "Raj Kumar",
      role: "Certified Senior Electrician",
      rating: 4.9,
      reviews_count: 128,
      avatar_url: "/assets/images/mascot-hero.png",
      latitude: 13.0125,
      longitude: 80.2104,
      distance_km: "1.2",
      eta_mins: "8",
      last_location_time: "Just now"
    }
  };

  await setStorage({
    'coophub_demo_customer': 'true',
    'coophub_customer_user': {
      id: '11111111-1111-1111-1111-111111111111',
      full_name: 'Anupriya',
      email: 'customer@coophub.in',
      phone: '+91 98401 23456',
      role: 'customer'
    },
    'coophub_shared_live_orders': [demoOrder],
    'coophub_demo_customer_created_requests': [demoOrder]
  });

  await page.goto('http://localhost:5173/requests/REQ-8942', { waitUntil: 'domcontentloaded' });
  // Wait until loading spinner disappears
  try {
    await page.waitForFunction(
      () => !document.body.innerText.includes('Loading request details...'),
      { timeout: 8000 }
    );
  } catch (e) {
    console.log('Note on wait for request details:', e.message);
  }
  await sleep(1500);
  await saveScreenshot(page, 'EV-006.png');

  // -------------------------------------------------------------
  // EV-018: Admin KYC Verification
  // -------------------------------------------------------------
  console.log('Testing EV-018 (/admin/verification)...');
  await setStorage({
    'coophub_super_admin_session': {
      admin_id: 'SA-000001',
      email: 'superadmin@coophub.gov.in',
      role: 'SUPER_ADMIN',
      scope: 'GLOBAL',
      isSuperAdmin: true,
      authenticated_at: new Date().toISOString()
    },
    'coophub_demo_admin': 'true',
    'coophub_admin_token': 'admin_session_token_xyz',
    'coophub_admin_id': 'ADM-CHE-001',
    'coophub_admin_profile': {
      id: 'ADM-CHE-001',
      role: 'admin',
      name: 'Cooperative Admin'
    }
  });

  await page.goto('http://localhost:5173/admin/verification/c0000000-0000-0000-0000-000000000001', { waitUntil: 'domcontentloaded' });
  try {
    await page.waitForFunction(
      () => !document.body.innerText.includes('Verifying National Super Admin') &&
            !document.body.innerText.includes('Loading applicant verification'),
      { timeout: 8000 }
    );
  } catch (e) {}
  await sleep(2000);
  await saveScreenshot(page, 'EV-018.png');

  // -------------------------------------------------------------
  // EV-019: Admin AI Demand Forecast
  // -------------------------------------------------------------
  console.log('Testing EV-019 (/admin/forecast)...');
  await page.goto('http://localhost:5173/admin/forecast', { waitUntil: 'domcontentloaded' });
  try {
    await page.waitForFunction(
      () => !document.body.innerText.includes('Aggregating Supabase historical records'),
      { timeout: 10000 }
    );
  } catch (e) {}
  await sleep(2000);
  await saveScreenshot(page, 'EV-019.png');

  // -------------------------------------------------------------
  // EV-020: Admin Workforce Allocation
  // -------------------------------------------------------------
  console.log('Testing EV-020 (/admin/allocation)...');
  await page.goto('http://localhost:5173/admin/allocation', { waitUntil: 'domcontentloaded' });
  await sleep(3500);
  await saveScreenshot(page, 'EV-020.png');

  // -------------------------------------------------------------
  // EV-024: Super Admin RBAC / Security Audit
  // -------------------------------------------------------------
  console.log('Testing EV-024 (/admin/access)...');
  await page.goto('http://localhost:5173/admin/access', { waitUntil: 'domcontentloaded' });
  try {
    await page.waitForFunction(
      () => !document.body.innerText.includes('Loading authoritative capability matrix...'),
      { timeout: 10000 }
    );
  } catch (e) {}
  await sleep(2000);
  await saveScreenshot(page, 'EV-024.png');

  await browser.close();
  console.log('Retest complete!');
}

run().catch(console.error);
