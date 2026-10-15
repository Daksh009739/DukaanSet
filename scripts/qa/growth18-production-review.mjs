import {spawn,spawnSync} from 'node:child_process';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import {chromium,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
const origin='http://127.0.0.1:3005',output='.local/qa/growth18';
mkdirSync(output,{recursive:true});
const env={...process.env,NODE_ENV:'production',DUKAANSET_ENV:'local',DATABASE_PATH:'.data/growth18-qa-'+randomUUID()+'.sqlite',AUTH_BASE_URL:origin,DUKAANSET_MEDIA_WORKER:'0',DUKAANSET_CLOSING_WORKER:'0',DUKAANSET_UPI_WORKER:'0',AI_PROVIDER:'',VOICE_STT_PROVIDER:'',VOICE_TTS_PROVIDER:'',RAZORPAY_CLIENT_ID:'',RAZORPAY_CLIENT_SECRET:''};
const seed=spawnSync(process.execPath,['--import','tsx','scripts/qa/growth18-seed.ts'],{env,encoding:'utf8',windowsHide:true});
if(seed.status!==0)throw Error(seed.stderr);
const records=JSON.parse(readFileSync(output+'/seeds.json','utf8'));
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3005'],{env,windowsHide:true,stdio:['ignore','pipe','pipe']});
let ready=false,failed=false,browser;
server.stdout.on('data',b=>{if(String(b).includes('Ready in'))ready=true;});server.on('exit',()=>failed=true);server.stderr.on('data',b=>process.stderr.write(b));
const report={checkedAt:new Date().toISOString(),compiledApplication:true,isolatedDatabase:true,realMicrophone:false,layouts:[],accessibility:[],workflows:[],limitations:['Microphone input uses browser speech API availability/fallback; physical desktop and Android recording is not asserted.','No subscription checkout or backup agent is configured; UI reports these states explicitly.']};
try{
 for(let i=0;i<80&&!ready;i++){if(failed)throw Error('QA server failed');await new Promise(r=>setTimeout(r,500));}assert.ok(ready);
 browser=await chromium.launch({channel:process.platform==='win32'?'msedge':undefined,headless:true});
 for(const record of records){
  const {language,business}=record,g=JSON.parse(readFileSync('src/locales/'+language+'/workspace.json','utf8')).growth,common=JSON.parse(readFileSync('src/locales/'+language+'/common.json','utf8'));
  const context=await browser.newContext({baseURL:origin,viewport:{width:1440,height:1000}}),page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  const post=(path,data)=>context.request.post('/api'+path,{headers:{Origin:origin},data});
  const get=async path=>{const r=await context.request.get('/api'+path);assert.ok(r.ok(),path+' '+r.status());return r.json();};
  await context.addCookies([{name:'ds_locale',value:language,url:origin}]);
  await page.goto('/register?lang='+language);const demo=page.getByTestId('voice-quick-demo');await expect(demo).toBeVisible();
  // The isolated demo has no auth or financial write endpoint.
  let demoWrites=0;page.on('request',r=>{if(r.method()==='POST')demoWrites++;});
  const prompt=demo.getByRole('button').filter({hasText:/summary|हिसाब|hisaab/});await prompt.first().click();await expect(demo.locator('[role="status"]')).toContainText(/2,450|२,४५०/);assert.equal(demoWrites,0);assert.equal((await context.request.get('/api/session')).status(),401);
  await page.screenshot({path:output+'/demo-'+language+'-1440.png',fullPage:true});
  assert.ok((await post('/auth/login',{email:record.blankEmail,password:'Growth18-fixture-only-2026'})).ok());
  await page.goto('/onboarding/setup');await expect(page.getByRole('heading',{name:g.setupTitle,exact:true})).toBeVisible();
  await page.getByLabel(g.merchantName,{exact:true}).fill('New Merchant '+language);await page.getByLabel(g.businessName,{exact:true}).fill('New Service '+language);await page.getByLabel(g.categoryQuestion,{exact:true}).selectOption('services');
  await page.getByRole('button',{name:g.openWorkspace,exact:true}).click();await expect(page).toHaveURL(/\/app\/ai\?welcome=1/);await expect(page.getByTestId('ask-my-shop')).toBeVisible();
  const session=await get('/session'),newBusiness=session.businesses[0].id,newState=await get('/businesses/'+newBusiness+'/state');assert.equal(newState.products.length,0);assert.equal(newState.invoices.length,0);assert.equal(session.user.name,'New Merchant '+language);
  assert.ok((await post('/auth/logout',{})).ok());assert.ok((await post('/auth/login',{email:record.email,password:'Growth18-fixture-only-2026'})).ok());
  const before=await get('/businesses/'+business+'/state');
  await page.goto('/app/trust');const trust=page.getByTestId('trust-centre');await expect(trust).toBeVisible();await expect(trust).toContainText(g.backupUnknown);await expect(trust).toContainText(g.proHonesty);
  await context.grantPermissions(['clipboard-read','clipboard-write']);await trust.getByRole('button',{name:g.copyReferral,exact:true}).click();await expect(trust.getByRole('status')).toContainText(g.referralCopied);assert.match(await page.evaluate(()=>navigator.clipboard.readText()),/\/register\?ref=[A-Za-z0-9_-]{24}$/);
  await trust.getByRole('textbox',{name:g.yourFeedback,exact:true}).fill('QA private feedback '+language);await trust.getByRole('button',{name:g.saveFeedback,exact:true}).click();await expect(trust).toContainText(g.feedbackSaved);
  const mode=page.getByTestId('business-mode');await mode.getByLabel(g.categoryQuestion,{exact:true}).selectOption('restaurant');await mode.getByRole('checkbox',{name:g.appointments,exact:true}).check();await mode.getByRole('button',{name:g.saveMode,exact:true}).click();await expect.poll(async()=>(await get('/businesses/'+business+'/business-growth/mode')).category).toBe('restaurant');
  await page.goto('/app/business-tools?kind=order');const tools=page.getByTestId('business-tools');await expect(tools).toBeVisible();const day=(await get('/businesses/'+business+'/business-growth/summary')).day;
  await tools.getByRole('button',{name:g.addRecord,exact:true}).click();let dialog=page.getByRole('dialog',{name:g.addRecord,exact:true});await dialog.getByLabel(g.description,{exact:true}).fill('Lunch order '+language);await dialog.getByLabel(g.localTime,{exact:true}).fill(day+'T10:00');await dialog.getByLabel(g.customer,{exact:true}).selectOption(record.customer);await dialog.getByLabel(g.tableLabel,{exact:true}).fill('Table 4');await dialog.getByRole('checkbox').check();await dialog.getByRole('button',{name:g.saveRecord,exact:true}).click();await expect(dialog).not.toBeVisible();await expect(tools).toContainText('Lunch order '+language);
  const afterOrder=await get('/businesses/'+business+'/state');assert.deepEqual(afterOrder.invoices,before.invoices);assert.deepEqual(afterOrder.payments,before.payments);assert.deepEqual(afterOrder.movements,before.movements);
  await tools.getByRole('button',{name:g.appointments,exact:true}).click();await tools.getByRole('button',{name:g.addRecord,exact:true}).click();dialog=page.getByRole('dialog',{name:g.addRecord,exact:true});await dialog.getByLabel(g.description,{exact:true}).fill('Haircut '+language);await dialog.getByLabel(g.localTime,{exact:true}).fill(day+'T11:00');await dialog.getByLabel(g.customer,{exact:true}).selectOption(record.duplicate);await dialog.getByRole('checkbox').check();await dialog.getByRole('button',{name:g.saveRecord,exact:true}).click();await expect(dialog).not.toBeVisible();await expect(tools).toContainText('Haircut '+language);
  await tools.getByRole('button',{name:g.addRecord,exact:true}).click();dialog=page.getByRole('dialog',{name:g.addRecord,exact:true});await dialog.getByLabel(g.description,{exact:true}).fill('Overlap');await dialog.getByLabel(g.localTime,{exact:true}).fill(day+'T11:15');await dialog.getByRole('checkbox').check();await dialog.getByRole('button',{name:g.saveRecord,exact:true}).click();await expect(dialog.getByRole('alert')).toBeVisible();await page.screenshot({path:output+'/booking-conflict-'+language+'.png'});await page.keyboard.press('Escape');
  await tools.getByRole('button',{name:g.addService,exact:true}).click();dialog=page.getByRole('dialog',{name:g.addService,exact:true});await dialog.getByLabel(g.description,{exact:true}).fill('Repair '+language);await dialog.getByLabel(g.price,{exact:true}).fill('150');await dialog.getByRole('checkbox').check();await dialog.getByRole('button',{name:g.saveRecord,exact:true}).click();await expect(dialog).not.toBeVisible();await expect(tools).toContainText('Repair '+language);
  const service=(await get('/businesses/'+business+'/state')).products.find(p=>p.name==='Repair '+language);assert.equal(service.stockTracked,false);
  await page.goto('/app/stock');await expect(page.getByText(g.serviceItem,{exact:true}).first()).toBeVisible();
  await page.goto('/app/sales/new?product='+service.id);await expect(page.locator('.sale-composer')).toBeVisible().catch(async()=>{await expect(page.getByText('Repair '+language,{exact:true}).first()).toBeVisible();});
  const sale=(await post('/businesses/'+business+'/invoices',{items:[{productId:service.id,quantityMilli:1000}],payments:[{method:'cash',amountPaise:15000}],idempotencyKey:randomUUID()}));assert.ok(sale.ok(),await sale.text());
  await page.goto('/app/ai');await expect(page.getByTestId('ask-my-shop')).toContainText(g.recordedSales);await page.getByTestId('ask-my-shop').getByRole('button',{name:g.askVoice,exact:true}).click();await expect(page.locator('.voiceos-answer').first()).toContainText(g.verifiedUpi);await page.keyboard.press('Escape');
  for(const [route,testid]of [['/app/ai','ask-my-shop'],['/app/business-tools','business-tools'],['/app/trust','trust-centre']]){
   await page.goto(route);await expect(page.getByTestId(testid)).toBeVisible();
   for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:1000});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),route+' '+language+' '+width);report.layouts.push({language,route,width});if(width===390||width===1440)await page.screenshot({path:output+'/'+testid+'-'+language+'-'+width+'.png',fullPage:true});}
   const violations=(await new AxeBuilder({page}).include('[data-testid="'+testid+'"]').withTags(['wcag2a','wcag2aa']).analyze()).violations;assert.deepEqual(violations,[],route+' '+language);report.accessibility.push({language,route,violations:0});
  }
  await page.goto('/app/trust');const download=page.waitForEvent('download');await page.getByRole('button',{name:g.exportData,exact:true}).click();const file=await download,exported=JSON.parse(readFileSync(await file.path(),'utf8'));assert.equal(exported.business_activities.length,2);assert.ok(exported.business_feedback.some(f=>f.body==='QA private feedback '+language));assert.ok(!('upi_authorisations' in exported));
  assert.deepEqual(errors,[]);report.workflows.push({language,isolatedPublicDemo:true,minimalOnboarding:true,zeroSeededRealFinancialData:true,atomicModeChange:true,ordersWithoutFinancialPosting:true,appointmentsAndConflict:true,serviceBilling:true,askMyShopVoice:true,transparentBackupAndPro:true,privateFeedback:true,optionalReferral:true,completeExport:true});await context.close();
 }
 writeFileSync(output+'/production-report.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
}catch(cause){for(const context of browser?.contexts()||[])for(const page of context.pages()){console.error('Failure URL:',page.url());console.error((await page.locator('body').innerText().catch(()=>'' )).slice(0,4000));await page.screenshot({path:output+'/failure.png',fullPage:true}).catch(()=>{});}throw cause;
}finally{await browser?.close();server.kill('SIGTERM');}
