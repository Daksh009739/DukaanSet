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
import { DemandWrites,WriteRecoveryNotice } from './demand/write-provider';
import { DemandPage } from './demand/demand-page';
import { SaaSSettings } from './saas-settings';
import type { Permission,ModuleKey } from '@/lib/v3-contracts';
import './v3.css';
import { VoiceOSProvider } from './voice/voice-os-provider';
import type { ReactNode } from 'react';

function Screen({slug}: {slug:string[]}) {
  const app=useApp();const {t}=useTranslation();const search=useSearchParams();const [section,id]=slug;
  const v=useTranslation('v3').t;const configuration=app.state?.configuration;
  const required:Partial<Record<string,Permission>>={sales:'sales',customers:'customers',purchases:'purchases',suppliers:'purchases',payments:'payments',expenses:'reports',reports:'reports','daily-closing':'reports',demand:'demand',ai:'reports',...(section==='stock'&&id?{stock:'inventory' as Permission}:{}),...(section==='settings'&&id==='team'?{settings:'team' as Permission}:section==='settings'&&id==='features'?{settings:'settings' as Permission}:{})};
  const module:ModuleKey|undefined=section==='demand'?'demandPulse':section==='ai'?'assistant':section==='daily-closing'?'dailyClosing':section==='todays-work'?'todaysWork':section==='stock'&&id?.startsWith('voice')?'voiceStock':undefined;
  const invoiceRead=section==='sales'&&id!=='new'&&Boolean(configuration&&(configuration.permissions.sales||configuration.permissions.customers||configuration.permissions.payments));
  const denied=Boolean(configuration&&((section&&required[section]&&!configuration.permissions[required[section]!]&&!invoiceRead)||(['stock','products'].includes(section)&&!configuration.permissions.inventory&&!configuration.permissions.sales&&!configuration.permissions.demand)||(module&&!configuration.features[module])));
  const screen=section===undefined?<Dashboard/>:section==='sales'?(id==='new'?<BillingPage/>:id?<InvoicePage id={id}/>:<SalesPage/>):section==='stock'&&id==='voice'?<VoiceStockPage/>:section==='stock'&&id==='voice-history'?<VoiceHistoryPage/>:section==='stock'||section==='products'?<StockPage history={id==='history'} initialFilter={search.get('filter')||'all'} initialQuery={app.state?.products.find(p=>p.id===search.get('product'))?.name||''}/>:section==='customers'?<CustomersPage id={id}/>:section==='purchases'?<PurchasesPage/>:section==='suppliers'?<PurchasesPage suppliers/>:section==='payments'?<ExpensesPage payments/>:section==='expenses'?<ExpensesPage/>:section==='reports'?<ReportsPage/>:section==='todays-work'?<WorkPage/>:section==='daily-closing'?<ClosingPage/>:section==='settings'?<SettingsPage section={id}/>:section==='ai'?<AiPage/>:section==='help'?<HelpPage/>:<Empty icon={<CircleHelp/>} title={t('notFound')} detail={t('notFoundHint')} action={<Link href="/app">{t('returnHome')}</Link>}/>;
  return <div key={`${app.businessId}-${app.resetEpoch}-${slug.join('/')}-${search.toString()}`}>{denied?<Empty icon={<CircleHelp/>} title={v(module&&configuration&&!configuration.features[module]?'featureDisabled':'permissionDenied')} action={<Link href="/app">{v('returnHome')}</Link>}/>:section==='demand'?<DemandPage/>:section==='settings'?<SaaSSettings section={id}/>:screen}</div>;
}
function WorkspaceScope({children}:{children:ReactNode}){const app=useApp(),scope=`${app.session?.user.id}-${app.businessId}-${app.resetEpoch}`;return <VoiceOSProvider key={scope}><DemandWrites key={scope}><OperationsProvider key={scope}><AppShell><WriteRecoveryNotice/>{children}</AppShell></OperationsProvider></DemandWrites></VoiceOSProvider>;}
export function WorkspaceLayout({children}:{children:ReactNode}){return <AppProvider><WorkspaceScope>{children}</WorkspaceScope></AppProvider>;}
export function Workspace({slug}: {slug:string[]}) {return <Screen slug={slug}/>;}
