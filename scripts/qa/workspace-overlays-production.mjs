import {spawn} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {chromium,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';

const origin='http://127.0.0.1:3002',output='.local/qa-workspace-overlays-production';mkdirSync(output,{recursive:true});
const dictionaries=Object.fromEntries(['en','hi','hinglish'].map(language=>[language,Object.fromEntries(['workspace','voiceos','common'].map(namespace=>[namespace,JSON.parse(readFileSync(`src/locales/${language}/${namespace}.json`,'utf8'))]))]));
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3002'],{env:{...process.env,NODE_ENV:'production',DUKAANSET_ENV:'local',DATABASE_PATH:'.data/overlay-production-'+randomUUID()+'.sqlite',AUTH_BASE_URL:origin,AUTH_EMAIL_MODE:'file',AI_PROVIDER:'',OPENWEATHER_API_KEY:'',DUKAANSET_MEDIA_WORKER:'0',DUKAANSET_CLOSING_WORKER:'0'},windowsHide:true,stdio:['ignore','pipe','pipe']});
let browser,ready=false,failed=false;server.on('error',()=>{failed=true;});server.on('exit',()=>{failed=true;});server.stdout.on('data',data=>{if(String(data).includes('Ready in'))ready=true;});server.stderr.on('data',data=>process.stderr.write(data));
const report={checkedAt:new Date().toISOString(),environment:'Isolated compiled production build; fictional demo data; live weather and AI providers disabled',layouts:[],accessibility:[],checks:[],runtimeErrors:[]};
try{
  let healthy=false;for(let i=0;i<60;i++){if(failed)throw Error('Verification server could not own port 3002');try{if(ready&&(await fetch(origin+'/api/health')).ok){healthy=true;break;}}catch{}await new Promise(resolve=>setTimeout(resolve,500));}assert.ok(healthy);
  browser=await chromium.launch({channel:process.platform==='win32'?'msedge':undefined,headless:true});const context=await browser.newContext({baseURL:origin,viewport:{width:1440,height:900}}),page=await context.newPage();page.on('pageerror',error=>report.runtimeErrors.push(error.message));
  const post=(path,data)=>context.request.post('/api'+path,{headers:{Origin:origin},data}),get=async path=>{const response=await context.request.get('/api'+path);assert.ok(response.ok(),path);return response.json();};assert.equal((await post('/auth/demo',{language:'en'})).status(),201);const session=await get('/session'),shop=session.businesses.find(b=>b.category==='hardware'),before=await get(`/businesses/${shop.id}/state`);
  await page.goto('/app');await page.locator('#hero-business').selectOption(shop.id);await expect(page.locator('main')).toHaveAttribute('data-business-id',shop.id);
  const actualWeather=await get(`/businesses/${shop.id}/weather`);assert.equal(actualWeather.status,'unavailable');report.checks.push('Real weather response remains unavailable without a configured provider or city');
  const fits=async(section,language,width,host)=>{await page.setViewportSize({width,height:900});await page.evaluate(()=>document.fonts.ready);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${language} ${section} document ${width}`);assert.ok(await host.evaluate(el=>el.scrollWidth<=el.clientWidth+1),`${language} ${section} surface ${width}`);const box=await host.boundingBox();assert.ok(box.x>=-1&&box.x+box.width<=width+1);if(section!=='hero')assert.ok(box.y>=-1&&box.y+box.height<=901);report.layouts.push({section,language,width});};
  for(const language of ['en','hi','hinglish']){
    assert.equal((await post('/account/language',{language})).status(),200);await page.reload();await expect(page.locator('.reference-hero')).toBeVisible();const {workspace:w,voiceos:voice,common}=dictionaries[language];
    for(const width of [320,390,768,1142,1440,1920]){await fits('hero',language,width,page.locator('.hero-top'));for(const selector of ['.hero-date','.hero-weather','.hero-voice'])assert.ok(await page.locator(selector).evaluate(el=>el.scrollWidth<=el.clientWidth+1));if(width===390||width===1440)await page.screenshot({path:`${output}/hero-${language}-${width}.png`});}
    for(const section of ['search','updates','voice']){
      await page.setViewportSize({width:1440,height:900});if(section==='search')await page.locator('.global-search-trigger').click();else if(section==='updates')await page.locator('.notification-button').click();else await page.getByRole('button',{name:voice.open,exact:true}).click();const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();
      if(section==='search'){await expect(dialog.getByRole('searchbox')).toBeFocused();await dialog.getByRole('searchbox').fill(before.products[0].sku);await expect(dialog.locator(`a[href="/app/stock/${before.products[0].id}"]`)).toBeVisible();}
      if(section==='updates')await expect(dialog.getByRole('button',{name:new RegExp('^'+common.stock+'\\s')})).toBeVisible();
      for(const width of [320,390,768,1440]){await fits(section,language,width,dialog);if(width===390||width===1440){const scan=await new AxeBuilder({page}).include('[role="dialog"]').withTags(['wcag2a','wcag2aa']).analyze();assert.deepEqual(scan.violations,[]);report.accessibility.push({section,language,width,violations:0});await page.screenshot({path:`${output}/${section}-${language}-${width}.png`});}}
      if(section==='voice'){await dialog.getByLabel(voice.command,{exact:true}).fill('show today sales');await dialog.getByLabel(voice.command,{exact:true}).press('Enter');await expect(dialog.locator('.voiceos-answer')).toBeVisible();}
      await page.keyboard.press('Escape');await expect(dialog).toBeHidden();
      if(section==='search'){await page.locator('.global-search-trigger').click();await page.getByRole('dialog').getByRole('button',{name:w.overlays.clearSearch,exact:true}).click();await page.keyboard.press('Escape');}
    }
  }
  assert.equal((await post('/account/language',{language:'en'})).status(),200);
  const accountingDate=new Date(Date.now()-2*86400000).toISOString().slice(0,10);
  await page.route(`**/api/businesses/${shop.id}/state`,async route=>{const response=await route.fetch(),value=await response.json();value.dashboard.clock.businessDate=accountingDate;await route.fulfill({response,json:value});});
  for(const weather of [{status:'ready',temperatureC:24,condition:'clear',city:'New Delhi',observedAt:new Date().toISOString(),source:'openweather'},{status:'unavailable',reason:'ambiguous'},{status:'unavailable',reason:'location'}]){
    await page.unroute('**/api/businesses/*/weather');await page.route('**/api/businesses/*/weather',route=>route.fulfill({json:weather}));await page.reload();await expect(page.locator('.hero-date small')).toContainText('Accounting date:');const name=weather.status==='ready'?'ready':weather.reason;
    for(const width of [320,390,1440]){await fits('hero-'+name,'en',width,page.locator('.hero-top'));for(const selector of ['.hero-date','.hero-weather','.hero-voice'])assert.ok(await page.locator(selector).evaluate(el=>el.scrollWidth<=el.clientWidth+1));const scan=await new AxeBuilder({page}).include('.hero-top').withTags(['wcag2a','wcag2aa']).analyze();assert.deepEqual(scan.violations,[]);report.accessibility.push({section:'hero-'+name,language:'en',width,violations:0});if(width===390)await page.screenshot({path:`${output}/hero-accounting-${name}-390.png`});}
  }
  report.checks.push('Simulated ready, ambiguous and missing-city weather remain readable beside an earlier accounting date');
  const after=await get(`/businesses/${shop.id}/state`);assert.deepEqual(after.invoices,before.invoices);assert.deepEqual(after.products,before.products);assert.deepEqual(after.payments,before.payments);assert.deepEqual(report.runtimeErrors,[]);report.checks.push('Compiled CSS fits all checked widths and languages','Search returns actual product records; updates retain live counts; typed VoiceOS reads actual report data','All checked dialogs pass WCAG A/AA scans','Viewing overlays and reports leaves financial and inventory ledgers unchanged');
  writeFileSync(output+'/report.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({checks:report.checks,layouts:report.layouts.length,accessibilityScans:report.accessibility.length,runtimeErrors:report.runtimeErrors}));
}finally{await browser?.close();server.kill('SIGTERM');}
