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
import {useTranslation} from 'react-i18next';
import type {DocumentModel} from '@/lib/document-contracts';
import {DetailHeader,DetailMetrics,Disclosure} from '../detail-patterns';
import {useOperations} from '../operations';
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

export function SaleInvoicePage({id}:{id:string}) {
 const {t}=useSalesCopy(),w=useTranslation('workspace').t,common=useTranslation().t,app=useApp(),open=useOperations();
 const [source,setSource]=useState<DocumentModel|null>(null),[confirm,setConfirm]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const invoice=source?.invoice||app.state!.invoices.find(i=>i.id===id);
 useEffect(()=>{setSource(null);const c=new AbortController();void api<DocumentModel>(`/businesses/${app.businessId}/invoices/${id}/snapshot`,undefined,c.signal).then(setSource).catch(cause=>{if(!c.signal.aborted)setError(app.errorText(cause));});return()=>c.abort();},[id,app.businessId,app.state]);
 if(!invoice)return <Empty icon={<ReceiptText/>} title={error||w('loadingRecord')} action={<Link className="btn btn-secondary" href="/app/sales">{t('back')}</Link>}/>;
 const payments=invoice.payments||[],p=app.state!.configuration.permissions;
 const reverse=async()=>{setBusy(true);setError('');try{await app.mutation(`/invoices/${id}/cancel`,{});setConfirm(false);}catch(cause){setError(app.errorText(cause));}finally{setBusy(false);}};
 return <div className="sale-invoice-page"><DetailHeader title={invoice.number} subtitle={invoice.customerName||t('walkIn')} back="/app/sales" status={<span className={`sale-status sale-status-${invoice.status}`}>{t(invoice.status)}</span>} actions={invoice.balancePaise>0&&invoice.customerId&&p.payments&&<Button onClick={()=>open('payment',{customerId:invoice.customerId!,invoiceId:id})}>{common('addPayment')}</Button>}/>
  <DetailMetrics items={[{label:t('total'),value:money(invoice.totalPaise),primary:true},{label:t('moneyReceived'),value:money(invoice.paidPaise)},{label:t('pending'),value:money(invoice.balancePaise)}]}/>
  {p.sales&&<InvoiceActions invoice={invoice} businessName={source?.merchant.name||app.state!.business.name} payments={payments}/>}
  <section className="card detail-items-list"><h2>{t('items')}</h2>{invoice.items.map((item,index)=><div className="record-row" key={item.productId+index}><div><b>{item.name}</b>{item.variation&&<small>{item.variation}</small>}<small>{quantity(item.quantityMilli)} <LocalizedUnit value={item.unit}/> × {money(item.pricePaise)}</small></div><b>{money(item.totalPaise)}</b></div>)}</section>
  {invoice.customerId&&p.customers&&<Link className="text-link below-card" href={`/app/customers/${invoice.customerId}`}>{t('openCustomer')}</Link>}
  <Disclosure title={w('financialDetails')}><InvoiceDocument invoice={invoice} businessName={source?.merchant.name||app.state!.business.name} payments={payments}/>{source?.invoice&&<p className="form-note">{t('documents:issuedPayment')}: {money(source.invoice.originalPaidPaise)} · {t('documents:issuedDue')}: {money(source.invoice.originalBalancePaise)}</p>}{invoice.status!=='cancelled'&&p.sales&&<div className="sale-invoice-reversal"><p>{t('reversalWarning')}</p><Button variant="danger" onClick={()=>setConfirm(true)}><XCircle size={17}/>{t('cancelSale')}</Button></div>}</Disclosure><FormError message={error}/>
  <Sheet title={t('cancelSale')} description={t('cancellationHint')} open={confirm} onOpenChange={value=>{if(!busy)setConfirm(value);}}><div className="sheet-body"><p>{invoice.number} · {money(invoice.totalPaise)}</p><p className="sale-section-hint">{t('reversalWarning')}</p><FormError message={error}/></div><div className="sheet-actions"><Button variant="secondary" disabled={busy} onClick={()=>setConfirm(false)}>{t('back')}</Button><Button variant="danger" busy={busy} onClick={reverse}>{t('confirmCancel')}</Button></div></Sheet>
 </div>;
}
