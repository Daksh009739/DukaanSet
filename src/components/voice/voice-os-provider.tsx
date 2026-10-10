'use client';
import { createContext,useCallback,useContext,useEffect,useRef,useState,type ReactNode } from 'react';
import { configureRecognition,speechConstructor,type RecognitionLike,type SpeechProblem } from '@/lib/voice/speech';
import type { VoiceCommand,VoiceIntent } from '@/lib/voice/os';
import { useApp } from '../app-provider';

type CaptureState={owner:string;phase:'ready'|'permissionState'|'listening';problem:SpeechProblem|null};
type ContextValue={spokenLocale:'en-IN'|'hi-IN';setSpokenLocale:(value:'en-IN'|'hi-IN')=>void;capture:CaptureState;supported:boolean|null;start:(owner:string,locale:'en-IN'|'hi-IN',onText:(text:string)=>void)=>void;stop:(owner:string)=>void;abort:(owner?:string)=>void;handoff:VoiceCommand|null;send:(command:VoiceCommand)=>void;consume:(intent:VoiceIntent)=>void;launcher:VoiceIntent|null;launch:(intent:VoiceIntent|null)=>void};
const Context=createContext<ContextValue|null>(null);
export function VoiceOSProvider({children}:{children:ReactNode}){
 const app=useApp(),recognition=useRef<RecognitionLike|null>(null),generation=useRef(0),owner=useRef(''),timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const [spokenLocale,setSpokenLocale]=useState<'en-IN'|'hi-IN'>('en-IN');
 const speechKey='ds-spoken-language-'+app.session?.user.id;
 useEffect(()=>{try{const saved=sessionStorage.getItem(speechKey);setSpokenLocale(saved==='hi-IN'?'hi-IN':'en-IN');}catch{}},[speechKey]);
 const chooseSpokenLocale=(value:'en-IN'|'hi-IN')=>{setSpokenLocale(value);try{sessionStorage.setItem(speechKey,value);}catch{}};
 const [capture,setCapture]=useState<CaptureState>({owner:'',phase:'ready',problem:null}),[supported,setSupported]=useState<boolean|null>(null),[handoff,setHandoff]=useState<VoiceCommand|null>(null),[launcher,launch]=useState<VoiceIntent|null>(null);
 const abort=useCallback((requester?:string)=>{if(requester&&requester!==owner.current)return;++generation.current;if(timer.current)clearTimeout(timer.current);timer.current=null;const current=recognition.current;recognition.current=null;if(current){current.onstart=null;current.onend=null;current.onresult=null;current.onerror=null;try{current.abort();}catch{}}setCapture({owner:owner.current,phase:'ready',problem:null});},[]);
 useEffect(()=>{setSupported(Boolean(speechConstructor()));return()=>abort();},[abort]);
 useEffect(()=>{if(!app.online)abort();},[app.online,abort]);
 useEffect(()=>{if(!app.state?.configuration.features.voiceStock)abort();},[app.state?.configuration.features.voiceStock,abort]);
 const start=(requester:string,locale:'en-IN'|'hi-IN',onText:(text:string)=>void)=>{
  abort();owner.current=requester;const Constructor=speechConstructor();
  if(!Constructor||!window.isSecureContext||!app.online||!app.state?.configuration.features.voiceStock){setCapture({owner:requester,phase:'ready',problem:!Constructor?'unsupported':!app.online?'network':'permission'});return;}
  const instance=new Constructor(),version=++generation.current;recognition.current=instance;setCapture({owner:requester,phase:'permissionState',problem:null});
  const valid=()=>version===generation.current&&recognition.current===instance;
  const finish=(problem:SpeechProblem|null=null)=>{if(!valid())return;if(timer.current)clearTimeout(timer.current);timer.current=null;setCapture({owner:requester,phase:'ready',problem});recognition.current=null;++generation.current;instance.onstart=null;instance.onresult=null;instance.onend=null;instance.onerror=null;try{instance.abort();}catch{}};
  configureRecognition(instance,locale,{started:()=>{if(valid())setCapture({owner:requester,phase:'listening',problem:null});},ended:()=>finish(),transcript:text=>{if(valid())onText(text.slice(0,5000));},failed:problem=>finish(problem)});
  // No silent restart; a bounded session also covers a permission dialog left open.
  timer.current=setTimeout(()=>finish('silence'),90000);
  try{instance.start();}catch{finish('speechError');}
 };
 const stop=(requester:string)=>{if(owner.current!==requester||!recognition.current)return;const instance=recognition.current;try{instance.stop();}catch{abort(requester);}if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(()=>{if(recognition.current===instance)abort(requester);},1500);};
 return <Context.Provider value={{spokenLocale,setSpokenLocale:chooseSpokenLocale,capture,supported,start,stop,abort,handoff,send:setHandoff,consume:intent=>setHandoff(previous=>previous?.intent===intent?null:previous),launcher,launch}}>{children}</Context.Provider>;
}
export function useVoiceOS(){const value=useContext(Context);if(!value)throw new Error('VoiceOS requires its scoped provider');return value;}
export function useVoiceCapture(onText:(text:string)=>void){
 const voice=useVoiceOS(),[owner]=useState(()=>crypto.randomUUID()),callback=useRef(onText);callback.current=onText;
 const abort=voice.abort;useEffect(()=>()=>abort(owner),[owner,abort]);
 return {supported:voice.supported,phase:voice.capture.owner===owner?voice.capture.phase:'ready',problem:voice.capture.owner===owner?voice.capture.problem:null,recording:voice.capture.owner===owner&&voice.capture.phase!=='ready',start:(locale:'en-IN'|'hi-IN')=>voice.start(owner,locale,text=>callback.current(text)),stop:()=>voice.stop(owner),abort:()=>voice.abort(owner)};
}
