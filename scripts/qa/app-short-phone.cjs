const { path, expect, AxeBuilder, origin, outputDirectory, launchBrowser, writeReport } = require('./shared.cjs');
const output = outputDirectory('app-short-phone');
let browser;
(async () => {
  browser = await launchBrowser();
  const context = await browser.newContext({ baseURL: origin, viewport: { width: 320, height: 568 }, reducedMotion: 'reduce' });
  const demo = await context.request.post('/api/auth/demo', { data: {}, headers: { Origin: origin } });
  if (!demo.ok()) throw new Error('Demo session failed: ' + demo.status());
  const page = await context.newPage();
  await page.goto('/app', { waitUntil: 'networkidle' });
  await page.getByRole('combobox', { name: /Language|Bhasha|भाषा/ }).selectOption('en');
  const results = [];
  for (const viewport of [{ width: 320, height: 568 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    for (const [route, button, name] of [['/app/stock', 'Add product', 'product'], ['/app/stock', 'Add stock', 'stock'], ['/app/customers', 'Add customer', 'customer'], ['/app/purchases', 'Receive purchase', 'purchase']]) {
      await page.goto(route, { waitUntil: 'networkidle' });
      await page.getByRole('button', { name: button, exact: true }).first().click();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      for (let count = 0; count < 25; count++) {
        await page.keyboard.press('Tab');
        const inDialog = await page.evaluate(() => Boolean(document.activeElement?.closest('[role="dialog"]')));
        if (!inDialog) throw new Error('Focus escaped ' + name + ' sheet');
      }
      await dialog.evaluate(el => { el.scrollTop = el.scrollHeight; });
      const layout = await page.evaluate(() => {
        const dialog = document.querySelector('[role="dialog"]');
        const actions = dialog.querySelector('.sheet-actions').getBoundingClientRect();
        const header = dialog.querySelector('.sheet-header').getBoundingClientRect();
        return { width: innerWidth, scrollWidth: document.documentElement.scrollWidth, actionsTop: actions.top, actionsBottom: actions.bottom, headerTop: header.top, headerBottom: header.bottom };
      });
      if (layout.scrollWidth > viewport.width || layout.actionsBottom > viewport.height + 1 || layout.actionsTop < 0 || layout.headerTop < -1) throw new Error('Sheet layout did not fit: ' + JSON.stringify(layout));
      const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
      results.push({ name, ...viewport, ...layout, violations: axe.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) })), focusTrapped: true });
      if (name === 'purchase' || name === 'product') await page.screenshot({ path: path.join(output, name + '-sheet-' + viewport.width + 'x' + viewport.height + '.png'), style: 'nextjs-portal {visibility:hidden}' });
      await page.keyboard.press('Escape');
      await expect(dialog).not.toBeVisible();
    }
    await page.goto('/app', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'More', exact: true }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    results.push({ name: 'mobile-more-menu', ...viewport, violations: axe.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })) });
    await page.keyboard.press('Escape');
  }
  writeReport(results, output, 'short-phone-report.json');
  console.log(JSON.stringify(results, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => browser?.close());
