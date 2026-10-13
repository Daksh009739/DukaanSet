import type {Language} from '../contracts';
export type AssistantVoice={id:string;name:string;provider:'azure'|'device'|'custom';locales:string[];gender?:'female'|'male';local?:boolean};
export type VoicePreferences={voiceId:string;cloudAudioConsent:boolean;audible:boolean;revision:number};
export type VoiceAudioStatus={preferences:VoicePreferences;sttConfigured:boolean;ttsConfigured:boolean;catalogueAvailable:boolean;voices:AssistantVoice[];usage:{requests:number;characters:number;audioSeconds:number;estimatedCostUsd:number|null};limits:{audioBytes:number;turnMs:number}};
export type SpokenReply={id:string;text:string;speechText:string;language:Language;kind:'welcome'|'question'|'draft'|'result'|'success'|'error'|'cancel';continueTurn:boolean};
export const defaultVoicePreferences:VoicePreferences={voiceId:'device:default',cloudAudioConsent:false,audible:true,revision:0};
export const MAX_VOICE_AUDIO_BYTES=4*1024*1024;
export const MAX_VOICE_TURN_MS=60000;
export const speechLocale=(language:Language)=>language==='en'?'en-IN':'hi-IN';
