'use client';
import {LocalizedUnit,LocalizedDate} from '@/components/localized-data';

import Link from 'next/link';
import { useState,useEffect } from 'react';
import { ArrowLeft, ReceiptText, XCircle } from 'lucide-react';
import type { Invoice, Payment } from '@/lib/contracts';
import { api,money, quantity } from '@/lib/client';
import { useApp } from '../app-provider';
import { Button, Empty, FormError, Sheet } from '../ui';
import { useSalesCopy } from './sales-copy';
import { InvoiceActions } from './invoice-actions';

export function InvoiceDocument({ invoice, businessName, payments }: { invoice: Invoice; businessName: string; payments: Payment[] }) {
  const { t, i18n } = useSalesCopy();
  return <article className="sale-invoice invoice-document" data-invoice-document>
    <header className="sale-invoice-heading"><div><span>DukaanSet</span><h2>{businessName}</h2><p>{invoice.number}</p></div><span className={`sale-status sale-status-${invoice.status}`}>{t(invoice.status)}</span></header>
    {invoice.status === 'cancelled' && <p className="sale-context-note">{t('cancelledHint')}</p>}
    <dl className="sale-invoice-meta"><div><dt>{t('customer')}</dt><dd>{invoice.customerName || t('walkIn')}</dd></div><div><dt>{t('date')}</dt><dd><LocalizedDate value={invoice.date} options={{day:'numeric',month:'long',year:'numeric',hour:'numeric',minute:'2-digit'}}/></dd></div>{invoice.dueDate && <div><dt>{t('dueDate')}</dt><dd><LocalizedDate value={invoice.dueDate}/></dd></div>}</dl>
    <section className="sale-invoice-items" aria-label={t('items')}>{invoice.items.map((item, index) => <div className="sale-invoice-item" key={`${item.productId}-${index}`}><div className="sale-invoice-item-line"><div><h3>{item.name}</h3>{item.variation && <p>{item.variation}</p>}<small>{quantity(item.quantityMilli)} <LocalizedUnit value={item.unit} count={item.quantityMilli/1000}/> × {money(item.pricePaise)}</small></div><strong>{money(item.totalPaise)}</strong></div>{Boolean(item.attachments?.length) && <div className="sale-invoice-photos">{item.attachments!.map(photo => <img key={photo.id} src={photo.url} alt={t('photoPreview', { name: item.name })} />)}</div>}</div>)}</section>
    <dl className="sale-invoice-totals"><div><dt>{t('subtotal')}</dt><dd>{money(invoice.subtotalPaise)}</dd></div><div><dt>{t('discountAmount')}</dt><dd>− {money(invoice.discountPaise)}</dd></div><div className="sale-invoice-total"><dt>{t('total')}</dt><dd>{money(invoice.totalPaise)}</dd></div><div><dt>{t('receivedTotal')}</dt><dd>{money(invoice.paidPaise)}</dd></div><div className="sale-invoice-pending"><dt>{t('pending')}</dt><dd>{money(invoice.balancePaise)}</dd></div></dl>
    <section className="sale-invoice-payments" aria-labelledby="sale-invoice-payments-heading"><h3 id="sale-invoice-payments-heading">{t('paymentHistory')}</h3>{payments.map(payment => <div key={payment.id}><span><b>{t(payment.method)}</b><small>{t(payment.kind === 'sale' ? 'salePayment' : payment.kind === 'repayment' ? 'repayment' : 'refund')} · <LocalizedDate value={payment.date} options={{day:'numeric',month:'long',year:'numeric',hour:'numeric',minute:'2-digit'}}/></small></span><strong>{money(payment.amountPaise)}</strong></div>)}</section>
    <p className="sale-invoice-note">{t('paymentNote')}</p><p className="sale-invoice-note">{t('taxNotice')}</p>
  </article>;
}

export function SaleInvoicePage({ id }: { id: string }) {
  const { t } = useSalesCopy();
  const app = useApp();
  const [historical,setHistorical]=useState<Invoice|null>(null);
  const invoice = app.state!.invoices.find(item => item.id === id)||historical;
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(()=>{setHistorical(null);const c=new AbortController();if(!app.state!.invoices.some(i=>i.id===id))void api<Invoice>(`/businesses/${app.businessId}/invoices/${id}`,undefined,c.signal).then(setHistorical).catch(cause=>{if(!c.signal.aborted)setError(app.errorText(cause));});return()=>c.abort();},[id,app.businessId]);
  if (!invoice) return <Empty icon={<ReceiptText />} title={t('noInvoice')} action={<Link className="btn btn-secondary" href="/app/sales">{t('back')}</Link>} />;
  const payments = invoice.payments || app.state!.payments.filter(payment => payment.invoiceId === id);
  const reverse = async () => {
    setBusy(true); setError('');
    try { await app.mutation(`/invoices/${id}/cancel`, {}); setConfirm(false); }
    catch (error) { setError(app.errorText(error)); }
    finally { setBusy(false); }
  };
  return <div className="sale-invoice-page"><div className="sale-page-heading"><div><Link href="/app/sales" className="sale-back"><ArrowLeft size={17} />{t('back')}</Link><h1>{invoice.number}</h1><p>{t('invoiceHint')}</p></div></div>
    <InvoiceActions invoice={invoice} businessName={app.state!.business.name} payments={payments} />
    <InvoiceDocument invoice={invoice} businessName={app.state!.business.name} payments={payments} />
    {invoice.customerId && app.state!.configuration.permissions.customers && <Link className="text-link sale-invoice-customer" href={`/app/customers/${invoice.customerId}`}>{t('openCustomer')}</Link>}
    {invoice.status !== 'cancelled' && app.state!.configuration.permissions.sales && <div className="sale-invoice-reversal"><p>{t('reversalWarning')}</p><Button variant="danger" onClick={() => setConfirm(true)}><XCircle size={17} />{t('cancelSale')}</Button></div>}
    <Sheet title={t('cancelSale')} description={t('cancellationHint')} open={confirm} onOpenChange={next => { if (!busy) setConfirm(next); }}><div className="sheet-body"><p>{invoice.number} · {money(invoice.totalPaise)}</p><p className="sale-section-hint">{t('reversalWarning')}</p><FormError message={error} /></div><div className="sheet-actions"><Button variant="secondary" disabled={busy} onClick={() => setConfirm(false)}>{t('back')}</Button><Button variant="danger" busy={busy} onClick={reverse}>{t('confirmCancel')}</Button></div></Sheet>
  </div>;
}
