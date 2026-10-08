const { path, expect, AxeBuilder, origin, outputDirectory, launchBrowser, writeReport } = require('./shared.cjs');
const output = outputDirectory('marketing-details');
let browser;
(async()=>{
 browser = await launchBrowser();
 const context=await browser.newContext({viewport:{width:320,height:900},reducedMotion:'reduce'}); const page=await context.newPage();
 const log=[]; const consoles=[];
 page.on('console',message=>{if(message.type()==='error'||message.type()==='warning')consoles.push({type:message.type(),text:message.text()});});
 await page.goto(origin,{waitUntil:'networkidle'});
 for(const label of ['Grocery','Hardware','Fruits & vegetables','Mobile accessories','Clothing','General business']){
   await page.getByRole('tab',{name:label,exact:true}).click();
   await expect(page.getByRole('tab',{name:label,exact:true})).toHaveAttribute('aria-selected','true');
   const overflow=await page.locator('#business-preview-panel').evaluate(panel=>[...panel.querySelectorAll('strong,h3,p,button')].filter(el=>el.scrollWidth>el.clientWidth+3).map(el=>({tag:el.tagName,text:el.textContent,scroll:el.scrollWidth,width:el.clientWidth})));
   log.push({category:label,width:320,overflow});
 }
 for(const route of ['/hi','/features','/features/billing','/features/inventory','/features/udhar','/features/ai','/business-types','/business-types/grocery','/business-types/hardware','/business-types/vegetables','/business-types/mobile','/pricing','/how-it-works','/help','/contact','/about','/privacy','/terms','/security','/unknown-page']){
   const response=await page.goto(origin+route,{waitUntil:'networkidle'});
   const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
   const overflow=await page.evaluate(()=>[...document.querySelectorAll('.m-site h1,.m-site h2,.m-site h3,.m-site p,.m-site button,.m-site a,.m-site strong')].filter(el=>el.offsetHeight&&!el.classList.contains('m-skip-link')&&!el.classList.contains('m-sr-only')&&el.scrollWidth>el.clientWidth+3).map(el=>({tag:el.tagName,cls:el.className,text:el.textContent.slice(0,80),scroll:el.scrollWidth,width:el.clientWidth})));
   log.push({route,status:response.status(),title:await page.title(),overflow,violations:axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});
 }
 log.push({consoles});
 writeReport(log, output, 'details-report.json');
 console.log(JSON.stringify(log.map(x=>({route:x.route,category:x.category,status:x.status,overflow:x.overflow?.length,violations:x.violations?.length,consoles:x.consoles})),null,2));
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>browser?.close());
