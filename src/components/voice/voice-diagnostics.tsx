'use client';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {voiceDiagnostics} from '@/lib/voice/diagnostics';
import {Button} from '../ui';
export function VoiceDiagnostics(){const w=useTranslation('workspace').t,[events,setEvents]=useState(voiceDiagnostics);return process.env.NODE_ENV==='development'?<details><summary>{w('voiceDiagnostics')}</summary><p className="card-note">{w('voiceDiagnosticsHint')}</p><Button variant="ghost" onClick={()=>setEvents(voiceDiagnostics())}>{w('refreshDiagnostics')}</Button><pre className="voice-diagnostics">{JSON.stringify(events,null,2)}</pre></details>:null;}
