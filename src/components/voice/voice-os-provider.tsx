'use client';
import { createContext,useCallback,useContext,useEffect,useRef,useState,type ReactNode } from 'react';
import { browserSpeechAdapter,type SpeechSession,type SpeechTranscriptionAdapter,type SpeechProblem } from '@/lib/voice/speech';
import type { VoiceCommand,VoiceIntent } from '@/lib/voice/os';
import type {VoicePageContext} from '@/lib/voice/discovery';
export type VoiceDiscovery={id:string;text:string;businessId:string;context:VoicePageContext};
import { useApp } from '../app-provider';
import {useAssistantAudio} from './use-assistant-audio';
import {cloudSpeechAdapter} from '@/lib/voice/cloud-speech';
import {conversationLanguage} from '@/lib/voice/conversation-language';
import {speechLocale,type ConversationMode,type SpokenReply} from '@/lib/voice/audio-contracts';
import type {Language} from '@/lib/contracts';

type CaptureState={owner:string;phase:'ready'|'permissionState'|'listening';problem:SpeechProblem|null;completed?:boolean};
type ContextValue=ReturnType<typeof useAssistantAudio>&{discovery:VoiceDiscovery|null;discover:(context:VoicePageContext,text?:string)=>void;spokenLocale:'en-IN'|'hi-IN';capture:CaptureState;supported:boolean|null;transcribing:boolean;mode:ConversationMode;setMode:(mode:ConversationMode)=>void;talkActive:boolean;pauseConversation:()=>void;conversationLanguage:Language;conversationTurn:number;observeUtterance:(text:string)=>Language;restoreConversationLanguage:(language:Language)=>void;publishReply:(reply:SpokenReply,automatic?:boolean)=>void;start:(owner:string,locale:'en-IN'|'hi-IN',onText:(text:string)=>void)=>void;stop:(owner:string)=>void;abort:(owner?:string)=>void;handoff:VoiceCommand|null;send:(command:VoiceCommand)=>void;consume:(intent:VoiceIntent)=>void;launcher:VoiceIntent|null;launch:(intent:VoiceIntent|null)=>void;globalRequest:VoiceCommand|null;request:(command:VoiceCommand)=>void;clearRequest:()=>void;workspace:HTMLElement|null;setWorkspace:(node:HTMLElement|null)=>void};
const Context=createContext<ContextValue|null>(null);
export function VoiceOSProvider({children,adapter=browserSpeechAdapter}:{children:ReactNode;adapter?:SpeechTranscriptionAdapter}){
 const app=useApp(),recognition=useRef<SpeechSession|null>(null),generation=useRef(0),owner=useRef(''),timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const audio=useAssistantAudio(),[replyLanguage,setReplyLanguage]=useState<Language>('hinglish'),languageRef=useRef<Language>('hinglish'),languageScope=useRef(''),[conversationTurn,setConversationTurn]=useState(0),[mode,setModeState]=useState<ConversationMode>('quick'),[talkActive,setTalkActive]=useState(false),[transcribing,setTranscribing]=useState(false),conversationScope=app.session?.user.id+':'+app.businessId;
 const finishCurrent=useRef<(()=>void)|null>(null);
 const spokenLocale=speechLocale(replyLanguage);
 const observeUtterance=(text:string)=>{const language=conversationLanguage(text,languageRef.current);languageRef.current=language;setReplyLanguage(language);setConversationTurn(value=>value+1);return language;};
 const restoreConversationLanguage=(language:Language)=>{languageScope.current=conversationScope;languageRef.current=language;setReplyLanguage(language);};
 const [capture,setCapture]=useState<CaptureState>({owner:'',phase:'ready',problem:null}),[supported,setSupported]=useState<boolean|null>(null),[handoff,setHandoff]=useState<VoiceCommand|null>(null),[launcher,setLauncher]=useState<VoiceIntent|null>(null);
 const [discovery,setDiscovery]=useState<VoiceDiscovery|null>(null);
 const [globalRequest,setGlobalRequest]=useState<VoiceCommand|null>(null),[workspace,setWorkspace]=useState<HTMLElement|null>(null);
 const clearRequest=useCallback(()=>setGlobalRequest(null),[]);
 const abort=useCallback((requester?:string)=>{if(requester&&requester!==owner.current)return;++generation.current;if(timer.current)clearTimeout(timer.current);timer.current=null;const current=recognition.current;recognition.current=null;finishCurrent.current=null;if(current){try{current.abort();}catch{}}setCapture({owner:owner.current,phase:'ready',problem:null});},[]);
 const pauseConversation=useCallback(()=>{abort();audio.stopSpeaking();setTalkActive(false);setTranscribing(false);},[abort,audio.stopSpeaking]);
 const launch=useCallback((intent:VoiceIntent|null)=>{if(intent===null)pauseConversation();setDiscovery(null);setLauncher(intent);},[pauseConversation]);
 const discover=(context:VoicePageContext,text='')=>{pauseConversation();setDiscovery({id:crypto.randomUUID(),text,businessId:app.businessId,context});setLauncher(context.intent);};
 const request=useCallback((command:VoiceCommand)=>{setGlobalRequest(command);launch('unknown');},[launch]);
 const setMode=(value:ConversationMode)=>{pauseConversation();setModeState(value);};
 const publishReply=(reply:SpokenReply,automatic=true)=>{abort();void audio.speak(reply,{automatic});};
 const useCloud=Boolean(audio.audioStatus?.sttConfigured&&audio.preferences.cloudAudioConsent);
 useEffect(()=>{setSupported(useCloud?cloudSpeechAdapter(app.businessId,setTranscribing).available():adapter.available());return()=>abort();},[abort,adapter,useCloud,app.businessId]);
 useEffect(()=>{setHandoff(null);setGlobalRequest(null);pauseConversation();if(languageScope.current!==conversationScope){languageScope.current=conversationScope;languageRef.current='hinglish';setReplyLanguage('hinglish');}setConversationTurn(0);},[app.businessId,app.session?.user.id,pauseConversation]);
 useEffect(()=>{const hidden=()=>{if(document.visibilityState==='hidden')pauseConversation();};window.addEventListener('pagehide',pauseConversation);document.addEventListener('visibilitychange',hidden);return()=>{window.removeEventListener('pagehide',pauseConversation);document.removeEventListener('visibilitychange',hidden);};},[pauseConversation]);
 useEffect(()=>{if(!app.online)pauseConversation();},[app.online,pauseConversation]);
 useEffect(()=>{if(!app.state?.configuration.features.voiceStock)pauseConversation();},[app.state?.configuration.features.voiceStock,pauseConversation]);
 const start=(requester:string,locale:'en-IN'|'hi-IN',onText:(text:string)=>void)=>{
  abort();audio.stopSpeaking();setTranscribing(false);owner.current=requester;const activeAdapter=useCloud?cloudSpeechAdapter(app.businessId,setTranscribing):adapter;
  if(!activeAdapter.available()||!window.isSecureContext||!app.online||!app.state?.configuration.features.voiceStock){setCapture({owner:requester,phase:'ready',problem:!activeAdapter.available()?'unsupported':!app.online?'network':'permission'});return;}
  if(mode==='talk')setTalkActive(true);
  const version=++generation.current;let instance:SpeechSession;let finalText='';let detectedLanguages:string[]=[];
  const valid=()=>version===generation.current&&recognition.current===instance;
  const finish=(problem:SpeechProblem|null=null)=>{if(!valid())return;if(timer.current)clearTimeout(timer.current);timer.current=null;finishCurrent.current=null;if(!problem&&finalText.trim()){languageRef.current=conversationLanguage(finalText,languageRef.current,detectedLanguages);onText(finalText);}setCapture({owner:requester,phase:'ready',completed:!problem&&Boolean(finalText.trim()),problem:problem||(!finalText.trim()?'silence':null)});recognition.current=null;++generation.current;try{instance.abort();}catch{}};
  try{instance=activeAdapter.create(locale,{started:()=>{if(valid())setCapture({owner:requester,phase:'listening',problem:null});},ended:()=>finish(),transcript:(text,final,languages)=>{if(valid()){finalText=final.slice(0,5000);detectedLanguages=languages?.filter(value=>value==='en'||value==='hi')||[];onText(text.slice(0,5000));}},failed:problem=>{setTalkActive(false);finish(problem);}});}catch{setTalkActive(false);setCapture({owner:requester,phase:'ready',problem:'unsupported'});return;}
  recognition.current=instance;finishCurrent.current=()=>finish();setCapture({owner:requester,phase:'permissionState',problem:null});
  timer.current=setTimeout(()=>finish('silence'),90000);
  try{instance.start();}catch{finish('speechError');}
 };
 const stop=(requester:string)=>{if(owner.current!==requester||!recognition.current)return;const instance=recognition.current;try{instance.stop();}catch{finishCurrent.current?.();return;}if(recognition.current!==instance)return;if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(()=>{if(recognition.current===instance)finishCurrent.current?.();},useCloud?30000:1500);};
 return <Context.Provider value={{...audio,discovery,discover,spokenLocale,capture,supported,transcribing,mode,setMode,talkActive,pauseConversation,conversationLanguage:replyLanguage,conversationTurn,observeUtterance,restoreConversationLanguage,publishReply,start,stop,abort,handoff,send:setHandoff,consume:intent=>setHandoff(previous=>previous?.intent===intent?null:previous),launcher,launch,globalRequest,request,clearRequest,workspace,setWorkspace}}>{children}</Context.Provider>;
}
export function useVoiceOS(){const value=useContext(Context);if(!value)throw new Error('VoiceOS requires its scoped provider');return value;}
export function useVoiceCapture(onText:(text:string)=>void){
 const voice=useVoiceOS(),[owner]=useState(()=>crypto.randomUUID()),callback=useRef(onText);callback.current=onText;
 const abort=voice.abort;useEffect(()=>()=>abort(owner),[owner,abort]);
 return {completed:voice.capture.owner===owner&&Boolean(voice.capture.completed),supported:voice.supported,phase:voice.capture.owner===owner?voice.capture.phase:'ready',problem:voice.capture.owner===owner?voice.capture.problem:null,recording:voice.capture.owner===owner&&voice.capture.phase!=='ready',start:(locale:'en-IN'|'hi-IN')=>voice.start(owner,locale,text=>callback.current(text)),stop:()=>voice.stop(owner),abort:()=>voice.abort(owner)};
}
