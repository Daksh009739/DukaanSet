'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, Package, RefreshCw, Save, ShieldCheck, ShoppingBag } from 'lucide-react';
import type { Invoice, SaleAttachment } from '@/lib/contracts';
import { money, minorUnits, RequestError } from '@/lib/client';
import { useApp } from '../app-provider';
import { Button } from '../ui';
import { useSalesCopy } from './sales-copy';
import { calculateSale, type PendingSale } from './sale-draft';
import { useSaleDraft } from './use-sale-draft';
import { ProductSelector } from './product-selector';
import { SelectedSaleItem } from './selected-sale-item';
import { CustomerSelector } from './customer-selector';
import { PaymentSelector } from './payment-selector';
import { SaleSummary } from './sale-summary';
import { SaleSuccess } from './sale-success';
import { removePendingPhoto } from './sale-photo-uploader';
import { useTranslation } from 'react-i18next';

export function NewSalePage() {
  const app = useApp();
  const state = app.state!;
  const { t } = useSalesCopy();
  const params = useSearchParams();
  const v=useTranslation('v3').t;const demand=state.configuration.features.demandPulse&&state.configuration.permissions.demand?state.demand.requestsList.find(request=>request.id===params.get('demand')):undefined;
  const storageKey = `ds-draft-${app.session!.user.id}-${app.businessId}`;
  const { draft, setDraft, update, clear, complete, remember, freeze, reject, markConflict, hydrated, storageError } = useSaleDraft(storageKey, app.businessId);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [contextHint, setContextHint] = useState('');
  const [contextCustomer, setContextCustomer] = useState('');
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Invoice | null>(null);
  const submitting = useRef(false);
  const preselected = useRef(false);

  useEffect(() => {
    if (!hydrated || preselected.current || draft.pendingSale || draft.recoveryBlocked) return;
    preselected.current = true;
    const product = state.products.find(item => item.id === params.get('product'));
    const customer = state.customers.find(item => item.id === params.get('customer'));
    if (draft.savedInvoiceId && (product || customer)) update({ savedInvoiceId: '' });
    if (product && !draft.items[product.id]) {const amount=demand?.productId===product.id&&!Object.keys(draft.items).length?Math.min(demand.remainingMilli,product.quantityMilli):1000;update({ items: { ...draft.items, [product.id]: amount>0?String(amount/1000):'1' } }); setContextHint(product.name); }
    if (customer && !draft.customerId) update({ customerId: customer.id });
    else if (customer && customer.id !== draft.customerId) setContextCustomer(customer.id);
  }, [draft, hydrated, params, state.customers, state.products, update]);

  const totals = calculateSale(draft, state.products);
  const preview = draft.pendingSale?.totals || totals;
  const locked = busy || Boolean(draft.pendingSale) || draft.recoveryBlocked;
  const frequency = new Map<string, number>();
  state.invoices.filter(invoice => invoice.status !== 'cancelled').forEach(invoice => invoice.items.forEach(item => frequency.set(item.productId, (frequency.get(item.productId) || 0) + 1)));
  const frequentIds = [...frequency.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([id]) => id);
  const customer = state.customers.find(item => item.id === draft.customerId);
  const uploadsActive = Object.values(uploading).some(Boolean);
  const savedInvoice = saved || state.invoices.find(invoice => invoice.id === draft.savedInvoiceId);
  const valid = hydrated && totals.items.length > 0 && totals.quantityValid && totals.discountValid && totals.paymentValid && !totals.overpaid && (totals.pending === 0 || Boolean(customer));
  const add = (id: string) => {
    if (locked || submitting.current) return;
    setError(''); setDraft(previous => {
      let count = 0; try { count = minorUnits(previous.items[id] || '0', 3); } catch {}
      return { ...previous, items: { ...previous.items, [id]: String((count + 1000) / 1000) } };
    });
  };
  const remove = (id: string) => {
    if (locked || submitting.current) return;
    draft.attachments[id]?.forEach(photo => { void removePendingPhoto(app.businessId, photo.id).catch(() => {}); });
    setDraft(previous => { const items = { ...previous.items }; const attachments = { ...previous.attachments }; delete items[id]; delete attachments[id]; return { ...previous, items, attachments }; });
    setUploading(previous => { const next = { ...previous }; delete next[id]; return next; });
  };
  const attach = (id: string, attachment?: SaleAttachment) => setDraft(previous => ({ ...previous, attachments: { ...previous.attachments, [id]: attachment ? [attachment] : [] } }));
  const clearSale = () => { if (locked || submitting.current) return; Object.values(draft.attachments).flat().forEach(photo => { void removePendingPhoto(app.businessId, photo.id).catch(() => {}); }); clear(); setError(''); setContextHint(''); setContextCustomer(''); setUploading({}); setSaved(null); };
  const save = async () => {
    if (submitting.current || draft.recoveryBlocked || draft.pendingSale?.conflict) return;
    setError('');
    if (!draft.pendingSale && !valid) { setError(t(!totals.items.length ? 'missingItems' : totals.pending > 0 && !customer ? 'customerRequired' : 'amountInvalid')); return; }
    if (uploadsActive) { setError(t('uploadingHint')); return; }
    if (!app.online) { setError(t('offline')); return; }
    const pendingSale: PendingSale = draft.pendingSale || {
      request: { idempotencyKey: draft.key, customerId: draft.customerId || null,
        items: totals.items.map(item => ({ productId: item.product.id, quantityMilli: item.quantityMilli, attachmentIds: (draft.attachments[item.product.id] || []).map(photo => photo.id) })),
        discountPaise: totals.discount, payments: [{ method: 'cash' as const, amountPaise: totals.cash }, { method: 'upi' as const, amountPaise: totals.upi }].filter(payment => payment.amountPaise > 0), dueDate: draft.dueDate || null },
      totals: { subtotal: totals.subtotal, discount: totals.discount, total: totals.total, cash: totals.cash, upi: totals.upi, paid: totals.paid, pending: totals.pending }, conflict: false,
    };
    if (!freeze(pendingSale)) { setError(t('storageRequired')); return; }
    submitting.current = true; setBusy(true);
    try {
      const invoice = await app.mutation<Invoice>('/invoices', pendingSale.request);
      complete(invoice.id); setSaved(invoice);
    } catch (error) {
      setError(app.errorText(error));
      if (error instanceof RequestError && error.status >= 400 && error.status < 500) {
        // These rejections cannot follow a committed matching request: once() replays it before checking stock or attachments.
        const definitive = ['INVALID_INPUT', 'INVALID_DISCOUNT', 'OVERPAYMENT', 'CUSTOMER_REQUIRED', 'DUPLICATE_PAYMENT', 'PAYMENT_MISMATCH', 'DUPLICATE_ATTACHMENT', 'FRACTIONAL_UNIT', 'AMOUNT_TOO_LARGE', 'INSUFFICIENT_STOCK', 'ATTACHMENT_LOCKED', 'DAY_CLOSED'];
        if (definitive.includes(error.code)) reject();
        else if (error.code === 'IDEMPOTENCY_CONFLICT' || error.code === 'CONFLICT') markConflict(pendingSale);
        if (error.code === 'INSUFFICIENT_STOCK') await app.refresh();
      }
    } finally { submitting.current = false; setBusy(false); }
  };

  if (savedInvoice) return <><SaleSuccess invoice={savedInvoice} businessName={state.business.name} onNew={clearSale} />{demand&&<section className="card below-card"><p>{v('linkHint')}</p><Link className="btn btn-secondary" href={`/app/demand?request=${demand.id}&invoice=${savedInvoice.id}#request-${demand.id}`}>{v('linkSale')}</Link></section>}</>;
  return <div className="sale-editor" data-sale-editor>
    <div className="sale-page-heading"><div><Link href="/app/sales" className="sale-back"><ArrowLeft size={17} />{t('back')}</Link><h1>{t('newSale')}</h1><p>{t('saleHint')}</p></div><button type="button" className="sale-draft-button" aria-label={t('saveDraft')} disabled={!hydrated || locked} onClick={() => { if (remember(draft)) app.notify(t('draftSaved')); }}><Save size={16} /><span>{t('saveDraft')}</span></button></div>
    <div className="sale-draft-status"><span><span className="sale-status-dot" />{draft.recoveryBlocked ? t('pendingTitle') : storageError ? t('draftWarning') : t('draftSaved')}</span><button type="button" disabled={locked || uploadsActive} onClick={clearSale}>{t('clearDraft')}</button></div>
    {(draft.pendingSale || draft.recoveryBlocked) && <section className="sale-recovery" aria-labelledby="sale-recovery-title" role="status"><div><ShieldCheck size={22} /><div><h2 id="sale-recovery-title">{t('pendingTitle')}</h2><p>{t(draft.recoveryBlocked ? 'recoveryInvalid' : draft.pendingSale?.conflict ? 'conflictHint' : 'pendingHint')}</p></div></div><div className="sale-recovery-actions">{draft.pendingSale && !draft.pendingSale.conflict && <Button className="sale-recovery-retry" busy={busy} disabled={busy || !app.online} onClick={() => void save()}><RefreshCw size={17} />{t('retrySale')}</Button>}<Link href="/app/sales">{t('reviewHistory')}</Link></div></section>}
    {contextHint && <p className="sale-context-note" role="status"><Package size={17} />{t('productAdded', { name: contextHint })}</p>}
    {demand&&<p className="sale-context-note">{v('demandTitle')} · {demand.productName} {demand.variant} · {v('linkHint')}</p>}
    {contextCustomer && <div className="sale-context-note"><p>{t('contextCustomer', { name: state.customers.find(item => item.id === contextCustomer)?.name })}</p><button type="button" className="text-link" disabled={locked} onClick={() => { update({ customerId: contextCustomer }); setContextCustomer(''); }}>{t('useCustomer')}</button></div>}
    <div className="sale-layout"><div className="sale-main-column">
      <ProductSelector products={state.products} category={state.business.category} selected={draft.items} onAdd={add} disabled={locked || !hydrated} frequentIds={frequentIds} />
      <section className="sale-section sale-items" aria-labelledby="sale-items-heading"><div className="sale-section-heading"><div><span className="sale-section-number">02</span><h2 id="sale-items-heading">{t('selectedItems')}</h2></div><span className="sale-count">{totals.items.length}</span></div>
        {totals.items.length ? totals.items.map(item => <SelectedSaleItem key={item.product.id} product={item.product} value={item.value} total={item.totalPaise} error={draft.pendingSale ? '' : item.error} category={state.business.category} attachment={draft.attachments[item.product.id]?.[0]} disabled={locked}
          onValue={value => update({ items: { ...draft.items, [item.product.id]: value } })} onIncrease={() => add(item.product.id)} onDecrease={() => { const next = Number(item.value) - 1; if (next > 0) update({ items: { ...draft.items, [item.product.id]: String(next) } }); else remove(item.product.id); }} onRemove={() => remove(item.product.id)} onAttachment={photo => attach(item.product.id, photo)} onUploading={value => setUploading(previous => ({ ...previous, [item.product.id]: value }))} />) : <div className="sale-empty"><ShoppingBag size={32} /><h3>{t('emptySale')}</h3><p>{t('emptyHint')}</p></div>}
      </section>
    </div><div className="sale-side-column">
      <CustomerSelector customers={state.customers} value={draft.customerId} onChange={customerId => update({ customerId })} disabled={locked} pending={preview.pending > 0} />
      <PaymentSelector draft={draft} update={update} total={preview.total} pending={preview.pending} disabled={locked} invalid={!totals.paymentValid} overpaid={totals.overpaid} />
      <SaleSummary subtotal={preview.subtotal} discount={preview.discount} total={preview.total} paid={preview.paid} pending={preview.pending} discountValue={draft.discount} onDiscount={discount => update({ discount })} discountInvalid={!totals.discountValid} count={totals.items.length} busy={busy} locked={locked} disabled={locked || !valid || uploadsActive || !app.online} onSave={() => void save()} error={error} />
    </div></div>
    {uploadsActive && <p className="sale-field-error">{t('uploadingHint')}</p>}
    <div className="sale-mobile-action"><div><small>{t('total')}</small><b>{money(preview.total)}</b>{preview.pending > 0 && <span>{t('moneyPending')} {money(preview.pending)}</span>}</div><Button busy={busy} disabled={draft.recoveryBlocked || draft.pendingSale?.conflict || busy || (!draft.pendingSale && !valid) || uploadsActive || !app.online} onClick={() => void save()}><Check size={18} />{t(busy ? 'saving' : draft.pendingSale ? 'retrySale' : 'saveSale')}</Button></div>
  </div>;
}
