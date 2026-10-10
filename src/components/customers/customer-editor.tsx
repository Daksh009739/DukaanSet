'use client';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import type {Customer} from '@/lib/contracts';
import {useApp} from '../app-provider';
import {Button,Field,FormError,Sheet} from '../ui';

/** Same optimistic snapshot and authenticated domain route as the Customer360 manual editor. */
export function CustomerEditor({customer,initialPhone,onClose}:{customer:Customer;initialPhone?:string;onClose:()=>void}){
 const app=useApp(),d=useTranslation('documents').t,[name,setName]=useState(customer.name),[phone,setPhone]=useState(initialPhone??customer.phone),[busy,setBusy]=useState(false),[error,setError]=useState('');
 return <Sheet open title={d('editCustomer')} onOpenChange={value=>{if(!value&&!busy)onClose();}}><form className="sheet-body form-stack" onSubmit={async event=>{event.preventDefault();if(busy)return;setBusy(true);setError('');try{await app.mutation('/customers/'+customer.id+'/edit',{name,phone,previousName:customer.name,previousPhone:customer.phone});app.notify(d('saved'));onClose();}catch(cause){setError(app.errorText(cause));}finally{setBusy(false);}}}><Field label={d('contactName')} value={name} disabled={busy} required maxLength={100} onChange={event=>setName(event.target.value)}/><Field label={d('contactPhone')} value={phone} disabled={busy} maxLength={30} type="tel" onChange={event=>setPhone(event.target.value)}/><FormError message={error}/><Button busy={busy} disabled={!app.online} type="submit">{d('saveCustomer')}</Button></form></Sheet>;
}
