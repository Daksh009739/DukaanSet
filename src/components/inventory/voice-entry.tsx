'use client';

import Link from 'next/link';
import { Mic, ArrowUpRight, History } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { voiceCopy } from '@/lib/voice/copy';
import './voice-entry.css';

export function StockVoiceEntry() {
  const { i18n } = useTranslation();
  const copy = voiceCopy(i18n.language);
  return <section className="stock-voice-entry" aria-label={copy.entryTitle}>
    <span className="stock-voice-icon" aria-hidden><Mic size={28}/></span>
    <div className="stock-voice-copy"><strong>{copy.entryTitle}</strong><p>{copy.entryHint}</p></div>
    <div className="stock-voice-actions">
      <Link className="btn btn-primary" href="/app/stock/voice"><Mic size={18}/>{copy.entryAction}<ArrowUpRight size={17}/></Link>
      <Link className="text-link" href="/app/stock/voice-history"><History size={15}/>{copy.history}</Link>
    </div>
  </section>;
}
