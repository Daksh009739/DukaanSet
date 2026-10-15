import {test,expect,type Page,type Locator} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {mkdirSync,writeFileSync} from 'node:fs';
import type {Session,Language} from '../../src/lib/contracts';
import type {V3State} from '../../src/lib/v3-contracts';
import {text} from '../../src/lib/locale';
import {messages} from '../../src/locales/registry';

const origin='http://127.0.0.1:3001',output='.local/qa-workspace-overlays';mkdirSync(output,{recursive:true});
const post=(page:Page,path:string,data:unknown)=>page.request.post('/api'+path,{headers:{Origin:origin},data});
const getState=async(page:Page,id:string):Promise<V3State>=>(await page.request.get('/api/businesses/'+id+'/state')).json();
const w=(language:Language,key:string)=>text(language,'workspace',key);
async function setup(page:Page){expect((await post(page,'/auth/demo',{language:'en'})).status()).toBe(201);const session:Session=await(await page.request.get('/api/session')).json(),shop=session.businesses.find(b=>b.category==='hardware')!;await page.goto('/app');await page.locator('#hero-business').selectOption(shop.id);await expect(page.locator('main')).toHaveAttribute('data-business-id',shop.id);return{shop,state:await getState(page,shop.id)};}
async function noOverflow(page:Page,dialog?:Locator){expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);if(dialog){expect(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);const box=await dialog.boundingBox(),viewport=page.viewportSize()!;expect(box).not.toBeNull();expect(box!.x).toBeGreaterThanOrEqual(-1);expect(box!.y).toBeGreaterThanOrEqual(-1);expect(box!.x+box!.width).toBeLessThanOrEqual(viewport.width+1);expect(box!.y+box!.height).toBeLessThanOrEqual(viewport.height+1);}}

test('workspace search supports shortcuts, real records, clearing and restored focus',async({page})=>{
  const f=await setup(page),trigger=page.locator('.global-search-trigger'),dialog=page.getByRole('dialog');await trigger.focus();await page.keyboard.press('Control+k');const input=dialog.getByRole('searchbox',{name:w('en','globalSearchHint'),exact:true});await expect(input).toBeFocused();await expect(dialog.getByRole('combobox')).toHaveCount(0);await expect(dialog.getByRole('link')).toHaveCount(3);
  const product=f.state.products.find(p=>p.sku)!;await input.fill(product.sku);const productLink=dialog.getByRole('link').filter({hasText:product.name});await expect(productLink).toBeVisible();await productLink.press('Enter');await expect(page).toHaveURL('/app/stock/'+product.id);await expect(dialog).toBeHidden();
  await trigger.click();await input.fill(f.state.customers[0].phone);const customerLink=dialog.locator(`a[href="/app/customers/${f.state.customers[0].id}"]`);await expect(customerLink).toBeVisible();await customerLink.click();await expect(page).toHaveURL('/app/customers/'+f.state.customers[0].id);
  await trigger.click();await input.fill(f.state.invoices[0].number);const invoiceLink=dialog.locator(`a[href="/app/sales/${f.state.invoices[0].id}"]`);await expect(invoiceLink).toBeVisible();await invoiceLink.click();await expect(page).toHaveURL('/app/sales/'+f.state.invoices[0].id);
  await trigger.click();await input.fill('zz-no-such-product-zz');await expect(dialog.getByRole('heading',{name:messages.en.translation.noResults,exact:true})).toBeVisible();await dialog.getByRole('button',{name:w('en','overlays.clearSearch'),exact:true}).click();await expect(input).toHaveValue('');await expect(input).toBeFocused();await page.keyboard.press('Escape');await expect(dialog).toBeHidden();await expect(trigger).toBeFocused();const after=await getState(page,f.shop.id);expect(after.invoices).toEqual(f.state.invoices);expect(after.products).toEqual(f.state.products);expect(after.payments).toEqual(f.state.payments);
});

test('updates filters preserve counts and open the actual stock or customer record',async({page})=>{
  const f=await setup(page),trigger=page.locator('.notification-button'),dialog=page.getByRole('dialog'),tasks=f.state.tasks.filter(task=>task.type==='credit'?f.state.configuration.notificationPreferences.credit:task.type==='demand'?f.state.configuration.notificationPreferences.demand:f.state.configuration.notificationPreferences.stock),notices=f.state.closing?.notices||[];
  await trigger.click();await expect(dialog.getByRole('combobox')).toHaveCount(0);await expect(dialog.locator('li')).toHaveCount(tasks.length+notices.length);
  await dialog.getByRole('button',{name:new RegExp('^'+messages.en.translation.stock+'\\s')}).click();await expect(dialog.locator('li')).toHaveCount(tasks.filter(task=>['stock','expiry'].includes(task.type)).length);
  await dialog.getByRole('button',{name:new RegExp('^'+messages.en.translation.payments+'\\s')}).click();await expect(dialog.locator('li')).toHaveCount(tasks.filter(task=>task.type==='credit').length);const selected=dialog.locator('li a').first(),href=await selected.getAttribute('href');await selected.press('Enter');await expect(page).toHaveURL(href!);await expect(dialog).toBeHidden();
  await trigger.click();await expect(dialog.locator('li')).toHaveCount(tasks.length+notices.length);await dialog.getByRole('button',{name:new RegExp('^'+w('en','overlays.otherUpdates')+'\\s')}).click();await expect(dialog.locator('li')).toHaveCount(tasks.filter(task=>task.type==='demand').length+notices.length);await page.keyboard.press('Escape');await expect(trigger).toBeFocused();expect((await getState(page,f.shop.id)).payments).toEqual(f.state.payments);
});

test('hero and overlays remain readable, accessible and usable in all display languages',async({page})=>{
  test.setTimeout(180000);const f=await setup(page),report:{language:string;section:string;width:number}[]=[],errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/api/businesses/*/weather',route=>route.fulfill({json:{status:'unavailable',reason:'location'}}));
  for(const language of ['en','hi','hinglish'] as const){expect((await post(page,'/account/language',{language})).status()).toBe(200);await page.reload();await expect(page.locator('.hero-weather a')).toHaveAttribute('href','/app/settings/shop');const voice=messages[language].voiceos;
    for(const width of [320,390,600,768,1024,1142,1440,1920]){await page.setViewportSize({width,height:900});await noOverflow(page);for(const selector of ['.hero-date','.hero-weather','.hero-voice']){const element=page.locator(selector);expect(await element.evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);}report.push({language,section:'hero',width});}
    for(const section of ['search','updates','voice']){await page.setViewportSize({width:1440,height:900});if(section==='search')await page.locator('.global-search-trigger').click();else if(section==='updates')await page.locator('.notification-button').click();else await page.getByRole('button',{name:voice.open,exact:true}).click();const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();
      for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:900});await page.evaluate(()=>document.fonts.ready);await noOverflow(page,dialog);report.push({language,section,width});if(width===390||width===1440){expect((await new AxeBuilder({page}).include('[role="dialog"]').withTags(['wcag2a','wcag2aa']).analyze()).violations).toEqual([]);await page.screenshot({path:`${output}/${section}-${language}-${width}.png`});}}
      if(section==='voice'){await dialog.getByLabel(voice.command,{exact:true}).fill('Show today sales');await dialog.getByLabel(voice.command,{exact:true}).press('Enter');await expect(dialog.locator('.voiceos-answer')).toBeVisible();}
      await page.keyboard.press('Escape');await expect(dialog).toBeHidden();
    }
    await page.setViewportSize({width:1440,height:900});await page.screenshot({path:`${output}/hero-${language}-1440.png`});await page.setViewportSize({width:390,height:900});await page.screenshot({path:`${output}/hero-${language}-390.png`});await page.locator('.hero-weather a').click();await expect(page).toHaveURL('/app/settings/shop');await page.goto('/app');
  }
  const after=await getState(page,f.shop.id);expect(after.invoices).toEqual(f.state.invoices);expect(after.products).toEqual(f.state.products);expect(after.payments).toEqual(f.state.payments);expect(errors).toEqual([]);writeFileSync(output+'/report.json',JSON.stringify({layouts:report,accessibilityScans:18,runtimeErrors:errors,readOnly:true},null,2)+'\n');
});
