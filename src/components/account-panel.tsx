'use client';
import Link from 'next/link';
import {useTranslation} from 'react-i18next';
import {UserRound,Settings2,CircleHelp,LogOut,ArrowUpRight,ChevronRight,Store,ArrowLeftRight,FlaskConical,Languages} from 'lucide-react';
import {useApp} from './app-provider';
import {Button,Sheet} from './ui';
import {DemoReset} from './demo-reset';
import {LanguageOptions} from './locale-provider';
import type {Language} from '@/lib/contracts';
import type {RefObject} from 'react';
import overlays from './workspace-overlays.module.css';
import s from './account-panel.module.css';

export function AccountPanel({open,onOpenChange,onShops,returnFocusRef}:{open:boolean;onOpenChange:(open:boolean)=>void;onShops:()=>void;returnFocusRef?:RefObject<HTMLElement|null>}) {
  const app=useApp(),{t}=useTranslation(),w=useTranslation('workspace').t,user=app.session?.user;
  const initials=(user?.name||'D').split(/\s+/).filter(Boolean).slice(0,2).map(word=>word[0]).join('').toUpperCase();
  return <Sheet open={open} onOpenChange={onOpenChange} returnFocusRef={returnFocusRef} title={w('profileMenu')} description={w('studio.accountHint')} hideLanguage headerIcon={<UserRound size={21}/>} className={`${overlays.dialog} ${s.dialog}`} overlayClassName={overlays.overlay}>
    <div className={`sheet-body ${overlays.body} ${s.body}`}><div className={s.identity}><span className={s.avatar} aria-hidden>{initials}</span><div><h3>{user?.name}</h3><p>{user?.demo?w('studio.demoAccount'):user?.email}</p></div></div>
      {app.state&&<div className={s.shop}><span aria-hidden><Store size={21}/></span><div><b>{app.state.business.name}</b><small>{w('studio.currentShop')}</small></div>{(app.session?.businesses.length||0)>1&&<button type="button" aria-label={w('sidebar.yourShops')} onClick={onShops}><ArrowLeftRight size={18}/></button>}</div>}
      <nav className={s.shortcuts} aria-label={w('profileMenu')}>{[{href:'/app/settings/account',label:w('sidebar.myProfile'),detail:w('studio.profileHint'),Icon:UserRound},{href:'/app/settings',label:t('settings'),detail:w('studio.settingsHint'),Icon:Settings2},{href:'/app/help',label:t('help'),detail:w('studio.helpHint'),Icon:CircleHelp}].map(({href,label,detail,Icon})=><Link key={href} href={href} aria-label={label} onClick={()=>onOpenChange(false)}><span className={s.shortcutIcon} aria-hidden><Icon size={19}/></span><div><b>{label}</b><small>{detail}</small></div><ChevronRight size={17} aria-hidden/></Link>)}</nav>
      <label className={s.language}><span><Languages size={18} aria-hidden/>{t('language')}</span><select aria-label={t('language')} value={user?.language||'en'} disabled={app.loading||app.writing||!app.state} onChange={event=>void app.changeLanguage(event.target.value as Language).catch(error=>app.notify(app.errorText(error)))}><LanguageOptions/></select></label>
      {user?.demo&&<section className={s.demo}><div className={s.demoHeading}><FlaskConical size={18} aria-hidden/><h3>{t('demo')}</h3></div><p>{t('demoHint')}</p><div className={s.demoActions}><DemoReset/></div><Link className="btn btn-secondary" href="/register" onClick={()=>onOpenChange(false)}>{t('demoExit')}<ArrowUpRight size={15}/></Link></section>}
    </div><div className={s.footer}><Button variant="ghost" onClick={()=>{onOpenChange(false);void app.logout();}}><LogOut size={17}/>{t('logout')}</Button></div>
  </Sheet>;
}
