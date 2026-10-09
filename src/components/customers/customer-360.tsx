'use client';
import '@/lib/v2-i18n';
import Link from 'next/link';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Wallet, Plus, Download, MessageSquare, ReceiptText } from 'lucide-react';
import type { Customer, CustomerStatement } from '@/lib/contracts';
import { api, money, quantity } from '@/lib/client';
import { documentPdf, downloadBlob, type DocumentLine } from '@/lib/browser-documents';
import { useApp } from '../app-provider';
import { useOperations } from '../operations';
import { PageHeading, InvoiceList } from '../dashboard';
import { Button, CardTitle, Empty, Sheet, FormError } from '../ui';

export function Customer360({ customer }: { customer: Customer }) {
  const { t, i18n } = useTranslation(); const v = useTranslation('v2').t; const app = useApp(); const state = app.state!; const open = useOperations();
  const [reminder, setReminder] = useState(false); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const invoices = state.invoices.filter(i => i.customerId === customer.id);
  const receipts = state.payments.filter(p => p.customerId === customer.id);
  const shopping = customer.totalSalesPaise;
  const paid = customer.netReceivedPaise;
  const photos = invoices.filter(i => i.status !== 'cancelled').flatMap(invoice => invoice.items.flatMap(item => (item.attachments || []).map(photo => ({ photo, item, invoice }))));
  const draft = v('reminderText', { name: customer.name, business: state.business.name, amount: money(customer.balancePaise, i18n.language) });
  async function statement() {
    setBusy(true); setError('');
    try {
      const full = await api<CustomerStatement>(`/businesses/${app.businessId}/customers/${customer.id}/statement`);
      const lines: DocumentLine[] = [{ text: v('shopping'), value: money(full.customer.totalSalesPaise), emphasis: true }, { text: v('netPayments'), value: money(full.customer.netReceivedPaise) }, { text: v('due'), value: money(full.customer.balancePaise), emphasis: true }, { text: v('signedPayments') }, { text: v('bills'), emphasis: true }];
      full.invoices.forEach(invoice => { lines.push({ text: `${invoice.number} · ${new Date(invoice.date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })} · ${t(invoice.status)}`, value: money(invoice.totalPaise), emphasis: true }); invoice.items.forEach(item => lines.push({ text: `${item.name} · ${quantity(item.quantityMilli)} ${item.unit}`, value: money(item.totalPaise) })); });
      lines.push({ text: v('timeline'), emphasis: true }); full.payments.forEach(p => lines.push({ text: `${new Date(p.date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })} · ${v(p.kind)} · ${v(p.method)}`, value: money(p.amountPaise) }));
      const blob = await documentPdf(state.business.name, `${full.customer.name} · ${full.customer.phone} · ${new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}`, lines); downloadBlob(blob, `statement-${customer.id}.pdf`);
    } catch (cause) { setError(app.errorText(cause)); } finally { setBusy(false); }
  }
  return <><PageHeading title={customer.name} subtitle={customer.phone || t('customer')} action={<div className="button-row"><Link className="btn btn-primary" href={`/app/sales/new?customer=${customer.id}`}><Plus size={17}/>{v('newSale')}</Link><Button onClick={() => open('payment', { customerId: customer.id })} disabled={customer.balancePaise <= 0}><Wallet size={17}/>{t('addPayment')}</Button></div>}/>
    <div className="small-metrics"><div><span>{v('shopping')}</span><b>{money(shopping, i18n.language)}</b></div><div><span>{v('netPayments')}</span><b>{money(paid, i18n.language)}</b></div><div><span>{t('balance')}</span><b>{money(customer.balancePaise, i18n.language)}</b></div></div>
    <div className="button-row below-card customer-actions"><Link className="btn btn-secondary" href={`/app/sales?customer=${customer.id}`}><ReceiptText size={17}/>{v('bills')}</Link><Button variant="secondary" onClick={() => setReminder(true)} disabled={customer.balancePaise <= 0}><MessageSquare size={17}/>{v('reminder')}</Button><Button variant="secondary" busy={busy} onClick={statement}><Download size={17}/>{v('statement')}</Button></div><FormError message={error}/>
    <div className="customer-360-grid"><section className="card"><CardTitle>{v('purchases')}</CardTitle>{invoices.length ? <InvoiceList invoices={invoices}/> : <Empty icon={<ReceiptText/>} title={t('noBills')}/>}</section><section className="card"><CardTitle>{v('timeline')}</CardTitle><p className="card-note">{v('signedPayments')}</p><div className="record-list">{receipts.map(p => <div className="record-row" key={p.id}><div><b>{v(p.kind)}</b><small>{v(p.method)} · {new Date(p.date).toLocaleString(i18n.language === 'hi' ? 'hi-IN' : 'en-IN', { timeZone: 'Asia/Kolkata' })}</small>{p.invoiceId && <Link className="text-link" href={`/app/sales/${p.invoiceId}`}>{state.invoices.find(i => i.id === p.invoiceId)?.number}</Link>}</div><b>{money(p.amountPaise)}</b></div>)}</div>{!receipts.length && <p className="card-note">{v('emptyTimeline')}</p>}</section></div>
    {photos.length > 0 && <section className="card below-card"><CardTitle>{v('photos')}</CardTitle><div className="customer-photos">{photos.map(({ photo, item, invoice }) => <Link key={`${invoice.id}-${photo.id}`} href={`/app/sales/${invoice.id}`}><img src={photo.url} alt={item.name} loading="lazy" width="160" height="120"/><b>{item.name}</b><small>{invoice.number}</small></Link>)}</div></section>}
    <Link href="/app/customers" className="text-link below-card">{t('back')}</Link>
    <Sheet open={reminder} onOpenChange={setReminder} title={v('reminder')}><div className="sheet-body"><p>{v('reminderHint')}</p><label className="field"><span>{v('reminder')}</span><textarea readOnly rows={5} value={draft}/></label><Button onClick={async () => { try { await navigator.clipboard.writeText(draft); app.notify(v('copied')); } catch { app.notify(t('loadError')); } }}>{v('copy')}</Button></div></Sheet></>;
}
