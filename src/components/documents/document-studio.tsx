'use client';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, FileText, Printer, Share2, MessageCircle } from 'lucide-react';
import type { CustomerLedger, DocumentFormat, DocumentKind, PreparedDocument } from '@/lib/document-contracts';
import type { Language } from '@/lib/contracts';
import { api, today } from '@/lib/client';
import { dateText, locale } from '@/lib/locale';
import { downloadBlob } from '@/lib/browser-documents';
import { useApp } from '../app-provider';
import { Button, Field, FormError, Select, Sheet } from '../ui';
import { LanguageOptions } from '../locale-provider';
import { DocumentShare } from './document-share';
import './documents.css';

export function statementPeriod(preset:string,end=today()){
  const d=new Date(end+'T12:00:00Z');let start=end,last=end;
  if(preset==='week'){d.setUTCDate(d.getUTCDate()-6);start=d.toISOString().slice(0,10);}
  if(preset==='month')start=end.slice(0,7)+'-01';
  if(preset==='lastMonth'){d.setUTCDate(0);last=d.toISOString().slice(0,10);start=last.slice(0,7)+'-01';}
  if(preset==='quarter'){d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()-2);start=d.toISOString().slice(0,10);}
  if(preset==='year')start=`${d.getUTCFullYear()-(d.getUTCMonth()<3?1:0)}-04-01`;
  return{start,end:last};
}
export async function fetchPdf(document:PreparedDocument,signal?:AbortSignal){const response=await fetch(document.pdfUrl,{credentials:'same-origin',cache:'no-store',signal});if(!response.ok){const e=await response.json();throw{code:e.error?.code||'INTERNAL_ERROR'};}return response.blob();}

export function PdfPreview({document}:{document:PreparedDocument}){
  const t=useTranslation('documents').t,app=useApp(),container=useRef<HTMLDivElement>(null),[error,setError]=useState(''),[zoom,setZoom]=useState('1');
  useEffect(()=>{const controller=new AbortController();let task:{destroy:()=>Promise<void>}|undefined;
    setError('');const host=container.current;if(host)host.replaceChildren();
    void (async()=>{const pdfjs=await import('pdfjs-dist');pdfjs.GlobalWorkerOptions.workerSrc='/pdf.worker.min.mjs';const blob=await fetchPdf(document,controller.signal);if(controller.signal.aborted)return;const loading=pdfjs.getDocument({data:new Uint8Array(await blob.arrayBuffer())});task=loading;const pdf=await loading.promise;for(let n=1;n<=pdf.numPages;n++){if(controller.signal.aborted)return;const page=await pdf.getPage(n),viewport=page.getViewport({scale:1.3*Number(zoom)}),canvas=window.document.createElement('canvas');canvas.width=viewport.width;canvas.height=viewport.height;canvas.style.width=(100*Number(zoom))+'%';canvas.setAttribute('aria-label',t('page',{page:n,total:pdf.numPages}));if(host)host.append(canvas);await page.render({canvas,viewport}).promise;}}
    )().catch(cause=>{if(!controller.signal.aborted)setError(app.errorText(cause));});return()=>{controller.abort();void task?.destroy();};
  },[document.id,zoom]);
  return <><Select label={t('zoom')} value={zoom} onChange={e=>setZoom(e.target.value)}><option value="0.75">75%</option><option value="1">100%</option><option value="1.5">150%</option></Select><div ref={container} className="pdf-pages" role="region" tabIndex={0} aria-label={t('preview')}/><FormError message={error}/></>;
}
export function DocumentStudio({open,onClose,customerId,kind:initialKind='statement',sourceId:initialSource='',shareFirst=false,period,savedDocument}:{open:boolean;onClose:()=>void;customerId?:string;kind?:DocumentKind;sourceId?:string;shareFirst?:boolean;period?:{start:string;end:string};savedDocument?:PreparedDocument}){
  const app=useApp(),{t,i18n}=useTranslation('documents');const [kind,setKind]=useState<DocumentKind>(initialKind),[sourceId,setSourceId]=useState(initialSource),[language,setLanguage]=useState<Language>(locale(i18n.language)),[format,setFormat]=useState<DocumentFormat>('a4'),[range,setRange]=useState(period||statementPeriod('month')),[preset,setPreset]=useState('month'),[detailed,setDetailed]=useState(true),[records,setRecords]=useState<CustomerLedger|null>(null),[document,setDocument]=useState<PreparedDocument|null>(null),[share,setShare]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const generation=useRef(0),scope=useRef(app.businessId);scope.current=app.businessId;
  useEffect(()=>{if(!open)return;setKind(initialKind);setSourceId(initialSource);setLanguage(locale(i18n.language));setFormat('a4');setDocument(null);setShare(false);setError('');setBusy(false);if(period)setRange(period);
    if(savedDocument){setLanguage(savedDocument.model.language);setFormat(savedDocument.model.format);setDetailed(savedDocument.model.detailed);if(savedDocument.expiresAt>new Date().toISOString()){setDocument(savedDocument);setShare(shareFirst);}else setError(t('expired'));}
    else if(shareFirst&&initialSource){const request=++generation.current,business=app.businessId;setBusy(true);void api<PreparedDocument>('/businesses/'+business+'/documents',{kind:initialKind,sourceId:initialKind==='statement'?customerId:initialSource,language:locale(i18n.language),format:'a4',...(period||range),detailed:true}).then(doc=>{if(request===generation.current&&scope.current===business){setDocument(doc);setShare(true);}}).catch(cause=>{if(request===generation.current)setError(app.errorText(cause));}).finally(()=>{if(request===generation.current)setBusy(false);});}
    return()=>{generation.current++;};},[open,initialKind,initialSource,customerId,app.businessId,shareFirst,savedDocument?.id]);
  useEffect(()=>{if(!open||!customerId)return;const controller=new AbortController();setRecords(null);api<CustomerLedger>(`/businesses/${app.businessId}/customers/${customerId}/ledger?start=1970-01-01&end=${today()}`,undefined,controller.signal).then(setRecords).catch(cause=>{if(!controller.signal.aborted)setError(app.errorText(cause));});return()=>controller.abort();},[open,customerId,app.businessId]);
  async function prepare(download=false){if(busy)return;const version=++generation.current,business=app.businessId;setBusy(true);setError('');
    try{const doc=await api<PreparedDocument>(`/businesses/${business}/documents`,{kind,sourceId:kind==='statement'?customerId:sourceId,language,format,...range,detailed});if(version!==generation.current||scope.current!==business)return;setDocument(doc);if(kind==='receipt')setSourceId(doc.model.sourceId);if(download)downloadBlob(await fetchPdf(doc),doc.filename);else if(shareFirst)setShare(true);}catch(cause){if(version===generation.current)setError(app.errorText(cause));}finally{if(version===generation.current)setBusy(false);}}
  const changed=()=>{generation.current++;setDocument(null);setBusy(false);setError('');};
  async function download(){if(!document)return;try{downloadBlob(await fetchPdf(document),document.filename);}catch(cause){setError(app.errorText(cause));}}
  async function print(){if(!document)return;try{const blob=await fetchPdf(document),url=URL.createObjectURL(blob);window.open(url,'_blank','noopener');setTimeout(()=>URL.revokeObjectURL(url),60000);}catch(cause){setError(app.errorText(cause));}}
  const allowed=app.state!.configuration.permissions;
  return <><Sheet title={t('studio')} open={open} onOpenChange={next=>{if(!next){generation.current++;onClose();}}} wide><div className="sheet-body document-studio">
    <div className="form-grid"><Select label={t('documents')} value={kind} disabled={busy} onChange={e=>{changed();setKind(e.target.value as DocumentKind);setSourceId('');}}>{allowed.sales&&<option value="invoice">{t('invoice')}</option>}{customerId&&allowed.customers&&<option value="statement">{t('statement')}</option>}{customerId&&allowed.payments&&<option value="receipt">{t('receipt')}</option>}</Select><Select label={t('documentLanguage')} value={language} disabled={busy} onChange={e=>{changed();setLanguage(e.target.value as Language);}}><LanguageOptions/></Select><Select label={t('format')} value={format} disabled={busy} onChange={e=>{changed();setFormat(e.target.value as DocumentFormat);}}>{(['a4','mono','58mm','80mm'] as const).map(f=><option value={f} key={f}>{t(f)}</option>)}</Select></div>
    {kind!=='statement'&&customerId&&<Select label={t('source')} value={sourceId} disabled={busy} onChange={e=>{changed();setSourceId(e.target.value);}}><option value="">—</option>{kind==='invoice'?records?.invoices.map(r=><option value={r.id} key={r.id}>{r.number} · {dateText(r.date,i18n.language)}</option>):records?.receipts.map(r=><option value={r.id} key={r.id}>{r.id.slice(0,8)} · {dateText(r.date,i18n.language)}</option>)}</Select>}
    {kind==='statement'&&<><Select label={t('period')} value={preset} disabled={busy} onChange={e=>{changed();setPreset(e.target.value);if(e.target.value!=='custom')setRange(statementPeriod(e.target.value));}}>{['week','month','lastMonth','quarter','year','custom'].map(p=><option key={p} value={p}>{t(p)}</option>)}</Select><div className="form-grid"><Field label={t('start')} type="date" value={range.start} max={range.end} disabled={busy} onChange={e=>{changed();setPreset('custom');setRange(r=>({...r,start:e.target.value}));}}/><Field label={t('end')} type="date" value={range.end} min={range.start} max={today()} disabled={busy} onChange={e=>{changed();setPreset('custom');setRange(r=>({...r,end:e.target.value}));}}/></div><label className="v3-check"><input type="checkbox" checked={detailed} disabled={busy} onChange={e=>{changed();setDetailed(e.target.checked);}}/>{t('detailed')}</label></>}
    <FormError message={error}/><Button busy={busy} disabled={kind!=='statement'&&!sourceId} onClick={()=>void prepare()}><FileText size={17}/>{t('generate')}</Button>
    {document&&<><p>{document.model.reference}</p><p className="card-note">{t('secureNote',{date:dateText(document.expiresAt,i18n.language)})}</p><div className="button-row"><Button variant="secondary" onClick={()=>void download()}><Download size={17}/>{t('download')}</Button><Button variant="secondary" onClick={()=>void print()}><Printer size={17}/>{t('print')}</Button><Button variant="secondary" onClick={()=>setShare(true)}><Share2 size={17}/>{t('share')}</Button><Button className="whatsapp-action" onClick={()=>setShare(true)} disabled={!document.model.customer.id}><MessageCircle size={17}/>{t('whatsapp')}</Button></div><PdfPreview document={document}/></>}
  </div></Sheet>{document&&<DocumentShare open={share} document={document} onClose={()=>setShare(false)}/>}</>;
}
