import {spawn} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {chromium,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';

const origin='http://127.0.0.1:3002',output='.local/qa-insight-production';mkdirSync(output,{recursive:true});
const copy=Object.fromEntries(['en','hi','hinglish'].map(language=>[language,JSON.parse(readFileSync(`src/locales/${language}/workspace.json`,'utf8'))]));
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3002'],{env:{...process.env,NODE_ENV:'production',DUKAANSET_ENV:'local',DATABASE_PATH:'.data/insight-production-'+randomUUID()+'.sqlite',AUTH_BASE_URL:origin,AUTH_EMAIL_MODE:'file',AI_PROVIDER:'',VOICE_STT_PROVIDER:'',VOICE_TTS_PROVIDER:'',DUKAANSET_MEDIA_WORKER:'0',DUKAANSET_CLOSING_WORKER:'0'},windowsHide:true,stdio:['ignore','pipe','pipe']});
let ready=false,failed=false,browser;
server.on('error',()=>{failed=true;});server.on('exit',()=>{failed=true;});server.stdout.on('data',data=>{if(String(data).includes('Ready in'))ready=true;});server.stderr.on('data',data=>{if(String(data).includes('Error'))process.stderr.write(data);});
const report={checkedAt:new Date().toISOString(),environment:'Compiled production build; isolated fictional demo; stock and ledger read-only during layout checks',layouts:[],accessibilityScans:0,runtimeErrors:[],cspViolations:[],ledgerUnchanged:false};
try {
  let healthy=false;for(let attempt=0;attempt<60;attempt++){if(failed)throw Error('Could not own verification port 3002');try{if(ready&&(await fetch(origin+'/api/health')).ok){healthy=true;break;}}catch{}await new Promise(resolve=>setTimeout(resolve,500));}assert.ok(healthy);
  browser=await chromium.launch({channel:process.platform==='win32'?'msedge':undefined,headless:true});const context=await browser.newContext({baseURL:origin}),page=await context.newPage();page.on('pageerror',error=>report.runtimeErrors.push(error.message));
  await context.addInitScript(()=>{window.insightCsp=[];document.addEventListener('securitypolicyviolation',event=>window.insightCsp.push({directive:event.violatedDirective,blocked:event.blockedURI}));});
  const post=(path,data)=>context.request.post('/api'+path,{headers:{Origin:origin},data}),get=async path=>{const response=await context.request.get('/api'+path);assert.ok(response.ok(),path);return response.json();};
  assert.equal((await post('/auth/demo',{language:'en'})).status(),201);const session=await get('/session'),id=session.businesses[0].id,before=await get(`/businesses/${id}/state`);
  const fit=async(view,language,width,dialog=false)=>{assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${view} ${language} ${width}`);if(dialog){const geometry=await page.getByRole('dialog',{name:copy[language].profileMenu}).evaluate(el=>{const box=el.getBoundingClientRect();return{left:box.left,right:box.right,height:box.height,viewport:innerHeight};});assert.ok(geometry.left>=0&&geometry.right<=width&&geometry.height<=geometry.viewport);}if(width!==320){const result=await new AxeBuilder({page}).include(dialog?'[role="dialog"]':'.workspace').withTags(['wcag2a','wcag2aa']).analyze();assert.deepEqual(result.violations,[],`${view} ${language} ${width}`);report.accessibilityScans++;if(language==='en')await page.screenshot({path:`${output}/${view}-${width}.png`,fullPage:!dialog});}report.cspViolations.push(...await page.evaluate(()=>window.insightCsp));report.layouts.push({view,language,width});};
  for(const language of ['en','hi','hinglish']) {
    assert.equal((await post('/account/language',{language})).status(),200);
    for(const view of ['demand','reports','daily-closing','intelligence','todays-work','help']) {
      await page.goto('/app/'+view);await expect(page.locator('main h1')).toBeVisible();if(view==='intelligence')await expect(page.locator('.intelligence-panel h3').first()).toBeVisible();await page.evaluate(()=>document.fonts.ready);
      for(const width of [320,390,1440]){await page.setViewportSize({width,height:1000});await fit(view,language,width);}
    }
    for(const width of [320,390,1440]) {
      await page.setViewportSize({width,height:1000});let trigger;
      if(width<800){const primary=page.locator('.app-header .reference-menu');trigger=await primary.isVisible()?primary:page.locator('.app-header .mobile-only');await trigger.click();await page.getByRole('dialog',{name:copy[language].sidebar.navigation}).getByRole('button',{name:copy[language].sidebar.profileActions,exact:true}).click();}else{trigger=page.locator('.profile-menu-trigger');await trigger.click();}
      await expect(page.getByRole('dialog',{name:copy[language].profileMenu})).toBeVisible();await fit('account',language,width,true);await page.keyboard.press('Escape');await expect(trigger).toBeFocused();
    }
  }
  const ledger=state=>({invoices:state.invoices,payments:state.payments,movements:state.movements,expenses:state.expenses,purchases:state.purchases,requests:state.demand.requestsList});assert.deepEqual(ledger(await get(`/businesses/${id}/state`)),ledger(before));report.ledgerUnchanged=true;assert.deepEqual(report.runtimeErrors,[]);assert.deepEqual(report.cspViolations,[]);
  console.log(JSON.stringify({layouts:report.layouts.length,accessibilityScans:report.accessibilityScans,ledgerUnchanged:true,runtimeErrors:0,cspViolations:0}));
} finally {writeFileSync(output+'/REPORT.json',JSON.stringify(report,null,2)+'\n');await browser?.close();server.kill();}
