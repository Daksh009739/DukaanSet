import { createHash, randomUUID } from 'node:crypto';
import type { Store } from './store';
import type { BusinessSession, ClosingOverview, ClosingPreview, ClosingReport, ClosingSettings, ClosingTotals, LegacyCashClosing } from '../closing-contracts';
import { branding } from './document-snapshots';
import { access, authorize } from './access';
import { DomainError, date, fingerprint, integer, keys, method, object, string } from './validation';

type Row = Record<string, string | number | null>;
export const closingDefaults: ClosingSettings = { enabled: false, timezone: 'Asia/Kolkata', closingTime: '21:00', cutoff: '00:00', allowSkipCount: true, notifications: true, managerIds: [], revision: 0 };
export function safeSum(values: number[]) { const total = values.reduce((a,b) => { const n=a+b; if (!Number.isSafeInteger(n)) throw new DomainError('ACCOUNTING_LIMIT','Unsafe accounting sum.',409); return n; },0); return total; }
const shiftDay = (value: string, days: number) => new Date(Date.parse(value+'T12:00:00Z')+days*86400000).toISOString().slice(0,10);
function localParts(at: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat('en-CA',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(at);
  const p = Object.fromEntries(parts.map(x=>[x.type,x.value])); return { day: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}`, second: p.second };
}
export function sessionDay(at: Date, settings: Pick<ClosingSettings,'timezone'|'cutoff'>) { const p=localParts(at,settings.timezone); return p.time<settings.cutoff?shiftDay(p.day,-1):p.day; }
/** Resolve local wall time without a fixed UTC offset. Reject DST gaps, choose the later instant in overlaps. */
export function wallTime(day: string, time: string, timezone: string) {
  const target=Date.parse(`${day}T${time}:00Z`); let guess=target;
  for(let i=0;i<5;i++){const p=localParts(new Date(guess),timezone);const actual=Date.parse(`${p.day}T${p.time}:${p.second}Z`);const next=guess+target-actual;if(next===guess)break;guess=next;}
  const candidates=[guess-3600000,guess,guess+3600000].filter(n=>{const p=localParts(new Date(n),timezone);return p.day===day&&p.time===time;});
  if(!candidates.length)throw new DomainError('INVALID_TIME','This local time does not exist in the selected timezone.');return new Date(Math.max(...candidates)).toISOString();
}
const session = (r: Row): BusinessSession => ({id:String(r.id),businessDate:String(r.business_date),openedAt:String(r.opened_at),timezone:String(r.timezone),cutoff:String(r.cutoff),openingCashPaise:Number(r.opening_cash_paise),status:r.status as BusinessSession['status'],closedAt:r.closed_at as string|null});

export class ClosingService {
  constructor(readonly store: Store, readonly clock:()=>Date=()=>new Date()) {}
  private rows(sql:string,...args:(string|number|null)[]) { return this.store.db.prepare(sql).all(...args) as Row[]; }
  private row(sql:string,...args:(string|number|null)[]) { return this.store.db.prepare(sql).get(...args) as Row|undefined; }
  private run(sql:string,...args:(string|number|null)[]) { return this.store.db.prepare(sql).run(...args); }
  settings(businessId:string):ClosingSettings { const r=this.row('SELECT data_json,revision FROM closing_settings WHERE business_id=?',businessId);return r?{...closingDefaults,...JSON.parse(String(r.data_json)),revision:Number(r.revision)}:{...closingDefaults,managerIds:[]}; }
  private permit(userId:string,businessId:string,close=false,owner=false) {
    const config=authorize(this.store.db,userId,businessId,'reports','dailyClosing');
    if(owner&&config.role!=='owner'||close&&config.role!=='owner'&&!(config.role==='manager'&&this.settings(businessId).managerIds.includes(userId)))throw new DomainError('OWNER_REQUIRED','The owner must grant permission to close.',403);return config;
  }
  assertCanClose(userId:string,businessId:string){return this.permit(userId,businessId,true);}
  private latestSession(businessId:string) { const r=this.row('SELECT * FROM business_sessions WHERE business_id=? ORDER BY opened_at DESC,rowid DESC LIMIT 1',businessId);return r?session(r):null; }
  private legacy(businessId:string):LegacyCashClosing[] {return this.rows('SELECT c.* FROM closings c WHERE c.business_id=? AND NOT EXISTS(SELECT 1 FROM business_sessions s WHERE s.business_id=c.business_id AND s.closed_at=c.date) ORDER BY c.date DESC',businessId).map(r=>({id:String(r.id),businessDate:String(r.business_day),closedAt:String(r.date),openingCashPaise:Number(r.opening_cash_paise),expectedCashPaise:Number(r.expected_cash_paise),actualCashPaise:Number(r.actual_cash_paise),differencePaise:Number(r.difference_paise)}));}
  current(businessId:string):BusinessSession {
    const existing=this.latestSession(businessId);if(existing)return existing;
    const settings=this.settings(businessId),day=sessionDay(this.clock(),settings);
    const legacy=this.legacy(businessId).find(r=>r.businessDate===day);
    if(legacy)return {id:'legacy-'+legacy.id,businessDate:day,openedAt:wallTime(day,settings.cutoff,settings.timezone),timezone:settings.timezone,cutoff:settings.cutoff,openingCashPaise:legacy.openingCashPaise,status:'closed',closedAt:legacy.closedAt};
    return {id:'initial',businessDate:day,openedAt:wallTime(day,settings.cutoff,settings.timezone),timezone:settings.timezone,cutoff:settings.cutoff,openingCashPaise:0,status:'open',closedAt:null};
  }
  /** Called only inside the transaction that will write a financial event. */
  assertWritable(businessId:string) {
    const current=this.current(businessId);if(current.status==='closed')throw new DomainError('DAY_CLOSED','Open the next business session before recording new transactions.',409);
    if(current.id!=='initial')return current;
    const id=randomUUID();this.run('INSERT INTO business_sessions VALUES(?,?,?,?,?,?,?,?,?)',id,businessId,current.businessDate,current.openedAt,current.timezone,current.cutoff,0,'open',null);return {...current,id};
  }
  saveSettings(userId:string,businessId:string,raw:unknown) {
    authorize(this.store.db,userId,businessId,'settings');if(access(this.store.db,userId,businessId).role!=='owner')throw new DomainError('OWNER_REQUIRED','Only the owner can configure closing.',403);const input=object(raw);keys(input,['enabled','timezone','closingTime','cutoff','allowSkipCount','notifications','managerIds','revision']);
    const timezone=string(input.timezone,'Timezone',80);try{new Intl.DateTimeFormat('en',{timeZone:timezone});}catch{throw new DomainError('INVALID_INPUT','Choose an IANA timezone.');}
    const time=(v:unknown)=>{const s=string(v,'Time',5);if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(s))throw new DomainError('INVALID_INPUT','Choose a valid time.');return s;};
    for(const key of ['enabled','allowSkipCount','notifications'])if(typeof input[key]!=='boolean')throw new DomainError('INVALID_INPUT','Choose a preference.');
    if(!Array.isArray(input.managerIds)||input.managerIds.length>50)throw new DomainError('INVALID_INPUT','Invalid closing grants.');
    const managerIds=[...new Set(input.managerIds.map(id=>string(id,'Manager',36)))];for(const id of managerIds)if(!this.row("SELECT user_id FROM memberships WHERE business_id=? AND user_id=? AND role='manager'",businessId,id))throw new DomainError('INVALID_INPUT','Closing can only be granted to a current manager.');
    return this.store.transaction(()=>{const previous=this.settings(businessId);if(integer(input.revision,'Revision')!==previous.revision)throw new DomainError('STALE_SETTINGS','Settings changed.',409);
      const active=this.latestSession(businessId);if(active?.status==='open'&&(timezone!==active.timezone||time(input.cutoff)!==active.cutoff))throw new DomainError('SESSION_ACTIVE','Change timezone or cutoff after closing the active session.',409);
      const next:ClosingSettings={enabled:input.enabled as boolean,timezone,closingTime:time(input.closingTime),cutoff:time(input.cutoff),allowSkipCount:input.allowSkipCount as boolean,notifications:input.notifications as boolean,managerIds,revision:previous.revision+1};
      this.run('INSERT INTO closing_settings VALUES(?,?,?) ON CONFLICT(business_id) DO UPDATE SET data_json=excluded.data_json,revision=excluded.revision',businessId,JSON.stringify(next),next.revision);
      if(next.enabled&&this.current(businessId).status==='open')this.assertWritable(businessId);
      this.store.audit(userId,businessId,'closing.settings','Shop timing and closing preferences updated',this.clock().toISOString());return next;});
  }
  private once<T>(businessId:string,operation:string,input:Record<string,unknown>,work:()=>T):T {
    const key=string(input.idempotencyKey,'Retry key',100),digest=fingerprint(input);
    return this.store.transaction(()=>{const existing=this.row('SELECT * FROM idempotency WHERE business_id=? AND operation=? AND key=?',businessId,operation,key);if(existing){if(existing.fingerprint!==digest)throw new DomainError('IDEMPOTENCY_CONFLICT','Retry changed.',409);return JSON.parse(String(existing.result_json)) as T;}const result=work();this.run('INSERT INTO idempotency VALUES(?,?,?,?,?,?)',businessId,operation,key,digest,JSON.stringify(result),this.clock().toISOString());return result;});
  }
  open(userId:string,businessId:string,raw:unknown):BusinessSession {
    this.permit(userId,businessId,true);const input=object(raw);keys(input,['openingCashPaise','idempotencyKey']);const opening=integer(input.openingCashPaise,'Opening physical cash');
    return this.once(businessId,'closing.open',input,()=>{const previous=this.current(businessId);if(previous.id!=='initial'&&previous.status==='open')throw new DomainError('SESSION_ACTIVE','A session is already open.',409);const at=this.clock().toISOString(),settings=this.settings(businessId),day=sessionDay(this.clock(),settings);
      if(previous.closedAt&&at<=previous.closedAt)throw new DomainError('INVALID_TIME','The next session must start after the previous close.',409);
      const start=previous.id!=='initial'?at:wallTime(day,settings.cutoff,settings.timezone),id=randomUUID();
      this.run('INSERT INTO business_sessions VALUES(?,?,?,?,?,?,?,?,?)',id,businessId,day,start,settings.timezone,settings.cutoff,opening,'open',null);this.store.audit(userId,businessId,'closing.opened',`${id} · confirmed opening ${opening} paise`,at);return this.current(businessId);});
  }
  preview(userId:string,businessId:string):ClosingPreview { this.permit(userId,businessId);return this.store.transaction(()=>this.calculate(businessId)); }
  calculate(businessId:string):ClosingPreview {
    const current=this.current(businessId),at=current.closedAt||this.clock().toISOString(),start=current.openedAt;
    if(current.status==='closed'&&!current.id.startsWith('legacy-')){const saved=this.row('SELECT data_json FROM closing_versions WHERE business_id=? AND session_id=? ORDER BY version DESC LIMIT 1',businessId,current.id);if(saved)return JSON.parse(String(saved.data_json));}
    const invoices=this.rows('SELECT * FROM invoices WHERE business_id=? AND date<=? ORDER BY date,id',businessId,at);
    const payments=this.rows('SELECT * FROM payments WHERE business_id=? AND date<=? ORDER BY date,id',businessId,at);
    const cancellations=this.rows("SELECT reference_id,MIN(date) date FROM movements WHERE business_id=? AND reason='cancellation' AND date<=? GROUP BY reference_id ORDER BY reference_id",businessId,at),cancelled=new Map(cancellations.map(r=>[String(r.reference_id),String(r.date)]));
    const window=(r:Row)=>String(r.date)>=start;
    const sold=invoices.filter(window),receipts=payments.filter(p=>window(p)&&p.kind!=='refund'),refunds=payments.filter(p=>window(p)&&p.kind==='refund');
    const returns=invoices.filter(i=>cancelled.has(String(i.id))&&cancelled.get(String(i.id))!>=start);
    const expenses=this.rows('SELECT * FROM expenses WHERE business_id=? AND date>=? AND date<=? ORDER BY date,id',businessId,start,at);
    const purchases=this.rows('SELECT * FROM purchases WHERE business_id=? AND date>=? AND date<=? ORDER BY date,id',businessId,start,at);
    const supplierPayments=this.rows('SELECT * FROM supplier_payments WHERE business_id=? AND date>=? AND date<=? ORDER BY date,id',businessId,start,at);
    const cashMoves=this.rows('SELECT * FROM cash_movements WHERE business_id=? AND date>=? AND date<=? ORDER BY date,id',businessId,start,at);
    const sum=(rows:Row[],key:string)=>safeSum(rows.map(r=>Number(r[key])));
    const paidByInvoice=new Map<string,number>(),openingPaidByInvoice=new Map<string,number>(),salePaidByInvoice=new Map<string,number>();
    for(const p of payments){const id=String(p.invoice_id),value=Number(p.amount_paise)*(p.kind==='refund'?-1:1);paidByInvoice.set(id,safeSum([paidByInvoice.get(id)||0,value]));if(String(p.date)<start)openingPaidByInvoice.set(id,safeSum([openingPaidByInvoice.get(id)||0,value]));if(p.kind==='sale')salePaidByInvoice.set(id,safeSum([salePaidByInvoice.get(id)||0,Number(p.amount_paise)]));}
    const salePaid=(id:string)=>salePaidByInvoice.get(id)||0;
    const credit=(i:Row)=>Number(i.total_paise)-salePaid(String(i.id));
    const receivable=(before:boolean)=>safeSum(invoices.filter(i=>i.customer_id&&(before?String(i.date)<start:true)).map(i=>{
      const reversed=cancelled.has(String(i.id))&&(!before||cancelled.get(String(i.id))!<start);
      const paid=(before?openingPaidByInvoice:paidByInvoice).get(String(i.id))||0;
      return (reversed?0:Number(i.total_paise))-paid;
    }));
    const cashCollections=sum(receipts.filter(r=>r.method==='cash'),'amount_paise'),upiCollections=sum(receipts.filter(r=>r.method==='upi'),'amount_paise');
    // Purchases.paid_paise includes later allocations; remove them to recover the received-at cash payment.
    const allSupplierPaid=new Map(this.rows('SELECT purchase_id,SUM(amount_paise) amount FROM supplier_payments WHERE business_id=? GROUP BY purchase_id',businessId).map(r=>[String(r.purchase_id),Number(r.amount)]));
    const originalPurchasePaid=safeSum(purchases.map(p=>Number(p.paid_paise)-(allSupplierPaid.get(String(p.id))||0)));
    const soldIds=new Set(sold.map(r=>String(r.id)));
    const cashExpenses=sum(expenses.filter(r=>r.method==='cash'),'amount_paise'),cashSupplier=safeSum([originalPurchasePaid,sum(supplierPayments.filter(r=>r.method==='cash'),'amount_paise')]),cashRefunds=sum(refunds.filter(r=>r.method==='cash'),'amount_paise');
    const deposits=sum(cashMoves.filter(r=>r.kind==='deposit'),'amount_paise'),withdrawals=sum(cashMoves.filter(r=>r.kind==='withdrawal'),'amount_paise');
    const totals:ClosingTotals={grossSalesPaise:sum(sold,'subtotal_paise'),discountsPaise:sum(sold,'discount_paise'),returnsPaise:sum(returns,'total_paise'),netSalesPaise:safeSum([sum(sold,'total_paise'),-sum(returns,'total_paise')]),collectionsPaise:safeSum([cashCollections,upiCollections]),cashCollectionsPaise:cashCollections,upiCollectionsPaise:upiCollections,
      saleCollectionsPaise:sum(receipts.filter(r=>soldIds.has(String(r.invoice_id))),'amount_paise'),olderDuesCollectionsPaise:sum(receipts.filter(r=>!soldIds.has(String(r.invoice_id))),'amount_paise'),creditCollectionsPaise:sum(receipts.filter(r=>r.kind==='repayment'),'amount_paise'),newCreditPaise:safeSum(sold.map(credit)),openingReceivablePaise:receivable(true),closingReceivablePaise:receivable(false),creditReversalsPaise:safeSum(returns.map(credit)),expensesPaise:sum(expenses,'amount_paise'),cashExpensesPaise:cashExpenses,supplierPaymentsPaise:safeSum([originalPurchasePaid,sum(supplierPayments,'amount_paise')]),cashSupplierPaymentsPaise:cashSupplier,refundsPaise:sum(refunds,'amount_paise'),cashRefundsPaise:cashRefunds,upiRefundsPaise:sum(refunds.filter(r=>r.method==='upi'),'amount_paise'),depositsPaise:deposits,withdrawalsPaise:withdrawals,
      expectedCashPaise:safeSum([current.openingCashPaise,cashCollections,-cashExpenses,-cashSupplier,-cashRefunds,deposits,-withdrawals]),billCount:sold.length,purchaseCount:purchases.length,lowStockCount:Number(this.row('SELECT COUNT(*) n FROM products WHERE business_id=? AND quantity_milli<=min_stock_milli',businessId)!.n)};
    const ids=(rows:Row[])=>rows.map(r=>String(r.id));const sources={invoices:ids(sold),payments:ids(payments.filter(window)),purchases:ids(purchases),expenses:ids(expenses),supplierPayments:ids(supplierPayments),cashMovements:ids(cashMoves),returns:ids(returns)};
    // Full source content guards against any intervening transaction or correction, not just totals.
    const movements=this.rows('SELECT * FROM movements WHERE business_id=? AND date>=? AND date<=? ORDER BY date,id',businessId,start,at);
    const products=this.rows('SELECT id,name,variation,unit,quantity_milli,min_stock_milli FROM products WHERE business_id=? ORDER BY id',businessId);
    const movementsByProduct=new Map<string,Row[]>();for(const m of movements){const id=String(m.product_id);const list=movementsByProduct.get(id)||[];list.push(m);movementsByProduct.set(id,list);}
    const inventory=products.filter(p=>movementsByProduct.has(String(p.id))||Number(p.quantity_milli)<=Number(p.min_stock_milli)).map(p=>{const changes=movementsByProduct.get(String(p.id))||[],quantity=(reasons:string[])=>safeSum(changes.filter(m=>reasons.includes(String(m.reason))).map(m=>Math.abs(Number(m.quantity_milli))));return {productId:String(p.id),name:String(p.name),variant:String(p.variation),unit:String(p.unit),availableMilli:Number(p.quantity_milli),soldMilli:quantity(['sale']),receivedMilli:quantity(['receipt','purchase','opening']),returnedMilli:quantity(['cancellation']),wastedMilli:quantity(['wastage'])};});
    const digest=createHash('sha256').update(JSON.stringify({current,totals,invoices,payments,cancellations,expenses,purchases,supplierPayments,cashMoves,movements,products})).digest('hex');
    const warnings=totals.expectedCashPaise<0?['negativeCash']:[];
    if(current.status==='open'&&current.businessDate!==sessionDay(this.clock(),this.settings(businessId)))warnings.push('overdueSession');
    if(Number(this.row("SELECT COUNT(*) n FROM reorder_drafts WHERE business_id=? AND status='draft'",businessId)!.n)>0)warnings.push('pendingOrders');
    return {session:current,asOf:at,fingerprint:digest,totals,sources,inventory,warnings};
  }
  close(userId:string,businessId:string,raw:unknown,automatic=false,scheduledAt:string|null=null):ClosingReport {
    this.permit(userId,businessId,true);const input=object(raw);keys(input,['fingerprint','actualCashPaise','acknowledged','idempotencyKey']);
    const actual=input.actualCashPaise===null||input.actualCashPaise===undefined?null:integer(input.actualCashPaise,'Physical cash');if(!automatic&&actual===null&&!this.settings(businessId).allowSkipCount)throw new DomainError('CASH_COUNT_REQUIRED','Physical cash count is required.');
    return this.once(businessId,'closing.finalize',input,()=>{let preview=this.calculate(businessId);if(preview.session.status==='closed'){const saved=this.report(userId,businessId,preview.session.id);if(automatic)return saved;throw new DomainError('ALREADY_CLOSED','This session is already closed.',409);}
      this.permit(userId,businessId,true);
      if(!automatic&&string(input.fingerprint,'Review fingerprint',64)!==preview.fingerprint)throw new DomainError('STALE_PREVIEW','Records changed. Review the latest totals.',409);
      if(!automatic&&(preview.warnings.length||actual!==null&&actual!==preview.totals.expectedCashPaise)&&input.acknowledged!==true)throw new DomainError('ACKNOWLEDGEMENT_REQUIRED','Review and acknowledge the cash difference.',409);
      const active=this.assertWritable(businessId);preview={...preview,session:active};const at=this.clock().toISOString(),id=randomUUID();this.run("UPDATE business_sessions SET status='closed',closed_at=? WHERE business_id=? AND id=? AND status='open'",at,businessId,active.id);
      const actor=this.row('SELECT name FROM users WHERE id=?',userId)!,report:ClosingReport={...preview,id,reference:`DS-${active.businessDate}-${active.id.slice(0,6)}`,version:1,calculationVersion:'10.1.0',merchant:branding(this.store.db,businessId),actorKind:automatic?'system':'user',authorizedBy:userId,actorId:automatic?'closing-worker':userId,actorName:automatic?'DukaanSet':String(actor.name),method:automatic?'automatic':'manual',scheduledAt,actualCashPaise:automatic?null:actual,differencePaise:automatic||actual===null?null:actual-preview.totals.expectedCashPaise,verification:automatic||actual===null?'pending':actual===preview.totals.expectedCashPaise?'matched':'difference',reason:'',sourceReferences:[]};
      // The trusted close time includes every event observed under this write lock.
      report.asOf=at;report.session={...active,status:'closed',closedAt:at};this.run('INSERT INTO closing_versions VALUES(?,?,?,?,?,?)',id,businessId,active.id,1,JSON.stringify(report),at);this.store.audit(userId,businessId,'closing.saved',`${active.id} · v1 · ${report.method}`,at);
      if(this.settings(businessId).notifications)this.notice(businessId,active.id,automatic?'automaticPending':'closed');return report;});
  }
  report(userId:string,businessId:string,sessionId:string,version?:number):ClosingReport {
    this.permit(userId,businessId);const r=version===undefined?this.row('SELECT data_json FROM closing_versions WHERE business_id=? AND session_id=? ORDER BY version DESC LIMIT 1',businessId,sessionId):this.row('SELECT data_json FROM closing_versions WHERE business_id=? AND session_id=? AND version=?',businessId,sessionId,version);if(!r)throw new DomainError('NOT_FOUND','Closing report not found.',404);return JSON.parse(String(r.data_json));
  }
  history(userId:string,businessId:string,start='1970-01-01',end='9999-12-31'):ClosingReport[] {
    this.permit(userId,businessId);if(!date(start)||!date(end)||start>end)throw new DomainError('INVALID_INPUT','Invalid report period.');
    return this.rows('SELECT v.data_json FROM closing_versions v JOIN business_sessions s ON s.id=v.session_id AND s.business_id=v.business_id WHERE v.business_id=? AND s.business_date>=? AND s.business_date<=? AND v.version=(SELECT MAX(x.version) FROM closing_versions x WHERE x.session_id=v.session_id) ORDER BY s.business_date DESC,s.opened_at DESC',businessId,start,end).map(r=>JSON.parse(String(r.data_json)));
  }
  versions(userId:string,businessId:string,sessionId:string):ClosingReport[] {this.permit(userId,businessId);return this.rows('SELECT data_json FROM closing_versions WHERE business_id=? AND session_id=? ORDER BY version DESC',businessId,sessionId).map(r=>JSON.parse(String(r.data_json)));}
  reconcile(userId:string,businessId:string,sessionId:string,raw:unknown):ClosingReport {
    this.permit(userId,businessId,false,true);const input=object(raw);keys(input,['actualCashPaise','reason','sourceReferences','version','idempotencyKey']);const actual=integer(input.actualCashPaise,'Physical cash'),reason=string(input.reason,'Correction reason',500);if(!Array.isArray(input.sourceReferences)||input.sourceReferences.length<1||input.sourceReferences.length>50)throw new DomainError('INVALID_INPUT','Provide source references.');const refs=input.sourceReferences.map(r=>string(r,'Source reference',100));
    return this.once(businessId,`closing.reconcile.${sessionId}`,input,()=>{const previous=this.report(userId,businessId,sessionId);if(integer(input.version,'Version',1)!==previous.version)throw new DomainError('CONFLICT','Report changed.',409);const next:ClosingReport={...previous,id:randomUUID(),version:previous.version+1,actualCashPaise:actual,differencePaise:actual-previous.totals.expectedCashPaise,verification:actual===previous.totals.expectedCashPaise?'matched':'difference',reason,sourceReferences:refs,revisionActorId:userId,revisionActorName:String(this.row('SELECT name FROM users WHERE id=?',userId)!.name),revisedAt:this.clock().toISOString()};
      this.run('INSERT INTO closing_versions VALUES(?,?,?,?,?,?)',next.id,businessId,sessionId,next.version,JSON.stringify(next),this.clock().toISOString());this.store.audit(userId,businessId,'closing.reconciled',`${sessionId} · v${next.version} · ${reason}`,this.clock().toISOString());return next;});
  }
  /** A late entry is recorded in an explicitly opened session, then linked to the original report. No second ledger mutation. */
  linkCorrection(userId:string,businessId:string,sessionId:string,raw:unknown):ClosingReport {
    this.permit(userId,businessId,false,true);const input=object(raw);keys(input,['sourceId','reason','version','idempotencyKey']);const sourceId=string(input.sourceId,'Recorded source',100),reason=string(input.reason,'Correction reason',500);
    return this.once(businessId,`closing.link.${sessionId}`,input,()=>{const previous=this.report(userId,businessId,sessionId);if(integer(input.version,'Version',1)!==previous.version)throw new DomainError('CONFLICT','Report changed.',409);
      const source=this.rows("SELECT id,'invoice' type,date,total_paise amount FROM invoices WHERE business_id=? AND id=? UNION ALL SELECT id,'payment',date,amount_paise FROM payments WHERE business_id=? AND id=? UNION ALL SELECT id,'expense',date,amount_paise FROM expenses WHERE business_id=? AND id=? UNION ALL SELECT id,'purchase',date,total_paise FROM purchases WHERE business_id=? AND id=? UNION ALL SELECT id,'supplierPayment',date,amount_paise FROM supplier_payments WHERE business_id=? AND id=? UNION ALL SELECT id,kind,date,amount_paise FROM cash_movements WHERE business_id=? AND id=?",businessId,sourceId,businessId,sourceId,businessId,sourceId,businessId,sourceId,businessId,sourceId,businessId,sourceId)[0];
      if(!source)throw new DomainError('NOT_FOUND','The recorded source is not in this business.',404);
      if(String(source.date)<=previous.asOf)throw new DomainError('CORRECTION_SOURCE','Choose a late entry recorded after the original closing.',409);
      if(previous.linkedCorrections?.some(r=>r.sourceId===sourceId))throw new DomainError('CONFLICT','This source is already linked.',409);
      const at=this.clock().toISOString(),next:ClosingReport={...previous,id:randomUUID(),version:previous.version+1,reason,sourceReferences:[sourceId],revisionActorId:userId,revisionActorName:String(this.row('SELECT name FROM users WHERE id=?',userId)!.name),revisedAt:at,linkedCorrections:[...(previous.linkedCorrections||[]),{sourceId,type:String(source.type),date:String(source.date),amountPaise:Number(source.amount)}]};
      this.run('INSERT INTO closing_versions VALUES(?,?,?,?,?,?)',next.id,businessId,sessionId,next.version,JSON.stringify(next),at);this.store.audit(userId,businessId,'closing.linked-correction',`${sessionId} · v${next.version} · ${sourceId} · ${reason}`,at);return next;});
  }
  cashMovement(userId:string,businessId:string,raw:unknown) {
    this.permit(userId,businessId,true);const input=object(raw);keys(input,['kind','amountPaise','reason','idempotencyKey']);if(input.kind!=='deposit'&&input.kind!=='withdrawal')throw new DomainError('INVALID_INPUT','Invalid cash movement.');const amount=integer(input.amountPaise,'Cash amount',1),reason=string(input.reason,'Reason',200);
    return this.once(businessId,'closing.cash',input,()=>{const current=this.assertWritable(businessId),at=this.clock().toISOString(),id=randomUUID();this.run('INSERT INTO cash_movements VALUES(?,?,?,?,?,?,?,?)',id,businessId,current.id,amount,String(input.kind),reason,userId,at);this.store.audit(userId,businessId,'cash.'+input.kind,`${id} · ${reason}`,at);return {id};});
  }
  setOpening(userId:string,businessId:string,raw:unknown) {
    this.permit(userId,businessId,true);const input=object(raw);keys(input,['openingCashPaise','previousOpeningCashPaise','idempotencyKey']);const amount=integer(input.openingCashPaise,'Opening cash'),previous=integer(input.previousOpeningCashPaise,'Previous opening cash');
    return this.once(businessId,'closing.opening-cash',input,()=>{const current=this.assertWritable(businessId);if(current.openingCashPaise!==previous)throw new DomainError('CONFLICT','Opening cash changed.',409);this.run('UPDATE business_sessions SET opening_cash_paise=? WHERE business_id=? AND id=?',amount,businessId,current.id);this.store.audit(userId,businessId,'closing.opening-cash',`${current.id} · ${previous} to ${amount} paise`,this.clock().toISOString());return this.current(businessId);});
  }
  supplierPayment(userId:string,businessId:string,purchaseId:string,raw:unknown) {
    authorize(this.store.db,userId,businessId,'purchases');const input=object(raw);keys(input,['amountPaise','method','idempotencyKey']);const amount=integer(input.amountPaise,'Supplier payment',1),paymentMethod=method(input.method);
    return this.once(businessId,'supplier.payment.'+purchaseId,input,()=>{this.assertWritable(businessId);const purchase=this.row('SELECT * FROM purchases WHERE business_id=? AND id=?',businessId,purchaseId);if(!purchase)throw new DomainError('NOT_FOUND','Purchase not found.',404);if(amount>Number(purchase.balance_paise))throw new DomainError('OVERPAYMENT','Payment exceeds supplier payable.',409);const id=randomUUID(),at=this.clock().toISOString();this.run('INSERT INTO supplier_payments VALUES(?,?,?,?,?,?,?,?)',id,businessId,purchaseId,String(purchase.supplier_id),amount,paymentMethod,userId,at);this.run('UPDATE purchases SET paid_paise=paid_paise+?,balance_paise=balance_paise-? WHERE id=? AND business_id=?',amount,amount,purchaseId,businessId);this.store.audit(userId,businessId,'supplier.payment',`${id} · ${purchaseId}`,at);return {id,purchaseId,amountPaise:amount,method:paymentMethod,date:at};});
  }
  overview(userId:string,businessId:string):ClosingOverview {this.permit(userId,businessId);const current=this.current(businessId),config=access(this.store.db,userId,businessId);return {today:sessionDay(this.clock(),this.settings(businessId)),settings:this.settings(businessId),session:current,latest:current.status==='closed'&&!current.id.startsWith('legacy-')?this.report(userId,businessId,current.id):this.history(userId,businessId)[0]||null,canClose:config.role==='owner'||config.role==='manager'&&this.settings(businessId).managerIds.includes(userId),legacy:this.legacy(businessId),notices:config.role==='owner'?this.rows('SELECT * FROM closing_notices WHERE business_id=? ORDER BY date DESC LIMIT 20',businessId).map(r=>({id:String(r.id),kind:String(r.kind),date:String(r.date),sessionId:String(r.session_id)})):[]};}
  private notice(businessId:string,sessionId:string,kind:string) { if(!this.settings(businessId).notifications)return;this.run('INSERT OR IGNORE INTO closing_notices VALUES(?,?,?,?,?)',randomUUID(),businessId,sessionId,kind,this.clock().toISOString()); }
  /** Persist work before attempting it; transaction and session uniqueness serialize multiple workers. */
  tick():{completed:number;failed:number} {
    const at=this.clock().toISOString();let completed=0,failed=0;
    this.store.transaction(()=>{for(const r of this.rows("SELECT s.* FROM business_sessions s JOIN closing_settings c ON c.business_id=s.business_id WHERE s.status='open'")){
      const settings=this.settings(String(r.business_id));if(!settings.enabled)continue;const s=session(r);const day=settings.closingTime<=s.cutoff?shiftDay(s.businessDate,1):s.businessDate;
      try{const due=wallTime(day,settings.closingTime,s.timezone);this.run("INSERT INTO closing_jobs VALUES(?,?,?,?,?,'queued',0,'',?) ON CONFLICT(session_id) DO UPDATE SET scheduled_at=excluded.scheduled_at,next_attempt=excluded.next_attempt,status='queued',attempts=0,error_code='',updated_at=excluded.updated_at WHERE closing_jobs.status!='done' AND closing_jobs.scheduled_at!=excluded.scheduled_at",randomUUID(),String(r.business_id),s.id,due,due,at);}catch{this.notice(String(r.business_id),s.id,'invalidSchedule');}
    }});
    for(const job of this.rows("SELECT * FROM closing_jobs WHERE status!='done' AND next_attempt<=? ORDER BY next_attempt LIMIT 30",at)){
      const businessId=String(job.business_id),sessionId=String(job.session_id);try{this.store.transaction(()=>{const current=this.latestSession(businessId),settings=this.settings(businessId);if(!settings.enabled)return;if(!current||current.id!==sessionId||current.status==='closed'){this.run("UPDATE closing_jobs SET status='done',updated_at=? WHERE id=?",at,String(job.id));return;}
        const owner=this.row("SELECT user_id FROM memberships WHERE business_id=? AND role='owner' ORDER BY user_id LIMIT 1",businessId);if(!owner)throw new DomainError('OWNER_REQUIRED','No owner found.',409);
        this.close(String(owner.user_id),businessId,{idempotencyKey:'auto-'+sessionId,actualCashPaise:null},true,String(job.scheduled_at));this.run("UPDATE closing_jobs SET status='done',attempts=attempts+1,error_code='',updated_at=? WHERE id=?",at,String(job.id));completed++;});
      }catch(error){failed++;const code=error instanceof DomainError?error.code:'INTERNAL';const attempts=Number(job.attempts)+1,retry=new Date(this.clock().getTime()+Math.min(3600000,60000*2**Math.min(attempts,6))).toISOString();this.store.transaction(()=>{this.run("UPDATE closing_jobs SET status='failed',attempts=?,error_code=?,next_attempt=?,updated_at=? WHERE id=?",attempts,code,retry,at,String(job.id));this.notice(businessId,sessionId,'autoCloseFailed');});}
    }return {completed,failed};
  }
}
