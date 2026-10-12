'use client';
import Link from 'next/link';
import {useState,type RefObject} from 'react';
import {Bell,Package,Wallet,Clock3,MessageSquare,ChevronRight,Settings2,CheckCheck} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {useApp} from './app-provider';
import {Sheet,Empty} from './ui';
import {taskHref,taskText} from '@/lib/presentation';
import styles from './workspace-overlays.module.css';

export function WorkspaceUpdates({open,onOpenChange,returnFocusRef}:{open:boolean;onOpenChange:(open:boolean)=>void;returnFocusRef?:RefObject<HTMLElement|null>}){
  const app=useApp(),{t}=useTranslation(),w=useTranslation('workspace').t,[filter,setFilter]=useState('all');
  const preferences=app.state?.configuration.notificationPreferences;
  const tasks=app.state?.tasks.filter(task=>task.type==='credit'?preferences?.credit:task.type==='demand'?preferences?.demand:preferences?.stock)||[];
  const notices=app.state?.closing?.notices||[];
  const updates=[
    ...notices.map(notice=>({id:notice.id,group:'other',title:w(notice.kind),detail:'',icon:Clock3,tone:styles.closingIcon,href:notice.kind==='invalidSchedule'?'/app/settings/closing':notice.kind==='autoCloseFailed'?'/app/daily-closing':`/app/reports/closings/${notice.sessionId}`})),
    ...tasks.map(task=>({id:task.id,group:task.type==='credit'?'payments':task.type==='demand'?'other':'stock',title:t(task.type==='credit'?'taskCredit':task.type==='demand'?'taskDemand':task.type==='expiry'?'taskExpiry':'taskStock'),detail:taskText(task,t,app.session?.user.language||'en'),icon:task.type==='credit'?Wallet:task.type==='demand'?MessageSquare:Package,tone:task.type==='credit'?styles.paymentIcon:task.type==='demand'?styles.closingIcon:styles.stockIcon,href:taskHref(task)})),
  ];
  const categories=[{id:'all',label:w('overlays.allUpdates')},{id:'stock',label:t('stock')},{id:'payments',label:t('payments')},{id:'other',label:w('overlays.otherUpdates')}];
  const visible=updates.filter(item=>filter==='all'||item.group===filter);
  const close=()=>{onOpenChange(false);setFilter('all');};
  return <Sheet title={t('notification')} description={w('overlays.updatesDescription')} headerIcon={<Bell size={22}/>} className={styles.dialog} overlayClassName={styles.overlay} returnFocusRef={returnFocusRef} hideLanguage open={open} onOpenChange={value=>{if(value)onOpenChange(true);else close();}}>
    {updates.length>0&&<div className={styles.filters} role="group" aria-label={w('overlays.filterUpdates')}>{categories.map(category=>{const count=updates.filter(item=>category.id==='all'||item.group===category.id).length;return <button type="button" key={category.id} aria-pressed={filter===category.id} onClick={()=>setFilter(category.id)}>{category.label}<span>{count}</span></button>;})}</div>}
    <div className={`sheet-body ${styles.body}`}>
      {visible.length?<ul className={styles.updateList}>{visible.map(({icon:Icon,...item})=><li key={item.id}><Link className={styles.updateCard} href={item.href} onClick={close}><span className={`${styles.resultIcon} ${item.tone}`}><Icon size={21} aria-hidden/></span><span className={styles.resultText}><b>{item.title}</b>{item.detail&&<p>{item.detail}</p>}</span><ChevronRight size={18} aria-hidden/></Link></li>)}</ul>:<div className={styles.empty}><Empty icon={<CheckCheck/>} title={updates.length?w('overlays.noCategoryUpdates'):t('noAlerts')} detail={w('overlays.caughtUpHint')}/></div>}
    </div>
    <div className={styles.footer}><span role="status">{w('overlays.updateCount',{count:visible.length})}</span>{app.state?.configuration.permissions.settings&&<Link className={styles.settingsLink} href="/app/settings/features" onClick={close}><Settings2 size={14} aria-hidden/>{w('overlays.updateSettings')}</Link>}</div>
  </Sheet>;
}
