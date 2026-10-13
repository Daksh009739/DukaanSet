import {Store} from '../../src/lib/server/store';
import {DocumentService} from '../../src/lib/server/documents';
import {ClosingService} from '../../src/lib/server/closing';
import {SaaSService} from '../../src/lib/server/saas';
import {randomUUID} from 'node:crypto';

/** Fictional QA records live only in SQLite memory, never the user's business. */
export function pdfSuiteFixture(){
 const store=new Store(':memory:'),session=store.register({name:'PDF QA Owner',email:randomUUID()+'@example.test',password:'pdf-fixture-only-2026',businessName:'Northstar Retail / नॉर्थस्टार दुकान',category:'grocery',language:'en'}),user=session.user.id,business=session.businesses[0].id;
 const documents=new DocumentService(store),customer=store.createContact(user,business,'customers',{name:'Asha Rao / आशा राव',phone:'9000000042'}),supplier=store.createContact(user,business,'suppliers',{name:'River Wholesale / रिवर होलसेल',phone:'9000000081'});
 const products=[['Long grain rice / बासमती चावल','kg',13575,11000,32000,10000,'Premium loose grain / खुला चावल'],['Whole wheat flour / गेहूँ आटा','bag',29400,20000,18000,12000,'5 kg bag / पाँच किलो थैला'],['Iodised salt / आयोडीन नमक','pack',3500,2300,13000,15000,'1 kg pack / एक किलो पैक'],['Cooking oil / खाना बनाने का तेल','bottle',16950,14500,7000,10000,'1 litre / एक लीटर'],['Noodles / नूडल्स','pack',1900,1400,0,20000,'70 g / सत्तर ग्राम']].map(([name,unit,price,cost,qty,min,variation])=>store.createProduct(user,business,{name,unit,pricePaise:price,costPaise:cost,quantityMilli:qty,minStockMilli:min,variation}));
 const previous=store.createInvoice(user,business,{idempotencyKey:randomUUID(),customerId:customer.id,items:[{productId:products[0].id,quantityMilli:1000}],payments:[]});
 const invoice=store.createInvoice(user,business,{idempotencyKey:randomUUID(),customerId:customer.id,items:products.slice(0,4).map((p,i)=>({productId:p.id,quantityMilli:[1250,2000,3000,1000][i]})),discountPaise:1275,payments:[{method:'cash',amountPaise:23000},{method:'upi',amountPaise:65000}]});
 const receipt=store.receivePayment(user,business,{idempotencyKey:randomUUID(),customerId:customer.id,amountPaise:4500,method:'cash'});
 const purchase=store.createPurchase(user,business,{idempotencyKey:randomUUID(),supplierId:supplier.id,items:[{productId:products[0].id,quantityMilli:5000,costPaise:11000},{productId:products[1].id,quantityMilli:2000,costPaise:20000}],paidPaise:15000});
 const order=new SaaSService(store).reorder(user,business,{idempotencyKey:randomUUID(),productId:products[4].id,quantityMilli:24000,costPaise:1400,supplierId:supplier.id,requestIds:[]});
 const closing=new ClosingService(store),preview=closing.preview(user,business),report=closing.close(user,business,{idempotencyKey:randomUUID(),fingerprint:preview.fingerprint,actualCashPaise:null,acknowledged:true});
 return {store,session,user,business,documents,customer,supplier,products,invoice,previous,receipt,purchase,order,preview,report};
}
