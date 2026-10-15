import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {mkdtempSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {Store} from '../src/lib/server/store';
import {BusinessGrowthService} from '../src/lib/server/business-growth';
import {SaaSService} from '../src/lib/server/saas';
import {ClosingService} from '../src/lib/server/closing';
import {AuthenticationService} from '../src/lib/server/authentication';
import {migrationV16} from '../src/lib/server/growth-schema';
import {handleRequest} from '../src/lib/server/router';
import {DomainError} from '../src/lib/server/validation';
import {businessCategories} from '../src/lib/business-modes';
import {advanceVoice} from '../src/lib/voice/conversation';

const rejects=(code:string)=>(error:unknown)=>error instanceof DomainError&&error.code===code;
function fixture(category='restaurant',path=':memory:'){
 const store=new Store(path),session=store.register({name:'Growth merchant',email:randomUUID()+'@example.test',password:'Growth-fixture-2026',businessName:'Existing workspace',category}),user=session.user.id,business=session.businesses[0].id,growth=new BusinessGrowthService(store),saas=new SaaSService(store),customer=store.createContact(user,business,'customers',{name:'Rahul',phone:'9000000042'}),product=store.createProduct(user,business,{name:'Tea pack',unit:'piece',pricePaise:10000,costPaise:6000,quantityMilli:10000,minStockMilli:1000});
 return{store,user,business,growth,saas,customer,product};
}
function financial(store:Store,business:string){return Object.fromEntries(['invoices','payments','purchases','movements','expenses','customers','upi_transactions','upi_payment_origins','upi_customer_link_audit','upi_allocations'].map(table=>[table,store.db.prepare(`SELECT * FROM ${table} WHERE business_id=? ORDER BY rowid`).all(business)]));}
const activity=(kind='order',extra:Record<string,unknown>={})=>({kind,label:'Customer request',localStart:'2030-10-15T10:00',durationMinutes:30,confirm:true,idempotencyKey:randomUUID(),...extra});

test('all supported categories onboard with three business fields and keep existing account security',()=>{
 const store=new Store(':memory:');try{
  const account=store.register({name:'Owner',email:randomUUID()+'@example.test',password:'Growth-fixture-2026'}),saas=new SaaSService(store);
  assert.equal(account.businesses.length,0);
  for(const category of businessCategories){const input={merchantName:'Merchant',name:category+' business',category,idempotencyKey:randomUUID()},session=saas.onboard(account.user.id,input),shop=session.businesses.find(b=>b.name===input.name)!;assert.equal(shop.category,category);assert.equal(session.user.name,'Merchant');assert.equal(saas.onboard(account.user.id,input).businesses.length,session.businesses.length);assert.throws(()=>saas.onboard(account.user.id,{...input,merchantName:'Changed'}),rejects('IDEMPOTENCY_CONFLICT'));assert.equal(store.state(account.user.id,shop.id).invoices.length,0);assert.equal(store.state(account.user.id,shop.id).products.length,0);}
  store.db.prepare('UPDATE users SET verification_required=1,email_verified=0 WHERE id=?').run(account.user.id);
  assert.throws(()=>saas.onboard(account.user.id,{name:'Bypass',category:'retail',idempotencyKey:randomUUID()}),rejects('EMAIL_UNVERIFIED'));
 }finally{store.close();}
});

test('category and optional tools update atomically without rewriting historical financial records',()=>{
 const f=fixture();try{f.store.createInvoice(f.user,f.business,{customerId:f.customer.id,items:[{productId:f.product.id,quantityMilli:1000}],payments:[{method:'cash',amountPaise:4000}],idempotencyKey:randomUUID()});const before=financial(f.store,f.business),config=f.saas.configuration(f.user,f.business),mode=f.growth.mode(f.user,f.business),features=config.features;
  assert.throws(()=>f.growth.saveMode(f.user,f.business,{category:'salon',shopRevision:99,orders:false,appointments:true,revision:mode.revision,confirm:true}),rejects('STALE_SETTINGS'));
  assert.deepEqual(f.growth.mode(f.user,f.business),mode);
  const saved=f.growth.saveMode(f.user,f.business,{category:'salon',shopRevision:config.revision,orders:false,appointments:true,revision:mode.revision,confirm:true});assert.equal(saved.category,'salon');assert.equal(saved.appointments,true);assert.deepEqual(financial(f.store,f.business),before);assert.deepEqual(f.saas.configuration(f.user,f.business).features,features);
  assert.throws(()=>f.growth.saveMode(f.user,f.business,{category:'grocery',shopRevision:config.revision+1,orders:true,appointments:false,revision:0,confirm:true}),rejects('STALE_SETTINGS'));assert.equal(f.growth.mode(f.user,f.business).category,'salon');
 }finally{f.store.close();}
});

test('recorded orders, table labels and status retries never generate sales, receipts or stock movements',()=>{
 const f=fixture();try{const before=financial(f.store,f.business),input=activity('order',{customerId:f.customer.id,tableLabel:'Table 4'}),record=f.growth.createActivity(f.user,f.business,input);assert.equal(record.customerId,f.customer.id);assert.equal(record.tableLabel,'Table 4');assert.deepEqual(f.growth.createActivity(f.user,f.business,input),record);assert.throws(()=>f.growth.createActivity(f.user,f.business,{...input,label:'Changed'}),rejects('IDEMPOTENCY_CONFLICT'));const transition={status:'completed',revision:0,confirm:true,idempotencyKey:randomUUID()},done=f.growth.transition(f.user,f.business,record.id,transition);assert.equal(done.status,'completed');assert.deepEqual(f.growth.transition(f.user,f.business,record.id,transition),done);assert.throws(()=>f.growth.transition(f.user,f.business,record.id,{...transition,status:'cancelled',revision:1,idempotencyKey:randomUUID()}),rejects('CONFLICT'));assert.equal(f.growth.activities(f.user,f.business,{start:'2030-10-15'}).records.length,1);assert.deepEqual(financial(f.store,f.business),before);
 }finally{f.store.close();}
});

test('appointments check overlap in shop timezone and allow an adjacent slot or a cancelled slot',()=>{
 const f=fixture('salon');try{const first=f.growth.createActivity(f.user,f.business,activity('appointment'));assert.equal(first.scheduledAt,'2030-10-15T04:30:00.000Z');assert.equal(first.endsAt,'2030-10-15T05:00:00.000Z');assert.throws(()=>f.growth.createActivity(f.user,f.business,activity('appointment',{localStart:'2030-10-15T10:15'})),rejects('BOOKING_CONFLICT'));f.growth.createActivity(f.user,f.business,activity('appointment',{localStart:'2030-10-15T10:30'}));f.growth.transition(f.user,f.business,first.id,{status:'cancelled',revision:0,confirm:true,idempotencyKey:randomUUID()});f.growth.createActivity(f.user,f.business,activity('appointment'));assert.equal(f.growth.activities(f.user,f.business,{kind:'appointment',start:'2030-10-15'}).records.length,3);assert.throws(()=>f.growth.createActivity(f.user,f.business,activity('appointment',{localStart:'2030-02-30T10:00'})),rejects('INVALID_INPUT'));assert.throws(()=>f.growth.createActivity(f.user,f.business,activity('appointment',{localStart:'2030-10-15T25:00'})),rejects('INVALID_TIME'));
 }finally{f.store.close();}
});

test('disabling and re-enabling a category tool retains records and unique customer IDs',()=>{
 const f=fixture();try{const a=f.growth.createActivity(f.user,f.business,activity('order',{customerId:f.customer.id}));f.growth.saveMode(f.user,f.business,{orders:false,appointments:false,revision:0,confirm:true});assert.throws(()=>f.growth.activities(f.user,f.business),rejects('FEATURE_DISABLED'));f.growth.saveMode(f.user,f.business,{orders:true,appointments:false,revision:1,confirm:true});assert.equal(f.growth.activities(f.user,f.business,{start:'2030-10-15'}).records[0].id,a.id);assert.equal(f.growth.activities(f.user,f.business,{start:'2030-10-15'}).records[0].customerId,f.customer.id);
 }finally{f.store.close();}
});

test('activities and services enforce business scope, customer scope, permissions and revoked retry access',()=>{
 const f=fixture();try{const other=f.store.register({name:'Other',email:randomUUID()+'@example.test',password:'Growth-fixture-2026',businessName:'Other',category:'salon'}),id=other.user.id,foreign=f.store.createContact(id,other.businesses[0].id,'customers',{name:'Rahul'});assert.throws(()=>f.growth.createActivity(f.user,f.business,activity('order',{customerId:foreign.id})),rejects('NOT_FOUND'));assert.throws(()=>f.growth.summary(id,f.business),rejects('NOT_FOUND'));assert.throws(()=>f.growth.export(id,f.business),rejects('NOT_FOUND'));f.store.db.prepare('INSERT INTO memberships VALUES(?,?,?,?)').run(id,f.business,'staff','{}');assert.throws(()=>f.growth.saveMode(id,f.business,{orders:true,appointments:true,revision:0,confirm:true}),rejects('FORBIDDEN'));assert.throws(()=>f.growth.createService(id,f.business,{name:'Cut',pricePaise:5000,confirm:true,idempotencyKey:randomUUID()}),rejects('FORBIDDEN'));const input=activity(),record=f.growth.createActivity(id,f.business,input),change={status:'in_progress',revision:0,confirm:true,idempotencyKey:randomUUID()};f.growth.transition(id,f.business,record.id,change);f.store.db.prepare('UPDATE memberships SET permissions_json=? WHERE user_id=? AND business_id=?').run('{"sales":false}',id,f.business);assert.throws(()=>f.growth.transition(id,f.business,record.id,change),rejects('FORBIDDEN'));assert.throws(()=>f.growth.createActivity(id,f.business,input),rejects('FORBIDDEN'));
 }finally{f.store.close();}
});

test('service invoices reuse receipt, rounding and cancellation workflows without creating stock',()=>{
 const f=fixture('services');try{const input={name:'Consultation',pricePaise:25001,costPaise:8000,confirm:true,idempotencyKey:randomUUID()},service=f.growth.createService(f.user,f.business,input);assert.equal(service.stockTracked,false);assert.equal(f.growth.createService(f.user,f.business,input).id,service.id);const before=f.store.state(f.user,f.business),request={items:[{productId:service.id,quantityMilli:2000}],customerId:f.customer.id,payments:[{method:'cash',amountPaise:10000}],idempotencyKey:randomUUID()},invoice=f.store.createInvoice(f.user,f.business,request);assert.equal(invoice.totalPaise,50002);assert.equal(invoice.balancePaise,40002);assert.equal(invoice.items[0].stockTracked,false);assert.equal(f.store.createInvoice(f.user,f.business,request).id,invoice.id);let state=f.store.state(f.user,f.business);assert.equal(state.payments.length,1);assert.equal(state.movements.length,before.movements.length);assert.equal(state.products.find(p=>p.id===service.id)!.quantityMilli,0);f.store.cancelInvoice(f.user,f.business,invoice.id);f.store.cancelInvoice(f.user,f.business,invoice.id);state=f.store.state(f.user,f.business);assert.equal(state.payments.filter(p=>p.kind==='refund').length,1);assert.equal(new ClosingService(f.store).preview(f.user,f.business).totals.netSalesPaise,0);assert.equal(new ClosingService(f.store).preview(f.user,f.business).totals.returnsPaise,50002);assert.equal(state.movements.length,before.movements.length);assert.equal(state.customers.find(c=>c.id===f.customer.id)!.balancePaise,0);assert.equal(state.products.find(p=>p.id===service.id)!.quantityMilli,0);
 }finally{f.store.close();}
});

test('mixed service and goods invoices deduct and restore only the physical goods',()=>{
 const f=fixture('retail');try{const service=f.growth.createService(f.user,f.business,{name:'Installation',pricePaise:5000,costPaise:1000,confirm:true,idempotencyKey:randomUUID()}),before=f.store.state(f.user,f.business).movements.length,invoice=f.store.createInvoice(f.user,f.business,{items:[{productId:f.product.id,quantityMilli:2000},{productId:service.id,quantityMilli:1000}],payments:[{method:'cash',amountPaise:25000}],idempotencyKey:randomUUID()});let state=f.store.state(f.user,f.business);assert.equal(invoice.totalPaise,25000);assert.equal(state.products.find(p=>p.id===f.product.id)!.quantityMilli,8000);assert.equal(state.movements.length,before+1);assert.throws(()=>f.store.createInvoice(f.user,f.business,{items:[{productId:f.product.id,quantityMilli:20000}],payments:[],idempotencyKey:randomUUID()}),rejects('INSUFFICIENT_STOCK'));f.store.cancelInvoice(f.user,f.business,invoice.id);state=f.store.state(f.user,f.business);assert.equal(state.products.find(p=>p.id===f.product.id)!.quantityMilli,10000);assert.equal(state.products.find(p=>p.id===service.id)!.quantityMilli,0);assert.equal(state.movements.length,before+2);
 }finally{f.store.close();}
});

test('services reject stock receipts, stock correction, purchases and conversion into tracked goods',()=>{
 const f=fixture('salon');try{const service=f.growth.createService(f.user,f.business,{name:'Haircut',pricePaise:25000,costPaise:0,confirm:true,idempotencyKey:randomUUID()}),supplier=f.store.createContact(f.user,f.business,'suppliers',{name:'Supplier'}),before=financial(f.store,f.business);assert.throws(()=>f.store.adjustStock(f.user,f.business,{productId:service.id,quantityMilli:1000,reason:'receipt',idempotencyKey:randomUUID()}),rejects('INVALID_INPUT'));assert.throws(()=>f.store.receiveStockBatch(f.user,f.business,{source:'manual',items:[{productId:service.id,quantityMilli:1000,unit:'unit'}],idempotencyKey:randomUUID()}),rejects('INVALID_INPUT'));assert.throws(()=>f.store.createPurchase(f.user,f.business,{supplierId:supplier.id,items:[{productId:service.id,quantityMilli:1000,costPaise:500}],paidPaise:0,idempotencyKey:randomUUID()}),rejects('INVALID_INPUT'));assert.throws(()=>f.store.editProduct(f.user,f.business,service.id,{stockTracked:true}),rejects('INVALID_INPUT'));assert.throws(()=>f.store.editProduct(f.user,f.business,service.id,{minStockMilli:1000}),rejects('INVALID_INPUT'));assert.throws(()=>f.saas.reorder(f.user,f.business,{productId:service.id,quantityMilli:1000,requestIds:[],idempotencyKey:randomUUID()}),rejects('INVALID_INPUT'));assert.deepEqual(financial(f.store,f.business),before);assert.equal(f.growth.summary(f.user,f.business).lowStock,0);assert.equal(new ClosingService(f.store).preview(f.user,f.business).inventory.some(p=>p.productId===service.id),false);
 }finally{f.store.close();}
});

test('new service snapshots remain stock-free after catalogue edits and regular history stays immutable',()=>{
 const f=fixture('services');try{const service=f.growth.createService(f.user,f.business,{name:'Repair',pricePaise:10101,costPaise:0,confirm:true,idempotencyKey:randomUUID()}),invoice=f.store.createInvoice(f.user,f.business,{items:[{productId:service.id,quantityMilli:1000}],payments:[{method:'cash',amountPaise:10101}],idempotencyKey:randomUUID()}),original=financial(f.store,f.business);f.store.editProduct(f.user,f.business,service.id,{name:'New repair',pricePaise:20000});assert.deepEqual(financial(f.store,f.business),original);assert.equal(f.store.state(f.user,f.business).invoices[0].items[0].name,'Repair');assert.equal(invoice.items[0].stockTracked,false);
 }finally{f.store.close();}
});

test('Ask My Shop keeps recorded sales, manual UPI receipts and provider-verified collections distinct',()=>{
 const f=fixture('grocery');try{f.store.createInvoice(f.user,f.business,{customerId:f.customer.id,items:[{productId:f.product.id,quantityMilli:1000}],payments:[{method:'upi',amountPaise:4000}],idempotencyKey:randomUUID()});const before=financial(f.store,f.business),summary=f.growth.summary(f.user,f.business);assert.equal(summary.demo,false);assert.equal(summary.report.salesPaise,10000);assert.equal(summary.verifiedUpiPaise,0);assert.equal(summary.outstandingPaise,6000);assert.equal(summary.unmatched,0);assert.equal(summary.ordersToday,null);assert.equal(summary.bookingsTomorrow,null);assert.deepEqual(financial(f.store,f.business),before);for(const language of ['en','hi','hinglish'] as const){const answer=f.growth.voice(f.user,f.business,'shopSummary',language);assert.equal(answer.destination,'shop');assert.ok(answer.answer.every(a=>a.value&&!a.label.includes('growth.')));}
 }finally{f.store.close();}
});

test('growth summaries hide disallowed balances and payments rather than inventing zero',()=>{
 const f=fixture();try{const other=f.store.register({name:'Limited',email:randomUUID()+'@example.test',password:'Growth-fixture-2026'}).user.id;f.store.db.prepare('INSERT INTO memberships VALUES(?,?,?,?)').run(other,f.business,'staff',JSON.stringify({reports:true,payments:false,customers:false,sales:false,inventory:false}));const summary=f.growth.summary(other,f.business);assert.equal(summary.verifiedUpiPaise,null);assert.equal(summary.outstandingPaise,null);assert.equal(summary.unmatched,null);assert.equal(summary.lowStock,null);assert.equal(summary.ordersToday,null);assert.deepEqual(summary.actions,[]);assert.equal(f.growth.trust(other,f.business).canExport,false);assert.equal(f.growth.trust(other,f.business).audit.length,0);
 }finally{f.store.close();}
});

test('test collections are visibly labelled and qualified activity questions never receive aggregate counts',()=>{
 const f=fixture(),old=process.env.RAZORPAY_MODE;try{process.env.RAZORPAY_MODE='test';assert.equal(f.growth.summary(f.user,f.business).upiTestMode,true);assert.ok(f.growth.voice(f.user,f.business,'shopSummary','en').answer.some(a=>/test/i.test(a.value)));const state=f.saas.state(f.user,f.business);for(const raw of ['How many orders did Rahul place today?','Rahul ke kitne orders aaye?','How many orders this month?','Kal kitni bookings thi?'])assert.ok(!['businessOrders','businessBookings'].includes(advanceVoice(raw,state).fields.report),raw);}
 finally{if(old===undefined)delete process.env.RAZORPAY_MODE;else process.env.RAZORPAY_MODE=old;f.store.close();}
});

test('cancellation migration recovers the actual audited event without changing original payment history',()=>{
 const f=fixture('services');try{const service=f.growth.createService(f.user,f.business,{name:'Service',pricePaise:12345,costPaise:1000,confirm:true,idempotencyKey:randomUUID()}),invoice=f.store.createInvoice(f.user,f.business,{items:[{productId:service.id,quantityMilli:1000}],payments:[{method:'cash',amountPaise:12345}],idempotencyKey:randomUUID()});f.store.cancelInvoice(f.user,f.business,invoice.id);const before=financial(f.store,f.business),original=f.store.db.prepare('SELECT * FROM invoice_cancellations WHERE invoice_id=?').get(invoice.id);f.store.db.exec('DROP TABLE invoice_cancellations; PRAGMA user_version=15;');f.store.db.exec(migrationV16);assert.deepEqual(f.store.db.prepare('SELECT * FROM invoice_cancellations WHERE invoice_id=?').get(invoice.id),original);assert.deepEqual(financial(f.store,f.business),before);assert.equal(new ClosingService(f.store).preview(f.user,f.business).totals.netSalesPaise,0);assert.equal(f.store.db.prepare('SELECT COUNT(*) n FROM movements WHERE reference_id=?').get(invoice.id)!.n,0);}
 finally{f.store.close();}
});

test('business-aware voice recognises three languages, preserves sale commands and labels unsupported tools',()=>{
 const f=fixture('grocery');try{const state=f.saas.state(f.user,f.business);for(const utterance of ['What needs attention in my business today?','Aaj mere business mein kis cheez par dhyan dena chahiye?','आज मेरे बिजनेस में किस चीज पर ध्यान देना चाहिए?','Aaj meri dukaan ka hisaab batao.'])assert.equal(advanceVoice(utterance,state).fields.report,'shopSummary',utterance);for(const utterance of ['Aaj kitne orders aaye?','How many orders today?','आज कितने ऑर्डर आए?'])assert.equal(advanceVoice(utterance,state).fields.report,'businessOrders');for(const utterance of ['Kal kitni bookings hain?','How many appointments tomorrow?','कल कितनी बुकिंग हैं?']){const command=advanceVoice(utterance,state);assert.equal(command.fields.report,'businessBookings');assert.equal(command.fields.period,'tomorrow');}assert.equal(advanceVoice('Rahul ka bill banao 1 piece Tea pack 100 rupaye cash',state).intent,'sale');const result=f.growth.voice(f.user,f.business,'businessOrders','en');assert.ok(result.answer.some(v=>v.value.includes('not enabled')));assert.ok(!result.answer.some(v=>v.value==='0'));assert.equal(f.store.state(f.user,f.business).invoices.length,0);
 }finally{f.store.close();}
});

test('counts are complete beyond the 500-row list limit and cancelled activities are excluded',()=>{
 const f=fixture();try{const summary=f.growth.summary(f.user,f.business),stamp=summary.day+'T06:00:00.000Z',insert=f.store.db.prepare('INSERT INTO business_activities VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)');f.store.transaction(()=>{for(let i=0;i<502;i++)insert.run(randomUUID(),f.business,'order','Order '+i,null,stamp,null,'','scheduled',0,stamp,stamp,f.user);insert.run(randomUUID(),f.business,'order','Cancelled',null,stamp,null,'','cancelled',0,stamp,stamp,f.user);});assert.equal(f.growth.summary(f.user,f.business).ordersToday,502);assert.ok(f.growth.voice(f.user,f.business,'businessOrders','en').answer.some(v=>v.value==='502'));const list=f.growth.activities(f.user,f.business,{start:summary.day});assert.equal(list.records.length,500);assert.equal(list.truncated,true);
 }finally{f.store.close();}
});

test('trust reports genuine permissions, server response and unknown backup and checkout states',()=>{
 const f=fixture();try{const trust=f.growth.trust(f.user,f.business);assert.equal(trust.role,'owner');assert.equal(trust.emailVerified,false);assert.equal(trust.backup.status,'unreported');assert.equal(trust.checkoutAvailable,false);assert.equal(trust.demo,false);assert.ok(Number.isFinite(Date.parse(trust.serverAnsweredAt)));assert.equal(trust.canExport,true);assert.ok(trust.audit.length>0);const exported=f.growth.export(f.user,f.business);assert.ok('business_activities' in exported);assert.ok('upi_payment_origins' in exported);assert.ok(!('upi_authorisations' in exported));assert.ok(!('users' in exported));assert.ok(!JSON.stringify(exported).includes('password_hash'));
 }finally{f.store.close();}
});

test('referral retries reuse an opaque scoped link and private feedback records explicit publication permission',()=>{
 const f=fixture();try{const before=financial(f.store,f.business),ref=f.growth.referral(f.user,f.business,{confirm:true});assert.match(ref.code,/^[A-Za-z0-9_-]{24}$/);assert.equal(f.growth.referral(f.user,f.business,{confirm:true}).path,ref.path);assert.throws(()=>f.growth.referral(f.user,f.business,{confirm:false}),rejects('INVALID_INPUT'));const input={body:'Useful daily records',publicationPermission:false,confirm:true,idempotencyKey:randomUUID()},feedback=f.growth.feedback(f.user,f.business,input);assert.equal(feedback.published,false);assert.deepEqual(f.growth.feedback(f.user,f.business,input),feedback);assert.equal(f.store.db.prepare('SELECT publication_permission FROM business_feedback WHERE id=?').get(feedback.id)!.publication_permission,0);assert.throws(()=>f.growth.feedback(f.user,f.business,{...input,publicationPermission:true}),rejects('IDEMPOTENCY_CONFLICT'));assert.deepEqual(financial(f.store,f.business),before);
 }finally{f.store.close();}
});

test('demo activity reset stays isolated and does not leak sample records or invite links to real accounts',()=>{
 const f=fixture('grocery');try{const before=financial(f.store,f.business),demo=f.store.demo(),business=demo.businesses[0].id;f.growth.saveMode(demo.user.id,business,{orders:true,appointments:false,revision:0,confirm:true});f.growth.createActivity(demo.user.id,business,activity('order',{customerId:f.store.state(demo.user.id,business).customers[0].id}));assert.equal(f.growth.summary(demo.user.id,business).demo,true);assert.throws(()=>f.growth.referral(demo.user.id,business,{confirm:true}),rejects('DEMO_RESTRICTED'));f.store.resetDemo(demo.user.id);assert.equal(f.store.db.prepare('SELECT COUNT(*) n FROM business_activities WHERE business_id=?').get(business)!.n,0);assert.deepEqual(financial(f.store,f.business),before);assert.equal(f.store.db.prepare('PRAGMA foreign_key_check').all().length,0);
 }finally{f.store.close();}
});

test('a genuine invite attributes only the new account and grants no money, membership or entitlement',async()=>{
 const f=fixture(),directory=mkdtempSync(join(tmpdir(),'growth-mail-')),env={NODE_ENV:process.env.NODE_ENV,AUTH_EMAIL_MODE:process.env.AUTH_EMAIL_MODE,AUTH_MAIL_DIRECTORY:process.env.AUTH_MAIL_DIRECTORY};
 try{Object.assign(process.env,{NODE_ENV:'test',AUTH_EMAIL_MODE:'file',AUTH_MAIL_DIRECTORY:directory});const before=financial(f.store,f.business),ref=f.growth.referral(f.user,f.business,{confirm:true}),account=await new AuthenticationService(f.store).register({name:'Invited Merchant',email:randomUUID()+'@example.test',password:'Growth-fixture-2026',referralCode:ref.code,language:'hi'});assert.equal(account.businesses.length,0);assert.equal(account.user.emailVerified,false);const attribution=f.store.db.prepare('SELECT * FROM referral_attributions WHERE user_id=?').get(account.user.id)!;assert.equal(attribution.business_id,f.business);assert.throws(()=>f.growth.trust(account.user.id,f.business),rejects('NOT_FOUND'));assert.deepEqual(financial(f.store,f.business),before);}
 finally{for(const [key,value]of Object.entries(env))if(value===undefined)delete process.env[key];else process.env[key]=value;f.store.close();rmSync(directory,{recursive:true,force:true});}
});

test('growth endpoints require authentication, same-origin confirmation, membership and permission',async()=>{
 const f=fixture();try{const base='http://localhost',path='/api/businesses/'+f.business+'/business-growth',cookie='dukaanset_session='+f.store.issueSession(f.user),post=(origin:string,body:unknown)=>new Request(base+path+'/activity',{method:'POST',headers:{Cookie:cookie,Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(body)});assert.equal((await handleRequest(new Request(base+path+'/summary'),f.store)).status,401);assert.equal((await handleRequest(post('https://hostile.test',activity()),f.store)).status,403);assert.equal((await handleRequest(post(base,activity('order',{confirm:false})),f.store)).status,400);const saved=await handleRequest(post(base,activity()),f.store);assert.equal(saved.status,201);const id=(await saved.json()).id;const status=await handleRequest(new Request(base+path+'/status/'+id,{method:'POST',headers:{Cookie:cookie,Origin:base,'Content-Type':'application/json'},body:JSON.stringify({status:'completed',revision:0,confirm:true,idempotencyKey:randomUUID()})}),f.store);assert.equal(status.status,200);const summary=await handleRequest(new Request(base+path+'/summary',{headers:{Cookie:cookie}}),f.store);assert.equal(summary.status,200);assert.equal(summary.headers.get('cache-control'),'no-store');assert.equal((await handleRequest(new Request(base+path+'/activity',{headers:{Cookie:cookie}}),f.store)).status,405);
 }finally{f.store.close();}
});

test('schema 17 migration preserves legacy goods, invoice snapshots, payment amounts and timestamps',()=>{
 const directory=mkdtempSync(join(tmpdir(),'dukaanset-growth-')),path=join(directory,'qa.sqlite');let store:Store|null=null;try{const f=fixture('retail',path);store=f.store;store.createInvoice(f.user,f.business,{customerId:f.customer.id,items:[{productId:f.product.id,quantityMilli:1000}],payments:[{method:'cash',amountPaise:5000}],idempotencyKey:randomUUID()});const before=financial(store,f.business);for(const table of ['document_import_claims','document_captures','invoice_cancellations','business_feedback','referral_attributions','business_referrals','business_activities','business_growth_settings'])store.db.exec('DROP TABLE '+table);store.db.exec('ALTER TABLE products DROP COLUMN stock_tracked; PRAGMA user_version=14;');store.close();store=new Store(path);assert.equal(store.db.prepare('PRAGMA user_version').get()!.user_version,17);assert.deepEqual(financial(store,f.business),before);assert.equal(store.state(f.user,f.business).products[0].stockTracked,undefined);assert.equal(store.state(f.user,f.business).invoices[0].items[0].stockTracked,undefined);assert.equal(store.db.prepare('PRAGMA foreign_key_check').all().length,0);
 }finally{store?.close();rmSync(directory,{recursive:true,force:true});}
});
