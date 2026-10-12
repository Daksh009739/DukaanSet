'use client';
import Link from 'next/link';
import * as Dialog from '@radix-ui/react-dialog';
import {useEffect,useId,useRef,useState,type RefObject} from 'react';
import {usePathname} from 'next/navigation';
import {useTranslation} from 'react-i18next';
import {ArrowRight,ArrowLeftRight,Blocks,Check,ChevronDown,ChevronsLeft,ChevronsRight,Crown,MoreVertical,Plus,Search,Store,X} from 'lucide-react';
import {Logo} from '../brand';
import {useApp} from '../app-provider';
import {useOperations} from '../operations';
import {navigationFor,routeActive,type NavEntry} from './registry';
import styles from './smart-sidebar.module.css';

export function useNavLabel(){const {t}=useTranslation(),w=useTranslation('workspace').t,v=useTranslation('v3').t;return (item:NavEntry)=>item.namespace==='workspace'?w(item.key):item.namespace==='v3'?v(item.key):t(item.key);}
export const initials=(name:string)=>name.trim().split(/\s+/).slice(0,2).map(word=>word[0]).join('').toUpperCase();

function ShopSwitcher({compact=false,onNavigate}:{compact?:boolean;onNavigate:()=>void}){
  const app=useApp(),openOperation=useOperations(),w=useTranslation('workspace').t,t=useTranslation().t;
  const [open,setOpen]=useState(false),[query,setQuery]=useState('');const id=useId(),root=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null),search=useRef<HTMLInputElement>(null);
  const shops=app.session?.businesses||[],shop=shops.find(b=>b.id===app.businessId),canAdd=Boolean(app.state?.configuration.permissions.settings);
  const matches=shops.filter(b=>b.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  const status=app.state?.closing?.session.status,location=app.state?.configuration.location;
  const close=()=>{setOpen(false);setQuery('');};
  useEffect(()=>{if(!open)return;search.current?.focus();const outside=(event:PointerEvent)=>{if(!root.current?.contains(event.target as Node))close();};document.addEventListener('pointerdown',outside);return()=>document.removeEventListener('pointerdown',outside);},[open]);
  useEffect(()=>{close();},[app.businessId]);
  return <div ref={root} className={`${styles.shop} ${compact?styles.compactShop:''}`}>
    <button ref={trigger} data-shop-switch className={styles.shopTrigger} disabled={!shop||app.loading||app.writing||shops.length<2&&!canAdd} aria-label={w('sidebar.switchShop',{shop:shop?.name||t('loading')})} aria-expanded={open} aria-controls={id} onClick={()=>setOpen(!open)}>
      <span className={styles.shopAvatar} aria-hidden><Store size={21}/></span>
      {!compact&&<><span className={styles.shopInfo}><b title={shop?.name}>{shop?.name||t('loading')}</b>{location&&<small title={location}>{location}</small>}{status&&<small className={styles.status}><i className={status==='closed'?styles.closed:''}/>{w(status==='open'?'sidebar.storeOpen':'sidebar.storeClosed')}</small>}</span><ArrowLeftRight size={16}/></>}
      {compact&&<span className={styles.tooltip}>{shop?.name}</span>}
    </button>
    {open&&<div id={id} className={styles.shopPanel} onKeyDown={event=>{
      if(event.key==='Escape'){event.stopPropagation();close();trigger.current?.focus();}
      if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){const options=Array.from(root.current?.querySelectorAll<HTMLButtonElement>('[role="option"]')||[]);if(!options.length)return;event.preventDefault();const current=options.indexOf(document.activeElement as HTMLButtonElement);const next=event.key==='Home'?0:event.key==='End'?options.length-1:event.key==='ArrowDown'?(current+1)%options.length:(current-1+options.length)%options.length;options[next].focus();}
    }}>
      {shops.length>1&&<label className={styles.shopSearch}><Search size={17}/><input ref={search} type="search" aria-label={w('sidebar.searchShops')} placeholder={w('sidebar.searchShops')} value={query} onChange={event=>setQuery(event.target.value)}/></label>}
      <div className={styles.shopList} role="listbox" aria-label={w('sidebar.yourShops')}>
        {matches.map(b=><button key={b.id} type="button" role="option" aria-selected={b.id===app.businessId} disabled={app.loading||app.writing} onClick={()=>{app.selectBusiness(b.id);close();trigger.current?.focus();}}><span className={styles.shopAvatar} aria-hidden>{initials(b.name)}</span><span><b>{b.name}</b>{b.id===app.businessId&&location&&<small>{location}</small>}</span>{b.id===app.businessId&&<Check size={19}/>}</button>)}
        {!matches.length&&<p role="status">{w('sidebar.noShops')}</p>}
      </div>
      {canAdd&&<button className={styles.addShop} disabled={app.writing||app.loading} onClick={()=>{close();onNavigate();openOperation('business');}}><Plus size={17}/>{t('newBusiness')}</button>}
    </div>}
  </div>;
}

function NavigationItem({item,compact,onNavigate}:{item:NavEntry;compact:boolean;onNavigate:()=>void}){
  const label=useNavLabel(),w=useTranslation('workspace').t,path=usePathname(),Icon=item.icon,active=routeActive(path,item.href),name=label(item);
  return <Link href={item.href} className={`${styles.navItem} ${active?styles.active:''}`} aria-label={name} aria-current={active?'page':undefined} onClick={onNavigate} data-nav-id={item.id}>
    <span className={styles.navIcon}><Icon size={20} strokeWidth={1.8}/></span>
    {!compact&&<span className={styles.navText}>{name}</span>}
    {!compact&&item.badge!==undefined&&<span className={`${styles.badge} ${item.badge==='AI'?styles.ai:''}`} aria-label={typeof item.badge==='number'?w(item.badgeKey!,{count:item.badge}):w('aiBadge')}>{item.badge}</span>}
    {compact&&<span className={styles.tooltip}>{name}{typeof item.badge==='number'?` · ${w(item.badgeKey!,{count:item.badge})}`:''}</span>}
  </Link>;
}

function SidebarContent({compact=false,collapse,onNavigate,onProfile}:{compact?:boolean;collapse?:()=>void;onNavigate:()=>void;onProfile:()=>void}){
  const app=useApp(),w=useTranslation('workspace').t,path=usePathname();const registry=navigationFor(app.state),childActive=registry.tools.some(item=>routeActive(path,item.href));
  const [tools,setTools]=useState(childActive),toolsId=useId();
  useEffect(()=>{if(childActive)setTools(true);},[path,childActive]);
  return <div className={`${styles.content} ${compact?styles.compact:''}`}>
    <div className={styles.brandHeader}><div><Logo href="/app" compact={compact} className={styles.logo} onClick={onNavigate}/>{!compact&&<p>{w('v16.tagline')}</p>}</div>{collapse&&<button className={`sidebar-collapse icon-btn ${styles.collapse}`} aria-label={w(compact?'expandSidebar':'collapseSidebar')} aria-expanded={!compact} onClick={collapse}>{compact?<ChevronsRight size={18}/>:<ChevronsLeft size={18}/>}</button>}</div>
    <ShopSwitcher compact={compact} onNavigate={onNavigate}/>
    <div className={styles.scroll}>
      <nav aria-label={w('sidebar.primaryNav')}>{registry.primary.map(item=><NavigationItem key={item.id} item={item} compact={compact} onNavigate={onNavigate}/>)}
        <button className={`business-tools-link ${styles.navItem} ${childActive?styles.active:''}`} aria-label={w('businessTools')} aria-expanded={tools} aria-controls={toolsId} onClick={()=>setTools(!tools)}><span className={styles.navIcon}><Blocks size={20} strokeWidth={1.8}/></span>{!compact&&<><span className={styles.navText}>{w('businessTools')}</span><ChevronDown size={16} className={tools?styles.rotated:''}/></>}{compact&&<span className={styles.tooltip}>{w('businessTools')}</span>}</button>
        {tools&&<div id={toolsId} className={styles.submenu}>{registry.tools.map(item=><NavigationItem key={item.id} item={item} compact={compact} onNavigate={onNavigate}/>)}</div>}
        <NavigationItem item={registry.settings} compact={compact} onNavigate={onNavigate}/>
      </nav>
    </div>
    <footer className={styles.footer}>
      <Link href="/pricing" data-tone="inverse" className={styles.upgrade} aria-label={w('sidebar.planInfo')} onClick={onNavigate}><Crown size={23}/>{!compact&&<span><b>{w('v16.dukaanPro')}</b><small>{w('sidebar.proHint')}</small></span>}{!compact&&<ArrowRight size={17}/ >}{compact&&<span className={styles.tooltip}>{w('sidebar.planInfo')}</span>}</Link>
      <button className={styles.user} aria-label={w('sidebar.profileActions')} onClick={onProfile}><span className={styles.userAvatar} aria-hidden>{initials(app.session?.user.name||'')||<Store size={18}/>}</span>{!compact&&<><span><b>{app.session?.user.name||w('profileMenu')}</b><small title={app.session?.user.email}>{app.session?.user.email}</small></span><MoreVertical size={18}/></>}{compact&&<span className={styles.tooltip}>{w('sidebar.profileActions')}</span>}</button>
    </footer>
  </div>;
}

export function SmartSidebar({collapsed,onCollapse,onProfile}:{collapsed:boolean;onCollapse:()=>void;onProfile:()=>void}){const w=useTranslation('workspace').t;return <aside className={`sidebar ${styles.desktop}`} aria-label={w('sidebar.navigation')}><SidebarContent compact={collapsed} collapse={onCollapse} onNavigate={()=>{}} onProfile={onProfile}/></aside>;}

export function NavigationDrawer({open,onOpenChange,onProfile,trigger}:{open:boolean;onOpenChange:(open:boolean)=>void;onProfile:()=>void;trigger:RefObject<HTMLElement|null>}){
  const w=useTranslation('workspace').t,t=useTranslation().t;
  return <Dialog.Root open={open} onOpenChange={onOpenChange}><Dialog.Portal><Dialog.Overlay className={styles.overlay}/><Dialog.Content className={styles.drawer} onEscapeKeyDown={event=>{if(document.querySelector('[role="dialog"] [data-shop-switch][aria-expanded="true"]'))event.preventDefault();}} onCloseAutoFocus={event=>{event.preventDefault();trigger.current?.focus();}}><Dialog.Title className="sr-only">{w('sidebar.navigation')}</Dialog.Title><Dialog.Description className="sr-only">{w('sidebar.drawerHint')}</Dialog.Description><Dialog.Close className={styles.drawerClose} aria-label={t('close')}><X size={20}/></Dialog.Close><SidebarContent onNavigate={()=>onOpenChange(false)} onProfile={()=>{onOpenChange(false);onProfile();}}/></Dialog.Content></Dialog.Portal></Dialog.Root>;
}

export {styles as sidebarStyles};
