'use client';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Eye,EyeOff} from 'lucide-react';
import {copy} from '@/locales/registry';

export function AuthPassword({label,name,value,onChange,login=false,hint}: {label:string;name:string;value:string;onChange:(value:string)=>void;login?:boolean;hint?:string}){
 const [visible,setVisible]=useState(false),{i18n}=useTranslation(),v=copy('marketing',i18n.language).v8;
 return <label className='field auth-password'><span>{label}</span><span className='auth-password-input'><input name={name} aria-label={label} type={visible?'text':'password'} value={value} onChange={event=>{event.target.setCustomValidity('');onChange(event.target.value);}} required minLength={10} maxLength={128} autoComplete={login?'current-password':'new-password'} aria-describedby={hint?name+'-hint':undefined}/><button type='button' aria-label={visible?v.hidePassword:v.showPassword} aria-pressed={visible} onClick={()=>setVisible(!visible)}>{visible?<EyeOff size={19}/>:<Eye size={19}/>}</button></span>{hint&&<small id={name+'-hint'} role='status'>{hint}</small>}
 {!login&&name==='password'&&<span className='auth-password-meter' data-strength={value.length>=16?'long':value.length>=10?'met':'short'} aria-hidden><i/><i/><i/></span>}</label>;
}
