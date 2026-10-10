import {unitText,text} from '../locale';
import type { Product,VoiceReport } from '../contracts';
import type { Permission, V3State } from '../v3-contracts';
import { businessDay, minorUnits, money, quantity } from '../client';
import { canonicalUnit, matchProducts, normalize, numbers, validateRow } from './parser';

export const voiceIntents = ['sale','stock','customer','payment','document','demand','purchase','supplier','expense','closing','report','reorder','followup','open','cancel','unknown'] as const;
export type VoiceIntent = typeof voiceIntents[number];
export interface VoiceItem { id:string; query:string; productId:string; candidates:string[]; quantity:string; unit:string; price:string; priceBasis:''|'unit'|'total'|'unclear' }
export interface VoiceCommand { intent:VoiceIntent; transcript:string; fields:Record<string,string>; items:VoiceItem[]; changed:string[]; changedItems:string[]; warnings:string[]; removedProducts?:string[] }
const scale:Record<string,number>={hundred:100,sau:100,'सौ':100,thousand:1000,hazar:1000,hazaar:1000,'हजार':1000,'हज़ार':1000,lakh:100000,'लाख':100000};

/** Convert spoken amounts without using floating-point currency arithmetic. */
export function spokenText(raw:string):string {
  const words=normalize(raw.replace(/(?<=\d),(?=\d{3}(?:\D|$))/g,'')).split(' '), out:string[]=[];
  for(let i=0;i<words.length;i++){
    if(['do','दो'].includes(words[i])&&['kar','karo','jodo','bana','add','rakh','save','कर','करो','जोड़ो','बना'].includes(words[i-1])){out.push(words[i]);continue;}
    if(numbers[words[i]]===undefined){out.push(words[i]);continue;}
    let n=numbers[words[i]], group=n, total=0, end=i;
    while(end+1<words.length){const next=words[end+1], factor=scale[next];
      if(factor){group*=factor;end++;if(factor>=1000){total+=group;group=0;}continue;}
      const value=numbers[next];
      if(value!==undefined&&((group===0&&total>0)||(group>=100&&value<100)||(group>=20&&group%10===0&&value>0&&value<10))){group+=value;end++;continue;}
      break;
    }
    n=total+group;out.push(String(n));i=end;
  }return out.join(' ');
}
/** Stock's specialised parser uses punctuation to delimit items and corrections. */
export function spokenStockText(raw:string):string {
 return raw.replace(/\d{1,3}(?:,\d{2})*,\d{3}(?=\D|$)/g,value=>value.replace(/,/g,''))
  .split(/([,;।!?…]|\.(?!\d))/).map(part=>/^[,;।!?….]$/.test(part)?part:spokenText(part)).join(' ');
}
const amount='(?:\\d+(?:\\.\\d{1,3})?)';
const cashWords='cash|nakad|नकद|कैश';
const onlineWords='upi|online|यूपीआई|ऑनलाइन';
const paidWords='mila|mile|diye|diya|received|paid|मिला|दिए|दिया|दिये';
function receipt(text:string,method:string):string|undefined {
  return text.match(new RegExp(`(${amount})\\s*(?:rupaye|rupees|rupee|रुपये|रुपए|ki|के)?\\s*(?:${method})(?=\\s|$)`,'i'))?.[1]
    ?? text.match(new RegExp(`(?:${method})\\s*(?:${paidWords}|amount|था|tha|was)?\\s*(${amount})(?=\\s|$)`,'i'))?.[1];
}
export function resolveContact(query:string,contacts:{id:string;name:string;phone:string}[]):string[] {
  const names:Record<string,string>={'चेतना':'chetna','राहुल':'rahul','शर्मा':'sharma','अमित':'amit','कुमार':'kumar','प्रिया':'priya','वर्मा':'verma','रमेश':'ramesh','गुप्ता':'gupta','नेहा':'neha','विक्रम':'vikram','पटेल':'patel','ट्रेडर्स':'traders'};
  const label=(s:string)=>normalize(s).split(' ').map(w=>names[w]||w).join(' ');
  const q=label(query);if(!q)return[];
  const exact=contacts.filter(c=>label(c.name)===q||c.phone.replace(/\D/g,'')===q.replace(/\D/g,'')&&/\d{7}/.test(q));
  if(exact.length)return exact.map(c=>c.id);
  return contacts.filter(c=>q.split(' ').every(w=>label(c.name).split(' ').includes(w))).map(c=>c.id);
}
export function resolveVoiceProduct(query:string,products:Product[]){
  const q=plural(query).replace(/\bt shirt\b/g,'t-shirt');
  // Include every exact/token match; an exact base name must not hide another variant.
  const ids=products.filter(p=>matchProducts(q,[p]).exact).map(p=>p.id);
  return ids.length?{ids,exact:true}:matchProducts(q,products);
}
function permission(intent:VoiceIntent):Permission|undefined{return({sale:'sales',stock:'inventory',customer:'customers',payment:'payments',demand:'demand',purchase:'purchases',supplier:'purchases',expense:'reports',closing:'reports',report:'reports',reorder:'purchases',followup:'demand'} as Partial<Record<VoiceIntent,Permission>>)[intent];}
export function voiceAllowed(intent:VoiceIntent,state:V3State):boolean {
  if(!state.configuration.features.voiceStock)return false;
  const p=permission(intent);if(p&&!state.configuration.permissions[p])return false;
  if(intent==='document'&&!state.configuration.permissions.customers)return false;
  if(['demand','reorder','followup'].includes(intent)&&(!state.configuration.features.demandPulse||!state.configuration.permissions.demand))return false;
  if(intent==='closing'&&!state.configuration.features.dailyClosing)return false;
  return true;
}
export function detectIntent(raw:string,context?:VoiceIntent):VoiceIntent {
  const t=spokenText(raw);
  if(/^(?:cancel|discard|radd|रद्द)(?:\s+(?:draft|ड्राफ्ट))?$/.test(t))return'cancel';
  if(/(?:closing|daily.*(?:hisaab|report)|shop.*report|दैनिक.*(?:हिसाब|रिपोर्ट)|दुकान.*हिसाब)/.test(t)&&/pdf|report|पीडीएफ|रिपोर्ट/.test(t))return'closing';
  if(/(?:close|band|बंद).*(?:today|aaj|shop|dukaan|आज|दुकान)|(?:today|aaj|shop|dukaan|आज|दुकान).*(?:close|band|बंद)/.test(t))return'closing';
  if(/pdf|statement|whatsapp|पीडीएफ|व्हाट्सएप|रसीद.*(?:बना|दिखा)|receipt.*(?:generate|show|bana)|hisaab.*(?:bana|dikha)|हिसाब.*(?:बना|दिखा)/.test(t))return'document';
  if(/\b(?:open|kholo)\b|खोलो|खोलें/.test(t)&&!/\b(?:add|sold|banao|karo)\b|बनाओ|जोड़ो/.test(t))return'open';
  if(/reorder|re order|order draft|ऑर्डर|रीऑर्डर/.test(t))return'reorder';
  if(/message|sandesh|संदेश|मैसेज/.test(t))return'followup';
  if(/actual cash|opening cash|closing|hisaab.*(?:bharo|band|close|confirm)|हिसाब.*(?:बंद|पक्का|भर)|वास्तविक नकद/.test(t))return'closing';
  if(/purane|purana|old.*(?:dues|credit)|udhaar.*(?:diye|diya|paid)|पुराने|पुराना/.test(t)&&new RegExp(`${paidWords}|payment|भुगतान`).test(t))return'payment';
  if(/kitni|kitna|dikhao|batao|show|how much|how many|report|कितन|दिखाओ|बताओ/.test(t)&&!/bill.*(?:banao|बनाओ)|closing|हिसाब/.test(t))return'report';
  if(/maang|mang|maangi|maanga|chahiye|demand|unavailable|out of stock|मांग|माँग|चाहिए|उपलब्ध नहीं/.test(t))return'demand';
  if(/expense|kharcha|bijli|rent|खर्च|बिजली|किराया/.test(t))return'expense';
  if(/payment|bhugtan|भुगतान/.test(t)&&/record|add|receive|karo|दर्ज|मिला/.test(t)&&!/bill|invoice|sold|bechi|beche|बिल|बेच/.test(t))return'payment';
  if(/(?:new|naya|naye|नया|नए).*supplier|supplier.*(?:add|jodo|जोड़)/.test(t))return'supplier';
  if(/bill|invoice|बिल/.test(t)&&/bana|create|beche|sold|बना|बेच/.test(t))return'sale';
  if(/customer|ग्राहक/.test(t)&&/add|create|new|naya|naye|naam|name|नया|नए|जोड़/.test(t))return'customer';
  if(/(?:stock|स्टॉक)/.test(t)&&/add|jodo|rakh|जोड़/.test(t)||/add|jodo|जोड़/.test(t)&&/selling (?:price|rate|value)|purchase cost|cost price|batch cost/.test(t))return'stock';
  if(/purchase|खरीद|(?:traders|supplier|सप्लायर).*?(?:aayi|aaya|received|आई|आया)|\bse\b.*(?:aayi|aaya)/.test(t))return'purchase';
  if(/\b(?:sold|sell|sale|bechi|becha|beche|bill|invoice)\b|बेच|बिल/.test(t))return'sale';
  if(/stock|add|jodo|जोड़|स्टॉक/.test(t))return'stock';
  if(/account kholo|open.*account|खाता खोलो|screen|page|खोलो/.test(t))return'open';
  return context&&context!=='unknown'?context:'unknown';
}
function blank(intent:VoiceIntent,text:string):VoiceCommand{return{intent,transcript:text,fields:{},items:[],changed:[],changedItems:[],warnings:[]};}
/** The form is authoritative after a manual edit; preserve only unresolved voice choices. */
export function formVoiceContext(command:VoiceCommand,fields:Record<string,string>,rows:{productId:string;quantity:string;price?:string}[],products:Product[]):VoiceCommand{
 const items=command.items.filter(item=>!item.productId||voiceQuantity(item,products)===null&&!rows.some(row=>row.productId===item.productId)).map(item=>({...item}));
 for(const row of rows){const product=products.find(p=>p.id===row.productId);if(!product)continue;const prior=command.items.find(item=>item.productId===row.productId);items.push({...prior,id:prior?.id||'manual:'+product.id,query:product.name+' '+product.variation,productId:product.id,candidates:[product.id],quantity:row.quantity,unit:product.unit,price:row.price??prior?.price??'',priceBasis:row.price!==undefined?'unit':prior?.priceBasis||''});}
 return {...command,fields:{...command.fields,...fields},items,removedProducts:[]};
}
const plural=(text:string)=>text.replace(/\bshirts\b/g,'shirt').replace(/\bt shirts\b/g,'t shirt').replace(/\bpackets\b/g,'packet').replace(/\bbiscuits\b/g,'biscuit');
function entityQuery(text:string,type:'customer'|'supplier'):string {
  if(type==='supplier')return text.match(/^(.*?)\s+(?:se|से)\s/)?.[1]?.replace(/^(?:purchase|receive|received|खरीद)\s+/,'').trim()||text.match(/\bfrom\s+(.+?)(?=\s+\d|$)/)?.[1]?.trim()||'';
  return text.match(/^(.*?)\s+(?:ko|ne|ka|ke|को|ने|का|के)\s/)?.[1]?.replace(/^(?:bhai|please|aaj|today|आज)\s+/,'').trim()
    ||text.match(/\b(?:for|customer)\s+([\p{L}\p{M} ]+?)(?=\s+\d|\s+sold|$)/u)?.[1]?.trim()||'';
}
function itemFrom(clause:string,products:Product[],id:string):VoiceItem|null {
  let t=plural(clause.trim()).replace(/^(?:please\s+)?(?:add|stock|sell|sold|bill|invoice)\s+/,'');const price=t.match(/(\d+(?:\.\d{1,2})?)\s*(?:rupaye|rupees|रुपये|रुपए)?\s*(?:ki|ka|ke|की|का|के|each|per|प्रति)(?=\s|$)(?:\s+(?:ek|1|एक|each|piece|shirt|प्रति))?/i)||t.match(/(?:at|for)\s+(\d+(?:\.\d{1,2})?)(?:\s*(?:rupees|rupaye))?(?:\s+(?:each|per unit|total))?/i);
  let basis:VoiceItem['priceBasis']='';let priceValue='';
  if(price){priceValue=price[1];basis=/each|per|प्रति|(?:ki|की)\s+(?:1|ek|एक)|(?:ek|एक)\s+(?:ki|की)/.test(price[0]+' '+t.slice((price.index||0)+price[0].length, (price.index||0)+price[0].length+12))?'unit':/total|kul|कुल/.test(t)?'total':'unclear';t=t.replace(price[0],' ');}
  const numeric=t.match(/(?:^|\s)(\d+(?:\.\d{1,3})?)(?=\s|$)/), quantityStated=numeric&&(numeric.index===0||/(?:total|quantity|qty|कुल|मात्रा)\s+\d/.test(t)||/\d+(?:\.\d+)?\s+(?:kg|kilo|gram|packet|box|litre|meter|metre|piece|pcs|किलो|ग्राम|पीस)(?=\s|$)/.test(t)),qty=quantityStated?numeric![1]:'';
  if(numeric&&quantityStated)t=t.replace(numeric[0],' ');
  const unitMatch=t.match(/(?:^|\s)(kg|kilo|kilograms?|gram|grams|g|packet|pack|box|litres?|ml|metre|meter|pieces?|pcs|dozen|किलो|ग्राम|लीटर|पीस|पैकेट)(?=\s|$)/i);
  let unit=unitMatch?canonicalUnit(unitMatch[1]):'';if(unitMatch)t=t.replace(unitMatch[0],' ');
  const query=t.replace(/\b(?:please|create|a|an|bhai|stock|add|jodo|kar|karo|do|ke|ka|ki|ko|mein|bechi|becha|beche|hain|hai|sold|sell|to|for|from|at|aayi|aaya|received|quantity|requested|chahiye|thi|tha|maangi|maanga|mang|maang|customers?|customer|not|available|unavailable|it|was|is|bill|invoice|banao|bana|nahi|nahin|usne|he|she|aaj|today|ne|lekin|but|total|kul|demand)\b|स्टॉक|जोड़ो|कर|दो|के|की|को|में|हैं|है|बेची|बेचा|चाहिए|थी|था|मांगी|माँगी|ग्राहक|उपलब्ध|नहीं|चाहिये|बिल|बनाओ|आज|ने|लेकिन|कुल/gu,' ').replace(/\s+/g,' ').trim();
  if(!query&&!qty&&!priceValue)return null;
  const match=resolveVoiceProduct(query,products), productId=match.exact&&match.ids.length===1?match.ids[0]:'';
  if(productId&&!unit)unit=products.find(p=>p.id===productId)!.unit;
  if(productId&&priceValue&&canonicalUnit(unit)!==canonicalUnit(products.find(p=>p.id===productId)!.unit))basis='unclear';
  return{id,query,productId,candidates:match.ids,quantity:qty,unit,price:priceValue,priceBasis:basis};
}
export function voiceQuantity(item:VoiceItem,products:Product[]):number|null {
  const row=validateRow({id:item.id,query:item.query,productId:item.productId,candidates:item.candidates,quantity:item.quantity,unit:item.unit,quantityMilli:null,issues:[],source:'voice'},products);
  return row.quantityMilli;
}
/** Pure, allowlisted draft preparation. It never performs writes or sends data to a model. */
export function interpretVoice(raw:string,state:V3State,context?:VoiceIntent,previous?:VoiceCommand):VoiceCommand {
  const source=raw.slice(0,5000).replace(/\d{1,3}(?:,\d{2})*,\d{3}(?=\D|$)/g,value=>value.replace(/,/g,''));
  const text=spokenText(source.replace(/,\s*(?=\d+\s+[\p{L}\p{M}])/gu,' aur ')), detected=detectIntent(text,context), intent=context&&context!=='unknown'&&detected!=='cancel'?context:detected;
  const result:VoiceCommand=previous&&previous.intent===intent?{...previous,fields:{...previous.fields},items:previous.items.map(i=>({...i})),changed:[],changedItems:[],removedProducts:[],warnings:[],transcript:raw.slice(0,5000)}:blank(intent,raw.slice(0,5000));
  const set=(key:string,value:string|undefined)=>{if(value!==undefined){result.fields[key]=value;result.changed.push(key);}};
  if(!voiceAllowed(intent,state)){result.warnings.push('permission');return result;}
  if(detected!==intent&&detected!=='unknown'&&detected!=='cancel'&&context){result.warnings.push('wrongWorkflow');return result;}
  if(intent==='cancel')return result;
  const correction=Boolean(previous&&/\b(?:quantity|qty|badlo|change|correct|nahi|nahin|instead|actually)\b|मात्रा|बदलो|नहीं/.test(text)&&!(intent==='demand'&&/available|उपलब्ध/.test(text)));
  if(['sale','payment','demand','open','document'].includes(intent)||intent==='report'&&/udhaar|dues|outstanding|baaki|उधार|बाकी/.test(text)){
    const query=entityQuery(text,'customer');if(query&&!/^\d+\s+(?:customers?|grahak|ग्राहक)$/.test(query)&&(!resolveVoiceProduct(query,state.products).exact||resolveContact(query,state.customers).length)){set('customerQuery',query);const matches=resolveContact(query,state.customers);set('customerId',matches.length===1?matches[0]:'');if(matches.length!==1)result.warnings.push('customer');}
  }
  if(intent==='document'){
    set('documentKind',/hisaab|statement|हिसाब/.test(text)?'statement':/receipt|raseed|रसीद/.test(text)?'receipt':'invoice');
    set('share',/whatsapp|व्हाट्सएप/.test(text)?'true':'false');
    set('period',/last month|pichhle mahine|पिछले महीने/.test(text)?'lastMonth':/yesterday|kal|कल/.test(text)?'yesterday':/last 7|week|hafte|हफ्ते/.test(text)?'week':/financial|वित्तीय/.test(text)?'year':'month');
    set('latest',/last|latest|aakhri|आखिरी|पिछला/.test(text)?'true':'false');return result;
  }
  if(intent==='sale'){
    const cash=receipt(text,cashWords), upi=receipt(text,onlineWords);set('cash',cash);set('upi',upi);
    if(cash!==undefined||upi!==undefined)set('mode','split');
    if(/udhaar|credit|उधार/.test(text)&&cash===undefined&&upi===undefined&&!result.fields.cash&&!result.fields.upi)set('mode','credit');
    set('discount',text.match(/(?:discount|chhoot|छूट)\s+(\d+(?:\.\d{1,2})?)/)?.[1]);
  }
  if(intent==='payment'||intent==='expense'){
    const cash=receipt(text,cashWords),upi=receipt(text,onlineWords);set('amount',cash??upi??text.match(/(\d+(?:\.\d{1,2})?)\s*(?:rupaye|rupees|रुपये|रुपए)/)?.[1]);
    if(cash!==undefined&&upi!==undefined){result.warnings.push('splitCollection');}else if(cash!==undefined||new RegExp(cashWords).test(text))set('method','cash');else if(upi!==undefined||new RegExp(onlineWords).test(text))set('method','upi');
    if(intent==='expense')set('description',text.replace(/\d+(?:\.\d+)?|\b(?:aaj|today|dukaan|ka|ki|ke|cash|upi|online|rupaye|rupees|diya|diye|paid|expense|kharcha)\b|आज|दुकान|का|के|की|कैश|नकद|रुपये|दिया|खर्च/gu,' ').replace(/\s+/g,' ').trim());
  }
  if(intent==='customer'||intent==='supplier'){
    const phoneRaw=normalize(raw).match(/(?:phone|mobile|number|फोन|मोबाइल|नंबर)\s+([\p{L}\p{M}\d ]+)/u)?.[1];
    if(phoneRaw){const digits=phoneRaw.split(' ').map(w=>/^\d+$/.test(w)?w:numbers[w]!==undefined&&numbers[w]<10?String(numbers[w]):'').join('');set('phone',digits);if(!/^\d{10}$/.test(digits))result.warnings.push('phone');}
    const nameText=text.replace(/(?:phone|mobile|number|फोन|मोबाइल|नंबर).*/u,'');
    const explicitName=nameText.match(/(?:naam|name(?:d)?|नाम)\s+(.+)/u)?.[1];
    const name=(explicitName||(!previous?nameText:'')).replace(/\b(?:create|a|new|naya|naye|customer|supplier|add|karo|kar|do|naam|name|is)\b|नया|नए|ग्राहक|सप्लायर|जोड़ो|करो|कर|दो|नाम/gu,' ').replace(/\s+/g,' ').trim();if(name)set('name',name);
    if(result.fields.name&&resolveContact(result.fields.name,intent==='customer'?state.customers:state.suppliers).length)result.warnings.push('duplicateContact');
  }
  if(intent==='closing'){set('actual',text.match(/(?:actual cash|actual|counted cash|cash count|gina cash|वास्तविक नकद|गिना नकद)\s*(\d+(?:\.\d{1,2})?)/)?.[1]);set('opening',text.match(/(?:opening cash|opening|शुरुआती नकद)\s*(\d+(?:\.\d{1,2})?)/)?.[1]);set('closingAction',/pdf|पीडीएफ/.test(text)?'pdf':/report|रिपोर्ट|yesterday|kal|कल/.test(text)?'history':'review');set('closingPeriod',/yesterday|kal|कल/.test(text)?'yesterday':'today');}
  if(intent==='purchase'){const query=entityQuery(text,'supplier');if(query){set('supplierQuery',query);const matches=resolveContact(query,state.suppliers);set('supplierId',matches.length===1?matches[0]:'');if(matches.length!==1)result.warnings.push('supplier');}set('paid',receipt(text,cashWords));if(new RegExp(onlineWords).test(text))result.warnings.push('cashPurchaseOnly');}
  if(['sale','stock','purchase','demand'].includes(intent)){
    let itemsText=text;
    const name=result.changed.includes('customerQuery')?result.fields.customerQuery:result.changed.includes('supplierQuery')?result.fields.supplierQuery:'';
    if(name)itemsText=itemsText.replace(name,'').replace(/^\s*(?:ko|ne|ka|se|को|ने|का|से)\s+/,'');
    itemsText=itemsText.replace(new RegExp(`(?:^|\\s)(?:usne|he|she|उसने)?\\s*\\d+(?:\\.\\d+)?\\s*(?:rupaye|rupees|रुपये)?\\s*(?:${cashWords}|${onlineWords}).*$`),'').replace(/(?:cash|upi|online|कैश|यूपीआई)\s*(?:mila|tha|received|was)?\s*\d+.*/,'').replace(/\b(?:baaki|remaining)\s+(?:udhaar|credit).*/,'');
    itemsText=itemsText.replace(/(?:\d+)\s+(?:customers?|grahak|log|ग्राहक)(?:\s+(?:ne|ने))?/g,'');
    if(intent==='demand'){set('people',text.match(/(\d+)\s+(?:customers?|grahak|log|ग्राहक)/)?.[1]);itemsText=itemsText.replace(/^(?:aaj|today|आज)\s*/,'');}
    const pureQuantity=itemsText.match(/^(?:nahi\s*|nahin\s*|नहीं\s*)?(?:quantity|qty|मात्रा)?\s*(\d+(?:\.\d{1,3})?)\s*(?:(?:kar|karo|do|badlo|change|कर|करो|दो|बदलो)\s*)+$/);
    const quantityReply=previous?itemsText.match(/^(\d+(?:\.\d{1,3})?)\s*(kg|kilo|gram|g|packet|box|litre|ml|metre|piece|pcs|किलो|ग्राम|पीस)?$/):null;
    const priceReply=previous?itemsText.match(/^(?:price|rate|daam|दाम)?\s*(\d+(?:\.\d{1,2})?)\s*(?:ek ka|ki ek|each|per unit|एक का|की एक)$/):null;
    const paymentOnly=intent==='sale'&&result.changed.some(k=>['cash','upi','discount'].includes(k))&&!/\b(?:shirt|shirts|bechi|sold|bill)\b/.test(text)&&!itemsText.replace(/\b(?:nahi|nahin|no|actually|cash|mila|tha|discount)\b|नहीं/g,'').trim();
    if(previous&&/\b(?:remove|hatao|hata|delete)\b|हटाओ|हटाएँ/.test(itemsText)){const query=itemsText.replace(/\b(?:remove|hatao|hata|delete|do|kar|please)\b|हटाओ|हटाएँ/gu,' ').trim(),ids=resolveVoiceProduct(query,state.products).ids,matched=result.items.filter(item=>ids.includes(item.productId)||normalize(item.query)===normalize(query));if(matched.length===1){result.removedProducts=matched[0].productId?[matched[0].productId]:[];result.items=result.items.filter(item=>item.id!==matched[0].id);}else result.warnings.push('correction');}
    else if(priceReply){if(result.items.length===1){result.items[0].price=priceReply[1];result.items[0].priceBasis='unit';result.changedItems.push(result.items[0].id);}else result.warnings.push('correction');}
    else if(quantityReply||pureQuantity){const candidates=pureQuantity?result.items:result.items.filter(i=>!i.quantity);const target=candidates.length===1?candidates[0]:result.items.length===1?result.items[0]:null;if(target){target.quantity=(quantityReply||pureQuantity)![1];if(quantityReply?.[2])target.unit=canonicalUnit(quantityReply[2]);result.changedItems.push(target.id);}else result.warnings.push('correction');}
    else if(previous&&/^(?:size\s+|साइज\s+)?(?:xl|xxl|xs|s|m|l)$/i.test(text)&&result.items.filter(i=>!i.productId).length===1){const item=result.items.find(i=>!i.productId)!;item.query=plural(item.query+' '+text.replace(/^size\s+|^साइज\s+/,'')).trim();const matches=matchProducts(item.query,state.products);item.candidates=matches.ids;item.productId=matches.exact&&matches.ids.length===1?matches.ids[0]:'';if(item.productId)item.unit=state.products.find(p=>p.id===item.productId)!.unit;result.changedItems.push(item.id);}
    else if(!paymentOnly){
      const clauses=itemsText.replace(/\b(?:aur|and)\b|और/g,'|').split('|').filter(c=>c.trim());
      for(const clause of clauses){const item=itemFrom(clause,state.products,String(result.items.reduce((max,row)=>Math.max(max,Number(row.id)||0),-1)+1));if(!item)continue;
        if(!item.query&&!item.quantity&&!item.price)continue;
        const matches=result.items.filter(i=>(item.productId&&i.productId===item.productId)||normalize(i.query)===normalize(item.query));
        if(correction&&matches.length!==1){result.warnings.push('correction');continue;}
        const prior=matches.length===1?matches[0]:null;
        if(prior){if(item.quantity)prior.quantity=correction?item.quantity:String((minorUnits(prior.quantity||'0',3)+minorUnits(item.quantity,3))/1000);if(item.price){prior.price=item.price;prior.priceBasis=item.priceBasis;}if(item.unit)prior.unit=item.unit;result.changedItems.push(prior.id);}
        else {result.items.push(item);result.changedItems.push(item.id);}
      }
    }
  }
  if(intent==='report'||intent==='open'||intent==='reorder'||intent==='followup'){
    set('query',text);set('period',/week|hafte|हफ्त|सप्ताह/.test(text)?'week':/all time|kul|कुल/.test(text)?'all':'today');
    set('report',/(?:cash|nakad|नकद).*(?:balance|bacha|बचा|शेष)/.test(text)?'cashBalance':/demand|maang|मांग/.test(text)?/contact|सम्पर्क|संपर्क/.test(text)?'followups':/convert|recover|sale.*demand/.test(text)?'recovered':'demand':/low stock|kam stock|कम स्टॉक/.test(text)?'lowStock':/stock|bacha|बचा|स्टॉक/.test(text)?'stock':/udhaar|dues|outstanding|baaki|उधार|बाकी/.test(text)?'outstanding':/upi.*(?:payment|aayi|received)|cash.*collect|cash.*mila|collection|collect|नकद|वसूली/.test(text)?'collections':/expense|kharcha|खर्च/.test(text)?'expenses':/sabse|most|top|सबसे/.test(text)?'topSales':'sales');
  }
  if(intent==='open')set('screen',/account|khata|खाता/.test(text)?'customerAccount':/stock|inventory|स्टॉक/.test(text)?'stock':/customers?|ग्राहक/.test(text)?'customers':/suppliers?|सप्लायर/.test(text)?'suppliers':/purchase|खरीद/.test(text)?'purchases':/payment|भुगतान/.test(text)?'payments':/expense|kharcha|खर्च/.test(text)?'expenses':/closing|hisaab|हिसाब/.test(text)?'daily-closing':/demand|डिमांड/.test(text)?'demand':/reports?|रिपोर्ट/.test(text)?'reports':/bills?|sales|invoices?|बिल|बिक्री/.test(text)?'sales':/home|dashboard|डैशबोर्ड/.test(text)?'home':'');
  return result;
}
export function voiceNavigation(command:VoiceCommand,state:V3State):string|null{
 if(!voiceAllowed('open',state))return null;const screen=command.fields.screen;
 if(screen==='customerAccount')return state.configuration.permissions.customers&&state.customers.some(c=>c.id===command.fields.customerId)?'/app/customers/'+command.fields.customerId:null;
 const permissions:Record<string,Permission>={customers:'customers',suppliers:'purchases',purchases:'purchases',payments:'payments',expenses:'reports','daily-closing':'reports',demand:'demand',reports:'reports',sales:'sales'};
 if(screen==='stock')return state.configuration.permissions.inventory||state.configuration.permissions.sales||state.configuration.permissions.demand?'/app/stock':null;
 if(screen==='home')return'/app';if(!permissions[screen]||!state.configuration.permissions[permissions[screen]])return null;
 if(screen==='daily-closing'&&!state.configuration.features.dailyClosing||screen==='demand'&&!state.configuration.features.demandPulse)return null;return'/app/'+screen;
}
export function missingVoiceFields(command:VoiceCommand,state:V3State):string[] {
  const missing=[...command.warnings];const f=command.fields;
  if(['sale','stock','purchase','demand'].includes(command.intent)&&!command.items.length)missing.push('items');
  if(command.intent==='sale'&&!f.mode)missing.push('salePayment');
  for(const item of command.items){if(!item.productId&&command.intent!=='demand')missing.push('product');if(!item.quantity)missing.push('quantity');if(item.productId&&voiceQuantity(item,state.products)===null)missing.push('quantityUnit');if(item.priceBasis==='unclear'||item.priceBasis==='total')missing.push('priceBasis');}
  if(['customer','supplier'].includes(command.intent)&&!f.name)missing.push('name');
  if(command.intent==='payment'&&!f.customerId)missing.push('customer');
  if(['expense','payment'].includes(command.intent)){if(!f.amount)missing.push('amount');if(!f.method)missing.push('method');}
  if(command.intent==='purchase'&&!f.supplierId)missing.push('supplier');
  return [...new Set(missing)];
}
export interface VoiceAnswer { label:string; value:string }
export function reportAnswer(command:VoiceCommand,state:V3State,language:string,stats?:VoiceReport):VoiceAnswer[] {
  if(!voiceAllowed('report',state))return[];

 const today=businessDay(), from=command.fields.period==='all'?'0000-00-00':command.fields.period==='week'?businessDay(new Date(Date.now()-6*86400000)):today;
  const inPeriod=(date:string)=>businessDay(date)>=from&&businessDay(date)<=today;
  const invoices=state.invoices.filter(i=>i.status!=='cancelled'&&inPeriod(i.date)), payments=state.payments.filter(p=>inPeriod(p.date));
  const report=command.fields.report;
  if(report==='sales')return[{label:text(language,'voiceos','report0'),value:money(stats?.salesPaise??(command.fields.period==='all'?state.totals.salesPaise:command.fields.period==='week'?state.weeklySales.reduce((sum,day)=>sum+day.salesPaise,0):state.metrics.salesTodayPaise),language)},{label:text(language,'voiceos','report1'),value:String(stats?.bills??(command.fields.period==='today'?state.metrics.billsToday:invoices.length))}];
  if(report==='cashBalance')return[{label:text(language,'workspace','expectedCash'),value:stats?.expectedCashPaise===undefined?text(language,'workspace','loadingRecord'):money(stats.expectedCashPaise,language)}];
  if(report==='collections')return[{label:text(language,'voiceos','report2'),value:money(stats?.cashPaise??state.daily.cashPaise,language)},{label:text(language,'voiceos','report3'),value:money(stats?.upiPaise??state.daily.upiPaise,language)}];
  if(report==='outstanding'){const query=command.fields.customerQuery, ids=query?resolveContact(query,state.customers):[];if(query&&ids.length!==1)return[{label:text(language,'voiceos','report4'),value:query}];return[{label:text(language,'voiceos','report5'),value:money(query?state.customers.find(c=>c.id===ids[0])!.balancePaise:state.metrics.outstandingPaise,language)}];}
  if(report==='expenses')return[{label:text(language,'voiceos','report6'),value:money(stats?.expensesPaise??(command.fields.period==='all'?state.totals.expensesPaise:state.daily.expensesPaise),language)}];
  if(report==='stock'||report==='lowStock'){const query=command.fields.query.replace(/\b(?:stock|mein|kitna|kitni|how|much|is|left|bacha|hai|in)\b|स्टॉक|में|कितना|कितनी|बचा|है/gu,' ').trim();const matches=report==='stock'?matchProducts(query,state.products):{ids:[],exact:false};const products=report==='lowStock'?state.products.filter(p=>p.quantityMilli<=p.minStockMilli):matches.exact?state.products.filter(p=>matches.ids.includes(p.id)):[];return products.length?products.slice(0,20).map(p=>({label:p.name+(p.variation?' · '+p.variation:''),value:quantity(p.quantityMilli)+' '+unitText(p.unit,language)})):[{label:text(language,'voiceos','report7'),value:report==='lowStock'?'0':text(language,'voiceos','report8')}];}
  if(report==='demand'||report==='followups'||report==='recovered'){if(!voiceAllowed('demand',state))return[];if(report==='followups')return state.demand.requestsList.filter(r=>r.eligibleFollowUp).slice(0,20).map(r=>({label:r.productName+' '+r.variant,value:r.customerName}));if(report==='recovered')return[{label:text(language,'voiceos','report9'),value:money(state.demand.recoveredPaise,language)}];return[{label:text(language,'voiceos','report10'),value:String(state.demand.openRequests)},...state.demand.groups.slice(0,5).map(g=>({label:g.productName+' '+g.variant,value:quantity(g.quantityMilli)+' '+unitText(g.unit,language)}))];}
  if(report==='topSales'){if(stats)return stats.topProducts.slice(0,5).map(item=>({label:item.name,value:quantity(item.quantityMilli)+' '+unitText(item.unit,language)}));return[];}return[];
}
