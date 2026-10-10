import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {Store} from '../src/lib/server/store';
import {SaaSService} from '../src/lib/server/saas';
import {voiceHeroForPage,advancePageVoice} from '../src/lib/voice/discovery';
import {text,unitText} from '../src/lib/locale';
import {voiceNavigation,reportAnswer} from '../src/lib/voice/os';
import {voiceActionRegistry} from '../src/lib/voice/conversation';
function fixture(){const store=new Store(':memory:'),session=store.register({name:'QA',email:randomUUID()+'@example.test',password:'Fixture-only-2026',businessName:'Hero QA',category:'grocery'}),id=session.businesses[0].id,user=session.user.id,saas=new SaaSService(store);for(const name of ['Rahul','Chetna'])store.createContact(user,id,'customers',{name});store.createContact(user,id,'suppliers',{name:'Gupta Traders'});for(const [name,unit]of [['Daal','kg'],['Maggi','packet'],['Aloo','kg']]as const)store.createProduct(user,id,{name,unit,pricePaise:10000,quantityMilli:100000});return{store,saas,id,user,state:saas.state(user,id)};}

test('discovery examples use supported actions, correct financial reports and entity roles in every UI language',()=>{
 const f=fixture();try{const routes=['/app','/app/customers','/app/sales','/app/sales/new','/app/stock','/app/stock/voice','/app/stock/history','/app/stock/voice-history','/app/purchases','/app/suppliers','/app/payments','/app/expenses','/app/demand','/app/reports','/app/reports/closings','/app/daily-closing','/app/ai','/app/todays-work',...f.state.customers.map(c=>'/app/customers/'+c.id),...f.state.products.map(p=>'/app/stock/'+p.id),...f.state.suppliers.map(s=>'/app/suppliers/'+s.id)];
 for(const language of ['en','hi','hinglish'])for(const path of [...routes,'/app/intelligence'])for(const tool of path==='/app/intelligence'?['insights','reorder','scan','simulation']as const:[undefined]){const hero=voiceHeroForPage(path,f.state,tool);assert.ok(hero,path);for(const ex of hero.examples){const params={...hero.parameters,...hero.parameters?.unit?{unit:unitText(hero.parameters.unit,language)}:{}},raw=text(language,'voiceos',ex.key,params),c=advancePageVoice(raw,f.state,undefined,hero.context),label=language+' '+ex.key;assert.equal(c.intent,ex.intent,label);assert.ok(voiceActionRegistry[c.intent].permitted(f.state));if(c.intent==='open')assert.ok(voiceNavigation(c,f.state),label);if(['heroDuesExample','heroThisCustomerExample'].includes(ex.key))assert.equal(c.fields.report,'outstanding',label);if(ex.key==='heroLowStockExample')assert.equal(c.fields.report,'lowStock');if(ex.key==='heroCollectionsExample'){assert.equal(c.fields.report,'collections');assert.equal(c.fields.period,'today');}if(['heroBillExample','heroPaymentExample'].includes(ex.key))assert.equal(c.fields.customerId,f.state.customers.find(c=>c.name==='Rahul')!.id,label);if(ex.key==='heroPurchaseExample'){assert.equal(c.fields.supplierId,f.state.suppliers[0].id,label);assert.equal(c.items[0].productId,f.state.products.find(p=>p.name==='Daal')!.id,label);}if(['heroStockExample','heroPacketsExample','heroThisProductExample'].includes(ex.key)){assert.ok(c.items[0].productId,label);assert.equal(c.items[0].quantity,ex.key==='heroPacketsExample'?'20':'10',label);assert.equal(c.fields.customerId,undefined);}if(ex.key==='heroThisCustomerExample'){assert.equal(c.fields.customerId,hero.context.customerId);assert.equal(c.items.length,0);}if(ex.key==='heroSupplierDuesExample'){assert.equal(c.fields.report,'supplierOutstanding');assert.equal(c.fields.supplierId,hero.context.supplierId);assert.ok(reportAnswer(c,f.state,language)[0].label==='Gupta Traders');}}}
 assert.equal(f.saas.state(f.user,f.id).invoices.length,0);assert.equal(f.saas.state(f.user,f.id).inventoryEntries.length,0);
 }finally{f.store.close();}
});

test('page references cannot select foreign entities or override an explicit business intent',()=>{
 const f=fixture();try{const selected=f.state.products.find(p=>p.name==='Daal')!,context={path:'/app/stock/'+selected.id,intent:'stock' as const,productId:selected.id,customerId:'foreign',invoiceId:'foreign'};
 const bill=advancePageVoice('Create a bill for Rahul for 5 kilo potato',f.state,undefined,context);assert.equal(bill.intent,'sale');assert.equal(bill.fields.customerId,f.state.customers.find(c=>c.name==='Rahul')!.id);assert.equal(bill.items[0].productId,f.state.products.find(p=>p.name==='Aloo')!.id);
 const stock=advancePageVoice('Add 10 kg of this product to stock.',f.state,undefined,{...context,productId:'foreign'});assert.equal(stock.items[0].productId,'');
 const sim=advancePageVoice('If I buy 20 kilo dal at 60 each and sell at 75 each?',f.state,undefined,context);assert.equal(sim.intent,'simulation');assert.equal(sim.items.length,0);
 const denied=structuredClone(f.state);denied.configuration.permissions.inventory=false;const command=advancePageVoice('Add 10 kg of this product to stock.',denied,undefined,context);assert.ok(command.warnings.includes('permission'));assert.equal(command.items.length,0);
 }finally{f.store.close();}
});

test('discovery filters disabled features, role permissions and unrelated or public routes',()=>{
 const f=fixture();try{for(const path of ['/login','/register','/en','/app/settings','/app/help','/app/unknown'])assert.equal(voiceHeroForPage(path,f.state),null);
 const state=structuredClone(f.state);state.configuration.permissions.inventory=false;state.configuration.permissions.reports=false;state.configuration.permissions.purchases=false;assert.equal(voiceHeroForPage('/app/stock',state),null);assert.equal(voiceHeroForPage('/app/suppliers',state),null);assert.equal(voiceHeroForPage('/app/intelligence',state,'reorder'),null);
 state.configuration.features.voiceStock=false;assert.equal(voiceHeroForPage('/app/customers',state),null);
 }finally{f.store.close();}
});

test('invoice references select only the actual bill, without creating an invoice or borrowing foreign page context',()=>{
 const f=fixture();try{const customer=f.state.customers[0],product=f.state.products[0],invoice=f.store.createInvoice(f.user,f.id,{customerId:customer.id,idempotencyKey:randomUUID(),items:[{productId:product.id,quantityMilli:1000}],payments:[]}),state=f.saas.state(f.user,f.id),hero=voiceHeroForPage('/app/sales/'+invoice.id,state)!;
 for(const language of ['en','hi','hinglish']){const raw=text(language,'voiceos','heroInvoiceExample'),c=advancePageVoice(raw,state,undefined,hero.context);assert.equal(c.intent,'document');assert.equal(c.fields.invoiceId,invoice.id);assert.equal(c.fields.customerId,customer.id);const foreign=advancePageVoice(raw,state,undefined,{...hero.context,invoiceId:'other-business'});assert.equal(foreign.fields.invoiceId,undefined);}
 assert.equal(f.saas.state(f.user,f.id).invoices.length,1);
 }finally{f.store.close();}
});
