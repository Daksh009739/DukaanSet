import {Store} from '../../src/lib/server/store';
import {DocumentService} from '../../src/lib/server/documents';
import {mkdirSync,writeFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import {today} from '../../src/lib/client';
const store=new Store(':memory:'),session=store.register({name:'Sample owner',email:'pdf-samples@example.invalid',password:'sample-password-123',businessName:'Sharma Fashion Store',category:'clothing',language:'en'}),user=session.user.id,business=session.businesses[0].id;
const customer=store.createContact(user,business,'customers',{name:'Rahul Sharma',phone:'9000000011'}),product=store.createProduct(user,business,{name:'Blue Casual Shirt',unit:'piece',pricePaise:89900,costPaise:55000,quantityMilli:250000,variation:'Blue · M'}),documents=new DocumentService(store);
const old=documents.getBranding(user,business);await documents.saveBranding(user,business,{...old,address:'Example Market, Sample City',tagline:'Sample shop — fictional records',footer:'Example document for testing. This is not a customer transaction.',terms:'Please retain this invoice for your records.',returnPolicy:'Returns follow the shop policy.'});
const sale=store.createInvoice(user,business,{idempotencyKey:randomUUID(),customerId:customer.id,items:[{productId:product.id,quantityMilli:2000}],payments:[{method:'cash',amountPaise:100000},{method:'upi',amountPaise:50000}]});
mkdirSync('output/pdf',{recursive:true});mkdirSync('.local/pdf-qa-v7',{recursive:true});
async function save(name:string,input:Record<string,unknown>,output=true){const prepared=await documents.prepare(user,business,input),path=(output?'output/pdf/':'.local/pdf-qa-v7/')+name;writeFileSync(path,documents.read(user,business,prepared.id).bytes);return{path,pages:prepared.pages,reference:prepared.model.reference};}
const samples=[await save('dukaanset-invoice-en.pdf',{kind:'invoice',sourceId:sale.id,language:'en',format:'a4'}),await save('dukaanset-hisaab-hi.pdf',{kind:'statement',sourceId:customer.id,language:'hi',format:'a4',start:today().slice(0,7)+'-01',end:today(),detailed:true}),await save('dukaanset-receipt-hinglish.pdf',{kind:'receipt',sourceId:sale.payments[0].id,language:'hinglish',format:'80mm'})];
// Stress layout using saved item snapshots and real invoices, never the merchant database.
const long=store.createProduct(user,business,{name:'Premium cotton shirt with a deliberately long saved product name for the wrapping test',variation:'गहरा नीला · Medium · Long variant description for multilingual wrapping',unit:'piece',pricePaise:123456,costPaise:45000,quantityMilli:250000});
const lines=Array.from({length:80},(_,i)=>({productId:store.createProduct(user,business,{name:long.name+' '+(i+1),variation:long.variation,unit:'piece',pricePaise:123456,costPaise:45000,quantityMilli:1000}).id,quantityMilli:1000}));
const longSale=store.createInvoice(user,business,{idempotencyKey:randomUUID(),customerId:customer.id,items:lines,payments:[]});
const stress=[];for(const [language,format]of [['hi','a4'],['en','mono'],['hi','58mm'],['hinglish','80mm']] as const)stress.push(await save(`long-invoice-${language}-${format}.pdf`,{kind:'invoice',sourceId:longSale.id,language,format},false));
stress.push(await save('long-statement-hi-a4.pdf',{kind:'statement',sourceId:customer.id,language:'hi',format:'a4',start:'1970-01-01',end:today(),detailed:true},false));
writeFileSync('docs/qa/v6/pdf-samples.json',JSON.stringify({fictional:true,samples,stress},null,2));console.log(JSON.stringify({samples,stress},null,2));store.close();
