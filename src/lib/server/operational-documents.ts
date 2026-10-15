import type { DocumentModel } from '../document-contracts';
import type { Store } from './store';
import { DomainError, date } from './validation';
import { businessDay, lineTotal } from '../client';
import { safeSum, ClosingService, wallTime } from './closing';

type Row = Record<string,string|number|null>;
/** Presentation snapshots query complete tenant records, never the capped dashboard. */
export function operationalDocument(store:Store, base:DocumentModel, input:Record<string,unknown>,userId:string):DocumentModel {
  const {businessId,kind,sourceId}=base;
  const rows=(sql:string,...args:(string|number|null)[])=>store.db.prepare(sql).all(...args) as Row[];
  const entity=(table:string,id:string)=>{const r=store.db.prepare(`SELECT * FROM ${table} WHERE business_id=? AND id=?`).get(businessId,id) as Row|undefined;if(!r)throw new DomainError('NOT_FOUND','Document source not found.',404);return r;};
  if(kind==='closing-preview'){const preview=new ClosingService(store).preview(userId,businessId);if(preview.session.status==='closed')throw new DomainError('ALREADY_CLOSED','Download the saved closing report for a closed session.',409);return {...base,sourceId:businessId,reference:`PREVIEW-${preview.session.businessDate}`,generatedAt:preview.asOf,closingPreview:preview};}
  if(kind==='stock-report') {
    const products=rows('SELECT * FROM products WHERE business_id=? AND stock_tracked=1 ORDER BY name,id',businessId);
    if(products.length>5000)throw new DomainError('DOCUMENT_LIMIT','Report exceeds 5,000 products.',413);
    const data=products.map(p=>({id:String(p.id),name:JSON.parse(String(p.display_names_json||'{}'))[base.language]||String(p.name),variation:String(p.variation),sku:String(p.sku),unit:String(p.unit),quantityMilli:Number(p.quantity_milli),minStockMilli:Number(p.min_stock_milli)}));
    return {...base,sourceId:businessId,reference:`STOCK-${businessDay(base.generatedAt)}`,stockReport:{rows:data,healthy:data.filter(p=>p.quantityMilli>p.minStockMilli).length,low:data.filter(p=>p.quantityMilli>0&&p.quantityMilli<=p.minStockMilli).length,out:data.filter(p=>p.quantityMilli<=0).length}};
  }
  if(kind==='purchase'||kind==='purchase-order') {
    if(kind==='purchase') {
      const p=entity('purchases',sourceId),s=entity('suppliers',String(p.supplier_id));
      return {...base,reference:`PUR-${sourceId}`,procurement:{date:String(p.date),status:'received',supplier:{id:String(s.id),name:String(s.name),phone:String(s.phone)},items:JSON.parse(String(p.items_json)),totalPaise:Number(p.total_paise),paidPaise:Number(p.paid_paise),balancePaise:Number(p.balance_paise)}};
    }
    const order=entity('reorder_drafts',sourceId),product=entity('products',String(order.product_id)),supplier=order.supplier_id?entity('suppliers',String(order.supplier_id)):null;
    const total=lineTotal(Number(order.cost_paise),Number(order.quantity_milli));
    return {...base,reference:`PO-${sourceId}`,procurement:{date:String(order.date),status:order.status as 'draft'|'received'|'cancelled',supplier:{id:supplier?String(supplier.id):null,name:supplier?String(supplier.name):'',phone:supplier?String(supplier.phone):''},items:[{name:String(product.name),variation:String(product.variation),unit:String(product.unit),quantityMilli:Number(order.quantity_milli),costPaise:Number(order.cost_paise),totalPaise:total}],totalPaise:total,purchaseId:order.purchase_id as string|null}};
  }
  const start=String(input.start||'1970-01-01'),end=String(input.end||businessDay());
  if(!date(start)||!date(end)||start>end||end>businessDay())throw new DomainError('DOCUMENT_RANGE','Invalid report period.');
  const settings=new ClosingService(store).settings(businessId),after=new Date(Date.parse(end+'T12:00:00Z')+86400000).toISOString().slice(0,10),from=wallTime(start,settings.cutoff,settings.timezone),to=wallTime(after,settings.cutoff,settings.timezone);
  const invoices=rows('SELECT * FROM invoices WHERE business_id=? AND date>=? AND date<? ORDER BY date,id',businessId,from,to);
  if(invoices.length>5000)throw new DomainError('DOCUMENT_LIMIT','Report exceeds 5,000 invoices.',413);
  const sum=(sql:string,...args:(string|number|null)[])=>{const r=rows(sql,...args);return safeSum(r.map(v=>Number(v.amount)));};
  const active=invoices.filter(i=>i.status!=='cancelled');
  const report:NonNullable<DocumentModel['businessReport']>={start,end,salesPaise:safeSum(active.map(i=>Number(i.total_paise))),receivedPaise:sum("SELECT CASE WHEN kind='refund' THEN -amount_paise ELSE amount_paise END amount FROM payments WHERE business_id=? AND date>=? AND date<?",businessId,from,to),expensesPaise:sum('SELECT amount_paise amount FROM expenses WHERE business_id=? AND date>=? AND date<?',businessId,from,to),outstandingPaise:sum("SELECT balance_paise amount FROM invoices WHERE business_id=? AND status!='cancelled'",businessId),supplierDuePaise:sum('SELECT balance_paise amount FROM purchases WHERE business_id=?',businessId),stockValuePaise:safeSum(rows('SELECT cost_paise,quantity_milli FROM products WHERE business_id=?',businessId).map(p=>lineTotal(Number(p.cost_paise),Number(p.quantity_milli)))),rows:invoices.map(i=>({date:String(i.date),reference:String(i.number),customer:String(i.customer_name),totalPaise:Number(i.total_paise),paidPaise:i.status==='cancelled'?0:Number(i.paid_paise),balancePaise:i.status==='cancelled'?0:Number(i.balance_paise),status:i.status as NonNullable<DocumentModel['invoice']>['status']}))};
  return {...base,sourceId:businessId,reference:`REPORT-${start}-${end}`,businessReport:report};
}
