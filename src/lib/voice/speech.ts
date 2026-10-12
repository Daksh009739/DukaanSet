import { TranscriptCollector } from './parser';
import {speechEndpointPolicy,type EndpointPolicy} from './speech-turn';

type SpeechResult = { isFinal:boolean; 0:{transcript:string} };
export interface RecognitionLike { lang:string; continuous:boolean; interimResults:boolean; maxAlternatives:number; onstart:(()=>void)|null; onend:(()=>void)|null; onspeechstart?:(()=>void)|null;onspeechend?:(()=>void)|null; onresult:((event:{resultIndex:number;results:{length:number;[index:number]:SpeechResult}})=>void)|null; onerror:((event:{error:string})=>void)|null; start:()=>void; stop:()=>void; abort:()=>void }
type SpeechWindow = Window & { SpeechRecognition?:new()=>RecognitionLike; webkitSpeechRecognition?:new()=>RecognitionLike };
export function speechConstructor(): (new()=>RecognitionLike)|null {
  if(typeof window==='undefined')return null;
  const surface=window as SpeechWindow;return surface.SpeechRecognition||surface.webkitSpeechRecognition||null;
}
export type SpeechProblem='unsupported'|'permission'|'audio'|'network'|'silence'|'language'|'aborted'|'speechError';
export function speechProblem(code:string):SpeechProblem {return({'not-allowed':'permission','service-not-allowed':'permission','audio-capture':'audio','network':'network','no-speech':'silence','language-not-supported':'language','aborted':'aborted'} as Record<string,SpeechProblem>)[code]||'speechError';}
export function configureRecognition(recognition:RecognitionLike,locale:'en-IN'|'hi-IN',callbacks:{started:()=>void;ended:()=>void;transcript:(value:string,final:string)=>void;failed:(problem:SpeechProblem)=>void}):void {
  const collector=new TranscriptCollector();recognition.lang=locale;recognition.continuous=true;recognition.interimResults=true;recognition.maxAlternatives=1;
  recognition.onstart=callbacks.started;recognition.onend=callbacks.ended;
  recognition.onresult=event=>{for(let index=event.resultIndex;index<event.results.length;index++){const result=event.results[index];collector.update(index,result[0].transcript,result.isFinal);}callbacks.transcript(collector.text,collector.finalText);};
  recognition.onerror=event=>callbacks.failed(speechProblem(event.error));
}

export interface SpeechSession {start:()=>void;stop:()=>void;abort:()=>void}
export type SpeechCallbacks={started:()=>void;ended:()=>void;transcript:(value:string,final:string,languages?:string[])=>void;failed:(problem:SpeechProblem)=>void;finalizing?:()=>void};
export interface SpeechTranscriptionAdapter {
 id:string;
 available:()=>boolean;
 create:(locale:'en-IN'|'hi-IN',callbacks:SpeechCallbacks,policy?:EndpointPolicy)=>SpeechSession;
}
/** Browser audio is handled by the browser's speech service. No cloud provider is configured here. */
export const browserSpeechAdapter:SpeechTranscriptionAdapter={
 id:'browser',available:()=>Boolean(speechConstructor()),
 create(locale,callbacks,policy=speechEndpointPolicy){
  const Constructor=speechConstructor();if(!Constructor)throw new Error('Speech recognition unavailable');
  const recognition=new Constructor();let timer:ReturnType<typeof setTimeout>|null=null,deadline:ReturnType<typeof setTimeout>|null=null,limit:ReturnType<typeof setTimeout>|null=null,ended=false,stopping=false,startedOnce=false,speechActive=false,lastText='';
  const clear=()=>{if(timer)clearTimeout(timer);if(deadline)clearTimeout(deadline);if(limit)clearTimeout(limit);timer=null;deadline=null;limit=null;};
  const end=(problem?:SpeechProblem)=>{if(ended)return;ended=true;clear();if(problem)callbacks.failed(problem);else callbacks.ended();};
  const stop=()=>{if(ended||stopping)return;stopping=true;if(timer)clearTimeout(timer);timer=null;callbacks.finalizing?.();deadline=setTimeout(()=>end(),policy.finalizationMs);try{recognition.stop();}catch{end('speechError');}};
  const schedule=()=>{if(ended||stopping)return;if(timer)clearTimeout(timer);timer=setTimeout(stop,policy.silenceMs);};
  configureRecognition(recognition,locale,{started:()=>{if(ended||stopping||startedOnce)return;startedOnce=true;callbacks.started();if(!speechActive)timer=setTimeout(()=>end('silence'),policy.noSpeechMs);limit=setTimeout(()=>end('speechError'),policy.maxTurnMs);},ended:()=>end(),failed:problem=>end(problem),transcript:(text,final)=>{if(ended)return;callbacks.transcript(text,final);if(text.trim()&&text!==lastText){lastText=text;if(!speechActive)schedule();}}});
  recognition.onspeechstart=()=>{if(ended||stopping)return;speechActive=true;if(timer)clearTimeout(timer);timer=null;};
  recognition.onspeechend=()=>{speechActive=false;schedule();};
  return{start:()=>recognition.start(),stop,abort:()=>{ended=true;clear();recognition.onstart=null;recognition.onend=null;recognition.onresult=null;recognition.onerror=null;recognition.onspeechstart=null;recognition.onspeechend=null;recognition.abort();}};
 }
};
