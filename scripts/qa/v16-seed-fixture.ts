import {resolve,basename} from 'node:path';
import assert from 'node:assert/strict';
import {Store} from '../../src/lib/server/store';
import {SaaSService} from '../../src/lib/server/saas';
// Private, isolated QA data only. Normal production registration still requires delivery.
const database=resolve(process.env.DATABASE_PATH||'');assert.ok(basename(database).startsWith('v16-production-qa-'));assert.equal(resolve('.data'),resolve(database,'..'));
const store=new Store(database);
try{
 const email='v16-'+crypto.randomUUID()+'@example.test',session=store.register({name:'Shivam QA',email,password:'Fictional-private-2026',language:'en',businessName:'Shivam Store',category:'grocery'}),user=session.user.id,id=session.businesses[0].id;
 store.db.prepare('UPDATE users SET email_verified=1,verification_required=1 WHERE id=?').run(user);
 const service=new SaaSService(store);service.saveConfiguration(user,id,{location:'Delhi,IN',revision:service.configuration(user,id).revision,idempotencyKey:crypto.randomUUID()});
 const inputs=[['Maggi Masala','piece',40,14,4],['Aloo','kg',35,10,5],['Daal','kg',60,5,3],['Coca Cola','piece',50,35,2],['Detergent','piece',40,7,2]] as const;
 const products=inputs.map(([name,unit,price,stock,min])=>store.createProduct(user,id,{name,unit,pricePaise:price*100,costPaise:price*60,quantityMilli:stock*1000,minStockMilli:min*1000}));
 const customers=['Rahul','Chetna','Amit','Neha'].map(name=>store.createContact(user,id,'customers',{name}));
 const sales=[{items:[{productId:products[0].id,quantityMilli:10000},{productId:products[2].id,quantityMilli:2000}],paidPaise:52000,paymentMethod:'cash'},{items:[{productId:products[1].id,quantityMilli:5000}],paidPaise:0,paymentMethod:'cash'},{items:[{productId:products[3].id,quantityMilli:5000}],paidPaise:25000,paymentMethod:'upi'},{items:[{productId:products[4].id,quantityMilli:5000}],paidPaise:10000,paymentMethod:'cash'}];
 for(const [index,sale]of sales.entries())store.createInvoice(user,id,{...sale,customerId:customers[index].id,idempotencyKey:crypto.randomUUID(),discountPaise:0});
 console.log(JSON.stringify({email,business:session.businesses[0]}));
}finally{store.close();}
