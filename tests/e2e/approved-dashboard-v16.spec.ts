import {test,expect,type Page} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {mkdirSync,writeFileSync} from 'node:fs';
import type {Language,Session} from '../../src/lib/contracts';
import {text} from '../../src/lib/locale';
import {money} from '../../src/lib/client';
const origin='http://127.0.0.1:3001',output='.local/qa-v16';mkdirSync(output,{recursive:true});
const post=(page:Page,path:string,data:unknown)=>page.request.post('/api'+path,{headers:{Origin:origin},data});
async function setup(page:Page){expect((await post(page,'/auth/demo',{language:'en',scenario:'closing'})).status()).toBe(201);const session:Session=await(await page.request.get('/api/session')).json();await page.goto('/app');await expect(page.locator('.reference-hero')).toBeVisible();return {session,id:session.businesses[0].id};}
const state=async(page:Page,id:string)=>(await page.request.get('/api/businesses/'+id+'/state')).json();

test('approved actions open existing workflows, chart selection and keyboard VoiceOS leave records unchanged',async({page})=>{
 const f=await setup(page),before=await state(page,f.id),actions=page.locator('.dashboard-quick-actions');
 await expect(page.locator('.dashboard-metrics .summary-metric')).toHaveCount(4);
 await expect(page.locator('.summary-metric.cash dd')).toHaveText(money(before.daily.cashPaise));
 await expect(page.locator('.summary-metric.bills dd')).toHaveText(String(before.dashboard.totalBills));
 await expect(page.locator('.summary-metric.dues dd')).toHaveText(money(before.metrics.outstandingPaise));
 for(const [button,heading]of [['Add product','Add product'],['Add customer','Add customer'],['Record Payment','Add payment'],['Add Purchase','Receive purchase']]){await actions.getByRole('button',{name:new RegExp('^'+button)}).click();await expect(page.getByRole('dialog').getByRole('heading',{name:heading,exact:true})).toBeVisible();await page.getByRole('dialog').getByRole('button',{name:'Close',exact:true}).click();}
 await actions.getByRole('link',{name:/^New Sale/}).click();await expect(page).toHaveURL(/\/app\/sales\/new$/);await page.goto('/app');await page.getByLabel('Chart period',{exact:true}).selectOption('year');await expect(page.locator('.chart-bars button')).toHaveCount(12);await page.getByLabel('Chart period',{exact:true}).selectOption('week');await page.locator('.chart-bars button').last().focus();await expect(page.locator('.chart-tooltip')).toHaveText(money(before.dashboard.sales.week.at(-1).salesPaise));
 await page.locator('.hero-voice').focus();await page.keyboard.press('Enter');const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();await dialog.getByLabel('Voice command',{exact:true}).fill('aaj ki sales batao');await dialog.getByRole('button',{name:'Review request',exact:true}).click();await expect(dialog.locator('.voiceos-answer')).toContainText(money(before.metrics.salesTodayPaise));await dialog.getByRole('button',{name:'Close',exact:true}).click();
 const after=await state(page,f.id);for(const key of ['products','customers','invoices','payments','movements','purchases','metrics'])expect(after[key]).toEqual(before[key]);
});

test('weather failures do not block finances; membership scopes weather and business switching',async({page})=>{
 const f=await setup(page);expect((await page.request.get('/api/businesses/'+crypto.randomUUID()+'/weather')).status()).toBe(404);
 await page.route('**/api/businesses/*/weather',route=>route.fulfill({status:200,json:{status:'unavailable',reason:'provider'}}));await page.reload();await expect(page.locator('.hero-weather')).toContainText('Weather unavailable');await expect(page.locator('.summary-metric.sales dd')).toHaveText(money((await state(page,f.id)).metrics.salesTodayPaise));
 await page.route('**/api/businesses/*/weather',route=>route.fulfill({status:200,json:{status:'ready',temperatureC:24,condition:'clear',city:'Delhi',observedAt:new Date().toISOString(),source:'openweather'}}));await page.reload();await expect(page.locator('.hero-weather')).toContainText('24°C');await expect(page.locator('.hero-weather')).toContainText('Delhi');
 const other=await(await post(page,'/businesses',{name:'Second Weather QA',category:'grocery'})).json();await page.reload();await page.locator('#hero-business').selectOption(other.id);await expect(page.locator('.summary-metric.bills dd')).toHaveText('0');await expect(page.locator('.dashboard-recent')).toContainText('Your first bill starts here');
 await page.unrouteAll();await page.reload();await expect(page.locator('.hero-weather')).toContainText('Set shop city');
});

for(const language of ['en','hi','hinglish'] as Language[])test('approved reference fits ten viewport widths with accessible '+language+' controls',async({page})=>{
 test.setTimeout(180000);await setup(page);await post(page,'/account/language',{language});await page.reload();await expect(page.locator('.reference-hero')).toBeVisible();await page.emulateMedia({reducedMotion:'reduce'});const errors:string[]=[],layouts:unknown[]=[];page.on('pageerror',e=>errors.push(e.message));
 for(const width of [320,360,375,390,412,430,768,1024,1440,1920]){await page.setViewportSize({width,height:width<600?844:1000});await page.evaluate(()=>document.fonts.ready);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),String(width)).toBe(true);await expect(page.locator('.hero-voice')).toHaveCount(1);await expect(page.getByTestId('contextual-voice-hero')).toHaveCount(0);const hero=(await page.locator('.reference-hero').boundingBox())!,voice=(await page.locator('.hero-voice').boundingBox())!;expect(voice.y).toBeGreaterThan(hero.y);expect(voice.x+voice.width).toBeLessThanOrEqual(width);if(width<600){await expect(page.locator('.quick-more')).toBeVisible();await expect(page.locator('.bottom-nav a')).toHaveCount(4);expect(voice.width).toBeGreaterThan(width*.8);}else if(width>1024){await expect(page.locator('.quick-more')).toBeHidden();expect(voice.x).toBeGreaterThan(width*.65);}
  expect((await new AxeBuilder({page}).include('.reference-dashboard').withTags(['wcag2a','wcag2aa']).analyze()).violations).toEqual([]);await page.screenshot({path:output+'/dashboard-'+language+'-'+width+'.png'});layouts.push({width,hero,voice});}
 await page.emulateMedia({media:'print'});await expect(page.locator('.hero-voice')).toBeHidden();expect(errors).toEqual([]);writeFileSync(output+'/layouts-'+language+'.json',JSON.stringify({language,layouts,errors},null,2));
 await page.emulateMedia({media:'screen'});await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:text(language,'workspace','profileMenu'),exact:true}).click();await page.getByRole('dialog').getByLabel(text(language,'translation','language'),{exact:true}).selectOption('en');await expect(page.locator('html')).toHaveAttribute('lang','en');
});
