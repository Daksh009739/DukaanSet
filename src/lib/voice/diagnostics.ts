import type {VoiceCommand} from './os';
export type VoiceDiagnostic={requestId:string;state:string;intent:string;parser:'rules';itemCount:number;missing:string;elapsedMs:number;result:string;at:string};
let events:VoiceDiagnostic[]=[];
/** Bounded development diagnostics contain no audio, transcript, entity names or financial values. */
export function recordVoiceDiagnostic(requestId:string,command:VoiceCommand|null,state:string,missing='',elapsedMs=0,result=''){
 const event:VoiceDiagnostic={requestId,state,intent:command?.intent||'unknown',parser:'rules',itemCount:command?.items.length||0,missing,elapsedMs:Math.max(0,Math.round(elapsedMs)),result,at:new Date().toISOString()};
 if(process.env.NODE_ENV==='development')events=[...events,event].slice(-30);
 return event;
}
export function voiceDiagnostics(){return events.slice();}
export function clearVoiceDiagnostics(){events=[];}
