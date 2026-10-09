const { fs, path, expect, origin, launchBrowser } = require('./shared.cjs');
(async () => {
  const output = path.resolve('docs/qa/staging'); fs.mkdirSync(output, { recursive: true });
  const browser = await launchBrowser(), context = await browser.newContext({ baseURL: origin }), page = await context.newPage();
  const checks = [];
  try {
    const response = await page.goto('/'); expect(response.status()).toBe(200);
    expect(response.headers()['x-robots-tag']).toContain('noindex');
    await expect(page.getByRole('status').filter({ hasText: 'Staging / Demo' })).toBeVisible();
    for (const width of [320, 360, 375, 390]) {
      await page.setViewportSize({ width, height: 844 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    }
    expect(await (await context.request.get('/robots.txt')).text()).toMatch(/Disallow: \/(?:\r?\n|$)/);
    checks.push('compiled staging banner, noindex, robots and four phone widths');
    const demo = await context.request.post('/api/auth/demo', { headers: { Origin: origin }, data: {} }); expect(demo.status()).toBe(201);
    await page.goto('/app/settings'); await expect(page.getByText('Build details / बिल्ड जानकारी')).toBeVisible();
    await page.getByText('Build details / बिल्ड जानकारी').click(); await expect(page.locator('.build-details').getByText('staging', { exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await page.screenshot({ path: path.join(output, 'build-details-phone.png'), fullPage: true });
    await page.goto('/app/stock'); await expect(page.locator('.stock-voice-entry a[href="/app/stock/voice"]')).toBeVisible();
    await page.screenshot({ path: path.join(output, 'stock-staging-phone.png'), fullPage: true });
    checks.push('owner-only build details and highlighted voice entry on compiled staging');
    const publicContext = await browser.newContext({ baseURL: origin });
    expect((await publicContext.request.get('/api/deployment')).status()).toBe(401);
    expect(await (await publicContext.request.get('/api/health')).json()).toEqual({ ok: true });
    await publicContext.close(); checks.push('anonymous metadata rejection and minimal health');
    fs.writeFileSync(path.join(output, 'local-verification.json'), JSON.stringify({ checkedAt: new Date().toISOString(), scope: 'Local compiled production build in staging mode; isolated fictional database. No hosted deployment acceptance.', checks, mobileWidths: [320, 360, 375, 390] }, null, 2));
    console.log('Compiled local staging checks passed.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
