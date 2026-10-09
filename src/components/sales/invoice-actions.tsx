'use client';
import {useEffect,useRef,useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Download,Printer,MessageCircle,FileText} from 'lucide-react';
import type {Invoice,Payment} from '@/lib/contracts';
import type {PreparedDocument} from '@/lib/document-contracts';
import {api} from '@/lib/client';
import {locale} from '@/lib/locale';
import {downloadBlob} from '@/lib/browser-documents';
import {DocumentStudio,fetchPdf} from '../documents/document-studio';
import {useApp} from '../app-provider';
import {Button,FormError} from '../ui';
export function InvoiceActions({invoice}:{invoice:Invoice;businessName:string;payments?:Payment[]}){
 const app=useApp(),{t,i18n}=useTranslation(),d=useTranslation('documents').t,[open,setOpen]=useState(false),[share,setShare]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),version=useRef(0);
 useEffect(()=>{version.current++;setBusy(false);return()=>{version.current++;};},[invoice.id,app.businessId,i18n.language]);
 async function download(){const v=++version.current;setBusy(true);setError('');try{const document=await api<PreparedDocument>('/businesses/'+app.businessId+'/documents',{kind:'invoice',sourceId:invoice.id,language:locale(i18n.language),format:'a4'});if(v!==version.current)return;const blob=await fetchPdf(document);if(v===version.current)downloadBlob(blob,document.filename);}catch(cause){if(v===version.current)setError(app.errorText(cause));}finally{if(v===version.current)setBusy(false);}}
 return <div className="invoice-file-actions"><div className="button-row"><Button variant="secondary" busy={busy} onClick={()=>void download()}><Download size={17}/>{t('pdfDownload')}</Button><Button variant="secondary" onClick={()=>{setShare(false);setOpen(true);}}><FileText size={17}/>{d('preview')}</Button><Button variant="secondary" onClick={()=>{setShare(false);setOpen(true);}}><Printer size={17}/>{t('print')}</Button><Button className="whatsapp-action" disabled={!invoice.customerId} onClick={()=>{setShare(true);setOpen(true);}}><MessageCircle size={17}/>{d('whatsapp')}</Button></div><FormError message={error}/><DocumentStudio open={open} onClose={()=>setOpen(false)} kind="invoice" sourceId={invoice.id} customerId={invoice.customerId||undefined} shareFirst={share}/></div>;
}
