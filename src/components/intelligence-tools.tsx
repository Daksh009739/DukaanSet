'use client';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {StudioHeading,insightStyles as studio} from './insight-ui';
import {BrainCircuit,ChartNoAxesCombined,Boxes,SlidersHorizontal,ScanLine} from 'lucide-react';
import {osCopy} from '@/lib/voice/os-copy';
import {IntelligencePanel} from './voice/intelligence-panel';
import type {VoiceIntent} from '@/lib/voice/os';
import {useApp} from './app-provider';
import {Button} from './ui';
import {ContextualVoiceOSHero} from './voice/contextual-voiceos-hero';
import './voice/conversation.css';
export function IntelligenceTools(){const app=useApp(),{i18n}=useTranslation(),w=useTranslation('workspace').t,c=osCopy(i18n.language),[tool,setTool]=useState<VoiceIntent>('insights');return <><ContextualVoiceOSHero tool={tool} variant="minimal"/><StudioHeading title={c.intelligenceTitle} subtitle={tool==='insights'?c.readOnly:tool==='reorder'?c.reorderHint:tool==='scan'?c.extractionReview:c.simulationHint} icon={<BrainCircuit/>} eyebrow={w('studio.smartDecisions')}/><div className="intelligence-tools"><div className={studio.toolGrid} role="group" aria-label={c.intelligenceTitle}>{(['insights','reorder','simulation','scan'] as const).filter(key=>!['scan','reorder'].includes(key)||app.state?.configuration.permissions.purchases).map(key=><Button key={key} variant={key===tool?'primary':'secondary'} aria-pressed={key===tool} onClick={()=>setTool(key)}>{key==='insights'?<ChartNoAxesCombined/>:key==='reorder'?<Boxes/>:key==='simulation'?<SlidersHorizontal/>:<ScanLine/>}<span>{c[key]}</span></Button>)}</div><IntelligencePanel key={app.businessId+tool} command={{intent:tool,transcript:'',fields:{},items:[],changed:[],changedItems:[],warnings:[]}}/></div></>;}
