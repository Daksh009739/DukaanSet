'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, ShieldCheck, Store } from 'lucide-react';
import i18n from '@/lib/i18n';
import { api, RequestError } from '@/lib/client';
import type { Language } from '@/lib/contracts';
import { Logo } from './brand';
import { DemoButton } from './marketing';
import { Button, Field, FormError } from './ui';
import { CategorySelect } from './operations';

type AuthMode = 'login' | 'register' | 'recovery';
interface AuthValues {
  name: string;
  email: string;
  password: string;
  businessName: string;
}

function AuthForm({ mode }: { mode: AuthMode }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit } = useForm<AuthValues>();

  const submit = handleSubmit(async (values, event) => {
    if (busy || mode === 'recovery') return;
    setBusy(true);
    setError('');
    try {
      const form = event?.target instanceof HTMLFormElement ? new FormData(event.target) : null;
      const language: Language = i18n.language === 'hi' || i18n.language === 'hinglish' ? i18n.language : 'en';
      const body = mode === 'register'
        ? { ...values, category: form?.get('category') || 'general', language }
        : { email: values.email, password: values.password };
      await api(`/auth/${mode}`, body);
      router.push('/app');
      router.refresh();
    } catch (cause) {
      const key = cause instanceof RequestError ? `errors.${cause.code.toUpperCase()}` : '';
      setError(key && i18n.exists(key) ? String(t(key)) : t('loadError'));
    } finally {
      setBusy(false);
    }
  });

  return (
    <div className="auth-layout">
      <aside className="auth-story">
        <Logo inverted />
        <div>
          <span className="eyebrow">APNI DUKAAN, SAB SET.</span>
          <h1>{t('authStoryTitle')}</h1>
          <p>{t('authStoryHint')}</p>
          {['noBillsHint', 'dueNotOverdue', 'stockHint'].map(key => (
            <div className="auth-feature" key={key}><Check size={18} /><span>{t(key)}</span></div>
          ))}
        </div>
        <div className="auth-story-footer"><ShieldCheck size={18} />{t('secureHint')}</div>
        <span className="auth-orbit" aria-hidden />
      </aside>
      <main className="auth-main">
        <div className="auth-top">
          <Link href="/" className="text-link"><ArrowLeft size={17} />{t('goWebsite')}</Link>
          <select
            aria-label={t('language')}
            value={i18n.language}
            onChange={event => {
              setError('');
              void i18n.changeLanguage(event.target.value as Language);
            }}
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="hinglish">Hinglish</option>
          </select>
        </div>
        <div className="auth-card">
          <div className="mobile-logo"><Logo /></div>
          <span className="auth-icon"><Store size={25} /></span>
          <h1>{t(mode === 'register' ? 'onboardingTitle' : mode === 'recovery' ? 'recoveryTitle' : 'loginTitle')}</h1>
          <p className="auth-subtitle">{t(mode === 'register' ? 'onboardingHint' : mode === 'recovery' ? 'recoveryHint' : 'loginHint')}</p>
          {mode === 'recovery' ? (
            <>
              <Link className="btn btn-primary" href="https://github.com/Daksh009739/DukaanSet/issues" target="_blank" rel="noopener noreferrer">
                {t('ownerSupport')}<ArrowUpRight size={17} />
              </Link>
              <Link className="text-link below-card" href="/login">{t('signIn')}</Link>
            </>
          ) : (
            <>
              <form onSubmit={submit} className="auth-form">
                {mode === 'register' && <Field label={t('name')} autoComplete="name" maxLength={100} required {...register('name')} />}
                <Field label={t('email')} autoComplete="email" type="email" maxLength={254} required {...register('email')} />
                <Field
                  label={t('password')}
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  type="password"
                  minLength={mode === 'register' ? 10 : undefined}
                  maxLength={128}
                  required
                  {...register('password')}
                />
                {mode === 'register' && (
                  <>
                    <div className="form-section-label">{t('business')}</div>
                    <Field label={t('businessName')} maxLength={100} required {...register('businessName')} />
                    <CategorySelect />
                    <p className="form-note">{t('secureHint')}</p>
                  </>
                )}
                {mode === 'login' && <Link className="text-link auth-forgot" href="/forgot-password">{t('forgot')}</Link>}
                <FormError message={error} />
                <Button busy={busy} type="submit">{t(mode === 'register' ? 'createShop' : 'signIn')}<ArrowRight size={17} /></Button>
              </form>
              <div className="auth-alternative">
                <span>{t(mode === 'register' ? 'haveAccount' : 'noAccount')}</span>
                <Link href={mode === 'register' ? '/login' : '/register'}>{t(mode === 'register' ? 'signIn' : 'register')}</Link>
              </div>
              <div className="auth-demo"><DemoButton>{t('tryDemo')}</DemoButton><small>{t('demoReset')}</small></div>
            </>
          )}
        </div>
        <footer className="auth-footer">
          <Link href="/privacy">{t('privacy')}</Link>
          <span>© {new Date().getFullYear()} DukaanSet</span>
          <Link href="/help">{t('help')}</Link>
        </footer>
      </main>
    </div>
  );
}

export function Auth({ mode }: { mode: AuthMode }) {
  return <I18nextProvider i18n={i18n}><AuthForm mode={mode} /></I18nextProvider>;
}
