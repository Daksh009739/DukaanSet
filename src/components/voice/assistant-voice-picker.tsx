'use client';
import {useTranslation} from 'react-i18next';
import {useState} from 'react';
import {Check,Play,Square,Volume2,LoaderCircle} from 'lucide-react';
import {useVoiceOS} from './voice-os-provider';
import {Button,Field,FormError} from '../ui';
import styles from './voiceos-3.module.css';
export function AssistantVoicePicker(){
 const voice=useVoiceOS(),s=useTranslation('speech').t,[query,setQuery]=useState(''),[limit,setLimit]=useState(12);
 const choose=voice.preferences.voiceId,deviceDefault=voice.voices.find(v=>v.provider==='device'&&v.locales.some(l=>l.startsWith(voice.conversationLanguage==='en'?'en-':'hi-')))?.id;
 const rank=(locales:string[])=>locales.some(l=>l.startsWith('hi-'))&&locales.some(l=>l.startsWith('en-'))?0:locales.some(l=>l==='hi-IN'||l==='en-IN')?1:2;
 const filtered=voice.voices.filter(v=>v.name.toLocaleLowerCase().includes(query.toLocaleLowerCase())).sort((a,b)=>rank(a.locales)-rank(b.locales)),selectedVoice=filtered.find(v=>v.id===choose),shown=filtered.slice(0,limit);if(selectedVoice&&!shown.includes(selectedVoice))shown.unshift(selectedVoice);
 return <div className={styles.picker}>
  <p className={styles.settingsHint}>{s('settingsHint')}</p>
  {voice.voices.length>12&&<Field label={s('voiceSearch')} placeholder={s('voiceSearchHint')} value={query} onChange={event=>{setQuery(event.target.value);setLimit(12);}}/>}
  <div className={styles.voiceGrid} role="group" aria-label={s('settings')}>
   {shown.map(item=>{const selected=choose===item.id||choose==='device:default'&&item.id===deviceDefault,bilingual=item.locales.some(l=>l.startsWith('hi-'))&&item.locales.some(l=>l.startsWith('en-'));return <article key={item.id} className={styles.voiceCard} data-selected={selected}>
    <button type="button" className={styles.voiceSelect} aria-label={s('choose')+' · '+item.name} aria-pressed={selected} disabled={voice.preferenceBusy||!voice.audioStatus} onClick={()=>void voice.savePreferences({voiceId:item.id})}><span className={styles.voiceAvatar}><Volume2 size={21}/></span><span><b>{item.name}</b><small>{s(item.provider==='azure'?'azure':'device')} · {s(bilingual?'multilingual':item.locales.some(l=>l.startsWith('hi-'))?'hindi':'english')}{item.gender&&<> · {s(item.gender)}</>}</small></span>{selected&&<Check size={18}/>}</button>
    <Button type="button" variant="ghost" disabled={voice.preferenceBusy||item.provider==='azure'&&!voice.preferences.cloudAudioConsent} onClick={()=>{voice.abort();void voice.previewVoice(item,voice.conversationLanguage);}}><Play size={15}/>{s('preview')}</Button>
   </article>;})}
  </div>
  {filtered.length>limit&&<Button variant="secondary" onClick={()=>setLimit(value=>value+12)}>{s('moreVoices')}</Button>}
  {!voice.voices.length&&<p role="status" className={styles.settingsHint}>{s('voiceUnavailable')}</p>}
  {voice.playback!=='idle'&&<Button type="button" variant="secondary" onClick={voice.pauseConversation}>{voice.playback==='loading'?<LoaderCircle className="spin" size={16}/>:<Square size={16}/>} {s('stopPreview')}</Button>}
  <FormError message={voice.preferenceProblem}/>
  <div className={styles.preferences}>
   <label><input type="checkbox" checked={voice.preferences.audible} disabled={voice.preferenceBusy||!voice.audioStatus} onChange={event=>void voice.savePreferences({audible:event.target.checked})}/><span>{s('audible')}</span></label>
   {Boolean(voice.audioStatus?.ttsConfigured||voice.audioStatus?.sttConfigured)&&<label><input type="checkbox" checked={voice.preferences.cloudAudioConsent} disabled={voice.preferenceBusy} onChange={event=>void voice.savePreferences({cloudAudioConsent:event.target.checked})}/><span>{s('cloudConsent')}<small>{s('cloudConsentHint')}</small></span></label>}
  </div>
  <p className={styles.settingsHint}>{s('autoLanguage')}</p><p className={styles.settingsHint}>{s('aiVoice')}</p>
  {!voice.audioStatus?.sttConfigured&&!voice.audioStatus?.ttsConfigured&&<p className={styles.settingsHint}>{s('cloudNotConfigured')}</p>}
  {voice.audioProblem&&<p role="status" className={styles.settingsHint}>{s(voice.audioProblem)}</p>}
 </div>;
}
