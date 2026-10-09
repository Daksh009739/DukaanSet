'use client';
import { useEffect,useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/client';
import { useApp } from './app-provider';
import { Button,CardTitle,FormError } from './ui';
export function ConfiguredAssistant(){const app=useApp(),v=useTranslation('v3').t;const [available,setAvailable]=useState(false),[question,setQuestion]=useState(''),[answer,setAnswer]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');useEffect(()=>{void api<{available:boolean}>(`/businesses/${app.businessId}/ai`).then(result=>setAvailable(result.available)).catch(()=>setAvailable(false));},[app.businessId]);async function ask(event:React.FormEvent){event.preventDefault();if(busy)return;setBusy(true);setError('');setAnswer('');try{const result=await api<{answer:string}>(`/businesses/${app.businessId}/ai`,{question});setAnswer(result.answer);}catch(cause){setError(app.errorText(cause));}finally{setBusy(false);}}
  if(!available)return <p className="card-note below-card">{v('aiUnconfigured')}</p>;
  return <form className="card settings-form below-card" onSubmit={ask}><CardTitle>{v('askAi')}</CardTitle><p className="card-note">{v('aiSharing')}</p><label className="field"><span>{v('question')}</span><textarea aria-label={v('question')} value={question} onChange={event=>setQuestion(event.target.value)} maxLength={800} rows={3} required disabled={busy}/></label><Button type="submit" busy={busy} disabled={!app.online}>{v('askAi')}</Button><FormError message={error}/>{answer&&<div className="insights-answer" aria-live="polite"><b>{v('aiAnswer')}</b><p className="assistant-answer">{answer}</p></div>}</form>;
}
