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
import './workspace-premium.css';
import './approved-workspace.css';
import {SmartClosingPage,ClosingHistory} from './closing/closing-page';
import {RecordDetailPage} from './record-details';
import {IntelligenceTools} from './intelligence-tools';
import {PurchasesHub,PurchaseOrderDetail} from './purchases-hub';
import { VoiceOSProvider } from './voice/voice-os-provider';
import type { ReactNode } from 'react';
import type { Locale } from '@/lib/locale';

function Screen({slug}: {slug:string[]}) {
  const app=useApp();const {t}=useTranslation();const search=useSearchParams();const [section,id]=slug;
  const v=useTranslation('v3').t;const configuration=app.state?.configuration;
  const required:Partial<Record<string,Permission>>={sales:'sales',customers:'customers',purchases:'purchases',suppliers:'purchases',payments:'payments',expenses:'reports',reports:'reports','daily-closing':'reports',demand:'demand',ai:'reports',intelligence:'reports',...(section==='stock'&&id?{stock:'inventory' as Permission}:{}),...(section==='settings'&&id==='team'?{settings:'team' as Permission}:section==='settings'&&id==='features'?{settings:'settings' as Permission}:{})};
  const module:ModuleKey|undefined=section==='demand'?'demandPulse':section==='ai'||section==='intelligence'?'assistant':section==='daily-closing'?'dailyClosing':section==='todays-work'?'todaysWork':section==='stock'&&id?.startsWith('voice')?'voiceStock':undefined;
  const invoiceRead=section==='sales'&&id!=='new'&&Boolean(configuration&&(configuration.permissions.sales||configuration.permissions.customers||configuration.permissions.payments));
  const denied=Boolean(configuration&&((section&&required[section]&&!configuration.permissions[required[section]!]&&!invoiceRead)||(['stock','products'].includes(section)&&!configuration.permissions.inventory&&!configuration.permissions.sales&&!configuration.permissions.demand)||(module&&!configuration.features[module])));
  const screen=section===undefined?<Dashboard/>:section==='sales'?(id==='new'?<BillingPage/>:id?<InvoicePage id={id}/>:<SalesPage/>):section==='stock'&&id==='voice'?<VoiceStockPage/>:section==='stock'&&id==='voice-history'?<VoiceHistoryPage/>:(section==='stock'||section==='products')&&id&&id!=='history'?<RecordDetailPage id={id} type='product'/>:section==='stock'||section==='products'?<StockPage history={id==='history'} initialFilter={search.get('filter')||'all'} initialQuery={app.state?.products.find(p=>p.id===search.get('product'))?.name||''}/>:section==='customers'?<CustomersPage id={id}/>:section==='purchases'?(id==='orders'?<PurchaseOrderDetail id={slug[2]}/>:id?<RecordDetailPage id={id} type='purchase'/>:<PurchasesHub/>):section==='suppliers'?(id?<RecordDetailPage id={id} type='supplier'/>:<PurchasesPage suppliers/>):section==='payments'?(id?<RecordDetailPage id={id} type='payment'/>:<ExpensesPage payments/>):section==='expenses'?<ExpensesPage/>:section==='reports'?(id==='closings'?<ClosingHistory id={slug[2]}/>:<ReportsPage/>):section==='todays-work'?<WorkPage/>:section==='daily-closing'?<SmartClosingPage/>:section==='settings'?<SettingsPage section={id}/>:section==='intelligence'?<IntelligenceTools/>:section==='ai'?<AiPage/>:section==='help'?<HelpPage/>:<Empty icon={<CircleHelp/>} title={t('notFound')} detail={t('notFoundHint')} action={<Link href="/app">{t('returnHome')}</Link>}/>;
  return <div key={`${app.businessId}-${app.resetEpoch}-${slug.join('/')}-${search.toString()}`}>{denied?<Empty icon={<CircleHelp/>} title={v(module&&configuration&&!configuration.features[module]?'featureDisabled':'permissionDenied')} action={<Link href="/app">{v('returnHome')}</Link>}/>:section==='demand'?<DemandPage/>:section==='settings'?<SaaSSettings section={id}/>:screen}</div>;
}
function WorkspaceScope({children}:{children:ReactNode}){const app=useApp(),scope=`${app.session?.user.id}-${app.businessId}-${app.resetEpoch}`;return <VoiceOSProvider key={scope}><DemandWrites key={scope}><OperationsProvider key={scope}><AppShell><WriteRecoveryNotice/>{children}</AppShell></OperationsProvider></DemandWrites></VoiceOSProvider>;}
export function WorkspaceLayout({children,initialLanguage}:{children:ReactNode;initialLanguage:Locale}){return <AppProvider initialLanguage={initialLanguage}><WorkspaceScope>{children}</WorkspaceScope></AppProvider>;}
export function Workspace({slug}: {slug:string[]}) {return <Screen slug={slug}/>;}
