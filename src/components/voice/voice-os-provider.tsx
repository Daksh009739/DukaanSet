'use client';
import { createContext,useCallback,useContext,useEffect,useRef,useState,type ReactNode } from 'react';
import { browserSpeechAdapter,type SpeechSession,type SpeechTranscriptionAdapter,type SpeechProblem } from '@/lib/voice/speech';
import type { VoiceCommand,VoiceIntent } from '@/lib/voice/os';
import { useApp } from '../app-provider';

type CaptureState={owner:string;phase:'ready'|'permissionState'|'listening';problem:SpeechProblem|null;completed?:boolean};
type ContextValue={spokenLocale:'en-IN'|'hi-IN';setSpokenLocale:(value:'en-IN'|'hi-IN')=>void;capture:CaptureState;supported:boolean|null;start:(owner:string,locale:'en-IN'|'hi-IN',onText:(text:string)=>void)=>void;stop:(owner:string)=>void;abort:(owner?:string)=>void;handoff:VoiceCommand|null;send:(command:VoiceCommand)=>void;consume:(intent:VoiceIntent)=>void;launcher:VoiceIntent|null;launch:(intent:VoiceIntent|null)=>void;globalRequest:VoiceCommand|null;request:(command:VoiceCommand)=>void;clearRequest:()=>void;workspace:HTMLElement|null;setWorkspace:(node:HTMLElement|null)=>void};
const Context=createContext<ContextValue|null>(null);
export function VoiceOSProvider({children,adapter=browserSpeechAdapter}:{children:ReactNode;adapter?:SpeechTranscriptionAdapter}){
 const app=useApp(),recognition=useRef<SpeechSession|null>(null),generation=useRef(0),owner=useRef(''),timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const finishCurrent=useRef<(()=>void)|null>(null);
 const [spokenLocale,setSpokenLocale]=useState<'en-IN'|'hi-IN'>('en-IN');
 const speechKey='ds-spoken-language-'+app.session?.user.id;
 useEffect(()=>{try{const saved=sessionStorage.getItem(speechKey);setSpokenLocale(saved==='hi-IN'?'hi-IN':'en-IN');}catch{}},[speechKey]);
 const chooseSpokenLocale=(value:'en-IN'|'hi-IN')=>{setSpokenLocale(value);try{sessionStorage.setItem(speechKey,value);}catch{}};
 const [capture,setCapture]=useState<CaptureState>({owner:'',phase:'ready',problem:null}),[supported,setSupported]=useState<boolean|null>(null),[handoff,setHandoff]=useState<VoiceCommand|null>(null),[launcher,launch]=useState<VoiceIntent|null>(null);
 const [globalRequest,setGlobalRequest]=useState<VoiceCommand|null>(null),[workspace,setWorkspace]=useState<HTMLElement|null>(null);
 const request=useCallback((command:VoiceCommand)=>{setGlobalRequest(command);launch('unknown');},[]),clearRequest=useCallback(()=>setGlobalRequest(null),[]);
 const abort=useCallback((requester?:string)=>{if(requester&&requester!==owner.current)return;++generation.current;if(timer.current)clearTimeout(timer.current);timer.current=null;const current=recognition.current;recognition.current=null;finishCurrent.current=null;if(current){try{current.abort();}catch{}}setCapture({owner:owner.current,phase:'ready',problem:null});},[]);
 useEffect(()=>{setSupported(adapter.available());return()=>abort();},[abort,adapter]);
 useEffect(()=>{setHandoff(null);setGlobalRequest(null);abort();},[app.businessId,abort]);
 useEffect(()=>{if(!app.online)abort();},[app.online,abort]);
 useEffect(()=>{if(!app.state?.configuration.features.voiceStock)abort();},[app.state?.configuration.features.voiceStock,abort]);
 const start=(requester:string,locale:'en-IN'|'hi-IN',onText:(text:string)=>void)=>{
  abort();owner.current=requester;
  if(!adapter.available()||!window.isSecureContext||!app.online||!app.state?.configuration.features.voiceStock){setCapture({owner:requester,phase:'ready',problem:!adapter.available()?'unsupported':!app.online?'network':'permission'});return;}
  const version=++generation.current;let instance:SpeechSession;let finalText='';
  const valid=()=>version===generation.current&&recognition.current===instance;
  const finish=(problem:SpeechProblem|null=null)=>{if(!valid())return;if(timer.current)clearTimeout(timer.current);timer.current=null;finishCurrent.current=null;if(!problem&&finalText.trim())onText(finalText);setCapture({owner:requester,phase:'ready',completed:!problem&&Boolean(finalText.trim()),problem:problem||(!finalText.trim()?'silence':null)});recognition.current=null;++generation.current;try{instance.abort();}catch{}};
  try{instance=adapter.create(locale,{started:()=>{if(valid())setCapture({owner:requester,phase:'listening',problem:null});},ended:()=>finish(),transcript:(text,final)=>{if(valid()){finalText=final.slice(0,5000);onText(text.slice(0,5000));}},failed:problem=>finish(problem)});}catch{setCapture({owner:requester,phase:'ready',problem:'unsupported'});return;}
  recognition.current=instance;finishCurrent.current=()=>finish();setCapture({owner:requester,phase:'permissionState',problem:null});
  timer.current=setTimeout(()=>finish('silence'),90000);
  try{instance.start();}catch{finish('speechError');}
 };
 const stop=(requester:string)=>{if(owner.current!==requester||!recognition.current)return;const instance=recognition.current;try{instance.stop();}catch{finishCurrent.current?.();return;}if(recognition.current!==instance)return;if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(()=>{if(recognition.current===instance)finishCurrent.current?.();},1500);};
 return <Context.Provider value={{spokenLocale,setSpokenLocale:chooseSpokenLocale,capture,supported,start,stop,abort,handoff,send:setHandoff,consume:intent=>setHandoff(previous=>previous?.intent===intent?null:previous),launcher,launch,globalRequest,request,clearRequest,workspace,setWorkspace}}>{children}</Context.Provider>;
}
export function useVoiceOS(){const value=useContext(Context);if(!value)throw new Error('VoiceOS requires its scoped provider');return value;}
export function useVoiceCapture(onText:(text:string)=>void){
 const voice=useVoiceOS(),[owner]=useState(()=>crypto.randomUUID()),callback=useRef(onText);callback.current=onText;
 const abort=voice.abort;useEffect(()=>()=>abort(owner),[owner,abort]);
 return {completed:voice.capture.owner===owner&&Boolean(voice.capture.completed),supported:voice.supported,phase:voice.capture.owner===owner?voice.capture.phase:'ready',problem:voice.capture.owner===owner?voice.capture.problem:null,recording:voice.capture.owner===owner&&voice.capture.phase!=='ready',start:(locale:'en-IN'|'hi-IN')=>voice.start(owner,locale,text=>callback.current(text)),stop:()=>voice.stop(owner),abort:()=>voice.abort(owner)};
}
