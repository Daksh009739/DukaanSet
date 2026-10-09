'use client';

import { Check, ArrowRight } from 'lucide-react';
import { Button, Field, FormError } from '../ui';
import { money } from '@/lib/client';
import { useSalesCopy } from './sales-copy';

export function SaleSummary({ subtotal, discount, total, paid, pending, discountValue, onDiscount, discountInvalid, count, busy, locked, disabled, onSave, error }: { subtotal: number; discount: number; total: number; paid: number; pending: number; discountValue: string; onDiscount: (value: string) => void; discountInvalid: boolean; count: number; busy: boolean; locked: boolean; disabled: boolean; onSave: () => void; error: string }) {
  const { t } = useSalesCopy();
  return <section className="sale-section sale-summary" aria-labelledby="sale-summary-heading">
    <div className="sale-section-heading"><div><span className="sale-section-number">05</span><h2 id="sale-summary-heading">{t('summary')}</h2></div><span className="sale-count">{count}</span></div>
    <Field label={t('discount')} inputMode="decimal" value={discountValue} onChange={event => onDiscount(event.target.value)} disabled={locked} />
    {discountInvalid && <p className="sale-field-error" role="alert">{t('discountInvalid')}</p>}
    <dl className="sale-totals"><div><dt>{t('subtotal')}</dt><dd>{money(subtotal)}</dd></div><div><dt>{t('discountAmount')}</dt><dd>− {money(discount)}</dd></div><div className="sale-total"><dt>{t('total')}</dt><dd>{money(total)}</dd></div><div><dt>{t('receivedTotal')}</dt><dd>{money(paid)}</dd></div><div className={`sale-pending ${pending > 0 ? 'sale-pending-due' : ''}`}><dt>{t('pending')}</dt><dd>{money(pending)}</dd></div></dl>
    <p className="sale-tax-note">{t('taxNote')}</p><FormError message={error} />
    <Button className="sale-desktop-save" busy={busy} disabled={disabled} onClick={onSave}><Check size={18} />{t(busy ? 'saving' : 'saveSale')}<ArrowRight size={18} /></Button>
    <p className="sale-section-hint sale-saving-hint">{t('savingHint')}</p>
  </section>;
}
