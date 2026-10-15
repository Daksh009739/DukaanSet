import {spawn} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import {mkdirSync,writeFileSync} from 'node:fs';
import {chromium,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';

const origin='http://127.0.0.1:3002',output='.local/qa-dashboard-cards';mkdirSync(output,{recursive:true});
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3002'],{env:{...process.env,NODE_ENV:'production',DUKAANSET_ENV:'local',DATABASE_PATH:'.data/dashboard-cards-'+randomUUID()+'.sqlite',AUTH_BASE_URL:origin,AUTH_EMAIL_MODE:'file',AI_PROVIDER:'',VOICE_STT_PROVIDER:'',VOICE_TTS_PROVIDER:'',DUKAANSET_MEDIA_WORKER:'0',DUKAANSET_CLOSING_WORKER:'0'},windowsHide:true,stdio:['ignore','pipe','pipe']});
let ready=false,failed=false,browser;server.on('error',()=>{failed=true;});server.on('exit',()=>{failed=true;});server.stdout.on('data',data=>{if(String(data).includes('Ready in'))ready=true;});server.stderr.on('data',data=>{if(String(data).includes('Error'))process.stderr.write(data);});
const report={checkedAt:new Date().toISOString(),environment:'Compiled application with isolated fictional shops',layouts:[],accessibilityScans:0,runtimeErrors:[],cspViolations:[],ledgerUnchanged:false};
try {
 let healthy=false;for(let attempt=0;attempt<60;attempt++){if(failed)throw Error('Could not own verification port 3002');try{if(ready&&(await fetch(origin+'/api/health')).ok){healthy=true;break;}}catch{}await new Promise(resolve=>setTimeout(resolve,500));}assert.ok(healthy);
 browser=await chromium.launch({channel:process.platform==='win32'?'msedge':undefined,headless:true});const context=await browser.newContext({baseURL:origin}),page=await context.newPage();page.on('pageerror',error=>report.runtimeErrors.push(error.message));await context.addInitScript(()=>{window.cardCsp=[];document.addEventListener('securitypolicyviolation',event=>window.cardCsp.push({directive:event.violatedDirective,blocked:event.blockedURI}));});
 const post=(path,data)=>context.request.post('/api'+path,{headers:{Origin:origin},data}),get=async path=>{const response=await context.request.get('/api'+path);assert.ok(response.ok(),path);return response.json();};assert.equal((await post('/auth/demo',{language:'en'})).status(),201);const session=await get('/session'),id=session.businesses[0].id,before=await get(`/businesses/${id}/state`),cash=value=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(value/100);
 for(const language of ['en','hi','hinglish']) {
  assert.equal((await post('/account/language',{language})).status(),200);await page.goto('/app');await expect(page.locator('.dashboard-metrics')).toBeVisible();await page.evaluate(()=>document.fonts.ready);
  for(const [tone,value]of [['sales',before.metrics.salesTodayPaise],['cash',before.daily.cashPaise],['dues',before.metrics.outstandingPaise]])await expect(page.locator(`.dashboard-metrics .${tone} dd`)).toHaveText(cash(value));await expect(page.locator('.dashboard-metrics .bills dd')).toHaveText(String(before.dashboard.totalBills));
  for(const width of [320,390,768,1440,1920]) {
   await page.setViewportSize({width,height:1000});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${language} ${width}`);await expect(page.locator('[data-action="sale"] b')).toHaveCSS('color','rgb(255, 255, 255)');
   const palettes=await page.locator('.dashboard-metrics .summary-metric').evaluateAll(elements=>elements.map(el=>getComputedStyle(el).backgroundColor));assert.equal(new Set(palettes).size,4);
   if(width===390||width===1440){const scan=await new AxeBuilder({page}).include('.workspace').withTags(['wcag2a','wcag2aa']).analyze();assert.deepEqual(scan.violations,[],`${language} ${width}`);report.accessibilityScans++;if(language==='en'){const a=await page.locator('.dashboard-quick-actions').boundingBox(),b=await page.locator('.dashboard-metrics').boundingBox(),x=Math.min(a.x,b.x),y=Math.min(a.y,b.y);await page.screenshot({path:`${output}/dashboard-cards-${width}.png`,clip:{x,y,width:Math.max(a.x+a.width,b.x+b.width)-x,height:Math.max(a.y+a.height,b.y+b.height)-y}});}}
   report.layouts.push({language,width});
  }
  report.cspViolations.push(...await page.evaluate(()=>window.cardCsp));
 }
 const after=await get(`/businesses/${id}/state`);for(const key of ['invoices','payments','movements','products','purchases','expenses'])assert.deepEqual(after[key],before[key]);report.ledgerUnchanged=true;assert.deepEqual(report.runtimeErrors,[]);assert.deepEqual(report.cspViolations,[]);console.log(JSON.stringify({layouts:report.layouts.length,accessibilityScans:report.accessibilityScans,ledgerUnchanged:true,runtimeErrors:0,cspViolations:0}));
} finally {writeFileSync(output+'/REPORT.json',JSON.stringify(report,null,2)+'\n');await browser?.close();server.kill();}
