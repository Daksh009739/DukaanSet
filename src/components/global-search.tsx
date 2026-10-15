'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Search, UsersRound, ReceiptText, ArrowUpRight, Package, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Sheet, Empty } from './ui';
import { useApp } from './app-provider';
import { ProductImage } from './inventory/product-image';
import { api, money } from '@/lib/client';
import type { Invoice } from '@/lib/contracts';
import type { InvoiceHistoryResult } from '@/lib/record-contracts';
import styles from './workspace-overlays.module.css';

export function GlobalSearch() {
  const app = useApp(), w = useTranslation('workspace').t, { t } = useTranslation(), [open, setOpen] = useState(false), [query, setQuery] = useState('');
  const trigger=useRef<HTMLButtonElement|null>(null),returnFocus=useRef<HTMLElement|null>(null);
  const ready = Boolean(app.state && !app.loading);
  useEffect(() => { const key = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); if (ready) setOpen(value => {if(!value)returnFocus.current=document.activeElement instanceof HTMLElement?document.activeElement:trigger.current;return !value;}); } }; window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key); }, [ready]);
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
  const quickLinks = [
    {label:t('stock'),href:'/app/stock',icon:Package,allowed:permissions?.inventory},
    {label:t('customers'),href:'/app/customers',icon:UsersRound,allowed:permissions?.customers},
    {label:t('bills'),href:'/app/sales',icon:ReceiptText,allowed:permissions?.sales},
  ].filter(link=>link.allowed);
  const resultCount = products.length + customers.length + invoices.length;
  return <>
    <button ref={trigger} className="global-search-trigger" disabled={!ready} aria-label={w('globalSearchHint')} onClick={() => {returnFocus.current=trigger.current;setOpen(true);}} aria-keyshortcuts="Control+k Meta+k"><Search size={20} /><span>{w('globalSearchHint')}</span><kbd>{w('searchShortcut')}</kbd></button>
    <Sheet title={w('overlays.searchTitle')} description={w('overlays.searchDescription')} headerIcon={<Search size={22}/>} className={styles.dialog} overlayClassName={styles.overlay} returnFocusRef={returnFocus} hideLanguage open={open} onOpenChange={setOpen}>
      <div className={styles.searchForm}>
        <div className={styles.searchField}><Search size={21} aria-hidden/><label className="sr-only" htmlFor="workspace-search">{w('globalSearchHint')}</label><input id="workspace-search" autoFocus maxLength={200} type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder={w('globalSearchHint')} aria-describedby="workspace-search-hint"/>{query&&<button type="button" aria-label={w('overlays.clearSearch')} onClick={()=>{setQuery('');document.getElementById('workspace-search')?.focus();}}><X size={16}/></button>}</div>
        <p id="workspace-search-hint" className={styles.searchHint}>{w('searchStart')}</p>
      </div>
      <div className={`sheet-body ${styles.body}`}>
        {!words.length&&quickLinks.length>0&&<section><div className={styles.sectionHeading}><h3>{w('overlays.quickLinks')}</h3></div><div className={styles.quickLinks}>{quickLinks.map(({icon:Icon,...link})=><Link className={styles.quickLink} key={link.href} href={link.href} onClick={()=>setOpen(false)}><Icon size={22} aria-hidden/><span>{link.label}</span></Link>)}</div></section>}
        {products.length>0&&<section className={styles.resultGroup}><div className={styles.sectionHeading}><h3>{t('stock')}</h3><span className={styles.count}>{products.length}</span></div>{products.map(product=><Link className={styles.result} key={product.id} href={permissions?.inventory?`/app/stock/${product.id}`:`/app/stock?product=${product.id}`} onClick={()=>setOpen(false)}><ProductImage product={product}/><span className={styles.resultText}><b>{product.displayNames?.[app.session?.user.language||'en']||product.name}</b><small>{product.variation||product.sku}</small></span><ArrowUpRight size={17} aria-hidden/></Link>)}</section>}
        {customers.length>0&&<section className={styles.resultGroup}><div className={styles.sectionHeading}><h3>{t('customers')}</h3><span className={styles.count}>{customers.length}</span></div>{customers.map(customer=><Link className={styles.result} key={customer.id} href={`/app/customers/${customer.id}`} onClick={()=>setOpen(false)}><span className={styles.resultIcon}><UsersRound size={20} aria-hidden/></span><span className={styles.resultText}><b>{customer.name}</b><small>{customer.phone}</small></span><ArrowUpRight size={17} aria-hidden/></Link>)}</section>}
        {invoices.length>0&&<section className={styles.resultGroup}><div className={styles.sectionHeading}><h3>{t('bills')}</h3><span className={styles.count}>{invoices.length}</span></div>{invoices.map(invoice=><Link className={styles.result} key={invoice.id} href={`/app/sales/${invoice.id}`} onClick={()=>setOpen(false)}><span className={styles.resultIcon}><ReceiptText size={20} aria-hidden/></span><span className={styles.resultText}><b>{invoice.number} · {invoice.customerName||t('walkIn')}</b><small>{money(invoice.totalPaise)}</small></span><ArrowUpRight size={17} aria-hidden/></Link>)}</section>}
        {pending&&<p role="status" className="form-note">{t('loading')}</p>}
        {currentLookup?.error&&<p role="alert" className="form-error">{currentLookup.error}</p>}
        {words.length>0&&!pending&&!currentLookup?.error&&!resultCount&&<div className={styles.empty}><Empty icon={<Search/>} title={t('noResults')} detail={w('overlays.noResultsHint')}/></div>}
      </div>
      <div className={styles.footer}><span role="status" aria-live="polite">{words.length?pending?t('loading'):w('overlays.resultCount',{count:resultCount}):w('overlays.activeShop',{shop:state?.business.name})}</span><span><kbd>{w('overlays.escapeKey')}</kbd> {w('overlays.toClose')}</span></div>
    </Sheet>
  </>;
}
