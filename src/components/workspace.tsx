'use client';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { AppProvider, useApp } from './app-provider';
import { AppShell } from './app-shell';
import { OperationsProvider } from './operations';
import { Dashboard } from './dashboard';
import { BillingPage, SalesPage, InvoicePage } from './billing';
import { StockPage, CustomersPage, PurchasesPage, ExpensesPage, WorkPage, ReportsPage, ClosingPage, SettingsPage, AiPage, HelpPage } from './business-pages';
import { Empty } from './ui';
import { CircleHelp } from 'lucide-react';
import Link from 'next/link';
import { VoiceStockPage, VoiceHistoryPage } from './voice/voice-stock';

function Screen({slug}: {slug:string[]}) {
  const app=useApp();const {t}=useTranslation();const search=useSearchParams();const [section,id]=slug;
  const screen=section===undefined?<Dashboard/>:section==='sales'?(id==='new'?<BillingPage/>:id?<InvoicePage id={id}/>:<SalesPage/>):section==='stock'&&id==='voice'?<VoiceStockPage/>:section==='stock'&&id==='voice-history'?<VoiceHistoryPage/>:section==='stock'||section==='products'?<StockPage history={id==='history'} initialFilter={search.get('filter')||'all'} initialQuery={app.state?.products.find(p=>p.id===search.get('product'))?.name||''}/>:section==='customers'?<CustomersPage id={id}/>:section==='purchases'?<PurchasesPage/>:section==='suppliers'?<PurchasesPage suppliers/>:section==='payments'?<ExpensesPage payments/>:section==='expenses'?<ExpensesPage/>:section==='reports'?<ReportsPage/>:section==='todays-work'?<WorkPage/>:section==='daily-closing'?<ClosingPage/>:section==='settings'?<SettingsPage section={id}/>:section==='ai'?<AiPage/>:section==='help'?<HelpPage/>:<Empty icon={<CircleHelp/>} title={t('notFound')} detail={t('notFoundHint')} action={<Link href="/app">{t('returnHome')}</Link>}/>;
  return <AppShell><OperationsProvider key={`${app.businessId}-${app.resetEpoch}`}><div key={`${app.businessId}-${app.resetEpoch}-${slug.join('/')}-${search.toString()}`}>{screen}</div></OperationsProvider></AppShell>;
}
export function Workspace({slug}: {slug:string[]}) {return <AppProvider><Screen slug={slug}/></AppProvider>;}
