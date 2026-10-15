'use client';
import './v3.css';
import {useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';
import {useTranslation} from 'react-i18next';
import {ArrowRight} from 'lucide-react';
import {api,RequestError} from '@/lib/client';
import {localizedError} from '@/lib/locale';
import {businessCategories} from '@/lib/business-modes';
import type {Category,Session} from '@/lib/contracts';
import {Logo} from './brand';
import {Button,Field,Select,FormError} from './ui';
import {VoiceQuickDemo} from './voice/quick-demo';
export function Onboarding(){const {t,i18n}=useTranslation(),w=useTranslation('workspace').t,s=(key:string)=>w('growth.'+key),router=useRouter(),[ready,setReady]=useState(false),[name,setName]=useState(''),[business,setBusiness]=useState(''),[category,setCategory]=useState<Category>('grocery'),[busy,setBusy]=useState(false),[error,setError]=useState(''),[pending,setPending]=useState<Record<string,unknown>|null>(null);useEffect(()=>{let active=true;void api<Session>('/session').then(session=>{if(!active)return;void i18n.changeLanguage(session.user.language);if(session.user.verificationRequired&&!session.user.emailVerified)router.replace('/verify-email');else if(session.businesses.length)router.replace('/app');else{setName(session.user.name);setReady(true);}}).catch(()=>router.replace('/login'));return()=>{active=false;};},[router]);return <main className="onboarding-page"><Logo/><div className="onboarding-card card"><h1>{s('setupTitle')}</h1><p>{s('setupHint')}</p><VoiceQuickDemo/>{!ready?<p>{t('loading')}</p>:<form onSubmit={async e=>{e.preventDefault();setBusy(true);setError('');const body=pending||{name:business,merchantName:name,category,idempotencyKey:crypto.randomUUID()};setPending(body);try{await api('/onboarding',body);router.replace('/app/ai?welcome=1');router.refresh();}catch(cause){if(cause instanceof RequestError&&cause.status<500)setPending(null);setError(cause instanceof RequestError?localizedError(cause,i18n.language):t('loadError'));}finally{setBusy(false);}}}><fieldset disabled={busy||Boolean(pending)}><Field label={s('merchantName')} required maxLength={100} value={name} onChange={e=>setName(e.target.value)}/><Field label={s('businessName')} required maxLength={100} value={business} onChange={e=>setBusiness(e.target.value)}/><Select label={s('categoryQuestion')} value={category} onChange={e=>setCategory(e.target.value as Category)}>{businessCategories.map(c=><option value={c} key={c}>{t(c==='grocery'?'groceries':c)}</option>)}</Select></fieldset><FormError message={error}/><Button busy={busy} type="submit">{s(pending?'retrySetup':'openWorkspace')}<ArrowRight size={17}/></Button></form>}</div></main>;}
