import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {Store} from '../src/lib/server/store';
import {SaaSService} from '../src/lib/server/saas';
import {advanceVoice,buildVoiceRequest,nextVoiceQuestion} from '../src/lib/voice/conversation';
import {replyForTask} from '../src/lib/voice/replies';
import {handsFreeReducer,initialHandsFree,mayAutoListen} from '../src/lib/voice/hands-free';
import {customerDuplicateQuestion,separateCustomer} from '../src/lib/voice/customer-decision';
import {DomainError} from '../src/lib/server/validation';
import {SpokenConfirmationGate} from '../src/lib/voice/confirmation';
import {VoiceAudioService} from '../src/lib/server/voice-audio';
import {encodeVoiceWav} from '../src/lib/voice/wav';
import {recoverVoiceAction} from '../src/lib/voice/action-status';

function fixture(){const store=new Store(':memory:'),session=store.register({name:'Voice33 QA',email:randomUUID()+'@example.test',password:'Fixture-only-2026',businessName:'QA',category:'grocery'}),user=session.user.id,business=session.businesses[0].id,existing=store.createContact(user,business,'customers',{name:'Rahul',phone:'9000000001'}),state=new SaaSService(store).state(user,business);return{store,user,business,existing,state};}
test('duplicate replies preserve Rahul, require separate confirmation and create exactly one distinct backend record',()=>{
 const f=fixture();try{for(const phrase of ['Naya bana do.','Haan, naya bana do.','Same naam se alag bana do.','Koi nahi, same naam se naya bana do.','Koi nahi, phir se add kar do.','Nahi, dusra Rahul hai.','Create a separate customer','अलग ग्राहक बनाओ']){
  const duplicate=advanceVoice('Rahul naam ka customer add kar do.',f.state,advanceVoice('Aaj ki sale batao',f.state));assert.equal(duplicate.intent,'customer');assert.equal(duplicate.fields.name,'Rahul');assert.equal(nextVoiceQuestion(duplicate,f.state),'duplicateContact');assert.equal(buildVoiceRequest(duplicate,f.state,randomUUID()),null);assert.equal(replyForTask({command:duplicate,state:f.state,language:'hinglish',turn:1,question:'duplicateContact',ready:false})?.continueTurn,true);
  const separate=advanceVoice(phrase,f.state,duplicate);assert.equal(separate.intent,'customer',phrase);assert.equal(separate.fields.name,'Rahul',phrase);assert.equal(separateCustomer(separate),true,phrase);assert.equal(customerDuplicateQuestion(separate,f.state.customers),false,phrase);assert.equal(nextVoiceQuestion(separate,f.state),'',phrase);
  const reply=replyForTask({command:separate,state:f.state,language:'hinglish',turn:2,question:'',ready:true})!;assert.match(reply.text,/alag customer ready/);assert.equal(reply.continueTurn,true);
  const key=randomUUID(),request=buildVoiceRequest(separate,f.state,key)!;assert.equal(request.body.allowSameName,true);const gate=new SpokenConfirmationGate();gate.arm(f.business,key,true);assert.equal(gate.consume(f.business,key),true);assert.equal(gate.consume(f.business,key),false);const created=f.store.createContact(f.user,f.business,'customers',request.body);assert.notEqual(created.id,f.existing.id);assert.equal(f.store.createContact(f.user,f.business,'customers',request.body).id,created.id);
 }const after=f.store.state(f.user,f.business);assert.equal(after.customers.length,9);assert.deepEqual(after.customers.find(c=>c.id===f.existing.id),f.state.customers[0]);assert.equal(after.payments.length,0);assert.equal(after.invoices.length,0);}finally{f.store.close();}
});
test('separate-name decision never authorises a shared phone, different name or ambiguous yes',()=>{
 const f=fixture();try{const duplicate=advanceVoice('Create a customer named Rahul',f.state),separate=advanceVoice('Naya bana do',f.state,duplicate);
  assert.equal(nextVoiceQuestion(advanceVoice('yes',f.state,duplicate),f.state),'duplicateContact');
  assert.equal(advanceVoice('Create a new customer named Priya',f.state,duplicate).fields.name,'Priya');
  const phone={...separate,fields:{...separate.fields,phone:'9000000001'}};assert.equal(nextVoiceQuestion(phone,f.state),'phone');assert.equal(buildVoiceRequest(phone,f.state,randomUUID()),null);
  assert.equal(separateCustomer(advanceVoice('Same naam se alag bana do.',f.state,separate)),true);
  assert.throws(()=>f.store.createContact(f.user,f.business,'customers',{name:'Rahul',phone:'9000000001',rejectDuplicate:true,allowSameName:true,idempotencyKey:randomUUID()}),e=>e instanceof DomainError&&e.code==='CONTACT_EXISTS');
  assert.throws(()=>f.store.createContact(f.user,f.business,'customers',{name:'Rahul',allowSameName:true}),e=>e instanceof DomainError&&e.code==='INVALID_INPUT');
  const corrected=advanceVoice('Rahul nahi Rohan.',f.state,separate);assert.equal(corrected.fields.name,'Rohan');assert.equal(separateCustomer(corrected),false);assert.equal(corrected.fields.duplicateDecision,undefined);
  const existing=advanceVoice('Usi ko kholo',f.state,duplicate);assert.equal(existing.intent,'open');assert.equal(existing.fields.customerId,f.existing.id);
 }finally{f.store.close();}
});
test('session latch ignores old callbacks, cannot restart after pause or close and resumes only explicitly',()=>{
 let state=handsFreeReducer(initialHandsFree,{type:'open',sessionId:'first'});assert.equal(mayAutoListen(state),true);state=handsFreeReducer(state,{type:'playback',sessionId:'first',phase:'speaking',greeting:true});assert.equal(state.phase,'greeting');state=handsFreeReducer(state,{type:'pause'});for(const phase of ['idle','loading','speaking']as const)state=handsFreeReducer(state,{type:'playback',sessionId:'first',phase});state=handsFreeReducer(state,{type:'capture',sessionId:'first',phase:'completed'});assert.equal(state.phase,'paused');assert.equal(mayAutoListen(state),false);state=handsFreeReducer(state,{type:'resume'});assert.equal(mayAutoListen(state),true);state=handsFreeReducer(state,{type:'workflow',sessionId:'first',phase:'executing'});assert.equal(mayAutoListen(state),false);state=handsFreeReducer(state,{type:'close'});assert.equal(mayAutoListen(handsFreeReducer(state,{type:'resume'})),false);state=handsFreeReducer(state,{type:'open',sessionId:'second'});assert.equal(handsFreeReducer(state,{type:'capture',sessionId:'first',phase:'listening'}),state);
});
test('verified success and read results allow the next task, while unverified failures never restart',()=>{
 const f=fixture();try{const reply=replyForTask({command:null,state:f.state,language:'en',turn:4,question:'',ready:false,saved:{detail:{label:'Rahul',path:'/app/customers/'+f.existing.id}}})!;assert.equal(reply.kind,'success');assert.equal(reply.continueTurn,true);assert.equal(replyForTask({command:null,state:f.state,language:'en',turn:4,question:'',ready:false,error:'NETWORK',pending:true})?.continueTurn,false);}finally{f.store.close();}
});
test('cloud transcription sends documented bilingual hints without forcing the display language or exposing shop records',async()=>{
 const f=fixture(),keys=['VOICE_STT_PROVIDER','VOICE_STT_MODEL','OPENAI_API_KEY']as const,previous=Object.fromEntries(keys.map(k=>[k,process.env[k]]));Object.assign(process.env,{VOICE_STT_PROVIDER:'openai',VOICE_STT_MODEL:'gpt-transcribe',OPENAI_API_KEY:'fixture-only-not-a-real-key'});try{
  const service=new VoiceAudioService(f.store,(async(url,init)=>{assert.equal(String(url),'https://api.openai.com/v1/audio/transcriptions');const body=init?.body as FormData;assert.equal(body.get('model'),'gpt-transcribe');assert.deepEqual(body.getAll('languages[]'),['en','hi']);assert.equal(body.has('language'),false);assert.equal(body.has('prompt'),false);assert.equal(body.has('customer'),false);return Response.json({text:'Rahul naam ka customer add kar do.',languages:[{code:'hi'},{code:'en'}]});})as typeof fetch);await service.savePreferences(f.user,{voiceId:'device:default',cloudAudioConsent:true,audible:true,revision:0});assert.deepEqual((await service.transcribe(f.user,f.business,encodeVoiceWav(new Float32Array(16000)),'audio/wav')).languages,['hi','en']);assert.equal(f.store.state(f.user,f.business).customers.length,1);
 }finally{f.store.close();for(const key of keys)if(previous[key]===undefined)delete process.env[key];else process.env[key]=previous[key];}
});
test('authoritative receipts recover an exact committed customer without new writes and reject another tenant or payload',()=>{
 const f=fixture();try{const body={name:'Receipt QA',phone:'',rejectDuplicate:true,idempotencyKey:randomUUID()},request={path:'/customers',body};assert.deepEqual(f.store.voiceActionStatus(f.user,f.business,request),{status:'not_found'});const created=f.store.createContact(f.user,f.business,'customers',body);assert.deepEqual(f.store.voiceActionStatus(f.user,f.business,request),{status:'committed',result:created});assert.equal(f.store.state(f.user,f.business).customers.length,2);assert.throws(()=>f.store.voiceActionStatus(f.user,f.business,{path:'/customers',body:{...body,name:'Changed'}}),e=>e instanceof DomainError&&e.code==='IDEMPOTENCY_CONFLICT');const other=f.store.register({name:'Other',email:randomUUID()+'@example.test',password:'Fixture-only-2026',businessName:'Other',category:'grocery'});assert.throws(()=>f.store.voiceActionStatus(other.user.id,f.business,request),e=>e instanceof DomainError&&e.code==='NOT_FOUND');assert.throws(()=>f.store.voiceActionStatus(f.user,f.business,{path:'/arbitrary-sql',body}),e=>e instanceof DomainError&&e.code==='INVALID_INPUT');}finally{f.store.close();}
});
test('a status outage or account switch never falls through into another mutation',async()=>{
 const original=globalThis.fetch;let writes=0;try{globalThis.fetch=async()=>{throw Error('network');};await assert.rejects(()=>recoverVoiceAction('shop','/customers',{idempotencyKey:'frozen'},async()=>{writes++;return{};},()=>true,async()=>{}));globalThis.fetch=async()=>Response.json({status:'not_found'});await assert.rejects(()=>recoverVoiceAction('shop','/customers',{idempotencyKey:'frozen'},async()=>{writes++;return{};},()=>false,async()=>{}));assert.equal(writes,0);}finally{globalThis.fetch=original;}
});
