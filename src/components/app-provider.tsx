'use client';
import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';
import { api, RequestError } from '@/lib/client';
import type { BusinessState, Language, Session } from '@/lib/contracts';

interface Context { session:Session|null; state:BusinessState|null; businessId:string; selectBusiness:(id:string)=>void; refresh:()=>Promise<void>; resetDemo:()=>Promise<void>; resetEpoch:number; changeLanguage:(language:Language)=>Promise<void>; notify:(message:string)=>void; online:boolean; mutation:<T>(path:string,body:unknown)=>Promise<T>; errorText:(error:unknown)=>string; loading:boolean; error:string; logout:()=>Promise<void>; writing:boolean }
const AppContext=createContext<Context|null>(null);
export function useApp() {const context=useContext(AppContext);if(!context) throw new Error('Missing application provider');return context;}

function Provider({children}: {children:ReactNode}) {
  const router=useRouter();const routerRef=useRef(router);routerRef.current=router;
  const [session,setSession]=useState<Session|null>(null);const [state,setState]=useState<BusinessState|null>(null);const [businessId,setBusinessId]=useState('');const [loading,setLoading]=useState(true);const [resetEpoch,setResetEpoch]=useState(0);const [error,setError]=useState('');const [toast,setToast]=useState('');const [online,setOnline]=useState(true);const epoch=useRef(0);const currentBusiness=useRef('');const activeLoad=useRef<AbortController|null>(null);const mounted=useRef(false);const writes=useRef(0);const [writing,setWriting]=useState(false);
  const errorText=useCallback((error:unknown)=>{
    if(error instanceof RequestError) {
      if(error.status===401) return i18n.t('sessionExpired');
      if(i18n.exists(`errors.${error.code}`)) return i18n.t(`errors.${error.code}`);
      const code=error.code.toUpperCase();
      if(code.includes('STOCK')) return i18n.t('insufficientStock');
      if(code.includes('AMOUNT')) return i18n.t('invalidAmount');
      if(code.includes('BALANCE') || code==='OVERPAYMENT') return i18n.t('insufficientBalance');
      if(code==='INVALID_INPUT' || code==='VALIDATION_ERROR' || code==='INVALID_QUANTITY') return i18n.t('invalidInput');
      return error.message;
    } return i18n.t('loadError');
  },[]);
  useEffect(()=>{
    mounted.current=true;const controller=new AbortController();
    api<Session>('/session',undefined,controller.signal).then(value=>{
      if(controller.signal.aborted)return;
      setSession(value);if(i18n.language!==value.user.language)void i18n.changeLanguage(value.user.language);
      let remembered:string|null=null;try{remembered=sessionStorage.getItem(`ds-business-${value.user.id}`);}catch{}
      const selected=value.businesses.some(b=>b.id===remembered)?remembered!:value.businesses[0]?.id||'';
      currentBusiness.current=selected;setBusinessId(selected);
      if(!selected){setLoading(false);setError(i18n.t('emptyBusiness'));}
    }).catch(error=>{
      if(controller.signal.aborted||error.name==='AbortError')return;
      if(error instanceof RequestError&&error.status===401)routerRef.current.replace('/login');
      else{setError(i18n.t('loadError'));setLoading(false);}
    });
    return()=>{mounted.current=false;++epoch.current;controller.abort();activeLoad.current?.abort();};
  },[]);
  const refresh=useCallback(async()=>{
    const selected=currentBusiness.current;if(!selected||!mounted.current)return;
    const requestEpoch=++epoch.current;activeLoad.current?.abort();const controller=new AbortController();activeLoad.current=controller;
    setLoading(true);setError('');
    try{
      const next=await api<BusinessState>(`/businesses/${selected}/state`,undefined,controller.signal);
      if(mounted.current&&!controller.signal.aborted&&requestEpoch===epoch.current&&currentBusiness.current===selected)setState(next);
    }catch(error){
      if(mounted.current&&!controller.signal.aborted&&requestEpoch===epoch.current&&currentBusiness.current===selected){setError(errorText(error));if(error instanceof RequestError&&error.status===401)routerRef.current.replace('/login');}
    }finally{
      if(mounted.current&&!controller.signal.aborted&&requestEpoch===epoch.current&&currentBusiness.current===selected)setLoading(false);
      if(activeLoad.current===controller)activeLoad.current=null;
    }
  },[errorText]);
  useEffect(()=>{if(!businessId||businessId!==currentBusiness.current)return;setState(null);void refresh();},[businessId,refresh]);
  useEffect(()=>{setOnline(navigator.onLine);const on=()=>{setOnline(true);void refresh();};const off=()=>setOnline(false);window.addEventListener('online',on);window.addEventListener('offline',off);return()=>{window.removeEventListener('online',on);window.removeEventListener('offline',off);};},[refresh]);
  useEffect(()=>{if(!toast)return;const timer=setTimeout(()=>setToast(''),5000);return()=>clearTimeout(timer);},[toast]);
  const selectBusiness=(id:string)=>{if(writes.current||id===currentBusiness.current||!session?.businesses.some(b=>b.id===id))return;++epoch.current;activeLoad.current?.abort();currentBusiness.current=id;setState(null);setError('');setLoading(true);setBusinessId(id);try{sessionStorage.setItem(`ds-business-${session.user.id}`,id);}catch{}};
  const changeLanguage=async(language:Language)=>{await api('/account/language',{language});setSession(previous=>previous?{...previous,user:{...previous.user,language}}:previous);await i18n.changeLanguage(language);setToast(i18n.t('languageSaved'));};
  const mutation=async<T,>(path:string,body:unknown):Promise<T>=>{if(!navigator.onLine)throw new RequestError('OFFLINE',i18n.t('noConnection'),0);writes.current++;setWriting(true);try{const result=await api<T>(`/businesses/${businessId}${path}`,body);if(currentBusiness.current===businessId)await refresh();return result;}finally{writes.current--;if(mounted.current)setWriting(writes.current>0);}};
  const logout=async()=>{
    await api('/auth/logout',{});
    // Keep unresolved writes so the same account can retry the original request after signing in.
    // Draft keys include both account and business; ordinary drafts and voice transcripts are cleared.
    try{
      const recoveryPrefix=session?`ds-draft-${session.user.id}-`:'';
      for(let index=sessionStorage.length-1;index>=0;index--){
        const key=sessionStorage.key(index);if(!key)continue;
        let keep=false;
        if(recoveryPrefix&&key.startsWith(recoveryPrefix)){
          const raw=sessionStorage.getItem(key);
          if(raw){if(key.endsWith('-customer'))keep=true;else{try{const value=JSON.parse(raw);keep=Boolean(value?.pendingSale||value?.recoveryBlocked);}catch{keep=true;}}}
        }
        if(!keep)sessionStorage.removeItem(key);
      }
    }catch{}
    routerRef.current.replace('/login');
  };
  const resetDemo=async()=>{
    if(!session?.user.demo||writes.current)throw new RequestError('DEMO_ONLY',i18n.t('invalidInput'),409);
    writes.current++;setWriting(true);
    try{
      const next=await api<Session>('/auth/demo/reset',{});setSession(next);
      try{for(let index=sessionStorage.length-1;index>=0;index--){const key=sessionStorage.key(index);if(key&&(key.startsWith(`ds-draft-${next.user.id}-`)||key.startsWith(`ds-voice-draft-${next.user.id}-`)))sessionStorage.removeItem(key);}}catch{}
      if(!next.businesses.some(b=>b.id===currentBusiness.current)){currentBusiness.current=next.businesses[0]?.id||'';setBusinessId(currentBusiness.current);}
      await refresh();setResetEpoch(value=>value+1);
    }finally{writes.current--;if(mounted.current)setWriting(writes.current>0);}
  };
  return <AppContext.Provider value={{session,state,businessId,selectBusiness,refresh,resetDemo,resetEpoch,changeLanguage,notify:setToast,online,mutation,errorText,loading,error,logout,writing}}>{children}<div className="toast-region" aria-live="polite" aria-atomic="true">{toast && <div className="toast">✓ {toast}</div>}</div></AppContext.Provider>;
}
export function AppProvider({children}: {children:ReactNode}) {return <I18nextProvider i18n={i18n}><Provider>{children}</Provider></I18nextProvider>;}
