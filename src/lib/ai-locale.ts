import type {Locale} from './locale';
/** Script checks remove original source names before assessing generated prose. This is a guard, not a language-quality certification. */
export function validAnswerLanguage(answer:string,language:Locale,names:string[]=[]):boolean {
 let prose=answer;for(const name of [...names].filter(Boolean).sort((a,b)=>b.length-a.length))prose=prose.split(name).join(' ');
 prose=prose.replace(/\b(?:DukaanSet|DemandPulse|VoiceOS|UPI|GST|PDF|INR|SKU|AI)\b/g,'');
 if(language==='hi')return /[\u0900-\u097f]/u.test(prose)&&!/[A-Za-z]/.test(prose);
 if(/[\u0900-\u097f]/u.test(prose))return false;
 const romanHindi=/\b(?:hai|hain|karein|karo|ka|ki|ke|mein|aap|aapka|aaj|bikri|kharcha|dekhein|chuno|liye)\b/i;
 return language==='hinglish'?romanHindi.test(prose):!romanHindi.test(prose);
}
