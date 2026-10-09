'use client';
import {LocalizedDate} from '@/components/localized-data';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { ArrowUpRight, Plus, ReceiptText, Search, SlidersHorizontal } from 'lucide-react';
import { businessDay, money } from '@/lib/client';
import { useApp } from '../app-provider';
import { Empty, Field, Select } from '../ui';
import { useSalesCopy } from './sales-copy';

export function SalesHistory() {
  const { state } = useApp();
  const { t } = useSalesCopy();
  const params = useSearchParams();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [customer, setCustomer] = useState(params.get('customer') || '');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const words = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  const invalidRange = Boolean(from && to && from > to);
  const invoices = state!.invoices.filter(invoice => {
    const text = `${invoice.number} ${invoice.customerName} ${invoice.items.map(item => item.name).join(' ')}`.toLocaleLowerCase();
    const day = businessDay(invoice.date);
    return !invalidRange && (status === 'all' || invoice.status === status) && (!customer || invoice.customerId === customer) && (!from || day >= from) && (!to || day <= to) && words.every(word => text.includes(word));
  });
  const active = invoices.filter(invoice => invoice.status !== 'cancelled');
  const total = active.reduce((sum, invoice) => sum + invoice.totalPaise, 0);
  const received = active.reduce((sum, invoice) => sum + invoice.paidPaise, 0);
  const pending = active.reduce((sum, invoice) => sum + invoice.balancePaise, 0);
  const clear = () => { setQuery(''); setStatus('all'); setCustomer(''); setFrom(''); setTo(''); };
  return <div className="sale-history">
    <div className="sale-page-heading"><div><h1>{t('history')}</h1><p>{t('historyHint')}</p></div>{state!.configuration.permissions.sales&&<Link href="/app/sales/new" className="btn btn-primary"><Plus size={18} />{t('newSaleAction')}</Link>}</div>
    <div className="sale-history-metrics"><div><span>{t('total')}</span><b>{money(total)}</b></div><div><span>{t('moneyReceived')}</span><b>{money(received)}</b></div><div><span>{t('pending')}</span><b>{money(pending)}</b></div></div>
    <section className="sale-section sale-history-filters" aria-label={t('history')}>
      <label className="sale-search"><Search size={19} aria-hidden /><span className="sr-only">{t('searchSales')}</span><input type="search" aria-label={t('searchSales')} value={query} onChange={event => setQuery(event.target.value)} placeholder={t('searchSales')} /></label>
      <div className="sale-filter-grid"><Select label={t('status')} value={status} onChange={event => setStatus(event.target.value)}>{['all', 'paid', 'partial', 'unpaid', 'cancelled'].map(value => <option key={value} value={value}>{t(value)}</option>)}</Select><Select label={t('customer')} value={customer} onChange={event => setCustomer(event.target.value)}><option value="">{t('allCustomers')}</option>{state!.customers.map(item => <option value={item.id} key={item.id}>{item.name}</option>)}</Select><Field label={t('fromDate')} type="date" value={from} onChange={event => setFrom(event.target.value)} /><Field label={t('toDate')} type="date" value={to} min={from || undefined} onChange={event => setTo(event.target.value)} /></div>
      <div className="sale-filter-footer"><span><SlidersHorizontal size={14} />{t('saleCount', { count: invoices.length })}</span><button type="button" className="text-link" onClick={clear}>{t('clearFilters')}</button></div>
      {invalidRange && <p role="alert" className="sale-field-error">{t('dateRangeInvalid')}</p>}
    </section>
    {invoices.length ? <div className="sale-history-list">{invoices.map(invoice => <Link href={`/app/sales/${invoice.id}`} className={`sale-history-card ${invoice.status === 'cancelled' ? 'sale-history-cancelled' : ''}`} key={invoice.id}>
      <div className="sale-history-card-top"><div><span>{invoice.number}</span><h2>{invoice.customerName || t('walkIn')}</h2></div><span className={`sale-status sale-status-${invoice.status}`}>{t(invoice.status)}</span></div>
      <time dateTime={invoice.date}><LocalizedDate value={invoice.date} options={{ timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }}/></time>
      <p className="sale-history-products">{invoice.items.slice(0, 2).map(item => item.name).join(' · ')}{invoice.items.length > 2 ? ` +${invoice.items.length - 2}` : ''}</p>
      <dl><div><dt>{t('total')}</dt><dd>{money(invoice.totalPaise)}</dd></div><div><dt>{t('moneyReceived')}</dt><dd>{money(invoice.paidPaise)}</dd></div><div><dt>{t('moneyPending')}</dt><dd>{money(invoice.balancePaise)}</dd></div></dl>
      <span className="sale-history-open">{t('viewInvoice')}<ArrowUpRight size={16} /></span>
    </Link>)}</div> : <div className="sale-section"><Empty icon={<ReceiptText />} title={t(state!.invoices.length ? 'noSalesMatch' : 'noSales')} detail={t('noSalesHint')} action={state!.configuration.permissions.sales?<Link href="/app/sales/new" className="btn btn-secondary">{t('newSaleAction')}</Link>:undefined} /></div>}
  </div>;
}
