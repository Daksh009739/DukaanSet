import type {Language} from '../contracts';
/** Short answers inherit the caller's active language or app fallback; clear sentences may switch it. */
export function conversationLanguage(raw:string,previous:Language='hinglish',detected:string[]=[]):Language{
  const text=raw.normalize('NFKC').toLowerCase().replace(/[.!।?,]/g,' ').trim(),words=text.split(/\s+/).filter(Boolean);
  if(!words.length)return previous;
  const hindi=text.match(/(?:^|\s)(?:का|की|के|को|ने|दिए|मिले|चाहिए|किया|हुआ|हुई|क्या|हटाओ|नाम|बना|बनाओ|कर|करो|करें|कितना|कितनी|लिए|लिया|सामान|जोड़|बिल्कुल|दिखाओ|मुझे|आज|कल|नहीं|हाँ|हां)(?=\s|$)/g)?.length||0;
  const roman=words.filter(word=>/^(?:ka|ki|ke|ko|naam|bana|banao|karo|karein|kardo|kar|mein|kitna|kitni|kitne|hai|hain|mera|meri|mere|duniya|liye|liya|samaan|jodo|dikhao|batao|mujhe|aaj|kal|nahi|nahin|karna|banana|bechi|becha|chahiye)$/.test(word)).length;
  const english=words.filter(word=>/^(?:create|make|please|show|customer|for|from|record|what|how|today|yesterday|the|this|received|sold|add|would|want|is|are|remove|change)$/.test(word)).length;
  if(words.length<=4&&/^(?:[\d₹.,\s]+|yes|yeah|okay|ok|haan|han|ji|ha|हां|हाँ|जी|cash|upi|udhaar|credit|नकद|कैश|यूपीआई|उधार|rupees|rupaye|रुपये|kilo|kg|packet|piece|किलो|पैकेट|पीस|save|karo|kar|do|करो|कर|दो|no|nahi|नहीं|[\d₹.,]+)(?:\s+(?:[\d₹.,]+|cash|upi|udhaar|credit|rupees|rupaye|रुपये|kilo|kg|packet|piece|baaki|baki|और|उधार|बाकी|कैश|यूपीआई|save|karo|kar|do|करो|कर|दो))*$/u.test(text))return previous;
  if((hindi>0||words.length>=3&&words.filter(word=>/[\u0900-\u097f]/u.test(word)).length>=2)&&/[\u0900-\u097f]/u.test(text))return'hi';
  if(roman>=2&&roman>=english)return'hinglish';
  if(english>=2||english>=1&&roman===0&&words.length>=3)return'en';
  if(detected.includes('hi')&&words.length>4)return /[\u0900-\u097f]/u.test(text)?'hi':'hinglish';
  if(detected.includes('en')&&!roman&&words.length>4)return'en';
  return previous;
}
export type ConversationLanguageState={language:Language;source:'app'|'speech'};
export function resolveConversationLanguage(raw:string,app:Language,established?:ConversationLanguageState,detected:string[]=[]):ConversationLanguageState{
 const prior=established?.source==='speech'?established.language:app;
 const first=conversationLanguage(raw,'en',detected),second=conversationLanguage(raw,'hi',detected);
 return first===second?{language:first,source:'speech'}:{language:prior,source:established?.source==='speech'?'speech':'app'};
}
export function spokenControl(raw:string):'confirm'|'cancel'|'stop'|null{
  const text=raw.normalize('NFKC').toLowerCase().replace(/[.!।?,]/g,' ').replace(/\s+/g,' ').trim();
  if(/\b(?:not|don't|dont|never|nahi|nahin)\b|नहीं/.test(text))return null;
  if(/^(?:stop speaking|stop listening|ruko|ruk jao|रुको|बोलना बंद करो)$/.test(text))return'stop';
  if(/^(?:cancel(?: (?:it|conversation|this|the draft|operation))?|cancel kar(?: do|o)?|रद्द कर(?: दो|ें)|बातचीत बंद करो)$/.test(text))return'cancel';
  if(/^(?:yes|haan|han|हाँ|हां|जी)$/.test(text))return'confirm';
  if(/^(?:(?:yes|yeah|haan|han|ji|okay|ok|हाँ|हां|जी)\s+)?(?:(?:please\s+)?(?:save|confirm)(?:\s+(?:it|this|the bill|the draft|all stock|karo|kar do|kar|do|करो|कर दो))?|(?:save|confirm)\s+kar(?:o|\s+do)|सहेज(?:ो|ें)|सेव\s+कर(?:ो|\s+दो))$/.test(text))return'confirm';
  return null;
}
