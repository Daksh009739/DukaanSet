import {Store} from '../../src/lib/server/store';
import {BusinessGrowthService} from '../../src/lib/server/business-growth';
import {randomUUID} from 'node:crypto';
import {mkdirSync,writeFileSync} from 'node:fs';
const store=new Store(),records=[];
for(const language of ['en','hi','hinglish'] as const){
 const session=store.register({name:'Growth QA Merchant',email:'growth18-'+language+'@example.test',password:'Growth18-fixture-only-2026',businessName:'Growth QA '+language,category:'salon',language}),user=session.user.id,business=session.businesses[0].id;
 store.db.prepare('UPDATE users SET email_verified=1 WHERE id=?').run(user);
 const customer=store.createContact(user,business,'customers',{name:'Rahul',phone:'9000000042'}),duplicate=store.createContact(user,business,'customers',{name:'Rahul',phone:'9000000099'}),product=store.createProduct(user,business,{name:'Shampoo',unit:'piece',pricePaise:10000,costPaise:6000,quantityMilli:10000,minStockMilli:1000}),invoice=store.createInvoice(user,business,{items:[{productId:product.id,quantityMilli:1000}],customerId:customer.id,payments:[{method:'upi',amountPaise:4000}],idempotencyKey:randomUUID()});
 const blank=store.register({name:'New QA Merchant',email:'growth18-setup-'+language+'@example.test',password:'Growth18-fixture-only-2026',language});store.db.prepare('UPDATE users SET email_verified=1 WHERE id=?').run(blank.user.id);
 new BusinessGrowthService(store).createService(user,business,{name:'Consultation',pricePaise:25000,costPaise:5000,confirm:true,idempotencyKey:randomUUID()});
 records.push({language,user,business,email:session.user.email,blankEmail:blank.user.email,customer:customer.id,duplicate:duplicate.id,invoice:invoice.id});
}
mkdirSync('.local/qa/growth18',{recursive:true});writeFileSync('.local/qa/growth18/seeds.json',JSON.stringify(records,null,2));store.close();
