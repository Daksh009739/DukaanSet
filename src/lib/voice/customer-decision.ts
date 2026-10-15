import type {VoiceCommand} from './os';
import {resolveContact} from './os';
import type {Customer} from '../contracts';

const label=(name:string)=>name.normalize('NFKC').toLowerCase().replace(/[.!।?,]/g,' ').replace(/\s+/g,' ').trim();
export function separateCustomer(command:VoiceCommand){return command.intent==='customer'&&command.fields.duplicateDecision==='separate'&&command.fields.duplicateName===label(command.fields.name||'');}
export function customerDuplicateQuestion(command:VoiceCommand,customers:Customer[]){return command.intent==='customer'&&!separateCustomer(command)&&resolveContact(command.fields.name||'',customers).length>0;}
/** Resolve an outstanding duplicate question before fresh intent classification. Bare yes is ambiguous. */
export function resolveCustomerDecision(raw:string,previous:VoiceCommand,customers:Customer[]):VoiceCommand|null{
 if(!customerDuplicateQuestion(previous,customers)&&!separateCustomer(previous))return null;
 const text=label(raw);
 const separate=/^(?:(?:haan|yes|okay|ok|koi nahi|nahi|nahin|हाँ|हां|कोई नहीं|नहीं)\s+)?(?:same naam se\s+)?(?:(?:naya|alag|dusra|doosra|new|separate|another|different|नया|अलग|दूसरा)(?:\s+(?:customer|ग्राहक))?(?:\s+(?:bana do|banao|bana|banado|add kar do|create|add|create it|बना दो|बनाओ|जोड़ो))?|(?:phir se add kar do|फिर से जोड़ दो))$/.test(text)
  ||/^(?:create|add|make)\s+(?:a\s+)?(?:new|separate|another|different)\s+(?:customer|one)(?:\s+with the same name)?$/.test(text)
  ||/^(?:koi nahi\s+)?same naam se (?:naya|alag)(?: customer)? (?:bana do|add kar do)$/.test(text);
 const named=text.match(/^(?:create|add|make)\s+(?:a\s+)?(?:new|separate|another|different)\s+customer named (.+)$/)?.[1];
 const distinctName=['nahi dusra ','nahi doosra ','नहीं दूसरा '].some(prefix=>text===prefix+label(previous.fields.name)+(prefix.startsWith('नहीं')?' है':' hai'));
 if(separate||distinctName||named===label(previous.fields.name)){const fields:Record<string,string>={...previous.fields,duplicateDecision:'separate',duplicateName:label(previous.fields.name)};delete fields.customerId;return{...previous,transcript:raw,fields,warnings:previous.warnings.filter(w=>w!=='duplicateContact'),changed:['duplicateDecision'],changedItems:[]};}
 if(/^(?:usi ko kholo|usi ko khol do|existing ko kholo|use existing|open existing|open the existing (?:one|customer)|उसी को खोलो|उसी को खोल दो)$/.test(text)){
  const ids=resolveContact(previous.fields.name,customers);return{intent:'open',transcript:raw,fields:{screen:'customerAccount',query:previous.fields.name,customerId:ids.length===1?ids[0]:''},items:[],warnings:[],changed:[],changedItems:[]};
 }
 return null;
}
