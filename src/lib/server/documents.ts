import { createHash, randomUUID } from 'node:crypto';
import type { Store } from './store';
import type { Branding, CustomerLedger, DocumentModel, IssuedSnapshot, LedgerRow, PreparedDocument, DocumentEntry } from '../document-contracts';
import type { Invoice, Payment } from '../contracts';
import { branding, captureIssued } from './document-snapshots';
import { DomainError, date, keys, language, object, oneOf, string } from './validation';
import { businessDay } from '../client';
import { renderPdf } from './pdf-renderer';
import {access} from './access';
import sharp from 'sharp';

type Row = Record<string, string | number | null>;
const notFound = () => new DomainError('NOT_FOUND', 'Document source not found.', 404);
const payment = (r: Row): Payment => ({ id: String(r.id), customerId: r.customer_id as string | null, invoiceId: r.invoice_id as string | null, amountPaise: Number(r.amount_paise) * (r.kind === 'refund' ? -1 : 1), date: String(r.date), method: r.method as Payment['method'], kind: r.kind as Payment['kind'] });
export function safeFilename(reference: string, kind: string, language: string) { return `${kind}-${reference.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 90)}-${language}.pdf`; }
export class DocumentService {
  constructor(readonly store: Store) {}
  private rows(sql: string, ...args: (string | number | null)[]) { return this.store.db.prepare(sql).all(...args) as Row[]; }
  private row(sql: string, ...args: (string | number | null)[]) { return this.store.db.prepare(sql).get(...args) as Row | undefined; }
  private customer(businessId: string, id: string) { const r = this.row('SELECT * FROM customers WHERE business_id=? AND id=?', businessId, id); if (!r) throw notFound(); return { id, name: String(r.name), phone: String(r.phone) }; }
  private permit(userId: string, businessId: string, kind: string) { this.store.assertPermission(userId, businessId, kind === 'invoice' ? 'sales' : kind === 'receipt' ? 'payments' : 'customers'); }
  getBranding(userId: string, businessId: string) { this.store.assertMember(userId, businessId); return branding(this.store.db, businessId); }
  async saveBranding(userId: string, businessId: string, raw: unknown) {
    this.store.assertPermission(userId, businessId, 'settings');
    const input = object(raw); keys(input, ['name', 'address', 'phone', 'email', 'website', 'tagline', 'footer', 'terms', 'returnPolicy', 'accent', 'logo', 'upiId', 'payee', 'revision']);
    const value = {} as Branding;
    for (const key of ['name', 'address', 'phone', 'email', 'website', 'tagline', 'footer', 'terms', 'returnPolicy', 'accent', 'logo', 'upiId', 'payee'] as const) value[key] = string(input[key], key, key === 'logo' ? 400000 : ['terms', 'returnPolicy', 'footer'].includes(key) ? 600 : 160, key !== 'name');
    if (!/^#[0-9a-f]{6}$/i.test(value.accent)) throw new DomainError('INVALID_INPUT', 'Invalid colour.');
    // Restrict white-on-accent text to a readable luminance; no remote image fetch/SSRF.
    const rgb = value.accent.slice(1).match(/../g)!.map(v => parseInt(v, 16) / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
    if (.2126 * rgb[0] + .7152 * rgb[1] + .0722 * rgb[2] > .183) throw new DomainError('DOCUMENT_COLOUR', 'Choose a darker colour.');
    if (value.logo && !/^data:image\/png;base64,[A-Za-z0-9+/]+=*$/.test(value.logo)) throw new DomainError('INVALID_INPUT', 'Use a PNG logo.');
    if(value.logo){try{const bytes=Buffer.from(value.logo.split(',')[1],'base64'),image=sharp(bytes,{limitInputPixels:1048576,animated:false});const metadata=await image.metadata();if(metadata.format!=='png'||(metadata.pages||1)>1)throw new Error('PNG required');value.logo='data:image/png;base64,'+(await image.resize(192,192,{fit:'inside',withoutEnlargement:true}).png().toBuffer()).toString('base64');}catch{throw new DomainError('INVALID_INPUT','Invalid logo.');}}
    if (value.upiId && !/^[a-zA-Z0-9._-]{2,100}@[a-zA-Z0-9.-]{2,30}$/.test(value.upiId)) throw new DomainError('INVALID_INPUT', 'Invalid UPI address.');
    if (value.upiId && !value.payee) throw new DomainError('INVALID_INPUT', 'Payee required.');
    if (value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email)) throw new DomainError('INVALID_INPUT', 'Invalid email.');
    if (value.website && !/^https:\/\/[^\s]+$/i.test(value.website)) throw new DomainError('INVALID_INPUT', 'Use HTTPS.');
    return this.store.transaction(() => { this.store.assertPermission(userId,businessId,'settings');const previous = branding(this.store.db, businessId); if (Number(input.revision) !== previous.revision) throw new DomainError('CONFLICT', 'Settings changed.', 409); value.revision = previous.revision + 1; this.store.db.prepare('INSERT INTO invoice_branding VALUES(?,?,?) ON CONFLICT(business_id) DO UPDATE SET data_json=excluded.data_json,revision=excluded.revision').run(businessId, JSON.stringify(value), value.revision); this.store.audit(userId, businessId, 'documents.branding', 'Invoice branding updated'); return value; });
  }
  ledger(userId: string, businessId: string, customerId: string, start: string, end: string): CustomerLedger {
    this.permit(userId, businessId, 'statement');
    if (!date(start) || !date(end) || start > end || end > businessDay()) throw new DomainError('DOCUMENT_RANGE', 'Invalid statement period.');
    return this.store.transaction(() => {
      const customer = this.customer(businessId, customerId), asOf = new Date().toISOString();
      // Query the complete ledger, independently of the recent dashboard history limit.
      const invoices = this.rows('SELECT * FROM invoices WHERE business_id=? AND customer_id=? AND date<=? ORDER BY date,id', businessId, customerId, asOf);
      const payments = this.rows('SELECT p.*,i.number FROM payments p LEFT JOIN invoices i ON i.id=p.invoice_id AND i.business_id=p.business_id WHERE p.business_id=? AND p.customer_id=? AND p.date<=? ORDER BY p.date,p.id', businessId, customerId, asOf);
      if (invoices.length > 5000 || payments.length > 10000 || invoices.reduce((n,r)=>n+String(r.items_json).length,0)>8388608) throw new DomainError('STATEMENT_LIMIT', 'Statement too large.', 409);
      const cancellations = this.rows("SELECT reference_id,MIN(date) date FROM movements WHERE business_id=? AND reason='cancellation' GROUP BY reference_id", businessId);
      const cancelDates = new Map(cancellations.map(r => [String(r.reference_id), String(r.date)]));
      const events: Omit<LedgerRow,'balancePaise'>[] = [];
      for (const invoice of invoices) {
        events.push({ id: `i:${invoice.id}`, date: String(invoice.date), reference: String(invoice.number), kind: 'purchase', debitPaise: Number(invoice.total_paise), creditPaise: 0, invoiceId: String(invoice.id), paymentId: null });
        if (invoice.status === 'cancelled') { const at = cancelDates.get(String(invoice.id)); if (!at) throw new DomainError('DOCUMENT_INCOMPLETE', 'Cancellation history missing.', 409); events.push({ id: `c:${invoice.id}`, date: at, reference: String(invoice.number), kind: 'cancellation', debitPaise: 0, creditPaise: Number(invoice.total_paise), invoiceId: String(invoice.id), paymentId: null }); }
      }
      for (const p of payments) events.push({ id: `p:${p.id}`, date: String(p.date), reference: String(p.number || p.receipt_id || p.id), kind: p.kind as LedgerRow['kind'], debitPaise: p.kind === 'refund' ? Number(p.amount_paise) : 0, creditPaise: p.kind === 'refund' ? 0 : Number(p.amount_paise), invoiceId: p.invoice_id as string | null, paymentId: String(p.id) });
      const rank = { purchase: 0, sale: 1, repayment: 2, cancellation: 3, refund: 4 };
      events.sort((a,b)=>a.date.localeCompare(b.date)||rank[a.kind]-rank[b.kind]||a.id.localeCompare(b.id));
      let openingPaise = 0, balance = 0, debitsPaise = 0, creditsPaise = 0; const rows: LedgerRow[] = [];
      for (const entry of events) { const day = businessDay(entry.date); if (day > end || entry.date > asOf) continue; balance += entry.debitPaise - entry.creditPaise; if (!Number.isSafeInteger(balance)) throw new DomainError('DOCUMENT_INCOMPLETE', 'Unsafe ledger sum.', 409); if (day < start) openingPaise = balance; else { rows.push({ ...entry, balancePaise: balance }); debitsPaise += entry.debitPaise; creditsPaise += entry.creditPaise; } }
      const receiptGroups = new Map<string, { id: string; date: string; amountPaise: number; method: string; kind: string }>();
      for (const p of payments.filter(p=>businessDay(String(p.date))>=start&&businessDay(String(p.date))<=end)) { const id = String(p.receipt_id || p.id), prior = receiptGroups.get(id); receiptGroups.set(id,{id,date:String(p.date),amountPaise:(prior?.amountPaise||0)+(p.kind==='refund'?-1:1)*Number(p.amount_paise),method:String(p.method),kind:String(p.kind)}); }
      return { customer, start, end, asOf, openingPaise, closingPaise: balance, debitsPaise, creditsPaise, rows, purchaseCount: rows.filter(r=>r.kind==='purchase').length, invoices: invoices.filter(r=>businessDay(String(r.date))>=start&&businessDay(String(r.date))<=end).map(r=>({id:String(r.id),number:String(r.number),date:String(r.date)})), receipts: [...receiptGroups.values()] };
    });
  }
  model(userId:string,businessId:string,raw:unknown):DocumentModel{return this.buildModel(userId,businessId,raw);}
  invoiceView(userId:string,businessId:string,id:string):DocumentModel {const p=access(this.store.db,userId,businessId).permissions;if(!p.sales&&!p.customers&&!p.payments)throw new DomainError('FORBIDDEN','Your role cannot view this invoice.',403);return this.buildModel(userId,businessId,{kind:'invoice',sourceId:id,language:'en',format:'a4'},true);}
  private buildModel(userId: string, businessId: string, raw: unknown,view=false): DocumentModel {
    const input = object(raw); keys(input, ['kind', 'sourceId', 'language', 'format', 'start', 'end', 'detailed']);
    const kind = oneOf(input.kind, 'Document type', ['invoice','statement','receipt'] as const), sourceId = string(input.sourceId, 'Record', 80);
    if(!view)this.permit(userId, businessId, kind);
    const selectedLanguage = language(input.language), format = oneOf(input.format || 'a4', 'Format', ['a4','mono','58mm','80mm'] as const);
    if(input.detailed!==undefined&&typeof input.detailed!=='boolean')throw new DomainError('INVALID_INPUT','Invalid detail setting.');
    return this.store.transaction(() => {
      const base: DocumentModel = { kind, sourceId, businessId, language: selectedLanguage, format, detailed: input.detailed !== false, generatedAt: new Date().toISOString(), merchant: branding(this.store.db,businessId), customer: {id:null,name:'',phone:''}, reference: '', legacy: false };
      if (kind === 'statement') { const ledger = this.ledger(userId,businessId,sourceId,String(input.start || ''),String(input.end || '')); const purchaseDetails:DocumentModel['purchaseDetails']={};if(base.detailed)for(const invoice of this.rows('SELECT id,items_json FROM invoices WHERE business_id=? AND customer_id=?',businessId,sourceId))if(ledger.invoices.some(i=>i.id===invoice.id))purchaseDetails[String(invoice.id)]=JSON.parse(String(invoice.items_json));return { ...base, ledger, purchaseDetails, customer: ledger.customer, reference: `HS-${sourceId.slice(0,8)}-${ledger.start}-${ledger.end}` }; }
      if (kind === 'invoice') {
        const row = this.row('SELECT * FROM invoices WHERE business_id=? AND id=?',businessId,sourceId); if (!row) throw notFound();
        const receipts = this.rows('SELECT * FROM payments WHERE business_id=? AND invoice_id=? ORDER BY date,id',businessId,sourceId).map(payment);
        let snapshot: IssuedSnapshot;
        if(row.issued_json) snapshot=JSON.parse(String(row.issued_json)); else { snapshot={...captureIssued(this.store.db,businessId,row.customer_id as string|null,String(row.customer_name)),provenance:'legacy'}; this.store.db.prepare('UPDATE invoices SET issued_json=? WHERE business_id=? AND id=? AND issued_json IS NULL').run(JSON.stringify(snapshot),businessId,sourceId); }
        const invoice: DocumentModel['invoice'] = { id:sourceId, number:String(row.number), date:String(row.date), customerId:row.customer_id as string|null, customerName:String(row.customer_name), items:JSON.parse(String(row.items_json)), subtotalPaise:Number(row.subtotal_paise), discountPaise:Number(row.discount_paise), totalPaise:Number(row.total_paise), originalPaidPaise:Number(row.original_paid_paise), originalBalancePaise:Number(row.total_paise)-Number(row.original_paid_paise), paidPaise:row.status==='cancelled'?0:Number(row.paid_paise),balancePaise:row.status==='cancelled'?0:Number(row.balance_paise),status:row.status as Invoice['status'],paymentMethod:row.payment_method as Invoice['paymentMethod'],dueDate:row.due_date as string|null,payments:receipts };
        return { ...base, invoice, merchant:snapshot.merchant, customer:snapshot.customer,legacy:snapshot.provenance==='legacy',originalPayments:receipts.filter(p=>p.kind==='sale'),reference:invoice.number };
      }
      const first = this.row('SELECT * FROM payments WHERE business_id=? AND (id=? OR receipt_id=?) ORDER BY date,id LIMIT 1',businessId,sourceId,sourceId); if(!first)throw notFound();
      const receiptId=String(first.receipt_id||first.id), group=this.rows('SELECT p.*,i.number FROM payments p LEFT JOIN invoices i ON i.id=p.invoice_id AND i.business_id=p.business_id WHERE p.business_id=? AND p.receipt_id=? ORDER BY p.id',businessId,receiptId);
      const customer=first.customer_id?this.customer(businessId,String(first.customer_id)):{id:null,name:'',phone:''};
      // Existing allocation rows form one receipt; no payment is inserted during rendering.
      const amountPaise=group.reduce((n,r)=>n+Number(r.amount_paise)*(r.kind==='refund'?-1:1),0);
      const balanceAsOfPaise=customer.id?this.ledger(userId,businessId,customer.id,'1970-01-01',businessDay()).closingPaise:0;
      return {...base,sourceId:receiptId,customer,reference:`PR-${receiptId}`,receipt:{id:receiptId,date:String(first.date),method:String(first.method),kind:String(first.kind),amountPaise,allocations:group.map(r=>({invoiceId:String(r.invoice_id||''),number:String(r.number||''),amountPaise:Number(r.amount_paise)*(r.kind==='refund'?-1:1)})),balanceAsOfPaise}};
    });
  }
  async prepare(userId: string, businessId: string, raw: unknown): Promise<PreparedDocument> {
    const model=this.model(userId,businessId,raw), keyModel={...model,generatedAt:undefined,...model.ledger?{ledger:{...model.ledger,asOf:undefined}}:{}},cacheKey=createHash('sha256').update(JSON.stringify(keyModel)).digest('hex');
    const cached=this.row('SELECT id FROM documents WHERE business_id=? AND cache_key=? AND pdf IS NOT NULL AND expires_at>? ORDER BY created_at DESC LIMIT 1',businessId,cacheKey,new Date().toISOString());if(cached)return this.metadata(userId,businessId,String(cached.id));
    const rendered=await renderPdf(model), id=randomUUID(),expiresAt=new Date(Date.now()+7*86400000).toISOString(),filename=safeFilename(model.reference,model.kind,model.language);
    if(rendered.bytes.length>10*1024*1024)throw new DomainError('DOCUMENT_LIMIT','PDF too large.',413);
    // Recheck roles after asynchronous rendering, before retaining private output.
    this.permit(userId,businessId,model.kind);
    const storedId=this.store.transaction(()=>{const again=this.row('SELECT id FROM documents WHERE business_id=? AND cache_key=? AND pdf IS NOT NULL AND expires_at>? ORDER BY created_at DESC LIMIT 1',businessId,cacheKey,new Date().toISOString());if(again)return String(again.id);this.store.db.prepare('UPDATE documents SET pdf=NULL WHERE expires_at<? AND pdf IS NOT NULL').run(new Date().toISOString());const usage=this.row('SELECT COALESCE(SUM(length(pdf)),0) size FROM documents WHERE business_id=?',businessId);if(Number(usage?.size||0)+rendered.bytes.length>104857600)throw new DomainError('DOCUMENT_LIMIT','Document retention storage limit.',409);this.store.db.prepare('INSERT INTO documents VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)').run(id,businessId,model.customer.id,model.kind,model.sourceId,JSON.stringify(model),rendered.bytes,filename,rendered.pages,createHash('sha256').update(rendered.bytes).digest('hex'),model.generatedAt,expiresAt,userId,cacheKey);this.store.audit(userId,businessId,'document.generated',`${model.kind}: ${model.reference}`);return id;});
    if(storedId!==id)return this.metadata(userId,businessId,storedId);
    return {id,model,filename,pdfUrl:`/api/businesses/${businessId}/documents/${id}/pdf`,pages:rendered.pages,expiresAt};
  }
  read(userId:string,businessId:string,id:string) {
    this.store.assertMember(userId,businessId);const row=this.store.db.prepare('SELECT * FROM documents WHERE business_id=? AND id=?').get(businessId,id) as {kind:string;model_json:string;filename:string;pages:number;expires_at:string;pdf:Uint8Array|null}|undefined;if(!row)throw notFound();this.permit(userId,businessId,row.kind);
    if(!row.pdf||row.expires_at<new Date().toISOString())throw new DomainError('DOCUMENT_EXPIRED','PDF expired.',410);
    this.store.audit(userId,businessId,'document.access',id);
    return {model:JSON.parse(row.model_json) as DocumentModel,bytes:Buffer.from(row.pdf),filename:row.filename,pages:row.pages,expiresAt:row.expires_at};
  }
  metadata(userId:string,businessId:string,id:string):PreparedDocument {this.store.assertMember(userId,businessId);const row=this.row('SELECT * FROM documents WHERE business_id=? AND id=?',businessId,id);if(!row)throw notFound();this.permit(userId,businessId,String(row.kind));this.store.audit(userId,businessId,'document.access',id);return{id,model:JSON.parse(String(row.model_json)),filename:String(row.filename),pages:Number(row.pages),expiresAt:String(row.expires_at),pdfUrl:`/api/businesses/${businessId}/documents/${id}/pdf`};}
  list(userId:string,businessId:string,customerId:string) { this.permit(userId,businessId,'statement');this.customer(businessId,customerId);return this.rows('SELECT id,kind,source_id,model_json,created_at,expires_at FROM documents WHERE business_id=? AND customer_id=? ORDER BY created_at DESC LIMIT 50',businessId,customerId).flatMap(row=>{try{this.permit(userId,businessId,String(row.kind));}catch(error){if(error instanceof DomainError&&error.code==='FORBIDDEN')return[];throw error;}const model=JSON.parse(String(row.model_json)) as DocumentModel;return[{id:String(row.id),kind:model.kind,sourceId:model.sourceId,reference:model.reference,language:model.language,format:model.format,createdAt:String(row.created_at),expiresAt:String(row.expires_at)} satisfies DocumentEntry];}); }
}
