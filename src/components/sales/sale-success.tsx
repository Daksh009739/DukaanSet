'use client';

import Link from 'next/link';
import { ArrowRight, Check, CheckCircle2, PackageCheck, UserRound } from 'lucide-react';
import type { Invoice } from '@/lib/contracts';
import { money } from '@/lib/client';
import { Button } from '../ui';
import { useSalesCopy } from './sales-copy';
import { InvoiceActions } from './invoice-actions';
import { InvoiceDocument } from './invoice';

export function SaleSuccess({ invoice, businessName, onNew }: { invoice: Invoice; businessName: string; onNew: () => void }) {
  const { t } = useSalesCopy();
  return <div className="sale-success" data-sale-success>
    <div className="sale-success-mark"><CheckCircle2 size={38} strokeWidth={1.6} /></div><span className="sale-success-eyebrow">{businessName}</span>
    <h1 tabIndex={-1}>{t('savedTitle')}</h1><p>{t('savedHint')}</p>
    <div className="sale-success-receipt"><div className="sale-success-number"><span>{t('invoiceNumber')}</span><b>{invoice.number}</b><span className={`sale-status sale-status-${invoice.status}`}>{t(invoice.status)}</span></div>
      <dl><div><dt>{t('total')}</dt><dd>{money(invoice.totalPaise)}</dd></div><div><dt>{t('receivedTotal')}</dt><dd>{money(invoice.paidPaise)}</dd></div><div><dt>{t('pending')}</dt><dd>{money(invoice.balancePaise)}</dd></div></dl>
      <div className="sale-stock-confirmation"><PackageCheck size={18} /><span>{t('stockUpdated')}</span><Check size={16} /></div>
    </div>
    <div className="sale-success-primary"><Link href={`/app/sales/${invoice.id}`} className="btn btn-primary">{t('viewInvoice')}<ArrowRight size={17} /></Link><Button variant="secondary" onClick={onNew}>{t('anotherSale')}</Button></div>
    {invoice.customerId && <Link href={`/app/customers/${invoice.customerId}`} className="text-link"><UserRound size={17} />{t('openCustomer')}</Link>}
    <InvoiceActions invoice={invoice} businessName={businessName} />
    <Link href="/app" className="text-link sale-success-dashboard">{t('dashboard')}<ArrowRight size={15} /></Link>
    <div className="sale-success-print-only"><InvoiceDocument invoice={invoice} businessName={businessName} payments={invoice.payments || []} /></div>
  </div>;
}
