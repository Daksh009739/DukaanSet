'use client';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useVoiceOS} from './voice-os-provider';
import {useApp} from '../app-provider';
import {Button,CardTitle,Select,FormError} from '../ui';
import {LanguageOptions} from '../locale-provider';
import {locale} from '@/lib/locale';
import {osCopy} from '@/lib/voice/os-copy';
import {AssistantVoicePicker} from './assistant-voice-picker';
import styles from './voiceos-3.module.css';

export function VoiceSettings(){const voice=useVoiceOS(),{t:s}=useTranslation('speech'),{i18n}=useTranslation(),copy=osCopy(i18n.language),usage=voice.audioStatus?.usage;return <section className="card settings-form"><CardTitle>{s('settings')}</CardTitle><AssistantVoicePicker/>{usage&&<><h3>{s('usage')}</h3><dl className={styles.usage}><div><dt>{s('requests')}</dt><dd>{usage.requests}</dd></div><div><dt>{s('characters')}</dt><dd>{usage.characters}</dd></div><div><dt>{s('audioSeconds')}</dt><dd>{Math.round(usage.audioSeconds)}</dd></div></dl><p className="card-note">{usage.estimatedCostUsd===null?s('costUnavailable'):s('cost')+' · '+new Intl.NumberFormat('en-IN',{style:'currency',currency:'USD',maximumFractionDigits:3}).format(usage.estimatedCostUsd)}</p></>}<details><summary>{s('permissionHelp')}</summary><p>{s('permissionHint')}</p></details><Button variant="secondary" onClick={()=>voice.launch('unknown')}>{copy.open}</Button></section>;}
export function LanguageSettings(){const app=useApp(),{t:w,i18n}=useTranslation('workspace'),[busy,setBusy]=useState(false),[error,setError]=useState('');return <section className="card settings-form"><CardTitle>{w('displayLanguage')}</CardTitle><p className="card-note">{w('independentLanguages')}</p><Select label={w('displayLanguage')} value={locale(i18n.language)} disabled={busy} onChange={async e=>{setBusy(true);setError('');try{await app.changeLanguage(locale(e.target.value));}catch(cause){setError(app.errorText(cause));}finally{setBusy(false);}}}><LanguageOptions/></Select><FormError message={error}/></section>;}
