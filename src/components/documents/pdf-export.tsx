'use client';
import {useEffect,useRef,useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Download,FileText,Printer} from 'lucide-react';
import type {DocumentFormat,DocumentKind,PreparedDocument} from '@/lib/document-contracts';
import type {Language} from '@/lib/contracts';
import {api,today} from '@/lib/client';
import {locale} from '@/lib/locale';
import {downloadBlob} from '@/lib/browser-documents';
import {useApp} from '../app-provider';
import {LanguageOptions} from '../locale-provider';
import {Button,Field,FormError,Select,Sheet} from '../ui';
import {fetchPdf,PdfPreview,statementPeriod} from './document-studio';
import './documents.css';

/** Uses the same private document endpoint and renderer as Invoice Studio. */
export function PdfExport({kind,sourceId}:{kind:Exclude<DocumentKind,'invoice'|'statement'|'receipt'>;sourceId?:string}){
  const app=useApp(),{t,i18n}=useTranslation('documents'),[open,setOpen]=useState(false),[language,setLanguage]=useState<Language>(locale(i18n.language)),[format,setFormat]=useState<DocumentFormat>('a4'),[range,setRange]=useState(statementPeriod('month')),[document,setDocument]=useState<PreparedDocument|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const generation=useRef(0),business=useRef(app.businessId);business.current=app.businessId;
  useEffect(()=>()=>{generation.current++;},[]);
  useEffect(()=>{generation.current++;setDocument(null);setOpen(false);setBusy(false);setError('');},[app.businessId,kind,sourceId]);
  function changed(){generation.current++;setDocument(null);setBusy(false);setError('');}
  async function generate(){const turn=++generation.current,id=app.businessId;setBusy(true);setError('');try{const result=await api<PreparedDocument>(`/businesses/${id}/documents`,{kind,sourceId:sourceId||id,language,format,...(kind==='business-report'?range:{}),detailed:false});if(generation.current===turn&&business.current===id)setDocument(result);}catch(cause){if(generation.current===turn)setError(app.errorText(cause));}finally{if(generation.current===turn)setBusy(false);}}
  async function output(print=false){if(!document||busy)return;const turn=generation.current;setBusy(true);try{const blob=await fetchPdf(document);if(turn!==generation.current||business.current!==app.businessId)return;if(print){const url=URL.createObjectURL(blob);window.open(url,'_blank','noopener');setTimeout(()=>URL.revokeObjectURL(url),60000);}else downloadBlob(blob,document.filename);}catch(cause){if(turn===generation.current)setError(app.errorText(cause));}finally{if(turn===generation.current)setBusy(false);}}
  return <><Button variant="secondary" onClick={()=>{changed();setLanguage(locale(i18n.language));setOpen(true);}}><FileText size={17}/>{t(kind==='purchase'?'suiteTitle.purchase':kind==='closing-preview'?'closingPreviewPdf':kind)}</Button><Sheet title={t(kind==='closing-preview'?'suiteClosing':`suiteTitle.${kind}`)} open={open} onOpenChange={value=>{if(!value)changed();setOpen(value);}} wide><div className="sheet-body document-studio"><div className="form-grid"><Select label={t('documentLanguage')} value={language} onChange={e=>{changed();setLanguage(e.target.value as Language);}} disabled={busy}><LanguageOptions/></Select><Select label={t('format')} value={format} onChange={e=>{changed();setFormat(e.target.value as DocumentFormat);}} disabled={busy}>{['a4','mono','58mm','80mm'].map(f=><option value={f} key={f}>{t(f)}</option>)}</Select></div>{kind==='business-report'&&<div className="form-grid"><Field label={t('start')} type="date" value={range.start} max={range.end} onChange={e=>{changed();setRange(v=>({...v,start:e.target.value}));}} disabled={busy}/><Field label={t('end')} type="date" value={range.end} min={range.start} max={today()} onChange={e=>{changed();setRange(v=>({...v,end:e.target.value}));}} disabled={busy}/></div>}<FormError message={error}/><Button onClick={()=>void generate()} busy={busy}><FileText size={17}/>{t('generate')}</Button>{document&&<><div className="button-row"><Button onClick={()=>void output()} busy={busy}><Download size={17}/>{t('download')}</Button><Button variant="secondary" onClick={()=>void output(true)} disabled={busy}><Printer size={17}/>{t('print')}</Button></div><PdfPreview document={document}/></>}</div></Sheet></>;
}
