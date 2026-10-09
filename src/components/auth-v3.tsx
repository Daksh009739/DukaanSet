'use client';
import Link from 'next/link';
import { useRouter,useSearchParams } from 'next/navigation';
import { Suspense,useState } from 'react';
import { I18nextProvider,useTranslation } from 'react-i18next';
import { ArrowLeft,ArrowRight,Check,ShieldCheck,Store } from 'lucide-react';
import i18n from '@/lib/v3-i18n';
import { api,RequestError } from '@/lib/client';
import type { Session } from '@/lib/contracts';
import { Logo } from './brand';
import { DemoButton } from './marketing';
import { Button,Field,FormError } from './ui';
export type AuthMode='login'|'register'|'recovery'|'reset'|'verify'|'invite';
function AuthForm({mode}:{mode:AuthMode}){
  const {t}=useTranslation();const v=useTranslation('v3').t;const router=useRouter();const params=useSearchParams();const token=params.get('token')||'';
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState(''),[local,setLocal]=useState(false);
  const title=mode==='register'?v('registration'):mode==='recovery'?v('forgot'):mode==='reset'?v('reset'):mode==='verify'?v('verifyEmail'):mode==='invite'?v('acceptInvite'):t('loginTitle');
  const hint=mode==='register'?v('registrationHint'):mode==='recovery'?v('forgotHint'):mode==='reset'?v('resetHint'):mode==='verify'?v('verifyHint'):mode==='invite'?v('acceptHint'):t('loginHint');
  const destination=(session:Session)=>session.user.verificationRequired&&!session.user.emailVerified?'/verify-email':session.businesses.length?'/app':'/onboarding/setup';
  async function submit(event:React.FormEvent<HTMLFormElement>){event.preventDefault();if(busy)return;setBusy(true);setError('');const data=new FormData(event.currentTarget);
    try{if(mode==='recovery'){const result=await api<{delivery:string}>('/auth/forgot',{email:data.get('email')});setLocal(result.delivery==='file');setMessage(v('resetRequested'));}
      else if(mode==='reset'){await api('/auth/reset',{token,password:data.get('password'),passwordConfirmation:data.get('passwordConfirmation')});window.history.replaceState(null,'','/reset-password');router.push('/login');}
      else if(mode==='verify'){const session=await api<Session>('/auth/verify',{token});window.history.replaceState(null,'','/verify-email');router.replace(destination(session));router.refresh();}
      else if(mode==='invite'){await api('/auth/acceptinvite',{token});window.history.replaceState(null,'','/accept-invite');router.replace('/app');router.refresh();}
      else{const body=mode==='register'?{name:data.get('name'),email:data.get('email'),password:data.get('password'),passwordConfirmation:data.get('passwordConfirmation'),language:i18n.language}:{email:data.get('email'),password:data.get('password')};const session=await api<Session>(`/auth/${mode}`,body);await i18n.changeLanguage(session.user.language);router.push(destination(session));router.refresh();}
    }catch(cause){setError(cause instanceof RequestError?t(`errors.${cause.code}`,{defaultValue:cause.message}):t('loadError'));}finally{setBusy(false);}
  }
  async function resend(){if(busy)return;setBusy(true);setError('');try{const result=await api<{delivery:string}>('/auth/verification',{});setLocal(result.delivery==='file');setMessage(v('verificationSent'));}catch(cause){setError(cause instanceof RequestError?t(`errors.${cause.code}`,{defaultValue:cause.message}):t('loadError'));}finally{setBusy(false);}}
  return <div className="auth-layout"><aside className="auth-story"><Logo inverted/><div><span className="eyebrow">APNI DUKAAN, SAB SET.</span><h1>{t('authStoryTitle')}</h1><p>{t('authStoryHint')}</p>{['noBillsHint','dueNotOverdue','stockHint'].map(key=><div className="auth-feature" key={key}><Check size={18}/><span>{t(key)}</span></div>)}</div><div className="auth-story-footer"><ShieldCheck size={18}/>{t('secureHint')}</div><span className="auth-orbit" aria-hidden/></aside>
    <main className="auth-main"><div className="auth-top"><Link href="/" className="text-link"><ArrowLeft size={17}/>{t('goWebsite')}</Link><select aria-label={t('language')} value={i18n.language} onChange={event=>void i18n.changeLanguage(event.target.value)}><option value="en">English</option><option value="hi">हिन्दी</option><option value="hinglish">Hinglish</option></select></div><div className="auth-card"><div className="mobile-logo"><Logo/></div><span className="auth-icon"><Store size={25}/></span><h1>{title}</h1><p className="auth-subtitle">{hint}</p>
    <form className="auth-form" onSubmit={submit}>{mode==='register'&&<Field label={t('name')} name="name" required autoComplete="name" maxLength={100}/>}{['register','login','recovery'].includes(mode)&&<Field label={t('email')} name="email" required type="email" autoComplete="email" maxLength={254}/>}{['register','login','reset'].includes(mode)&&<Field label={t('password')} name="password" required type="password" minLength={10} maxLength={128} autoComplete={mode==='login'?'current-password':'new-password'}/>}{['register','reset'].includes(mode)&&<Field label={v('confirmPassword')} name="passwordConfirmation" required type="password" minLength={10} maxLength={128} autoComplete="new-password"/>}{mode==='login'&&<Link href="/forgot-password" className="text-link auth-forgot">{t('forgot')}</Link>}
    {['verify','invite','reset'].includes(mode)&&!token&&mode!=='verify'&&<p className="form-error">{v('invalidLink')}</p>}<FormError message={error}/>{message&&<p className="v3-message" role="status">{message}</p>}{local&&<p className="card-note">{v('deliveryLocal')}</p>}
    {mode==='verify'&&!token?<Button type="button" busy={busy} onClick={()=>void resend()}>{v('resend')}</Button>:<Button busy={busy} type="submit" disabled={['verify','invite','reset'].includes(mode)&&!token}>{mode==='register'?v('createAccount'):mode==='recovery'?v('requestReset'):mode==='reset'?v('savePassword'):mode==='verify'?v('verify'):mode==='invite'?v('accept'):t('signIn')}<ArrowRight size={17}/></Button>}</form>
    {['register','login'].includes(mode)?<><div className="auth-alternative"><span>{t(mode==='register'?'haveAccount':'noAccount')}</span><Link href={mode==='register'?'/login':'/register'}>{t(mode==='register'?'signIn':'register')}</Link></div><div className="auth-demo"><DemoButton>{t('tryDemo')}</DemoButton><small>{t('demoReset')}</small></div></>:<div className="button-row below-card"><Link href="/login" className="text-link">{t('signIn')}</Link>{mode==='reset'&&<Link href="/forgot-password" className="text-link">{v('requestReset')}</Link>}</div>}</div><footer className="auth-footer"><Link href="/privacy">{t('privacy')}</Link><span>© {new Date().getFullYear()} DukaanSet</span><Link href="/help">{t('help')}</Link></footer></main></div>;
}
export function Auth({mode}:{mode:AuthMode}){return <I18nextProvider i18n={i18n}><Suspense fallback={<p>Loading DukaanSet…</p>}><AuthForm mode={mode}/></Suspense></I18nextProvider>;}
