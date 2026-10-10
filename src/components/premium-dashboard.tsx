'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight, ShoppingCart, Wallet, Package, CheckCircle2, ReceiptText, CalendarDays, Clock3, AlertTriangle, MessageSquare } from 'lucide-react';
import { useApp } from './app-provider';
import { useOperations } from './operations';
import { Button, CardTitle, Sheet, Empty } from './ui';
import { money } from '@/lib/client';
import { dateText } from '@/lib/locale';
import { taskText, taskHref } from '@/lib/presentation';
import {ContextualVoiceOSHero} from './voice/contextual-voiceos-hero';
import { SalesOverviewChart, TradingSessionCard, AIInsightsPanel, TopProductsPanel } from './dashboard-panels';

export function PremiumDashboard() {
  const app = useApp(), { t, i18n } = useTranslation(), w = useTranslation('workspace').t, open = useOperations(), [more, setMore] = useState(false), state = app.state!;
  const p = state.configuration.permissions, f = state.configuration.features, closing = state.closing, timezone = closing?.session.timezone || 'Asia/Kolkata';
  const hour = Number(new Intl.DateTimeFormat('en', { hour: 'numeric', hourCycle: 'h23', timeZone: timezone }).format(new Date()));
  const greeting = w(hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening', { name: app.session!.user.name.split(' ')[0] });
  const metrics = [
    { label: closing && closing.session.businessDate !== closing.today ? w('sessionSales') : t('salesToday'), value: money(state.metrics.salesTodayPaise), hint: `${state.metrics.billsToday} ${t('billsToday')}`, icon: ShoppingCart, tone: 'mint', visible: p.reports },
    { label: closing && closing.session.businessDate !== closing.today ? w('sessionCollections') : w('moneyReceivedToday'), value: money(state.metrics.collectedTodayPaise), hint: w('paymentsBreakdown'), icon: Wallet, tone: 'blue', visible: p.reports },
    { label: w('moneyToCollect'), value: money(state.metrics.outstandingPaise), hint: t('dueNotOverdue'), icon: Clock3, tone: 'amber', visible: p.reports },
    { label: t('lowStock'), value: state.metrics.lowStockCount, hint: t('reviewStock'), icon: Package, tone: 'purple', visible: p.inventory },
  ].filter(m => m.visible);
  const tasks = [...state.tasks].sort((a, b) => ({ expiry: 0, credit: 1, stock: 2, demand: 3 }[a.type] - { expiry: 0, credit: 1, stock: 2, demand: 3 }[b.type]));
  return <div className="premium-dashboard approved-dashboard"><header className="dashboard-welcome"><span className="greeting-hand" aria-hidden>👋</span><div><h1>{greeting}</h1><p>{w('overview')}</p></div><div className="dashboard-date"><CalendarDays size={24} /><div><b>{dateText(new Date(), i18n.language, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: timezone })}</b><small>{state.business.name}</small></div></div></header>
    <ContextualVoiceOSHero variant="minimal"/>
    <div className="dashboard-metrics detail-metrics">{metrics.map(({ icon: Icon, ...metric }) => <div className={`summary-metric ${metric.tone}`} key={metric.tone}><span className="summary-icon" aria-hidden><Icon size={27} /></span><div><dl><dt>{metric.label}</dt><dd>{metric.value}</dd></dl><small>{metric.hint}</small>{metric.tone === 'purple' && state.metrics.lowStockCount > 0 && <Link className="metric-link" aria-label={t('reviewStock')} href="/app/stock?filter=low"><ArrowUpRight size={20} /></Link>}</div></div>)}</div>
    <div className="dashboard-main-grid">{p.reports && <SalesOverviewChart />}<TradingSessionCard onMore={() => setMore(true)} />{p.reports && <AIInsightsPanel />}</div>
    <div className="dashboard-focus-grid"><section className="card dashboard-work"><CardTitle action={<Link className="text-link" href="/app/todays-work">{t('seeAll')}<ArrowUpRight size={15} /></Link>}>{t('work')}</CardTitle>{closing?.latest?.verification === 'pending' && <Link className="task-row" href={`/app/reports/closings/${closing.latest.session.id}`}><span className="task-icon amber"><Clock3 size={18} /></span><div><b>{w('pendingCount')}</b><p>{w('verifyCash')}</p></div><ArrowUpRight size={16} /></Link>}{f.todaysWork && tasks.length ? tasks.slice(0, 4).map(task => <Link className="task-row" href={taskHref(task)} key={task.id}><span className={`task-icon ${task.type === 'credit' ? 'amber' : task.type === 'expiry' ? 'rose' : 'mint'}`}>{task.type === 'credit' ? <Wallet size={18} /> : task.type === 'demand' ? <MessageSquare size={18} /> : task.type === 'expiry' ? <AlertTriangle size={18} /> : <Package size={18} />}</span><div><b>{t(task.type === 'credit' ? 'taskCredit' : task.type === 'demand' ? 'taskDemand' : task.type === 'expiry' ? 'taskExpiry' : 'taskStock')}</b><p>{taskText(task, t, i18n.language)}</p></div><ArrowUpRight size={16} /></Link>) : <Empty icon={<CheckCircle2 />} title={t('allSet')} detail={t('noTasks')} />}</section>
      <section className="card dashboard-recent"><CardTitle action={<Link className="text-link" href="/app/sales">{t('seeAll')}<ArrowUpRight size={15} /></Link>}>{t('recentBills')}</CardTitle>{p.sales && state.invoices.length ? state.invoices.slice(0, 4).map(invoice => <Link className="dashboard-bill-row" href={`/app/sales/${invoice.id}`} key={invoice.id}><span className="invoice-icon"><ReceiptText size={20} /></span><div><b>{invoice.customerName || t('walkIn')}</b><small>{invoice.number} · {dateText(invoice.date, i18n.language, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}</small></div><div><b>{money(invoice.totalPaise)}</b><span className={`badge badge-${invoice.status}`}>{t(invoice.status)}</span></div><ArrowUpRight size={15} /></Link>) : <Empty icon={<ReceiptText />} title={t('noBills')} detail={t('noBillsHint')} />}</section>{p.reports && <TopProductsPanel />}</div>
    <Sheet title={w('moreActions')} open={more} onOpenChange={setMore}><div className="sheet-body more-actions-list">{p.inventory && <Button variant="secondary" onClick={() => { setMore(false); open('product'); }}>{t('addProduct')}</Button>}{p.customers && <Button variant="secondary" onClick={() => { setMore(false); open('customer'); }}>{t('addCustomer')}</Button>}{p.purchases && <Link className="btn btn-secondary" href="/app/purchases" onClick={() => setMore(false)}>{t('newPurchase')}</Link>}{p.reports && <><Button variant="secondary" onClick={() => { setMore(false); open('expense'); }}>{t('addExpense')}</Button><Link className="btn btn-secondary" href="/app/reports" onClick={() => setMore(false)}>{t('reports')}</Link></>}{p.demand && f.demandPulse && <Link className="btn btn-secondary" href="/app/demand">DemandPulse</Link>}</div></Sheet>
  </div>;
}
