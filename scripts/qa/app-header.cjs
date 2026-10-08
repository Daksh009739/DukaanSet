const { path, expect, AxeBuilder, origin, outputDirectory, launchBrowser, writeReport } = require('./shared.cjs');
const output = outputDirectory('app-header');
let browser;
(async () => {
  browser = await launchBrowser();
  const context = await browser.newContext({ baseURL: origin, viewport: { width: 1366, height: 900 }, reducedMotion: 'reduce' });
  const demo = await context.request.post('/api/auth/demo', { data: {}, headers: { Origin: origin } });
  if (!demo.ok()) throw new Error('Demo failed: ' + demo.status());
  const page = await context.newPage();
  await page.goto('/app', { waitUntil: 'networkidle' });
  await page.getByRole('combobox', { name: /Language|Bhasha|भाषा/ }).selectOption('en');
  const results = [];
  for (const width of [1366, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    const menu = page.locator('.header-tools .mobile-only');
    if (width === 768) await expect(menu).toBeVisible();
    else await expect(menu).toBeHidden();
    if (width > 1024) await expect(page.locator('.bottom-nav')).toBeHidden();
    else await expect(page.locator('.bottom-nav')).toBeVisible();
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    results.push({ width, headerMenuVisible: await menu.isVisible(), scrollWidth: await page.evaluate(() => document.documentElement.scrollWidth), violations: result.violations });
    if ([1366, 390, 320].includes(width)) await page.screenshot({ path: path.join(output, 'dashboard-' + width + '.png'), style: 'nextjs-portal {visibility:hidden}' });
  }
  writeReport(results, output, 'header-report.json');
  console.log(JSON.stringify(results, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => browser?.close());
