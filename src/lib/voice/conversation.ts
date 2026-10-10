import type { Invoice, Product } from '../contracts';
import type { V3State } from '../v3-contracts';
import { minorUnits,lineTotal } from '../client';
import { detectIntent,interpretVoice,resolveContact,resolveVoiceProduct,spokenText,voiceAllowed,voiceQuantity,voiceIntents,type VoiceCommand,type VoiceIntent } from './os';
import {canonicalUnit,canonicalProductName} from './parser';
import {prepareStockCommand} from './stock-command';
import {z} from 'zod';

const voiceActionRouting:Record<VoiceIntent,{safety:'read'|'navigate'|'write'|'review';destination?:string}>={
 sale:{safety:'write'},stock:{safety:'write'},customer:{safety:'write'},payment:{safety:'write'},expense:{safety:'write'},supplier:{safety:'review'},purchase:{safety:'review'},demand:{safety:'review'},closing:{safety:'review',destination:'/app/daily-closing'},report:{safety:'read'},document:{safety:'review'},reorder:{safety:'review'},followup:{safety:'review'},open:{safety:'navigate'},cancel:{safety:'navigate'},unknown:{safety:'review'}
};
export const voiceCommandSchema=z.object({intent:z.enum(['sale','stock','customer','payment','expense','supplier','purchase','demand','closing','report','document','reorder','followup','open','cancel','unknown']),transcript:z.string().max(5000),fields:z.record(z.string(),z.string().max(5000)).refine(value=>Object.keys(value).length<=50),items:z.array(z.object({id:z.string().max(150),query:z.string().max(150),productId:z.string().max(150),candidates:z.array(z.string().max(150)).max(2000),quantity:z.string().max(150),unit:z.string().max(150),price:z.string().max(150),priceBasis:z.enum(['','unit','total','unclear'])})).max(100),changed:z.array(z.string()).max(50),changedItems:z.array(z.string()).max(100),warnings:z.array(z.string()).max(100),removedProducts:z.array(z.string()).max(100).optional()});
export const voiceCapabilities={
 sale:{service:'Store.createVoiceSale',permission:'sales',required:['products','quantities','payment'],entities:['customer','product'],confirmation:'write',retry:'frozen idempotency key'},
 stock:{service:'Store.receiveStockBatch',permission:'inventory',required:['products','quantities','new product selling rates'],entities:['product'],confirmation:'write',retry:'frozen batch and key'},
 customer:{service:'Store.createContact',permission:'customers',required:['name'],entities:['customer'],confirmation:'write',retry:'frozen idempotency key'},
 payment:{service:'Store.receivePayment',permission:'payments',required:['customer','amount','method'],entities:['customer'],confirmation:'write',retry:'frozen idempotency key'},
 expense:{service:'Store.createExpense',permission:'reports',required:['description','amount','method'],entities:[],confirmation:'write',retry:'frozen idempotency key'},
 supplier:{service:'Store.createContact',permission:'purchases',required:['name'],entities:['supplier'],confirmation:'review form',retry:'existing domain form'},
 purchase:{service:'Store.createPurchase / SaaSService.receiveOrder / ClosingService.supplierPayment',permission:'purchases',required:['supplier','items or existing order','cost or payment'],entities:['supplier','product','order'],confirmation:'review form',retry:'existing domain form'},
 demand:{service:'SaaSService.createDemand',permission:'demand',required:['item','quantity','request count'],entities:['product','customer'],confirmation:'review form',retry:'frozen idempotency key'},
 document:{service:'DocumentService.prepare / DeliveryService.preview',permission:'customers plus document kind',required:['actual source record'],entities:['customer','invoice','payment'],confirmation:'preview; recipient confirmation for sharing',retry:'immutable document'},
 closing:{service:'ClosingService.preview / close',permission:'reports',required:['active session','cash review'],entities:['business session'],confirmation:'cash review and explicit close',retry:'snapshot and domain idempotency'},
 report:{service:'Store.voiceReport / authorised business state',permission:'reports',required:['question'],entities:['product','customer'],confirmation:'read only',retry:'safe scoped read'},
 reorder:{service:'SaaSService.reorder',permission:'purchases + demand',required:['product','quantity','supplier or draft'],entities:['demand group','product'],confirmation:'review form',retry:'existing domain form'},
 followup:{service:'SaaSService.message / followUp',permission:'demand',required:['eligible consented request'],entities:['demand request'],confirmation:'preview; manual contact confirmation',retry:'existing domain form'},
 open:{service:'permission-checked navigation / Store.editCustomer / Store.editProduct / account language',permission:'destination or editor role',required:['destination or reviewed edit'],entities:['customer','product'],confirmation:'navigation; explicit editor save or language change',retry:'safe navigation; optimistic edit snapshot'},
 cancel:{service:'temporary draft only',permission:'none',required:[],entities:[],confirmation:'no financial mutation',retry:'safe cancellation'},
 unknown:{service:'clarification only',permission:'none',required:['supported intent'],entities:[],confirmation:'no execution',retry:'revise request'}
} as const;
const defineVoiceAction=(intent:VoiceIntent)=>({intent,...voiceActionRouting[intent],...voiceCapabilities[intent],inputSchema:voiceCommandSchema,
 entityResolvers:{customer:resolveContact,supplier:resolveContact,product:resolveVoiceProduct},
 permitted:(state:V3State)=>voiceAllowed(intent,state),
 draftBuilder:(raw:string,state:V3State,previous?:VoiceCommand)=>advanceVoice(raw,state,previous,undefined,intent),
 requestBuilder:(command:VoiceCommand,state:V3State,key:string)=>command.intent===intent?buildVoiceRequest(command,state,key):null,
 businessRules:'Existing domain services enforce scope, units, ledger integrity, stock and transition rules at commit.',
 errors:'Clarify missing entities; retain frozen payload on uncertain network failure; revalidate confirmed domain rejection.',
 audit:'Only the authoritative domain transaction creates a durable business audit.'
});
export const voiceActionRegistry=Object.fromEntries(voiceIntents.map(intent=>[intent,defineVoiceAction(intent)])) as Record<VoiceIntent,ReturnType<typeof defineVoiceAction>>;
/** Remove recognised command/unit echoes; repeated numbers remain meaningful. */
export function normalizeVoiceInstruction(raw:string):string{return raw.replace(/\b(kar do)(?:\s+kar do)+\b/gi,'$1').replace(/\b(kilo|kg|packet|piece|litre)\s+\1\b/gi,'$1').trim();}
function ambiguousStockSale(raw:string):boolean{const text=spokenText(raw);return /\d+\s*(?:kilo|kg|packet|piece|किलो|पीस|पैकेट)/.test(text)&&/add|jodo|जोड़/.test(text)&&/cash|nakad|कैश|नकद/.test(text)&&!/stock|स्टॉक|bill|invoice|sale|sold|sell|bech|purchase|supplier|traders|बिल|बेच|खरीद/.test(text);}
export function chooseVoiceIntent(command:VoiceCommand,intent:'stock'|'sale',state:V3State):VoiceCommand{
 const original=command.fields.sourceTranscript||command.transcript,clean=normalizeVoiceInstruction(original).replace(/\b(?:cash|nakad)\b|कैश|नकद/gi,' ').trim();
 const rows=prepareStockCommand(clean,state.products),result=interpretVoice(clean,state,intent,undefined,true);
 result.items=rows.map(row=>({id:row.id,query:row.query,productId:row.productId,candidates:row.candidates,quantity:row.quantity,unit:row.unit,price:row.sellingPrice||'',priceBasis:row.sellingPrice?'unit':''}));
 result.fields.sourceTranscript=original;result.transcript=clean;result.warnings=result.warnings.filter(w=>w!=='wrongWorkflow');
 if(intent==='sale')result.fields.mode='cash';
 if(!voiceAllowed(intent,state))result.warnings=['permission'];
 return result;
}
export function commandCustomerName(raw:string):string {
 const name=raw.match(/(?:named?|naam|नाम)\s+(?!(?:ka|ki|se|का|की|से)\s)(.+?)(?=\s+(?:customer|add|phone|mobile|ko|ka|और|aur)|[,;]|$)/iu)?.[1]?.trim()
  ||raw.match(/^\s*(.+?)\s+(?:ke naam se|naam (?:ka|ki)|customer add|को|का|के नाम से|नाम का|नाम की|ko|ka)(?=\s|$)/u)?.[1]?.trim()||'';
 return /^(?:new|naya|naye|create|add|नया|नए)$/i.test(name)||/^\d+\s/.test(spokenText(name))?'':name;
}
/** Conversation state is scoped by the provider; explicit cross-module commands win. */
export function advanceVoice(raw:string,state:V3State,previous?:VoiceCommand,selectedCustomerId?:string,contextIntent?:VoiceIntent):VoiceCommand {
 raw=normalizeVoiceInstruction(raw);
 if(previous&&spokenText(raw)===spokenText(normalizeVoiceInstruction(previous.transcript)))return previous;
 const editText=spokenText(raw),editMatch=editText.match(/^(.+?)\s+(?:ka|की|का)\s+(?:phone|mobile|फोन|मोबाइल)\s+(\d[\d ]{6,18})\s*(?:update|change|karo|kar do|बदलो|करो)/);
 const rateMatch=(!previous||previous.intent!=='stock')?editText.match(/^(.+?)\s+(?:ka|की|का)\s+(?:selling\s+)?(?:rate|price|दाम|रेट)\s+(\d+(?:\.\d{1,2})?)\s*(?:rupaye|rupees|रुपये)?\s*(?:kilo|kg|किलो)?\s*(?:update|change|rakhna|karo|kar do|बदलो|करो)/):null;
 const languageMatch=editText.match(/(?:language|bhasha|भाषा)\s+(?:to\s+)?(english|hindi|hinglish|अंग्रेजी|हिंदी)\s*(?:karo|change|update|करो|बदलो)?/);
 if(editMatch||rateMatch||languageMatch){
  const fields:Record<string,string>={},warnings:string[]=[];
  if(editMatch){const ids=resolveContact(editMatch[1],state.customers);Object.assign(fields,{operation:'editCustomer',query:editMatch[1],customerId:ids.length===1?ids[0]:'',phone:editMatch[2].replace(/\s/g,'')});if(!state.configuration.permissions.customers)warnings.push('permission');}
  if(rateMatch){const ids=resolveVoiceProduct(rateMatch[1],state.products).ids;Object.assign(fields,{operation:'editProduct',query:rateMatch[1],productId:ids.length===1?ids[0]:'',price:rateMatch[2],rateUnit:/kilo|kg|किलो/.test(rateMatch[0])?'kg':''});if(!state.configuration.permissions.inventory)warnings.push('permission');}
  if(languageMatch)Object.assign(fields,{operation:'language',language:/hindi|हिंदी/.test(languageMatch[1])?'hi':languageMatch[1]==='hinglish'?'hinglish':'en'});
  return{intent:'open',transcript:raw,fields,items:[],warnings,changed:Object.keys(fields),changedItems:[]};
 }
 if(previous?.warnings.includes('intentChoice')){const answer=spokenText(raw);if(/^(?:stock|inventory|स्टॉक)(?:\s|$)/.test(answer))return chooseVoiceIntent(previous,'stock',state);if(/^(?:sale|cash sale|bill|बिल|बिक्री)(?:\s|$)/.test(answer))return chooseVoiceIntent(previous,'sale',state);}
 if(ambiguousStockSale(raw)){const result=chooseVoiceIntent({intent:'stock',transcript:raw,fields:{sourceTranscript:raw},items:[],warnings:[],changed:[],changedItems:[]},'stock',state);result.warnings=['intentChoice'];result.transcript=raw;return result;}
 const text=spokenText(raw),supplierPayment=/(?:supplier|traders|सप्लायर|ट्रेडर्स)/.test(text)&&/payment|paid|bhugtan|भुगतान/.test(text)&&/paid|pay\b|record|add|karo|kar do|दर्ज|करो|किया/.test(text)&&!/show|view|history|dikhao|दिखाओ/.test(text),receivingOrder=/(?:receive|received|माल आया|receive karo)/.test(text)&&/order|ऑर्डर/.test(text),detected=supplierPayment||receivingOrder?'purchase':/invoice|bill|बिल/.test(text)&&/show|view|dikhao|दिखाओ|details/.test(text)?'document':detectIntent(raw),isReply=previous&&(
  /^(?:cash|upi|credit|udhaar|nakad|नकद|उधार|कैश|यूपीआई)(?:\s|$)/.test(text)||

  /nahi|nahin|नहीं|instead|correct/.test(text)||detected==='unknown'||previous.intent==='sale'&&detected==='stock'&&!/stock|स्टॉक|selling|purchase cost|cost price/.test(text));
 const intent:VoiceIntent=detected==='cancel'?'cancel':isReply?previous!.intent:detected==='unknown'&&contextIntent?contextIntent:detected;
 let source=raw;
 const total=text.match(/(?:₹\s*)?(\d+(?:\.\d{1,2})?)\s*(?:rupaye|rupees|rupee|रुपये|रुपए)?\s*(?:mein|में)(?=\s|$)/)
  ||text.match(/(\d+(?:\.\d{1,2})?)\s*(?:rupaye|rupees|रुपये)?\s*(?:(?:ka|का)\s*)?(?:bill|बिल)/)
  ||text.match(/(\d+(?:\.\d{1,2})?)\s*(?:rupaye|rupees|रुपये)?\s*(?:ka|का)(?=\s+.*(?:bill|बिल))/)
  ||(previous?.intent==='sale'?text.match(/^(\d+(?:\.\d{1,2})?)\s*(?:rupaye|rupees|रुपये)\.?$/):null);
 const customerName=text.match(/(?:nahi|nahin|नहीं)\s+([\p{L}\p{M} ]+?)\s+(?:ke naam se|के नाम से)/u)?.[1]?.trim()||commandCustomerName(raw);
 const combined=intent==='sale'&&/customer.*(?:add|जोड़)|(?:add|जोड़).*customer/.test(text);
 if(intent==='sale'){
  source=total?text.replace(total[0],' '):text;
  if(/^\d+\s*(?:kilo|kg|packet|piece|किलो|पीस)/.test(source))source=source.replace(/\s+(?:ka|का)\s+(?:bill|बिल)\s+(?:banao|bana do|बनाओ)/,' sold');
  if(combined&&customerName)source=source.replace(/^.*?\b(?:aur|and)\b/,'').replace(/\buska\b/g,customerName+' ka');
  source=source.replace(/(?<!\d\s)(?<!\d\s(?:rupaye|rupees)\s)\b(?:cash|upi|nakad)\s+(?:mila|received|hai)\b/g,'');
  source=source.replace(/(?:aur|and|और)\s+\d+(?:\.\d+)?\s+(?:udhaar|credit|उधार).*$/,'');
  source=source.replace(/(\d+(?:\.\d{1,2})?)\s*(?:rupaye|rupees|रुपये)\s+(?:kilo|kg|piece|pieces|packet|किलो|पीस)/g,'$1 ki ek');
  if(previous&&/^(?:cash|upi|credit|udhaar|nakad|नकद|उधार|कैश|यूपीआई)(?:\s|$)/.test(text)&&!/^\w+\s+\d/.test(text))source='';
 }
 const result=source?interpretVoice(source,state,intent,previous?.intent===intent?previous:undefined,true):previous?{...previous,fields:{...previous.fields},items:previous.items.map(i=>({...i})),changed:[],changedItems:[],warnings:[],transcript:raw}:interpretVoice(raw,state);
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
 if(selectedCustomerId&&state.customers.some(c=>c.id===selectedCustomerId)&&/this customer|is customer|iska|uska|इस ग्राहक|इसके|इसका/.test(text)&&['sale','payment','report','document','open'].includes(intent)){result.fields.customerId=selectedCustomerId;result.fields.customerQuery=state.customers.find(c=>c.id===selectedCustomerId)!.name;}
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
 if(command.warnings.includes('intentChoice'))return'intentChoice';
 if(command.warnings.includes('permission'))return'permission';
 if(command.intent==='unknown')return'unknown';
 for(const warning of ['correction','priceInvalid','splitCollection','phone','wrongWorkflow'])if(command.warnings.includes(warning))return warning;
 const f=command.fields;
 if(f.operation==='editCustomer'&&!f.customerId)return'customer';
 if(f.operation==='editProduct'&&!f.productId)return'product';
 if(command.intent==='sale'){
  if(f.customerQuery&&!f.customerId&&f.createCustomer!=='true')return'customer';
  if(!command.items.length)return'items';if(command.items.some(i=>!i.productId))return'product';
  if(command.items.some(i=>!i.quantity))return'quantity';if(command.items.some(i=>voiceQuantity(i,state.products)===null))return'quantityUnit';
  if(command.items.some(i=>{const product=state.products.find(p=>p.id===i.productId),qty=voiceQuantity(i,state.products);return product&&qty!==null&&qty>product.quantityMilli;}))return'insufficientStock';
  if(command.items.some(i=>i.priceBasis==='unclear'||i.priceBasis==='total'))return'priceBasis';
  if(!f.mode)return'salePayment';if(!salePreview(command,state.products).valid)return'priceInvalid';
  if(salePreview(command,state.products).pending>0&&!f.customerId&&f.createCustomer!=='true')return'customer';
 }
 if(command.intent==='customer'&&!f.name)return'name';
 if(command.intent==='payment'&&!f.customerId)return'customer';
 if(command.intent==='expense'&&!f.description?.trim())return'description';
 if(command.intent==='payment'||command.intent==='expense'){try{if(!f.amount||minorUnits(f.amount)<=0)return'amount';}catch{return'amount';}if(!['cash','upi'].includes(f.method))return'method';}
 return'';
}
/** Only registered writes produce fixed domain requests. The server revalidates all business rules. */
export function buildVoiceRequest(command:VoiceCommand,state:V3State,key:string):{path:string;body:Record<string,unknown>}|null{
 if(!voiceCommandSchema.safeParse(command).success||!voiceAllowed(command.intent,state)||nextVoiceQuestion(command,state))return null;
 const f=command.fields,body:Record<string,unknown>={idempotencyKey:key};
 if(command.intent==='sale'){const sale=salePreview(command,state.products);if(!sale.valid)return null;return{path:'/voice-sale',body:{...body,...f.createCustomer==='true'?{newCustomer:{name:f.name,phone:f.phone||''}}:{},sale:{customerId:f.customerId||null,items:sale.items,discountPaise:sale.discount,payments:[{method:'cash',amountPaise:sale.cash},{method:'upi',amountPaise:sale.upi}].filter(p=>p.amountPaise>0),dueDate:null}}};}
 if(command.intent==='customer')return{path:'/customers',body:{...body,name:f.name,phone:f.phone||'',rejectDuplicate:true}};
 if(command.intent==='payment')return{path:'/payments',body:{...body,customerId:f.customerId,amountPaise:minorUnits(f.amount),method:f.method}};
 if(command.intent==='expense')return{path:'/expenses',body:{...body,description:f.description,amountPaise:minorUnits(f.amount),method:f.method}};
 return null;
}
export type VoiceSavedResult={intent:VoiceIntent;invoice?:Invoice;id?:string};
export function voiceRateInCatalogueUnit(price:string,spokenUnit:string,product:Product):string|null{
 const item={id:'rate',query:product.name,productId:product.id,candidates:[product.id],quantity:'1',unit:spokenUnit||product.unit,price:'',priceBasis:'' as const},quantity=voiceQuantity(item,[product]);
 if(quantity===null)return null;try{const amount=BigInt(minorUnits(price))*1000n;if(amount%BigInt(quantity)!==0n)return null;return String(Number(amount/BigInt(quantity))/100);}catch{return null;}
}
export type VoiceConversationState='idle'|'permission'|'listening'|'interpreting'|'clarifying'|'reviewing'|'awaitingConfirmation'|'executing'|'success'|'failure'|'retry';
export function voiceConversationState(command:VoiceCommand|null,state:V3State,options:{capture?:string;busy?:boolean;pending?:boolean;saved?:boolean;error?:boolean}={}):VoiceConversationState{
 if(options.busy)return'executing';if(options.pending)return'retry';if(options.error)return'failure';if(options.saved)return'success';if(options.capture==='permissionState')return'permission';if(options.capture==='listening')return'listening';if(!command)return'idle';if(nextVoiceQuestion(command,state))return'clarifying';return voiceActionRegistry[command.intent].safety==='write'?'awaitingConfirmation':'reviewing';
}
