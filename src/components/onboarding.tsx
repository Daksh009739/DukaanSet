'use client';
import './v3.css';
import { useEffect,useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Store,Package,ArrowRight,Check } from 'lucide-react';
import {localizedError} from '@/lib/locale';
import { api,RequestError } from '@/lib/client';
import type { Category,Session } from '@/lib/contracts';
import { Logo } from './brand';
import { Button,Field,FormError } from './ui';
import { DemoButton } from './marketing';
const categories:Category[]=['grocery','hardware','vegetables','clothing','mobile','general'];
function Setup(){const {t,i18n}=useTranslation();const v=useTranslation('v3').t;const router=useRouter();const [step,setStep]=useState(1),[kind,setKind]=useState<Category>('grocery'),[busy,setBusy]=useState(false),[ready,setReady]=useState(false),[error,setError]=useState('');const [pending,setPending]=useState<Record<string,unknown>|null>(null);
  useEffect(()=>{api<Session>('/session').then(session=>{void i18n.changeLanguage(session.user.language);if(session.user.verificationRequired&&!session.user.emailVerified)router.replace('/verify-email');else if(session.businesses.length)router.replace('/app');else setReady(true);}).catch(()=>router.replace('/login'));},[router]);
  async function chooseLanguage(value:string){setBusy(true);try{await api('/account/language',{language:value});await i18n.changeLanguage(value);setStep(2);}catch(cause){setError(cause instanceof RequestError?localizedError(cause,i18n.language):t('loadError'));}finally{setBusy(false);}}
  async function create(event:React.FormEvent<HTMLFormElement>){event.preventDefault();if(busy)return;setBusy(true);setError('');const data=new FormData(event.currentTarget),body=pending||{name:data.get('name'),category:kind,location:data.get('location'),contact:data.get('contact'),idempotencyKey:crypto.randomUUID()};setPending(body);try{await api('/onboarding',body);setStep(3);setPending(null);}catch(cause){setError(cause instanceof RequestError?localizedError(cause,i18n.language):t('loadError'));}finally{setBusy(false);}}
  if(!ready)return <main className="onboarding-page"><p>{t('loading')}</p></main>;
  return <main className="onboarding-page"><Logo/><div className="onboarding-card card"><span className="eyebrow">{step} / 3</span><h1>{v('onboarding')}</h1><h2>{v(step===1?'languageStep':step===2?'detailsStep':'setupStep')}</h2><FormError message={error}/>{step===1?<div className="onboarding-languages">{[['en','English'],['hi','हिन्दी'],['hinglish','Hinglish']].map(([code,label])=><Button key={code} variant="secondary" busy={busy} onClick={()=>void chooseLanguage(code)}>{label}<ArrowRight size={17}/></Button>)}</div>:step===2?<form onSubmit={create}><fieldset disabled={busy||Boolean(pending)}><Field label={v('shopName')} name="name" required maxLength={100}/><div className="category-cards" role="group" aria-label={t('category')}>{categories.map(category=><button type="button" key={category} aria-pressed={kind===category} onClick={()=>setKind(category)}><Store size={21}/><b>{t(category==='grocery'?'groceries':category)}</b>{kind===category&&<Check size={17}/>}</button>)}</div><Field label={v('location')} name="location" maxLength={160}/><Field label={v('contact')} name="contact" maxLength={80}/></fieldset>{pending&&<p className="card-note">{v('frozen')}</p>}<Button busy={busy} type="submit">{v(pending?'retry':'finish')}<ArrowRight size={17}/></Button></form>:<><p>{v('quickSetupHint')}</p><div className="onboarding-languages"><Link href="/app/stock?setup=1" className="btn btn-primary"><Package size={17}/>{v('addProduct')}</Link><Link href="/app/stock?import=1" className="btn btn-secondary">{v('importProducts')}</Link><DemoButton>{v('tryDemoProducts')}</DemoButton><Link href="/app" className="btn btn-secondary">{v('skip')}<ArrowRight size={17}/></Link></div></>}</div></main>;
}
export function Onboarding(){return <Setup/>;}
