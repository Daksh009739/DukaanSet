'use client';
import {useEffect,useId,useState} from 'react';
import {usePathname} from 'next/navigation';
import {useTranslation} from 'react-i18next';
import {Mic,ChevronDown,ChevronUp,Sparkles} from 'lucide-react';
import {useApp} from '../app-provider';
import {useVoiceOS} from './voice-os-provider';
import {voiceHeroForPage,type VoiceHeroVariant} from '@/lib/voice/discovery';
import type {VoiceIntent} from '@/lib/voice/os';
import {unitText} from '@/lib/locale';
import styles from './contextual-voiceos-hero.module.css';

export function ContextualVoiceOSHero({variant,tool}:{variant?:VoiceHeroVariant;tool?:VoiceIntent}){
 const app=useApp(),voice=useVoiceOS(),path=usePathname(),{t,i18n}=useTranslation('voiceos'),id=useId();
 const key='ds-voice-hero-'+app.session?.user.id,[preference,setPreference]=useState<{key:string;collapsed:boolean}|null>(null);
 useEffect(()=>{let collapsed=false;try{collapsed=localStorage.getItem(key)==='collapsed';}catch{}setPreference({key,collapsed});},[key]);
 const config=app.state?voiceHeroForPage(path,app.state,tool):null;
 if(!config||!app.session)return null;
 const collapsed=preference?.key===key&&preference.collapsed,mode=variant||config.variant;
 const parameters={...config.parameters,...config.parameters?.unit?{unit:unitText(config.parameters.unit,i18n.language)}:{}};
 function toggle(){const next=!collapsed;setPreference({key,collapsed:next});try{localStorage.setItem(key,next?'collapsed':'expanded');}catch{}}
 const launch=(text='')=>voice.discover(config!.context,text);
 return <section className={[styles.hero,styles[mode],collapsed?styles.collapsed:''].join(' ')} aria-label={t('heroLabel')} data-testid="contextual-voice-hero" data-context={config.context.intent}>
  <span className={styles.emblem} aria-hidden><Mic size={22}/></span>
  <div className={styles.content}><span className={styles.eyebrow}><Sparkles size={12} aria-hidden/>VoiceOS <span>{t('heroBenefit')}</span></span><h2>{collapsed?t('heroReminder'):t(config.heading,parameters)}</h2>
   {!collapsed&&<div id={id} className={styles.body}><p>{t(config.description||'heroDescription')}</p><div className={styles.examples}>{config.examples.slice(0,mode==='minimal'?1:2).map(e=><button type="button" key={e.key} onClick={()=>launch(t(e.key,parameters))}>{t(e.key,parameters)}</button>)}</div></div>}
  </div>
  <button className={styles.speak} type="button" onClick={()=>launch()} aria-label={t('heroLaunch')}><Mic size={18} aria-hidden/><span>{t('heroSpeak')}</span></button>
  <button className={styles.toggle} type="button" onClick={toggle} aria-label={t(collapsed?'heroExpand':'heroCollapse')} title={t(collapsed?'heroExpand':'heroCollapse')} aria-expanded={!collapsed} aria-controls={collapsed?undefined:id}>{collapsed?<ChevronDown size={18}/>:<ChevronUp size={18}/>}</button>
 </section>;
}
