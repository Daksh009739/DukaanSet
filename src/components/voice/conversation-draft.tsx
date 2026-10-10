'use client';
import {useTranslation} from 'react-i18next';
import {osCopy} from '@/lib/voice/os-copy';
import {resolveContact,voiceQuantity,type VoiceCommand} from '@/lib/voice/os';
import {salePreview} from '@/lib/voice/conversation';
import {money} from '@/lib/client';
import {useApp} from '../app-provider';
import {Field,Select} from '../ui';
import {LocalizedUnit} from '../localized-data';

export function ConversationDraft({command,onChange,disabled}:{command:VoiceCommand;onChange:(value:VoiceCommand)=>void;disabled:boolean}){
 const app=useApp(),state=app.state!,language=useTranslation().i18n.language,copy=osCopy(language),f=command.fields;
 const field=(key:string,value:string)=>onChange({...command,fields:{...f,[key]:value},warnings:command.warnings.filter(w=>w!=='phone')});
 const candidates=resolveContact(f.customerQuery||f.name||'',state.customers);
 const editItem=(id:string,changes:Partial<VoiceCommand['items'][number]>)=>onChange({...command,fields:{...f,total:''},warnings:[],items:command.items.map(item=>item.id===id?{...item,...changes}:item)});
 const preview=command.intent==='sale'?salePreview(command,state.products):null;
 return <section className="conversation-draft" aria-label={copy.draft}><div className="conversation-draft-title"><b>{copy.draft}</b><span>{copy.notSaved}</span></div>
 {['sale','customer','payment'].includes(command.intent)&&<>
 {f.createCustomer==='true'||command.intent==='customer'?<Field label={copy.customerName} value={f.name||''} disabled={disabled} maxLength={100} onChange={event=>field('name',event.target.value)}/>:<Select label={copy.customerLabel} value={f.customerId||''} disabled={disabled} onChange={event=>onChange({...command,fields:{...f,customerId:event.target.value,customerQuery:state.customers.find(c=>c.id===event.target.value)?.name||''},warnings:[]})}><option value="">{copy.selectCustomer}</option>{state.customers.filter(c=>!f.customerQuery||!candidates.length||candidates.includes(c.id)).map(c=><option key={c.id} value={c.id}>{c.name} · {c.phone}</option>)}</Select>}
 {(f.createCustomer==='true'||command.intent==='customer')&&<Field label={copy.optionalPhone} value={f.phone||''} disabled={disabled} maxLength={30} onChange={event=>field('phone',event.target.value)}/>}
 </>}
 {command.intent==='sale'&&command.items.map((item,index)=>{const product=state.products.find(p=>p.id===item.productId),qty=voiceQuantity(item,state.products),price=item.priceBasis==='unit'&&item.price!==''?Number(item.price)*100:product?.pricePaise;return <article className="conversation-sale-row" key={item.id}><b>{product?.name||item.query}{product?.variation?' · '+product.variation:''}</b><span>{item.quantity||'—'} <LocalizedUnit value={item.unit}/> {price!==undefined?' · '+money(price,language):''}</span>
 {!product&&<Select label={copy.choose+' '+(index+1)} disabled={disabled} value={item.productId} onChange={event=>{const chosen=state.products.find(p=>p.id===event.target.value)!;editItem(item.id,{productId:chosen.id,query:chosen.name,unit:item.unit||chosen.unit,candidates:[chosen.id]});}}><option value="">—</option>{state.products.filter(p=>!item.candidates.length||item.candidates.includes(p.id)).map(p=><option key={p.id} value={p.id}>{p.name} {p.variation}</option>)}</Select>}
 <details open={!item.quantity||qty===null||item.priceBasis==='unclear'||item.priceBasis==='total'}><summary>{copy.edit}</summary><div className="conversation-fields"><Field label={copy.quantityLabel+' '+(index+1)} value={item.quantity} disabled={disabled} inputMode="decimal" onChange={event=>editItem(item.id,{quantity:event.target.value})}/><Field label={copy.price+' '+(index+1)} value={item.price} placeholder={product?String(product.pricePaise/100):''} disabled={disabled} inputMode="decimal" onChange={event=>editItem(item.id,{price:event.target.value,priceBasis:event.target.value?'unit':''})}/></div></details>
 {product&&qty!==null&&qty>product.quantityMilli&&<p className="form-error">{copy.insufficientStock}</p>}{product&&item.price&&Number(item.price)*100!==product.pricePaise&&<p className="conversation-price-change">{copy.priceChange} · {money(product.pricePaise,language)} → {money(Number(item.price)*100,language)}</p>}
 </article>;})}
 {command.intent==='sale'&&<><Select label={copy.paymentLabel} value={f.mode||''} disabled={disabled} onChange={event=>onChange({...command,fields:{...f,mode:event.target.value,cash:'',upi:''},warnings:[]})}><option value="">—</option><option value="cash">{copy.cash}</option><option value="upi">{copy.upi}</option><option value="credit">{copy.credit}</option><option value="split">{copy.split}</option></Select>{f.mode==='split'&&<div className="conversation-fields"><Field label={copy.cashAmount} inputMode="decimal" value={f.cash||''} disabled={disabled} onChange={event=>field('cash',event.target.value)}/><Field label={copy.upiAmount} inputMode="decimal" value={f.upi||''} disabled={disabled} onChange={event=>field('upi',event.target.value)}/></div>}{preview&&<dl className="conversation-total"><div><dt>{copy.total}</dt><dd>{money(preview.total,language)}</dd></div><div><dt>{copy.credit}</dt><dd>{money(preview.pending,language)}</dd></div></dl>}</>}
 {command.intent==='expense'&&<Field label={copy.description} value={f.description||''} disabled={disabled} onChange={event=>field('description',event.target.value)}/>}
 {['payment','expense'].includes(command.intent)&&<div className="conversation-fields"><Field label={copy.amountLabel} inputMode="decimal" value={f.amount||''} disabled={disabled} onChange={event=>field('amount',event.target.value)}/><Select label={copy.paymentLabel} value={f.method||''} disabled={disabled} onChange={event=>field('method',event.target.value)}><option value="">—</option><option value="cash">{copy.cash}</option><option value="upi">{copy.upi}</option></Select></div>}
 </section>;
}
