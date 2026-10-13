import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {PDFDocument} from 'pdf-lib';
import {pdfSuiteFixture} from '../scripts/qa/pdf-suite-fixtures';
import {renderPdf} from '../src/lib/server/pdf-renderer';
import {handleRequest} from '../src/lib/server/router';
import {DomainError} from '../src/lib/server/validation';
import {today} from '../src/lib/client';
import type {DocumentKind} from '../src/lib/document-contracts';
import {ClosingService} from '../src/lib/server/closing';

test('premium operational PDFs use complete scoped records and do not post financial events',async()=>{
 const f=pdfSuiteFixture();try{
  const finance=()=>JSON.stringify(['products','invoices','payments','purchases','reorder_drafts','movements','business_sessions','closing_versions'].map(t=>f.store.db.prepare(`SELECT * FROM ${t} WHERE business_id=? ORDER BY id`).all(f.business))),before=finance();
  for(const [kind,id]of [['stock-report',f.business],['business-report',f.business],['purchase',f.purchase.id],['purchase-order',f.order.id]] as [DocumentKind,string][]){const doc=await f.documents.prepare(f.user,f.business,{kind,sourceId:id,language:'hi',start:today(),end:today()});assert.equal(doc.model.businessId,f.business);assert.ok(doc.pages>=1);assert.equal(finance(),before);}
  const stock=f.documents.model(f.user,f.business,{kind:'stock-report',sourceId:f.business,language:'en'}).stockReport!;assert.equal(stock.rows.length,5);assert.equal(stock.healthy+stock.low+stock.out,5);
  const report=f.documents.model(f.user,f.business,{kind:'business-report',sourceId:f.business,language:'en',start:today(),end:today()}).businessReport!;assert.equal(report.rows.length,2);assert.equal(report.salesPaise,f.previous.totalPaise+f.invoice.totalPaise);assert.equal(report.receivedPaise,92500);assert.equal(report.outstandingPaise,report.salesPaise-report.receivedPaise);
  const order=f.documents.model(f.user,f.business,{kind:'purchase-order',sourceId:f.order.id,language:'en'}).procurement!;assert.equal(order.status,'draft');assert.equal(order.totalPaise,33600);assert.equal(order.items[0].quantityMilli,24000);assert.equal(order.supplier.name,f.supplier.name);
 }finally{f.store.close();}
});

test('new PDF kinds enforce roles, tenant boundaries, source existence and date validation',async()=>{
 const f=pdfSuiteFixture();try{const other=f.store.createBusiness(f.user,{name:'Other business',category:'general'});assert.throws(()=>f.documents.model(f.user,other.id,{kind:'purchase',sourceId:f.purchase.id,language:'en'}),e=>e instanceof DomainError&&e.code==='NOT_FOUND');assert.throws(()=>f.documents.model(f.user,f.business,{kind:'business-report',sourceId:f.business,language:'en',start:'2026-12-31',end:'2026-01-01'}),e=>e instanceof DomainError&&e.code==='DOCUMENT_RANGE');
  const prepared=await f.documents.prepare(f.user,f.business,{kind:'purchase-order',sourceId:f.order.id,language:'en'});f.store.db.prepare("UPDATE memberships SET role='staff',permissions_json=? WHERE user_id=? AND business_id=?").run(JSON.stringify({inventory:false,purchases:false,reports:false}),f.user,f.business);
  for(const kind of ['stock-report','purchase','purchase-order','business-report','closing-preview'])assert.throws(()=>f.documents.model(f.user,f.business,{kind,sourceId:f.business,language:'en'}),e=>e instanceof DomainError&&e.code==='FORBIDDEN');assert.throws(()=>f.documents.read(f.user,f.business,prepared.id),e=>e instanceof DomainError&&e.code==='FORBIDDEN');
 }finally{f.store.close();}
});

test('closing preview exports stay read-only and a closed session requires its saved report',async()=>{
 const f=pdfSuiteFixture();try{assert.throws(()=>f.documents.model(f.user,f.business,{kind:'closing-preview',sourceId:f.business,language:'en'}),e=>e instanceof DomainError&&e.code==='ALREADY_CLOSED');await new Promise(resolve=>setTimeout(resolve,5));new ClosingService(f.store).open(f.user,f.business,{idempotencyKey:randomUUID(),openingCashPaise:1234});const before=f.store.db.prepare('SELECT * FROM business_sessions WHERE business_id=? ORDER BY id').all(f.business),doc=await f.documents.prepare(f.user,f.business,{kind:'closing-preview',sourceId:f.business,language:'en',format:'80mm'});assert.equal(doc.model.closingPreview!.session.status,'open');assert.equal(doc.model.closingPreview!.session.openingCashPaise,1234);assert.deepEqual(f.store.db.prepare('SELECT * FROM business_sessions WHERE business_id=? ORDER BY id').all(f.business),before);
  const cookie='dukaanset_session='+f.store.issueSession(f.user),r=await handleRequest(new Request(`http://localhost/api/businesses/${f.business}/closing-reports/${f.report.session.id}/pdf?language=hi&format=58mm&version=1`,{headers:{cookie}}),f.store);assert.equal(r.status,200);const pdf=await PDFDocument.load(await r.arrayBuffer());assert.equal(pdf.getPage(0).getWidth(),164.41);const invalid=await handleRequest(new Request(`http://localhost/api/businesses/${f.business}/closing-reports/${f.report.session.id}/pdf?format=letter`,{headers:{cookie}}),f.store);assert.equal(invalid.status,400);
 }finally{f.store.close();}
});

test('receipt account impact remains at payment time after a later bill is created',async()=>{
 const f=pdfSuiteFixture();try{const before=f.documents.model(f.user,f.business,{kind:'receipt',sourceId:f.receipt.payments[0].id,language:'en'}).receipt!;assert.equal(before.balanceBeforePaise!-before.balanceAfterPaise!,4500);
  // Create a subsequent session so the later bill is a genuine authorised transaction.
  await new Promise(resolve=>setTimeout(resolve,5));
  new ClosingService(f.store).open(f.user,f.business,{idempotencyKey:randomUUID(),openingCashPaise:0});
  f.store.createInvoice(f.user,f.business,{idempotencyKey:randomUUID(),customerId:f.customer.id,items:[{productId:f.products[0].id,quantityMilli:1000}],payments:[]});
  const after=f.documents.model(f.user,f.business,{kind:'receipt',sourceId:f.receipt.payments[0].id,language:'en'}).receipt!;assert.equal(after.balanceBeforePaise,before.balanceBeforePaise);assert.equal(after.balanceAfterPaise,before.balanceAfterPaise);assert.equal(after.balanceAsOfPaise,before.balanceAsOfPaise+13575);
 }finally{f.store.close();}
});

test('split receipt balances exclude another payment recorded in the same millisecond',async()=>{
 const f=pdfSuiteFixture();try{await new Promise(resolve=>setTimeout(resolve,5));new ClosingService(f.store).open(f.user,f.business,{idempotencyKey:randomUUID(),openingCashPaise:0});const split=f.store.receivePayment(f.user,f.business,{idempotencyKey:randomUUID(),customerId:f.customer.id,amountPaise:20000,method:'cash'}),other=f.store.receivePayment(f.user,f.business,{idempotencyKey:randomUUID(),customerId:f.customer.id,amountPaise:2000,method:'cash'});assert.equal(split.payments.length,2);const at=new Date().toISOString();for(const [p,id]of [[split.payments[0],'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'],[split.payments[1],'dddddddd-dddd-4ddd-8ddd-dddddddddddd'],[other.payments[0],'cccccccc-cccc-4ccc-8ccc-cccccccccccc']] as const)f.store.db.prepare('UPDATE payments SET id=?,date=? WHERE id=? AND business_id=?').run(id,at,p.id,f.business);const receipt=f.documents.model(f.user,f.business,{kind:'receipt',sourceId:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',language:'en'}).receipt!;assert.equal(receipt.amountPaise,20000);assert.equal(receipt.balanceBeforePaise!-receipt.balanceAfterPaise!,20000);
 }finally{f.store.close();}
});

test('payment staff can generate their scoped receipts without gaining statement access',async()=>{
 const f=pdfSuiteFixture();try{f.store.db.prepare("UPDATE memberships SET role='staff',permissions_json=? WHERE user_id=? AND business_id=?").run(JSON.stringify({payments:true,customers:false}),f.user,f.business);const doc=await f.documents.prepare(f.user,f.business,{kind:'receipt',sourceId:f.receipt.payments[0].id,language:'en'});assert.equal(doc.model.receipt!.amountPaise,4500);assert.throws(()=>f.documents.model(f.user,f.business,{kind:'statement',sourceId:f.customer.id,language:'en',start:today(),end:today()}),e=>e instanceof DomainError&&e.code==='FORBIDDEN');
 }finally{f.store.close();}
});

test('all locales and paper formats embed fonts, paginate and retain exact integer amounts',async()=>{
 const f=pdfSuiteFixture();try{for(const language of ['en','hi','hinglish'])for(const format of ['a4','mono','58mm','80mm']){const model=f.documents.model(f.user,f.business,{kind:'invoice',sourceId:f.invoice.id,language,format});model.invoice!.items=Array.from({length:43},(_,n)=>({...model.invoice!.items[n%4],name:'Long mixed product / ग्राहक का पसंदीदा लंबा उत्पाद '+n,variation:'Green / हरा / Pack of five'}));const actual=await renderPdf(model),pdf=await PDFDocument.load(actual.bytes);assert.ok(pdf.getPageCount()>1);assert.equal(actual.pages,pdf.getPageCount());assert.ok(actual.bytes.includes(Buffer.from('/FontFile2')));for(const page of pdf.getPages()){assert.ok(Math.abs(page.getWidth()-(format==='58mm'?164.41:format==='80mm'?226.77:595.28))<.02);assert.ok(page.getHeight()<=841.9);}assert.equal(model.invoice!.totalPaise,f.invoice.totalPaise);}}
 finally{f.store.close();}
});

test('authenticated operational download exposes PDF bytes and uses private cache headers',async()=>{
 const f=pdfSuiteFixture();try{const d=await f.documents.prepare(f.user,f.business,{kind:'stock-report',sourceId:f.business,language:'en'}),cookie='dukaanset_session='+f.store.issueSession(f.user),url='http://localhost'+d.pdfUrl;assert.equal((await handleRequest(new Request(url),f.store)).status,401);const response=await handleRequest(new Request(url,{headers:{cookie}}),f.store);assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'private, no-store');assert.equal(response.headers.get('content-type'),'application/pdf');assert.equal(Buffer.from(await response.arrayBuffer()).subarray(0,5).toString(),'%PDF-');}
 finally{f.store.close();}
});
