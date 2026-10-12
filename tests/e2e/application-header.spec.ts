import {test,expect,type Page} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {mkdirSync,writeFileSync} from 'node:fs';
import type {Session,Language} from '../../src/lib/contracts';
import type {V3State} from '../../src/lib/v3-contracts';
import {messages} from '../../src/locales/registry';

const origin='http://127.0.0.1:3001',output='.local/qa-application-header';mkdirSync(output,{recursive:true});
const post=(page:Page,path:string,data:unknown)=>page.request.post('/api'+path,{headers:{Origin:origin},data});
async function setup(page:Page){expect((await post(page,'/auth/demo',{language:'en'})).status()).toBe(201);const session:Session=await(await page.request.get('/api/session')).json();await page.goto('/app');await expect(page.locator('main')).toHaveAttribute('data-business-id',session.businesses[0].id);await expect(page.locator('.global-search-trigger')).toBeEnabled();return{session,state:await(await page.request.get(`/api/businesses/${session.businesses[0].id}/state`)).json() as V3State};}

test('premium header retains keyboard search, updates, language, account and actual shop switching',async({page})=>{
 test.setTimeout(90000);const {session,state}=await setup(page),header=page.getByTestId('app-header'),search=header.locator('.global-search-trigger');await expect(header.locator('.profile-name')).toHaveText(session.user.name);await expect(header.locator('#business-select')).toHaveValue(state.business.id);
 await search.focus();await page.keyboard.press('Control+k');const dialog=page.getByRole('dialog'),input=dialog.getByRole('searchbox');await expect(input).toBeFocused();await input.fill(state.products[0].sku);await expect(dialog.locator(`a[href="/app/stock/${state.products[0].id}"]`)).toBeVisible();await page.keyboard.press('Escape');await expect(search).toBeFocused();
 const updates=header.locator('.notification-button');await updates.click();await expect(page.getByRole('dialog',{name:messages.en.translation.notification})).toBeVisible();await page.keyboard.press('Escape');await expect(updates).toBeFocused();
 await header.getByRole('combobox',{name:messages.en.translation.language,exact:true}).selectOption('hi');await expect(header.getByRole('combobox',{name:messages.hi.translation.language,exact:true})).toHaveValue('hi');expect((await(await page.request.get('/api/session')).json()).user.language).toBe('hi');
 const next=session.businesses[1];await header.locator('#business-select').selectOption(next.id);await expect(page.locator('main')).toHaveAttribute('data-business-id',next.id);await expect(header.locator('.profile-name')).toHaveText(session.user.name);await expect(header.locator('#business-select')).toHaveValue(next.id);
 const profile=header.locator('.profile-menu-trigger');await profile.click();const account=page.getByRole('dialog',{name:messages.hi.workspace.profileMenu});await expect(account.getByText(next.name,{exact:true})).toBeVisible();await page.keyboard.press('Escape');await expect(profile).toBeFocused();
 const after:V3State=await(await page.request.get(`/api/businesses/${state.business.id}/state`)).json();for(const key of ['invoices','payments','movements','products']as const)expect(after[key]).toEqual(state[key]);
});

test('header controls fit dashboard and detail-page layouts in all three languages',async({page})=>{
 test.setTimeout(180000);await setup(page);const checks:{language:Language;route:string;width:number}[]=[],errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 for(const language of ['en','hi','hinglish']as Language[]){expect((await post(page,'/account/language',{language})).status()).toBe(200);for(const route of ['/app','/app/stock']){await page.goto(route);await expect(page.locator('main h1').first()).toBeVisible();await page.evaluate(()=>document.fonts.ready);for(const width of [320,390,768,1100,1440,1920]){await page.setViewportSize({width,height:1000});await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);const header=page.getByTestId('app-header');const bounds=await header.boundingBox();for(const selector of ['.global-search-trigger','.notification-button','.language-picker','.business-select','.voiceos-launcher','.reference-menu','.mobile-only','.reference-mobile-logo']){const element=header.locator(selector);if(!await element.isVisible())continue;const box=await element.boundingBox();expect(box!.x,`${language} ${route} ${width} ${selector}`).toBeGreaterThanOrEqual(bounds!.x-1);expect(box!.x+box!.width).toBeLessThanOrEqual(bounds!.x+bounds!.width+1);expect(box!.y+box!.height).toBeLessThanOrEqual(bounds!.y+bounds!.height+1);}if(width===390||width===1440){expect((await new AxeBuilder({page}).include('.workspace').withTags(['wcag2a','wcag2aa']).analyze()).violations).toEqual([]);if(language==='en')await header.screenshot({path:`${output}/header-${route==='/app'?'dashboard':'stock'}-${width}.png`});}checks.push({language,route,width});}}}
 expect(errors).toEqual([]);writeFileSync(output+'/layouts.json',JSON.stringify({checks,accessibilityScans:12,runtimeErrors:errors},null,2));
});
