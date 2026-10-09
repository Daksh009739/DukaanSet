'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Plus, Search, UserRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Customer } from '@/lib/contracts';
import { useApp } from '../app-provider';
import { Button, Field, FormError, Select, Sheet } from '../ui';
import { useSalesCopy } from './sales-copy';
import { RequestError } from '@/lib/client';

type CustomerRequest = { idempotencyKey: string; name: string; phone: string };

export function CustomerSelector({ customers, value, onChange, disabled, pending }: { customers: Customer[]; value: string; onChange: (id: string) => void; disabled: boolean; pending: boolean }) {
  const { t } = useSalesCopy();
  const { t: common } = useTranslation();
  const app = useApp();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [request, setRequest] = useState<CustomerRequest | null>(null);
  const [blocked, setBlocked] = useState(false);
  const submitting = useRef(false);
  const storageKey = `ds-draft-${app.session!.user.id}-${app.businessId}-customer`;
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (!raw) return;
      const value = JSON.parse(raw) as CustomerRequest;
      if (!value || typeof value !== 'object' || typeof value.idempotencyKey !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.idempotencyKey) || typeof value.name !== 'string' || !value.name.trim() || value.name.length > 100 || typeof value.phone !== 'string' || value.phone.length > 30) { setBlocked(true); return; }
      const restored = { idempotencyKey: value.idempotencyKey, name: value.name, phone: value.phone };
      setRequest(restored); setName(restored.name); setPhone(restored.phone);
    } catch { setBlocked(true); }
  }, [storageKey]);
  const normalized = (text: string) => text.replace(/[^0-9]/g, '');
  const matches = phone && normalized(phone) ? customers.filter(customer => normalized(customer.phone) === normalized(phone)) : [];
  const filtered = customers.filter(customer => customer.id === value || `${customer.name} ${customer.phone}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  const choose = (id: string) => { onChange(id); setOpen(false); setQuery(''); };
  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting.current || disabled || blocked) return;
    setError('');
    if (!name.trim()) { setError(t('nameRequired')); return; }
    const body = request || { idempotencyKey: crypto.randomUUID(), name: name.trim(), phone: phone.trim() };
    try { sessionStorage.setItem(storageKey, JSON.stringify(body)); } catch { setError(t('customerStorage')); return; }
    setRequest(body); submitting.current = true; setBusy(true);
    try { const customer = await app.mutation<Customer>('/customers', body); setRequest(null); try { sessionStorage.removeItem(storageKey); } catch {} choose(customer.id); }
    catch (error) {
      setError(app.errorText(error));
      if (error instanceof RequestError && error.code === 'INVALID_INPUT' && error.status === 400) { setRequest(null); try { sessionStorage.removeItem(storageKey); } catch {} }
      if (error instanceof RequestError && (error.code === 'CONFLICT' || error.code === 'IDEMPOTENCY_CONFLICT')) setBlocked(true);
    }
    finally { submitting.current = false; setBusy(false); }
  };
  return <section className="sale-section sale-customer" aria-labelledby="sale-customer-heading">
    <div className="sale-section-heading"><div><span className="sale-section-number">03</span><h2 id="sale-customer-heading">{t('customer')}</h2></div><UserRound size={19} aria-hidden /></div>
    <p className="sale-section-hint">{t('customerHint')}</p>
    <label className="sale-search sale-customer-search"><Search size={18} aria-hidden /><span className="sr-only">{t('searchCustomers')}</span><input type="search" value={query} aria-label={t('searchCustomers')} placeholder={t('searchCustomers')} disabled={disabled} onChange={event => setQuery(event.target.value)} /></label>
    <Select label={common('customer')} value={value} disabled={disabled} onChange={event => onChange(event.target.value)}><option value="">{t('walkIn')}</option>{filtered.map(customer => <option key={customer.id} value={customer.id}>{customer.name}{customer.phone ? ` · ${customer.phone}` : ''}</option>)}</Select>
    {pending && !value && <p className="sale-field-error">{t('customerRequired')}</p>}
    <button type="button" className="text-link sale-add-customer" disabled={disabled} onClick={() => { if (!request && !blocked) { setName(''); setPhone(''); setError(''); } setOpen(true); }}><Plus size={17} />{t(request ? 'retryCustomer' : 'addCustomer')}</button>
    <Sheet title={t('addCustomer')} description={t('quickAddHint')} open={open} onOpenChange={next => { if (!busy) setOpen(next); }}>
      <form onSubmit={save}><div className="sheet-body sale-quick-customer"><Field label={t('customerName')} autoComplete="name" maxLength={100} value={name} required onChange={event => setName(event.target.value)} disabled={busy || Boolean(request) || blocked} /><Field label={t('phone')} autoComplete="tel" type="tel" maxLength={30} value={phone} onChange={event => setPhone(event.target.value)} disabled={busy || Boolean(request) || blocked} />
        {(request || blocked) && <div className="sale-customer-match" role="status"><p>{t(blocked ? 'customerRecoveryInvalid' : 'customerPending')}</p>{blocked && <Link href="/app/customers" className="text-link">{common('customers')}</Link>}</div>}
        {matches.length > 0 && !request && !blocked && <div className="sale-customer-match"><p>{t('duplicateCustomer')}</p>{matches.map(customer => <button type="button" className="btn btn-secondary" key={customer.id} disabled={busy} onClick={() => choose(customer.id)}><UserRound size={16} /><span>{customer.name}<small>{t('useCustomer')}</small></span></button>)}</div>}
        <FormError message={error} /></div><div className="sheet-actions"><Button type="button" variant="secondary" onClick={() => setOpen(false)} disabled={busy}>{t('cancel')}</Button><Button type="submit" busy={busy} disabled={blocked || disabled}>{t(request ? 'retryCustomer' : 'saveCustomer')}</Button></div></form>
    </Sheet>
  </section>;
}
