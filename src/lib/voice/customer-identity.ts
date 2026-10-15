import {resolveCustomerContact, spokenText} from './os';

export type CustomerIdentity = {id:string;name:string;phone?:string;nickname?:string};
export type CustomerChoice = {id:string;name:string;phoneSuffix:string;nickname?:string};
export const customerChoice = (customer:CustomerIdentity):CustomerChoice => ({id:customer.id,name:customer.name,phoneSuffix:(customer.phone||'').replace(/\D/g,'').slice(-4),...customer.nickname?{nickname:customer.nickname}:{}});
export function customerChoiceLabel(customer:CustomerChoice,choices:CustomerChoice[]=[]){
 const short=customer.id.slice(-8),identifier=choices.some(c=>c.id!==customer.id&&c.id.slice(-8)===short)?customer.id:short;
 return [customer.name,customer.nickname,customer.phoneSuffix?'••••'+customer.phoneSuffix:'','#'+identifier].filter(Boolean).join(' · ');
}
export function chooseCustomerByIdentifier(raw:string,choices:CustomerIdentity[]):string|null {
 const query=spokenText(raw),digits=query.match(/(?:ending|ends in|last|suffix|phone|number|आखिरी|अंत|फोन|नंबर)\s*(\d{4,15})/iu)?.[1];
 const matches=choices.filter(c=>query.includes(c.id.toLowerCase())||digits&&(c.phone||'').replace(/\D/g,'').endsWith(digits)||c.nickname&&spokenText(c.nickname)===query);
 return matches.length===1?matches[0].id:null;
}
export function upiCustomerQuery(raw:string){return raw.replace(/['’]s\b/gi,'').replace(/\b(?:hui|total|did|pay|paid|in|is|mahine|mahina|month|and|aur|ne|ki|ka|ke|payment|payments|upi|bill|link|karo|aaj|kal|kitne|kitni|paise|diye|dikhao|se|uske|uski|usne|iska|uska|this|customer|him|her|their|his|he|she|they|unmatched|all|week|last|days|receipts|successful|failed|pending|refunds|refund|whose|kiski|came|arrived|today|yesterday|how|much|many|received|show|collection|collections|aayi|aai|hai|thi)\b|(?<![\p{L}\p{M}])(?:हुई|इस महीने|इस माह|कुल|और|ने|की|का|के|भुगतान|पेमेंट|यूपीआई|बिल|जोड़ो|जोड़|आज|कल|कितने|कितनी|पैसे|दिए|दिखाओ|से|उसके|उसकी|उसने|इसका|उसका|इस ग्राहक|आई|आयी|है|थी|किसकी|किसका|बिना मिलान)(?![\p{L}\p{M}])/giu,' ').replace(/₹?\s*\d+(?:\.\d+)?\s*(?:wali|वाली|rupaye|रुपये|rupees)?/giu,' ').replace(/[?.!।]/g,' ').trim();}
export function resolveUpiCustomer(raw:string,customers:CustomerIdentity[],rememberedId?:string){
 const query=upiCustomerQuery(raw),ids=resolveCustomerContact(query,customers.map(c=>({...c,phone:c.phone||''}))),remembered=customers.find(c=>c.id===rememberedId),reference=/\b(?:usne|uske|uski|iska|uska|this customer|him|her|their|his|he|she|they)\b|उसने|उसके|उसकी|इसका|उसका|इस ग्राहक/iu.test(raw);
 const selected=chooseCustomerByIdentifier(raw,ids.length?customers.filter(c=>ids.includes(c.id)):customers);
 const id=selected|| (ids.length===1?ids[0]:remembered&&(ids.includes(remembered.id)||!query&&reference)?remembered.id:null);
 return {query,ids,customer:id?customers.find(c=>c.id===id)||null:null,needsCustomer:Boolean(reference&&!id),choices:!id&&(ids.length>1||reference&&!query)?customers.filter(c=>!query||ids.includes(c.id)).map(customerChoice):[]};
}
