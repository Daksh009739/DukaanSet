'use client';
import '@/lib/v2-i18n';
import Link from 'next/link';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { money, quantity } from '@/lib/client';
import { useApp } from './app-provider';
import { PageHeading } from './dashboard';
import { Button, CardTitle } from './ui';
export function BusinessInsights() {
  const { t } = useTranslation('v2'); const { state, session } = useApp(); const [question, setQuestion] = useState(''); if (!state) return null;
  return <><PageHeading title={t('summary')} subtitle={t('rules')}/><section className="card insights-card"><span className="quick-icon mint"><Sparkles/></span><p>{t('rulesHint')}</p><div className="button-row">{['sales', 'credit', 'stock'].map(key => <Button variant={question === key ? 'primary' : 'secondary'} key={key} onClick={() => setQuestion(key)}>{t(`${key}Question`)}</Button>)}</div><div className="insights-answer" aria-live="polite">{!question ? <p>{t('askHint')}</p> : question === 'sales' ? <><CardTitle>{t('salesQuestion')}</CardTitle><strong>{money(state.metrics.salesTodayPaise, session?.user.language)}</strong><p>{t('billsToday')}: {state.metrics.billsToday} · {t('collection')}: {money(state.metrics.collectedTodayPaise, session?.user.language)}</p></> : question === 'credit' ? <><CardTitle>{t('creditQuestion')}</CardTitle>{state.customers.filter(c => c.balancePaise > 0).length ? state.customers.filter(c => c.balancePaise > 0).map(c => <Link className="record-row" href={`/app/customers/${c.id}`} key={c.id}><b>{c.name}</b><span>{money(c.balancePaise)}</span></Link>) : <p>{t('noDues')}</p>}</> : <><CardTitle>{t('stockQuestion')}</CardTitle>{state.products.filter(p => p.quantityMilli <= p.minStockMilli).length ? state.products.filter(p => p.quantityMilli <= p.minStockMilli).map(p => <Link className="record-row" href={`/app/stock?product=${p.id}`} key={p.id}><b>{p.name}</b><span>{quantity(p.quantityMilli)} {p.unit}</span></Link>) : <p>{t('noLow')}</p>}</>}</div></section></>;
}
