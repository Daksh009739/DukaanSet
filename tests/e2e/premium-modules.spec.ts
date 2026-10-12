import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync } from 'node:fs';
import type { Session } from '../../src/lib/contracts';
import type { V3State } from '../../src/lib/v3-contracts';
import { money } from '../../src/lib/client';

const origin='http://127.0.0.1:3001';
const post=(page:Page,path:string,data:unknown={})=>page.request.post('/api'+path,{headers:{Origin:origin},data});
const state=async(page:Page,id:string):Promise<V3State>=>(await page.request.get('/api/businesses/'+id+'/state')).json();
async function setup(page:Page) {
  expect((await post(page,'/auth/demo',{language:'en'})).status()).toBe(201);
  const session:Session=await(await page.request.get('/api/session')).json(),shop=session.businesses.find(b=>b.category==='hardware')!;
  await page.goto('/app');await page.locator('#hero-business').selectOption(shop.id);
  await expect(page.locator('main')).toHaveAttribute('data-business-id',shop.id);
  return {shop,state:await state(page,shop.id)};
}

test('directory filters, signed refunds and record actions use the real ledger without changing it',async({page})=>{
  test.setTimeout(90000);
  const f=await setup(page),product=f.state.products.find(p=>p.quantityMilli>1000)!,customer=f.state.customers[0];
  const created=await post(page,'/businesses/'+f.shop.id+'/invoices',{idempotencyKey:crypto.randomUUID(),customerId:customer.id,items:[{productId:product.id,quantityMilli:1000}],payments:[{method:'cash',amountPaise:product.pricePaise}]});
  expect(created.status()).toBe(201);const invoice=await created.json();
  expect((await post(page,'/businesses/'+f.shop.id+'/invoices/'+invoice.id+'/cancel')).status()).toBe(200);
  const before=await state(page,f.shop.id);
  await page.goto('/app/payments');
  const receipts=before.payments.filter(p=>p.kind!=='refund').reduce((s,p)=>s+p.amountPaise,0),refunds=before.payments.filter(p=>p.kind==='refund').reduce((s,p)=>s+Math.abs(p.amountPaise),0);
  const metric=(label:string)=>page.locator('.module-metric').filter({has:page.locator('dt',{hasText:label})}).locator('dd');
  await expect(metric('Recorded receipts')).toHaveText(new RegExp('^'+money(receipts).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
  await expect(metric('Refunds')).toHaveText(money(refunds));await expect(metric('Net received')).toHaveText(money(receipts-refunds));
  await expect(page.locator('.module-contact-row').filter({hasText:'Refunds'}).locator('.module-record-amount')).toContainText('−'+money(product.pricePaise));
  await page.getByRole('group',{name:'Payments',exact:true}).getByRole('button',{name:'Cash',exact:true}).click();
  await expect(page.locator('.module-contact-row')).toHaveCount(before.payments.filter(p=>p.method==='cash').length);
  await page.getByRole('searchbox',{name:'Search customer name or phone',exact:true}).fill(customer.name);
  const selected=before.payments.filter(p=>p.method==='cash'&&p.customerId===customer.id);
  await expect(page.locator('.module-contact-row')).toHaveCount(selected.length);
  await page.locator('.module-contact-row').first().click();await expect(page).toHaveURL(/\/app\/payments\/[^/]+$/);
  await page.goto('/app/customers');await page.getByRole('group',{name:'Customers',exact:true}).getByRole('button',{name:'With balance',exact:true}).click();
  await expect(page.locator('.customer-row')).toHaveCount(before.customers.filter(c=>c.balancePaise>0).length);
  const first=page.locator('.customer-row').first(),name=await first.locator('.customer-info b').textContent();
  await first.getByRole('button',{name:'Add payment',exact:true}).click();await expect(page.getByRole('dialog').getByLabel('Customer',{exact:true})).toHaveValue(before.customers.find(c=>c.name===name)!.id);await page.keyboard.press('Escape');
  await page.getByRole('group',{name:'Customers',exact:true}).getByRole('button',{name:'Settled',exact:true}).click();
  await expect(page.locator('.customer-row')).toHaveCount(before.customers.filter(c=>c.balancePaise<=0).length);
  await page.getByRole('searchbox',{name:'Search customers…',exact:true}).fill('No matching customer');await expect(page.locator('.empty')).toBeVisible();await page.getByRole('button',{name:'Reset filters',exact:true}).click();await expect(page.locator('.customer-row')).toHaveCount(before.customers.length);
  await page.goto('/app/suppliers');const supplier=before.suppliers[0];await page.getByRole('searchbox',{name:'Search supplier name or phone',exact:true}).fill(supplier.phone);await expect(page.locator('.module-contact-row')).toHaveCount(before.suppliers.filter(s=>s.phone.includes(supplier.phone)).length);await page.locator('.module-contact-row').first().click();await expect(page).toHaveURL('/app/suppliers/'+supplier.id);
  await page.goto('/app/purchases');await page.getByRole('button',{name:'Record your first purchase',exact:true}).click();await expect(page.getByRole('dialog').getByRole('heading',{name:'Receive purchase',exact:true})).toBeVisible();await page.keyboard.press('Escape');
  await page.goto('/app/stock');await page.getByTestId('contextual-voice-hero').getByRole('button',{name:'Open VoiceOS for this page',exact:true}).click();await expect(page.getByRole('dialog').getByLabel('Voice command',{exact:true})).toBeVisible();await page.keyboard.press('Escape');
  const after=await state(page,f.shop.id);expect(after.invoices).toEqual(before.invoices);expect(after.payments).toEqual(before.payments);expect(after.movements).toEqual(before.movements);expect(after.products).toEqual(before.products);
});

test('all seven sections fit desktop, tablet and small phones in all three languages',async({page})=>{
  test.setTimeout(360000);await setup(page);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  const routes=['sales/new','sales','stock','customers','payments','purchases','suppliers'],out='.local/qa-premium-modules';mkdirSync(out,{recursive:true});
  for(const language of ['en','hi','hinglish']) {
    // Preserve the production request quota while auditing repeated authenticated pages.
    if(language!=='en')await page.waitForTimeout(60000);
    expect((await post(page,'/account/language',{language})).status()).toBe(200);
    for(const width of language==='en'?[1440,768,320]:[1440,320]) {
      await page.setViewportSize({width,height:900});
      for(const route of routes) {
        await page.goto('/app/'+route);await expect(page.locator('main h1')).toBeVisible();await expect(page.getByTestId('contextual-voice-hero')).toBeVisible();await expect(page.locator('.demo-banner')).toHaveCount(0);await expect(page.locator('html')).toHaveAttribute('lang',language==='hinglish'?'hi-Latn':language);await page.evaluate(()=>document.fonts.ready);
        expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),route+' '+language+' '+width).toBe(true);
        if(language==='en'&&width!==768)expect((await new AxeBuilder({page}).include('main').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations,route+' '+width).toEqual([]);
        if(width!==768)await page.screenshot({path:out+'/'+route.replace('/','-')+'-'+language+'-'+width+'.png',fullPage:true});
      }
    }
  }
  expect(errors).toEqual([]);
});
