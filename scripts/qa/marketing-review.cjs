const { path, expect, AxeBuilder, origin, outputDirectory, launchBrowser, writeReport } = require('./shared.cjs');
const output = outputDirectory('marketing-review');
let browser;
(async () => {
  browser = await launchBrowser();
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const results = [];
  await page.goto(origin, { waitUntil: 'networkidle' });
  await page.screenshot({ style: "nextjs-portal { visibility:hidden }", path: path.join(output, 'home-desktop.png') });
  await page.locator('.m-industry').screenshot({ style: "nextjs-portal { visibility:hidden }", path: path.join(output, 'business-desktop.png') });
  for (const width of [320, 360, 375, 390, 412, 430, 768, 1366]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => window.scrollTo(0, 0));
    const layout = await page.evaluate(() => {
      const overflow = [...document.querySelectorAll('.m-site h1,.m-site h2,.m-site h3,.m-site p,.m-site button,.m-site a,.m-site strong')].map(el => ({el, rect:el.getBoundingClientRect()})).filter(({el,rect}) => rect.width && rect.height && !el.classList.contains('m-skip-link') && (rect.right > innerWidth + 1 || rect.left < -1 || el.scrollWidth > el.clientWidth + 3)).map(({el,rect}) => ({ tag:el.tagName, cls:el.className, text:el.textContent.slice(0,90), left:rect.left, right:rect.right, scroll:el.scrollWidth, width:el.clientWidth }));
      return { viewport:innerWidth, scrollWidth:document.documentElement.scrollWidth, overflow };
    });
    results.push({ page:'/', width, ...layout });
    if (width === 320 || width === 390) {
      await page.screenshot({ style: "nextjs-portal { visibility:hidden }", path: path.join(output, `home-${width}.png`) });
      await page.locator('.m-industry').screenshot({ style: "nextjs-portal { visibility:hidden }", path: path.join(output, `business-${width}.png`) });
    }
  }
  await page.setViewportSize({ width:390, height:900 });
  await page.getByRole('button', { name:'Open navigation', exact:true }).click();
  results.push({ check:'Mobile menu opens', passed:await page.locator('#marketing-mobile-nav').isVisible() });
  await page.getByRole('button', { name:'Close navigation', exact:true }).click();
  await page.getByRole('tab', { name:'Hardware', exact:true }).click();
  await expect(page.locator('#business-preview-panel .m-preview-shop')).toContainText('Setu Hardware'); results.push({ check:'Hardware preview changes', passed:true });
  await page.getByRole('tab', { name:'Hardware', exact:true }).press('ArrowRight');
  results.push({ check:'Keyboard category navigation', passed:await page.getByRole('tab', { name:'Fruits & vegetables', exact:true }).getAttribute('aria-selected') === 'true' });
  await page.getByRole('button', {name:'हिन्दी',exact:true}).click();
  results.push({ check:'Hindi language preview', passed:await page.locator('.m-language-card').getByText('आज का कारोबार, एक नज़र में।',{exact:true}).isVisible() });
  const faq = page.locator('.m-faq-list summary').first();
  await faq.click();
  results.push({ check:'FAQ expands', passed:await faq.locator('..').getAttribute('open') !== null });
  const axeHome = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
  results.push({check:'Home accessibility', violations:axeHome.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});
  for (const route of ['/hi', '/features/billing', '/business-types/vegetables', '/pricing', '/privacy', '/unknown-page']) {
    await page.goto(origin+route,{waitUntil:'networkidle'});
    const layout = await page.evaluate(() => ({viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,h1:document.querySelector('h1')?.textContent,title:document.title}));
    results.push({route,...layout});
    if (route === '/hi' || route === '/features/billing') await page.screenshot({style: "nextjs-portal { visibility:hidden }",path:path.join(output,route==='/hi'?'hindi-390.png':'billing-390.png')});
  }
  results.push({check:'Runtime page errors',errors});
  writeReport(results, output, 'report.json');
  process.stdout.write(JSON.stringify(results,null,2));
})().catch(error=>{console.error(error);process.exitCode=1}).finally(()=>browser?.close());
