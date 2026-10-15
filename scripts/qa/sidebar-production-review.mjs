import {spawn} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import {mkdirSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {chromium,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const origin='http://127.0.0.1:3002',output='.local/qa-sidebar-production';mkdirSync(output,{recursive:true});
const env={...process.env,NODE_ENV:'production',DUKAANSET_ENV:'local',DATABASE_PATH:'.data/sidebar-qa-'+randomUUID()+'.sqlite',AUTH_BASE_URL:origin,AUTH_EMAIL_MODE:'file',AUTH_MAIL_DIRECTORY:'.data/sidebar-mail',AI_PROVIDER:'',DUKAANSET_MEDIA_WORKER:'0',DUKAANSET_CLOSING_WORKER:'0'};
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3002'],{env,windowsHide:true,stdio:['ignore','pipe','pipe']});let browser;
try{
  let ready=false;for(let n=0;n<60;n++){try{if((await fetch(origin+'/api/health')).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,500));}assert.ok(ready);
  browser=await chromium.launch({channel:process.platform==='win32'?'msedge':undefined,headless:true});const context=await browser.newContext({baseURL:origin,viewport:{width:1440,height:1000}}),page=await context.newPage(),errors=[],layouts=[];page.on('pageerror',e=>errors.push(e.message));
  assert.equal((await context.request.post('/api/auth/demo',{headers:{Origin:origin},data:{language:'en'}})).status(),201);const session=await(await context.request.get('/api/session')).json(),id=session.businesses[0].id;const get=async()=> (await context.request.get('/api/businesses/'+id+'/state')).json(),before=await get();
  await page.goto('/app');await expect(page.locator('main')).toHaveAttribute('data-business-id',id);await page.evaluate(()=>document.fonts.ready);const nav=page.locator('aside.sidebar');
  await page.screenshot({path:output+'/expanded-desktop.png'});assert.deepEqual((await new AxeBuilder({page}).include('aside.sidebar').withTags(['wcag2a','wcag2aa','wcag22aa']).analyze()).violations,[]);
  await nav.getByRole('button',{name:/^Switch shop:/}).click();await nav.getByRole('searchbox').fill('Sharma');await page.screenshot({path:output+'/shop-switcher.png'});await page.keyboard.press('Escape');
  await nav.getByRole('button',{name:'Collapse navigation'}).click();await expect(nav).toHaveCSS('width','80px');await page.screenshot({path:output+'/collapsed-desktop.png'});assert.deepEqual((await new AxeBuilder({page}).include('aside.sidebar').withTags(['wcag2a','wcag2aa','wcag22aa']).analyze()).violations,[]);await nav.getByRole('button',{name:'Expand navigation'}).click();
  for(const language of ['en','hi','hinglish']){
    if(language!=='en')await new Promise(r=>setTimeout(r,60000));
    assert.equal((await context.request.post('/api/account/language',{headers:{Origin:origin},data:{language}})).status(),200);await page.reload();await expect(page.locator('main')).toHaveAttribute('data-business-id',id);
    for(const width of [320,360,375,390,412,430,768,1024,1280,1440,1920]){
      await page.setViewportSize({width,height:width<=430?844:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
      if(width<=1024){await page.locator('.bottom-nav button').click();const drawer=page.getByRole('dialog');await expect(drawer).toHaveCSS('transform','none');const box=await drawer.boundingBox();assert.ok(box.x>=0&&box.x+box.width<=width);if(width===390){await page.screenshot({path:output+'/mobile-drawer-'+language+'.png'});assert.deepEqual((await new AxeBuilder({page}).include('[role="dialog"]').withTags(['wcag2a','wcag2aa','wcag22aa']).analyze()).violations,[]);}await page.keyboard.press('Escape');await expect(drawer).toBeHidden();}
      if(width===1440)await page.screenshot({path:output+'/expanded-'+language+'.png'});layouts.push({language,width,overflow:false});
    }
  }
  const after=await get();assert.deepEqual(after.invoices,before.invoices);assert.deepEqual(after.products,before.products);assert.deepEqual(after.payments,before.payments);assert.deepEqual(errors,[]);
  writeFileSync(output+'/review.json',JSON.stringify({checkedAt:new Date().toISOString(),environment:'Compiled production build; isolated fictional demo database',layouts,accessibilityScans:5,runtimeErrors:errors,ledgerUnchanged:true},null,2)+'\n');console.log(JSON.stringify({layouts:layouts.length,accessibilityScans:5,ledgerUnchanged:true,runtimeErrors:errors}));
}finally{await browser?.close();server.kill('SIGTERM');}
