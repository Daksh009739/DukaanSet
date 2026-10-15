'use client';
import type { ReactNode } from 'react';
import { Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function ModuleMetrics({items,className=''}:{items:{label:string;value:ReactNode;icon:ReactNode;tone?:'mint'|'blue'|'amber'|'rose';hint?:string}[];className?:string}) {
  return <div className={`module-metrics ${className}`}>{items.map(item=><div className={`module-metric ${item.tone||'mint'}`} key={item.label}><span className="module-metric-icon" aria-hidden>{item.icon}</span><dl><dt>{item.label}</dt><dd>{item.value}{item.hint&&<small>{item.hint}</small>}</dd></dl></div>)}</div>;
}

export function ModuleToolbar({title,label,query,onQuery,count,children}:{title:string;label:string;query:string;onQuery:(value:string)=>void;count:number;children?:ReactNode}) {
  const w=useTranslation('workspace').t;
  return <div className="module-toolbar"><div className="module-list-heading"><h2>{title}</h2><span className="module-result-count" aria-live="polite">{w('moduleUi.recordsCount',{count})}</span></div><div className="module-list-controls"><label className="search-box"><Search size={18} aria-hidden/><input type="search" aria-label={label} placeholder={label} value={query} onChange={e=>onQuery(e.target.value)}/>{query&&<button type="button" className="icon-btn" aria-label={w('moduleUi.clearSearch')} onClick={()=>onQuery('')}><X size={16}/></button>}</label>{children}</div></div>;
}

export function ModuleFilters({items,value,onChange,label}:{items:{value:string;label:string}[];value:string;onChange:(value:string)=>void;label:string}) {
  return <div className="segmented module-filters" role="group" aria-label={label}>{items.map(item=><button type="button" key={item.value} className={value===item.value?'active':''} aria-pressed={value===item.value} onClick={()=>onChange(item.value)}>{item.label}</button>)}</div>;
}
