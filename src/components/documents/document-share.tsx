'use client';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircle, Download } from 'lucide-react';
import type { CommunicationPreferences, Delivery, PreparedDocument, SharingConnection } from '@/lib/document-contracts';
import type { Language } from '@/lib/contracts';
import { api } from '@/lib/client';
import { text } from '@/lib/locale';
import { downloadBlob } from '@/lib/browser-documents';
import { fetchPdf } from './document-studio';
import { useApp } from '../app-provider';
import { Button, Field, FormError, Select, Sheet } from '../ui';
import { LanguageOptions } from '../locale-provider';

export function DocumentShare({open,document,onClose}:{open:boolean;document:PreparedDocument;onClose:()=>void}){
  const app=useApp(),{t}=useTranslation('documents'),[language,setLanguage]=useState<Language>(document.model.language),[preferences,setPreferences]=useState<CommunicationPreferences|null>(null),[number,setNumber]=useState(''),[contactDirty,setContactDirty]=useState(false),[connection,setConnection]=useState<SharingConnection|null>(null),[messageLoading,setMessageLoading]=useState(true),[message,setMessage]=useState(''),[file,setFile]=useState<File|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[status,setStatus]=useState(''),[fallback,setFallback]=useState(false),[mode,setMode]=useState<'manual'|'cloud'>('manual');
  const requestKey=useRef(crypto.randomUUID()),version=useRef(0),business=app.businessId;
  useEffect(()=>{if(!open)return;const controller=new AbortController();setError('');setFile(null);setStatus('');setContactDirty(false);setFallback(false);setBusy(false);requestKey.current=crypto.randomUUID();
    void Promise.all([api<{preference:CommunicationPreferences;connection:SharingConnection;message:string}>(`/businesses/${business}/documents/${document.id}/preview?language=${language}`,undefined,controller.signal),fetchPdf(document,controller.signal)]).then(([preview,blob])=>{if(controller.signal.aborted)return;setPreferences(preview.preference);setNumber(preview.preference.number);if(preview.preference.updatedAt)setLanguage(preview.preference.language);setFile(new File([blob],document.filename,{type:'application/pdf'}));}).catch(cause=>{if(!controller.signal.aborted)setError(app.errorText(cause));});return()=>{controller.abort();version.current++;};
  },[open,document.id,business]);
  useEffect(()=>{if(!open)return;const c=new AbortController();setMessageLoading(true);setStatus('');setFallback(false);setError('');requestKey.current=crypto.randomUUID();void api<{connection:SharingConnection;message:string}>('/businesses/'+business+'/documents/'+document.id+'/preview?language='+language,undefined,c.signal).then(preview=>{if(c.signal.aborted)return;setConnection(preview.connection);setMessage(preview.message);setMode(preview.connection.enabled&&preview.connection.templates[language]?'cloud':'manual');setMessageLoading(false);}).catch(cause=>{if(!c.signal.aborted)setError(app.errorText(cause));});return()=>c.abort();},[open,document.id,business,language]);
  const native=Boolean(file&&typeof navigator!=='undefined'&&navigator.canShare?.({files:[file]}));
  const manualMessage=text(language,'documents','manualMessage',{name:document.model.customer.name,business:document.model.merchant.name,document:text(language,'documents',document.model.kind)});
  const chatMessage=text(language,'documents','chatMessage',{name:document.model.customer.name,business:document.model.merchant.name,document:text(language,'documents',document.model.kind)});
  async function saveContact(){if(!preferences)return;setBusy(true);setError('');try{const p=await api<CommunicationPreferences>(`/businesses/${business}/customers/${document.model.customer.id}/communication`,{...preferences,number,language,updatedAt:undefined});setPreferences(p);setNumber(p.number);setContactDirty(false);app.notify(t('saved'));}catch(cause){setError(app.errorText(cause));}finally{setBusy(false);}}
  async function recordManual(){const result=await api<Delivery>(`/businesses/${business}/deliveries`,{documentId:document.id,number,language,mode:'manual',requestKey:requestKey.current,confirmed:true});setStatus(result.status);}
  async function confirm(){if(busy||messageLoading||!file||!preferences)return;const epoch=++version.current;setError('');setBusy(true);
    try{if(mode==='cloud'){const result=await api<Delivery>(`/businesses/${business}/deliveries`,{documentId:document.id,number,language,mode,requestKey:requestKey.current,confirmed:true});if(epoch!==version.current)return;setStatus(result.status);if(result.errorCode)setError(app.errorText({code:result.errorCode}));}
      else if(native){await navigator.share({files:[file],title:document.model.reference,text:manualMessage});if(epoch!==version.current)return;await recordManual();}
      else setFallback(true);
    }catch(cause){if(epoch===version.current&&!(cause instanceof DOMException&&cause.name==='AbortError'))setError(app.errorText(cause));}finally{if(epoch===version.current)setBusy(false);}}
  async function openChat(){if(!file)return;downloadBlob(file,document.filename);window.open(`https://wa.me/${(/^[6-9]\d{9}$/.test(number.replace(/\D/g,''))?'91':'')+number.replace(/\D/g,'')}?text=${encodeURIComponent(chatMessage)}`,'_blank','noopener,noreferrer');try{await recordManual();}catch(cause){setError(app.errorText(cause));}}
  const saved=Boolean(preferences&&number===preferences.number&&!contactDirty);
  return <Sheet title={t('whatsapp')} description={document.model.reference} open={open} onOpenChange={next=>{if(!next&&!busy)onClose();}}><div className="sheet-body document-share">
    <div className="recipient-card"><b>{document.model.customer.name}</b><p>{document.model.reference} · {t(document.model.kind)}</p><p>{connection?.enabled?t('sender')+': '+connection.sender:t('notConnected')}</p></div>
    <Field label={t('number')} type="tel" value={number} maxLength={30} disabled={busy} onChange={e=>{setContactDirty(true);setNumber(e.target.value);setStatus('');setFallback(false);requestKey.current=crypto.randomUUID();}}/>
    <Select label={t('messageLanguage')} value={language} disabled={busy} onChange={e=>setLanguage(e.target.value as Language)}><LanguageOptions/></Select>
    {preferences&&<details><summary>{t('preferences')}</summary><label className="v3-check"><input type="checkbox" checked={preferences.permission} disabled={busy} onChange={e=>{setContactDirty(true);setPreferences(p=>p&&({...p,permission:e.target.checked}));}}/>{t('consent')}</label><label className="v3-check"><input type="checkbox" checked={preferences.optedOut} disabled={busy} onChange={e=>{setContactDirty(true);setPreferences(p=>p&&({...p,optedOut:e.target.checked}));}}/>{t('optout')}</label><Field label={t('consentSource')} value={preferences.source} disabled={busy} maxLength={160} onChange={e=>{setContactDirty(true);setPreferences(p=>p&&({...p,source:e.target.value}));}}/></details>}
    {(!saved||preferences&&language!==preferences.language)&&<Button variant="secondary" busy={busy} onClick={()=>void saveContact()}>{t('saveContact')}</Button>}
    {connection?.enabled&&<Select label={t('sharingSettings')} value={mode} disabled={busy} onChange={e=>setMode(e.target.value as 'manual'|'cloud')}><option value="manual">{t('manualAction')}</option><option value="cloud" disabled={!connection.templates[language]}>{t('whatsapp')}</option></Select>}
    {connection?.enabled&&!connection.templates[language]&&<p className="card-note">{t('noTemplate')}</p>}
    <label className="field"><span>{t('template')}</span><textarea value={mode==='cloud'?message:manualMessage} readOnly rows={4}/></label>
    {mode==='manual'&&<p className="card-note">{t('manualNote')}</p>}
    <FormError message={error}/>{status&&<p className={`delivery-status delivery-${status}`} role="status">{t(status)}</p>}
    {!status&&<Button className="whatsapp-action" busy={busy} disabled={messageLoading||!file||!saved||preferences?.optedOut} onClick={()=>void confirm()}><MessageCircle size={17}/>{t('confirm')}</Button>}
    {fallback&&file&&<div className="manual-fallback"><p>{t('fallback')}</p><div className="button-row"><Button variant="secondary" onClick={()=>downloadBlob(file,document.filename)}><Download size={17}/>{t('download')}</Button><Button className="whatsapp-action" onClick={()=>void openChat()}>{t('openChat')}</Button><Button variant="ghost" onClick={()=>void navigator.clipboard.writeText(chatMessage).then(()=>app.notify(t('copied'))).catch(cause=>setError(app.errorText(cause)))}>{t('copyMessage')}</Button></div></div>}
  </div></Sheet>;
}
