import type {Language,Invoice,InventoryEntry,Product} from '../contracts';
import type {V3State} from '../v3-contracts';
import {voiceQuantity,type VoiceCommand} from './os';
import type {SpokenReply} from './audio-contracts';
import {salePreview} from './conversation';
import {text,unitText} from '../locale';
import {money,quantity,minorUnits} from '../client';
import type en from '@/locales/en/speech.json';
export type ReplyKey=keyof typeof en;
export function makeReply(key:ReplyKey,language:Language,kind:SpokenReply['kind'],values:Record<string,string|number>={},turn=0,continueTurn=true):SpokenReply{
 const value=text(language,'speech',key,values),speechText=text(language==='hinglish'?'hi':language,'speech',key,values);
 return{id:turn+':'+key+':'+value,text:value,speechText,language,kind,continueTurn};
}
export type VerifiedVoiceResult={invoice?:Invoice;stock?:InventoryEntry;product?:Product;detail?:{label:string;amount?:number;path:string}};
export function replyForTask(facts:{command:VoiceCommand|null;state:V3State;question:string;ready:boolean;language:Language;turn:number;saved?:VerifiedVoiceResult|null;error?:string;pending?:boolean;answer?:{label:string;value:string}[];closing?:{date:string;sales:number;collections:number}|null;override?:ReplyKey|null}):SpokenReply|null{
 const {command,state,question,ready,language,turn,saved}=facts,amount=(value:number)=>money(value,language),reply=(key:ReplyKey,kind:SpokenReply['kind'],values:Record<string,string|number>={},next=true)=>makeReply(key,language,kind,values,turn,next);
 if(facts.override)return reply(facts.override,facts.override==='cancelled'?'cancel':'question',{},false);
 if(facts.error)return reply(facts.pending?'errorPending':'errorDraft','error',{},false);
 if(saved){if(saved.invoice){const i=saved.invoice;return reply('confirmedSale','success',{number:i.number,customer:i.customerName,total:amount(i.totalPaise),credit:amount(i.balancePaise)},false);}if(saved.stock)return reply('confirmedStock','success',{count:saved.stock.items.length},false);if(saved.product)return reply('confirmedProduct','success',{name:saved.product.name},false);if(saved.detail)return reply(saved.detail.path.startsWith('/app/payments')?'confirmedPayment':saved.detail.path.startsWith('/app/expenses')?'confirmedExpense':'confirmedCustomer','success',{name:saved.detail.label},false);return null;}
 if(!command)return reply('welcome','welcome');
 if(command.intent==='closing'&&command.fields.closingAction==='summary')return facts.closing?reply('closingResult','result',{date:facts.closing.date,sales:amount(facts.closing.sales),collections:amount(facts.closing.collections)},false):null;
 if(command.intent==='report')return facts.answer?.length?reply('resultIntro','result',{result:facts.answer.slice(0,2).map(row=>row.label+' '+row.value).join('. ')},false):null;
 const customer=state.customers.find(c=>c.id===command.fields.customerId)?.name||command.fields.customerQuery||text(language,'translation','walkIn'),product=state.products.find(p=>p.id===command.items[0]?.productId),productName=product?.displayNames?.[language]||product?.name||command.items[0]?.query||'';
 if(question){
  if(question==='items')return reply(command.intent==='sale'?'askItems':'askStockItems','question',{customer});
  if(question==='salePayment')return reply('askPayment','question',{total:amount(salePreview(command,state.products).total)});
  if(question==='price'||question==='productPrice')return reply('askPrice','question',{product:productName||command.fields.name||''});
  if(question==='insufficientStock'){const row=command.items.find(row=>{const p=state.products.find(p=>p.id===row.productId),q=voiceQuantity(row,state.products);return p&&q!==null&&q>p.quantityMilli;})||command.items[0],p=state.products.find(p=>p.id===row?.productId);return reply('insufficient','question',{product:p?.name||productName,quantity:quantity(p?.quantityMilli||0),unit:unitText(p?.unit||'kg',language)});}
  const keys:Record<string,ReplyKey>={product:'askProduct',customer:'askCustomer',name:'askName',quantity:'askQuantity',quantityUnit:'askUnit',productUnit:'askUnit',amount:'askAmount',method:'askMethod',description:'askDescription',intentChoice:'askAmbiguous',unknown:'askUnknown'};return reply(command.fields.operation==='productMeaning'?'askMeaning':keys[question]||'askReview','question');
 }
 if(ready){if(command.intent==='sale'){const p=salePreview(command,state.products);return reply('readySale','draft',{customer,total:amount(p.total),cash:amount(p.cash),upi:amount(p.upi),credit:amount(p.pending)});}if(command.intent==='stock')return reply(command.fields.operation==='catalogueProduct'?'readyProduct':'readyStock','draft',command.fields.operation==='catalogueProduct'?{name:command.fields.name}:{count:command.items.length});if(command.intent==='customer')return reply('readyCustomer','draft',{name:command.fields.name});if(command.intent==='payment')return reply('readyPayment','draft',{customer,amount:amount(minorUnits(command.fields.amount)),method:command.fields.method});if(command.intent==='expense')return reply('readyExpense','draft',{name:command.fields.description,amount:amount(minorUnits(command.fields.amount))});}
 return reply(command.fields.operation==='productMeaning'?'askMeaning':command.intent==='unknown'?'askUnknown':'reviewWorkflow','question',{},false);
}
