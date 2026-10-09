'use client';
import {CustomerDocuments} from '../documents/customer-documents';
import type {PreparedDocument} from '@/lib/document-contracts';
import {fetchPdf} from '../documents/document-studio';

import '@/lib/v2-i18n';
import Link from 'next/link';
import { useEffect,useRef,useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Wallet, Plus, Download, MessageSquare, ReceiptText, Pencil } from 'lucide-react';
import type { Customer } from '@/lib/contracts';
import {dateText,text,locale,languageTags,type Locale} from '@/lib/locale';
import { api, money, today } from '@/lib/client';
import { downloadBlob } from '@/lib/browser-documents';
import { useApp } from '../app-provider';
import { useOperations } from '../operations';
import { PageHeading } from '../dashboard';
import {LanguageOptions} from '../locale-provider';
import { Button, CardTitle, Sheet, FormError,Select,Field } from '../ui';
import { CustomerDemand } from '../demand/demand-page';

export function Customer360({ customer }: { customer: Customer }) {
  const { t, i18n } = useTranslation(); const v = useTranslation('v2').t; const app = useApp(); const state = app.state!; const open = useOperations();
  const [editing,setEditing]=useState(false),[name,setName]=useState(customer.name),[phone,setPhone]=useState(customer.phone);
  const [reminder, setReminder] = useState(false); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const statementVersion=useRef(0);
  useEffect(()=>{statementVersion.current++;setBusy(false);return()=>{statementVersion.current++;};},[customer.id,app.businessId,i18n.language]);
  const invoices = state.invoices.filter(i => i.customerId === customer.id);

  const shopping = customer.totalSalesPaise;
  const paid = customer.netReceivedPaise;
  const photos = invoices.filter(i => i.status !== 'cancelled').flatMap(invoice => invoice.items.flatMap(item => (item.attachments || []).map(photo => ({ photo, item, invoice }))));
  const [messageLocale,setMessageLocale]=useState<Locale>(()=>locale(i18n.language));
  const draft = text(messageLocale,'v2','reminderText', { name: customer.name, business: state.business.name, amount: money(customer.balancePaise, messageLocale) });
  async function statement() {
    const version=++statementVersion.current;setBusy(true);setError('');
    try { const document=await api<PreparedDocument>('/businesses/'+app.businessId+'/documents',{kind:'statement',sourceId:customer.id,language:locale(i18n.language),format:'a4',start:'1970-01-01',end:today(),detailed:true});if(version!==statementVersion.current)return;const blob=await fetchPdf(document);if(version===statementVersion.current)downloadBlob(blob,document.filename); }catch(cause){if(version===statementVersion.current)setError(app.errorText(cause));}finally{if(version===statementVersion.current)setBusy(false);}
  }
  async function saveCustomer(){setBusy(true);setError('');try{await app.mutation('/customers/'+customer.id+'/edit',{name,phone,previousName:customer.name,previousPhone:customer.phone});setEditing(false);app.notify(text(i18n.language,'documents','saved'));}catch(cause){setError(app.errorText(cause));}finally{setBusy(false);}}
  return <><PageHeading title={customer.name} subtitle={customer.phone || t('customer')} action={<div className="button-row">{state.configuration.permissions.sales&&<Link className="btn btn-primary" href={`/app/sales/new?customer=${customer.id}`}><Plus size={17}/>{v('newSale')}</Link>}{state.configuration.permissions.payments&&<Button onClick={() => open('payment', { customerId: customer.id })} disabled={customer.balancePaise <= 0}><Wallet size={17}/>{t('addPayment')}</Button>}</div>}/>
    <div className="small-metrics"><div><span>{v('shopping')}</span><b>{money(shopping, i18n.language)}</b></div><div><span>{v('netPayments')}</span><b>{money(paid, i18n.language)}</b></div><div><span>{t('balance')}</span><b>{money(customer.balancePaise, i18n.language)}</b></div><div><span>{text(i18n.language,'documents','purchaseCount')}</span><b>{customer.purchaseCount || 0}</b></div></div>
    <p>{text(i18n.language,'documents','lastPurchase')}: {customer.lastPurchase?dateText(customer.lastPurchase,i18n.language):'—'} · {text(i18n.language,'documents','lastPayment')}: {customer.lastPayment?dateText(customer.lastPayment,i18n.language):'—'}</p>
    <div className="button-row below-card customer-actions">{state.configuration.permissions.customers&&<Button variant="secondary" onClick={()=>{setName(customer.name);setPhone(customer.phone);setError('');setEditing(true);}}><Pencil size={17}/>{text(i18n.language,'documents','editCustomer')}</Button>}<Link className="btn btn-secondary" href={`/app/sales?customer=${customer.id}`}><ReceiptText size={17}/>{v('bills')}</Link><Button variant="secondary" onClick={() => setReminder(true)} disabled={customer.balancePaise <= 0}><MessageSquare size={17}/>{v('reminder')}</Button><Button variant="secondary" busy={busy} onClick={statement}><Download size={17}/>{v('statement')}</Button></div><FormError message={error}/>
    <CustomerDocuments customerId={customer.id}/>
    {photos.length > 0 && <section className="card below-card"><CardTitle>{v('photos')}</CardTitle><div className="customer-photos">{photos.map(({ photo, item, invoice }) => <Link key={`${invoice.id}-${photo.id}`} href={`/app/sales/${invoice.id}`}><img src={photo.url} alt={item.name} loading="lazy" width="160" height="120"/><b>{item.name}</b><small>{invoice.number}</small></Link>)}</div></section>}
    <CustomerDemand customerId={customer.id}/><Link href="/app/customers" className="text-link below-card">{t('back')}</Link>
    <Sheet open={editing} onOpenChange={value=>{if(!busy)setEditing(value);}} title={text(i18n.language,'documents','editCustomer')}><div className="sheet-body"><Field label={text(i18n.language,'documents','contactName')} value={name} disabled={busy} maxLength={100} onChange={e=>setName(e.target.value)}/><Field label={text(i18n.language,'documents','contactPhone')} type="tel" value={phone} disabled={busy} maxLength={30} onChange={e=>setPhone(e.target.value)}/><FormError message={error}/><Button busy={busy} disabled={!name.trim()} onClick={()=>void saveCustomer()}>{text(i18n.language,'documents','saveCustomer')}</Button></div></Sheet>
    <Sheet open={reminder} onOpenChange={setReminder} title={v('reminder')}><div className="sheet-body"><p>{v('reminderHint')}</p><Select label={t('communicationLanguage')} value={messageLocale} onChange={event=>setMessageLocale(locale(event.target.value))}><LanguageOptions/></Select><label className="field"><span>{v('reminder')}</span><textarea lang={languageTags[messageLocale]} data-communication-preview readOnly rows={5} value={draft}/></label><Button onClick={async () => { try { await navigator.clipboard.writeText(draft); app.notify(v('copied')); } catch { app.notify(t('loadError')); } }}>{v('copy')}</Button></div></Sheet></>;
}
