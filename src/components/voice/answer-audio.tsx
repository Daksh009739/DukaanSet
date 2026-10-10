'use client';
import {useEffect,useState} from 'react';
import {useTranslation} from 'react-i18next';
import {osCopy} from '@/lib/voice/os-copy';
import {useVoiceOS} from './voice-os-provider';
import {Button} from '../ui';
export function AnswerAudio({text}:{text:string}){
 const voice=useVoiceOS(),language=useTranslation().i18n.language,c=osCopy(language),[enabled,setEnabled]=useState(false),[speaking,setSpeaking]=useState(false),[available,setAvailable]=useState(false);
 useEffect(()=>{if(!('speechSynthesis' in window))return;const synth=window.speechSynthesis,update=()=>setAvailable(synth.getVoices().some(v=>v.lang.startsWith(language==='en'?'en':'hi')));update();synth.addEventListener('voiceschanged',update);return()=>{synth.removeEventListener('voiceschanged',update);synth.cancel();};},[language]);
 useEffect(()=>{if('speechSynthesis' in window)window.speechSynthesis.cancel();setSpeaking(false);},[text,voice.capture.phase,enabled]);
 function speak(){if(!enabled||voice.capture.phase!=='ready'||!available)return;const synth=window.speechSynthesis;if(speaking){synth.cancel();setSpeaking(false);return;}const selected=synth.getVoices().find(v=>v.lang.startsWith(language==='en'?'en':'hi'));if(!selected)return;const utterance=new SpeechSynthesisUtterance(text);utterance.voice=selected;utterance.lang=selected.lang;utterance.onend=()=>setSpeaking(false);utterance.onerror=()=>setSpeaking(false);synth.cancel();setSpeaking(true);synth.speak(utterance);}
 return <details className="conversation-settings"><summary>{c.spokenReplies}</summary><label className="intelligence-ack"><input type="checkbox" checked={enabled} onChange={e=>setEnabled(e.target.checked)}/><span>{c.spokenReplies}</span></label>{enabled&&(available?<Button type="button" variant="secondary" disabled={voice.capture.phase!=='ready'} onClick={speak}>{speaking?c.stopReply:c.speakAnswer}</Button>:<p>{c.noVoice}</p>)}</details>;
}
