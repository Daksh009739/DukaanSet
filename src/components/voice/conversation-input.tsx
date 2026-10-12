'use client';
import {useEffect,useRef,useState} from 'react';
import {useUnsavedBusinessWork} from '../app-provider';
import {Mic,Square,Settings2,ArrowUp,ArrowUpRight,ShieldCheck} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {osCopy} from '@/lib/voice/os-copy';
import {useVoiceCapture,useVoiceOS} from './voice-os-provider';
import {Button,Field} from '../ui';
import type {SpokenReply} from '@/lib/voice/audio-contracts';

export function ConversationInput({onSubmit,question,disabled=false,initial=false,examples,prefill,reply}:{onSubmit:(text:string)=>void;question:string;disabled?:boolean;initial?:boolean;examples?:string[];prefill?:{id:string;text:string};reply?:SpokenReply|null}){
 const w=useTranslation('workspace').t;
 const copy=osCopy(useTranslation().i18n.language),s=useTranslation('speech').t,[text,setText]=useState(''),voice=useVoiceOS(),locale=voice.spokenLocale,capture=useVoiceCapture(setText),wasRecording=useRef(false),latest=useRef(text),submit=useRef(onSubmit),resumed=useRef('');latest.current=text;submit.current=onSubmit;
 useUnsavedBusinessWork(Boolean(text.trim()||capture.recording));
 useEffect(()=>{if(wasRecording.current&&!capture.recording&&capture.completed&&!capture.problem&&!disabled&&latest.current.trim()){submit.current(latest.current);setText('');}wasRecording.current=capture.recording;},[capture.recording]);
 useEffect(()=>{if(disabled)capture.abort();},[disabled]);
 useEffect(()=>{if(prefill){capture.abort();setText(prefill.text);}},[prefill?.id]);
 useEffect(()=>{if(!reply||!reply.continueTurn||voice.mode!=='talk'||!voice.talkActive||voice.completedReply!==reply.id||voice.playback!=='idle'||voice.capture.phase!=='ready'||disabled||resumed.current===reply.id)return;resumed.current=reply.id;const timer=setTimeout(()=>capture.start(locale),450);return()=>clearTimeout(timer);},[reply?.id,voice.completedReply,voice.mode,voice.talkActive,voice.playback,voice.capture.phase,disabled]);
 const problem=capture.problem==='language'?'languageError':capture.problem==='aborted'?'speechError':capture.problem;
 const review=()=>{if(!text.trim()||disabled||capture.recording)return;voice.pauseConversation();submit.current(text);setText('');};
 return <div className="voice-conversation-input" data-initial={initial?'true':'false'}><div className="voice-conversation-mic"><button type="button" aria-label={capture.recording?copy.stop:copy.start} className={'conversation-microphone '+(capture.recording?'is-listening':'')} disabled={disabled||capture.supported===false} onClick={()=>capture.recording?voice.transcribing?voice.pauseConversation():capture.stop():capture.start(locale)}>{capture.recording?<Square size={29}/>:<Mic size={32}/>}</button><h2>{voice.transcribing?s('transcribing'):capture.recording?copy.listening:initial?copy.speakOrType:question||copy.welcome}</h2><p>{voice.transcribing?s('recording'):initial?copy.rulesOnly:copy.speakOrType}</p>{capture.recording&&!voice.transcribing&&<span className="conversation-listening-wave" aria-hidden>{[0,1,2,3,4].map(i=><i key={i}/>)}</span>}</div>
 {initial&&<><p className="conversation-example-label">{w('overlays.trySaying')}</p><div className="conversation-suggestions">{(examples||[copy.exampleBill,copy.exampleCustomer,copy.exampleSales]).map(example=><button type="button" key={example} disabled={disabled} onClick={()=>{submit.current(example);setText('');}}><span>{example}</span><ArrowUpRight size={16} aria-hidden/></button>)}</div></>}
 <div className="conversation-type" onKeyDown={event=>{if(event.key==='Enter'&&!event.nativeEvent.isComposing&&event.target instanceof HTMLInputElement){event.preventDefault();review();}}}><Field label={copy.command} placeholder={copy.typeRequest} value={text} disabled={disabled||capture.recording} maxLength={5000} onChange={event=>setText(event.target.value)}/><Button type="button" onClick={review} aria-label={copy.review} disabled={disabled||capture.recording||!text.trim()}><ArrowUp size={19}/></Button></div>
 {initial&&<p className="conversation-review-note"><ShieldCheck size={14} aria-hidden/>{w('overlays.reviewHint')}</p>}
 {capture.supported===false&&<p className="card-note" role="status">{copy.fallback}</p>}{problem&&<p className="form-error" role="alert">{copy[problem]}</p>}
 {capture.recording&&text&&<p className="sr-only" role="status">{text}</p>}
 <details className="conversation-settings"><summary><Settings2 size={15}/>{s('permissionHelp')}</summary><p className="card-note">{s('permissionHint')}</p><p className="card-note">{s('autoLanguage')}</p><p className="card-note">{voice.audioStatus?.sttConfigured&&voice.preferences.cloudAudioConsent?s('cloudRecognition'):s('deviceRecognition')}</p></details>
 </div>;
}
