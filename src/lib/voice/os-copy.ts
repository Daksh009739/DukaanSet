import {copy} from '@/locales/registry';
import type en from '@/locales/en/voiceos.json';
export type VoiceOSCopyKey=keyof typeof en;
export function osCopy(language:string){return copy('voiceos',language);}
export function intentLabel(intent:string,value:typeof en){return value[(intent==='customer'?'customerAction':intent==='supplier'?'supplierAction':intent==='open'?'openScreen':intent) as VoiceOSCopyKey]||value.title;}
