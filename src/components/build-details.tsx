'use client';
import { useState } from 'react';
import { api } from '@/lib/client';
import { useApp } from './app-provider';
type Info = { environment: string; branch: string | null; commit: string | null; builtAt: string | null; version: string | null };
export function BuildDetails() {
  const app = useApp();
  const [info, setInfo] = useState<Info | null>(null), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  if (app.state?.configuration.role !== 'owner') return null;
  async function load() {
    setBusy(true); setError('');
    try { setInfo(await api<Info>('/deployment')); } catch (cause) { setError(app.errorText(cause)); } finally { setBusy(false); }
  }
  return <details className="card below-card build-details" onToggle={event => { if (event.currentTarget.open && !info && !busy) void load(); }}>
    <summary>Build details / बिल्ड जानकारी</summary>
    {busy && <p role="status">Loading…</p>}{error && <p role="alert">{error}</p>}
    {info && <dl>{Object.entries(info).filter(([key])=>key!=='ready').map(([key,value])=><div key={key}><dt>{key}</dt><dd>{value || 'Unavailable in local development'}</dd></div>)}</dl>}
  </details>;
}
