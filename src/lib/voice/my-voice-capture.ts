import {normaliseRecording} from './wav';
import {inspectMyVoice,MY_VOICE_MAX_BYTES,type MyVoiceQuality} from './my-voice';

export type MyVoiceCaptureState={phase:'idle'|'permission'|'recording'|'checking'|'ready'|'error';seconds:number;levels:number[];problem:string};
export const initialMyVoiceCapture:MyVoiceCaptureState={phase:'idle',seconds:0,levels:[],problem:''};
/** A single live recording. No file picker, uploads from storage, or fabricated waveform. */
export class MyVoiceCapture{
 private cancelled=false;
 private recorder:MediaRecorder|null=null;
 private stream:MediaStream|null=null;
 private audio:AudioContext|null=null;
 private timer:ReturnType<typeof setTimeout>|null=null;
 private monitor:ReturnType<typeof setInterval>|null=null;
 private chunks:Blob[]=[];
 private startedAt=0;
 private levels:number[]=[];
 constructor(private change:(state:MyVoiceCaptureState)=>void,private ready:(bytes:Uint8Array,quality:MyVoiceQuality)=>void){}
 static available(){return typeof window!=='undefined'&&window.isSecureContext&&typeof navigator.mediaDevices?.getUserMedia==='function'&&typeof MediaRecorder!=='undefined'&&typeof AudioContext!=='undefined';}
 private release(){this.stream?.getTracks().forEach(track=>track.stop());this.stream=null;if(this.timer)clearTimeout(this.timer);if(this.monitor)clearInterval(this.monitor);this.timer=null;this.monitor=null;if(this.audio){void this.audio.close().catch(()=>{});this.audio=null;}}
 private fail(problem:string){if(this.cancelled)return;this.cancelled=true;this.release();if(this.recorder){this.recorder.onstop=null;this.recorder.ondataavailable=null;try{if(this.recorder.state==='recording')this.recorder.stop();}catch{}}this.chunks.length=0;this.change({...initialMyVoiceCapture,phase:'error',problem});}
 async start(){
  if(!MyVoiceCapture.available()){this.fail('myVoiceMicrophoneUnavailable');return;}this.change({...initialMyVoiceCapture,phase:'permission'});
  try{
   this.audio=new AudioContext();this.timer=setTimeout(()=>this.fail('myVoicePermission'),15000);await this.audio.resume();if(this.cancelled)return;
   const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:false}});
   if(this.cancelled){stream.getTracks().forEach(track=>track.stop());return;}this.stream=stream;if(this.timer)clearTimeout(this.timer);
   const mime=['audio/webm;codecs=opus','audio/mp4'].find(type=>MediaRecorder.isTypeSupported(type));this.recorder=new MediaRecorder(stream,mime?{mimeType:mime}:undefined);let size=0;
   this.recorder.ondataavailable=event=>{if(this.cancelled)return;size+=event.data.size;if(size>2*1024*1024){this.fail('myVoiceUnclear');return;}if(event.data.size)this.chunks.push(event.data);};
   this.recorder.onerror=()=>this.fail('myVoiceUnclear');this.recorder.onstop=()=>void this.finish();
   const analyser=this.audio!.createAnalyser();analyser.fftSize=1024;this.audio!.createMediaStreamSource(stream).connect(analyser);const frame=new Float32Array(analyser.fftSize);
   this.startedAt=performance.now();this.recorder.start(200);this.timer=setTimeout(()=>this.stop(),15000);
   this.monitor=setInterval(()=>{if(this.cancelled)return;const seconds=Math.min(15,(performance.now()-this.startedAt)/1000);if(this.audio?.state!=='running'){this.fail('myVoiceUnclear');return;}analyser.getFloatTimeDomainData(frame);const rms=Math.sqrt(frame.reduce((sum,value)=>sum+value*value,0)/frame.length);this.levels=[...this.levels.slice(-18),Math.min(1,rms*6)];this.change({phase:'recording',seconds,levels:this.levels,problem:''});if(seconds>=15)this.stop();},100);
   this.change({phase:'recording',seconds:0,levels:[],problem:''});
  }catch(cause){this.fail(cause instanceof DOMException&&['NotAllowedError','SecurityError'].includes(cause.name)?'myVoicePermission':'myVoiceUnclear');}
 }
 stop(){if(!this.cancelled&&this.recorder?.state==='recording'){if(this.timer)clearTimeout(this.timer);if(this.monitor)clearInterval(this.monitor);this.recorder.stop();this.stream?.getTracks().forEach(track=>track.stop());}}
 private async finish(){
  if(this.cancelled)return;this.release();this.change({...initialMyVoiceCapture,phase:'checking'});
  try{const wav=await normaliseRecording(new Blob(this.chunks,{type:this.recorder?.mimeType||'audio/webm'}),16);this.chunks.length=0;const bytes=new Uint8Array(await wav.arrayBuffer());if(this.cancelled){bytes.fill(0);return;}const bounded=bytes.length>MY_VOICE_MAX_BYTES?bytes.slice(0,MY_VOICE_MAX_BYTES):bytes;if(bounded!==bytes){const view=new DataView(bounded.buffer);view.setUint32(4,bounded.length-8,true);view.setUint32(40,bounded.length-44,true);bytes.fill(0);}const quality=inspectMyVoice(bounded);if(quality.issue){bounded.fill(0);this.fail(quality.issue==='duration'||quality.issue==='short'?'myVoiceTooShort':'myVoiceUnclear');return;}this.change({phase:'ready',seconds:quality.duration,levels:[],problem:''});this.ready(bounded,quality);}catch{this.fail('myVoiceUnclear');}
 }
 cancel(){this.cancelled=true;this.release();this.chunks.length=0;if(this.recorder){this.recorder.ondataavailable=null;this.recorder.onstop=null;this.recorder.onerror=null;try{if(this.recorder.state!=='inactive')this.recorder.stop();}catch{}}}
}
