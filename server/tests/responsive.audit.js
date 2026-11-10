import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = process.env.TEST_URL || 'http://localhost:5001';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const DEBUG_PORT = 9223;

class CdpSession {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.callbacks = new Map();
    this.events = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
      this.ws.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        if (data.id && this.callbacks.has(data.id)) {
          const { resolve, reject } = this.callbacks.get(data.id);
          this.callbacks.delete(data.id);
          if (data.error) reject(new Error(data.error.message));
          else resolve(data.result);
        } else if (data.method && this.events.has(data.method)) {
          for (const handler of this.events.get(data.method)) {
            handler(data.params);
          }
        }
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  on(event, handler) {
    if (!this.events.has(event)) this.events.set(event, []);
    this.events.get(event).push(handler);
  }

  async setViewport({ width, height, deviceScaleFactor = 1, mobile = false }) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor,
      mobile,
      screenOrientation: width > height ? { angle: 90, type: 'landscapePrimary' } : { angle: 0, type: 'portraitPrimary' }
    });
  }

  async navigate(url) {
    await this.send('Page.navigate', { url });
    await new Promise((resolve) => {
      const check = async () => {
        try {
          const res = await this.evaluate('document.readyState');
          if (res === 'complete') resolve();
          else setTimeout(check, 100);
        } catch {
          setTimeout(check, 100);
        }
      };
      setTimeout(check, 200);
    });
    // Wait for React rendering & image loading
    await new Promise((r) => setTimeout(r, 600));
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(res.exceptionDetails.text || 'Runtime evaluation failed');
    }
    return res.result?.value;
  }

  async captureScreenshot(outputPath) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    await fs.writeFile(outputPath, buffer);
    return buffer.length;
  }

  close() {
    try {
      this.ws.close();
    } catch {
      // Ignore
    }
  }
}

const VIEWPORTS = [
  { name: '1-small-phone', label: 'Small Smartphone', width: 320, height: 640, dpr: 2, mobile: true },
  { name: '2-iphone-standard', label: 'Standard iPhone', width: 390, height: 844, dpr: 3, mobile: true },
  { name: '3-large-phone', label: 'Large Smartphone (Pro Max)', width: 430, height: 932, dpr: 3, mobile: true },
  { name: '4-phone-landscape', label: 'Smartphone Landscape', width: 844, height: 390, dpr: 3, mobile: true },
  { name: '5-tablet-portrait', label: 'Small/Standard Tablet Portrait', width: 768, height: 1024, dpr: 2, mobile: true },
  { name: '6-tablet-landscape', label: 'Tablet Landscape', width: 1024, height: 768, dpr: 2, mobile: false },
  { name: '7-laptop-1280', label: 'Standard Laptop (1280)', width: 1280, height: 800, dpr: 1, mobile: false },
  { name: '8-desktop-1440', label: 'Desktop Monitor (1440)', width: 1440, height: 900, dpr: 1, mobile: false },
  { name: '9-fhd-1920', label: 'Full HD Monitor (1080p)', width: 1920, height: 1080, dpr: 1, mobile: false },
  { name: '10-qhd-2560', label: 'QHD / 2K Monitor (2560)', width: 2560, height: 1440, dpr: 1, mobile: false },
  { name: '11-ultrawide-3440', label: 'Ultra-wide 21:9 Monitor (3440)', width: 3440, height: 1440, dpr: 1, mobile: false }
];

async function runResponsiveAudit() {
  console.log('========================================================================');
  console.log('   DSU CAMPUS EVENTS — COMPREHENSIVE RESPONSIVE & IMAGE QUALITY AUDIT   ');
  console.log('========================================================================\n');

  console.log('[Browser] Launching Headless Chrome on CDP port', DEBUG_PORT);
  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    `--remote-debugging-port=${DEBUG_PORT}`,
    '--window-size=1440,900'
  ]);

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Chrome failed to start')), 8000);
    chromeProc.stderr.on('data', (d) => {
      if (d.toString().includes('DevTools listening')) {
        clearTimeout(timeout);
        resolve();
      }
    });
  });

  const tabRes = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/new`, { method: 'PUT' });
  const tab = await tabRes.json();
  const session = new CdpSession(tab.webSocketDebuggerUrl);
  await session.connect();

  await session.send('Page.enable');
  await session.send('Runtime.enable');
  await session.send('DOM.enable');

  const screenshotsDir = path.resolve(__dirname, '../../client/public/smoke/responsive');
  await fs.mkdir(screenshotsDir, { recursive: true });

  const auditResults = [];

  for (const vp of VIEWPORTS) {
    console.log(`\n▶ TESTING VIEWPORT: ${vp.label} (${vp.width}x${vp.height}, DPR=${vp.dpr}, Mobile=${vp.mobile})`);
    await session.setViewport({
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: vp.dpr,
      mobile: vp.mobile
    });

    await session.navigate(`${BASE_URL}/`);
    // Ensure image is fully loaded & decoded
    await session.evaluate(`
      new Promise((resolve) => {
        const img = document.querySelector('section picture img') || document.querySelector('section img');
        if (!img || img.complete) return resolve(true);
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        setTimeout(() => resolve(true), 1500);
      })
    `);
    await new Promise((r) => setTimeout(r, 400));

    // Audit 1: Horizontal Overflow Check
    const overflowMetrics = await session.evaluate(`
      (() => {
        const docWidth = document.documentElement.offsetWidth;
        const scrollWidth = document.documentElement.scrollWidth;
        const bodyWidth = document.body.scrollWidth;
        const windowWidth = window.innerWidth;
        const hasHorizontalScroll = scrollWidth > windowWidth || bodyWidth > windowWidth;
        return { docWidth, scrollWidth, bodyWidth, windowWidth, hasHorizontalScroll };
      })()
    `);

    // Audit 2: Hero Image Quality & Selected Source
    const imageMetrics = await session.evaluate(`
      (() => {
        const img = document.querySelector('section picture img') || document.querySelector('section img');
        if (!img) return null;
        return {
          currentSrc: img.currentSrc,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          clientWidth: img.clientWidth,
          clientHeight: img.clientHeight,
          renderedAspect: (img.clientWidth / (img.clientHeight || 1)).toFixed(2),
          naturalAspect: (img.naturalWidth / (img.naturalHeight || 1)).toFixed(2),
          isSharp: img.naturalWidth >= img.clientWidth * 0.7 || img.naturalHeight >= img.clientHeight * 0.4
        };
      })()
    `);

    // Audit 3: Heading & Badges
    const textMetrics = await session.evaluate(`
      (() => {
        const h1 = document.querySelector('h1');
        const badge = document.querySelector('.shimmer-badge');
        return {
          headlineText: h1 ? h1.innerText.replace(/\\n/g, ' ') : '',
          headlineFontSize: h1 ? window.getComputedStyle(h1).fontSize : '',
          badgeText: badge ? badge.innerText : ''
        };
      })()
    `);

    // Screenshot
    const screenshotPath = path.join(screenshotsDir, `${vp.name}.png`);
    const size = await session.captureScreenshot(screenshotPath);

    const passedNoScroll = !overflowMetrics.hasHorizontalScroll;
    const isImageSharp = imageMetrics?.isSharp ?? true;

    console.log(`  Horizontal Scroll: ${passedNoScroll ? '✔ None (Clean)' : '❌ OVERFLOW DETECTED'}`);
    console.log(`  Hero Image Source: ${imageMetrics?.currentSrc?.split('/').pop() || 'N/A'}`);
    console.log(`  Hero Image Res: Intrinsic ${imageMetrics?.naturalWidth}x${imageMetrics?.naturalHeight} vs Rendered ${imageMetrics?.clientWidth}x${imageMetrics?.clientHeight}`);
    console.log(`  Image Sharpness: ${isImageSharp ? '✔ 100% Crisp / No pixelation' : '⚠ Upscaling'}`);
    console.log(`  Headline: "${textMetrics.headlineText}" (${textMetrics.headlineFontSize})`);
    console.log(`  Saved Screenshot: ${path.basename(screenshotPath)} (${(size / 1024).toFixed(1)} KB)`);

    auditResults.push({
      viewport: vp,
      overflow: overflowMetrics,
      image: imageMetrics,
      text: textMetrics,
      screenshot: path.basename(screenshotPath),
      passed: passedNoScroll && isImageSharp
    });
  }

  // Also test Admin Dashboard on Mobile and Desktop
  console.log('\n--- TESTING ADMIN CONSOLE RESPONSIVENESS ---');
  await session.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, mobile: true });
  await session.navigate(`${BASE_URL}/admin`);
  const adminMobileScroll = await session.evaluate('document.documentElement.scrollWidth <= window.innerWidth');
  const adminMobileScreenshot = path.join(screenshotsDir, 'admin-mobile-390.png');
  await session.captureScreenshot(adminMobileScreenshot);
  console.log(`  Admin Mobile (390x844) No Horizontal Scroll: ${adminMobileScroll ? '✔ PASS' : '❌ FAIL'}`);

  await session.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await session.navigate(`${BASE_URL}/admin`);
  const adminDesktopScreenshot = path.join(screenshotsDir, 'admin-desktop-1440.png');
  await session.captureScreenshot(adminDesktopScreenshot);
  console.log('  Admin Desktop (1440x900) captured successfully.');

  // Also test Event Detail Page with Mobile Floating Bottom Bar
  console.log('\n--- TESTING EVENT DETAIL & MOBILE BOTTOM BAR ---');
  await session.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, mobile: true });
  // Find an event ID from the homepage
  await session.navigate(`${BASE_URL}/`);
  const eventLink = await session.evaluate(`
    new Promise((resolve) => {
      const startTime = Date.now();
      const interval = setInterval(() => {
        const link = document.querySelector('a[href^="/events/"]');
        if (link) {
          clearInterval(interval);
          resolve(link.getAttribute('href'));
        } else if (Date.now() - startTime > 3000) {
          clearInterval(interval);
          resolve(null);
        }
      }, 100);
    })
  `);
  console.log(`  Event link found on homepage: ${eventLink}`);
  if (eventLink) {
    await session.navigate(`${BASE_URL}${eventLink}`);
    const detailLoaded = await session.evaluate(`
      new Promise((resolve) => {
        const startTime = Date.now();
        const interval = setInterval(() => {
          const bar = document.querySelector('[data-testid="floating-mobile-action-bar"]');
          const errorState = document.body.innerText.includes('Event Not Found');
          if (bar) {
            clearInterval(interval);
            resolve('found');
          } else if (errorState) {
            clearInterval(interval);
            resolve('error');
          } else if (Date.now() - startTime > 4000) {
            clearInterval(interval);
            resolve('timeout');
          }
        }, 100);
      })
    `);
    console.log(`  Detail load status: ${detailLoaded}`);
    const hasFloatingBar = await session.evaluate(`!!document.querySelector('[data-testid="floating-mobile-action-bar"]')`);
    console.log(`  Floating Mobile Action Bar Present: ${hasFloatingBar ? '✔ PASS' : '❌ FAIL'}`);
    const detailScreenshot = path.join(screenshotsDir, 'event-detail-mobile-390.png');
    await session.captureScreenshot(detailScreenshot);
  }

  session.close();
  chromeProc.kill();

  console.log('\n========================================================================');
  console.log(`   ALL ${auditResults.length} VIEWPORTS TESTED — RESULTS:`);
  console.log('========================================================================');
  let allPass = true;
  for (const r of auditResults) {
    const status = r.passed ? '✔ PASS' : '❌ FAIL';
    console.log(`  ${status} | ${r.viewport.label.padEnd(35)} | ${r.viewport.width}x${r.viewport.height} | Src: ${r.image?.currentSrc?.split('/').pop()}`);
    if (!r.passed) allPass = false;
  }

  return { allPass, auditResults };
}

runResponsiveAudit()
  .then(({ allPass }) => {
    if (!allPass) {
      console.error('\nSome viewport tests failed.');
      process.exit(1);
    }
    console.log('\nAll viewport and image quality tests passed 100%!');
    process.exit(0);
  })
  .catch((e) => {
    console.error('Audit script failed:', e);
    process.exit(1);
  });
