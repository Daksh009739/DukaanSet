import {DomainError} from './validation';
import type {Language} from '../contracts';

type VoiceResult={uuid:string;name?:string;status?:string;voice_status?:string;default_language?:string;supported_languages?:string[];component_status?:{text_to_speech?:string|{status?:string}};api_support?:{sync?:boolean;sync_tts?:boolean;direct_synthesis?:boolean}};
const validId=(id:unknown):id is string=>typeof id==='string'&&/^[A-Za-z0-9-]{1,80}$/.test(id);

/** Fixed documented endpoints; no provider voice ID or URL is accepted from the browser. */
export class ResembleMyVoiceProvider{
 constructor(private transport:typeof fetch=fetch){}
 private async request(path:string,init:RequestInit={}){
  const response=await this.transport('https://app.resemble.ai/api/v2'+path,{...init,redirect:'error',headers:{Authorization:'Bearer '+process.env.RESEMBLE_API_KEY,...init.headers},signal:AbortSignal.timeout(25000)});
  if(!response.ok)throw new DomainError(response.status>=400&&response.status<500?'MY_VOICE_PROVIDER_REJECTED':'MY_VOICE_PROVIDER_UNCERTAIN','The voice provider could not complete this request.',response.status===429?429:503);
  const data=await response.json() as {success?:boolean;item?:VoiceResult;items?:VoiceResult[];page_count?:number};if(data.success!==true)throw new DomainError('MY_VOICE_PROVIDER_UNCERTAIN','The voice provider response could not be verified.',503);return data;
 }
 async create(profileId:string,language:Language){const data=await this.request('/voices',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'DS-'+profileId,language:language==='en'?'en-US':'hi-IN',description:'Private consenting DukaanSet account voice'})});if(!validId(data.item?.uuid))throw new DomainError('MY_VOICE_PROVIDER_UNCERTAIN','The new voice reference was not verified.',503);return data.item.uuid;}
 async recording(id:string,audio:Uint8Array,transcript:string,index:number){
  if(!validId(id))throw new DomainError('MY_VOICE_PROFILE_UNAVAILABLE','The voice reference is unavailable.',503);
  const form=new FormData();form.set('file',new Blob([new Uint8Array(audio)],{type:'audio/wav'}),'live-'+index+'.wav');form.set('name','live-'+index);form.set('text',transcript.slice(0,1024));form.set('emotion','neutral');form.set('is_active','true');await this.request('/voices/'+id+'/recordings',{method:'POST',body:form});
 }
 async build(id:string){await this.request('/voices/'+id+'/build',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({fill:false})});}
 async get(id:string){const data=await this.request('/voices/'+id);if(data.item?.uuid!==id)throw new DomainError('MY_VOICE_PROVIDER_UNCERTAIN','The voice status could not be verified.',503);return data.item;}
 async find(profileId:string){
  let found:VoiceResult|undefined;for(let page=1;page<=20;page++){const data=await this.request('/voices?page='+page+'&page_size=50');if(!Array.isArray(data.items)||!Number.isInteger(data.page_count)||(data.page_count??-1)<0||data.page_count!>20)throw new DomainError('MY_VOICE_PROVIDER_UNCERTAIN','Provider cleanup needs a verified catalogue.',503);for(const item of data.items)if(item.name==='DS-'+profileId){if(found||!validId(item.uuid))throw new DomainError('MY_VOICE_PROVIDER_UNCERTAIN','Provider cleanup needs review.',503);found=item;}if(page>=data.page_count!)return found?.uuid||null;}throw new DomainError('MY_VOICE_PROVIDER_UNCERTAIN','Provider cleanup needs review.',503);
 }
 async remove(id:string){await this.request('/voices/'+id,{method:'DELETE'});}
 async synthesize(id:string,text:string,locale:string){
  const escaped=text.replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[char]!));
  const response=await this.transport('https://f.cluster.resemble.ai/synthesize',{method:'POST',redirect:'error',headers:{Authorization:process.env.RESEMBLE_API_KEY!,'Content-Type':'application/json'},body:JSON.stringify({voice_uuid:id,data:`<speak xml:lang="${locale}">${escaped}</speak>`,output_format:'wav',precision:'PCM_16',sample_rate:16000}),signal:AbortSignal.timeout(20000)});
  if(!response.ok)throw new DomainError('VOICE_AUDIO_UNAVAILABLE','The personal voice is temporarily unavailable.',503);const data=await response.json() as {success?:boolean;audio_content?:string;output_format?:string};
  if(data.success!==true||data.output_format!=='wav'||typeof data.audio_content!=='string'||data.audio_content.length>2800000||! /^[A-Za-z0-9+/]+={0,2}$/.test(data.audio_content))throw new DomainError('VOICE_AUDIO_UNAVAILABLE','The personal voice audio could not be verified.',503);
  const bytes=Buffer.from(data.audio_content,'base64');if(bytes.length<4||bytes.length>2*1024*1024||!(bytes.subarray(0,4).toString()==='RIFF'&&bytes.subarray(8,12).toString()==='WAVE'))throw new DomainError('VOICE_AUDIO_UNAVAILABLE','The personal voice audio could not be verified.',503);return new Uint8Array(bytes);
 }
}

export function resembleVoiceCapabilities(voice:VoiceResult){
 const state=voice.voice_status||voice.status,component=voice.component_status?.text_to_speech,tts=typeof component==='string'?component:component?.status;
 const ready=['ready','finished'].includes(state||'')&&(!tts||['ready','finished'].includes(tts))&&(voice.api_support?.sync_tts===true||voice.api_support?.sync===true||voice.api_support?.direct_synthesis===true);
 const locales=(Array.isArray(voice.supported_languages)?voice.supported_languages:[]).filter(value=>typeof value==='string'&&/^(en|hi)(?:-[A-Za-z]{2,8})?$/.test(value)).map(value=>value.includes('-')?value:value==='en'?'en-US':'hi-IN');
 return{ready,finished:['ready','finished'].includes(state||''),failed:['failed','error'].includes(state||'')||tts==='failed',locales:[...new Set(locales)]};
}
