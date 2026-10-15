import type {CapturePhase} from './speech-turn';

export type HandsFreePhase='idle'|'opening'|'permission'|'greeting'|'listening'|'finalizing'|'understanding'|'clarifying'|'speaking'|'draft'|'awaitingConfirmation'|'executing'|'success'|'paused'|'error'|'closed';
export type HandsFreeState={sessionId:string;phase:HandsFreePhase;active:boolean;paused:boolean;workflow:HandsFreePhase};
export const initialHandsFree:HandsFreeState={sessionId:'',phase:'idle',active:false,paused:false,workflow:'idle'};
export type HandsFreeEvent={type:'open';sessionId:string}|{type:'close'}|{type:'pause'}|{type:'resume'}|{type:'capture';sessionId:string;phase:CapturePhase}|{type:'playback';sessionId:string;phase:'idle'|'loading'|'speaking';greeting?:boolean}|{type:'workflow';sessionId:string;phase:HandsFreePhase};
/** Audio callbacks carry their originating session. Pause is latched until explicit resume. */
export function handsFreeReducer(state:HandsFreeState,event:HandsFreeEvent):HandsFreeState{
 if(event.type==='open')return{sessionId:event.sessionId,phase:'opening',active:true,paused:false,workflow:'idle'};
 if(event.type==='close')return{...state,phase:'closed',active:false,paused:false};
 if(event.type==='pause')return{...state,phase:'paused',paused:true};
 if(event.type==='resume')return state.active?{...state,phase:state.workflow,paused:false}:state;
 if(event.sessionId!==state.sessionId||!state.active)return state;
 if(event.type==='workflow')return{...state,workflow:event.phase,phase:state.paused?'paused':event.phase};
 if(state.paused)return state;
 if(event.type==='playback')return{...state,phase:event.phase==='idle'?state.workflow:event.greeting?'greeting':'speaking'};
 const phases:Partial<Record<CapturePhase,HandsFreePhase>>={permissionState:'permission',listening:'listening',speechDetected:'listening',finalizing:'finalizing',completed:'understanding',error:'error'};
 return{...state,phase:phases[event.phase]||state.workflow};
}
export function mayAutoListen(state:HandsFreeState){return state.active&&!state.paused&&!['executing','understanding','error','closed'].includes(state.phase);}
