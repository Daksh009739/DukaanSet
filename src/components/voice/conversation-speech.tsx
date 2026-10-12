'use client';
import {useTranslation} from 'react-i18next';
import {Volume2,Square,LoaderCircle,X} from 'lucide-react';
import {useVoiceOS} from './voice-os-provider';
import type {SpokenReply} from '@/lib/voice/audio-contracts';
import {Button} from '../ui';
import styles from './voiceos-3.module.css';
export function ConversationControls({onCancel}:{onCancel:()=>void}){const s=useTranslation('speech').t;return <div className={styles.controls}><button type="button" className={styles.cancel} aria-label={s('cancelConversation')} onClick={onCancel}><X size={15}/><span>{s('cancelConversation')}</span></button></div>;}
export function ConversationReply({reply,thinking=false}:{reply:SpokenReply|null;thinking?:boolean}){
 const voice=useVoiceOS(),s=useTranslation('speech').t;if(!reply&&!thinking)return null;
 return <section className={styles.reply} data-reply-kind={reply?.kind} aria-label="VoiceOS">
  <div className={styles.replyHeading}><span className={styles.replyIcon}><Volume2 size={17}/></span><b>VoiceOS</b>{(thinking||voice.playback==='loading')?<LoaderCircle size={15} className="spin"/>:voice.playback==='speaking'?<span className={styles.wave} role="img" aria-label={s('speaking')}>{[0,1,2,3].map(i=><i key={i}/>)}</span>:null}</div>
  <p role="status" aria-live="polite">{thinking?s('thinking'):reply?.text}</p>
  {reply&&!thinking&&<div className={styles.replyActions}>{voice.playback!=='idle'?<Button type="button" variant="ghost" onClick={voice.pauseConversation}><Square size={14}/>{s('stopSpeaking')}</Button>:<Button type="button" variant="ghost" onClick={()=>voice.publishReply(reply,false)}><Volume2 size={14}/>{s('repeat')}</Button>}{voice.audioProblem&&<small role="status">{s(voice.audioProblem)}</small>}</div>}
 </section>;
}
