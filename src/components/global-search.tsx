'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, UsersRound, ReceiptText, ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Sheet, Empty } from './ui';
import { useApp } from './app-provider';
import { ProductImage } from './inventory/product-image';
import { api, money } from '@/lib/client';
import type { Invoice } from '@/lib/contracts';
import type { InvoiceHistoryResult } from '@/lib/record-contracts';

export function GlobalSearch() {
  const app = useApp(), w = useTranslation('workspace').t, { t } = useTranslation(), [open, setOpen] = useState(false), [query, setQuery] = useState('');
  const ready = Boolean(app.state && !app.loading);
  useEffect(() => { const key = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); if (ready) setOpen(value => !value); } }; window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key); }, [ready]);
  const state = app.state, permissions = state?.configuration.permissions;
  const canReadInvoices = Boolean(permissions?.sales || permissions?.customers || permissions?.payments);
  const [lookup, setLookup] = useState<{ businessId: string; query: string; invoices: Invoice[]; error?: string } | null>(null);
  useEffect(() => {
    if (!open || !query.trim() || !app.businessId || !canReadInvoices) return;
    const controller = new AbortController(), businessId = app.businessId;
    const timer = setTimeout(() => {
      api<InvoiceHistoryResult>(`/businesses/${businessId}/invoice-history?query=${encodeURIComponent(query)}`, undefined, controller.signal)
        .then(result => { if (!controller.signal.aborted) setLookup({ businessId, query, invoices: result.invoices.slice(0, 6) }); })
        .catch(error => { if (!controller.signal.aborted) setLookup({ businessId, query, invoices: [], error: app.errorText(error) }); });
    }, 180);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [open, query, app.businessId, canReadInvoices]);
  const words = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean), matches = (text: string) => words.length > 0 && words.every(word => text.toLocaleLowerCase().includes(word));
  const products = state?.products.filter(p => matches(`${p.name} ${p.sku} ${p.barcode} ${p.variation} ${p.aliases.join(' ')} ${Object.values(p.displayNames || {}).join(' ')}`)).slice(0, 6) || [];
  const customers = permissions?.customers ? state?.customers.filter(c => matches(`${c.name} ${c.phone}`)).slice(0, 6) || [] : [];
  const currentLookup = lookup?.businessId === app.businessId && lookup.query === query ? lookup : null;
  const invoices = canReadInvoices ? currentLookup?.invoices || [] : [];
  const pending = canReadInvoices && words.length > 0 && !currentLookup;
  return <><button className="global-search-trigger" disabled={app.loading||!state} aria-label={w('globalSearchHint')} onClick={() => setOpen(true)} aria-keyshortcuts="Control+k Meta+k"><Search size={20} /><span>{w('globalSearchHint')}</span><kbd>{w('searchShortcut')}</kbd></button><Sheet title={t('search')} open={open} onOpenChange={setOpen}><div className="sheet-body global-search-results"><label className="search-box"><Search size={18} /><span className="sr-only">{w('globalSearchHint')}</span><input autoFocus maxLength={200} type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder={w('globalSearchHint')} /></label>{products.length > 0 && <section><h3>{t('stock')}</h3>{products.map(product => <Link key={product.id} href={permissions?.inventory ? `/app/stock/${product.id}` : `/app/stock?product=${product.id}`} onClick={() => setOpen(false)}><ProductImage product={product} /><span><b>{product.name}</b><small>{product.variation || product.sku}</small></span><ArrowUpRight size={16} /></Link>)}</section>}{customers.length > 0 && <section><h3>{t('customers')}</h3>{customers.map(c => <Link key={c.id} href={`/app/customers/${c.id}`} onClick={() => setOpen(false)}><UsersRound size={22} /><span><b>{c.name}</b><small>{c.phone}</small></span><ArrowUpRight size={16} /></Link>)}</section>}{invoices.length > 0 && <section><h3>{t('bills')}</h3>{invoices.map(i => <Link key={i.id} href={`/app/sales/${i.id}`} onClick={() => setOpen(false)}><ReceiptText size={22} /><span><b>{i.number} · {i.customerName || t('walkIn')}</b><small>{money(i.totalPaise)}</small></span><ArrowUpRight size={16} /></Link>)}</section>}{pending && <p role="status" className="form-note">{t('loading')}</p>}{currentLookup?.error && <p role="alert" className="form-error">{currentLookup.error}</p>}{!words.length ? <p className="form-note">{w('searchStart')}</p> : !pending && !currentLookup?.error && !products.length && !customers.length && !invoices.length && <Empty icon={<Search />} title={t('noResults')} />}</div></Sheet></>;
}
