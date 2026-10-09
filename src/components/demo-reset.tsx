'use client';
import '@/lib/v2-i18n';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RotateCcw } from 'lucide-react';
import { useApp } from './app-provider';
import { Button, FormError, Sheet } from './ui';
export function DemoReset() {
  const app = useApp(); const { t } = useTranslation('v2'); const [open, setOpen] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  if (!app.session?.user.demo) return null;
  async function reset() { setBusy(true); setError(''); try { await app.resetDemo(); setOpen(false); app.notify(t('resetDone')); } catch (cause) { setError(app.errorText(cause)); } finally { setBusy(false); } }
  return <><Button variant="ghost" className="demo-reset-button" disabled={app.writing || !app.online} onClick={() => setOpen(true)}><RotateCcw size={14}/>{t('reset')}</Button><Sheet title={t('resetTitle')} description={t('resetHint')} open={open} onOpenChange={value => { if (!busy) setOpen(value); }}><div className="sheet-body"><p>{t('resetHint')}</p><FormError message={error}/><div className="button-row"><Button variant="secondary" onClick={() => setOpen(false)} disabled={busy}>{t('cancel')}</Button><Button variant="danger" busy={busy} onClick={reset}>{t('resetConfirm')}</Button></div></div></Sheet></>;
}
