import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {Store} from '../src/lib/server/store';
import {SaaSService} from '../src/lib/server/saas';
import {advanceVoice,nextVoiceQuestion,salePreview,commandCustomerName} from '../src/lib/voice/conversation';
import {prepareStockCommand,stockBatchItem} from '../src/lib/voice/stock-command';
import {DomainError} from '../src/lib/server/validation';
import {readConversationSession} from '../src/lib/voice/session';
function fixture(){const store=new Store(':memory:'),session=store.demo(),business=session.businesses.find(b=>b.category==='vegetables')!;store.createContact(session.user.id,business.id,'customers',{name:'Chetna',phone:''});return{store,session,business,state:new SaaSService(store).state(session.user.id,business.id)};}
test('global explicit intents override page context and create/customer bill priorities',()=>{
 const f=fixture();try{
  let c=advanceVoice('Chetna ke naam se customer add kar do',f.state);assert.equal(c.intent,'customer');assert.equal(c.fields.name,'Chetna');
  c=advanceVoice('Chetna ka 200 bill banao',f.state,c);assert.equal(c.intent,'sale');assert.equal(c.fields.total,'200');assert.equal(nextVoiceQuestion(c,f.state),'items');
  c=advanceVoice('Rahul ke purane udhaar ka 500 cash payment record karo',f.state,c);assert.equal(c.intent,'payment');
  c=advanceVoice('20 kilo aloo stock add karo',f.state,c);assert.equal(c.intent,'stock');
 }finally{f.store.close();}
});
test('multi-turn sale preserves customer, associates a total with quantity and asks for payment',()=>{
 const f=fixture();try{
  let c=advanceVoice('Chetna ka bill banao',f.state);assert.equal(c.fields.customerId,f.state.customers.find(c=>c.name==='Chetna')!.id);assert.equal(nextVoiceQuestion(c,f.state),'items');
  c=advanceVoice('5 kilo aloo',f.state,c);assert.equal(c.items.length,1);assert.equal(c.items[0].quantity,'5');
  c=advanceVoice('200 rupaye',f.state,c);assert.equal(c.items.length,1);assert.equal(c.items[0].price,'40');assert.equal(nextVoiceQuestion(c,f.state),'salePayment');
  c=advanceVoice('Cash',f.state,c);assert.equal(c.items.length,1);assert.equal(nextVoiceQuestion(c,f.state),'');const sale=salePreview(c,f.state.products);assert.equal(sale.total,20000);assert.equal(sale.cash,20000);assert.equal(sale.pending,0);
 }finally{f.store.close();}
});
test('complete sale and split credit never invent payment methods',()=>{
 const f=fixture();try{
  const c=advanceVoice('Chetna ko 5 kilo aloo 200 rupaye mein beche, 100 cash mila aur 100 udhaar hai',f.state);assert.equal(c.intent,'sale');assert.equal(c.items.length,1);assert.equal(salePreview(c,f.state.products).total,20000);assert.equal(salePreview(c,f.state.products).pending,10000);
  const missing=advanceVoice('Chetna ko 5 kilo aloo 200 rupaye mein beche',f.state);assert.equal(nextVoiceQuestion(missing,f.state),'salePayment');
 }finally{f.store.close();}
});
test('dependent customer and invoice roll back as one transaction and replay only once',()=>{
 const f=fixture();try{
  const c=advanceVoice('Neel customer add karo aur uska 5 kilo aloo 200 rupaye mein bill bana do, cash mila',f.state);assert.equal(c.intent,'sale');assert.equal(c.fields.createCustomer,'true');assert.equal(c.fields.name,'Neel');
  const p=f.state.products.find(p=>p.aliases.includes('aloo'))||f.state.products.find(p=>p.name==='Potatoes')!;assert.ok(p);
  const request={idempotencyKey:randomUUID(),newCustomer:{name:'New Voice Customer',phone:''},sale:{items:[{productId:p.id,quantityMilli:p.quantityMilli+1000}],payments:[],discountPaise:0,customerId:null,dueDate:null}};
  assert.throws(()=>f.store.createVoiceSale(f.session.user.id,f.business.id,request),(error:unknown)=>error instanceof DomainError&&error.code==='INSUFFICIENT_STOCK');assert.equal(f.store.db.prepare("SELECT id FROM customers WHERE name='New Voice Customer'").all().length,0);
  request.sale.items[0].quantityMilli=1000;const invoice=f.store.createVoiceSale(f.session.user.id,f.business.id,request);assert.deepEqual(f.store.createVoiceSale(f.session.user.id,f.business.id,request),invoice);assert.equal(f.store.db.prepare("SELECT id FROM customers WHERE name='New Voice Customer'").all().length,1);assert.equal(f.store.db.prepare('SELECT id FROM invoices WHERE id=?').all(invoice.id).length,1);
 }finally{f.store.close();}
});
test('stock automatically drafts absent products, exact aliases and adjacent quantities',()=>{
 const f=fixture();try{
  const rows=prepareStockCommand('10 kilo pyaj 2 kilo Aalu add kar do kar do',[]);assert.equal(rows.length,2);assert.equal(rows[0].quantity,'10');assert.equal(rows[1].quantity,'2');assert.ok(rows.every(row=>row.newProduct&&!row.productId));assert.ok(rows.every(row=>row.issues.includes('productDetails')));
  const known=prepareStockCommand('2 kilo aalu add karo',f.state.products);assert.equal(known.length,1);assert.ok(known[0].productId);assert.equal(known[0].newProduct,undefined);
 }finally{f.store.close();}
});
test('stock selling and purchase prices remain separate, ambiguous amounts need clarification',()=>{
 let rows=prepareStockCommand('10 kilo pyaz add karo, selling price 40 rupaye kilo rakhna',[]);assert.equal(rows.length,1);assert.equal(rows[0].newProduct!.price,'40');assert.equal(rows[0].quantity,'10');assert.equal(rows[0].issues.length,0);
 rows=prepareStockCommand('20 kilo daal total 1000 rupaye mein kharidi, stock mein add karo',[]);assert.equal(rows[0].purchaseCost,'50');assert.equal(rows[0].newProduct!.price,'');assert.equal(rows[0].newProduct!.cost,'50');
 rows=prepareStockCommand('20 kilo daal 1000 rupaye ki add karo',[]);assert.equal(rows[0].unclearAmount,'1000');assert.ok(rows[0].issues.includes('priceMeaning'));
});
test('stock follow-up quantity and price edits replace the same draft row',()=>{
 let rows=prepareStockCommand('10 kilo pyaz add karo',[]);rows=prepareStockCommand('Pyaz ka rate 40 rupaye kilo rakhna',[],rows);assert.equal(rows.length,1);assert.equal(rows[0].newProduct!.price,'40');
 rows=prepareStockCommand('Pyaz 10 nahi 12 kilo karo',[],rows);assert.equal(rows.length,1);assert.equal(rows[0].quantity,'12');assert.equal(rows[0].newProduct!.price,'40');
});
test('one stock commit returns real creation counts and price snapshots; failure rolls everything back',()=>{
 const f=fixture();try{
  const known=prepareStockCommand('2 kilo aloo selling rate 45 rupaye kilo add karo',f.state.products)[0];assert.ok(known.productId);
  const fresh=prepareStockCommand('3 kilo Dragonfruit selling price 90 rupaye kilo add karo',f.state.products)[0];assert.ok(fresh.newProduct);
  const request={idempotencyKey:randomUUID(),source:'voice',items:[stockBatchItem(known,f.state.products),stockBatchItem(fresh,f.state.products)]};const prior=f.state.products.find(p=>p.id===known.productId)!;
  const saved=f.store.receiveStockBatch(f.session.user.id,f.business.id,request);assert.equal(saved.items.filter(item=>item.created).length,1);assert.equal(saved.items.find(item=>item.productId===prior.id)!.previousPricePaise,prior.pricePaise);assert.deepEqual(f.store.receiveStockBatch(f.session.user.id,f.business.id,request),saved);
  const now=new SaaSService(f.store).state(f.session.user.id,f.business.id);assert.equal(now.products.find(p=>p.id===prior.id)!.quantityMilli,prior.quantityMilli+2000);assert.equal(now.products.find(p=>p.id===prior.id)!.pricePaise,4500);
  assert.throws(()=>f.store.receiveStockBatch(f.session.user.id,f.business.id,{idempotencyKey:randomUUID(),source:'voice',items:[{newProduct:{name:'Must Roll Back',unit:'kg',pricePaise:900,costPaise:0,sku:'',variation:''},quantityMilli:1000},{productId:prior.id,quantityMilli:1_000_000_000}]}));assert.equal(f.store.db.prepare("SELECT id FROM products WHERE name='Must Roll Back'").all().length,0);
 }finally{f.store.close();}
});
test('commit-time alias collisions and stale price changes cannot create duplicates or overwrite prices',()=>{
 const f=fixture();try{
  const p=prepareStockCommand('1 kilo aalu add karo',f.state.products)[0];assert.throws(()=>f.store.receiveStockBatch(f.session.user.id,f.business.id,{idempotencyKey:randomUUID(),source:'voice',items:[{newProduct:{name:'Aalu',unit:'kg',pricePaise:1000,costPaise:0,sku:'',variation:''},quantityMilli:1000}]}),(e:unknown)=>e instanceof DomainError&&e.code==='PRODUCT_EXISTS');
  assert.throws(()=>f.store.receiveStockBatch(f.session.user.id,f.business.id,{idempotencyKey:randomUUID(),source:'voice',items:[{productId:p.productId,quantityMilli:1000,sellingPricePaise:4500,previousPricePaise:99999}]}),(e:unknown)=>e instanceof DomainError&&e.code==='CONFLICT');
  const foreign=f.session.businesses.find(b=>b.id!==f.business.id)!;assert.throws(()=>f.store.receiveStockBatch(f.session.user.id,foreign.id,{idempotencyKey:randomUUID(),source:'voice',items:[{productId:p.productId,quantityMilli:1000}]}),(e:unknown)=>e instanceof DomainError&&e.code==='NOT_FOUND');
 }finally{f.store.close();}
});
test('sale corrections preserve the old rate and require an inconsistent total to be clarified',()=>{
 const f=fixture();try{let c=advanceVoice('Chetna ko 5 kilo aloo 200 rupaye mein beche, cash mila',f.state);c=advanceVoice('5 kilo nahi 4 kilo aloo karo',f.state,c);assert.equal(c.items.length,1);assert.equal(c.items[0].quantity,'4');assert.equal(c.items[0].price,'40');assert.equal(nextVoiceQuestion(c,f.state),'priceInvalid');c=advanceVoice('160 rupaye',f.state,c);assert.equal(salePreview(c,f.state.products).total,16000);assert.equal(nextVoiceQuestion(c,f.state),'');c=advanceVoice('Cash nahi UPI payment hai',f.state,c);assert.equal(c.fields.mode,'upi');assert.equal(salePreview(c,f.state.products).cash,0);assert.equal(salePreview(c,f.state.products).upi,16000);}finally{f.store.close();}
});
test('multi-product sale rates stay with each item and payment remains unspecified',()=>{
 const f=fixture();try{const c=advanceVoice('Chetna ko 2 kilo aloo 40 rupaye kilo aur 3 kilo pyaz 30 rupaye kilo beche',f.state);assert.equal(c.items.length,2);assert.equal(salePreview(c,f.state.products).total,17000);assert.equal(nextVoiceQuestion(c,f.state),'salePayment');}finally{f.store.close();}
});
test('punctuated stock corrections, mixed units and sacks preserve their own quantities',()=>{
 const f=fixture();try{const rows=prepareStockCommand('10 kilo aloo add karo... nahi, 5 kilo aloo, pyaz add kar do',f.state.products);assert.equal(rows.length,2);assert.equal(rows[0].quantity,'5');assert.equal(rows[1].quantity,'');const mixed=prepareStockCommand('2 kilo aloo aur 10 packet doodh aur 5 bag cement add karo',[]);assert.deepEqual(mixed.map(row=>[row.quantity,row.unit]),[['2','kg'],['10','packet'],['5','bag']]);}finally{f.store.close();}
});
test('rates convert exactly to the catalogue unit; backend still enforces conversion permission',()=>{
 const f=fixture();try{const product=f.store.createProduct(f.session.user.id,f.business.id,{name:'Fine Rice',unit:'g',pricePaise:2,costPaise:1,quantityMilli:1000}),products=[product];let rows=prepareStockCommand('2 kilo Fine Rice selling price 40 rupaye kilo add karo',products);assert.equal(rows[0].sellingPrice,'0.04');assert.equal(rows[0].quantityMilli,2_000_000);rows=prepareStockCommand('1 kilo kiwi selling price 80 rupaye kilo add karo',products,rows);assert.equal(rows[0].sellingPrice,'0.04');const saved=f.store.receiveStockBatch(f.session.user.id,f.business.id,{idempotencyKey:randomUUID(),source:'voice',items:[stockBatchItem(rows[0],products)]});assert.equal(saved.items[0].quantityMilli,2_000_000);assert.equal(saved.items[0].sellingPricePaise,4);const service=new SaaSService(f.store),config=service.configuration(f.session.user.id,f.business.id);service.saveConfiguration(f.session.user.id,f.business.id,{revision:config.revision,features:{unitConversion:false},idempotencyKey:randomUUID()});assert.throws(()=>f.store.receiveStockBatch(f.session.user.id,f.business.id,{idempotencyKey:randomUUID(),source:'voice',items:[stockBatchItem(rows[0],products)]}),(e:unknown)=>e instanceof DomainError&&e.code==='FEATURE_DISABLED');}finally{f.store.close();}
});
test('recovery validates action paths, schema and expiry while retaining uncertain retries',()=>{
 const f=fixture();try{const command=advanceVoice('Chetna ka bill banao',f.state),key=randomUUID(),now=Date.now(),value={key,command,pending:null,updatedAt:now};assert.ok(readConversationSession(JSON.stringify(value),now));assert.equal(readConversationSession(JSON.stringify(value),now+31*60000),null);assert.equal(readConversationSession(JSON.stringify({...value,command:{...command,fields:{name:{instruction:'unsafe'}}}}),now),null);assert.equal(readConversationSession(JSON.stringify({...value,pending:{path:'/account/permissions',body:{idempotencyKey:key}}}),now),null);assert.ok(readConversationSession(JSON.stringify({...value,pending:{path:'/voice-sale',body:{idempotencyKey:key}}}),now+31*60000));}finally{f.store.close();}
});

test('selling totals, purchase totals and independently spoken rate units retain exact values',()=>{
 const f=fixture();try{
  const rice=f.store.createProduct(f.session.user.id,f.business.id,{name:'Granular Rice',unit:'g',pricePaise:2,costPaise:1,quantityMilli:1000});
  let rows=prepareStockCommand('2 kilo Granular Rice selling price 40 rupaye kilo purchase cost 0.02 rupaye g add karo',[rice]);assert.equal(rows[0].sellingPrice,'0.04');assert.equal(rows[0].purchaseCost,'0.02');assert.equal(rows[0].issues.length,0);
  rows=prepareStockCommand('2 kilo Granular Rice selling price 40 rupaye kilo total purchase cost 40 rupaye add karo',[rice]);assert.equal(rows[0].sellingPrice,'0.04');assert.equal(rows[0].purchaseCost,'0.02');assert.equal(rows[0].issues.length,0);
  const fresh=prepareStockCommand('10 kilo Apricot total batch selling value 800 rupaye total purchase cost 500 rupaye add karo',[]);assert.equal(fresh[0].newProduct!.price,'80');assert.equal(fresh[0].newProduct!.cost,'50');assert.equal(fresh[0].issues.length,0);
  const changed=prepareStockCommand('Apricot 10 nahi 5 kilo',[],fresh);assert.equal(changed[0].purchaseCost,'100');assert.equal(changed[0].newProduct!.price,'80');assert.ok(changed[0].issues.includes('priceMeaning'));
 }finally{f.store.close();}
});

test('stock quantity corrections rederive an explicit batch cost in catalogue units',()=>{
 let rows=prepareStockCommand('20 kilo New Lentils total purchase cost 1000 rupaye selling price 70 rupaye kilo add karo',[]);
 rows=prepareStockCommand('New Lentils 20 nahi 25 kilo',[],rows);assert.equal(rows[0].purchaseCost,'40');assert.equal(rows[0].newProduct!.cost,'40');assert.equal(rows[0].newProduct!.price,'70');assert.equal(rows[0].issues.length,0);
});

test('original customer names and supplier payments use explicit write requests',()=>{
 const f=fixture();try{
  assert.equal(commandCustomerName('Chetna ke naam se customer add karo'),'Chetna');assert.equal(commandCustomerName('New customer naam Amit Kumar add karo'),'Amit Kumar');
  const supplier=f.state.suppliers[0],write=advanceVoice(supplier.name+' supplier ka 50 cash payment record karo',f.state);assert.equal(write.intent,'purchase');assert.equal(write.fields.operation,'supplierPayment');assert.equal(write.fields.amount,'50');assert.equal(write.fields.method,'cash');
  assert.equal(write.fields.supplierId,supplier.id);assert.notEqual(advanceVoice('Show supplier payment history',f.state).fields.operation,'supplierPayment');
 }finally{f.store.close();}
});

test('stock price metadata cannot redirect a global add command to sales or purchases',()=>{
 const f=fixture();try{
  for(const text of ['2 kilo Apricot selling price 80 rupaye kilo add karo','20 kilo daal total purchase cost 1000 rupaye stock add karo','10 kilo pyaz total batch selling value 400 rupaye add karo'])assert.equal(advanceVoice(text,f.state).intent,'stock');
  assert.equal(advanceVoice('Sell 2 kilo aloo to Chetna',f.state).intent,'sale');
 }finally{f.store.close();}
});

test('canonical aliases within a batch create one product and sum purchase cost snapshots',()=>{
 const f=fixture();try{
  const item={newProduct:{name:'aalu',unit:'kg',pricePaise:8000,costPaise:4000,sku:'',variation:''},quantityMilli:1000,unit:'kg',purchaseCostPaise:4000,purchaseTotalPaise:4000};
  // An empty foreign shop avoids an existing seeded potato alias.
  const shop=f.store.createBusiness(f.session.user.id,{name:'Alias batch shop',category:'vegetables'});
  const entry=f.store.receiveStockBatch(f.session.user.id,shop.id,{idempotencyKey:randomUUID(),source:'voice',items:[item,{...item,newProduct:{...item.newProduct,name:'aloo'},quantityMilli:2000,purchaseTotalPaise:8000}]});
  assert.equal(entry.items.length,1);assert.equal(entry.items[0].quantityMilli,3000);assert.equal(entry.items[0].purchaseTotalPaise,12000);assert.equal(f.store.db.prepare('SELECT id FROM products WHERE business_id=?').all(shop.id).length,1);
 }finally{f.store.close();}
});
