'use client';
import { useEffect,useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mic,ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { voiceAllowed,voiceNavigation,reportAnswer,resolveVoiceProduct,type VoiceCommand,type VoiceIntent } from '@/lib/voice/os';
import { osCopy,intentLabel } from '@/lib/voice/os-copy';
import { useVoiceOS } from './voice-os-provider';
import { VoicePanel } from './voice-panel';
import { useApp } from '../app-provider';
import { useOperations,type Action } from '../operations';
import { Button,Sheet,Select,FormError } from '../ui';
import { api } from '@/lib/client';
import type { VoiceReport } from '@/lib/contracts';

export function ContextVoiceButton({intent}:{intent:VoiceIntent}){const app=useApp(),voice=useVoiceOS(),copy=osCopy(useTranslation().i18n.language);if(!app.state||!voiceAllowed(intent,app.state))return null;return <Button type="button" variant="secondary" onClick={()=>voice.launch(intent)}><Mic size={17}/>{intentLabel(intent,copy)}</Button>;}
export function GlobalVoiceLauncher(){
 const app=useApp(),voice=useVoiceOS(),router=useRouter(),open=useOperations(),language=useTranslation().i18n.language,copy=osCopy(language),[command,setCommand]=useState<VoiceCommand|null>(null),[error,setError]=useState(''),[chosen,setChosen]=useState('');
 const [stats,setStats]=useState<VoiceReport|undefined>();
 useEffect(()=>{setStats(undefined);if(command?.intent!=='report'||!app.state||!voiceAllowed('report',app.state))return;const controller=new AbortController();api<VoiceReport>(`/businesses/${app.businessId}/voice-report?period=${command.fields.period||'today'}`,undefined,controller.signal).then(setStats).catch(cause=>{if(!controller.signal.aborted)setError(app.errorText(cause));});return()=>controller.abort();},[command,app.businessId]);
 if(!app.state?.configuration.features.voiceStock)return null;
 const state=app.state,context=voice.launcher||'unknown';
 const needsStats=Boolean(command?.intent==='report'&&['sales','collections','expenses','topSales'].includes(command.fields.report));
 const answer=command?.intent==='report'&&(!needsStats||stats)?reportAnswer(command,state,language,stats):[];
 const choices=command?.intent==='reorder'?state.demand.groups.filter(g=>{const matches=resolveVoiceProduct(command.fields.query.replace(/\b(?:jo|ki|demand|hai|uske|liye|reorder|draft|bana|banao|do|ka|ke|prepare|order)\b/g,' ').trim(),state.products);return g.matched&&g.suggestedMilli>0&&(!matches.ids.length||matches.ids.includes(g.productId||''));}).map(g=>({id:g.key,label:g.productName+' '+g.variant})):command?.intent==='followup'?state.demand.requestsList.filter(r=>r.eligibleFollowUp&&(!command.fields.customerId||r.customerId===command.fields.customerId)).map(r=>({id:r.id,label:r.productName+' '+r.variant+' · '+r.customerName})):[];
 function close(){voice.abort();voice.launch(null);setCommand(null);setError('');setChosen('');}
 function route(){if(!command||!voiceAllowed(command.intent,state))return;
  const intent=command.intent;if(intent==='unknown'){setError(copy.unknown);return;}
  if(intent==='cancel'){close();return;}
  if(intent==='reorder'||intent==='followup'){const selected=chosen||choices.length===1&&choices[0].id;if(!selected){setError(copy.noResults);return;}router.push('/app/demand?'+(intent==='reorder'?'reorder=':'message=')+encodeURIComponent(selected));close();return;}
  if(intent==='open'){
   const target=voiceNavigation(command,state);if(target){router.push(target);close();return;}setError(copy.noResults);return;
  }
  if(['customer','supplier','payment','purchase','expense'].includes(intent)){voice.send(command);close();open(intent as Action,{voiceCommand:command});return;}
  voice.send(command);router.push(intent==='sale'?'/app/sales/new':intent==='stock'?'/app/stock/voice':intent==='demand'?'/app/demand?voice=1':intent==='closing'?'/app/daily-closing':'/app/reports');close();
 }
 return <><button type="button" className="voiceos-launcher" aria-label={copy.open} onClick={()=>{setCommand(null);setError('');voice.launch('unknown');}}><Mic size={19}/><span>VoiceOS</span></button><Sheet title={copy.title} description={copy.tagline} open={voice.launcher!==null} onOpenChange={value=>{if(!value)close();}}><div className="sheet-body voiceos-global"><p className="voiceos-scope">{copy.scope} · <b>{state.business.name}</b></p><VoicePanel key={context} intent={context} expanded onApply={next=>{setCommand(next);setChosen('');setError('');}}/>
 {command?.intent==='unknown'&&<Select label={copy.selectWorkflow} value={context} onChange={e=>{setCommand(null);voice.launch(e.target.value as VoiceIntent);}}><option value="unknown">—</option>{['sale','stock','customer','payment','demand','purchase','supplier','expense','closing','report'].filter(i=>voiceAllowed(i as VoiceIntent,state)).map(i=><option key={i} value={i}>{intentLabel(i,copy)}</option>)}</Select>}
 {command?.intent==='report'&&<section className="voiceos-answer" aria-label={copy.result}><h3>{copy.result} · {copy[(command.fields.period||'today') as 'today'|'week'|'all']}</h3><dl>{answer.map((row,i)=><div key={i}><dt>{row.label}</dt><dd>{row.value}</dd></div>)}</dl>{!answer.length&&<p role='status'>{needsStats&&!stats&&!error?copy.loading:copy.noResults}</p>}<p className="card-note">{copy.range}</p></section>}
 {choices.length>1&&<Select label={copy.choose} value={chosen} onChange={e=>setChosen(e.target.value)}><option value="">—</option>{choices.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}</Select>}
 <FormError message={error}/>{command&&command.intent!=='report'&&command.intent!=='unknown'&&<Button type="button" disabled={!voiceAllowed(command.intent,state)} onClick={route}>{copy.view}<ArrowUpRight size={17}/></Button>}
 </div></Sheet></>;
}
