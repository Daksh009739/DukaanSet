import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { httpsOrigin } from './deployment-config.mjs';
const origin = httpsOrigin(process.argv[2], 'Staging URL');
const expectedCommit = process.env.DUKAANSET_EXPECTED_COMMIT;
assert.match(expectedCommit || '', /^[a-f0-9]{40}$/i, 'Set DUKAANSET_EXPECTED_COMMIT to the deployed dev commit.');
const report = { checkedAt: new Date().toISOString(), commit: expectedCommit, checks: [], limitations: ['Real registration/verification/reset email delivery, physical Android camera/microphone and partner access require separate acceptance.'] };
let browser;
try {
  browser = await chromium.launch({ headless: true, ...(process.platform === 'win32' ? { channel: 'msedge' } : {}) });
  const context = await browser.newContext({ baseURL: origin, serviceWorkers: 'block' });
  // Automation bypass, when approved/configured, is sent only to the staging origin.
  const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
  if (bypass) await context.route('**/*', route => {
    const headers = { ...route.request().headers() };
    if (new URL(route.request().url()).origin === origin) headers['x-vercel-protection-bypass'] = bypass;
    return route.continue({ headers });
  });
  const headers = { Origin: origin, ...(bypass ? { 'x-vercel-protection-bypass': bypass } : {}) };
  const page = await context.newPage();
  const home = await page.goto(origin);
  assert.equal(home?.status(), 200, 'Deployment protection or homepage failed.');
  assert.match((await home.allHeaders())['x-robots-tag'] || '', /noindex/);
  await page.getByRole('status').filter({ hasText: 'Staging / Demo' }).waitFor();
  for (const width of [320, 360, 375, 390]) {
    await page.setViewportSize({ width, height: 844 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Homepage overflows at ${width}px.`);
  }
  report.checks.push('HTTPS homepage, staging label, noindex and 320/360/375/390px layouts');
  await page.goto('/app'); assert.match(page.url(), /\/login/);
  assert.equal((await context.request.get('/api/session', { headers })).status(), 401);
  assert.equal((await context.request.get('/api/deployment', { headers })).status(), 401);
  assert.deepEqual(await (await context.request.get('/api/health', { headers })).json(), { ok: true });
  const robots = await context.request.get('/robots.txt', { headers }); assert.match(await robots.text(), /Disallow: \/(?:\r?\n|$)/);
  report.checks.push('Protected dashboard, private build information, database health and robots');
  const demo = await context.request.post('/api/auth/demo', { headers, data: {} }); assert.equal(demo.status(), 201);
  assert.match(demo.headers()['set-cookie'] || '', /HttpOnly/); assert.match(demo.headers()['set-cookie'] || '', /Secure/);
  const session = await demo.json(); assert.equal(session.user.demo, true);
  const info = await (await context.request.get('/api/deployment', { headers })).json();
  assert.equal(info.environment, 'staging'); assert.equal(info.branch, 'dev'); assert.equal(info.commit, expectedCommit);
  const business = session.businesses[0].id;
  const stateResponse = await context.request.get(`/api/businesses/${business}/state`, { headers }); assert.equal(stateResponse.status(), 200);
  const state = await stateResponse.json(); assert.ok(state.products.length > 0); assert.ok(state.invoices.length > 0);
  for (const pathname of ['/app', '/app/stock', '/app/stock/voice', '/app/sales/new', '/app/customers', '/app/demand', '/app/settings']) {
    assert.equal((await page.goto(pathname))?.status(), 200); await page.locator('#main').waitFor();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${pathname} overflows at 390px.`);
  }
  await page.reload(); assert.ok((await context.request.get('/api/session', { headers })).ok());
  report.checks.push('Isolated fictional demo, stock and invoice records, app routes and reload persistence');
  assert.equal((await context.request.get(`/api/businesses/${crypto.randomUUID()}/state`, { headers })).status(), 403);
  assert.ok((await context.request.post('/api/auth/logout', { headers, data: {} })).ok());
  assert.equal((await context.request.get('/api/session', { headers })).status(), 401);
  report.checks.push('Foreign workspace rejection and session revocation on logout');
} catch (error) { report.error = error.message; process.exitCode = 1; }
finally {
  await browser?.close(); mkdirSync('.local', { recursive: true }); writeFileSync('.local/staging-smoke.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}
