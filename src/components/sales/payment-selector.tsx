'use client';

import { Banknote, CreditCard, Landmark, Split } from 'lucide-react';
import { Field } from '../ui';
import { useSalesCopy } from './sales-copy';
import type { SaleDraft, SalePaymentMode } from './sale-draft';

const methods = [['cash', Banknote], ['upi', Landmark], ['credit', CreditCard], ['split', Split]] as const;

export function PaymentSelector({ draft, update, total, pending, disabled, invalid, overpaid }: { draft: SaleDraft; update: (values: Partial<SaleDraft>) => void; total: number; pending: number; disabled: boolean; invalid: boolean; overpaid: boolean }) {
  const { t } = useSalesCopy();
  const changeMode = (mode: SalePaymentMode) => update({ mode, ...(mode === 'split' && !draft.cash && !draft.upi ? { cash: draft.received || (total / 100).toFixed(2), upi: '0' } : {}) });
  return <section className="sale-section sale-payment" aria-labelledby="sale-payment-heading">
    <div className="sale-section-heading"><div><span className="sale-section-number">04</span><h2 id="sale-payment-heading">{t('payment')}</h2></div></div>
    <div className="sale-payment-modes" role="group" aria-label={t('payment')}>{methods.map(([mode, Icon]) => <button type="button" key={mode} disabled={disabled} aria-pressed={draft.mode === mode} className={draft.mode === mode ? 'sale-method-active' : ''} onClick={() => changeMode(mode)}><Icon size={20} aria-hidden /><span>{t(mode)}</span></button>)}</div>
    {draft.mode === 'credit' ? <p className="sale-credit-hint">{t('creditHint')}</p> : draft.mode === 'split' ? <div className="sale-split-fields"><Field label={t('cashReceived')} inputMode="decimal" value={draft.cash} placeholder="0" disabled={disabled} onChange={event => update({ cash: event.target.value })} /><Field label={t('upiReceived')} inputMode="decimal" value={draft.upi} placeholder="0" disabled={disabled} onChange={event => update({ upi: event.target.value })} /></div> : <Field label={t('received')} inputMode="decimal" value={draft.received} placeholder={(total / 100).toFixed(2)} disabled={disabled} onChange={event => update({ received: event.target.value })} />}
    {invalid && <p className="sale-field-error" role="alert">{t('amountInvalid')}</p>}
    {overpaid && <p className="sale-field-error" role="alert">{t('overpayment')}</p>}
    <p className="sale-section-hint sale-payment-note">{t('paymentNote')}</p>
    {pending > 0 && <Field label={t('dueDate')} type="date" value={draft.dueDate} disabled={disabled} onChange={event => update({ dueDate: event.target.value })} />}
  </section>;
}
