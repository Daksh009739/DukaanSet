'use client';
import { createContext,useContext,useEffect,useRef,useState,type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { RequestError } from '@/lib/client';
import { useApp } from '../app-provider';
import { Button,FormError } from '../ui';
type Pending={path:string;body:Record<string,unknown>};
const Context=createContext<{write:<T>(path:string,body:Record<string,unknown>)=>Promise<T>;pending:Pending|null;blocked:boolean;busy:boolean;error:string}|null>(null);
export function useDemandWrite(){const value=useContext(Context);if(!value)throw new Error('Missing demand write context');return value;}
export function DemandWrites({children}:{children:ReactNode}){
  const app=useApp(),v=useTranslation('v3').t;const key=`ds-v3-write-${app.session?.user.id}-${app.businessId}`;
  const [pending,setPending]=useState<Pending|null>(null),[blocked,setBlocked]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[loaded,setLoaded]=useState(false);
  const inFlight=useRef(false);
  useEffect(()=>{try{const raw=sessionStorage.getItem(key);if(raw){const value=JSON.parse(raw);if(!value||typeof value.body!=='object'||!value.body||Array.isArray(value.body)||typeof value.body.idempotencyKey!=='string'||typeof value.path!=='string'||!/^\/(demands|reorders|catalogue-import|customers|suppliers|payments|purchases|expenses|stock)(?:\/[a-f0-9-]{36}\/(status|associate|consent|followup|convert|receive|cancel))?$/.test(value.path))setBlocked(true);else setPending(value);}}catch{setBlocked(true);}setLoaded(true);},[key]);
  async function send<T>(path:string,body:Record<string,unknown>):Promise<T>{if(!loaded||blocked||inFlight.current)throw new RequestError('INVALID_INPUT',v('frozen'),409);if(pending&&(pending.path!==path||JSON.stringify(pending.body)!==JSON.stringify(body)))throw new RequestError('CONFLICT',v('frozen'),409);const next=pending||{path,body:{...body,idempotencyKey:body.idempotencyKey||crypto.randomUUID()}};
    try{sessionStorage.setItem(key,JSON.stringify(next));}catch{throw new RequestError('INVALID_INPUT',v('saveError'),400);}inFlight.current=true;setPending(next);setBusy(true);setError('');
    try{const result=await app.mutation<T>(next.path,next.body);try{sessionStorage.removeItem(key);}catch{}setPending(null);return result;}catch(cause){if(cause instanceof RequestError&&((cause.status===400||cause.status===422)||(cause.status===409&&!['IDEMPOTENCY_CONFLICT','CONFLICT'].includes(cause.code)))){try{sessionStorage.removeItem(key);}catch{}setPending(null);}setError(app.errorText(cause));throw cause;}finally{inFlight.current=false;setBusy(false);}
  }
  return <Context.Provider value={{write:send,pending,blocked,busy,error}}>{children}</Context.Provider>;
}
export function WriteRecoveryNotice(){const {pending,blocked,busy,error,write}=useDemandWrite(),app=useApp(),v=useTranslation('v3').t;return pending||blocked?<section className="v3-recovery card" role="status"><p>{v('frozen')}</p><FormError message={error}/>{pending&&!blocked&&<Button busy={busy} disabled={!app.online} onClick={()=>void write(pending.path,pending.body).catch(()=>{})}>{v('retry')}</Button>}</section>:null;}
