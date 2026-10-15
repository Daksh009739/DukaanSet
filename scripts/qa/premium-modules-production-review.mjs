import {spawn} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import {mkdirSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {chromium,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const origin='http://127.0.0.1:3002',output='.local/qa-premium-modules-production';mkdirSync(output,{recursive:true});
const env={...process.env,NODE_ENV:'production',DUKAANSET_ENV:'local',DATABASE_PATH:'.data/premium-module-qa-'+randomUUID()+'.sqlite',AUTH_BASE_URL:origin,AUTH_EMAIL_MODE:'file',AUTH_MAIL_DIRECTORY:'.data/premium-module-mail',AI_PROVIDER:'',OPENWEATHER_API_KEY:'',DUKAANSET_MEDIA_WORKER:'0',DUKAANSET_CLOSING_WORKER:'0'};
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3002'],{env,windowsHide:true,stdio:['ignore','pipe','pipe']});let browser;
try {
  let ready=false;for(let i=0;i<60;i++){try{if((await fetch(origin+'/api/health')).ok){ready=true;break;}}catch{}await new Promise(resolve=>setTimeout(resolve,500));}assert.ok(ready,'Compiled local server ready');
  browser=await chromium.launch({channel:process.platform==='win32'?'msedge':undefined,headless:true});
  const context=await browser.newContext({baseURL:origin,viewport:{width:1440,height:1000}}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  assert.equal((await context.request.post('/api/auth/demo',{headers:{Origin:origin},data:{language:'en'}})).status(),201);
  const session=await(await context.request.get('/api/session')).json(),shop=session.businesses.find(b=>b.category==='hardware');
  await page.goto('/app');await page.locator('#hero-business').selectOption(shop.id);await expect(page.locator('main')).toHaveAttribute('data-business-id',shop.id);
  const before=await(await context.request.get('/api/businesses/'+shop.id+'/state')).json(),routes=['sales/new','sales','stock','customers','payments','purchases','suppliers'],layouts=[];
  for(const width of [1440,390,320]) {
    await page.setViewportSize({width,height:width===1440?1000:844});
    for(const route of routes) {
      await page.goto('/app/'+route);await expect(page.locator('main h1')).toBeVisible();await expect(page.getByTestId('contextual-voice-hero')).toBeVisible();
      if(route==='sales')await expect(page.locator('.sale-history-card').first()).toBeVisible();
      if(route==='purchases')await expect(page.locator('.module-metric dd').first()).toHaveText('0');
      await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:output+'/'+route.replace('/','-')+'-'+width+'.png',fullPage:true});
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),route+' '+width+' overflow');
      if(width!==320)assert.deepEqual((await new AxeBuilder({page}).include('main').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations,[],route+' '+width+' accessibility');
      layouts.push({route,width,overflow:false});
    }
  }
  const after=await(await context.request.get('/api/businesses/'+shop.id+'/state')).json();assert.deepEqual(after.payments,before.payments);assert.deepEqual(after.products,before.products);assert.deepEqual(after.invoices,before.invoices);assert.deepEqual(errors,[]);
  writeFileSync(output+'/review.json',JSON.stringify({checkedAt:new Date().toISOString(),environment:'Compiled local production, isolated fictional hardware demo',layouts,accessibilityLayouts:14,runtimeErrors:errors,ledgerUnchanged:true},null,2)+'\n');
  console.log(JSON.stringify({layouts:layouts.length,accessibilityLayouts:14,runtimeErrors:errors,ledgerUnchanged:true}));
}finally{await browser?.close();server.kill('SIGTERM');}
