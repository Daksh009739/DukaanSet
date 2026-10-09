import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Start the production server separately, then run:
// node scripts/check-production.mjs http://127.0.0.1:3002
const requestedOrigin = process.argv[2] || process.env.DUKAANSET_SMOKE_ORIGIN || 'http://127.0.0.1:3002';
const result = {
  origin: requestedOrigin,
  browser: process.platform === 'win32' ? 'headless Edge' : 'headless Chromium',
  checks: [],
  limitations: ['This checks a local production server. Real HTTPS deployment and PWA installation are not tested.'],
};
let browser;
let context;
let origin;

async function check(name, operation) {
  try {
    const details = await operation();
    result.checks.push({ name, ok: true, ...(details === undefined ? {} : { details }) });
    return true;
  } catch (error) {
    result.checks.push({ name, ok: false, error: error instanceof Error ? error.message : String(error) });
    return false;
  }
}

const publicPaths = new Set(['/offline.html', '/icon.svg', '/manifest.webmanifest', '/brand/icon-192.png', '/brand/icon-512.png', '/brand/maskable-512.png']);
const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
async function cacheSnapshot(page) {
  return page.evaluate(async () => {
    const names = await caches.keys();
    return Promise.all(names.map(async name => {
      const cache = await caches.open(name);
      return { name, entries: (await cache.keys()).map(request => ({ url: request.url, method: request.method })) };
    }));
  });
}
function assertPublicCaches(snapshot) {
  assert.ok(snapshot.some(cache => cache.name.startsWith('dukaanset-public-')), 'Public offline cache was not created.');
  const paths = new Set();
  for (const cache of snapshot) for (const entry of cache.entries) {
    const url = new URL(entry.url);
    assert.equal(url.origin, origin, 'A cache entry points to a foreign origin.');
    assert.equal(entry.method, 'GET', 'A mutation entered Cache Storage.');
    assert.equal(url.search, '', 'A query-specific response entered Cache Storage.');
    assert.ok(publicPaths.has(url.pathname), `Unexpected cached path: ${url.pathname}`);
    paths.add(url.pathname);
  }
  for (const path of publicPaths) assert.ok(paths.has(path), `Offline public asset missing: ${path}`);
}

try {
  const target = new URL(requestedOrigin);
  assert.ok(['http:', 'https:'].includes(target.protocol), 'Origin must use HTTP or HTTPS.');
  assert.equal(target.username + target.password, '', 'Do not pass credentials in the origin.');
  assert.ok(target.pathname === '/' && !target.search && !target.hash, 'Pass an origin without a path, query or fragment.');
  origin = target.origin;
  result.origin = origin;
  browser = await chromium.launch({ headless: true, ...(process.platform === 'win32' ? { channel: 'msedge' } : {}) });
  context = await browser.newContext({ serviceWorkers: 'allow', viewport: { width: 390, height: 844 } });
  context.setDefaultTimeout(10_000);
  context.setDefaultNavigationTimeout(15_000);
  const page = await context.newPage();
  let homepageHeaders;
  await check('public homepage', async () => {
    const response = await page.goto(origin, { waitUntil: 'domcontentloaded' });
    assert.equal(response?.status(), 200);
    await page.locator('h1').first().waitFor();
    assert.match(await page.title(), /DukaanSet/);
    homepageHeaders = await response.allHeaders();
    return { status: response.status() };
  });
  await check('security headers', async () => {
    assert.ok(homepageHeaders, 'Homepage headers are unavailable.');
    assert.equal(homepageHeaders['x-content-type-options'], 'nosniff');
    assert.equal(homepageHeaders['x-frame-options'], 'DENY');
    assert.equal(homepageHeaders['referrer-policy'], 'no-referrer');
    assert.match(homepageHeaders['permissions-policy'] || '', /camera=\(self\)/);
    assert.match(homepageHeaders['permissions-policy'] || '', /microphone=\(self\)/);
    assert.match(homepageHeaders['permissions-policy'] || '', /geolocation=\(\)/);
    const policy = homepageHeaders['content-security-policy'] || '';
    assert.match(policy, /default-src\s+'self'/);
    assert.match(policy, /frame-ancestors\s+'none'/);
    assert.match(policy, /form-action\s+'self'/);
    assert.ok(!policy.includes("'unsafe-eval'"), 'Development CSP was served in the production check.');
    assert.equal(homepageHeaders['x-powered-by'], undefined);
  });
  await check('manifest and public icons', async () => {
    const manifestResponse = await context.request.get(`${origin}/manifest.webmanifest`);
    assert.equal(manifestResponse.status(), 200);
    const manifest = await manifestResponse.json();
    assert.match(manifest.name, /DukaanSet/);
    assert.equal(manifest.display, 'standalone');
    assert.equal(manifest.start_url, '/app');
    assert.ok(manifest.icons.length >= 3);
    for (const icon of manifest.icons) {
      const url = new URL(icon.src, origin);
      assert.equal(url.origin, origin);
      assert.ok(publicPaths.has(url.pathname));
      const response = await context.request.get(url.href);
      assert.equal(response.status(), 200, `Missing icon: ${url.pathname}`);
      assert.match(response.headers()['content-type'] || '', /image\/png/);
      assert.ok((await response.body()).subarray(0, 8).equals(pngSignature), `Icon is not PNG data: ${url.pathname}`);
    }
    const icon = await context.request.get(`${origin}/icon.svg`);
    assert.equal(icon.status(), 200);
    assert.match(await icon.text(), /<svg[\s>]/);
    return { icons: manifest.icons.length };
  });
  await check('anonymous private-route redirect', async () => {
    await page.goto(`${origin}/app`, { waitUntil: 'domcontentloaded' });
    await page.waitForURL(url => url.origin === origin && url.pathname === '/login');
    assert.equal(await page.locator('.workspace').count(), 0);
    const response = await context.request.get(`${origin}/api/session`);
    assert.equal(response.status(), 401);
    assert.match(response.headers()['cache-control'] || '', /no-store/);
  });
  const workerReady = await check('service worker registration and control', async () => {
    await page.waitForFunction(async () => {
      if (!('serviceWorker' in navigator)) return false;
      return Boolean((await navigator.serviceWorker.getRegistration('/'))?.active);
    }, undefined, { timeout: 15_000 });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller), undefined, { timeout: 10_000 });
    const workerUrl = await page.evaluate(() => navigator.serviceWorker.controller.scriptURL);
    assert.equal(new URL(workerUrl).origin, origin);
    assert.equal(new URL(workerUrl).pathname, '/sw.js');
  });
  await check('cache contains only public offline assets', async () => {
    assert.ok(workerReady, 'Service worker was not ready.');
    // Exercise uncached API and private navigation with an anonymous context.
    assert.equal(await page.evaluate(async () => (await fetch('/api/session', { cache: 'no-store' })).status), 401);
    await page.goto(`${origin}/app?production-smoke=1`, { waitUntil: 'domcontentloaded' });
    await page.waitForURL(url => url.pathname === '/login');
    const snapshot = await cacheSnapshot(page);
    assertPublicCaches(snapshot);
    return snapshot.map(cache => ({ name: cache.name, paths: cache.entries.map(entry => new URL(entry.url).pathname).sort() }));
  });
  await check('offline navigation renders the public fallback', async () => {
    assert.ok(workerReady, 'Service worker was not ready.');
    await context.setOffline(true);
    await page.goto(`${origin}/app?production-smoke-offline=1`, { waitUntil: 'domcontentloaded' });
    await page.locator('h1').waitFor();
    assert.match(await page.title(), /offline/i);
    assert.match(await page.locator('h1').innerText(), /connection took a break/i);
    assert.equal(await page.locator('.workspace').count(), 0);
    assert.match(await page.locator('body').innerText(), /does not contain customer data|No business records have been cached/i);
    const offlineApi = await page.evaluate(async () => {
      try { return (await fetch('/api/session', { cache: 'no-store' })).status; } catch { return null; }
    });
    assert.equal(offlineApi, null, 'An API response was available offline.');
    assertPublicCaches(await cacheSnapshot(page));
    return { privateRecordsCached: false, offlineApiAvailable: false };
  });
} catch (error) {
  result.checks.push({ name: 'smoke runtime', ok: false, error: error instanceof Error ? error.message : String(error) });
} finally {
  await context?.close().catch(() => {});
  await browser?.close().catch(() => {});
  result.ok = result.checks.length > 0 && result.checks.every(check => check.ok);
  result.passed = result.checks.filter(check => check.ok).length;
  result.failed = result.checks.filter(check => !check.ok).length;
  console.log(JSON.stringify(result, null, 2));
  process.exitCode = result.ok ? 0 : 1;
}
