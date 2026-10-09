'use client';
import {createContext,useContext,useEffect,useLayoutEffect,useState,type ReactNode} from 'react';
import type {i18n} from 'i18next';
import {I18nextProvider,useTranslation} from 'react-i18next';
import {createI18n,updateDocumentLanguage} from '@/lib/i18n';
import {locale,type Locale} from '@/lib/locale';
const EngineContext=createContext<i18n|null>(null);
/** react-i18next 17 creates a snapshot wrapper per language. Data-loading callbacks need the stable underlying instance. */
export function useLocaleEngine(){const engine=useContext(EngineContext);if(!engine)throw new Error('Missing locale provider');return engine;}
/** Restore server preference before paint when a persistent root crosses into auth/private routes. */
export function RestoreLocale({language}:{language?:Locale}){const engine=useLocaleEngine();useLayoutEffect(()=>{if(language&&engine.language!==language)void engine.changeLanguage(language);},[engine,language]);return null;}
export function LocaleProvider({children,initialLanguage='en'}:{children:ReactNode;initialLanguage?:Locale}){const [engine]=useState(()=>createI18n(initialLanguage));return <EngineContext.Provider value={engine}><I18nextProvider i18n={engine}><DocumentLocale/>{children}</I18nextProvider></EngineContext.Provider>;}
function DocumentLocale(){const {i18n}=useTranslation();useEffect(()=>{updateDocumentLanguage(i18n.language);const update=(language:string)=>updateDocumentLanguage(language);i18n.on('languageChanged',update);return()=>{i18n.off('languageChanged',update);};},[i18n]);return null;}
export function LanguageOptions(){return <><option value='en'>English</option><option value='hi'>हिंदी</option><option value='hinglish'>Hinglish</option></>;}
export function LanguageSelector(){const {t,i18n}=useTranslation();return <select aria-label={t('language')} value={locale(i18n.language)} onChange={event=>void i18n.changeLanguage(locale(event.target.value))}><LanguageOptions/></select>;}
