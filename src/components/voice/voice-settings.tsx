'use client';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useVoiceOS} from './voice-os-provider';
import {useApp} from '../app-provider';
import {Button,CardTitle,Select,FormError} from '../ui';
import {LanguageOptions} from '../locale-provider';
import {locale} from '@/lib/locale';
import {osCopy} from '@/lib/voice/os-copy';

export function VoiceSettings(){const voice=useVoiceOS(),{t:w,i18n}=useTranslation('workspace'),copy=osCopy(i18n.language);return <section className="card settings-form"><CardTitle>VoiceOS</CardTitle><p className="card-note">{w('voiceSettingsHint')}</p><Select label={copy.language} value={voice.spokenLocale} disabled={voice.capture.phase!=='ready'} onChange={e=>voice.setSpokenLocale(e.target.value as 'en-IN'|'hi-IN')}><option value="en-IN">{copy.spokenEnglish}</option><option value="hi-IN">{copy.spokenHindi}</option></Select><div className="settings-status"><b>{w('speechProvider')}</b><span>{w(voice.supported?'browserSpeechAvailable':'browserSpeechFallback')}</span></div><p>{w('micBehaviour')}</p><p className="card-note">{copy.privacy}</p><details><summary>{w('permissionHelp')}</summary><p>{w('permissionHelpText')}</p></details><Button variant="secondary" onClick={()=>voice.launch('unknown')}>{copy.open}</Button></section>;}
export function LanguageSettings(){const app=useApp(),{t:w,i18n}=useTranslation('workspace'),[busy,setBusy]=useState(false),[error,setError]=useState('');return <section className="card settings-form"><CardTitle>{w('displayLanguage')}</CardTitle><p className="card-note">{w('independentLanguages')}</p><Select label={w('displayLanguage')} value={locale(i18n.language)} disabled={busy} onChange={async e=>{setBusy(true);setError('');try{await app.changeLanguage(locale(e.target.value));}catch(cause){setError(app.errorText(cause));}finally{setBusy(false);}}}><LanguageOptions/></Select><FormError message={error}/></section>;}
