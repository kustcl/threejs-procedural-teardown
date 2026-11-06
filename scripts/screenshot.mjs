#!/usr/bin/env node
// Capture desktop/mobile QA screenshots and fail on runtime errors.
//
//   node scripts/screenshot.mjs <html-or-url> [--out shots]
//
// The generated app should expose:
//   window.APP = {
//     ready: true,
//     expandAll?, collapseAll?,
//     setView?(name),          // 'hero' | 'top' | 'front'
//   }
// The harness also accepts window.CVN78 as a compatibility alias.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const target = args[0];
if (!target) {
  console.error('\n  Usage: node scripts/screenshot.mjs <html-or-url> [--out shots]\n');
  process.exit(1);
}

function arg(name, fallback = null) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : fallback;
}

const outDir = path.resolve(arg('--out', 'shots'));
fs.mkdirSync(outDir, { recursive: true });
const errors = [];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const src = /^https?:\/\//.test(target)
  ? target
  : pathToFileURL(path.resolve(target)).href;
const url = src + (src.includes('?') ? '&' : '?') + 'intro=0';

async function launchBrowser() {
  const candidates = [
    process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ].filter(Boolean);

  const launchArgs = [
    '--use-angle=d3d11',
    '--force_high_performance_gpu',
    '--ignore-gpu-blocklist',
    '--enable-webgl',
    '--hide-scrollbars',
    '--enable-unsafe-swiftshader',
  ];

  try {
    return await chromium.launch({ headless: true, args: launchArgs });
  } catch {
    for (const executablePath of candidates) {
      if (!fs.existsSync(executablePath)) continue;
      try {
        return await chromium.launch({ headless: true, executablePath, args: launchArgs });
      } catch { /* try next */ }
    }
  }
  throw new Error(
    'Could not launch Chromium. Run `npx playwright install chromium` or set CHROME_PATH.',
  );
}

async function dismissOverlays(page) {
  await page.evaluate(() => {
    const skip = document.querySelector(
      '#introSkip, #introEnter, [data-act="skipIntro"], [data-intro-skip]',
    );
    if (skip) skip.click();
    for (const sel of ['#loader', '.loader', '#intro', '.intro']) {
      const el = document.querySelector(sel);
      if (el) el.style.display = 'none';
    }
    window.dispatchEvent(new Event('resize'));
  });
}

async function waitReady(page, timeout = 90000) {
  try {
    await page.waitForFunction(
      () => window.APP?.ready === true || window.CVN78?.ready === true,
      null,
      { timeout },
    );
  } catch {
    // A page without the standard API can still be captured if it has a canvas.
    await page.waitForSelector('#app canvas, canvas', { timeout: 15000 });
    await wait(2000);
  }
  await dismissOverlays(page);
  await wait(1200);
}

const browser = await launchBrowser();
try {
  const page = await browser.newPage({
    viewport: { width: 1600, height: 900 },
    deviceScaleFactor: 1,
  });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console.error: ${m.text()}`);
  });
  await page.goto(url, { waitUntil: 'load' });
  await waitReady(page);
  await page.screenshot({ path: path.join(outDir, 'overview.png') });

  const api = await page.evaluate(() => {
    const a = window.APP || window.CVN78 || {};
    return {
      hasExpand: typeof a.expandAll === 'function',
      hasCollapse: typeof a.collapseAll === 'function',
      hasSetView: typeof a.setView === 'function',
    };
  });

  if (api.hasExpand) {
    await page.evaluate(() => (window.APP || window.CVN78).expandAll());
    await wait(2600);
    await page.screenshot({ path: path.join(outDir, 'exploded.png') });
  }
  if (api.hasCollapse) {
    await page.evaluate(() => (window.APP || window.CVN78).collapseAll());
    await wait(1500);
  }
  if (api.hasSetView) {
    await page.evaluate(() => (window.APP || window.CVN78).setView('top'));
    await wait(1200);
    await page.screenshot({ path: path.join(outDir, 'top.png') });
    await page.evaluate(() => (window.APP || window.CVN78).setView('hero'));
    await wait(1200);
  }

  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
  });
  mobile.on('pageerror', (e) => errors.push(`mobile pageerror: ${e.message}`));
  mobile.on('console', (m) => {
    if (m.type() === 'error') errors.push(`mobile console.error: ${m.text()}`);
  });
  await mobile.goto(url, { waitUntil: 'load' });
  await waitReady(mobile);
  await mobile.screenshot({ path: path.join(outDir, 'mobile.png') });
} finally {
  await browser.close();
}

if (errors.length) {
  console.error('\nRuntime errors:');
  for (const e of errors) console.error('  - ' + e);
  process.exitCode = 1;
} else {
  console.log(`  screenshots: ${outDir}`);
}
