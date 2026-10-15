'use client';
import {useEffect,useRef,useState} from 'react';
import {useUnsavedBusinessWork} from '../app-provider';
import {Mic,Pause,Play,ArrowUp,Square,Settings2} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {osCopy} from '@/lib/voice/os-copy';
import {useVoiceCapture,useVoiceOS} from './voice-os-provider';
import {Button,Field} from '../ui';
import type {SpokenReply} from '@/lib/voice/audio-contracts';
import {mayAutoListen} from '@/lib/voice/hands-free';

export function ConversationInput({onSubmit,disabled=false,initial=false,prefill,reply,question,examples}:{onSubmit:(text:string)=>void;disabled?:boolean;initial?:boolean;prefill?:{id:string;text:string};reply?:SpokenReply|null;question?:string;examples?:string[]}){
 const copy=osCopy(useTranslation().i18n.language),s=useTranslation('speech').t,[text,setText]=useState(''),voice=useVoiceOS(),locale=voice.spokenLocale,submit=useRef(onSubmit),blocked=useRef(disabled),consumed=useRef(''),resumed=useRef('');submit.current=onSubmit;blocked.current=disabled;
 const capture=useVoiceCapture(setText,receipt=>{if(blocked.current||consumed.current===receipt.turnId)return;consumed.current=receipt.turnId;submit.current(receipt.text);setText('');});
 useUnsavedBusinessWork(Boolean(text.trim()||capture.recording));
 useEffect(()=>{if(disabled)capture.abort();},[disabled]);
 useEffect(()=>{if(prefill){capture.abort();setText(prefill.text);}},[prefill?.id]);
 useEffect(()=>{const id=voice.loop.sessionId+':'+reply?.id;if(!reply||!reply.continueTurn||!mayAutoListen(voice.loop)||voice.completedReply!==reply.id||voice.playback!=='idle'||capture.recording||disabled||resumed.current===id||prefill?.text)return;const timer=setTimeout(()=>{resumed.current=id;capture.start(locale,true);},450);return()=>clearTimeout(timer);},[reply?.id,voice.completedReply,voice.loop,voice.playback,voice.capture.phase,disabled,locale,prefill?.text]);
 const setupResumed=useRef('');
 useEffect(()=>{const request=voice.setupResume;if(!request||request.sessionId!==voice.loop.sessionId||request.id===setupResumed.current||!mayAutoListen(voice.loop)||!reply?.continueTurn||disabled||voice.playback!=='idle'||capture.recording)return;setupResumed.current=request.id;capture.start(locale,true);},[voice.setupResume,voice.loop,disabled,voice.playback,capture.recording,locale,reply?.id]);
 const problem=capture.problem==='language'?'languageError':capture.problem==='aborted'?'speechError':capture.problem;
 const review=()=>{if(!text.trim()||disabled)return;voice.interruptConversation();voice.resumeConversation();submit.current(text);setText('');};
 const local=reply===undefined,paused=(!local&&(voice.loop.paused||!voice.loop.active||Boolean(voice.audioProblem&&voice.audioProblem!=='voiceFallback')))||Boolean(problem);
 return <div className="voice-conversation-input" data-initial={initial?'true':'false'}><div className="voice-conversation-mic" role="group" aria-label={s('microphoneStatus')}><span className={'conversation-microphone '+(capture.recording?'is-listening':'')} aria-hidden><Mic size={22}/></span><div><h2 role="status">{local&&!capture.recording?question||copy.speakOrType:paused?s('paused'):voice.transcribing?s('transcribing'):capture.phase==='permissionState'?s('permissionState'):capture.phase==='finalizing'?s('finalizing'):capture.recording?copy.listening:voice.playback==='speaking'?s('speaking'):s('waiting')}</h2><p>{capture.recording?s('autoEndHint'):local?copy.rulesOnly:s('handsFreeHint')}</p></div>{local?<Button type="button" variant="secondary" aria-label={capture.recording?copy.stop:copy.start} disabled={disabled||capture.supported===false} onClick={()=>capture.recording?capture.stop():capture.start(locale)}>{capture.recording?<Square size={16}/>:<Mic size={16}/>}</Button>:<Button type="button" variant="secondary" aria-label={paused?s('resume'):s('pause')} disabled={paused&&(disabled||capture.supported===false)} onClick={()=>{if(paused){voice.interruptConversation();voice.resumeConversation();capture.start(locale);}else voice.pauseConversation();}}>{paused?<Play size={16}/>:<Pause size={16}/>} {paused?s('resume'):s('pause')}</Button>}</div>
 {local&&initial&&examples&&<div className="conversation-suggestions">{examples.map(example=><button key={example} type="button" disabled={disabled} onClick={()=>submit.current(example)}>{example}</button>)}</div>}
 <div className="conversation-type" onKeyDown={event=>{if(event.key==='Enter'&&!event.nativeEvent.isComposing&&event.target instanceof HTMLInputElement){event.preventDefault();review();}}}><Field label={copy.command} placeholder={copy.typeRequest} value={text} disabled={disabled} maxLength={5000} onFocus={event=>{voice.pauseConversation();event.currentTarget.scrollIntoView({block:'center',inline:'nearest',behavior:'auto'});}} onChange={event=>setText(event.target.value)}/><Button type="button" onClick={review} aria-label={copy.review} disabled={disabled||!text.trim()}><ArrowUp size={19}/></Button></div>
 {capture.supported===false&&<p className="card-note" role="status">{copy.fallback}</p>}{problem&&<p className="form-error" role="alert">{copy[problem]}</p>}
 {capture.recording&&text&&<p className="sr-only" role="status">{text}</p>}
 {local&&<details className="conversation-settings"><summary><Settings2 size={15}/>{s('permissionHelp')}</summary><p>{s('permissionHint')}</p><p>{s('autoLanguage')}</p></details>}
 </div>;
}
