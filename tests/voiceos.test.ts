import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Store } from '../src/lib/server/store';
import { SaaSService } from '../src/lib/server/saas';
import { detectIntent,formVoiceContext,interpretVoice,missingVoiceFields,resolveVoiceProduct,spokenText,spokenStockText,reportAnswer,voiceQuantity,voiceNavigation } from '../src/lib/voice/os';
import { parseVoiceTranscript } from '../src/lib/voice/parser';
import { SAMPLE_COMMAND } from '../src/lib/voice/copy';
import { DomainError } from '../src/lib/server/validation';
import { randomUUID } from 'node:crypto';

function fixture(){const store=new Store(':memory:'),session=store.demo(),business=session.businesses.find(b=>b.category==='clothing')!,state=new SaaSService(store).state(session.user.id,business.id);return{store,session,business,state};}
test('VoiceOS separates sale, old-credit collection, demand, expense, order and receipt intents',()=>{
 assert.equal(detectIntent('Rahul ne purane udhaar ke paanch sau rupaye cash diye'),'payment');
 assert.equal(detectIntent('Rahul ko 2 shirts bechi, baaki udhaar'),'sale');
 assert.equal(detectIntent('Ek customer ne 2 XL blue shirts maangi thi, available nahi hain'),'demand');
 assert.equal(detectIntent('Gupta Traders se 20 biscuit packet aayi hai'),'purchase');
 assert.equal(detectIntent('XL blue shirt ka reorder draft banao'),'reorder');
 assert.equal(detectIntent('1500 rupaye bijli ka bill cash diya'),'expense');
});
test('spoken numbers retain exact thousandths and hundreds/thousands in all input languages',()=>{
 assert.equal(spokenText('paanch sau rupaye aur ek hazaar rupaye'),'500 rupaye aur 1000 rupaye');
 assert.equal(spokenText('पाँच सौ रुपये और एक हजार रुपये'),'500 रुपये और 1000 रुपये');
 assert.equal(spokenText('one thousand two hundred fifty'),'1250');
 assert.equal(spokenText('aadha kilo dedh kilo dhai kilo'),'0.5 kilo 1.5 kilo 2.5 kilo');
 assert.equal(spokenText('actual cash 12,500 rupaye hai'),'actual cash 12500 rupaye hai');
 assert.equal(spokenText('quantity teen kar do'),'quantity 3 kar do');
});
test('base product names do not hide competing clothing variants and price basis is explicit',()=>{
 const f=fixture();try{const c=interpretVoice('Rahul ko 2 blue shirts 899 ki ek bechi, 1000 cash mila aur 500 UPI se, baaki udhaar',f.state);
 assert.equal(c.intent,'sale');assert.equal(c.fields.customerId,f.state.customers[0].id);assert.equal(c.fields.cash,'1000');assert.equal(c.fields.upi,'500');assert.equal(c.items.length,1);assert.equal(c.items[0].quantity,'2');assert.equal(c.items[0].price,'899');assert.equal(c.items[0].priceBasis,'unit');assert.equal(c.items[0].productId,'');assert.equal(c.items[0].candidates.length,2);
 assert.ok(missingVoiceFields(c,f.state).includes('product'));
 const xl=resolveVoiceProduct('blue shirt XL',f.state.products);assert.equal(xl.ids.length,1);assert.equal(f.state.products.find(p=>p.id===xl.ids[0])?.variation,'XL');
 const unclear=interpretVoice('2 blue shirts 899 ki',f.state,'sale');assert.equal(unclear.items[0].priceBasis,'unclear');
 }finally{f.store.close();}
});
test('active draft corrections patch one amount without adding items or replacing earlier receipts',()=>{
 const f=fixture();try{let c=interpretVoice('Rahul ko 2 black T-shirts 499 ki ek bechi, 1000 cash mila',f.state,'sale');
 c=interpretVoice('Nahi, cash 800 tha',f.state,'sale',c);assert.equal(c.fields.cash,'800');assert.equal(c.items.length,1);assert.ok(!c.changedItems.length);
 c=interpretVoice('Quantity teen kar do',f.state,'sale',c);assert.equal(c.items[0].quantity,'3');assert.equal(c.fields.cash,'800');assert.equal(c.changedItems.length,1);
 }finally{f.store.close();}
});
test('Hindi customer references, phone digits and unit conversion resolve only scoped catalogue records',()=>{
 const f=fixture();try{const p=interpretVoice('राहुल शर्मा ने पुराने उधार के पाँच सौ रुपये नकद दिए',f.state);assert.equal(p.fields.customerId,f.state.customers[0].id);assert.equal(p.fields.amount,'500');assert.equal(p.fields.method,'cash');
 const c=interpretVoice('Naya customer add karo naam Amit Kumar phone nine eight seven six five four three two one zero',f.state);assert.equal(c.fields.name,'amit kumar');assert.equal(c.fields.phone,'9876543210');
 const shirt=f.state.products[0];assert.equal(voiceQuantity({id:'0',query:shirt.name,productId:shirt.id,candidates:[shirt.id],quantity:'0.5',unit:'piece',price:'',priceBasis:''},f.state.products),null);
 }finally{f.store.close();}
});
test('reports derive actual sales and collections and reject unpermitted access',()=>{
 const f=fixture();try{const c=interpretVoice('Aaj kitni sales hui',f.state);assert.equal(c.intent,'report');const answers=reportAnswer(c,f.state,'en');assert.equal(answers[0].value,new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(f.state.metrics.salesTodayPaise/100));
 const forbidden={...f.state,configuration:{...f.state.configuration,permissions:{...f.state.configuration.permissions,reports:false}}};assert.deepEqual(reportAnswer(c,forbidden,'en'),[]);
 }finally{f.store.close();}
});

test('missing quantities, prices and phone details fill the active draft without restarting',()=>{
 const f=fixture();try{let c=interpretVoice('Blue Casual Shirt ka bill banao',f.state,'sale');assert.equal(c.items[0].quantity,'');
 c=interpretVoice('2 piece',f.state,'sale',c);assert.equal(c.items.length,1);assert.equal(c.items[0].quantity,'2');
 c=interpretVoice('price 899 each',f.state,'sale',c);assert.equal(c.items[0].price,'899');assert.equal(c.items[0].priceBasis,'unit');
 let contact=interpretVoice('Create a new customer named Amit Kumar',f.state,'customer');contact=interpretVoice('phone 9876543210',f.state,'customer',contact);assert.equal(contact.fields.name,'amit kumar');assert.equal(contact.fields.phone,'9876543210');assert.deepEqual(contact.changed,['phone']);
 }finally{f.store.close();}
});
test('manual edits remain authoritative and a removal cannot resurrect an earlier voice line',()=>{
 const f=fixture();try{let c=interpretVoice('2 black T-shirt at 499 each',f.state,'sale');const product=c.items[0].productId;
 c=formVoiceContext(c,{cash:'750'},[{productId:product,quantity:'5',price:'475'}],f.state.products);c=interpretVoice('cash 800 tha',f.state,'sale',c);assert.equal(c.items[0].quantity,'5');assert.equal(c.items[0].price,'475');assert.equal(c.fields.cash,'800');
 c=interpretVoice('black T-shirt hatao',f.state,'sale',c);assert.equal(c.items.length,0);assert.deepEqual(c.removedProducts,[product]);
 }finally{f.store.close();}
});
test('demand visitors are separate from units; English, Hindi and Hinglish aliases span business categories',()=>{
 const f=fixture();try{const demo=interpretVoice('Ek customer ne 2 XL blue shirts maangi thi, lekin available nahi hain.',f.state);assert.equal(demo.items[0].quantity,'2');assert.equal(demo.warnings.length,0);assert.equal(demo.items[0].productId,f.state.products.find(p=>p.variation==='XL')!.id);
 const demand=interpretVoice('Teen customers ne XL shirts maangi, total 5 shirts',f.state,'demand');assert.equal(demand.fields.people,'3');assert.equal(demand.items[0].quantity,'5');assert.ok(demand.items[0].query.includes('xl'));
 const missing=interpretVoice('Teen customers ne XL shirts maangi',f.state,'demand');assert.equal(missing.items[0].quantity,'');
 const grocery=new SaaSService(f.store).state(f.session.user.id,f.session.businesses.find(b=>b.category==='grocery')!.id),c=interpretVoice('चार दूध पैकेट और पाँच किलो प्याज जोड़ो',grocery,'stock');assert.equal(c.items.length,2);assert.equal(voiceQuantity(c.items[0],grocery.products),4000);assert.equal(voiceQuantity(c.items[1],grocery.products),5000);
 const vegetables=new SaaSService(f.store).state(f.session.user.id,f.session.businesses.find(b=>b.category==='vegetables')!.id);assert.equal(voiceQuantity(interpretVoice('half kilo carrots add',vegetables,'stock').items[0],vegetables.products),500);
 const hardware=new SaaSService(f.store).state(f.session.user.id,f.session.businesses.find(b=>b.category==='hardware')!.id);assert.equal(voiceQuantity(interpretVoice('3 meter electrical wire add',hardware,'stock').items[0],hardware.products),3000);
 }finally{f.store.close();}
});
test('grouped currency, fractional repeats and numeric variants retain their intended meaning',()=>{
 const f=fixture();try{assert.equal(interpretVoice('Actual cash 12,500 rupaye hai',f.state).fields.actual,'12500');assert.equal(interpretVoice('Opening cash 1,25,000',f.state,'closing').fields.opening,'125000');const variant=interpretVoice('Denim Jeans 32 ka bill banao',f.state,'sale');assert.equal(variant.items[0].quantity,'');
 const grocery=new SaaSService(f.store).state(f.session.user.id,f.session.businesses.find(b=>b.category==='grocery')!.id),c=interpretVoice('0.1 kilo pyaz aur 0.2 kilo pyaz add',grocery,'stock');assert.equal(c.items[0].quantity,'0.3');
 }finally{f.store.close();}
});
test('reviewed sale price is a frozen invoice snapshot; retries deduct stock and record receipts once',()=>{
 const f=fixture();try{const product=f.state.products.find(p=>p.name==='Black T-Shirt')!,customer=f.state.customers[0],input={idempotencyKey:randomUUID(),customerId:customer.id,items:[{productId:product.id,quantityMilli:2000,pricePaise:89900}],payments:[{method:'cash',amountPaise:100000},{method:'upi',amountPaise:50000}]};const invoice=f.store.createInvoice(f.session.user.id,f.business.id,input);assert.equal(invoice.totalPaise,179800);assert.equal(invoice.balancePaise,29800);assert.deepEqual(f.store.createInvoice(f.session.user.id,f.business.id,input),invoice);
 const state=f.store.state(f.session.user.id,f.business.id);assert.equal(state.products.find(p=>p.id===product.id)!.pricePaise,49900);assert.equal(state.products.find(p=>p.id===product.id)!.quantityMilli,product.quantityMilli-2000);assert.equal(state.payments.filter(p=>p.invoiceId===invoice.id).length,2);
 assert.throws(()=>f.store.createInvoice(f.session.user.id,f.business.id,{...input,idempotencyKey:randomUUID(),items:[{productId:product.id,quantityMilli:1000,pricePaise:100},{productId:product.id,quantityMilli:1000,pricePaise:200}]}),DomainError);assert.deepEqual(f.store.state(f.session.user.id,f.business.id),state);
 }finally{f.store.close();}
});
test('voice contacts reject accidental duplicates, replay uncertain saves and remain tenant scoped',()=>{
 const f=fixture();try{const input={name:'Amit Kumar',phone:'9876543210',rejectDuplicate:true,idempotencyKey:randomUUID()},c=f.store.createContact(f.session.user.id,f.business.id,'customers',input);assert.equal(f.store.createContact(f.session.user.id,f.business.id,'customers',input).id,c.id);
 assert.throws(()=>f.store.createContact(f.session.user.id,f.business.id,'customers',{...input,idempotencyKey:randomUUID(),name:'Different name'}),(e:unknown)=>e instanceof DomainError&&e.code==='CONTACT_EXISTS');
 assert.ok(f.store.createContact(f.session.user.id,f.session.businesses[0].id,'customers',{...input,idempotencyKey:randomUUID()}));
 }finally{f.store.close();}
});
test('reports cover the full ledger beyond page limits and enforce role, feature and tenant access',()=>{
 const f=fixture();try{const user=f.session.user.id,business=f.business.id,prior=f.store.state(user,business).invoices[0];const insert=f.store.db.prepare('INSERT INTO invoices SELECT ?,business_id,?, ?,customer_id,customer_name,items_json,subtotal_paise,discount_paise,total_paise,paid_paise,original_paid_paise,balance_paise,payment_method,status,due_date FROM invoices WHERE id=?');f.store.transaction(()=>{for(let i=0;i<1001;i++)insert.run(randomUUID(),'HISTORY-'+i,new Date().toISOString(),prior.id);});
 assert.equal(f.store.state(user,business).invoices.length,1000);const report=f.store.voiceReport(user,business,'all');assert.equal(report.bills,1002);assert.equal(report.salesPaise,1002*prior.totalPaise);assert.equal(f.store.voiceReport(user,business,'today').bills,1001);
 const other=f.store.demo();assert.throws(()=>f.store.voiceReport(other.user.id,business,'all'),DomainError);
 new SaaSService(f.store).saveConfiguration(user,business,{features:{voiceStock:false},revision:0,idempotencyKey:randomUUID()});assert.throws(()=>f.store.voiceReport(user,business,'all'),(e:unknown)=>e instanceof DomainError&&e.code==='FEATURE_DISABLED');f.store.db.prepare("UPDATE memberships SET role='staff' WHERE user_id=? AND business_id=?").run(user,business);assert.throws(()=>f.store.voiceReport(user,business,'all'),DomainError);
 }finally{f.store.close();}
});
test('old-credit collections affect receipts and outstanding, never today’s sales',()=>{
 const f=fixture();try{const user=f.session.user.id,business=f.business.id,before=f.store.voiceReport(user,business,'today');assert.equal(f.state.customers[0].balancePaise,129900);const input={customerId:f.state.customers[0].id,amountPaise:50000,method:'cash',idempotencyKey:randomUUID()};const payment=f.store.receivePayment(user,business,input);assert.deepEqual(f.store.receivePayment(user,business,input),payment);const report=f.store.voiceReport(user,business,'today');assert.equal(report.salesPaise,before.salesPaise);assert.equal(report.cashPaise,before.cashPaise+50000);assert.equal(f.store.state(user,business).customers[0].balancePaise,79900);
 }finally{f.store.close();}
});
test('screen navigation honours business permissions and missing financial details remain explicit',()=>{
 const f=fixture();try{const stock=interpretVoice('Stock kholo',f.state);assert.equal(stock.intent,'open');assert.equal(voiceNavigation(stock,f.state),'/app/stock');assert.equal(voiceNavigation(interpretVoice('Rahul ka account kholo',f.state),f.state),'/app/customers/'+f.state.customers[0].id);
 const forbidden={...f.state,configuration:{...f.state.configuration,permissions:{...f.state.configuration.permissions,reports:false}}};assert.equal(voiceNavigation(interpretVoice('Reports kholo',f.state),forbidden),null);const bill=interpretVoice('Rahul ko 2 black T-shirt bechi',f.state);assert.ok(missingVoiceFields(bill,f.state).includes('salePayment'));
 const product=f.state.products[0],weighted={...product,unit:'g',name:'Rice',variation:'',aliases:[]},s={...f.state,products:[weighted]};const c=interpretVoice('2 kilo rice 100 ki ek bechi',s,'sale');assert.equal(c.items[0].priceBasis,'unclear');assert.equal(voiceQuantity(c.items[0],s.products),2000000);
 }finally{f.store.close();}
});
test('shared spoken-number preprocessing preserves the stock parser’s item and correction delimiters',()=>{
 const f=fixture();try{const grocery=new SaaSService(f.store).state(f.session.user.id,f.session.businesses.find(b=>b.category==='grocery')!.id);const sample=parseVoiceTranscript(spokenStockText(SAMPLE_COMMAND),grocery.products);assert.equal(sample.length,5);const corrected=parseVoiceTranscript(spokenStockText('10 kilo aloo add karo... nahi, 5 kilo aloo, pyaz add kar do'),grocery.products);assert.equal(corrected[0].quantity,'5');assert.equal(corrected[1].quantity,'');
 }finally{f.store.close();}
});
