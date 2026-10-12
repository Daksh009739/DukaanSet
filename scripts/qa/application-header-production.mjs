import {spawn} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import {mkdirSync,writeFileSync} from 'node:fs';
import {chromium,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';

const origin='http://127.0.0.1:3002',output='.local/qa-header-production';mkdirSync(output,{recursive:true});
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3002'],{env:{...process.env,NODE_ENV:'production',DUKAANSET_ENV:'local',DATABASE_PATH:'.data/header-production-'+randomUUID()+'.sqlite',AUTH_BASE_URL:origin,AUTH_EMAIL_MODE:'file',AI_PROVIDER:'',VOICE_STT_PROVIDER:'',VOICE_TTS_PROVIDER:'',DUKAANSET_MEDIA_WORKER:'0',DUKAANSET_CLOSING_WORKER:'0'},windowsHide:true,stdio:['ignore','pipe','pipe']});
let ready=false,failed=false,browser;server.on('error',()=>{failed=true;});server.on('exit',()=>{failed=true;});server.stdout.on('data',data=>{if(String(data).includes('Ready in'))ready=true;});server.stderr.on('data',data=>{if(String(data).includes('Error'))process.stderr.write(data);});
const report={checkedAt:new Date().toISOString(),environment:'Compiled application; isolated fictional shops',layouts:[],accessibilityScans:0,runtimeErrors:[],cspViolations:[],ledgerUnchanged:false};
try {
 let healthy=false;for(let attempt=0;attempt<60;attempt++){if(failed)throw Error('Could not own verification port 3002');try{if(ready&&(await fetch(origin+'/api/health')).ok){healthy=true;break;}}catch{}await new Promise(resolve=>setTimeout(resolve,500));}assert.ok(healthy);
 browser=await chromium.launch({channel:process.platform==='win32'?'msedge':undefined,headless:true});const context=await browser.newContext({baseURL:origin}),page=await context.newPage();page.on('pageerror',error=>report.runtimeErrors.push(error.message));await context.addInitScript(()=>{window.headerCsp=[];document.addEventListener('securitypolicyviolation',event=>window.headerCsp.push({directive:event.violatedDirective,blocked:event.blockedURI}));});
 const post=(path,data)=>context.request.post('/api'+path,{headers:{Origin:origin},data}),get=async path=>{const response=await context.request.get('/api'+path);assert.ok(response.ok(),path);return response.json();};assert.equal((await post('/auth/demo',{language:'en'})).status(),201);const session=await get('/session'),id=session.businesses[0].id,before=await get(`/businesses/${id}/state`);
 for(const language of ['en','hi','hinglish']) {
  assert.equal((await post('/account/language',{language})).status(),200);
  for(const route of ['/app','/app/stock']) {
   await page.goto(route);await expect(page.locator('main')).toHaveAttribute('data-business-id',id);await page.evaluate(()=>document.fonts.ready);const header=page.getByTestId('app-header');await expect(header.locator('.profile-name')).toHaveText(session.user.name);await expect(header.locator('#business-select')).toHaveValue(id);
   for(const width of [320,390,768,1100,1440,1920]) {
    await page.setViewportSize({width,height:1000});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));const bounds=await header.boundingBox();
    for(const selector of ['.global-search-trigger','.notification-button','.language-picker','.business-select','.voiceos-launcher','.reference-menu','.mobile-only','.reference-mobile-logo']){const control=header.locator(selector);if(!await control.isVisible())continue;const box=await control.boundingBox();assert.ok(box.x>=bounds.x-1&&box.x+box.width<=bounds.x+bounds.width+1&&box.y+box.height<=bounds.y+bounds.height+1,`${language} ${route} ${width} ${selector}`);}
    if(width===390||width===1440){const scan=await new AxeBuilder({page}).include('.workspace').withTags(['wcag2a','wcag2aa']).analyze();assert.deepEqual(scan.violations,[],`${language} ${route} ${width}`);report.accessibilityScans++;if(language==='en')await header.screenshot({path:`${output}/header-${route==='/app'?'dashboard':'stock'}-${width}.png`});}report.layouts.push({language,route,width});
   }
   report.cspViolations.push(...await page.evaluate(()=>window.headerCsp));
  }
 }
 const after=await get(`/businesses/${id}/state`);for(const key of ['invoices','payments','movements','products','purchases','expenses'])assert.deepEqual(after[key],before[key]);report.ledgerUnchanged=true;assert.deepEqual(report.runtimeErrors,[]);assert.deepEqual(report.cspViolations,[]);console.log(JSON.stringify({layouts:report.layouts.length,accessibilityScans:report.accessibilityScans,ledgerUnchanged:true,runtimeErrors:0,cspViolations:0}));
} finally {writeFileSync(output+'/REPORT.json',JSON.stringify(report,null,2)+'\n');await browser?.close();server.kill();}
