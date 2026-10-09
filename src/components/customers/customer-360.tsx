'use client';
import {LocalizedDate} from '@/components/localized-data';
import '@/lib/v2-i18n';
import Link from 'next/link';
import { useEffect,useRef,useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Wallet, Plus, Download, MessageSquare, ReceiptText } from 'lucide-react';
import type { Customer, CustomerStatement } from '@/lib/contracts';
import {dateText,unitText,text,locale,languageTags,type Locale} from '@/lib/locale';
import { api, money, quantity } from '@/lib/client';
import { documentPdf, downloadBlob, type DocumentLine } from '@/lib/browser-documents';
import { useApp } from '../app-provider';
import { useOperations } from '../operations';
import { PageHeading, InvoiceList } from '../dashboard';
import {LanguageOptions} from '../locale-provider';
import { Button, CardTitle, Empty, Sheet, FormError,Select } from '../ui';
import { CustomerDemand } from '../demand/demand-page';

export function Customer360({ customer }: { customer: Customer }) {
  const { t, i18n } = useTranslation(); const v = useTranslation('v2').t; const app = useApp(); const state = app.state!; const open = useOperations();
  const [reminder, setReminder] = useState(false); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const statementVersion=useRef(0);
  useEffect(()=>{statementVersion.current++;setBusy(false);return()=>{statementVersion.current++;};},[customer.id,app.businessId,i18n.language]);
  const invoices = state.invoices.filter(i => i.customerId === customer.id);
  const receipts = state.payments.filter(p => p.customerId === customer.id);
  const shopping = customer.totalSalesPaise;
  const paid = customer.netReceivedPaise;
  const photos = invoices.filter(i => i.status !== 'cancelled').flatMap(invoice => invoice.items.flatMap(item => (item.attachments || []).map(photo => ({ photo, item, invoice }))));
  const [messageLocale,setMessageLocale]=useState<Locale>(()=>locale(i18n.language));
  const draft = text(messageLocale,'v2','reminderText', { name: customer.name, business: state.business.name, amount: money(customer.balancePaise, messageLocale) });
  async function statement() {
    const request=++statementVersion.current;
    setBusy(true); setError('');
    try {
      const full = await api<CustomerStatement>(`/businesses/${app.businessId}/customers/${customer.id}/statement`);
      if(request!==statementVersion.current)return;
      const lines: DocumentLine[] = [{ text: v('shopping'), value: money(full.customer.totalSalesPaise), emphasis: true }, { text: v('netPayments'), value: money(full.customer.netReceivedPaise) }, { text: v('due'), value: money(full.customer.balancePaise), emphasis: true }, { text: v('signedPayments') }, { text: v('bills'), emphasis: true }];
      full.invoices.forEach(invoice => { lines.push({ text: `${invoice.number} · ${dateText(invoice.date,i18n.language)} · ${t(invoice.status)}`, value: money(invoice.totalPaise), emphasis: true }); invoice.items.forEach(item => lines.push({ text: `${item.name} · ${quantity(item.quantityMilli)} ${unitText(item.unit,i18n.language,item.quantityMilli/1000)}`, value: money(item.totalPaise) })); });
      lines.push({ text: v('timeline'), emphasis: true }); full.payments.forEach(p => lines.push({ text: `${dateText(p.date,i18n.language)} · ${v(p.kind)} · ${v(p.method)}`, value: money(p.amountPaise) }));
      const blob = await documentPdf(state.business.name, `${full.customer.name} · ${full.customer.phone} · ${dateText(new Date(),i18n.language)}`, lines);if(request===statementVersion.current)downloadBlob(blob, `statement-${customer.id}.pdf`);
    } catch (cause) { if(request===statementVersion.current)setError(app.errorText(cause)); } finally { if(request===statementVersion.current)setBusy(false); }
  }
  return <><PageHeading title={customer.name} subtitle={customer.phone || t('customer')} action={<div className="button-row">{state.configuration.permissions.sales&&<Link className="btn btn-primary" href={`/app/sales/new?customer=${customer.id}`}><Plus size={17}/>{v('newSale')}</Link>}{state.configuration.permissions.payments&&<Button onClick={() => open('payment', { customerId: customer.id })} disabled={customer.balancePaise <= 0}><Wallet size={17}/>{t('addPayment')}</Button>}</div>}/>
    <div className="small-metrics"><div><span>{v('shopping')}</span><b>{money(shopping, i18n.language)}</b></div><div><span>{v('netPayments')}</span><b>{money(paid, i18n.language)}</b></div><div><span>{t('balance')}</span><b>{money(customer.balancePaise, i18n.language)}</b></div></div>
    <div className="button-row below-card customer-actions"><Link className="btn btn-secondary" href={`/app/sales?customer=${customer.id}`}><ReceiptText size={17}/>{v('bills')}</Link><Button variant="secondary" onClick={() => setReminder(true)} disabled={customer.balancePaise <= 0}><MessageSquare size={17}/>{v('reminder')}</Button><Button variant="secondary" busy={busy} onClick={statement}><Download size={17}/>{v('statement')}</Button></div><FormError message={error}/>
    <div className="customer-360-grid"><section className="card"><CardTitle>{v('purchases')}</CardTitle>{invoices.length ? <InvoiceList invoices={invoices}/> : <Empty icon={<ReceiptText/>} title={t('noBills')}/>}</section><section className="card"><CardTitle>{v('timeline')}</CardTitle><p className="card-note">{v('signedPayments')}</p><div className="record-list">{receipts.map(p => <div className="record-row" key={p.id}><div><b>{v(p.kind)}</b><small>{v(p.method)} · <LocalizedDate value={p.date} options={{ timeZone: 'Asia/Kolkata' }}/></small>{p.invoiceId && <Link className="text-link" href={`/app/sales/${p.invoiceId}`}>{state.invoices.find(i => i.id === p.invoiceId)?.number}</Link>}</div><b>{money(p.amountPaise)}</b></div>)}</div>{!receipts.length && <p className="card-note">{v('emptyTimeline')}</p>}</section></div>
    {photos.length > 0 && <section className="card below-card"><CardTitle>{v('photos')}</CardTitle><div className="customer-photos">{photos.map(({ photo, item, invoice }) => <Link key={`${invoice.id}-${photo.id}`} href={`/app/sales/${invoice.id}`}><img src={photo.url} alt={item.name} loading="lazy" width="160" height="120"/><b>{item.name}</b><small>{invoice.number}</small></Link>)}</div></section>}
    <CustomerDemand customerId={customer.id}/><Link href="/app/customers" className="text-link below-card">{t('back')}</Link>
    <Sheet open={reminder} onOpenChange={setReminder} title={v('reminder')}><div className="sheet-body"><p>{v('reminderHint')}</p><Select label={t('communicationLanguage')} value={messageLocale} onChange={event=>setMessageLocale(locale(event.target.value))}><LanguageOptions/></Select><label className="field"><span>{v('reminder')}</span><textarea lang={languageTags[messageLocale]} data-communication-preview readOnly rows={5} value={draft}/></label><Button onClick={async () => { try { await navigator.clipboard.writeText(draft); app.notify(v('copied')); } catch { app.notify(t('loadError')); } }}>{v('copy')}</Button></div></Sheet></>;
}
