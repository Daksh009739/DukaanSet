'use client';
import {useEffect,useRef,useState} from 'react';
import {Mic,Square,Settings2,ArrowUp} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {osCopy} from '@/lib/voice/os-copy';
import {useVoiceCapture,useVoiceOS} from './voice-os-provider';
import {Button,Field,Select} from '../ui';

export function ConversationInput({onSubmit,question,disabled=false,initial=false,examples,prefill}:{onSubmit:(text:string)=>void;question:string;disabled?:boolean;initial?:boolean;examples?:string[];prefill?:{id:string;text:string}}){
 const copy=osCopy(useTranslation().i18n.language),[text,setText]=useState(''),voice=useVoiceOS(),locale=voice.spokenLocale,setLocale=voice.setSpokenLocale,capture=useVoiceCapture(setText),wasRecording=useRef(false),latest=useRef(text),submit=useRef(onSubmit);latest.current=text;submit.current=onSubmit;
 useEffect(()=>{if(wasRecording.current&&!capture.recording&&capture.completed&&!capture.problem&&!disabled&&latest.current.trim()){submit.current(latest.current);setText('');}wasRecording.current=capture.recording;},[capture.recording]);
 useEffect(()=>{if(disabled)capture.abort();},[disabled]);
 useEffect(()=>{if(prefill){capture.abort();setText(prefill.text);}},[prefill?.id]);
 const problem=capture.problem==='language'?'languageError':capture.problem==='aborted'?'speechError':capture.problem;
 const review=()=>{if(!text.trim()||disabled||capture.recording)return;submit.current(text);setText('');};
 return <div className="voice-conversation-input"><div className="voice-conversation-mic"><button type="button" aria-label={capture.recording?copy.stop:copy.start} className={'conversation-microphone '+(capture.recording?'is-listening':'')} disabled={disabled||capture.supported===false} onClick={()=>capture.recording?capture.stop():capture.start(locale)}>{capture.recording?<Square size={29}/>:<Mic size={32}/>}</button><h2>{capture.recording?copy.listening:question||copy.welcome}</h2><p>{copy.speakOrType}</p></div>
 {initial&&<div className="conversation-suggestions">{(examples||[copy.exampleBill,copy.exampleCustomer,copy.exampleSales]).map(example=><button type="button" key={example} disabled={disabled} onClick={()=>{submit.current(example);setText('');}}>{example}</button>)}</div>}
 <div className="conversation-type" onKeyDown={event=>{if(event.key==='Enter'&&!event.nativeEvent.isComposing&&event.target instanceof HTMLInputElement){event.preventDefault();review();}}}><Field label={copy.command} placeholder={copy.typeRequest} value={text} disabled={disabled||capture.recording} maxLength={5000} onChange={event=>setText(event.target.value)}/><Button type="button" onClick={review} aria-label={copy.review} disabled={disabled||capture.recording||!text.trim()}><ArrowUp size={19}/></Button></div>
 {capture.supported===false&&<p className="card-note" role="status">{copy.fallback}</p>}{problem&&<p className="form-error" role="alert">{copy[problem]}</p>}
 <details className="conversation-settings"><summary><Settings2 size={15}/>{copy.speechSettings}</summary><Select label={copy.language} value={locale} disabled={disabled||capture.recording} onChange={event=>setLocale(event.target.value as 'en-IN'|'hi-IN')}><option value="en-IN">{copy.spokenEnglish}</option><option value="hi-IN">{copy.spokenHindi}</option></Select><p className="card-note">{copy.privacy}</p><p className="card-note">{copy.rulesOnly}</p></details>
 </div>;
}
