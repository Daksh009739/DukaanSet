// Explicit QA process preload. Never a runtime provider or a production capability flag.
import {basename} from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
if(process.env.DUKAANSET_ENV!=='local'||!basename(process.env.DATABASE_PATH||'').startsWith('voice34-production-qa-')||process.env.RESEMBLE_API_KEY!=='voice34-fixture-only'||process.env.MY_VOICE_VERIFICATION_URL!=='https://voice34-fixture.invalid/verify')throw Error('Voice34 fixture may only run with its isolated fictional QA database and fixture credentials.');
const nativeFetch=globalThis.fetch,voices=new Map();let fallbackTested=false;
function wave(){const size=16000,bytes=Buffer.alloc(44+size*2);bytes.write('RIFF');bytes.writeUInt32LE(bytes.length-8,4);bytes.write('WAVEfmt ',8);bytes.writeUInt32LE(16,16);bytes.writeUInt16LE(1,20);bytes.writeUInt16LE(1,22);bytes.writeUInt32LE(16000,24);bytes.writeUInt32LE(32000,28);bytes.writeUInt16LE(2,32);bytes.writeUInt16LE(16,34);bytes.write('data',36);bytes.writeUInt32LE(size*2,40);for(let i=0;i<size;i++)bytes.writeInt16LE(Math.round(Math.sin(i/16000*480*Math.PI*2)*2500),44+i*2);return bytes;}
globalThis.fetch=async(input,init)=>{
 const url=typeof input==='string'?input:input instanceof URL?input.href:input.url;
 if(url==='https://voice34-fixture.invalid/verify'){
  const form=init.body,metadata=JSON.parse(String(form.get('metadata'))),audio=Buffer.from(await form.get('audio').arrayBuffer()),duration=(audio.length-44)/32000;
  return Response.json({protocol:'dukaanset-own-voice-v1',retention:'none',verified:true,subject:metadata.subject,challengeId:metadata.challengeId,sampleSha256:createHash('sha256').update(audio).digest('hex'),consent:true,phraseMatched:true,consentStatementMatched:true,consentingSpeaker:true,liveness:true,singleSpeaker:true,noiseAcceptable:true,clippingAcceptable:true,usableSpeechSeconds:duration,referenceId:'simulated-qa-verification',segments:[{start:0,end:duration/3,text:'This is my own voice.'},{start:duration/3,end:duration*2/3,text:'I consent to an assistant voice.'},{start:duration*2/3,end:duration,text:metadata.phrase}]});
 }
 if(url.startsWith('https://app.resemble.ai/api/v2/voices')){
  if(new Headers(init?.headers).get('Authorization')!=='Bearer voice34-fixture-only')throw Error('QA provider credential mismatch');const path=new URL(url).pathname;
  if(path==='/api/v2/voices'&&init?.method==='POST'){const body=JSON.parse(init.body),uuid=randomUUID();voices.set(uuid,{uuid,name:body.name,status:'pending',supported_languages:['en-US','hi-IN'],component_status:{text_to_speech:'pending'},api_support:{sync_tts:true}});return Response.json({success:true,item:voices.get(uuid)});}
  if(path==='/api/v2/voices')return Response.json({success:true,items:[...voices.values()],page_count:1});
  const id=path.split('/')[4],voice=voices.get(id);if(!voice)return Response.json({success:false},{status:404});
  if(init?.method==='DELETE'){voices.delete(id);return Response.json({success:true});}
  if(path.endsWith('/recordings'))return Response.json({success:true,item:{uuid:randomUUID()}});
  if(path.endsWith('/build')){voice.status='finished';voice.component_status.text_to_speech='ready';return Response.json({success:true});}
  return Response.json({success:true,item:voice});
 }
 if(url==='https://f.cluster.resemble.ai/synthesize'){
  const body=JSON.parse(init.body);if(!voices.has(body.voice_uuid))return Response.json({success:false},{status:404});
  if(!fallbackTested&&/alag customer|अलग ग्राहक/.test(body.data)){fallbackTested=true;return Response.json({success:false},{status:503});}
  return Response.json({success:true,output_format:'wav',audio_content:wave().toString('base64')});
 }
 return nativeFetch(input,init);
};
