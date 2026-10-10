'use client';
import {useCallback} from 'react';
import Link from 'next/link';
import {useTranslation} from 'react-i18next';
import {Sparkles,ArrowUpRight,Package,Wallet} from 'lucide-react';
import {money,quantity} from '@/lib/client';
import {useApp} from './app-provider';
import {PageHeading} from './dashboard';
import {CardTitle} from './ui';
import {useVoiceOS} from './voice/voice-os-provider';
import {advanceVoice} from '@/lib/voice/conversation';
import {osCopy} from '@/lib/voice/os-copy';
import {LocalizedUnit} from './localized-data';
import './premium-ux.css';

export function BusinessInsights(){
 const app=useApp(),voice=useVoiceOS(),{t:w,i18n}=useTranslation('workspace'),copy=osCopy(i18n.language);
 const host=useCallback((node:HTMLDivElement|null)=>voice.setWorkspace(node),[voice.setWorkspace]);
 if(!app.state)return null;const state=app.state,low=state.products.filter(p=>p.quantityMilli<=p.minStockMilli);
 return <><PageHeading title={w('assistantTitle')} subtitle={w('assistantSubtitle')}/><div className="assistant-layout"><section className="card assistant-workspace"><header className="assistant-context"><span className="quick-icon mint"><Sparkles size={23}/></span><div><b>{state.business.name}</b><small>{w('assistantContext')}</small></div><span className="badge badge-paid">VoiceOS</span></header><div ref={host} data-testid="assistant-conversation"/>{!state.configuration.features.voiceStock&&<p role="status">{copy.permission}</p>}<Link className="text-link" href="/app/intelligence">{copy.intelligenceTitle}<ArrowUpRight size={16}/></Link><footer className="assistant-transparency">{copy.rulesOnly}</footer></section><aside className="assistant-sidebar"><section className="card"><CardTitle>{w('businessToday')}</CardTitle><dl className="assistant-context-metrics"><div><dt>{w('salesToday')}</dt><dd>{money(state.metrics.salesTodayPaise,i18n.language)}</dd></div><div><dt>{w('moneyReceived')}</dt><dd>{money(state.metrics.collectedTodayPaise,i18n.language)}</dd></div><div><dt>{w('moneyToCollect')}</dt><dd>{money(state.metrics.outstandingPaise,i18n.language)}</dd></div></dl><div className="assistant-questions">{[copy.exampleSales,w('questionLowStock'),w('questionOutstanding')].map(question=><button key={question} disabled={!state.configuration.features.voiceStock} onClick={()=>voice.request(advanceVoice(question,state))}>{question}<ArrowUpRight size={16}/></button>)}</div></section><section className="card"><CardTitle><Package size={17}/>{w('stockNeedsAttention')}</CardTitle>{low.slice(0,4).map(product=><Link className="assistant-related" key={product.id} href={'/app/stock/'+product.id}><span>{product.name}</span><b>{quantity(product.quantityMilli)} <LocalizedUnit value={product.unit}/></b></Link>)}{!low.length&&<p className="card-note">{w('stockHealthy')}</p>}</section><section className="card"><CardTitle><Wallet size={17}/>{w('moneyToCollect')}</CardTitle>{state.customers.filter(c=>c.balancePaise>0).slice(0,4).map(customer=><Link className="assistant-related" href={'/app/customers/'+customer.id} key={customer.id}><span>{customer.name}</span><b>{money(customer.balancePaise,i18n.language)}</b></Link>)}<Link className="text-link" href="/app/customers">{w('viewCustomers')}<ArrowUpRight size={15}/></Link></section></aside></div></>;
}
