const { path, expect, AxeBuilder, origin, outputDirectory, launchBrowser, writeReport } = require('./shared.cjs');
const output = outputDirectory('app-review');
let browser;
(async()=>{
 browser = await launchBrowser();
 const context=await browser.newContext({baseURL:origin,viewport:{width:1366,height:900},reducedMotion:'reduce'});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));const results=[];
 const demo=await context.request.post('/api/auth/demo',{data:{},headers:{Origin:origin}});if(!demo.ok())throw new Error('Demo failed: '+demo.status());
 await page.goto('/app',{waitUntil:'networkidle'});await expect(page.locator('.greeting h1')).toBeVisible();
 await page.getByRole('combobox',{name:/Language|Bhasha|भाषा/}).selectOption('en');await expect(page.getByRole('combobox',{name:'Language',exact:true})).toHaveValue('en');
 async function measure(){return page.evaluate(()=>({viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,overflow:[...document.querySelectorAll('.workspace h1,.workspace h2,.workspace h3,.workspace p,.workspace button,.workspace a,.workspace strong,.workspace b,.sheet h2,.sheet p,.sheet button,.sheet input,.sheet select,.sheet b')].map(el=>({el,r:el.getBoundingClientRect()})).filter(({el,r})=>r.width&&r.height&&!el.classList.contains('skip-link')&&!el.classList.contains('sr-only')&&(r.right>innerWidth+1||r.left<-1||el.scrollWidth>el.clientWidth+4)).map(({el,r})=>({tag:el.tagName,cls:el.className,text:el.textContent.slice(0,100),left:r.left,right:r.right,scroll:el.scrollWidth,width:el.clientWidth}))}));}
 async function accessibility(){const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();return result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}));}
 async function screenshot(name,locator){const options={path:path.join(output,name+'.png'),style:'nextjs-portal {visibility:hidden}'};await(locator||page).screenshot(options);}
 for(const route of ['/app','/app/stock','/app/customers','/app/purchases','/app/sales','/app/settings','/app/reports','/app/todays-work','/app/daily-closing','/app/payments','/app/expenses','/app/ai','/app/help']){
   await page.goto(route,{waitUntil:'networkidle'});await expect(page.locator('.app-content h1')).toBeVisible();
   for(const width of [320,390,1366]){await page.setViewportSize({width,height:900});results.push({route,width,...await measure(),violations:await accessibility()});if((route==='/app'&&[320,390,1366].includes(width))||(route==='/app/stock'&&width===390)||(route==='/app/settings'&&width===390))await screenshot((route==='/app'?'dashboard':route.split('/').at(-1))+'-'+width);}
 }
 await page.setViewportSize({width:390,height:900});
 for(const [route,button,name] of [['/app/stock','Add product','product-sheet'],['/app/stock','Add stock','stock-sheet'],['/app/customers','Add customer','customer-sheet'],['/app/purchases','Receive purchase','purchase-sheet']]){
   await page.goto(route,{waitUntil:'networkidle'});await page.getByRole('button',{name:button,exact:true}).first().click();await expect(page.getByRole('dialog')).toBeVisible();
   results.push({check:name,width:390,...await measure(),violations:await accessibility()});await screenshot(name+'-390');await page.getByRole('dialog').getByRole('button',{name:'Close',exact:true}).click();
 }
 await page.goto('/app/sales/new',{waitUntil:'networkidle'});await page.locator('.pick-product:not(:disabled)').first().click();
 for(const width of [1366,390,320]){await page.setViewportSize({width,height:900});if(width<=767){await page.locator('.billing-steps button').first().click();results.push({check:'billing-add',width,...await measure(),violations:await accessibility()});await screenshot('billing-add-'+width);await page.locator('.billing-steps button').nth(1).click();}results.push({check:'billing-review',width,...await measure(),violations:await accessibility()});await screenshot('billing-review-'+width);}
 results.push({check:'runtime-errors',errors});writeReport(results, output, 'report.json');console.log(JSON.stringify(results.map(x=>({route:x.route,check:x.check,width:x.width,scroll:x.scrollWidth,overflow:x.overflow?.length,violations:x.violations?.length,errors:x.errors})),null,2));
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>browser?.close());
