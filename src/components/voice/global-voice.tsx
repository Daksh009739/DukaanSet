'use client';
import { useEffect,useRef,useState } from 'react';
import { useRouter,usePathname } from 'next/navigation';
import { Mic,ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { voiceAllowed,voiceNavigation,reportAnswer,resolveContact,resolveVoiceProduct,type VoiceCommand,type VoiceIntent } from '@/lib/voice/os';
import { osCopy,intentLabel } from '@/lib/voice/os-copy';
import { useVoiceOS } from './voice-os-provider';
import { ConversationInput } from './conversation-input';
import { ConversationDraft } from './conversation-draft';
import { VoiceStockPage } from './voice-stock';
import { advanceVoice,nextVoiceQuestion,salePreview,voiceActionRegistry } from '@/lib/voice/conversation';
import { minorUnits,RequestError } from '@/lib/client';
import type { Invoice } from '@/lib/contracts';
import './conversation.css';
import {SupplierPaymentForm} from '../record-details';
import {readConversationSession} from '@/lib/voice/session';
import { useApp } from '../app-provider';
import { useOperations,type Action } from '../operations';
import { Button,Sheet,Select,FormError } from '../ui';
import { api, businessDay } from '@/lib/client';
import type { VoiceReport } from '@/lib/contracts';
import {DocumentStudio,statementPeriod} from '../documents/document-studio';
import type {CustomerLedger,DocumentKind} from '@/lib/document-contracts';

export function ContextVoiceButton({intent}:{intent:VoiceIntent}){const app=useApp(),voice=useVoiceOS(),copy=osCopy(useTranslation().i18n.language);if(!app.state||!voiceAllowed(intent,app.state))return null;return <Button type="button" variant="secondary" onClick={()=>voice.launch(intent)}><Mic size={17}/>{intentLabel(intent,copy)}</Button>;}
export function GlobalVoiceLauncher(){
 const app=useApp(),voice=useVoiceOS(),router=useRouter(),open=useOperations(),language=useTranslation().i18n.language,copy=osCopy(language),[command,setCommand]=useState<VoiceCommand|null>(null),[error,setError]=useState(''),[chosen,setChosen]=useState('');
 const pathname=usePathname(),storageKey='ds-conversation-'+app.session?.user.id+'-'+app.businessId,[actionKey,setActionKey]=useState(()=>crypto.randomUUID()),[pending,setPending]=useState<{path:string;body:Record<string,unknown>}|null>(null),[saved,setSaved]=useState<{invoice?:Invoice}|null>(null),[busy,setBusy]=useState(false),[hydrated,setHydrated]=useState(''),submitting=useRef(false),scope=useRef(app.businessId);scope.current=app.businessId;
 useEffect(()=>{setHydrated('');setCommand(null);setPending(null);setSaved(null);setError('');setActionKey(crypto.randomUUID());voice.abort();voice.launch(null);try{const value=readConversationSession(sessionStorage.getItem(storageKey));if(value){setCommand(value.command);setActionKey(value.key);setPending(value.pending);}}catch{}setHydrated(storageKey);},[storageKey]);
 useEffect(()=>{if(hydrated!==storageKey)return;try{if(command||pending)sessionStorage.setItem(storageKey,JSON.stringify({key:actionKey,command,pending,updatedAt:Date.now()}));else sessionStorage.removeItem(storageKey);}catch{}},[command,pending,actionKey,hydrated,storageKey]);
 const [supplierPaymentRequest,setSupplierPaymentRequest]=useState<{supplierId:string;due:number;amount:string;method:string}|null>(null);
 const [stats,setStats]=useState<VoiceReport|undefined>();
 const [documentRequest,setDocumentRequest]=useState<{customerId:string;kind:DocumentKind;id:string;share:boolean;period:{start:string;end:string}}|null>(null);
 useEffect(()=>{setStats(undefined);if(command?.intent!=='report'||!app.state||!voiceAllowed('report',app.state))return;const controller=new AbortController();api<VoiceReport>(`/businesses/${app.businessId}/voice-report?period=${command.fields.period||'today'}`,undefined,controller.signal).then(setStats).catch(cause=>{if(!controller.signal.aborted)setError(app.errorText(cause));});return()=>controller.abort();},[command,app.businessId]);
 if(!app.state?.configuration.features.voiceStock)return null;
 const state=app.state;
 const question=command?nextVoiceQuestion(command,state):'',canSave=Boolean(command&&['sale','customer','payment','expense'].includes(command.intent)&&!question&&!command.warnings.includes('splitCollection')&&!(command.intent==='customer'&&resolveContact(command.fields.name||'',state.customers).length));
 function clear(){if(pending||busy)return;setCommand(null);setSaved(null);setError('');setChosen('');setActionKey(crypto.randomUUID());}
 function understand(text:string){if(pending||busy||hydrated!==storageKey)return;const customerId=pathname.match(/\/app\/customers\/([^/]+)/)?.[1];const next=advanceVoice(text,state,command||undefined,customerId);if(next.intent==='cancel'){clear();return;}setCommand(next);setSaved(null);setError('');setChosen('');}
 async function save(){if(hydrated!==storageKey||submitting.current||!command||!app.online||!voiceAllowed(command.intent,state)||(!pending&&!canSave))return;const business=app.businessId;let request=pending;try{if(!pending&&!readConversationSession(sessionStorage.getItem(storageKey))){setError(copy.expiredDraft);setCommand(null);return;}if(!request){const f=command.fields;let path='',body:Record<string,unknown>={idempotencyKey:actionKey};if(command.intent==='sale'){const sale=salePreview(command,state.products);if(!sale.valid)return;path='/voice-sale';body={...body,...f.createCustomer==='true'?{newCustomer:{name:f.name,phone:f.phone||''}}:{},sale:{customerId:f.customerId||null,items:sale.items,discountPaise:sale.discount,payments:[{method:'cash',amountPaise:sale.cash},{method:'upi',amountPaise:sale.upi}].filter(p=>p.amountPaise>0),dueDate:null}};}else if(command.intent==='customer'){path='/customers';body={...body,name:f.name,phone:f.phone||'',rejectDuplicate:true};}else if(command.intent==='payment'){path='/payments';body={...body,customerId:f.customerId,amountPaise:minorUnits(f.amount),method:f.method};}else if(command.intent==='expense'){path='/expenses';body={...body,description:f.description,amountPaise:minorUnits(f.amount),method:f.method};}if(!path)return;request={path,body};sessionStorage.setItem(storageKey,JSON.stringify({key:actionKey,command,pending:request,updatedAt:Date.now()}));setPending(request);}submitting.current=true;setBusy(true);setError('');const result=await app.mutation<Invoice|{id:string}>(request.path,request.body);if(scope.current!==business)return;setPending(null);setCommand(null);setSaved(command.intent==='sale'?{invoice:result as Invoice}:{});sessionStorage.removeItem(storageKey);setActionKey(crypto.randomUUID());app.notify(copy.saved);}catch(cause){if(scope.current===business){setError(app.errorText(cause));if(cause instanceof RequestError&&cause.status>=400&&cause.status<500&&cause.code!=='IDEMPOTENCY_CONFLICT'){setPending(null);await app.refresh();}}}finally{submitting.current=false;setBusy(false);}}
 const needsStats=Boolean(command?.intent==='report'&&['sales','collections','expenses','topSales','cashBalance'].includes(command.fields.report));
 const answer=command?.intent==='report'&&(!needsStats||stats)?reportAnswer(command,state,language,stats):[];
 const choices=command?.intent==='purchase'&&command.fields.operation==='supplierPayment'?state.suppliers.filter(s=>!command.fields.supplierQuery||resolveContact(command.fields.supplierQuery,[s]).length).map(s=>({id:s.id,label:s.name+' · '+s.phone})):command?.intent==='purchase'&&command.fields.operation==='receiveOrder'?state.demand.orders.filter(o=>o.status==='draft').map(o=>({id:o.id,label:o.productName+' '+o.variant+' · '+o.supplierName})):command?.intent==='document'&&!command.fields.customerId?state.customers.filter(c=>!command.fields.customerQuery||resolveContact(command.fields.customerQuery,[c]).length).map(c=>({id:c.id,label:c.name+' · '+c.phone})):command?.intent==='reorder'?state.demand.groups.filter(g=>{const matches=resolveVoiceProduct(command.fields.query.replace(/\b(?:jo|ki|demand|hai|uske|liye|reorder|draft|bana|banao|do|ka|ke|prepare|order)\b/g,' ').trim(),state.products);return g.matched&&g.suggestedMilli>0&&(!matches.ids.length||matches.ids.includes(g.productId||''));}).map(g=>({id:g.key,label:g.productName+' '+g.variant})):command?.intent==='followup'?state.demand.requestsList.filter(r=>r.eligibleFollowUp&&(!command.fields.customerId||r.customerId===command.fields.customerId)).map(r=>({id:r.id,label:r.productName+' '+r.variant+' · '+r.customerName})):[];
 function close(discard=false){voice.abort();voice.launch(null);if(discard&&!pending){setCommand(null);setError('');setChosen('');}}
 function route(){if(!command||!voiceAllowed(command.intent,state))return;
  const intent=command.intent;if(intent==='purchase'&&command.fields.operation==='supplierPayment'){const supplierId=command.fields.supplierId||chosen||choices.length===1&&choices[0].id;if(!supplierId||!state.configuration.permissions.payments){setError(supplierId?copy.permission:copy.noResults);return;}const supplier=state.suppliers.find(s=>s.id===supplierId)!;setSupplierPaymentRequest({supplierId,due:supplier.balancePaise,amount:command.fields.amount||'',method:command.fields.method||''});close(true);return;}if(intent==='purchase'&&command.fields.operation==='receiveOrder'){const id=chosen||choices.length===1&&choices[0].id;if(!id){setError(copy.noResults);return;}router.push('/app/orders/'+id);close(true);return;}if(intent==='unknown'){setError(copy.unknown);return;}
  if(intent==='cancel'){close(true);return;}
  if(intent==='closing'&&command.fields.closingAction&&command.fields.closingAction!=='review'){router.push('/app/reports/closings?period='+command.fields.closingPeriod);close(true);return;}
  if(intent==='document'){
   if(command.fields.invoiceId){const invoice=state.invoices.find(i=>i.id===command.fields.invoiceId);if(!invoice||!state.configuration.permissions.sales){setError(copy.noResults);return;}setDocumentRequest({customerId:invoice.customerId||'',kind:'invoice',id:invoice.id,share:command.fields.share==='true',period:statementPeriod('month')});close(true);return;}
   const customerId=command.fields.customerId||chosen||choices.length===1&&choices[0].id;if(!customerId){setError(copy.noResults);return;}
   const kind=(command.fields.documentKind||'statement') as DocumentKind;if(kind==='invoice'&&!state.configuration.permissions.sales||kind==='receipt'&&!state.configuration.permissions.payments){setError(copy.permission);return;}
   let period=statementPeriod(command.fields.period||'month');if(command.fields.period==='yesterday'){const d=new Date(period.end+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-1);const day=d.toISOString().slice(0,10);period={start:day,end:day};}
   const selection={customerId,kind,id:kind==='statement'?customerId:'',share:command.fields.share==='true',period};
   if(kind==='statement'||command.fields.latest!=='true'){setDocumentRequest(selection);close(true);return;}
   const scope=app.businessId;
   void api<CustomerLedger>('/businesses/'+scope+'/customers/'+customerId+'/ledger?start=1970-01-01&end='+period.end).then(records=>{const rows=(kind==='invoice'?records.invoices:records.receipts).filter(r=>command.fields.period!=='yesterday'||businessDay(r.date)===period.start);if(!rows.length){setError(copy.noResults);return;}setDocumentRequest({...selection,id:rows[rows.length-1].id});close(true);}).catch(cause=>setError(app.errorText(cause)));return;
  }

  if(intent==='reorder'||intent==='followup'){const selected=chosen||choices.length===1&&choices[0].id;if(!selected){setError(copy.noResults);return;}router.push('/app/demand?'+(intent==='reorder'?'reorder=':'message=')+encodeURIComponent(selected));close(true);return;}
  if(intent==='open'){
   const target=voiceNavigation(command,state);if(target){router.push(target);close(true);return;}setError(copy.noResults);return;
  }
  if(['customer','supplier','payment','purchase','expense'].includes(intent)){voice.send(command);close(true);open(intent as Action,{voiceCommand:command});return;}
  voice.send(command);router.push(intent==='sale'?'/app/sales/new':intent==='stock'?'/app/stock/voice':intent==='demand'?'/app/demand?voice=1':intent==='closing'?'/app/daily-closing':'/app/reports');close(true);
 }
 return <><button type="button" className="voiceos-launcher" aria-label={copy.open} onClick={()=>{setError('');voice.launch('unknown');}}><Mic size={19}/><span>VoiceOS</span></button><Sheet title={copy.title} description={copy.tagline} className="conversation-sheet" hideLanguage open={voice.launcher!==null} onOpenChange={value=>{if(!value)close();}}><div className="sheet-body voiceos-global conversation-body"><p className="voiceos-scope">{copy.scope} · <b>{state.business.name}</b></p>
 {command?.intent==='stock'?<><VoiceStockPage key={app.businessId} embedded seed={command}/><details><summary>{copy.manual}</summary><Button variant="secondary" onClick={route}>{copy.view}</Button></details><Button variant="ghost" onClick={clear} disabled={busy||Boolean(pending)}>{copy.newCommand}</Button></>:<>
 <ConversationInput examples={pathname.includes('/stock')?[copy.exampleStock,copy.exampleBill,copy.exampleSales]:pathname.includes('/customers')?[copy.exampleCustomer,copy.examplePayment,copy.exampleBill]:[copy.exampleBill,copy.exampleCustomer,copy.exampleSales]} onSubmit={understand} question={question?copy[question as keyof typeof copy]||copy.hint:command?copy.draft:''} disabled={busy||Boolean(pending)||hydrated!==storageKey} initial={!command&&!saved}/>
 {command&&<p className="conversation-user">{command.transcript}</p>}
 {command&&['sale','customer','payment','expense'].includes(command.intent)&&<ConversationDraft command={command} disabled={busy||Boolean(pending)} onChange={setCommand}/>}
 {command?.intent==='customer'&&resolveContact(command.fields.name||'',state.customers).length>0&&<div className="conversation-existing"><p>{copy.duplicateContact}</p>{state.customers.filter(c=>resolveContact(command.fields.name,[c]).length).map(customer=><Button key={customer.id} variant="secondary" onClick={()=>{router.push('/app/customers/'+customer.id);close(true);}}>{copy.customerExists} · {customer.name}</Button>)}</div>}
 {command?.intent==='report'&&<section className="voiceos-answer" aria-label={copy.result}><h3>{copy.result} · {copy[(command.fields.period||'today') as 'today'|'week'|'all']}</h3><dl>{answer.map((row,i)=><div key={i}><dt>{row.label}</dt><dd>{row.value}</dd></div>)}</dl>{!answer.length&&<p role="status">{needsStats&&!stats&&!error?copy.loading:copy.noResults}</p>}<p className="card-note">{copy.range}</p></section>}
 {choices.length>1&&<Select label={copy.choose} value={chosen} onChange={event=>setChosen(event.target.value)}><option value="">—</option>{choices.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}</Select>}
 {command&&['sale','customer','payment','expense'].includes(command.intent)&&<details className="conversation-settings"><summary>{copy.manual}</summary><Button variant="secondary" onClick={route} disabled={Boolean(pending)||busy}>{copy.view}</Button></details>}
 {saved&&<div role="status" className="conversation-saved"><b>{copy.saved}</b>{saved.invoice&&<p>{saved.invoice.number} · {saved.invoice.customerName} · {saved.invoice.totalPaise/100} ₹</p>}{saved.invoice&&<Button variant="secondary" onClick={()=>{router.push('/app/sales/'+saved.invoice!.id);setSaved(null);close();}}>{copy.document}</Button>}</div>}
 {pending&&<p className="voice-warning" role="status">{copy.pendingAction}</p>}<FormError message={error}/>
 <div className="conversation-actions">{command&&['sale','customer','payment','expense'].includes(command.intent)&&<Button type="button" busy={busy} disabled={!app.online||!voiceAllowed(command.intent,state)||(!pending&&!canSave)} onClick={()=>void save()}>{pending?copy.retryAction:copy.confirmSave}</Button>}
 {command&&!['sale','stock','customer','payment','expense','report','unknown'].includes(command.intent)&&<Button type="button" disabled={!voiceAllowed(command.intent,state)} onClick={route}>{copy.view}<ArrowUpRight size={17}/></Button>}
 {(command||saved)&&<Button variant="ghost" disabled={busy||Boolean(pending)} onClick={clear}>{copy.newCommand}</Button>}</div>
 </>}
 </div></Sheet>{supplierPaymentRequest&&<Sheet open title={copy.payment} onOpenChange={value=>{if(!value)setSupplierPaymentRequest(null);}}><SupplierPaymentForm supplierId={supplierPaymentRequest.supplierId} due={supplierPaymentRequest.due} initial={{amount:supplierPaymentRequest.amount,method:supplierPaymentRequest.method}} onSaved={()=>setSupplierPaymentRequest(null)}/></Sheet>}{documentRequest&&<DocumentStudio open onClose={()=>setDocumentRequest(null)} customerId={documentRequest.customerId} kind={documentRequest.kind} sourceId={documentRequest.id} shareFirst={documentRequest.share} period={documentRequest.period}/>}</>;
}
