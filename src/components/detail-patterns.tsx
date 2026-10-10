'use client';
import {useId,type ReactNode} from 'react';
import Link from 'next/link';
import {ArrowLeft} from 'lucide-react';
import {useTranslation} from 'react-i18next';
export function DetailHeader({title,subtitle,status,back,actions}:{title:string;subtitle?:string;status?:ReactNode;back:string;actions?:ReactNode}) {
 const {t}=useTranslation();return <header className="detail-header"><div><Link className="text-link detail-back" href={back}><ArrowLeft size={16}/>{t('back')}</Link><div className="detail-title"><h1>{title}</h1>{status}</div>{subtitle&&<p>{subtitle}</p>}</div>{actions&&<div className="detail-actions">{actions}</div>}</header>;
}
export function DetailMetrics({items}:{items:{label:string;value:ReactNode;hint?:string;primary?:boolean}[]}) {return <dl className="detail-metrics">{items.map(item=><div className={item.primary?'detail-metric primary':'detail-metric'} key={item.label}><dt>{item.label}</dt><dd>{item.value}{item.hint&&<small>{item.hint}</small>}</dd></div>)}</dl>;}
export function Disclosure({title,children,open=false}:{title:string;children:ReactNode;open?:boolean}) {return <details className="detail-disclosure card" open={open||undefined}><summary>{title}</summary><div className="disclosure-body">{children}</div></details>;}
export function DetailTabs({tabs,value,onChange,children}:{tabs:{id:string;label:string}[];value:string;onChange:(id:string)=>void;children:ReactNode}) {
 const uid=useId();return <><div className="detail-tabs" role="tablist">{tabs.map((tab,index)=><button key={tab.id} id={`${uid}-${tab.id}`} role="tab" aria-selected={value===tab.id} aria-controls={`${uid}-panel`} tabIndex={value===tab.id?0:-1} onClick={()=>onChange(tab.id)} onKeyDown={e=>{let i=index;if(e.key==='ArrowRight')i=(index+1)%tabs.length;else if(e.key==='ArrowLeft')i=(index+tabs.length-1)%tabs.length;else if(e.key==='Home')i=0;else if(e.key==='End')i=tabs.length-1;else return;e.preventDefault();onChange(tabs[i].id);document.getElementById(`${uid}-${tabs[i].id}`)?.focus();}}>{tab.label}</button>)}</div><section className="detail-tabpanel" role="tabpanel" id={`${uid}-panel`} aria-labelledby={`${uid}-${value}`} tabIndex={0}>{children}</section></>;
}
