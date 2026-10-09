'use client';
import { useState } from 'react';
import { api } from '@/lib/client';
import { useApp } from './app-provider';
import {renderSystemMessage} from '@/lib/locale';
import {useTranslation} from 'react-i18next';
type Info = { environment: string; branch: string | null; commit: string | null; builtAt: string | null; version: string | null };
export function BuildDetails() {
  const app = useApp(),{t,i18n}=useTranslation();
  const [info, setInfo] = useState<Info | null>(null), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  if (app.state?.configuration.role !== 'owner') return null;
  async function load() {
    setBusy(true); setError('');
    try { setInfo(await api<Info>('/deployment')); } catch (cause) { setError(app.errorText(cause)); } finally { setBusy(false); }
  }
  return <details className="card below-card build-details" onToggle={event => { if (event.currentTarget.open && !info && !busy) void load(); }}>
    <summary>{t('buildDetails')}</summary>
    {busy && <p role="status">{t('loading')}</p>}{error && <p role="alert">{renderSystemMessage(error,i18n.language)}</p>}
    {info && <dl>{Object.entries(info).filter(([key])=>key!=='ready').map(([key,value])=><div key={key}><dt>{t(key)}</dt><dd>{key==='environment'&&['local','staging','production'].includes(value||'')?t('environment'+value!.charAt(0).toUpperCase()+value!.slice(1)):value || t('localUnavailable')}</dd></div>)}</dl>}
  </details>;
}
