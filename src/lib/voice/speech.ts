import { TranscriptCollector } from './parser';

type SpeechResult = { isFinal:boolean; 0:{transcript:string} };
export interface RecognitionLike { lang:string; continuous:boolean; interimResults:boolean; maxAlternatives:number; onstart:(()=>void)|null; onend:(()=>void)|null; onresult:((event:{resultIndex:number;results:{length:number;[index:number]:SpeechResult}})=>void)|null; onerror:((event:{error:string})=>void)|null; start:()=>void; stop:()=>void; abort:()=>void }
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
export interface SpeechTranscriptionAdapter {
 id:string;
 available:()=>boolean;
 create:(locale:'en-IN'|'hi-IN',callbacks:{started:()=>void;ended:()=>void;transcript:(value:string,final:string)=>void;failed:(problem:SpeechProblem)=>void})=>SpeechSession;
}
/** Browser audio is handled by the browser's speech service. No cloud provider is configured here. */
export const browserSpeechAdapter:SpeechTranscriptionAdapter={
 id:'browser',available:()=>Boolean(speechConstructor()),
 create(locale,callbacks){const Constructor=speechConstructor();if(!Constructor)throw new Error('Speech recognition unavailable');const recognition=new Constructor();configureRecognition(recognition,locale,callbacks);return{
  start:()=>recognition.start(),stop:()=>recognition.stop(),abort:()=>{recognition.onstart=null;recognition.onend=null;recognition.onresult=null;recognition.onerror=null;recognition.abort();}
 };}
};
