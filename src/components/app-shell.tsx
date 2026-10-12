'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import {CircleHelp,MoreHorizontal,Menu,Bell} from 'lucide-react';
import { useRef,useState,type ReactNode } from 'react';
import { Logo } from './brand';
import { useApp } from './app-provider';
import { Button,Empty } from './ui';
import {AccountPanel} from './account-panel';
import { GlobalVoiceLauncher } from './voice/global-voice';
import './v2.css';
import './premium-ux.css';
import './interaction.css';
import {LanguageOptions} from './locale-provider';
import { GlobalSearch } from './global-search';
import { WorkspaceUpdates } from './workspace-updates';
import type { Language } from '@/lib/contracts';
import {DashboardLoading} from './premium-dashboard';
import {SmartSidebar,NavigationDrawer,sidebarStyles,useNavLabel} from './navigation/smart-sidebar';
import {navigationFor,routeActive} from './navigation/registry';
export function AppShell({children,collapsed=false,onCollapse=()=>{}}:{children:ReactNode;collapsed?:boolean;onCollapse?:()=>void}) {
  const {t}=useTranslation(),path=usePathname(),app=useApp();const [alerts,setAlerts]=useState(false),[mobileMenu,setMobileMenu]=useState(false),[profile,setProfile]=useState(false);const profileTrigger=useRef<HTMLElement|null>(null),showProfile=(trigger?:HTMLElement)=>{profileTrigger.current=trigger||(mobileMenu?drawerTrigger.current:document.activeElement instanceof HTMLElement?document.activeElement:null);setProfile(true);};const drawerTrigger=useRef<HTMLElement|null>(null),updatesTrigger=useRef<HTMLButtonElement|null>(null);const openMobile=(trigger:HTMLElement)=>{drawerTrigger.current=trigger;setMobileMenu(true);};
  const preferences=app.state?.configuration.notificationPreferences;
  const navigation=navigationFor(app.state).primary,label=useNavLabel();
  const closingNotices=app.state?.closing?.notices||[],w=useTranslation('workspace').t;
  const notifications=app.state?.tasks.filter(task=>task.type==='credit'?preferences?.credit:task.type==='demand'?preferences?.demand:preferences?.stock)||[];
  const active=(href:string)=>routeActive(path,href);
  return <div className={`workspace approved-workspace reference-workspace ${sidebarStyles.shell} ${path==='/app'?'dashboard-shell':''} ${collapsed?'sidebar-collapsed':''}`}><a className="skip-link" href="#main">{t('dashboard')}</a>
    <SmartSidebar collapsed={collapsed} onCollapse={onCollapse} onProfile={()=>showProfile()}/>
    <div className="workspace-main"><header className="app-header"><button className="icon-btn reference-menu" aria-label={w('v16.openMenu')} disabled={!app.session||!app.businessId} onClick={event=>openMobile(event.currentTarget)}><Menu size={22}/></button><Logo href="/app" className="reference-mobile-logo" inverted/><GlobalSearch/><div className="header-tools"><GlobalVoiceLauncher hideLauncher={path==='/app'}/><button ref={updatesTrigger} className="icon-btn notification-button" onClick={()=>setAlerts(true)} aria-label={t('notification')}><Bell size={21}/>{Boolean(notifications.length||closingNotices.length)&&<span>{notifications.length+closingNotices.length}</span>}</button><label className="language-picker"><span className="language-flag" aria-hidden>{app.session?.user.language==='en'?'🇬🇧':'🇮🇳'}</span><span className="sr-only">{t('language')}</span><select disabled={app.loading||!app.state||app.writing} aria-label={t('language')} value={app.session?.user.language||'en'} onChange={event=>app.changeLanguage(event.target.value as Language).catch(error=>app.notify(app.errorText(error)))}><LanguageOptions/></select></label><div className="business-select"><button className="avatar profile-menu-trigger" disabled={app.loading||!app.state} onClick={event=>showProfile(event.currentTarget)} aria-label={w('profileMenu')}>{(app.state?.business.name||app.session?.user.name||'D').split(/\s+/).filter(Boolean).slice(0,2).map(word=>word[0]).join('').toUpperCase()}</button><div><button className="profile-name" disabled={app.loading||!app.state} onClick={event=>showProfile(event.currentTarget)}>{app.state?.business.name||app.session?.user.name||'DukaanSet'}</button><label htmlFor="business-select" className="sr-only">{t('business')}</label><select id="business-select" disabled={app.writing||app.loading||!app.state} value={app.businessId} onChange={event=>app.selectBusiness(event.target.value)}>{app.session?.businesses.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></div></div><button className="icon-btn mobile-only" aria-label={t('more')} disabled={!app.session||!app.businessId} onClick={event=>openMobile(event.currentTarget)}><Menu size={20}/></button></div></header>
    {!app.online&&<div className="network-banner" role="status">{t('offline')}</div>}
    <main id="main" className="app-content" data-business-id={app.state?.business.id}>{app.error?<Empty icon={<CircleHelp/>} title={app.error} action={<Button onClick={()=>app.refresh()}>{t('retry')}</Button>}/>:app.loading&&!app.state?path==='/app'?<DashboardLoading/>:<div className="loading-state" role="status"><span className="loading-logo"><Logo compact/></span><p>{t('loading')}</p><div className="skeleton-grid">{[1,2,3,4].map(i=><div className="skeleton" key={i}/>)}</div></div>:app.state?children:null}</main>
    <nav className="bottom-nav" aria-label={t('dashboard')}>{navigation.filter(item=>['/app','/app/sales/new','/app/stock','/app/customers'].includes(item.href)).map(item=>{const Icon=item.icon;return <Link key={item.href} className={active(item.href)?'active':''} href={item.href}><Icon size={21}/><span>{item.href==='/app'?t('home'):item.href==='/app/sales/new'?w('v16.sale'):item.href==='/app/stock'?t('stock'):label(item)}</span></Link>;})}<button className={mobileMenu?'active':''} disabled={!app.session||!app.businessId} onClick={event=>openMobile(event.currentTarget)}><MoreHorizontal size={22}/><span>{t('more')}</span></button></nav></div>
    <WorkspaceUpdates open={alerts} onOpenChange={setAlerts} returnFocusRef={updatesTrigger}/>
    <AccountPanel returnFocusRef={profileTrigger} open={profile} onOpenChange={setProfile} onShops={()=>{setProfile(false);drawerTrigger.current=profileTrigger.current;setMobileMenu(true);}}/><NavigationDrawer open={mobileMenu} onOpenChange={setMobileMenu} onProfile={()=>showProfile()} trigger={drawerTrigger}/>
  </div>;
}
