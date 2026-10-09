'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Check, CheckCircle2, History, Mic, Plus, RotateCcw, ShieldCheck, Square, Trash2, Volume2 } from 'lucide-react';
import type { InventoryEntry } from '@/lib/contracts';
import { quantity, RequestError } from '@/lib/client';
import { draftStorageKey, newVoiceDraft, newProductDraft, voicePricePaise, catalogueUnits, parseVoiceTranscript, restoreVoiceRow, validateRow, canonicalUnit, type VoiceDraft, type VoiceRow, type RowIssue } from '@/lib/voice/parser';
import { configureRecognition, speechConstructor, type RecognitionLike, type SpeechProblem } from '@/lib/voice/speech';
import { voiceCopy, SAMPLE_COMMAND, type VoiceCopyKey } from '@/lib/voice/copy';
import { useApp } from '../app-provider';
import { Button, Empty, Field, Select } from '../ui';
import './voice.css';

const spokenUnits=['piece','packet','box','kg','g','litre','ml','dozen','metre'];
const issueCopy:Record<RowIssue,VoiceCopyKey>={unknown:'unknown',ambiguous:'ambiguous',quantity:'quantity',unit:'unitIssue',conversion:'conversion',whole:'whole',limit:'limit',correction:'correctionIssue',productDetails:'productDetails',duplicateProduct:'duplicateProduct'};

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

export function VoiceStockPage(){
  const app=useApp();const {i18n}=useTranslation();const copy=voiceCopy(i18n.language);const frequency=new Map<string,number>();for(const entry of app.state!.inventoryEntries||[])for(const item of entry.items)frequency.set(item.productId,(frequency.get(item.productId)||0)+1);const products=[...app.state!.products].sort((a,b)=>(frequency.get(b.id)||0)-(frequency.get(a.id)||0));const storageKey=draftStorageKey(app.session!.user.id,app.businessId);
  const [draft,setDraft]=useState<VoiceDraft>(newVoiceDraft);const [hydrated,setHydrated]=useState(false);const [storageError,setStorageError]=useState(false);const [note,setNote]=useState<VoiceCopyKey|null>(null);const [problem,setProblem]=useState<SpeechProblem|null>(null);const [supported,setSupported]=useState<boolean|null>(null);const [phase,setPhase]=useState<'ready'|'permissionState'|'listening'|'processing'|'saving'>('ready');const [locale,setLocale]=useState<'en-IN'|'hi-IN'>('en-IN');const [onlyResolved,setOnlyResolved]=useState(false);const [saveError,setSaveError]=useState('');const [summary,setSummary]=useState<{entry:InventoryEntry;skipped:number}|null>(null);const [resetting,setResetting]=useState(false);
  const recognition=useRef<RecognitionLike|null>(null);const saving=useRef(false);const active=useRef(true);
  useEffect(()=>{active.current=true;setSupported(Boolean(speechConstructor()));const restored=loadDraft(storageKey);if(restored){setDraft({...restored,rows:restored.submitted?restored.rows:restored.rows.map(row=>restoreVoiceRow(row,products))});setNote('restored');}setHydrated(true);return()=>{active.current=false;if(recognition.current){recognition.current.onend=null;recognition.current.onresult=null;recognition.current.onerror=null;recognition.current.abort();}};},[storageKey]);
  useEffect(()=>{if(!hydrated)return;try{sessionStorage.setItem(storageKey,JSON.stringify({...draft,updatedAt:Date.now()}));setStorageError(false);}catch{setStorageError(true);}},[draft,hydrated,storageKey]);
  useEffect(()=>{if(!app.online&&recognition.current){recognition.current.stop();setProblem('network');}},[app.online]);
  const rows=draft.submitted?draft.rows:draft.rows.map(row=>validateRow(row,products));const resolved=rows.filter(row=>!row.issues.length);const invalid=rows.length-resolved.length;const busy=phase==='saving';const recording=phase==='listening'||phase==='permissionState';const locked=Boolean(draft.submitted)||busy||resetting||app.writing;
  const edit=(id:string,changes:Partial<VoiceRow>)=>{setSummary(null);setDraft(previous=>({...previous,rows:previous.rows.map(row=>row.id===id?validateRow({...row,...changes},products):row)}));};
  const prepare=()=>{if(!draft.transcript.trim())return;if(draft.transcript===draft.applied){setNote('transcriptDuplicate');return;}setPhase('processing');setSummary(null);setNote(null);setSaveError('');setDraft(previous=>({...previous,applied:previous.transcript,rows:parseVoiceTranscript(previous.transcript,products,previous.rows)}));setPhase('ready');};
  const start=()=>{
    const Constructor=speechConstructor();if(!Constructor){setProblem('unsupported');return;}if(recording||locked)return;
    if(recognition.current){recognition.current.onend=null;recognition.current.onresult=null;recognition.current.onerror=null;recognition.current.abort();}const instance=new Constructor();recognition.current=instance;setProblem(null);setNote(null);setPhase('permissionState');
    configureRecognition(instance,locale,{started:()=>{if(active.current)setPhase('listening');},ended:()=>{if(active.current){setPhase('ready');recognition.current=null;}},transcript:(value)=>{if(active.current)setDraft(previous=>({...previous,transcript:value}));},failed:value=>{if(active.current){setProblem(value);setPhase('ready');}}});
    try{instance.start();}catch{setProblem('speechError');setPhase('ready');recognition.current=null;}
  };
  const stop=()=>{const instance=recognition.current;if(!instance)return;try{if(phase==='permissionState')instance.abort();else instance.stop();}catch{instance.abort();setPhase('ready');}setTimeout(()=>{if(recognition.current===instance){instance.abort();recognition.current=null;if(active.current)setPhase('ready');}},1000);};
  const clear=()=>{recognition.current?.abort();setDraft(newVoiceDraft());setSummary(null);setOnlyResolved(false);setSaveError('');setNote('discarded');setPhase('ready');};
  const addManual=()=>setDraft(previous=>({...previous,rows:[...previous.rows,{id:crypto.randomUUID(),query:'',productId:'',candidates:[],quantity:'',unit:'',quantityMilli:null,issues:['unknown','quantity','unit'],source:'manual'}]}));
  const confirm=async()=>{
    if(saving.current||recording||resetting||app.writing||!app.online||(!draft.submitted&&(!resolved.length||(invalid&&!onlyResolved))))return;
    const source=resolved.every(row=>row.source==='manual')?'manual':resolved.some(row=>row.source==='manual')?'mixed':'voice';
    const submitted:NonNullable<VoiceDraft['submitted']>=draft.submitted||{source,rowIds:resolved.map(row=>row.id),items:resolved.map(row=>row.newProduct?{newProduct:{name:row.newProduct.name.trim(),unit:row.newProduct.unit,pricePaise:voicePricePaise(row.newProduct.price)!,costPaise:row.newProduct.cost?voicePricePaise(row.newProduct.cost)!:0,sku:row.newProduct.sku.trim(),variation:row.newProduct.variation.trim()},quantityMilli:row.quantityMilli!}:{productId:row.productId,quantityMilli:row.quantityMilli!})};const skipped=draft.rows.length-submitted.items.length;
    try{sessionStorage.setItem(storageKey,JSON.stringify({...draft,submitted,updatedAt:Date.now()}));}catch{setStorageError(true);return;}
    saving.current=true;setPhase('saving');setSaveError('');setDraft(previous=>({...previous,submitted}));
    try{
      const entry=await app.mutation<InventoryEntry>('/stockbatch',{idempotencyKey:draft.key,source:submitted.source,items:submitted.items});
      if(!active.current)return;
      setSummary({entry,skipped});setDraft({...newVoiceDraft(),rows:submitted.rowIds?draft.rows.filter(row=>!submitted.rowIds!.includes(row.id)):rows.filter(row=>row.issues.length)});setOnlyResolved(false);setNote(null);app.notify(copy.success);
    }catch(error){if(active.current){setSaveError(error instanceof RequestError&&error.code==='PRODUCT_EXISTS'?'duplicateProduct':'saveError');if(error instanceof RequestError&&error.status>=400&&error.status<500&&error.code!=='IDEMPOTENCY_CONFLICT')setDraft(previous=>({...previous,submitted:undefined}));}}
    finally{saving.current=false;if(active.current)setPhase('ready');}
  };
  const resetDemo=async()=>{if(resetting||busy||app.writing)return;setResetting(true);try{await app.resetDemo();}catch{if(active.current)setSaveError('demoResetError');}finally{if(active.current)setResetting(false);}};
  const stateLabel=phase!=='ready'?copy[phase]:invalid?copy.clarify:rows.length?copy.review:copy.ready;
  return <div className="voice-page">
    <div className="voice-heading"><div><Link className="text-link" href="/app/stock"><ArrowLeft size={17}/>{copy.back}</Link><h1>{copy.title}</h1><p>{copy.subtitle}</p></div><Link className="btn btn-secondary" href="/app/stock/voice-history"><History size={18}/>{copy.history}</Link></div>
    {summary&&<section className="voice-success" role="status"><CheckCircle2 size={32}/><div><h2>{copy.success}</h2><p>{new Set(summary.entry.items.map(item=>item.productId)).size} {copy.updated} · {summary.entry.items.length} {copy.lines}</p><ul>{summary.entry.items.map(item=><li key={item.movementId}>{item.name}: +{quantity(item.quantityMilli)} {copy[canonicalUnit(item.unit) as VoiceCopyKey]||item.unit}</li>)}</ul><p>{summary.skipped?`${summary.skipped} ${copy.skipped}`:copy.nothingSaved}</p><Link href="/app/stock/voice-history" className="text-link">{copy.viewHistory}</Link></div></section>}
    {!app.online&&<p className="voice-notice" role="status">{copy.offline}</p>}{note&&<p className="voice-notice" role="status">{copy[note]}</p>}{storageError&&<p className="voice-warning" role="alert">{copy.storage}</p>}
    <div className="voice-grid"><section className="card voice-capture"><div className="voice-section-head"><span className="voice-kicker"><Volume2 size={16}/>{copy.rules}</span><span className={`voice-status ${recording?'is-listening':''}`} role="status" aria-live="polite">{stateLabel}</span></div><h2>{copy.ready}</h2><p>{copy.rulesHint}</p>
      <Select label={copy.spoken} value={locale} disabled={recording||locked} onChange={event=>setLocale(event.target.value as 'en-IN'|'hi-IN')}><option value="en-IN">{copy.english}</option><option value="hi-IN">{copy.hindi}</option></Select>
      <div className="voice-microphone-wrap"><button type="button" className={`voice-microphone ${recording?'is-listening':''}`} onClick={recording?stop:start} disabled={locked||(!recording&&(!app.online||supported===false))} aria-label={recording?copy.stop:copy.start}>{recording?<Square size={29}/>:<Mic size={35}/>}</button><Button type="button" variant={recording?'danger':'primary'} onClick={recording?stop:start} disabled={locked||(!recording&&(!app.online||supported===false))}>{recording?<Square size={17}/>:<Mic size={17}/>} {recording?copy.stop:copy.start}</Button></div>
      <p className="voice-privacy"><ShieldCheck size={17}/>{copy.privacy}</p>
      {(supported===false||problem)&&<p className="voice-warning" role="alert">{copy[problem||'unsupported']}</p>}
      <label className="field"><span>{copy.transcript}</span><textarea aria-label={copy.transcript} value={draft.transcript} maxLength={5000} disabled={locked||recording} rows={4} placeholder={copy.placeholder} onChange={event=>setDraft(previous=>({...previous,transcript:event.target.value}))}/><small>{copy.transcriptHint}</small></label>
      <Button type="button" variant="secondary" onClick={prepare} disabled={locked||recording||!draft.transcript.trim()}><Check size={17}/>{copy.parse}</Button>
      {app.session!.user.demo&&<div className="voice-simulator"><button type="button" className="text-link" disabled={locked||recording} onClick={()=>{setDraft(previous=>({...previous,transcript:SAMPLE_COMMAND}));setNote(null);}}>{copy.sample}</button><small>{copy.sampleHint}</small></div>}
      <p className="voice-support">{copy.support}</p>
    </section>
    <section className="card voice-review">{draft.submitted&&!busy&&<p className="voice-notice" role="status">{copy.pending}</p>}<div className="voice-section-head"><div><span className="voice-kicker">{copy.addition}</span><h2>{copy.review}</h2></div><span className="voice-count">{rows.length}</span></div><p>{copy.unsaved}</p>{invalid>0&&<p className="voice-warning">{copy.missing}</p>}
      {!rows.length?<Empty icon={<Mic/>} title={copy.empty}/>:<div className="voice-rows">{rows.map((row,index)=>{
        const product=products.find(item=>item.id===row.productId);
        const unitOptions=[...new Set([...spokenUnits,...products.map(item=>canonicalUnit(item.unit)),row.unit].filter(Boolean))];
        return <article key={row.id} className={`voice-row ${row.issues.length?'needs-detail':''} ${row.newProduct?'voice-new-product':''}`} data-testid="voice-row">
          <div className="voice-row-top"><span>{index+1}</span><b>{row.newProduct?.name||row.query||copy.product}</b><button className="icon-btn" type="button" aria-label={`${copy.remove} ${row.query||index+1}`} disabled={locked} onClick={()=>setDraft(previous=>({...previous,rows:previous.rows.filter(item=>item.id!==row.id)}))}><Trash2 size={17}/></button></div>
          {row.newProduct?<div className="voice-new-details">
            <span className="voice-new-label"><Plus size={14}/>{copy.newProduct}</span><p className="voice-new-hint">{copy.newProductHint}</p>
            <Field label={`${copy.name} ${index+1}`} maxLength={100} value={row.newProduct.name} disabled={locked} onChange={event=>edit(row.id,{newProduct:{...row.newProduct!,name:event.target.value}})}/>
            <Select label={`${copy.sellingUnit} ${index+1}`} value={row.newProduct.unit} disabled={locked} onChange={event=>edit(row.id,{newProduct:{...row.newProduct!,unit:event.target.value}})}>{catalogueUnits.map(unit=><option key={unit} value={unit}>{copy[unit as VoiceCopyKey]||unit}</option>)}</Select>
            <div className="voice-row-fields"><Field label={`${copy.price} ${index+1}`} hint={copy.priceHint} inputMode="decimal" maxLength={12} value={row.newProduct.price} disabled={locked} onChange={event=>edit(row.id,{newProduct:{...row.newProduct!,price:event.target.value}})}/><Field label={`${copy.cost} ${index+1}`} inputMode="decimal" maxLength={12} value={row.newProduct.cost} disabled={locked} onChange={event=>edit(row.id,{newProduct:{...row.newProduct!,cost:event.target.value}})}/></div>
            <details className="voice-product-options"><summary>{copy.productOptions}</summary>
              <Field label={`${copy.sku} ${index+1}`} maxLength={64} value={row.newProduct.sku} disabled={locked} onChange={event=>edit(row.id,{newProduct:{...row.newProduct!,sku:event.target.value}})}/>
              {app.state!.configuration.features.variants&&<Field label={`${copy.variant} ${index+1}`} maxLength={100} value={row.newProduct.variation} disabled={locked} onChange={event=>edit(row.id,{newProduct:{...row.newProduct!,variation:event.target.value}})}/>}
            </details>
            <Button type="button" variant="ghost" disabled={locked} onClick={()=>edit(row.id,{newProduct:undefined})}>{copy.existing}</Button>
          </div>:<><Select label={`${copy.product} ${index+1}`} value={row.productId} disabled={locked} onChange={event=>{const selected=products.find(item=>item.id===event.target.value);edit(row.id,{productId:event.target.value,candidates:[],query:selected?.name||row.query,unit:row.unit||selected?.unit||'',newProduct:undefined});}}><option value="">{copy.choose}</option>{[...products].sort((a,b)=>Number(row.candidates.includes(b.id))-Number(row.candidates.includes(a.id))).map(item=><option key={item.id} value={item.id}>{item.name}{item.variation?` · ${item.variation}`:''}{row.candidates.includes(item.id)?' · ✓':''}</option>)}</Select>
            {!row.productId&&<Button type="button" variant="secondary" className="voice-create-product" disabled={locked||recording} onClick={()=>edit(row.id,{productId:'',candidates:[],newProduct:newProductDraft(row)})}><Plus size={16}/>{copy.createHere}</Button>}
          </>}
          <div className="voice-row-fields"><Field label={`${copy.amount} ${index+1}`} inputMode="decimal" value={row.quantity} disabled={locked} onChange={event=>edit(row.id,{quantity:event.target.value})}/><Select label={`${copy.unit} ${index+1}`} value={row.unit} disabled={locked} onChange={event=>edit(row.id,{unit:event.target.value})}><option value="">—</option>{unitOptions.map(unit=><option key={unit} value={unit}>{copy[unit as VoiceCopyKey]||unit}</option>)}</Select></div>
          {(product||row.newProduct)&&<p className="voice-row-stock">{copy.current}: {quantity(product?.quantityMilli||0)} {copy[canonicalUnit(product?.unit||row.newProduct!.unit) as VoiceCopyKey]||product?.unit||row.newProduct!.unit}{row.quantityMilli!==null&&<strong>+{quantity(row.quantityMilli)} {copy[canonicalUnit(product?.unit||row.newProduct!.unit) as VoiceCopyKey]||product?.unit||row.newProduct!.unit}</strong>}</p>}
          {row.issues.map(issue=><p className="voice-row-issue" key={issue}>{copy[issueCopy[issue]]}</p>)}
        </article>;
      })}</div>}
      <div className="voice-add-actions"><Button type="button" variant="secondary" onClick={addManual} disabled={locked||recording||rows.length>=100}><Plus size={17}/>{copy.manual}</Button><Button type="button" variant="ghost" onClick={start} disabled={locked||recording||supported===false||!app.online}><Mic size={17}/>{copy.correction}</Button></div>
      {invalid>0&&resolved.length>0&&<label className="voice-resolved-choice"><input type="checkbox" checked={onlyResolved} disabled={locked} onChange={event=>setOnlyResolved(event.target.checked)}/><span><b>{copy.selectResolved}</b><small>{copy.selectResolvedHint}</small></span></label>}
      {saveError&&<p className="voice-warning" role="alert">{copy[saveError as VoiceCopyKey]||saveError}</p>}
      <div className="voice-confirm"><Button type="button" busy={busy} onClick={confirm} disabled={!app.online||recording||(!draft.submitted&&(!resolved.length||Boolean(invalid&&!onlyResolved)))}><Check size={18}/>{copy.confirm}</Button><button type="button" className="text-link" onClick={clear} disabled={busy||recording||Boolean(draft.submitted)}>{copy.clear}</button></div>
    </section></div>
    {recording&&<div className="voice-recording-dock"><span><i aria-hidden/>{stateLabel}</span><Button type="button" variant="danger" onClick={stop}><Square size={16}/>{copy.stop}</Button></div>}
    {app.session!.user.demo&&<div className="voice-demo-reset"><p>{copy.resetHint}</p><Button variant="ghost" busy={resetting} disabled={busy||recording} onClick={resetDemo}><RotateCcw size={16}/>{copy.resetDemo}</Button></div>}
  </div>;
}

export function VoiceHistoryPage(){
  const app=useApp();const {i18n}=useTranslation();const copy=voiceCopy(i18n.language);const router=useRouter();const entries=app.state!.inventoryEntries||[];const [error,setError]=useState('');
  const repeat=(entry:InventoryEntry)=>{const draft=newVoiceDraft();draft.rows=entry.items.map((item,index)=>validateRow({id:`repeat-${index}`,query:item.name,productId:item.productId,candidates:[],quantity:String(item.quantityMilli/1000),unit:item.unit,quantityMilli:item.quantityMilli,issues:[],source:entry.source==='manual'?'manual':'voice'},app.state!.products));try{sessionStorage.setItem(draftStorageKey(app.session!.user.id,app.businessId),JSON.stringify(draft));router.push('/app/stock/voice');}catch{setError(copy.storage);}};
  return <div className="voice-page"><div className="voice-heading"><div><Link className="text-link" href="/app/stock"><ArrowLeft size={17}/>{copy.back}</Link><h1>{copy.history}</h1><p>{copy.repeatHint}</p></div><Link className="btn btn-primary" href="/app/stock/voice"><Mic size={18}/>{copy.title}</Link></div>{error&&<p className="voice-warning" role="alert">{error}</p>}{entries.length?<div className="voice-history">{entries.map(entry=><article className="card voice-history-entry" key={entry.id}><div className="voice-section-head"><div><span className="voice-kicker">{copy[entry.source==='manual'?'manualSource':entry.source]}</span><h2>{new Date(entry.date).toLocaleString(i18n.language==='hi'?'hi-IN':'en-IN',{timeZone:'Asia/Kolkata'})}</h2></div><Button variant="secondary" onClick={()=>repeat(entry)}><RotateCcw size={16}/>{copy.repeat}</Button></div><ul>{entry.items.map(item=><li key={item.movementId}><span><b>{item.name}</b><small>{item.movementId}</small></span><strong>+{quantity(item.quantityMilli)} {copy[canonicalUnit(item.unit) as VoiceCopyKey]||item.unit}</strong></li>)}</ul><Link className="text-link" href="/app/stock/history">{copy.viewHistory}<History size={16}/></Link></article>)}</div>:<Empty icon={<History/>} title={copy.noHistory} action={<Link className="btn btn-primary" href="/app/stock/voice">{copy.title}</Link>}/>}</div>;
}
