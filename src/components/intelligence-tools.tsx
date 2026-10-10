'use client';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {PageHeading} from './dashboard';
import {osCopy} from '@/lib/voice/os-copy';
import {IntelligencePanel} from './voice/intelligence-panel';
import type {VoiceIntent} from '@/lib/voice/os';
import {useApp} from './app-provider';
import {Button} from './ui';
import {ContextualVoiceOSHero} from './voice/contextual-voiceos-hero';
import './voice/conversation.css';
export function IntelligenceTools(){const app=useApp(),c=osCopy(useTranslation().i18n.language),[tool,setTool]=useState<VoiceIntent>('insights');return <><PageHeading title={c.intelligenceTitle} subtitle={c.readOnly}/><ContextualVoiceOSHero tool={tool}/><div className="intelligence-tools"><div className="button-row" role="group" aria-label={c.intelligenceTitle}>{(['insights','reorder','simulation','scan'] as const).filter(key=>!['scan','reorder'].includes(key)||app.state?.configuration.permissions.purchases).map(key=><Button key={key} variant={key===tool?'primary':'secondary'} aria-pressed={key===tool} onClick={()=>setTool(key)}>{c[key]}</Button>)}</div><IntelligencePanel key={app.businessId+tool} command={{intent:tool,transcript:'',fields:{},items:[],changed:[],changedItems:[],warnings:[]}}/></div></>;}
