import type {SpeechProblem} from './speech';

export type CapturePhase='ready'|'permissionState'|'listening'|'speechDetected'|'finalizing'|'completed'|'error'|'cancelled';
export type FinalUtterance={sessionId:string;turnId:string;text:string;languages:string[]};
export type EndpointPolicy={silenceMs:number;finalizationMs:number;noSpeechMs:number;permissionMs:number;maxTurnMs:number};
const silence=Number(process.env.NEXT_PUBLIC_VOICE_END_SILENCE_MS);
export const speechEndpointPolicy:EndpointPolicy={silenceMs:Number.isFinite(silence)&&silence>=900&&silence<=4000?silence:1800,finalizationMs:3000,noSpeechMs:15000,permissionMs:15000,maxTurnMs:60000};

/** A single session owns its final receipt. Abort/error/interim events can never deliver it. */
export class SpeechTurn {
 phase:CapturePhase='permissionState';
 private final='';private languages:string[]=[];private delivered=false;
 constructor(readonly sessionId:string,readonly turnId:string,private deliver:(receipt:FinalUtterance)=>void){}
 get active(){return !['completed','error','cancelled'].includes(this.phase);}
 started(){if(this.active)this.phase='listening';}
 transcript(text:string,final:string,languages:string[]=[]){if(!this.active)return;this.final=final.slice(0,5000).trim();this.languages=languages.filter(l=>l==='en'||l==='hi');if(text.trim()&&this.phase!=='finalizing')this.phase='speechDetected';}
 finalizing(){if(this.active)this.phase='finalizing';}
 finish(problem:SpeechProblem|null=null):SpeechProblem|null{
  if(!this.active)return null;
  const failure=problem||(!this.final?'silence':null);this.phase=failure?'error':'completed';
  if(!failure&&!this.delivered){this.delivered=true;this.deliver({sessionId:this.sessionId,turnId:this.turnId,text:this.final,languages:this.languages});}
  return failure;
 }
 cancel(){if(this.active)this.phase='cancelled';}
}

/** Adaptive energy endpointing; it never interprets audio or promotes interim words to final text. */
export class SilenceEndpoint {
 private floor=.003;private lastSpeech=0;private consecutive=0;private heard=false;
 constructor(private started:number,private policy:EndpointPolicy=speechEndpointPolicy){}
 sample(rms:number,now:number):'continue'|'end'|'silence'{
  const level=Math.max(0,Math.min(1,rms));
  if(!this.heard&&level<this.floor*2.4+.003)this.floor=.92*this.floor+.08*Math.min(level,.04);
  const voiced=level>Math.max(.005,this.floor*2.4+.003);
  this.consecutive=voiced?this.consecutive+1:0;
  if(this.consecutive>=2){this.heard=true;this.lastSpeech=now;}
  if(this.heard&&voiced)this.lastSpeech=now;
  if(this.heard&&now-this.lastSpeech>=this.policy.silenceMs)return'end';
  if(!this.heard&&now-this.started>=this.policy.noSpeechMs)return'silence';
  return'continue';
 }
}
