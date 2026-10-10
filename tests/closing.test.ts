import {test,mock} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {Store} from '../src/lib/server/store';
import {ClosingService,closingDefaults,sessionDay,wallTime,safeSum} from '../src/lib/server/closing';
import {interpretVoice,detectIntent,reportAnswer} from '../src/lib/voice/os';
import {RecordService} from '../src/lib/server/records';
import {SaaSService} from '../src/lib/server/saas';
import {DomainError} from '../src/lib/server/validation';

const code=(fn:()=>unknown,c:string)=>assert.throws(fn,(e:unknown)=>e instanceof DomainError&&e.code===c);
function fixture(path=':memory:') {
  mock.timers.enable({apis:['Date'],now:new Date('2026-10-10T15:31:00.000Z').getTime()});
  const store=new Store(path),account=store.register({name:'Closing Owner',email:randomUUID()+'@example.test',password:'closing-tests-123',businessName:'Sharma Fashion Store',category:'clothing',language:'en'}),user=account.user.id,business=account.businesses[0].id;
  let now=new Date('2026-10-10T15:31:00.000Z');const service=new ClosingService(store,()=>now);
  const product=store.createProduct(user,business,{name:'Blue Shirt',unit:'piece',pricePaise:10000,quantityMilli:100000});
  const customer=store.createContact(user,business,'customers',{name:'Fictional Customer'});
  service.open(user,business,{openingCashPaise:100000,idempotencyKey:'open'});
  const sale=(total:number,payments:{method:string;amountPaise:number}[]=[])=>store.createInvoice(user,business,{customerId:customer.id,idempotencyKey:randomUUID(),items:[{productId:product.id,quantityMilli:1000,pricePaise:total}],payments});
  const old=sale(300000);store.db.prepare('UPDATE invoices SET date=? WHERE id=?').run('2026-10-09T10:00:00.000Z',old.id);
  store.db.prepare('UPDATE movements SET date=? WHERE reference_id=?').run('2026-10-09T10:00:00.000Z',old.id);
  sale(600000,[{method:'cash',amountPaise:600000}]);sale(350000,[{method:'upi',amountPaise:350000}]);sale(150000);
  store.receivePayment(user,business,{customerId:customer.id,amountPaise:40000,method:'cash',idempotencyKey:'old-cash'});
  store.receivePayment(user,business,{customerId:customer.id,amountPaise:60000,method:'upi',idempotencyKey:'old-upi'});
  store.createExpense(user,business,{description:'Fictional daily expense',amountPaise:70000,method:'cash',idempotencyKey:'expense'});
  const close=store.close.bind(store);store.close=()=>{close();mock.timers.reset();};
  return {store,user,business,service,product,customer,sale,setNow:(value:string)=>{now=new Date(value);mock.timers.setTime(now.getTime());}};
}
test('real transaction fixture reconciles the requested 11,000 / 10,500 / 3,500 / 6,700 example',()=>{
  const f=fixture();try{const p=f.service.preview(f.user,f.business),t=p.totals;
    assert.equal(t.netSalesPaise,1100000);assert.equal(t.collectionsPaise,1050000);assert.equal(t.cashCollectionsPaise,640000);assert.equal(t.upiCollectionsPaise,410000);assert.equal(t.newCreditPaise,150000);assert.equal(t.openingReceivablePaise,300000);assert.equal(t.closingReceivablePaise,350000);assert.equal(t.olderDuesCollectionsPaise,100000);assert.equal(t.expectedCashPaise,670000);
    const before=f.store.state(f.user,f.business);assert.equal(f.service.history(f.user,f.business).length,0);assert.deepEqual(f.store.state(f.user,f.business),before);
    code(()=>f.service.close(f.user,f.business,{fingerprint:p.fingerprint,actualCashPaise:665000,idempotencyKey:'close'}),'ACKNOWLEDGEMENT_REQUIRED');
    const input={fingerprint:p.fingerprint,actualCashPaise:665000,acknowledged:true,idempotencyKey:'close'};const report=f.service.close(f.user,f.business,input);assert.equal(report.differencePaise,-5000);assert.equal(report.verification,'difference');assert.deepEqual(f.service.close(f.user,f.business,input),report);assert.equal(f.store.state(f.user,f.business).expenses.length,before.expenses.length);
  }finally{f.store.close();}
});
test('stale preview rejects changed receipts and split payments are counted once',()=>{
  const f=fixture();try{const p=f.service.preview(f.user,f.business);f.sale(10000,[{method:'cash',amountPaise:2500},{method:'upi',amountPaise:7500}]);code(()=>f.service.close(f.user,f.business,{fingerprint:p.fingerprint,actualCashPaise:null,idempotencyKey:'stale'}),'STALE_PREVIEW');const t=f.service.preview(f.user,f.business).totals;assert.equal(t.collectionsPaise,1060000);assert.equal(t.netSalesPaise,1110000);}finally{f.store.close();}
});
test('uncounted close, explicit next session and cash revisions preserve original financial snapshot',()=>{
  const f=fixture();try{const p=f.service.preview(f.user,f.business),original=f.service.close(f.user,f.business,{fingerprint:p.fingerprint,actualCashPaise:null,idempotencyKey:'close'});assert.equal(original.verification,'pending');assert.equal(original.actualCashPaise,null);code(()=>f.sale(50000),'DAY_CLOSED');
    f.setNow('2026-10-10T15:32:00.000Z');const next=f.service.open(f.user,f.business,{openingCashPaise:50000,idempotencyKey:'next'});assert.notEqual(next.id,original.session.id);assert.equal(next.businessDate,original.session.businessDate);assert.equal(next.openingCashPaise,50000);
    const revision=f.service.reconcile(f.user,f.business,original.session.id,{actualCashPaise:665000,reason:'Physical count checked against drawer record',sourceReferences:['drawer-count-1'],version:1,idempotencyKey:'correct'});assert.equal(revision.version,2);assert.deepEqual(revision.totals,original.totals);assert.deepEqual(f.service.report(f.user,f.business,original.session.id,1),original);assert.equal(f.service.versions(f.user,f.business,original.session.id).length,2);
    assert.throws(()=>f.store.db.prepare('UPDATE closing_versions SET data_json=? WHERE id=?').run('{}',original.id));
  }finally{f.store.close();}
});
test('supplier UPI allocations reduce payable without touching cash and deposits are not sales',()=>{
  const f=fixture();try{const supplier=f.store.createContact(f.user,f.business,'suppliers',{name:'Fictional Supplier'}),purchase=f.store.createPurchase(f.user,f.business,{supplierId:supplier.id,items:[{productId:f.product.id,quantityMilli:1000,costPaise:20000}],paidPaise:5000,idempotencyKey:'purchase'});
    f.service.supplierPayment(f.user,f.business,purchase.id,{amountPaise:10000,method:'upi',idempotencyKey:'supplier-pay'});f.service.cashMovement(f.user,f.business,{kind:'deposit',amountPaise:2000,reason:'Owner float',idempotencyKey:'deposit'});
    const t=f.service.preview(f.user,f.business).totals;assert.equal(t.supplierPaymentsPaise,15000);assert.equal(t.cashSupplierPaymentsPaise,5000);assert.equal(t.expectedCashPaise,667000);assert.equal(t.netSalesPaise,1100000);assert.equal(f.store.state(f.user,f.business).suppliers[0].balancePaise,5000);
    code(()=>f.service.supplierPayment(f.user,f.business,purchase.id,{amountPaise:6000,method:'cash',idempotencyKey:'too-much'}),'OVERPAYMENT');
  }finally{f.store.close();}
});
test('cancellation events keep sales, refunds and historical receivables distinct',()=>{
  const f=fixture();try{const bill=f.sale(10000,[{method:'cash',amountPaise:4000},{method:'upi',amountPaise:2000}]);f.store.cancelInvoice(f.user,f.business,bill.id);const t=f.service.preview(f.user,f.business).totals;assert.equal(t.netSalesPaise,1100000);assert.equal(t.collectionsPaise,1056000);assert.equal(t.refundsPaise,6000);assert.equal(t.cashRefundsPaise,4000);assert.equal(t.creditReversalsPaise,4000);assert.equal(t.closingReceivablePaise,350000);assert.equal(t.expectedCashPaise,670000);}finally{f.store.close();}
});
test('timezone cutoff handles after-midnight and DST offsets, and unsafe sums fail',()=>{
  assert.equal(sessionDay(new Date('2026-10-10T19:00:00Z'),{timezone:'Asia/Kolkata',cutoff:'02:00'}),'2026-10-10');
  assert.equal(wallTime('2026-10-10','02:00','Asia/Kolkata'),'2026-10-09T20:30:00.000Z');assert.equal(wallTime('2026-07-01','21:00','America/New_York'),'2026-07-02T01:00:00.000Z');assert.equal(wallTime('2026-01-01','21:00','America/New_York'),'2026-01-02T02:00:00.000Z');code(()=>wallTime('2026-03-08','02:30','America/New_York'),'INVALID_TIME');code(()=>safeSum([Number.MAX_SAFE_INTEGER,1]),'ACCOUNTING_LIMIT');
});
test('manager needs explicit closing grant and other businesses cannot read reports',()=>{
  const f=fixture();try{const other=f.store.register({name:'Manager',email:randomUUID()+'@example.test',password:'manager-test-123',businessName:'Other Shop',category:'clothing'}),manager=other.user.id;f.store.db.prepare('INSERT INTO memberships(user_id,business_id,role,permissions_json) VALUES(?,?,?,?)').run(manager,f.business,'manager','{}');const p=f.service.preview(manager,f.business);code(()=>f.service.close(manager,f.business,{fingerprint:p.fingerprint,actualCashPaise:null,idempotencyKey:'denied'}),'OWNER_REQUIRED');code(()=>f.service.saveSettings(manager,f.business,{...closingDefaults,revision:0}),'FORBIDDEN');
    f.service.saveSettings(f.user,f.business,{...closingDefaults,managerIds:[manager],revision:0});const report=f.service.close(manager,f.business,{fingerprint:p.fingerprint,actualCashPaise:null,idempotencyKey:'granted'});assert.equal(report.actorId,manager);code(()=>f.service.report(manager,other.businesses[0].id,report.session.id),'NOT_FOUND');
  }finally{f.store.close();}
});
test('durable automatic queue survives restart and never invents a cash count',()=>{
  const folder=mkdtempSync(join(tmpdir(),'dukaanset-closing-')),path=join(folder,'test.sqlite');const f=fixture(path);let reopened:Store|undefined;
  try{f.service.saveSettings(f.user,f.business,{...closingDefaults,enabled:true,revision:0});f.setNow('2026-10-10T15:29:00Z');assert.equal(f.service.tick().completed,0);assert.equal(f.store.db.prepare('SELECT COUNT(*) n FROM closing_jobs').get()!.n,1);f.store.close();reopened=new Store(path);const service=new ClosingService(reopened,()=>new Date('2026-10-10T15:35:00Z'));assert.equal(service.tick().completed,1);assert.equal(service.tick().completed,0);const report=service.history(f.user,f.business)[0];assert.equal(report.method,'automatic');assert.equal(report.actualCashPaise,null);assert.equal(report.verification,'pending');assert.equal(report.scheduledAt,'2026-10-10T15:30:00.000Z');assert.equal(report.asOf,'2026-10-10T15:35:00.000Z');assert.equal(service.overview(f.user,f.business).notices[0].kind,'automaticPending');
  }finally{reopened?.close();try{f.store.close();}catch{}rmSync(folder,{recursive:true,force:true});}
});
test('dashboard and closing totals use the same server calculation',()=>{
  const f=fixture();try{const state=new SaaSService(f.store).state(f.user,f.business),t=new ClosingService(f.store).calculate(f.business).totals;assert.equal(state.metrics.salesTodayPaise,t.netSalesPaise);assert.equal(state.metrics.collectedTodayPaise,t.collectionsPaise);assert.equal(state.daily.creditSalesPaise,t.newCreditPaise);}finally{f.store.close();}
});

test('failed automatic work backs off, survives restart and finalizes once after recovery',()=>{
 const folder=mkdtempSync(join(tmpdir(),'dukaanset-retry-')),path=join(folder,'retry.sqlite'),f=fixture(path);let reopened:Store|undefined;
 try{f.service.saveSettings(f.user,f.business,{...closingDefaults,enabled:true,revision:0});
  const original=f.service.close.bind(f.service);f.service.close=()=>{throw new DomainError('INTERNAL','Injected failure',500);};assert.deepEqual(f.service.tick(),{completed:0,failed:1});f.service.close=original;
  const job=f.store.db.prepare('SELECT * FROM closing_jobs').get()!;assert.equal(job.status,'failed');assert.equal(job.attempts,1);assert.equal(job.next_attempt,'2026-10-10T15:33:00.000Z');assert.equal(f.service.tick().completed,0);assert.equal(f.service.history(f.user,f.business).length,0);
  f.store.close();reopened=new Store(path);const service=new ClosingService(reopened,()=>new Date('2026-10-10T15:34:00Z'));assert.equal(service.tick().completed,1);assert.equal(service.tick().completed,0);assert.equal(service.history(f.user,f.business).length,1);assert.equal(service.history(f.user,f.business)[0].actualCashPaise,null);
 }finally{reopened?.close();try{f.store.close();}catch{}rmSync(folder,{recursive:true,force:true});}
});
test('owner schedule changes retime durable work and enabling on an empty shop creates a session',()=>{
 const f=fixture();try{f.service.saveSettings(f.user,f.business,{...closingDefaults,enabled:true,revision:0});f.setNow('2026-10-10T15:29:00Z');f.service.tick();f.service.saveSettings(f.user,f.business,{...f.service.settings(f.business),closingTime:'22:00'});f.setNow('2026-10-10T15:35:00Z');assert.equal(f.service.tick().completed,0);assert.equal(f.store.db.prepare('SELECT scheduled_at FROM closing_jobs').get()!.scheduled_at,'2026-10-10T16:30:00.000Z');
 const account=f.store.register({name:'Empty Owner',email:randomUUID()+'@example.test',password:'empty-test-123',businessName:'Empty Shop',category:'general'}),id=account.businesses[0].id;f.service.saveSettings(account.user.id,id,{...closingDefaults,enabled:true,revision:0});assert.notEqual(f.service.current(id).id,'initial');
 }finally{f.store.close();}
});
test('closed calculations are frozen and late corrections link a tenant-scoped source without double counting',()=>{
 const f=fixture();try{const p=f.service.preview(f.user,f.business),r=f.service.close(f.user,f.business,{fingerprint:p.fingerprint,actualCashPaise:null,idempotencyKey:'frozen'});const old=r.sources.invoices[0];code(()=>f.service.linkCorrection(f.user,f.business,r.session.id,{sourceId:old,reason:'Already included',version:1,idempotencyKey:'bad-source'}),'CORRECTION_SOURCE');
 f.setNow('2026-10-10T15:32:00Z');f.service.open(f.user,f.business,{openingCashPaise:100000,idempotencyKey:'next-late'});const expense=f.store.createExpense(f.user,f.business,{description:'Missed expense recorded in next session',amountPaise:5000,method:'cash',idempotencyKey:'late-expense'});f.store.db.prepare('UPDATE expenses SET date=? WHERE id=?').run('2026-10-10T15:33:00.000Z',expense.id);f.setNow('2026-10-10T15:34:00Z');const before=f.store.db.prepare('SELECT COUNT(*) n FROM expenses').get()!.n;
 const revised=f.service.linkCorrection(f.user,f.business,r.session.id,{sourceId:expense.id,reason:'Missed receipt found after closing',version:1,idempotencyKey:'late-link'});assert.equal(revised.version,2);assert.equal(revised.actorId,r.actorId);assert.equal(revised.asOf,r.asOf);assert.equal(revised.revisionActorId,f.user);assert.equal(revised.linkedCorrections![0].sourceId,expense.id);assert.deepEqual(revised.totals,r.totals);assert.equal(f.store.db.prepare('SELECT COUNT(*) n FROM expenses').get()!.n,before);assert.deepEqual(f.service.report(f.user,f.business,r.session.id,1),r);assert.equal(f.service.calculate(f.business).totals.cashExpensesPaise,5000);
 }finally{f.store.close();}
});
test('legacy cash-only closings remain visible and permit an explicit same-day next session',()=>{
 const f=fixture();try{f.store.db.prepare('DELETE FROM business_sessions WHERE business_id=?').run(f.business);f.store.db.prepare('INSERT INTO closings VALUES(?,?,?,?,?,?,?,?)').run('legacy-test',f.business,'2026-10-10T15:30:00.000Z','2026-10-10',100000,670000,665000,-5000);const overview=f.service.overview(f.user,f.business);assert.equal(overview.session.status,'closed');assert.equal(overview.latest,null);assert.equal(overview.legacy[0].actualCashPaise,665000);code(()=>f.sale(10000),'DAY_CLOSED');const opened=f.service.open(f.user,f.business,{openingCashPaise:50000,idempotencyKey:'legacy-next'});assert.equal(opened.openedAt,'2026-10-10T15:31:00.000Z');assert.equal(opened.status,'open');assert.equal(f.service.overview(f.user,f.business).legacy.length,1);
 }finally{f.store.close();}
});
test('closing demo seeds authoritative isolated records and reset preserves other accounts',()=>{
 const store=new Store(':memory:');try{const other=store.demo('en'),before=store.state(other.user.id,other.businesses[0].id),demo=store.demo('hi','closing'),id=demo.businesses[0].id,service=new ClosingService(store),p=service.preview(demo.user.id,id);assert.equal(demo.businesses.length,1);assert.equal(p.totals.netSalesPaise,1100000);assert.equal(p.totals.collectionsPaise,1050000);assert.equal(p.totals.closingReceivablePaise,350000);assert.equal(p.totals.expectedCashPaise,670000);store.resetDemo(demo.user.id);assert.equal(service.preview(demo.user.id,id).totals.expectedCashPaise,670000);assert.deepEqual(store.state(other.user.id,other.businesses[0].id),before);
 }finally{store.close();}
});

test('current-sale repayments reconcile customer dues and closed preview ignores later catalogue edits',()=>{
 const f=fixture();try{const credit=f.store.state(f.user,f.business).invoices.find(i=>i.totalPaise===150000)!;f.store.receivePayment(f.user,f.business,{customerId:f.customer.id,invoiceId:credit.id,amountPaise:50000,method:'upi',idempotencyKey:'credit-repayment'});const p=f.service.preview(f.user,f.business),t=p.totals;assert.equal(t.creditCollectionsPaise,150000);assert.equal(t.closingReceivablePaise,300000);assert.equal(t.openingReceivablePaise+t.newCreditPaise-t.creditCollectionsPaise-t.creditReversalsPaise,t.closingReceivablePaise);const r=f.service.close(f.user,f.business,{fingerprint:p.fingerprint,actualCashPaise:null,idempotencyKey:'closed-stable'});f.store.db.prepare('UPDATE products SET name=?,quantity_milli=? WHERE id=?').run('Edited catalogue name',2000,f.product.id);assert.deepEqual(f.service.calculate(f.business).totals,r.totals);assert.deepEqual(f.service.calculate(f.business).inventory,r.inventory);
 }finally{f.store.close();}
});
test('dedicated histories paginate complete records and reject other-business identities',()=>{
 const f=fixture();try{for(let i=0;i<51;i++)f.sale(1000);const service=new RecordService(f.store),params=new URLSearchParams({customer:f.customer.id}),first=service.invoiceHistory(f.user,f.business,params);assert.equal(first.total,55);assert.equal(first.invoices.length,50);assert.equal(first.hasMore,true);params.set('offset','50');const next=service.invoiceHistory(f.user,f.business,params);assert.equal(next.invoices.length,5);assert.equal(next.hasMore,false);assert.equal(new Set([...first.invoices,...next.invoices].map(i=>i.id)).size,55);assert.equal(first.totals.salesPaise,1451000);assert.ok(service.history(f.user,f.business,f.customer.id,'customer').total>50);const other=f.store.demo('en');code(()=>service.detail(f.user,f.business,other.businesses[0].id,'product'),'NOT_FOUND');
 }finally{f.store.close();}
});

test('closing voice commands prepare review or history and cash questions use recorded drawer data',()=>{
 const f=fixture();try{const state=new SaaSService(f.store).state(f.user,f.business);assert.equal(detectIntent('Aaj ki dukaan close kar do'),'closing');const yesterday=interpretVoice('Kal ka closing report dikhao',state);assert.equal(yesterday.intent,'closing');assert.equal(yesterday.fields.closingPeriod,'yesterday');const upi=interpretVoice('Aaj kitni UPI payment aayi',state);assert.equal(upi.fields.report,'collections');const cash=interpretVoice('Aaj ka cash balance batao',state);assert.equal(cash.fields.report,'cashBalance');const answer=reportAnswer(cash,state,'en',f.store.voiceReport(f.user,f.business,'today'));assert.equal(answer[0].value,'₹6,700');assert.equal(f.service.history(f.user,f.business).length,0);
 }finally{f.store.close();}
});
