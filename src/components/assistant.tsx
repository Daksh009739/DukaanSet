'use client';
import {useEffect,useRef,useState} from 'react';
import {useTranslation} from 'react-i18next';
import {api} from '@/lib/client';
import {locale} from '@/lib/locale';
import {useApp} from './app-provider';
import {Button,CardTitle,FormError} from './ui';
export function ConfiguredAssistant(){
 const app=useApp(),{t:v,i18n}=useTranslation('v3'),language=locale(i18n.language);
 const [available,setAvailable]=useState(false),[live,setLive]=useState(false),[question,setQuestion]=useState(''),[answer,setAnswer]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const operation=useRef<AbortController|null>(null),scope=useRef('');scope.current=app.businessId+':'+language;
 useEffect(()=>{const controller=new AbortController();setAvailable(false);void api<{available:boolean;recordedAvailable:boolean}>(`/businesses/${app.businessId}/ai`,undefined,controller.signal).then(result=>{setAvailable(result.available||result.recordedAvailable);setLive(result.available);}).catch(()=>{});return()=>controller.abort();},[app.businessId]);
 useEffect(()=>{operation.current?.abort();setAnswer('');setError('');setBusy(false);return()=>operation.current?.abort();},[app.businessId,language]);
 async function ask(event:React.FormEvent){event.preventDefault();if(busy)return;const controller=new AbortController(),requestedScope=scope.current;operation.current=controller;setBusy(true);setError('');setAnswer('');try{const result=await api<{answer:string;locale:string}>(`/businesses/${app.businessId}/ai`,{question,locale:language},controller.signal);if(!controller.signal.aborted&&scope.current===requestedScope&&result.locale===language)setAnswer(result.answer);}catch(cause){if(!controller.signal.aborted&&scope.current===requestedScope)setError(app.errorText(cause));}finally{if(scope.current===requestedScope&&!controller.signal.aborted)setBusy(false);}}
 if(!available)return <p className="card-note below-card">{v('aiUnconfigured')}</p>;
 return <form className="card settings-form below-card" onSubmit={ask}><CardTitle>{v(live?'askAi':'askRecords')}</CardTitle><p className="card-note">{v(live?'aiSharing':'aiRecordedOnly')}</p><label className="field"><span>{v('question')}</span><textarea aria-label={v('question')} value={question} onChange={event=>setQuestion(event.target.value)} maxLength={800} rows={3} required disabled={busy}/></label><Button type="submit" busy={busy} disabled={!app.online}>{v(live?'askAi':'askRecords')}</Button><FormError message={error}/>{answer&&<div className="insights-answer" aria-live="polite"><b>{v('aiAnswer')}</b><p className="assistant-answer">{answer}</p></div>}</form>;
}
