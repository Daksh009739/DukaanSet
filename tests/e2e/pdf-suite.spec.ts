import {test,expect,type Page,type Locator} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {readFileSync,mkdirSync} from 'node:fs';
import {PDFDocument} from 'pdf-lib';
import {text} from '../../src/lib/locale';
import type {Language} from '../../src/lib/contracts';
import {pdfText} from './document-helper';

const origin='http://127.0.0.1:3001',output='.local/qa/pdf-suite-ui';mkdirSync(output,{recursive:true});
const d=(l:Language,k:string)=>text(l,'documents',k);
async function setup(page:Page,language:Language){const r=await page.request.post('/api/auth/demo',{headers:{Origin:origin},data:{language}});expect(r.status()).toBe(201);const session=await r.json(),business=session.businesses[0];const state=await(await page.request.get(`/api/businesses/${business.id}/state`)).json();return{business,state};}
async function financial(page:Page,id:string){const s=await(await page.request.get(`/api/businesses/${id}/state`)).json();return{products:s.products,invoices:s.invoices,payments:s.payments,purchases:s.purchases,movements:s.movements,expenses:s.expenses,session:s.closing.current};}
async function generate(page:Page,dialog:Locator,language:Language,format='a4'){
 await dialog.getByLabel(d(language,'format'),{exact:true}).selectOption(format);const response=page.waitForResponse(r=>r.request().method()==='POST'&&/\/documents$/.test(r.url()));await dialog.getByRole('button',{name:d(language,'generate'),exact:true}).click();const r=await response;expect(r.status(),await r.text()).toBe(201);const prepared=await r.json();await expect(dialog.locator('.pdf-pages canvas')).not.toHaveCount(0);const download=page.waitForEvent('download');await dialog.getByRole('button',{name:d(language,'download'),exact:true}).click();const file=await download,bytes=readFileSync((await file.path())!);expect(bytes.subarray(0,5).toString()).toBe('%PDF-');const pdf=await PDFDocument.load(bytes);expect(pdf.getPageCount()).toBe(prepared.pages);expect(pdf.getPage(0).getWidth()).toBeCloseTo(format==='58mm'?164.41:format==='80mm'?226.77:595.28,1);return{prepared,content:(await pdfText(bytes)).replace(/\s/g,''),file,bytes};
}
async function verifyPrint(page:Page,button:Locator,expected:Uint8Array){
 // Native PDF viewers differ: headless Linux can download the popup and leave its URL blank.
 // Exercise the real window.open and verify its exact PDF bytes instead of requiring an installed viewer.
 await page.evaluate(()=>{const original=window.open.bind(window),create=URL.createObjectURL.bind(URL),sources=new Map<string,Blob>();URL.createObjectURL=object=>{const url=create(object);if(object instanceof Blob)sources.set(url,object);return url;};window.open=(url,target,features)=>{const value=String(url);(window as Window&{qaPdfPrint?:{url:string;target?:string;features?:string;bytes:Promise<number[]>}}).qaPdfPrint={url:value,target,features,bytes:sources.get(value)!.arrayBuffer().then(buffer=>Array.from(new Uint8Array(buffer)))};window.open=original;URL.createObjectURL=create;return original(url,target,features);};});
 const opened=page.waitForEvent('popup');await button.click();const popup=await opened;
 const request=await page.evaluate(()=>(window as Window&{qaPdfPrint?:{url:string;target?:string;features?:string}}).qaPdfPrint);
 expect(request).toMatchObject({target:'_blank',features:'noopener'});expect(request?.url).toMatch(/^blob:/);
 const bytes=await page.evaluate(()=>(window as Window&{qaPdfPrint?:{bytes:Promise<number[]>}}).qaPdfPrint!.bytes);expect(Buffer.from(bytes)).toEqual(Buffer.from(expected));
 await popup.close();
}
async function operational(page:Page,language:Language,route:string,button:string,title:string,format='a4'){
 await page.goto(route);await page.getByRole('button',{name:button,exact:true}).click();const dialog=page.getByRole('dialog',{name:title,exact:true});const result=await generate(page,dialog,language,format);await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();return result;
}

for(const language of ['en','hi','hinglish'] as const)test(`${language}: premium private PDFs preview, download and print from existing business workflows`,async({page})=>{
 test.setTimeout(180000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));const f=await setup(page,language),id=f.business.id,product=f.state.products[0],supplier=f.state.suppliers[0],post=async(path:string,data:unknown)=>{const r=await page.request.post(`/api/businesses/${id}/${path}`,{headers:{Origin:origin},data});expect(r.status(),await r.text()).toBe(201);return r.json();};
 const purchase=await post('purchases',{idempotencyKey:crypto.randomUUID(),supplierId:supplier.id,items:[{productId:product.id,quantityMilli:1000,costPaise:product.costPaise}],paidPaise:0});
 const order=await post('reorders',{idempotencyKey:crypto.randomUUID(),productId:product.id,quantityMilli:2000,costPaise:product.costPaise,supplierId:supplier.id,requestIds:[]});const before=await financial(page,id);
 await page.goto('/app/stock');await page.getByRole('button',{name:d(language,'stock-report'),exact:true}).click();const stock=page.getByRole('dialog',{name:d(language,'suiteTitle.stock-report'),exact:true});const first=await generate(page,stock,language);expect(first.prepared.model.stockReport.rows.length).toBe(f.state.products.length);expect(first.content).toContain(f.business.name.replace(/\s/g,''));expect(first.content).not.toContain('undefined');
 for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:1000});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);}await page.setViewportSize({width:390,height:900});expect((await new AxeBuilder({page}).include('[role="dialog"]').withTags(['wcag2a','wcag2aa']).analyze()).violations).toEqual([]);await page.screenshot({path:`${output}/stock-${language}-390.png`,fullPage:true});await stock.locator('.pdf-pages canvas').first().screenshot({path:`${output}/stock-${language}-canvas.png`});
 const thermal=await generate(page,stock,language,'58mm');expect(thermal.content).toContain(f.business.name.replace(/\s/g,''));await verifyPrint(page,stock.getByRole('button',{name:d(language,'print'),exact:true}),thermal.bytes);await page.keyboard.press('Escape');await page.setViewportSize({width:1440,height:1000});
 const report=await operational(page,language,'/app/reports',d(language,'business-report'),d(language,'suiteTitle.business-report'));expect(report.prepared.model.businessReport.rows.length).toBe(f.state.invoices.length);
 const po=await operational(page,language,`/app/purchases/orders/${order.id}`,d(language,'purchase-order'),d(language,'suiteTitle.purchase-order'));expect(po.prepared.model.procurement.totalPaise).toBe(product.costPaise*2);expect(po.content).toContain(supplier.name.replace(/\s/g,''));
 const received=await operational(page,language,`/app/purchases/${purchase.id}`,d(language,'suiteTitle.purchase'),d(language,'suiteTitle.purchase'),'mono');expect(received.prepared.model.procurement.balancePaise).toBe(product.costPaise);
 const closing=await operational(page,language,'/app/daily-closing',d(language,'closingPreviewPdf'),d(language,'suiteClosing'),'80mm');expect(closing.prepared.model.closingPreview.session.status).toBe('open');expect(closing.prepared.model.reference).toMatch(/^PREVIEW-/);expect(closing.content).toContain('PREVIEW-');expect(closing.content).not.toMatch(/\{\{|undefined/);
 const invoice=f.state.invoices.find((i:{customerId:string|null})=>i.customerId),customer=f.state.customers.find((c:{id:string})=>c.id===invoice.customerId);await page.goto('/app/sales/'+invoice.id);await page.getByRole('button',{name:d(language,'preview'),exact:true}).click();const studio=page.getByRole('dialog',{name:d(language,'studio'),exact:true});const bill=await generate(page,studio,language);expect(bill.prepared.model.invoice.totalPaise).toBe(invoice.totalPaise);await page.keyboard.press('Escape');
 const customerDocs=async(kind:string,sourceId:string)=>{const r=await page.request.post(`/api/businesses/${id}/documents`,{headers:{Origin:origin},data:{kind,sourceId,language,format:'a4',start:new Date(Date.now()+19800000).toISOString().slice(0,8)+'01',end:new Date(Date.now()+19800000).toISOString().slice(0,10)}});expect(r.status(),await r.text()).toBe(201);const doc=await r.json(),pdf=await page.request.get('/api'+doc.pdfUrl.replace(/^\/api/,''));expect(pdf.headers()['cache-control']).toBe('private, no-store');expect(await pdfText(await pdf.body())).toMatch(/DukaanSet|DUKAANSET/);return doc;};
 const statement=await customerDocs('statement',customer.id);expect(statement.model.customer.id).toBe(customer.id);const payment=f.state.payments.find((p:{customerId:string;kind:string})=>p.customerId===customer.id&&p.kind!=='refund');expect((await customerDocs('receipt',payment.id)).model.receipt.amountPaise).toBeGreaterThan(0);
 expect(await financial(page,id)).toEqual(before);expect(errors).toEqual([]);
});
