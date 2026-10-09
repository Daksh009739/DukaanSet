'use client';
import Link from 'next/link';
import { useRouter,useSearchParams } from 'next/navigation';
import { Suspense,useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft,ArrowRight,Check,ShieldCheck,Store } from 'lucide-react';
import {locale,localizedError,renderSystemMessage} from '@/lib/locale';
import {LanguageSelector} from './locale-provider';
import { api,RequestError } from '@/lib/client';
import type { Session } from '@/lib/contracts';
import { Logo } from './brand';
import {AuthPassword} from './auth-password';
import {SaleComposition} from './premium-website';
import {copy} from '@/locales/registry';
import { DemoButton } from './marketing';
import {publicHref} from './marketing-content';
import { Button,Field,FormError } from './ui';
export type AuthMode='login'|'register'|'recovery'|'reset'|'verify'|'invite';
function AuthForm({mode}:{mode:AuthMode}){
  const {t,i18n}=useTranslation();const v=useTranslation('v3').t;const router=useRouter();const params=useSearchParams();const token=params.get('token')||'';
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState(''),[local,setLocal]=useState(false);
  const language=locale(i18n.language),homeHref=publicHref('/',language);const brandCopy=copy('marketing',language).v8;const [password,setPassword]=useState(''),[confirmation,setConfirmation]=useState('');
  const title=mode==='register'?v('registration'):mode==='recovery'?v('forgot'):mode==='reset'?v('reset'):mode==='verify'?v('verifyEmail'):mode==='invite'?v('acceptInvite'):t('loginTitle');
  const hint=mode==='register'?v('registrationHint'):mode==='recovery'?v('forgotHint'):mode==='reset'?v('resetHint'):mode==='verify'?v('verifyHint'):mode==='invite'?v('acceptHint'):t('loginHint');
  const destination=(session:Session)=>session.user.verificationRequired&&!session.user.emailVerified?'/verify-email':session.businesses.length?'/app':'/onboarding/setup';
  async function submit(event:React.FormEvent<HTMLFormElement>){event.preventDefault();if(busy)return;if(['register','reset'].includes(mode)&&password!==confirmation){const field=event.currentTarget.elements.namedItem('passwordConfirmation') as HTMLInputElement;field.setCustomValidity(brandCopy.passwordMismatch);field.reportValidity();return;}setBusy(true);setError('');const data=new FormData(event.currentTarget);
    try{if(mode==='recovery'){const result=await api<{delivery:string}>('/auth/forgot',{email:data.get('email')});setLocal(result.delivery==='file');setMessage(v('resetRequested'));}
      else if(mode==='reset'){await api('/auth/reset',{token,password:data.get('password'),passwordConfirmation:data.get('passwordConfirmation')});window.history.replaceState(null,'','/reset-password');router.push('/login');}
      else if(mode==='verify'){const session=await api<Session>('/auth/verify',{token});window.history.replaceState(null,'','/verify-email');router.replace(destination(session));router.refresh();}
      else if(mode==='invite'){await api('/auth/acceptinvite',{token});window.history.replaceState(null,'','/accept-invite');router.replace('/app');router.refresh();}
      else{const body=mode==='register'?{name:data.get('name'),email:data.get('email'),password:data.get('password'),passwordConfirmation:data.get('passwordConfirmation'),language:i18n.language}:{email:data.get('email'),password:data.get('password')};const session=await api<Session>(`/auth/${mode}`,body);await i18n.changeLanguage(session.user.language);router.push(destination(session));router.refresh();}
    }catch(cause){setError(cause instanceof RequestError?localizedError(cause,i18n.language):t('loadError'));}finally{setBusy(false);}
  }
  async function resend(){if(busy)return;setBusy(true);setError('');try{const result=await api<{delivery:string}>('/auth/verification',{});setLocal(result.delivery==='file');setMessage(v('verificationSent'));}catch(cause){setError(cause instanceof RequestError?localizedError(cause,i18n.language):t('loadError'));}finally{setBusy(false);}}
  return <div className="auth-layout"><aside className="auth-story"><Logo inverted href={homeHref}/><div><span className="eyebrow">{t('tagline')}</span><h2>{brandCopy.authTitle}</h2><p>{brandCopy.authHint}</p><div className='auth-product'><SaleComposition/></div>{['noBillsHint','dueNotOverdue','stockHint'].map(key=><div className="auth-feature" key={key}><Check size={18}/><span>{t(key)}</span></div>)}</div><div className="auth-story-footer"><ShieldCheck size={18}/>{t('secureHint')}</div><span className="auth-orbit" aria-hidden/></aside>
    <main className="auth-main"><div className="auth-top"><Link href={homeHref} className="text-link"><ArrowLeft size={17}/>{t('goWebsite')}</Link><LanguageSelector/></div><div className="auth-card"><div className="mobile-logo"><Logo href={homeHref}/></div><span className="auth-icon"><Store size={25}/></span><h1>{title}</h1><p className="auth-subtitle">{hint}</p>
    <form className="auth-form" onSubmit={submit}>{mode==='register'&&<Field label={t('name')} name="name" required autoComplete="name" maxLength={100}/>}{['register','login','recovery'].includes(mode)&&<Field label={t('email')} name="email" required type="email" autoComplete="email" maxLength={254}/>}{['register','login','reset'].includes(mode)&&<AuthPassword label={t('password')} name='password' value={password} onChange={value=>{setPassword(value);const field=document.querySelector<HTMLInputElement>('[name="passwordConfirmation"]');field?.setCustomValidity('');}} login={mode==='login'} hint={mode==='login'?undefined:password.length>=16?brandCopy.passwordStrong:password.length>=10?brandCopy.passwordOkay:brandCopy.passwordShort}/>}{['register','reset'].includes(mode)&&<AuthPassword label={v('confirmPassword')} name='passwordConfirmation' value={confirmation} onChange={setConfirmation} hint={confirmation?confirmation===password?brandCopy.passwordMatch:brandCopy.passwordMismatch:undefined}/>}{mode==='register'&&<div className='auth-terms'><label><input type='checkbox' required name='termsAcknowledged'/><span>{brandCopy.acceptTerms}</span></label><span><Link href={publicHref('/terms',language)} target='_blank'>{brandCopy.terms}</Link> · <Link href={publicHref('/privacy',language)} target='_blank'>{brandCopy.privacy}</Link></span></div>}{mode==='login'&&<Link href="/forgot-password" className="text-link auth-forgot">{t('forgot')}</Link>}
    {['verify','invite','reset'].includes(mode)&&!token&&mode!=='verify'&&<p className="form-error">{v('invalidLink')}</p>}<FormError message={error}/>{message&&<p className="v3-message" role="status">{renderSystemMessage(message,i18n.language)}</p>}{local&&<p className="card-note">{v('deliveryLocal')}</p>}
    {mode==='verify'&&!token?<Button type="button" busy={busy} onClick={()=>void resend()}>{v('resend')}</Button>:<Button busy={busy} type="submit" disabled={['verify','invite','reset'].includes(mode)&&!token}>{mode==='register'?v('createAccount'):mode==='recovery'?v('requestReset'):mode==='reset'?v('savePassword'):mode==='verify'?v('verify'):mode==='invite'?v('accept'):t('signIn')}<ArrowRight size={17}/></Button>}</form>
    {['register','login'].includes(mode)?<><div className="auth-alternative"><span>{t(mode==='register'?'haveAccount':'noAccount')}</span><Link href={mode==='register'?'/login':'/register'}>{t(mode==='register'?'signIn':'register')}</Link></div><div className="auth-demo"><DemoButton>{t('tryDemo')}</DemoButton><small>{t('demoReset')}</small></div></>:<div className="button-row below-card"><Link href="/login" className="text-link">{t('signIn')}</Link>{mode==='reset'&&<Link href="/forgot-password" className="text-link">{v('requestReset')}</Link>}</div>}</div><footer className="auth-footer"><Link href={publicHref('/privacy',language)}>{t('privacy')}</Link><span>© {new Date().getFullYear()} DukaanSet</span><Link href={publicHref('/help',language)}>{t('help')}</Link></footer></main></div>;
}
export function Auth({mode}:{mode:AuthMode}){const {t}=useTranslation();return <Suspense fallback={<p>{t('loading')}</p>}><AuthForm mode={mode}/></Suspense>;}
