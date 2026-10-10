import type { Invoice, Product } from '../contracts';
import type { V3State } from '../v3-contracts';
import { minorUnits,lineTotal } from '../client';
import { detectIntent,interpretVoice,resolveContact,resolveVoiceProduct,spokenText,voiceAllowed,voiceQuantity,type VoiceCommand,type VoiceIntent } from './os';
import {canonicalUnit,canonicalProductName} from './parser';

export const voiceActionRegistry:Record<VoiceIntent,{safety:'read'|'navigate'|'write'|'review';destination?:string}>={
 sale:{safety:'write'},stock:{safety:'write'},customer:{safety:'write'},payment:{safety:'write'},expense:{safety:'write'},supplier:{safety:'review'},purchase:{safety:'review'},demand:{safety:'review'},closing:{safety:'review',destination:'/app/daily-closing'},report:{safety:'read'},document:{safety:'review'},reorder:{safety:'review'},followup:{safety:'review'},open:{safety:'navigate'},cancel:{safety:'navigate'},unknown:{safety:'review'}
};
export function commandCustomerName(raw:string):string {
 const name=raw.match(/(?:named?|naam|नाम)\s+(?!(?:ka|ki|se|का|की|से)\s)(.+?)(?=\s+(?:customer|add|phone|mobile|ko|ka|और|aur)|[,;]|$)/iu)?.[1]?.trim()
  ||raw.match(/^\s*(.+?)\s+(?:ke naam se|naam (?:ka|ki)|customer add|को|का|के नाम से|नाम का|नाम की|ko|ka)(?=\s|$)/u)?.[1]?.trim()||'';
 return /^(?:new|naya|naye|create|add|नया|नए)$/i.test(name)?'':name;
}
/** Conversation state is scoped by the provider; explicit cross-module commands win. */
export function advanceVoice(raw:string,state:V3State,previous?:VoiceCommand,selectedCustomerId?:string):VoiceCommand {
 const text=spokenText(raw),supplierPayment=/(?:supplier|traders|सप्लायर|ट्रेडर्स)/.test(text)&&/payment|paid|bhugtan|भुगतान/.test(text)&&/paid|pay\b|record|add|karo|kar do|दर्ज|करो|किया/.test(text)&&!/show|view|history|dikhao|दिखाओ/.test(text),receivingOrder=/(?:receive|received|माल आया|receive karo)/.test(text)&&/order|ऑर्डर/.test(text),detected=supplierPayment||receivingOrder?'purchase':/invoice|bill|बिल/.test(text)&&/show|view|dikhao|दिखाओ|details/.test(text)?'document':detectIntent(raw),isReply=previous&&(
  /^(?:cash|upi|credit|udhaar|nakad|नकद|उधार|कैश|यूपीआई)(?:\s|$)/.test(text)||

  /nahi|nahin|नहीं|instead|correct/.test(text)||detected==='unknown');
 const intent:VoiceIntent=detected==='cancel'?'cancel':isReply?previous!.intent:detected;
 let source=raw;
 const total=text.match(/(?:₹\s*)?(\d+(?:\.\d{1,2})?)\s*(?:rupaye|rupees|rupee|रुपये|रुपए)?\s*(?:mein|में)(?=\s|$)/)
  ||text.match(/(\d+(?:\.\d{1,2})?)\s*(?:rupaye|rupees|रुपये)?\s*(?:(?:ka|का)\s*)?(?:bill|बिल)/)
  ||text.match(/(\d+(?:\.\d{1,2})?)\s*(?:rupaye|rupees|रुपये)?\s*(?:ka|का)(?=\s+.*(?:bill|बिल))/)
  ||(previous?.intent==='sale'?text.match(/^(\d+(?:\.\d{1,2})?)\s*(?:rupaye|rupees|रुपये)\.?$/):null);
 const customerName=commandCustomerName(raw);
 const combined=intent==='sale'&&/customer.*(?:add|जोड़)|(?:add|जोड़).*customer/.test(text);
 if(intent==='sale'){
  source=total?text.replace(total[0],' '):text;
  if(combined&&customerName)source=source.replace(/^.*?\b(?:aur|and)\b/,'').replace(/\buska\b/g,customerName+' ka');
  source=source.replace(/(?<!\d\s)(?<!\d\s(?:rupaye|rupees)\s)\b(?:cash|upi|nakad)\s+(?:mila|received|hai)\b/g,'');
  source=source.replace(/(?:aur|and|और)\s+\d+(?:\.\d+)?\s+(?:udhaar|credit|उधार).*$/,'');
  source=source.replace(/(\d+(?:\.\d{1,2})?)\s*(?:rupaye|rupees|रुपये)\s+(?:kilo|kg|piece|pieces|packet|किलो|पीस)/g,'$1 ki ek');
  if(previous&&/^(?:cash|upi|credit|udhaar|nakad|नकद|उधार|कैश|यूपीआई)(?:\s|$)/.test(text)&&!/^\w+\s+\d/.test(text))source='';
 }
 const result=source?interpretVoice(source,state,intent,previous?.intent===intent?previous:undefined):previous?{...previous,fields:{...previous.fields},items:previous.items.map(i=>({...i})),changed:[],changedItems:[],warnings:[],transcript:raw}:interpretVoice(raw,state);
 result.intent=intent;result.transcript=raw.slice(0,5000);
 if(!voiceAllowed(intent,state)){result.warnings=['permission'];return result;}
 if(supplierPayment){
  const payment=interpretVoice(text,state,'payment');result.fields={...result.fields,...payment.fields,operation:'supplierPayment'};
  const query=text.match(/^(.*?)\s+(?:ko|ke|ka|se|को|के|का|से)\s/)?.[1]?.replace(/(?:^|\s)supplier(?=\s|$)|सप्लायर/g,' ').trim()||'';
  const ids=resolveContact(query,state.suppliers);result.fields.supplierQuery=query;result.fields.supplierId=ids.length===1?ids[0]:'';result.warnings=[];result.items=[];
 }
 if(receivingOrder){result.fields.operation='receiveOrder';result.fields.query=text;result.items=[];}
 if(intent==='document'){
  const invoice=state.invoices.find(invoice=>text.includes(invoice.number.toLowerCase())||text.includes(invoice.id.toLowerCase()));if(invoice){result.fields.invoiceId=invoice.id;result.fields.customerId=invoice.customerId||'';result.fields.documentKind='invoice';}
 }
 if(['sale','customer'].includes(intent)&&customerName){
  const ids=resolveContact(customerName,state.customers);result.fields.customerQuery=customerName;result.fields.customerId=ids.length===1?ids[0]:'';
  if(intent==='customer')result.fields.name=customerName;
  if(combined&&!ids.length){result.fields.createCustomer='true';result.fields.name=customerName;}
 }
 if(intent==='sale'){
  if(!result.fields.customerQuery&&!result.fields.customerId&&selectedCustomerId&&state.customers.some(c=>c.id===selectedCustomerId))result.fields.customerId=selectedCustomerId;
  if(total)result.fields.total=total[1];
  result.items=result.items.filter(item=>item.query&&!/^(?:cash|upi|rupaye|uska|naam|ka|ke naam se|kar do|bana do)$/.test(item.query));
  if(previous&&/customer.*(?:nahi|nahin|नहीं)/.test(text)){
   const name=text.match(/(?:nahi|nahin|नहीं)\s+(.+?)(?:\s+(?:karo|kar|करो))?$/)?.[1]?.trim();if(name){const ids=resolveContact(name,state.customers);result.fields.customerQuery=name;result.fields.customerId=ids.length===1?ids[0]:'';}
  }
  if(/cash nahi|cash nahin|कैश नहीं|nakad nahi/.test(text)&&/upi|यूपीआई/.test(text)){result.fields.mode='upi';delete result.fields.cash;delete result.fields.upi;}
  else if(/(?:^|\s)(?:cash|nakad|नकद|कैश)(?:\s|$)/.test(text)&&!result.fields.cash&&!result.fields.upi)result.fields.mode='cash';
  else if(/(?:^|\s)(?:upi|यूपीआई)(?:\s|$)/.test(text)&&!result.fields.cash&&!result.fields.upi)result.fields.mode='upi';
  else if(/^(?:credit|udhaar|उधार)/.test(text)){result.fields.mode='credit';delete result.fields.cash;delete result.fields.upi;}
  const quantityCorrection=previous?.intent==='sale'?text.match(/(?:nahi|nahin|नहीं|ki jagah|की जगह)\s+(\d+(?:\.\d{1,3})?)\s*(kg|kilo|piece|pieces|shirts?|किलो|पीस|शर्ट)?\s*(.*?)\s*(?:karo|kar|करो)?$/):null;
  if(quantityCorrection){
   const query=quantityCorrection[3].replace(/\b(?:karo|kar|do)\b|करो/g,'').trim(),ids=query?resolveVoiceProduct(query,state.products).ids:[];
   const targets=result.items.filter(item=>!query&&result.items.length===1||ids.includes(item.productId)||canonicalProductName(item.query)===canonicalProductName(query));
   if(targets.length===1){targets[0].quantity=quantityCorrection[1];if(quantityCorrection[2]&&!/shirt|शर्ट/.test(quantityCorrection[2]))targets[0].unit=canonicalUnit(quantityCorrection[2]);result.warnings=result.warnings.filter(w=>w!=='correction');}
   else result.warnings.push('correction');
  }
  if(result.fields.total&&result.items.length===1&&result.items[0].quantity&&(total||!result.items[0].price)){
   const item=result.items[0],qty=voiceQuantity(item,state.products);if(qty!==null){try{const amount=BigInt(minorUnits(result.fields.total));if(amount*1000n%BigInt(qty)===0n){item.price=String(Number(amount*1000n/BigInt(qty))/100);item.priceBasis='unit';}else result.warnings.push('priceInvalid');}catch{result.warnings.push('priceInvalid');}}
  }
  result.changed=[...new Set([...result.changed,...Object.keys(result.fields)])];result.changedItems=result.items.map(item=>item.id);
 }
 if(intent==='customer'&&result.fields.name){result.fields.name=customerName||result.fields.name;result.fields.phone=result.fields.phone||'';}
 result.warnings=result.warnings.filter(w=>w!=='customer'||!result.fields.customerId&&result.fields.createCustomer!=='true');
 return result;
}
export function salePreview(command:VoiceCommand,products:Product[]){
 let total=0;const items:{productId:string;quantityMilli:number;pricePaise?:number}[]=[];let valid=true;
 try{for(const item of command.items){const product=products.find(p=>p.id===item.productId),qty=voiceQuantity(item,products);if(!product||qty===null||qty>product.quantityMilli||item.priceBasis==='unclear'||item.priceBasis==='total'){valid=false;continue;}
  const price=item.priceBasis==='unit'?minorUnits(item.price):product.pricePaise;if(price>1_000_000_000){valid=false;continue;}total+=lineTotal(price,qty);items.push({productId:product.id,quantityMilli:qty,...item.priceBasis==='unit'?{pricePaise:price}:{}});}
  const discount=minorUnits(command.fields.discount||'0');total-=discount;if(total<0||total>1_000_000_000_000)valid=false;
  const mode=command.fields.mode,cash=mode==='cash'?total:mode==='split'?minorUnits(command.fields.cash||'0'):0,upi=mode==='upi'?total:mode==='split'?minorUnits(command.fields.upi||'0'):0;
  const pending=total-cash-upi;if(!mode||pending<0||!items.length||command.fields.total&&minorUnits(command.fields.total)!==total)valid=false;
  return{total,cash,upi,pending,discount,items,valid};
 }catch{return{total:0,cash:0,upi:0,pending:0,discount:0,items:[],valid:false};}
}
export function nextVoiceQuestion(command:VoiceCommand,state:V3State):string {
 if(command.warnings.includes('permission'))return'permission';
 for(const warning of ['correction','priceInvalid','splitCollection','phone','wrongWorkflow'])if(command.warnings.includes(warning))return warning;
 const f=command.fields;
 if(command.intent==='sale'){
  if(f.customerQuery&&!f.customerId&&f.createCustomer!=='true')return'customer';
  if(!command.items.length)return'items';if(command.items.some(i=>!i.productId))return'product';
  if(command.items.some(i=>!i.quantity))return'quantity';if(command.items.some(i=>voiceQuantity(i,state.products)===null))return'quantityUnit';
  if(command.items.some(i=>i.priceBasis==='unclear'||i.priceBasis==='total'))return'priceBasis';
  if(!f.mode)return'salePayment';if(!salePreview(command,state.products).valid)return'priceInvalid';
  if(salePreview(command,state.products).pending>0&&!f.customerId&&f.createCustomer!=='true')return'customer';
 }
 if(command.intent==='customer'&&!f.name)return'name';
 if(command.intent==='payment'){if(!f.customerId)return'customer';if(!f.amount)return'amount';if(!f.method)return'method';}
 if(command.intent==='expense'){if(!f.description)return'description';if(!f.amount)return'amount';if(!f.method)return'method';}
 return'';
}
export type VoiceSavedResult={intent:VoiceIntent;invoice?:Invoice;id?:string};
