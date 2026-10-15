'use client';
import {useTranslation} from 'react-i18next';
import {Volume2,Square} from 'lucide-react';
import {useVoiceOS} from './voice-os-provider';
import {makeReply} from '@/lib/voice/replies';
import {Button} from '../ui';
/** Read-only callers share the selected voice, playback cancellation and conversation language. */
export function AnswerAudio({text}:{text:string}){const voice=useVoiceOS(),s=useTranslation('speech').t;return <Button type="button" variant="ghost" onClick={()=>voice.playback==='idle'?voice.publishReply(makeReply('resultIntro',voice.conversationLanguage,'result',{result:text.slice(0,600)},Date.now(),false),false):voice.pauseConversation()}>{voice.playback==='idle'?<Volume2 size={15}/>:<Square size={15}/>} {s(voice.playback==='idle'?'repeat':'stopSpeaking')}</Button>;}
