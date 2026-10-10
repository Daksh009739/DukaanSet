import {test} from 'node:test';
import assert from 'node:assert/strict';
import {salesBuckets,rankedProducts} from '../src/lib/dashboard-data';
import type {Invoice,Product} from '../src/lib/contracts';
import {Store} from '../src/lib/server/store';
import {RecordService} from '../src/lib/server/records';
const now=new Date('2026-10-10T10:00:00Z');
const invoice=(date:string,totalPaise:number,status='paid',items:Invoice['items']=[])=>({date,totalPaise,status,items}) as Invoice;
test('week/month/year are real calendar aggregations and exclude cancelled sales',()=>{
 const data=[invoice('2026-10-09T20:00:00Z',25000),invoice('2026-10-10T01:00:00Z',8000,'cancelled'),invoice('2026-09-30T01:00:00Z',30000)];
 assert.equal(salesBuckets(data,'week',now).at(-1)!.salesPaise,25000);assert.equal(salesBuckets(data,'month',now).reduce((n,r)=>n+r.salesPaise,0),25000);assert.equal(salesBuckets(data,'year',now)[8].salesPaise,30000);assert.equal(salesBuckets([],'week',now).length,7);
});
test('product ranking uses revenue share across unlike units and excludes cancelled and out-of-period bills',()=>{
 const item=(id:string,value:number,qty:number)=>({productId:id,totalPaise:value,quantityMilli:qty,name:id,unit:id==='a'?'kg':'piece',pricePaise:value});
 const data=[invoice('2026-10-10T01:00:00Z',30000,'paid',[item('a',20000,1000),item('b',10000,42000)]),invoice('2026-10-10T01:00:00Z',99000,'cancelled',[item('b',99000,1000)]),invoice('2026-09-01T01:00:00Z',99000,'paid',[item('b',99000,1000)])];
 const rows=rankedProducts(data,[{id:'a'},{id:'b'}] as Product[],now);assert.equal(rows[0].product!.id,'a');assert.equal(rows[0].share,67);assert.equal(rows[1].quantityMilli,42000);
});
test('server chart and product totals include invoices beyond the visible 1000-row list',()=>{
 const store=new Store(':memory:');
 try{
  const session=store.register({name:'QA Owner',email:'aggregate@example.test',password:'Test-passphrase-2026',businessName:'QA Shop',category:'grocery',language:'en'}),user=session.user.id,business=session.businesses[0].id;
  const product=store.createProduct(user,business,{name:'Rice',sku:'R',unit:'kg',pricePaise:100,costPaise:50,quantityMilli:2000000,minStockMilli:1000});
  const customer=store.createContact(user,business,'customers',{name:'QA Customer'});
  store.createInvoice(user,business,{customerId:customer.id,idempotencyKey:'base',items:[{productId:product.id,quantityMilli:1000}],discountPaise:0,paidPaise:0,paymentMethod:'cash'});
  const source=store.db.prepare('SELECT * FROM invoices WHERE business_id=?').get(business)!;
  const columns=Object.keys(source),insert=store.db.prepare(`INSERT INTO invoices(${columns.join(',')}) VALUES(${columns.map(()=>'?').join(',')})`);
  store.transaction(()=>{for(let i=0;i<1005;i++)insert.run(...columns.map(key=>key==='id'?'qa-extra-'+i:key==='number'?'QA-'+i:source[key]) as (string|number|null)[]);});
  const state=store.state(user,business);assert.equal(state.invoices.length,1000);assert.equal(state.dashboard!.sales.week.reduce((sum,row)=>sum+row.salesPaise,0),100600);assert.equal(state.dashboard!.topProducts[0].quantityMilli,1006000);assert.equal(state.dashboard!.sales.year.reduce((sum,row)=>sum+row.salesPaise,0),state.totals.salesPaise);
  assert.equal(state.invoices.some(invoice=>invoice.id===source.id),false);
  assert.equal(new RecordService(store).invoiceHistory(user,business,new URLSearchParams({query:String(source.number)})).invoices[0].id,source.id);
 }finally{store.close();}
});
