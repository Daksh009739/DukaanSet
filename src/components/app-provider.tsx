'use client';
import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { localizedError,renderSystemMessage,systemMessage,type SystemMessage,type Locale } from '@/lib/locale';
import type { V3State } from '@/lib/v3-contracts';
import { api, RequestError } from '@/lib/client';
import type { BusinessState, Language, Session } from '@/lib/contracts';
import {useLocaleEngine,RestoreLocale} from './locale-provider';

interface Context { session:Session|null; state:V3State|null; businessId:string; selectBusiness:(id:string)=>void; refresh:()=>Promise<void>; resetDemo:()=>Promise<void>; resetEpoch:number; changeLanguage:(language:Language)=>Promise<void>; notify:(message:string)=>void; online:boolean; mutation:<T>(path:string,body:unknown)=>Promise<T>; errorText:(error:unknown)=>string; loading:boolean; error:string; logout:()=>Promise<void>; writing:boolean }
const AppContext=createContext<Context|null>(null);
export function useOptionalApp(){return useContext(AppContext);}
export function useApp() {const context=useContext(AppContext);if(!context) throw new Error('Missing application provider');return context;}

function Provider({children}: {children:ReactNode}) {
  useTranslation();const i18n=useLocaleEngine();const languageQueue=useRef(Promise.resolve()),languageVersion=useRef(0),confirmedLanguage=useRef<Locale>(i18n.language as Locale);
  const router=useRouter();const routerRef=useRef(router);routerRef.current=router;
  const [session,setSession]=useState<Session|null>(null);const [state,setState]=useState<V3State|null>(null);const [businessId,setBusinessId]=useState('');const [loading,setLoading]=useState(true);const [resetEpoch,setResetEpoch]=useState(0);const [error,setError]=useState('');const [toast,setToastValue]=useState<SystemMessage|null>(null);const setToast=(message:string)=>setToastValue(message?systemMessage(message):null);const [online,setOnline]=useState(true);const epoch=useRef(0);const currentBusiness=useRef('');const activeLoad=useRef<AbortController|null>(null);const mounted=useRef(false);const writes=useRef(0);const [writing,setWriting]=useState(false);
  const errorText=useCallback((error:unknown)=>error instanceof RequestError?error.status===401?i18n.t('sessionExpired'):localizedError(error,i18n.language):i18n.t('loadError'),[i18n]);
  useEffect(()=>{
    mounted.current=true;const controller=new AbortController();
    api<Session>('/session',undefined,controller.signal).then(value=>{
      if(controller.signal.aborted)return;
      setSession(value);confirmedLanguage.current=value.user.language;if(value.user.verificationRequired&&!value.user.emailVerified){routerRef.current.replace('/verify-email');return;}if(!value.businesses.length){routerRef.current.replace('/onboarding/setup');return;}if(i18n.language!==value.user.language)void i18n.changeLanguage(value.user.language);
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
      const next=await api<V3State>(`/businesses/${selected}/state`,undefined,controller.signal);
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
  const changeLanguage=async(language:Language)=>{const version=++languageVersion.current;await i18n.changeLanguage(language);setSession(previous=>previous?{...previous,user:{...previous.user,language}}:previous);const request=languageQueue.current.then(()=>api('/account/language',{language}));languageQueue.current=request.then(()=>undefined,()=>undefined);try{await request;confirmedLanguage.current=language;if(version===languageVersion.current)setToast(i18n.t('languageSaved'));}catch(cause){if(version===languageVersion.current){await i18n.changeLanguage(confirmedLanguage.current);setSession(previous=>previous?{...previous,user:{...previous.user,language:confirmedLanguage.current}}:previous);}throw cause;}};
  const mutation=async<T,>(path:string,body:unknown):Promise<T>=>{if(!navigator.onLine)throw new RequestError('OFFLINE',i18n.t('noConnection'),0);writes.current++;setWriting(true);try{const result=await api<T>(`/businesses/${businessId}${path}`,body);if(currentBusiness.current===businessId)await refresh();return result;}finally{writes.current--;if(mounted.current)setWriting(writes.current>0);}};
  const logout=async()=>{
    await api('/auth/logout',{});
    // Keep unresolved writes so the same account can retry the original request after signing in.
    // Draft keys include both account and business; ordinary drafts and voice transcripts are cleared.
    try{
      const writeRecoveryPrefix=session?`ds-v3-write-${session.user.id}-`:'';
      const recoveryPrefix=session?`ds-draft-${session.user.id}-`:'';
      for(let index=sessionStorage.length-1;index>=0;index--){
        const key=sessionStorage.key(index);if(!key)continue;
        let keep=Boolean(writeRecoveryPrefix&&key.startsWith(writeRecoveryPrefix));
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
      try{for(let index=sessionStorage.length-1;index>=0;index--){const key=sessionStorage.key(index);if(key&&(key.startsWith(`ds-draft-${next.user.id}-`)||key.startsWith(`ds-voice-draft-${next.user.id}-`)||key.startsWith(`ds-v3-write-${next.user.id}-`)))sessionStorage.removeItem(key);}}catch{}
      if(!next.businesses.some(b=>b.id===currentBusiness.current)){currentBusiness.current=next.businesses[0]?.id||'';setBusinessId(currentBusiness.current);}
      await refresh();setResetEpoch(value=>value+1);
    }finally{writes.current--;if(mounted.current)setWriting(writes.current>0);}
  };
  return <AppContext.Provider value={{session,state,businessId,selectBusiness,refresh,resetDemo,resetEpoch,changeLanguage,notify:setToast,online,mutation,errorText,loading,error:renderSystemMessage(error,i18n.language),logout,writing}}>{children}<div className="toast-region" aria-live="polite" aria-atomic="true">{toast && <div className="toast">✓ {renderSystemMessage(toast,i18n.language)}</div>}</div></AppContext.Provider>;
}
export function AppProvider({children,initialLanguage}: {children:ReactNode;initialLanguage?:Locale}) {return <><RestoreLocale language={initialLanguage}/><Provider>{children}</Provider></>;}
