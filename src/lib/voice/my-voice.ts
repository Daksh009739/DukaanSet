import type {Language} from '../contracts';

export const MY_VOICE_TARGET_SECONDS=12;
export const MY_VOICE_MIN_SECONDS=10;
export const MY_VOICE_MAX_SECONDS=15;
export const MY_VOICE_MAX_BYTES=44+16000*2*MY_VOICE_MAX_SECONDS;
export type MyVoicePhase='creating'|'processing'|'ready'|'failed'|'uncertain'|'deletion_pending'|'deleted';
export type MyVoiceProfile={id:string;phase:MyVoicePhase;active:boolean;locales:string[];approvedLanguages:Language[];createdAt:string;error:string};
export type MyVoiceStatus={available:boolean;reason:'configuration'|'verification'|'account'|null;profile:MyVoiceProfile|null;targetSeconds:number;maxSeconds:number};
export type MyVoiceChallenge={id:string;phrase:string;script:string;expiresAt:string;language:Language};
export type MyVoiceQuality={duration:number;speechActivitySeconds:number;clippedRatio:number;rms:number;issue:'format'|'duration'|'silence'|'short'|'clipping'|null};

/** A conservative signal check, not speaker verification or proof of ownership. */
export function inspectMyVoice(bytes:Uint8Array):MyVoiceQuality{
 const bad=(issue:MyVoiceQuality['issue']):MyVoiceQuality=>({duration:0,speechActivitySeconds:0,clippedRatio:0,rms:0,issue});
 if(bytes.length<44||bytes.length>MY_VOICE_MAX_BYTES)return bad('format');
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),ascii=(start:number,size:number)=>String.fromCharCode(...bytes.subarray(start,start+size));
 if(ascii(0,4)!=='RIFF'||ascii(8,8)!=='WAVEfmt '||ascii(36,4)!=='data'||view.getUint32(4,true)!==bytes.length-8||view.getUint32(16,true)!==16||view.getUint16(20,true)!==1||view.getUint16(22,true)!==1||view.getUint32(24,true)!==16000||view.getUint32(28,true)!==32000||view.getUint16(32,true)!==2||view.getUint16(34,true)!==16||view.getUint32(40,true)!==bytes.length-44||(bytes.length-44)%2)return bad('format');
 const count=(bytes.length-44)/2,duration=count/16000;let clipped=0,sum=0,usable=0;
 for(let start=0;start<count;start+=320){const end=Math.min(count,start+320);let energy=0;for(let i=start;i<end;i++){const sample=view.getInt16(44+i*2,true)/32768;energy+=sample*sample;if(Math.abs(sample)>=.985)clipped++;}sum+=energy;if(Math.sqrt(energy/(end-start))>=.012)usable+=(end-start)/16000;}
 const result:MyVoiceQuality={duration,speechActivitySeconds:usable,clippedRatio:count?clipped/count:0,rms:count?Math.sqrt(sum/count):0,issue:null};
 result.issue=duration<10||duration>15?'duration':result.rms<.012?'silence':result.clippedRatio>.01?'clipping':usable<duration*.45?'short':null;
 return result;
}
