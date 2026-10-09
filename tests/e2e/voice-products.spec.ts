import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync } from 'node:fs';
import type { Session } from '../../src/lib/contracts';
import type { V3State } from '../../src/lib/v3-contracts';
const origin='http://127.0.0.1:3001';
async function setup(page:Page) {
  await page.request.post('/api/auth/demo',{headers:{Origin:origin},data:{}});
  await page.request.post('/api/account/language',{headers:{Origin:origin},data:{language:'en'}});
  const session:Session=await (await page.request.get('/api/session')).json();
  const business=session.businesses.find(item=>item.category==='vegetables')!.id;
  await page.goto('/app');
  await page.getByLabel('Your business',{exact:true}).selectOption(business);
  await page.goto('/app/stock');
  await expect(page.locator('main h1')).toBeVisible();
  return business;
}
async function state(page:Page,id:string):Promise<V3State>{return (await page.request.get(`/api/businesses/${id}/state`)).json();}
async function newRows(page:Page) {
  await page.getByLabel('Your words',{exact:true}).fill('2 kilo dragonfruit aur 10 kilo kiwi');
  await page.getByRole('button',{name:'Review transcript',exact:true}).click();
  await expect(page.getByTestId('voice-row')).toHaveCount(2);
  for(let index=1;index<=2;index++){
    await page.getByTestId('voice-row').nth(index-1).getByRole('button',{name:'Add as new product',exact:true}).click();
    await page.getByLabel(`Selling price (₹) ${index}`,{exact:true}).fill(index===1?'120':'80');
    await page.getByLabel(`Cost price (₹, optional) ${index}`,{exact:true}).fill(index===1?'60':'40');
  }
}
test('voice entry is highlighted at the top; new spoken products and stock save together',async({page})=>{
  const business=await setup(page),before=await state(page,business);
  const entry=page.locator('.stock-voice-entry');
  await expect(entry).toBeVisible();
  expect(await entry.evaluate(el=>el.getBoundingClientRect().top)).toBeLessThan(await page.locator('main h1').evaluate(el=>el.getBoundingClientRect().top));
  await entry.getByRole('link',{name:'Add stock by voice',exact:true}).click();
  await newRows(page);
  expect((await state(page,business)).products.length).toBe(before.products.length);
  await page.reload();
  await expect(page.getByLabel('Product name 1',{exact:true})).toHaveValue('dragonfruit');
  await expect(page.getByLabel('Selling price (₹) 1',{exact:true})).toHaveValue('120');
  await page.getByRole('button',{name:'Confirm & add stock',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Stock added',exact:true})).toBeVisible();
  const after=await state(page,business);
  expect(after.products).toHaveLength(before.products.length+2);
  expect(after.products.find(item=>item.name==='dragonfruit')).toMatchObject({unit:'kg',quantityMilli:2000,pricePaise:12000,costPaise:6000});
  expect(after.products.find(item=>item.name==='kiwi')).toMatchObject({unit:'kg',quantityMilli:10000,pricePaise:8000,costPaise:4000});
  expect(after.inventoryEntries).toHaveLength(before.inventoryEntries.length+1);
  expect(after.totals).toEqual(before.totals);
  await page.goto('/app/stock');await expect(page.getByText('kiwi',{exact:true})).toBeVisible();
  await page.goto('/app/stock/voice');
  await page.getByLabel('Your words',{exact:true}).fill('3 kilo kiwi');
  await page.getByRole('button',{name:'Review transcript',exact:true}).click();
  await expect(page.getByLabel('Product 1',{exact:true})).toHaveValue(after.products.find(item=>item.name==='kiwi')!.id);
  await page.getByRole('button',{name:'Confirm & add stock',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Stock added',exact:true})).toBeVisible();
  expect((await state(page,business)).products).toHaveLength(after.products.length);
  expect((await state(page,business)).products.find(item=>item.name==='kiwi')!.quantityMilli).toBe(13000);
  await page.getByLabel('Your words',{exact:true}).fill('3 kilo adrak');
  await page.getByRole('button',{name:'Review transcript',exact:true}).click();
  const ginger=after.products.find(item=>item.name==='Ginger')!;
    await page.evaluate(id=>{const key=Object.keys(sessionStorage).find(key=>key.startsWith('ds-voice-draft-')&&key.endsWith(id))!;const draft=JSON.parse(sessionStorage.getItem(key)!);draft.rows[0].productId='';draft.rows[0].candidates=[];draft.rows[0].issues=['unknown'];sessionStorage.setItem(key,JSON.stringify(draft));},business);
  await page.reload();
  await expect(page.getByLabel('Product 1',{exact:true})).toHaveValue(ginger.id);
  await page.getByRole('button',{name:'Confirm & add stock',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Stock added',exact:true})).toBeVisible();
  expect((await state(page,business)).products.find(item=>item.id===ginger.id)!.quantityMilli).toBe(ginger.quantityMilli+3000);
  expect((await state(page,business)).products).toHaveLength(after.products.length);
});
test('a lost new-product acknowledgement survives reload and retries without duplicate products or stock',async({page})=>{
  const business=await setup(page),before=await state(page,business);
  await page.goto('/app/stock/voice');await newRows(page);
  await page.route(`**/api/businesses/${business}/stockbatch`,async route=>{const response=await route.fetch();expect(response.status()).toBe(201);await route.abort('failed');});
  await page.getByRole('button',{name:'Confirm & add stock',exact:true}).click();
  await expect(page.getByText('Stock was not confirmed. Check your stock/history before changing this draft, then retry the same entry.',{exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'Clear draft',exact:true})).toBeDisabled();
  await page.unrouteAll({behavior:'wait'});await page.reload();
  await expect(page.getByLabel('Selling price (₹) 1',{exact:true})).toBeDisabled();
  await page.getByRole('button',{name:'Confirm & add stock',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Stock added',exact:true})).toBeVisible();
  await expect(page.getByTestId('voice-row')).toHaveCount(0);
  const after=await state(page,business);
  expect(after.products).toHaveLength(before.products.length+2);
  expect(after.products.filter(item=>item.name==='kiwi')).toHaveLength(1);
  expect(after.products.find(item=>item.name==='kiwi')!.quantityMilli).toBe(10000);
  expect(after.inventoryEntries).toHaveLength(before.inventoryEntries.length+1);
});
test('the highlighted entry and new-product review fit phones in all three languages',async({page})=>{
  await setup(page);mkdirSync('docs/qa/voice-products',{recursive:true});
  for(const language of ['en','hi','hinglish']){
    await page.getByRole('combobox',{name:/^(Language|Bhasha|भाषा)$/}).selectOption(language);
    for(const width of [320,390,768,1440]){
      await page.setViewportSize({width,height:844});
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
      expect(await page.locator('.stock-voice-entry').evaluate(el=>el.getBoundingClientRect().bottom)).toBeLessThan(844);
    }
  }
  await page.getByRole('combobox',{name:/^(Language|Bhasha|भाषा)$/}).selectOption('en');
  await page.setViewportSize({width:390,height:844});await expect(page.locator('.toast')).toHaveCount(0);await page.screenshot({path:'docs/qa/voice-products/stock-phone.png'});
  await page.getByRole('link',{name:'Add stock by voice',exact:true}).click();await newRows(page);
  for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);}
  const result=await new AxeBuilder({page}).include('.voice-page').withTags(['wcag2a','wcag2aa']).analyze();expect(result.violations).toEqual([]);
  await page.setViewportSize({width:390,height:844});await page.getByTestId('voice-row').first().scrollIntoViewIfNeeded();await page.screenshot({path:'docs/qa/voice-products/new-product-phone.png'});
  await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'docs/qa/voice-products/voice-desktop.png',fullPage:true});
});
