'use client';
import Link from 'next/link';
import {useTranslation} from 'react-i18next';
import {Wallet,Package,UsersRound,MessageSquare,ChevronRight,CheckCircle2} from 'lucide-react';
import {useApp} from './app-provider';
import {TradingSessionCard} from './dashboard-panels';
import {Empty} from './ui';
import {money} from '@/lib/client';
import {taskHref,taskText} from '@/lib/presentation';
import styles from './dashboard-enhancements.module.css';

export function DashboardExtras({onMore}:{onMore:()=>void}){
 const app=useApp(),{t,i18n}=useTranslation(),w=useTranslation('workspace').t,state=app.state!,p=state.configuration.permissions,f=state.configuration.features;
 const tasks=state.tasks.filter(task=>task.type==='credit'?p.customers||p.payments:task.type==='demand'?p.demand&&f.demandPulse:p.inventory),rows=[['cash',state.daily.cashPaise],['upi',state.daily.upiPaise],['credit',state.daily.creditSalesPaise],['expenses',state.daily.expensesPaise]]as const;
 return <div className={styles.grid} data-testid="dashboard-extras">
  {p.reports&&<section className={`card ${styles.panel}`} aria-label={w('dashboardExtra.money')}><div className={styles.heading}><h2>{w('dashboardExtra.money')}</h2><Wallet aria-hidden/></div><p className={styles.hint}>{w('dashboardExtra.sessionHint')}</p><dl className={styles.money}>{rows.map(([key,value])=><div key={key}><dt>{w('dashboardExtra.'+key)}</dt><dd>{money(value,i18n.language)}</dd></div>)}</dl><p className={styles.older}><span>{w('dashboardExtra.oldDues')}</span><b>{money(state.daily.olderDuesReceivedPaise,i18n.language)}</b></p><Link className={styles.all} href="/app/reports">{w('dashboardExtra.reports')}<ChevronRight size={14}/></Link></section>}
  {p.reports&&f.dailyClosing&&state.closing&&<TradingSessionCard onMore={onMore}/>}
  {f.todaysWork&&<section className={`card ${styles.panel}`} aria-label={w('dashboardExtra.work')}><div className={styles.heading}><h2>{w('dashboardExtra.work')}</h2><span className={styles.count}>{w('dashboardExtra.taskCount',{count:tasks.length})}</span></div><p className={styles.hint}>{w('dashboardExtra.workHint')}</p>{tasks.length?<div className={styles.tasks}>{tasks.slice(0,4).map(task=>{const Icon=task.type==='credit'?UsersRound:task.type==='demand'?MessageSquare:Package;return <Link className={styles.task} key={task.id} href={taskHref(task)}><span><Icon size={18}/></span><span><b>{task.name}</b><small>{taskText(task,t,i18n.language)}</small></span><ChevronRight size={15}/></Link>;})}</div>:<Empty icon={<CheckCircle2/>} title={w('dashboardExtra.allClear')} detail={t('noTasks')}/>}<Link className={styles.all} href="/app/todays-work">{w('dashboardExtra.allWork')}<ChevronRight size={14}/></Link></section>}
 </div>;
}
