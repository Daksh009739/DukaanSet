'use client';
import Link from 'next/link';
import {useTranslation} from 'react-i18next';
import {PackagePlus,ShoppingBag,Wallet,Undo2,SlidersHorizontal} from 'lucide-react';
import type {HistoryEntry,RecordType} from '@/lib/record-contracts';
import {money,quantity} from '@/lib/client';
import {dateText,unitText} from '@/lib/locale';

export function ActivityTimeline({entries,type,canOpen}:{entries:HistoryEntry[];type:RecordType;canOpen:(href:string)=>boolean}){
 const {t,i18n}=useTranslation(),w=useTranslation('workspace').t;
 return <div className="activity-timeline">{entries.map(entry=>{
  const labels:Record<string,string>={sale:type==='customer'?'timelinePayment':'movementSold',opening:'movementReceived',receipt:'movementReceived',purchase:type==='customer'?'timelineBill':'movementReceived',repayment:'timelinePayment',refund:'timelineRefund',cancellation:type==='customer'?'timelineCancelledBill':'movementReturned',wastage:'movementWasted',correction:'movementAdjusted',receivedPurchase:'movementReceived',supplierPayment:'timelineSupplierPayment',pendingOrder:'timelineOrder',cancelledOrder:'timelineCancelledOrder'};
  const Icon=['repayment','refund','supplierPayment','salePayment'].includes(entry.kind)||type==='customer'&&entry.kind==='sale'?Wallet:entry.kind==='cancellation'?Undo2:entry.kind==='sale'||type==='customer'&&entry.kind==='purchase'?ShoppingBag:['correction','wastage'].includes(entry.kind)?SlidersHorizontal:PackagePlus;
  const kind=w(labels[entry.kind]||'timelinePayment'),title=type==='customer'&&entry.kind==='purchase'?`${kind} ${entry.label}`:kind;
  const reference=entry.reference||(!/^[a-f0-9]{8}-[a-f0-9-]{27}$/i.test(entry.label)?entry.label:'');
  return <article className="detail-history-row" key={entry.id}><span className={'timeline-icon '+(entry.quantityMilli!==null&&entry.quantityMilli<0?'negative':'')}><Icon size={17}/></span><div className="timeline-content">{entry.href&&canOpen(entry.href)?<Link href={entry.href}>{title}</Link>:<strong>{title}</strong>}<small>{dateText(entry.date,i18n.language,{day:'numeric',month:'short',year:'numeric',hour:'numeric',minute:'2-digit'})}{entry.method?' · '+t(entry.method):''}</small>{reference&&!(type==='customer'&&entry.kind==='purchase')&&<small>{reference}</small>}{entry.items?.map((item,index)=><small key={index}>{item.name} × {quantity(item.quantityMilli)} {unitText(item.unit,i18n.language,item.quantityMilli/1000)}</small>)}{entry.status&&<span className={'badge badge-'+(entry.status==='paid'?'paid':entry.status==='cancelled'?'cancelled':'partial')}>{t(entry.status)}</span>}</div><div className="timeline-value">{entry.quantityMilli!==null?<b className={entry.quantityMilli>=0?'positive':'negative'}>{entry.quantityMilli>0?'+':''}{quantity(entry.quantityMilli)} {unitText(entry.unit,i18n.language)}</b>:entry.amountPaise!==null&&<b>{money(entry.amountPaise,i18n.language)}</b>}</div></article>;
 })}</div>;
}
