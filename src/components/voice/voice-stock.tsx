'use client';
import {SystemText} from '@/components/localized-data';
import {LocalizedDate} from '@/components/localized-data';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Check, CheckCircle2, History, Mic, Plus, RotateCcw, ShieldCheck, Square, Trash2, Volume2 } from 'lucide-react';
import type { InventoryEntry } from '@/lib/contracts';
import { quantity, money, RequestError } from '@/lib/client';
import { draftStorageKey, newVoiceDraft,  restoreVoiceRow, validateRow, canonicalUnit, type VoiceDraft, type VoiceRow, type RowIssue } from '@/lib/voice/parser';
import { useVoiceCapture,useVoiceOS } from './voice-os-provider';
import type { VoiceCommand } from '@/lib/voice/os';
import { prepareStockCommand, stockBatchItem, exactUnitCost,stockBaseQuantity } from '@/lib/voice/stock-command';
import { voiceCopy, SAMPLE_COMMAND, type VoiceCopyKey } from '@/lib/voice/copy';
import { useApp } from '../app-provider';
import { Button, Empty, Field, Select } from '../ui';
import './voice.css';
import './voice-stock-v12.css';

const spokenUnits=['piece','packet','box','kg','g','litre','ml','dozen','metre','bag'];
const issueCopy:Record<RowIssue,VoiceCopyKey>={unknown:'unknown',ambiguous:'ambiguous',quantity:'quantity',unit:'unitIssue',conversion:'conversion',whole:'whole',limit:'limit',correction:'correctionIssue',productDetails:'productDetails',duplicateProduct:'duplicateProduct',priceMeaning:'priceMeaning',price:'priceInvalid'};

function loadDraft(key:string):VoiceDraft|null {
  try{
    const raw=sessionStorage.getItem(key);if(!raw)return null;const value=JSON.parse(raw);
    if(value?.version!==1||typeof value.key!=='string'||typeof value.transcript!=='string'||typeof value.applied!=='string'||!Array.isArray(value.rows)||value.rows.length>100||!Number.isFinite(value.updatedAt)||Date.now()-value.updatedAt>24*60*60*1000)return null;
    if(!value.rows.every((row:VoiceRow)=>row&&typeof row.id==='string'&&typeof row.query==='string'&&typeof row.productId==='string'&&typeof row.quantity==='string'&&typeof row.unit==='string'&&Array.isArray(row.candidates)&&Array.isArray(row.issues)&&(row.source==='voice'||row.source==='manual')&&(!row.newProduct||['name','unit','price','cost','sku','variation'].every(key=>typeof row.newProduct![key as keyof typeof row.newProduct]==='string'))))return null;
    if(value.submitted){
      const saved=value.submitted;
      if(!['voice','mixed','manual'].includes(saved.source)||!Array.isArray(saved.items)||!saved.items.length||saved.items.length>100||!saved.items.every((item:Record<string,unknown>)=>item&&Number.isSafeInteger(item.quantityMilli)&&Number(item.quantityMilli)>0&&((typeof item.productId==='string'&&item.newProduct===undefined)||(item.productId===undefined&&item.newProduct&&typeof item.newProduct==='object'&&['name','unit','sku','variation'].every(key=>typeof (item.newProduct as Record<string,unknown>)[key]==='string')&&['pricePaise','costPaise'].every(key=>Number.isSafeInteger((item.newProduct as Record<string,unknown>)[key]))))))return null;
      if(saved.rowIds!==undefined&&(!Array.isArray(saved.rowIds)||!saved.rowIds.every((id:unknown)=>typeof id==='string')))return null;
    }
    return value;
  }catch{return null;}
}

export function VoiceStockPage({embedded=false,seed}:{embedded?:boolean;seed?:VoiceCommand}){
  const app=useApp();const {i18n}=useTranslation();const copy=voiceCopy(i18n.language);const frequency=new Map<string,number>();for(const entry of app.state!.inventoryEntries||[])for(const item of entry.items)frequency.set(item.productId,(frequency.get(item.productId)||0)+1);const products=[...app.state!.products].sort((a,b)=>(frequency.get(b.id)||0)-(frequency.get(a.id)||0));const storageKey=draftStorageKey(app.session!.user.id,app.businessId);
  const [draft,setDraft]=useState<VoiceDraft>(newVoiceDraft);const [hydrated,setHydrated]=useState('');const [storageError,setStorageError]=useState(false);const [note,setNote]=useState<VoiceCopyKey|null>(null);const [workPhase,setPhase]=useState<'ready'|'permissionState'|'listening'|'processing'|'saving'>('ready');const [saveError,setSaveError]=useState('');const [summary,setSummary]=useState<{entry:InventoryEntry;skipped:number}|null>(null);const [resetting,setResetting]=useState(false);
  const saving=useRef(false);const scopeRef=useRef(app.businessId);scopeRef.current=app.businessId;const active=useRef(true);const voice=useVoiceOS();const locale=voice.spokenLocale,setLocale=voice.setSpokenLocale;const capture=useVoiceCapture(value=>setDraft(previous=>({...previous,transcript:value})));const {problem,supported}=capture;const phase=capture.recording?capture.phase:workPhase;
  useEffect(()=>{active.current=true;const restored=loadDraft(storageKey);if(!restored)setDraft(newVoiceDraft());if(restored){setDraft({...restored,rows:restored.submitted?restored.rows:restored.rows.map(row=>restoreVoiceRow(row,products))});setNote('restored');}setHydrated(storageKey);return()=>{active.current=false;capture.abort();};},[storageKey]);
  useEffect(()=>{if(hydrated!==storageKey)return;try{sessionStorage.setItem(storageKey,JSON.stringify({...draft,updatedAt:Date.now()}));setStorageError(false);}catch{setStorageError(true);}},[draft,hydrated,storageKey]);
  useEffect(()=>{const command=seed||voice.handoff;if(hydrated===storageKey&&command?.intent==='stock'&&!draft.submitted){setDraft(previous=>previous.applied===command.transcript?previous:{...previous,transcript:command.transcript,applied:command.transcript,rows:prepareStockCommand(command.transcript,products,previous.rows)});voice.consume('stock');}},[hydrated,seed,voice.handoff,draft.submitted]);

  const rows=draft.submitted?draft.rows:draft.rows.map(row=>validateRow(row,products));const resolved=rows.filter(row=>!row.issues.length);const invalid=rows.length-resolved.length;const busy=phase==='saving';const recording=phase==='listening'||phase==='permissionState';const locked=hydrated!==storageKey||Boolean(draft.submitted)||busy||resetting||app.writing;
  const edit=(id:string,changes:Partial<VoiceRow>)=>{setSummary(null);setDraft(previous=>({...previous,rows:previous.rows.map(row=>{if(row.id!==id)return row;const next={...row,...changes};if(next.purchaseTotal){const base=stockBaseQuantity(next,products);next.purchaseCost=base===null?'':exactUnitCost(next.purchaseTotal,String(base/1000))||'';if(next.newProduct)next.newProduct={...next.newProduct,cost:next.purchaseCost};next.unclearAmount=next.purchaseCost===''?next.purchaseTotal:undefined;}return validateRow(next,products);})}));};
  const prepare=()=>{if(!draft.transcript.trim())return;if(draft.transcript===draft.applied){setNote('transcriptDuplicate');return;}setPhase('processing');setSummary(null);setNote(null);setSaveError('');setDraft(previous=>({...previous,applied:previous.transcript,rows:prepareStockCommand(previous.transcript,products,previous.rows)}));setPhase('ready');};
  const wasRecording=useRef(false),prepareRef=useRef(prepare);prepareRef.current=prepare;
  useEffect(()=>{if(wasRecording.current&&!capture.recording&&!capture.problem&&!locked)prepareRef.current();wasRecording.current=capture.recording;},[capture.recording]);
  const start=()=>{if(recording||locked)return;setNote(null);capture.start(locale);};
  const stop=()=>capture.stop();
  const clear=()=>{capture.abort();setDraft(newVoiceDraft());setSummary(null);setSaveError('');setNote('discarded');setPhase('ready');};
  const addManual=()=>setDraft(previous=>({...previous,rows:[...previous.rows,{id:crypto.randomUUID(),query:'',productId:'',candidates:[],quantity:'',unit:'',quantityMilli:null,issues:['unknown','quantity','unit'],source:'manual'}]}));
  const confirm=async()=>{
    if(hydrated!==storageKey||saving.current||recording||resetting||app.writing||!app.online||(!draft.submitted&&(!resolved.length||invalid)))return;
    const source=resolved.every(row=>row.source==='manual')?'manual':resolved.some(row=>row.source==='manual')?'mixed':'voice';
    const submitted:NonNullable<VoiceDraft['submitted']>=draft.submitted||{source,rowIds:resolved.map(row=>row.id),items:resolved.map(row=>stockBatchItem(row,products))};const skipped=draft.rows.length-submitted.items.length;
    try{sessionStorage.setItem(storageKey,JSON.stringify({...draft,submitted,updatedAt:Date.now()}));}catch{setStorageError(true);return;}
    const savingBusiness=app.businessId;saving.current=true;setPhase('saving');setSaveError('');setDraft(previous=>({...previous,submitted}));
    try{
      const entry=await app.mutation<InventoryEntry>('/stockbatch',{idempotencyKey:draft.key,source:submitted.source,items:submitted.items});
      if(!active.current||scopeRef.current!==savingBusiness)return;
      setSummary({entry,skipped});setDraft({...newVoiceDraft(),rows:submitted.rowIds?draft.rows.filter(row=>!submitted.rowIds!.includes(row.id)):rows.filter(row=>row.issues.length)});;setNote(null);app.notify(copy.success);
    }catch(error){if(active.current&&scopeRef.current===savingBusiness){setSaveError(error instanceof RequestError&&error.code==='PRODUCT_EXISTS'?'duplicateProduct':'saveError');if(error instanceof RequestError&&error.status>=400&&error.status<500&&error.code!=='IDEMPOTENCY_CONFLICT')setDraft(previous=>({...previous,submitted:undefined}));}}
    finally{saving.current=false;if(active.current)setPhase('ready');}
  };
  const resetDemo=async()=>{if(resetting||busy||app.writing)return;setResetting(true);try{await app.resetDemo();}catch{if(active.current)setSaveError('demoResetError');}finally{if(active.current)setResetting(false);}};
  const stateLabel=phase!=='ready'?copy[phase]:invalid?copy.clarify:rows.length?copy.review:copy.ready;
  return <div className={embedded?'voice-page stock-v12 stock-v12-embedded':'voice-page stock-v12'}>
    {!embedded&&<div className="voice-heading"><div><Link className="text-link" href="/app/stock"><ArrowLeft size={17}/>{copy.back}</Link><h1>{copy.title}</h1><p>{copy.subtitle}</p></div><Link className="text-link" href="/app/stock/voice-history"><History size={17}/>{copy.history}</Link></div>}
    {summary&&<section className="voice-success" role="status"><CheckCircle2 size={28}/><div><h2>{copy.success}</h2><p>{summary.entry.items.length} {copy.updated} · {summary.entry.items.filter(item=>item.created).length} {copy.newProduct}</p><ul>{summary.entry.items.map(item=><li key={item.movementId}>{item.name}: +{quantity(item.quantityMilli)} {copy[canonicalUnit(item.unit) as VoiceCopyKey]||item.unit}</li>)}</ul><Link href="/app/stock" className="text-link">{copy.back}</Link> · <Button variant="ghost" onClick={clear}>{copy.newDraft}</Button></div></section>}
    {!app.online&&<p className="voice-notice" role="status">{copy.offline}</p>}{note&&<p className="voice-notice" role="status">{copy[note]}</p>}{storageError&&<p className="voice-warning" role="alert">{copy.storage}</p>}
    <section className="card stock-v12-capture"><div className="stock-v12-mic"><button type="button" className={recording?'voice-microphone is-listening':'voice-microphone'} onClick={recording?stop:start} disabled={locked||!app.online||supported===false} aria-label={recording?copy.stop:copy.start}>{recording?<Square size={30}/>:<Mic size={32}/>}</button><div><strong>{recording?copy.listening:copy.ready}</strong><p>{copy.shortHint}</p></div><details className="stock-v12-settings"><summary>{copy.spoken}</summary><Select label={copy.spoken} value={locale} disabled={recording||locked} onChange={event=>setLocale(event.target.value as 'en-IN'|'hi-IN')}><option value="en-IN">{copy.english}</option><option value="hi-IN">{copy.hindi}</option></Select><p>{copy.privacy}</p><p>{copy.rulesHint}</p></details></div>
    {(supported===false||problem)&&<p className="voice-warning" role="alert">{copy[problem||'unsupported']}</p>}
    <div className="stock-v12-input"><Field label={copy.transcript} value={draft.transcript} maxLength={5000} disabled={locked||recording} placeholder={copy.placeholder} onChange={event=>setDraft(previous=>({...previous,transcript:event.target.value}))}/><Button type="button" variant="secondary" onClick={prepare} disabled={locked||recording||!draft.transcript.trim()}><Check size={17}/>{copy.parse}</Button></div>
    {app.session!.user.demo&&!rows.length&&<button type="button" className="text-link" disabled={locked||recording} onClick={()=>setDraft(previous=>({...previous,transcript:SAMPLE_COMMAND}))}>{copy.sample}</button>}{app.session!.user.demo&&!rows.length&&<small className="stock-v12-sample-hint">{copy.sampleHint}</small>}
    </section>
    <section className="card stock-v12-review"><div className="voice-section-head"><h2>{rows.length} {copy.productsReady}</h2><span className="voice-status" role="status">{stateLabel}</span></div>
    {draft.submitted&&!busy&&<p role="status" className="voice-notice">{copy.pending}</p>}
    {!rows.length?<Empty icon={<Mic/>} title={copy.empty}/>:<div className="stock-v12-rows">{rows.map((row,index)=>{
      const product=products.find(item=>item.id===row.productId),details=row.newProduct,rate=details?.price??row.sellingPrice;
      const choose=<Select label={copy.product+' '+(index+1)} value={row.productId} disabled={locked} onChange={event=>{const selected=products.find(item=>item.id===event.target.value);edit(row.id,{productId:event.target.value,candidates:[],query:selected?.name||row.query,unit:row.unit||selected?.unit||'',newProduct:undefined});}}><option value="">{copy.choose}</option>{products.filter(p=>!row.candidates.length||row.candidates.includes(p.id)).map(p=><option key={p.id} value={p.id}>{p.name} {p.variation}</option>)}</Select>;
      return <article className={'stock-v12-row '+(row.issues.length?'needs-detail':'')} data-testid="voice-row" key={row.id}>
      <div className="stock-v12-row-heading"><div><b>{details?.name||product?.name||row.query||copy.product}{product?.variation?' · '+product.variation:''}</b><span>{row.quantity||'—'} {copy[canonicalUnit(row.unit) as VoiceCopyKey]||row.unit} · {details?copy.newProduct:product?copy.existingProduct:copy.ambiguous}</span></div><button className="icon-btn" type="button" aria-label={copy.remove+' '+(row.query||index+1)} disabled={locked} onClick={()=>setDraft(previous=>({...previous,rows:previous.rows.filter(item=>item.id!==row.id)}))}><Trash2 size={17}/></button></div>
      {(rate!==undefined&&rate!==''||product)&&<p className="stock-v12-rate">{copy.price}: {money(rate!==undefined&&rate!==''?Math.round(Number(rate)*100):product!.pricePaise,i18n.language)} / {copy[canonicalUnit(details?.unit||product!.unit) as VoiceCopyKey]||details?.unit||product!.unit}{row.sellingPrice!==undefined&&product&&<small>{copy.previousPrice}: {money(product.pricePaise,i18n.language)}</small>}</p>}
      {row.sellingTotal&&<p className="stock-v12-rate">{copy.batchSellingValue}: ₹{row.sellingTotal}</p>}
      {row.purchaseTotal&&<p className="stock-v12-rate">{copy.batchCost}: {money(Math.round(Number(row.purchaseTotal)*100),i18n.language)} · {copy.cost}: {row.purchaseCost||'—'}</p>}
      {details&&!details.price&&<Field label={copy.price+' '+(index+1)} hint={copy.requiredRate} inputMode="decimal" value={details.price} disabled={locked} onChange={event=>edit(row.id,{newProduct:{...details,price:event.target.value},sellingPrice:event.target.value})}/>}
      {!details&&!product&&choose}
      {row.unclearAmount&&<div className="stock-v12-clarify"><p>{copy.priceMeaning} · ₹{row.unclearAmount}</p><div className="button-row"><Button variant="secondary" disabled={locked} onClick={()=>{const base=stockBaseQuantity(row,products),cost=base===null?null:exactUnitCost(row.unclearAmount!,String(base/1000));if(cost===null)return;edit(row.id,{purchaseTotal:row.unclearAmount,purchaseCost:cost,unclearAmount:undefined,...details?{newProduct:{...details,cost}}:{}});}}>{copy.batchCost}</Button><Button variant="secondary" disabled={locked} onClick={()=>edit(row.id,{sellingPrice:row.unclearAmount,sellingTotal:undefined,unclearAmount:undefined,...details?{newProduct:{...details,price:row.unclearAmount!}}:{}})}>{copy.price}</Button></div></div>}
      <details className="stock-v12-edit"><summary>{copy.edit}</summary><div className="stock-v12-editor">
      {details&&<Field label={copy.name+' '+(index+1)} value={details.name} disabled={locked} onChange={event=>edit(row.id,{query:event.target.value,newProduct:{...details,name:event.target.value}})}/>}
      {product&&choose}
      <Field label={copy.amount+' '+(index+1)} inputMode="decimal" value={row.quantity} disabled={locked} onChange={event=>edit(row.id,{quantity:event.target.value})}/>
      <Select label={copy.unit+' '+(index+1)} value={row.unit} disabled={locked} onChange={event=>edit(row.id,{unit:event.target.value,...details?{newProduct:{...details,unit:event.target.value}}:{}})}><option value="">—</option>{spokenUnits.map(unit=><option key={unit} value={unit}>{copy[unit as VoiceCopyKey]||unit}</option>)}</Select>
      <Field label={copy.price+' '+(index+1)+(details?' '+copy.edit:'')} inputMode="decimal" value={rate??''} placeholder={product?String(product.pricePaise/100):''} disabled={locked} onChange={event=>edit(row.id,{sellingPrice:event.target.value,sellingTotal:undefined,...details?{newProduct:{...details,price:event.target.value}}:{}})}/>
      <Field label={copy.cost+' '+(index+1)} inputMode="decimal" value={row.purchaseCost??details?.cost??''} disabled={locked} onChange={event=>edit(row.id,{purchaseCost:event.target.value,purchaseTotal:undefined,...details?{newProduct:{...details,cost:event.target.value}}:{}})}/>
      {details&&<><Field label={copy.sku+' '+(index+1)} value={details.sku} disabled={locked} onChange={event=>edit(row.id,{newProduct:{...details,sku:event.target.value}})}/>{app.state!.configuration.features.variants&&<Field label={copy.variant+' '+(index+1)} value={details.variation} disabled={locked} onChange={event=>edit(row.id,{newProduct:{...details,variation:event.target.value}})}/>}</>}
      </div></details>
      {row.issues.filter(issue=>issue!=='productDetails'||!details||details.price).map(issue=><p className="voice-row-issue" key={issue}>{copy[issueCopy[issue]]}</p>)}
      </article>;
    })}</div>}
    <div className="voice-add-actions"><Button type="button" variant="ghost" onClick={addManual} disabled={locked||recording||rows.length>=100}><Plus size={16}/>{copy.manual}</Button><Button type="button" variant="ghost" onClick={start} disabled={locked||recording||supported===false||!app.online}><Mic size={16}/>{copy.correction}</Button></div>
    {saveError&&<p className="voice-warning" role="alert">{copy[saveError as VoiceCopyKey]||saveError}</p>}
    <div className="voice-confirm stock-v12-confirm"><div><small>{invalid?copy.missing:copy.unsaved}</small></div><Button type="button" busy={busy} onClick={confirm} disabled={!app.online||recording||resetting||app.writing||(!draft.submitted&&(!resolved.length||Boolean(invalid)))}><Check size={18}/>{copy.confirm}</Button><button type="button" className="text-link" onClick={clear} disabled={busy||recording||Boolean(draft.submitted)}>{copy.clear}</button></div>
    </section>
    {recording&&<div className="voice-recording-dock"><span>{copy.listening}</span><Button variant="danger" onClick={stop}><Square size={16}/>{copy.stop}</Button></div>}
    {!embedded&&app.session!.user.demo&&<details className="voice-demo-reset"><summary>{copy.resetDemo}</summary><p>{copy.resetHint}</p><Button variant="ghost" busy={resetting} disabled={busy||recording} onClick={resetDemo}><RotateCcw size={16}/>{copy.resetDemo}</Button></details>}
  </div>;
}

export function VoiceHistoryPage(){
  const app=useApp();const {i18n}=useTranslation();const copy=voiceCopy(i18n.language);const router=useRouter();const entries=app.state!.inventoryEntries||[];const [error,setError]=useState('');
  const repeat=(entry:InventoryEntry)=>{const draft=newVoiceDraft();draft.rows=entry.items.map((item,index)=>validateRow({id:`repeat-${index}`,query:item.name,productId:item.productId,candidates:[],quantity:String(item.quantityMilli/1000),unit:item.unit,quantityMilli:item.quantityMilli,issues:[],source:entry.source==='manual'?'manual':'voice'},app.state!.products));try{sessionStorage.setItem(draftStorageKey(app.session!.user.id,app.businessId),JSON.stringify(draft));router.push('/app/stock/voice');}catch{setError(copy.storage);}};
  return <div className="voice-page"><div className="voice-heading"><div><Link className="text-link" href="/app/stock"><ArrowLeft size={17}/>{copy.back}</Link><h1>{copy.history}</h1><p>{copy.repeatHint}</p></div><Link className="btn btn-primary" href="/app/stock/voice"><Mic size={18}/>{copy.title}</Link></div>{error&&<p className="voice-warning" role="alert"><SystemText value={error}/></p>}{entries.length?<div className="voice-history">{entries.map(entry=><article className="card voice-history-entry" key={entry.id}><div className="voice-section-head"><div><span className="voice-kicker">{copy[entry.source==='manual'?'manualSource':entry.source]}</span><h2><LocalizedDate value={entry.date} options={{timeZone:'Asia/Kolkata'}}/></h2></div><Button variant="secondary" onClick={()=>repeat(entry)}><RotateCcw size={16}/>{copy.repeat}</Button></div><ul>{entry.items.map(item=><li key={item.movementId}><span><b>{item.name}</b><small>{item.movementId}</small></span><strong>+{quantity(item.quantityMilli)} {copy[canonicalUnit(item.unit) as VoiceCopyKey]||item.unit}</strong></li>)}</ul><Link className="text-link" href="/app/stock/history">{copy.viewHistory}<History size={16}/></Link></article>)}</div>:<Empty icon={<History/>} title={copy.noHistory} action={<Link className="btn btn-primary" href="/app/stock/voice">{copy.title}</Link>}/>}</div>;
}
