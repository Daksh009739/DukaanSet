'use client';
import {createContext,useCallback,useContext,useEffect,useRef,useState,type ReactNode} from 'react';
import {useTranslation} from 'react-i18next';
import {browserSpeechAdapter,type SpeechSession,type SpeechTranscriptionAdapter,type SpeechProblem} from '@/lib/voice/speech';
import {SpeechTurn,speechEndpointPolicy,type CapturePhase,type FinalUtterance} from '@/lib/voice/speech-turn';
import {recordSpeechDiagnostic} from '@/lib/voice/diagnostics';
import type {VoiceCommand,VoiceIntent} from '@/lib/voice/os';
import type {VoicePageContext} from '@/lib/voice/discovery';
import {useApp} from '../app-provider';
import {useAssistantAudio} from './use-assistant-audio';
import {cloudSpeechAdapter} from '@/lib/voice/cloud-speech';
import {resolveConversationLanguage,type ConversationLanguageState} from '@/lib/voice/conversation-language';
import {speechLocale,type SpokenReply} from '@/lib/voice/audio-contracts';
import {handsFreeReducer,initialHandsFree,type HandsFreeState,type HandsFreeEvent,type HandsFreePhase} from '@/lib/voice/hands-free';
import type {Language} from '@/lib/contracts';
export type VoiceDiscovery={id:string;text:string;businessId:string;context:VoicePageContext};
type CaptureState={owner:string;phase:CapturePhase;problem:SpeechProblem|null;sessionId?:string;completed?:boolean};
type ContextValue=ReturnType<typeof useAssistantAudio>&{discovery:VoiceDiscovery|null;discover:(context:VoicePageContext,text?:string)=>void;spokenLocale:'en-IN'|'hi-IN';capture:CaptureState;supported:boolean|null;transcribing:boolean;loop:HandsFreeState;beginConversation:()=>void;resumeConversation:()=>void;resumeAfterVoiceSetup:()=>void;beginVoiceSetup:()=>void;setupResume:{sessionId:string;id:string}|null;interruptConversation:()=>void;setWorkflow:(phase:HandsFreePhase)=>void;talkActive:boolean;pauseConversation:()=>void;conversationId:string;languageSource:'app'|'speech';conversationLanguage:Language;conversationTurn:number;observeUtterance:(text:string)=>Language;restoreConversationLanguage:(language:Language,source?:'app'|'speech')=>void;publishReply:(reply:SpokenReply,automatic?:boolean)=>void;start:(owner:string,locale:'en-IN'|'hi-IN',onText:(text:string)=>void,onFinal?:(receipt:FinalUtterance)=>void,automatic?:boolean)=>void;stop:(owner:string)=>void;abort:(owner?:string)=>void;handoff:VoiceCommand|null;send:(command:VoiceCommand)=>void;consume:(intent:VoiceIntent)=>void;launcher:VoiceIntent|null;launch:(intent:VoiceIntent|null)=>void;globalRequest:VoiceCommand|null;request:(command:VoiceCommand)=>void;clearRequest:()=>void;workspace:HTMLElement|null;setWorkspace:(node:HTMLElement|null)=>void};
const Context=createContext<ContextValue|null>(null);
const capturing=(phase:CapturePhase)=>['permissionState','listening','speechDetected','finalizing'].includes(phase);
export function VoiceOSProvider({children,adapter=browserSpeechAdapter}:{children:ReactNode;adapter?:SpeechTranscriptionAdapter}){
 const app=useApp(),displayLanguage=useTranslation().i18n.language;
 const appLanguage:Language=displayLanguage==='hi'||displayLanguage==='hinglish'?displayLanguage:'en';
 const audio=useAssistantAudio(),recognition=useRef<SpeechSession|null>(null),generation=useRef(0),owner=useRef(''),timer=useRef<ReturnType<typeof setTimeout>|null>(null),turn=useRef<SpeechTurn|null>(null);
 const [languageState,setLanguageState]=useState<ConversationLanguageState>({language:appLanguage,source:'app'}),languageRef=useRef(languageState),appLanguageRef=useRef(appLanguage);appLanguageRef.current=appLanguage;
 const languageScope=useRef(''),[conversationId,setConversationId]=useState(''),[conversationTurn,setConversationTurn]=useState(0),[loop,setLoop]=useState(initialHandsFree),loopRef=useRef(initialHandsFree),[transcribing,setTranscribing]=useState(false),conversationScope=app.session?.user.id+':'+app.businessId;
 const transition=useCallback((event:HandsFreeEvent)=>{const next=handsFreeReducer(loopRef.current,event);loopRef.current=next;setLoop(next);},[]);
 const pauseSerial=useRef(0),setupLease=useRef<{sessionId:string;serial:number;restore:boolean}|null>(null);
 const [setupResume,setSetupResume]=useState<{sessionId:string;id:string}|null>(null);
 const finishCurrent=useRef<((problem?:SpeechProblem)=>void)|null>(null),lastReply=useRef(''),lastReplyKind=useRef<SpokenReply['kind']>('welcome');
 const observeUtterance=(text:string)=>{const next=resolveConversationLanguage(text,appLanguageRef.current,languageRef.current);languageRef.current=next;setLanguageState(next);setConversationTurn(value=>value+1);return next.language;};
 const restoreConversationLanguage=(language:Language,source:'app'|'speech'='speech')=>{languageScope.current=conversationScope;const next={language:source==='app'?appLanguageRef.current:language,source};languageRef.current=next;setLanguageState(next);};
 const [capture,setCapture]=useState<CaptureState>({owner:'',phase:'ready',problem:null}),[supported,setSupported]=useState<boolean|null>(null),[handoff,setHandoff]=useState<VoiceCommand|null>(null),[launcher,setLauncher]=useState<VoiceIntent|null>(null),[discovery,setDiscovery]=useState<VoiceDiscovery|null>(null),[globalRequest,setGlobalRequest]=useState<VoiceCommand|null>(null),[workspace,setWorkspace]=useState<HTMLElement|null>(null);
 const clearRequest=useCallback(()=>setGlobalRequest(null),[]);
 const abort=useCallback((requester?:string)=>{if(requester&&requester!==owner.current)return;++generation.current;if(timer.current)clearTimeout(timer.current);timer.current=null;turn.current?.cancel();const current=recognition.current;recognition.current=null;finishCurrent.current=null;if(current){try{current.abort();}catch{}}setTranscribing(false);setCapture({owner:owner.current,phase:'ready',problem:null});},[]);
 const interruptConversation=useCallback(()=>{abort();audio.stopSpeaking();},[abort,audio.stopSpeaking]);
 const pauseConversation=useCallback(()=>{pauseSerial.current++;transition({type:'pause'});interruptConversation();},[transition,interruptConversation]);
 const beginConversation=useCallback(()=>{interruptConversation();audio.resetAutomatic();lastReply.current='';setConversationTurn(0);transition({type:'open',sessionId:crypto.randomUUID()});},[interruptConversation,audio.resetAutomatic,transition]);
 const resumeConversation=useCallback(()=>{audio.dismissAudioProblem();if(!loopRef.current.active){audio.resetAutomatic();lastReply.current='';transition({type:'open',sessionId:crypto.randomUUID()});}else transition({type:'resume'});},[transition,audio.dismissAudioProblem,audio.resetAutomatic]);
 const beginVoiceSetup=useCallback(()=>{if(!setupLease.current||setupLease.current.sessionId!==loopRef.current.sessionId)setupLease.current={sessionId:loopRef.current.sessionId,serial:pauseSerial.current,restore:loopRef.current.active&&!loopRef.current.paused};transition({type:'pause'});interruptConversation();},[transition,interruptConversation]);
 const resumeAfterVoiceSetup=useCallback(()=>{const lease=setupLease.current;setupLease.current=null;if(!lease?.restore||lease.sessionId!==loopRef.current.sessionId||lease.serial!==pauseSerial.current||!loopRef.current.active)return;audio.stopSpeaking();audio.dismissAudioProblem();transition({type:'resume'});setSetupResume({sessionId:loopRef.current.sessionId,id:crypto.randomUUID()});},[audio.stopSpeaking,audio.dismissAudioProblem,transition]);
 const setWorkflow=useCallback((phase:HandsFreePhase)=>transition({type:'workflow',sessionId:loopRef.current.sessionId,phase}),[transition]);
 const launch=useCallback((intent:VoiceIntent|null)=>{if(intent===null){transition({type:'close'});interruptConversation();}else beginConversation();setDiscovery(null);setLauncher(intent);},[beginConversation,transition,interruptConversation]);
 const discover=(context:VoicePageContext,text='')=>{beginConversation();setDiscovery({id:crypto.randomUUID(),text,businessId:app.businessId,context});setLauncher(context.intent);};
 const request=useCallback((command:VoiceCommand)=>{setGlobalRequest(command);launch('unknown');},[launch]);
 const publishReply=(reply:SpokenReply,automatic=true)=>{
  if(automatic&&(!loopRef.current.active||loopRef.current.paused||capturing(capture.phase)||lastReply.current===reply.id))return;
  lastReply.current=reply.id;lastReplyKind.current=reply.kind;if(!automatic)abort();void audio.speak(reply,{automatic});
 };
 useEffect(()=>{transition({type:'playback',sessionId:loopRef.current.sessionId,phase:audio.playback,greeting:lastReplyKind.current==='welcome'});},[audio.playback,transition]);
 useEffect(()=>{if(audio.audioProblem&&audio.audioProblem!=='voiceFallback')pauseConversation();},[audio.audioProblem,pauseConversation]);
 const useCloud=Boolean(audio.audioStatus?.sttConfigured&&audio.preferences.cloudAudioConsent);
 useEffect(()=>{setSupported(useCloud?cloudSpeechAdapter(app.businessId,setTranscribing).available():adapter.available());return()=>abort();},[abort,adapter,useCloud,app.businessId]);
 useEffect(()=>{setHandoff(null);setGlobalRequest(null);transition({type:'close'});interruptConversation();lastReply.current='';setConversationId(crypto.randomUUID());if(languageScope.current!==conversationScope){languageScope.current=conversationScope;const next:ConversationLanguageState={language:appLanguageRef.current,source:'app'};languageRef.current=next;setLanguageState(next);}setConversationTurn(0);},[conversationScope,transition,interruptConversation]);
 useEffect(()=>{if(languageRef.current.source==='app'){const next:ConversationLanguageState={language:appLanguage,source:'app'};languageRef.current=next;setLanguageState(next);}},[appLanguage]);
 useEffect(()=>{const hidden=()=>{if(document.visibilityState==='hidden')pauseConversation();};window.addEventListener('pagehide',pauseConversation);document.addEventListener('visibilitychange',hidden);return()=>{window.removeEventListener('pagehide',pauseConversation);document.removeEventListener('visibilitychange',hidden);};},[pauseConversation]);
 useEffect(()=>{if(!app.online||!app.state?.configuration.features.voiceStock)pauseConversation();},[app.online,app.state?.configuration.features.voiceStock,pauseConversation]);
 const start=(requester:string,locale:'en-IN'|'hi-IN',onText:(text:string)=>void,onFinal?:(receipt:FinalUtterance)=>void,automatic=false)=>{
  if(automatic&&(!loopRef.current.active||loopRef.current.paused))return;
  abort();audio.stopSpeaking();owner.current=requester;const activeAdapter=useCloud?cloudSpeechAdapter(app.businessId,setTranscribing):adapter;
  if(!activeAdapter.available()||!window.isSecureContext||!app.online||!app.state?.configuration.features.voiceStock){setCapture({owner:requester,phase:'error',problem:!activeAdapter.available()?'unsupported':!app.online?'network':'permission'});return;}
  if(loopRef.current.active&&loopRef.current.paused)resumeConversation();
  const audioSession=loopRef.current.sessionId;
  const version=++generation.current,sessionId=crypto.randomUUID(),turnId=crypto.randomUUID(),started=performance.now();let instance:SpeechSession;
  const machine=new SpeechTurn(sessionId,turnId,receipt=>{
   const next=resolveConversationLanguage(receipt.text,appLanguageRef.current,languageRef.current,receipt.languages);languageRef.current=next;setLanguageState(next);
   recordSpeechDiagnostic({conversationId,turnId,speechSessionId:sessionId,phase:'completed',finalized:true,dispatched:Boolean(onFinal),languageSource:next.source,elapsedMs:Math.round(performance.now()-started)});
   onText(receipt.text);onFinal?.(receipt);
  });turn.current=machine;
  const valid=()=>version===generation.current&&recognition.current===instance&&machine.active;
  const update=()=>{setCapture({owner:requester,sessionId,phase:machine.phase,problem:null});transition({type:'capture',sessionId:audioSession,phase:machine.phase});recordSpeechDiagnostic({conversationId,turnId,speechSessionId:sessionId,phase:machine.phase,finalized:false,dispatched:false,languageSource:languageRef.current.source});};
  const finish=(problem?:SpeechProblem)=>{
   if(!valid())return;if(timer.current)clearTimeout(timer.current);timer.current=null;finishCurrent.current=null;
   let failure:SpeechProblem|null;try{failure=machine.finish(problem);}catch{failure='speechError';machine.phase='error';}recognition.current=null;++generation.current;setTranscribing(false);transition({type:'capture',sessionId:audioSession,phase:machine.phase});if(failure)pauseConversation();
   if(failure)recordSpeechDiagnostic({conversationId,turnId,speechSessionId:sessionId,phase:'error',finalized:false,dispatched:false,languageSource:languageRef.current.source,errorCode:failure,elapsedMs:Math.round(performance.now()-started)});setCapture({owner:requester,sessionId,phase:machine.phase,completed:machine.phase==='completed',problem:failure});try{instance.abort();}catch{}
  };
  try{instance=activeAdapter.create(locale,{started:()=>{if(valid()){machine.started();update();if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(()=>finish('silence'),speechEndpointPolicy.maxTurnMs+35000);}},finalizing:()=>{if(valid()){machine.finalizing();update();}},ended:()=>finish(),transcript:(text,final,languages)=>{if(valid()){machine.transcript(text,final,languages);update();onText(text.slice(0,5000));}},failed:problem=>{if(valid())finish(problem);}});}catch{pauseConversation();setCapture({owner:requester,phase:'error',problem:'unsupported'});return;}
  recognition.current=instance;finishCurrent.current=finish;update();recordSpeechDiagnostic({conversationId,turnId,speechSessionId:sessionId,phase:'permissionState',finalized:false,dispatched:false});
  timer.current=setTimeout(()=>finish('permission'),speechEndpointPolicy.permissionMs);
  try{instance.start();}catch{finish('speechError');}
 };
 const stop=(requester:string)=>{if(owner.current!==requester||!recognition.current)return;try{recognition.current.stop();}catch{finishCurrent.current?.('speechError');}};
 const effectiveLanguage=languageState.source==='app'?appLanguage:languageState.language;
 return <Context.Provider value={{...audio,discovery,discover,spokenLocale:speechLocale(effectiveLanguage),capture,supported,transcribing,loop,beginConversation,resumeConversation,resumeAfterVoiceSetup,beginVoiceSetup,setupResume,interruptConversation,setWorkflow,talkActive:loop.active&&!loop.paused,pauseConversation,conversationId,languageSource:languageState.source,conversationLanguage:effectiveLanguage,conversationTurn,observeUtterance,restoreConversationLanguage,publishReply,start,stop,abort,handoff,send:setHandoff,consume:intent=>setHandoff(previous=>previous?.intent===intent?null:previous),launcher,launch,globalRequest,request,clearRequest,workspace,setWorkspace}}>{children}</Context.Provider>;
}
export function useVoiceOS(){const value=useContext(Context);if(!value)throw new Error('VoiceOS requires its scoped provider');return value;}
export function useVoiceCapture(onText:(text:string)=>void,onFinal?:(receipt:FinalUtterance)=>void){
 const voice=useVoiceOS(),[owner]=useState(()=>crypto.randomUUID()),callback=useRef(onText),finalCallback=useRef(onFinal);callback.current=onText;finalCallback.current=onFinal;
 const abort=voice.abort;useEffect(()=>()=>abort(owner),[owner,abort]);
 const phase=voice.capture.owner===owner?voice.capture.phase:'ready';
 return{completed:voice.capture.owner===owner&&Boolean(voice.capture.completed),supported:voice.supported,phase,problem:voice.capture.owner===owner?voice.capture.problem:null,recording:capturing(phase),start:(locale:'en-IN'|'hi-IN',automatic=false)=>voice.start(owner,locale,text=>callback.current(text),onFinal?receipt=>finalCallback.current?.(receipt):undefined,automatic),stop:()=>voice.stop(owner),abort:()=>voice.abort(owner)};
}
