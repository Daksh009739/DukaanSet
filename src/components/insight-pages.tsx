'use client';
import Link from 'next/link';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ArrowUpRight,ChevronRight,Wallet,Package,MessageSquare,ClipboardCheck,ChartNoAxesCombined,ReceiptText,Download,UsersRound,Search,CircleHelp,Sparkles,CheckCheck,CalendarDays,Building2,Boxes} from 'lucide-react';
import {useApp} from './app-provider';
import {PdfExport} from './documents/pdf-export';
import {Button,CardTitle,Empty} from './ui';
import {ModuleMetrics,ModuleToolbar,ModuleFilters} from './module-ui';
import {StudioHeading,StudioNote,insightStyles as s} from './insight-ui';
import {SalesOverviewChart,TopProductsPanel} from './dashboard-panels';
import {DemandReport} from './demand/demand-page';
import {ContextVoiceButton} from './voice/global-voice';
import {LocalizedDate} from './localized-data';
import {api,money} from '@/lib/client';
import {taskHref,taskText} from '@/lib/presentation';

export function WorkPage() {
  const app=useApp(),state=app.state!,{t,i18n}=useTranslation(),w=useTranslation('workspace').t;
  const [query,setQuery]=useState(''),[filter,setFilter]=useState('all');
  const {permissions:p,features:f}=state.configuration;
  const tasks=state.tasks.filter(task=>task.type==='credit'?p.customers:task.type==='demand'?p.demand&&f.demandPulse:p.inventory||p.sales||p.demand);
  const credit=tasks.filter(task=>task.type==='credit'),stock=tasks.filter(task=>task.type==='stock'||task.type==='expiry');
  const filtered=tasks.filter(task=>(filter==='all'||filter==='stock'&&['stock','expiry'].includes(task.type)||task.type===filter)&&(!query||`${task.name} ${taskText(task,t,i18n.language)}`.toLocaleLowerCase().includes(query.toLocaleLowerCase())));
  return <div data-testid="work-studio"><StudioHeading title={t('work')} subtitle={w('studio.workHint')} icon={<CheckCheck/>} eyebrow={w('studio.actionCenter')} action={p.reports&&f.assistant?<Link className="btn btn-secondary" href="/app/intelligence"><Sparkles size={17}/>{w('studio.openInsights')}</Link>:undefined}/>
    <ModuleMetrics items={[{label:w('studio.needsAttention'),value:tasks.length,icon:<ClipboardCheck/>},{label:w('studio.stockTasks'),value:stock.length,icon:<Package/>,tone:'amber'},{label:w('studio.taskDues'),value:money(credit.reduce((sum,task)=>sum+(task.balancePaise||0),0),i18n.language),icon:<Wallet/>,tone:'blue',hint:w('studio.customerTasks',{count:credit.length})}]}/>
    <div className={s.workLayout}><section className="card module-directory"><ModuleToolbar title={w('studio.actionCenter')} label={w('studio.searchTasks')} query={query} onQuery={setQuery} count={filtered.length}><ModuleFilters label={w('studio.filterTasks')} value={filter} onChange={setFilter} items={[{value:'all',label:t('all')},{value:'stock',label:t('stock')},{value:'credit',label:t('customers')},{value:'demand',label:t('taskDemand')}].filter(item=>item.value==='all'||item.value==='stock'&&stock.length>0||tasks.some(task=>task.type===item.value))}/></ModuleToolbar>
      <div>{filtered.map(task=>{const Icon=task.type==='credit'?Wallet:task.type==='demand'?MessageSquare:Package;return <Link className={s.taskRow} href={taskHref(task)} key={task.id}><span className={`${s.taskIcon} ${task.type==='credit'?s.blue:task.type==='demand'?s.violet:s.amber}`} aria-hidden><Icon size={21}/></span><div><span className={s.taskCategory}>{t(task.type==='credit'?'taskCredit':task.type==='demand'?'taskDemand':task.type==='expiry'?'taskExpiry':'taskStock')}</span><h2>{task.name}</h2><p>{taskText(task,t,i18n.language)}</p></div><ChevronRight size={18} aria-hidden/></Link>;})}</div>
      {!filtered.length&&<Empty icon={<CheckCheck/>} title={w(query||filter!=='all'?'studio.noMatches':'studio.allCaughtUp')} detail={w(query||filter!=='all'?'studio.adjustSearch':'studio.caughtUpHint')} action={(query||filter!=='all')&&<Button variant="secondary" onClick={()=>{setQuery('');setFilter('all');}}>{w('moduleUi.resetFilters')}</Button>}/>}</section>
      <aside className={s.workAside}>{f.dailyClosing&&p.reports&&<section className={s.closingShortcut}><span className={s.sideIcon} aria-hidden><CalendarDays/></span><span className={s.eyebrow}>{w(state.closing?.session.status==='closed'?'sessionClosed':'sessionOpen')}</span><h2>{t('closing')}</h2><p>{state.closing?.session.status==='closed'?w('closed'):t('closingHint')}</p><Link className="btn btn-primary" href="/app/daily-closing">{state.closing?.session.status==='closed'?w('reviewClosing'):t('startClosing')}<ArrowUpRight size={16}/></Link></section>}<section className={`card ${s.shortcutCard}`}><h2>{w('studio.quickLinks')}</h2><Link href="/app">{t('dashboard')}<ArrowUpRight size={16}/></Link><Link href="/app/help">{t('help')}<ArrowUpRight size={16}/></Link>{p.reports&&<Link href="/app/reports">{t('reports')}<ArrowUpRight size={16}/></Link>}</section></aside>
    </div></div>;
}

export function ReportsPage() {
  const app=useApp(),state=app.state!,{t,i18n}=useTranslation(),w=useTranslation('workspace').t,[busy,setBusy]=useState(false);
  async function exportData(){setBusy(true);try{const data=await api(`/businesses/${app.businessId}/export`);const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const anchor=document.createElement('a');anchor.href=url;anchor.download=`dukaanset-${state.business.name}.json`;anchor.click();URL.revokeObjectURL(url);}catch(error){app.notify(app.errorText(error));}finally{setBusy(false);}}
  return <div data-testid="reports-studio"><StudioHeading title={t('reports')} subtitle={t('reportHint')} icon={<ChartNoAxesCombined/>} eyebrow={w('studio.businessOverview')} action={<div className="button-row"><ContextVoiceButton intent="report"/><PdfExport kind="business-report"/>{state.configuration.features.dailyClosing&&<Link className="btn btn-secondary" href="/app/reports/closings"><CalendarDays size={16}/>{w('closingHistory')}</Link>}{state.configuration.permissions.settings&&<Button busy={busy} variant="secondary" onClick={()=>void exportData()}><Download size={17}/>{t('export')}</Button>}</div>}/>
    <div className={s.sectionLabel}><h2>{w('studio.moneyOverview')}</h2><span className={s.periodBadge}>{t('v3:allTime')}</span></div>
    <ModuleMetrics items={[{label:t('netSales'),value:money(state.totals.salesPaise,i18n.language),icon:<ReceiptText/>,hint:w('studio.confirmedSales')},{label:t('moneyReceived'),value:money(state.totals.receivedPaise,i18n.language),icon:<Wallet/>,tone:'blue'},{label:t('outstanding'),value:money(state.metrics.outstandingPaise,i18n.language),icon:<UsersRound/>,tone:'amber'}]}/>
    <div className={s.secondaryMetrics}>{[{label:t('expenseTotal'),value:state.totals.expensesPaise,Icon:ReceiptText},{label:t('supplierDue'),value:state.suppliers.reduce((sum,supplier)=>sum+supplier.balancePaise,0),Icon:Building2},{label:t('stockValue'),value:state.metrics.stockValuePaise,Icon:Boxes}].map(({label,value,Icon})=><div key={label}><span className={s.secondaryIcon} aria-hidden><Icon size={18}/></span><dl><dt>{label}</dt><dd>{money(value,i18n.language)}</dd></dl></div>)}</div><StudioNote>{t('profitNotice')}</StudioNote>
    <div className="report-visual-grid"><SalesOverviewChart/><TopProductsPanel/></div><DemandReport/>
    <section className={`card ${s.weeklyCard}`}><CardTitle>{t('last7')}</CardTitle><div className={s.weeklyDays}>{state.weeklySales.map(day=><div key={day.date}><span><LocalizedDate value={day.date} options={{day:'numeric',month:'short'}}/></span><b>{money(day.salesPaise,i18n.language)}</b></div>)}</div></section>
  </div>;
}

export function HelpPage() {
  const app=useApp(),state=app.state!,{t}=useTranslation(),w=useTranslation('workspace').t,[query,setQuery]=useState('');
  const p=state.configuration.permissions,f=state.configuration.features;
  const guides=[{title:t('newBill'),detail:t('guideBilling'),href:'/app/sales/new',Icon:ReceiptText,allowed:p.sales,tone:s.mint},{title:t('stock'),detail:t('guideStock'),href:'/app/stock',Icon:Package,allowed:p.inventory||p.sales||p.demand,tone:s.blue},{title:t('customers'),detail:w('studio.guideCustomers'),href:'/app/customers',Icon:UsersRound,allowed:p.customers,tone:s.violet},{title:t('payments'),detail:w('studio.guidePayments'),href:'/app/payments',Icon:Wallet,allowed:p.payments,tone:s.blue},{title:t('closing'),detail:t('guideClosing'),href:'/app/daily-closing',Icon:ClipboardCheck,allowed:p.reports&&f.dailyClosing,tone:s.amber},{title:t('taskDemand'),detail:w('studio.guideDemand'),href:'/app/demand',Icon:MessageSquare,allowed:p.demand&&f.demandPulse,tone:s.mint}].filter(guide=>guide.allowed);
  const visible=guides.filter(guide=>`${guide.title} ${guide.detail}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  return <div data-testid="help-studio"><StudioHeading title={t('help')} subtitle={w('studio.helpHint')} icon={<CircleHelp/>} eyebrow={w('studio.getStarted')}/><section className={s.helpSearch}><div><span className={s.eyebrow}>{w('studio.stepByStep')}</span><h2>{w('studio.whatToDo')}</h2><p>{w('studio.helpSearchHint')}</p></div><label className="search-box"><Search size={19} aria-hidden/><input type="search" value={query} onChange={event=>setQuery(event.target.value)} aria-label={w('studio.searchGuides')} placeholder={w('studio.searchGuides')}/></label></section>
    <div className={s.helpGrid}>{visible.map(({title,detail,href,Icon,tone})=><Link className={`card ${s.guideCard}`} href={href} key={href}><span className={`${s.guideIcon} ${tone}`} aria-hidden><Icon/></span><h2>{title}</h2><p>{detail}</p><span className={s.guideAction}>{t('next')}<ArrowUpRight size={17}/></span></Link>)}</div>{!visible.length&&<Empty icon={<Search/>} title={w('studio.noMatches')} detail={w('studio.adjustSearch')} action={<Button variant="secondary" onClick={()=>setQuery('')}>{w('moduleUi.clearSearch')}</Button>}/>}
    <section className={`card ${s.faq}`}><CardTitle>{w('studio.commonQuestions')}</CardTitle>{['stock','payment','closing'].map(key=><details key={key}><summary>{w(`studio.faq${key}Question`)}</summary><p>{w(`studio.faq${key}Answer`)}</p></details>)}</section>
  </div>;
}
