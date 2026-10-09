import {copy,locale} from '@/locales/registry';
import type en from '@/locales/en/inventoryVoice.json';
export type VoiceCopyKey=keyof typeof en;
export function voiceCopy(language:string){return copy('voice',language);}
/** Example transcript, deliberately independent of display language. */
export const SAMPLE_COMMAND='Bhai, 4 doodh ke packet add kar do, 2 kilo dal, 5 kilo pyaz, 10 kilo aloo aur 3 packet biscuit bhi add kar do.';
export function displayLanguage(language:string){return locale(language);}
