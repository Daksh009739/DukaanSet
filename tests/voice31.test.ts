import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {Store} from '../src/lib/server/store';
import {SaaSService} from '../src/lib/server/saas';
import {advanceVoice,buildVoiceRequest,nextVoiceQuestion,salePreview} from '../src/lib/voice/conversation';
import {advancePageVoice} from '../src/lib/voice/discovery';
import {resolveConversationLanguage} from '../src/lib/voice/conversation-language';
import {SpeechTurn,SilenceEndpoint,speechEndpointPolicy} from '../src/lib/voice/speech-turn';
import {browserSpeechAdapter,type RecognitionLike} from '../src/lib/voice/speech';
import {replyForTask} from '../src/lib/voice/replies';
import {readConversationSession} from '../src/lib/voice/session';
import type {Language} from '../src/lib/contracts';

test('final receipt is delivered once; duplicate end, result, error and cancellation cannot replay it',()=>{
 const receipts:string[]=[];const turn=new SpeechTurn('session-a','turn-a',r=>receipts.push(r.text));
 turn.started();turn.transcript('Rahul','');assert.deepEqual(receipts,[]);turn.transcript('Rahul naam ka customer add karo','Rahul naam ka customer add karo');turn.finalizing();turn.finish();turn.finish();turn.transcript('old sale','old sale');turn.finish('network');turn.cancel();assert.deepEqual(receipts,['Rahul naam ka customer add karo']);assert.equal(turn.phase,'completed');
 for(const failure of ['cancel','interim','permission']as const){const t=new SpeechTurn('s',failure,()=>assert.fail('must not dispatch'));t.started();t.transcript('partial','');if(failure==='cancel')t.cancel();else t.finish(failure==='permission'?'permission':null);t.finish();assert.ok(!t.active);}
});
test('app defaults, clear speech overrides and short replies obey a single language precedence policy',()=>{
 for(const app of ['en','hi','hinglish']as Language[]){assert.deepEqual(resolveConversationLanguage('',app),{language:app,source:'app'});assert.deepEqual(resolveConversationLanguage('Rahul',app),{language:app,source:'app'});assert.equal(resolveConversationLanguage('500 UPI',app).language,app);}
 const hinglish=resolveConversationLanguage('Rahul ke naam se ek customer add kar do.','en');assert.deepEqual(hinglish,{language:'hinglish',source:'speech'});assert.deepEqual(resolveConversationLanguage('Haan save kar do','hi',hinglish),hinglish);assert.equal(resolveConversationLanguage('राहुल का ग्राहक बनाओ','en',hinglish).language,'hi');assert.equal(resolveConversationLanguage('Please create a customer named Rahul','hi',hinglish).language,'en');
 assert.deepEqual(resolveConversationLanguage('800','hi',{language:'en',source:'app'}),{language:'hi',source:'app'});
 assert.deepEqual(resolveConversationLanguage('Duniya mein kitne customers hain?','en'),{language:'hinglish',source:'speech'});
});
test('adaptive silence waits through natural pauses, quiet speech, background noise and long statements',()=>{
 const policy={...speechEndpointPolicy,silenceMs:1800},vad=new SilenceEndpoint(0,policy);
 for(let at=0;at<400;at+=100)assert.equal(vad.sample(.003,at),'continue');
 for(let at=400;at<1000;at+=100)assert.equal(vad.sample(.012,at),'continue');
 for(let at=1000;at<2500;at+=100)assert.equal(vad.sample(.003,at),'continue');
 for(let at=2500;at<5000;at+=100)assert.equal(vad.sample(.014,at),'continue');
 assert.equal(vad.sample(.003,6600),'continue');assert.equal(vad.sample(.003,6800),'end');
 const quiet=new SilenceEndpoint(0,policy);for(let at=0;at<15000;at+=100)assert.equal(quiet.sample(.003,at),'continue');assert.equal(quiet.sample(.003,15000),'silence');
});
test('native recognition automatically stops and finalizes without a manual stop or provider end event',t=>{
 t.mock.timers.enable({apis:['setTimeout']});let recognition!:RecognitionLike;let stops=0,deliveries=0;
 class Recognition{lang='';continuous=true;interimResults=true;maxAlternatives=1;onstart=null;onend=null;onresult=null;onerror=null;constructor(){recognition=this;}start(){recognition.onstart?.();}stop(){stops++;}abort(){}}
 const previous=globalThis.window;Object.assign(globalThis,{window:{SpeechRecognition:Recognition}});
 try{const turn=new SpeechTurn('s','t',()=>deliveries++),session=browserSpeechAdapter.create('hi-IN',{started:()=>turn.started(),transcript:(text,final)=>turn.transcript(text,final),ended:()=>turn.finish(),failed:problem=>turn.finish(problem),finalizing:()=>turn.finalizing()});session.start();const result=(text:string,isFinal:boolean)=>recognition.onresult?.({resultIndex:0,results:{length:1,0:{isFinal,0:{transcript:text}}}});
  result('Rahul naam',false);t.mock.timers.tick(1200);assert.equal(stops,0);result('Rahul naam ka customer add karo',true);for(let i=0;i<3;i++){t.mock.timers.tick(400);result('Rahul naam ka customer add karo',true);}t.mock.timers.tick(600);assert.equal(stops,1);assert.equal(turn.phase,'finalizing');t.mock.timers.tick(3000);assert.equal(deliveries,1);recognition.onend?.();assert.equal(deliveries,1);session.abort();t.mock.timers.tick(60000);assert.equal(stops,1);
 }finally{Object.assign(globalThis,{window:previous});}
});
test('exact Rahul customer phrases after sales reports create and replay one real contact, never stock or payments',()=>{
 for(const phrase of ['Rahul ke naam se ek customer add kar do.','Rahul naam ka customer add kar do.','Rahul naam ka customer add karo.','Please create a customer named Rahul','राहुल नाम का ग्राहक जोड़ो']){
  const store=new Store(':memory:');try{const session=store.register({name:'QA',email:randomUUID()+'@example.test',password:'Fixture-only-2026',businessName:'Voice31 QA',category:'grocery'}),user=session.user.id,business=session.businesses[0].id,state=new SaaSService(store).state(user,business),previous=advanceVoice('Aaj ki sale batao',state),command=advancePageVoice(phrase,state,previous,{path:'/app',intent:'report'});assert.equal(command.intent,'customer');assert.ok(/^(?:Rahul|राहुल)$/.test(command.fields.name));assert.equal(nextVoiceQuestion(command,state),'');assert.equal(command.items.length,0);const request=buildVoiceRequest(command,state,randomUUID())!;assert.equal(request.path,'/customers');assert.equal(store.state(user,business).customers.length,0);const saved=store.createContact(user,business,'customers',request.body);assert.equal(store.createContact(user,business,'customers',request.body).id,saved.id);const after=new SaaSService(store).state(user,business);assert.equal(after.customers.length,1);assert.equal(after.customers[0].id,saved.id);assert.equal(after.products.length,0);assert.equal(after.payments.length,0);const reply=replyForTask({command:null,state:after,language:'en',turn:2,question:'',ready:false,saved:{detail:{label:saved.name,path:'/app/customers/'+saved.id}}})!;assert.ok(reply.text.includes(saved.name));assert.equal(reply.kind,'success');const duplicate=advanceVoice(phrase,after);assert.equal(replyForTask({command:duplicate,state:after,language:'en',turn:3,question:'',ready:false})?.text,duplicate.fields.name+' already exists. Open that customer, or create a separate customer with the same name?');
  }finally{store.close();}
 }
});
test('changing native transcripts keep long speech alive while stalled speechstart cannot hold the mic forever',t=>{
 t.mock.timers.enable({apis:['setTimeout']});let recognition!:RecognitionLike;let stops=0;
 class Recognition{lang='';continuous=true;interimResults=true;maxAlternatives=1;onstart=null;onend=null;onresult=null;onerror=null;constructor(){recognition=this;}start(){recognition.onstart?.();}stop(){stops++;recognition.onend?.();}abort(){}}
 const previous=globalThis.window;Object.assign(globalThis,{window:{SpeechRecognition:Recognition}});
 try{const session=browserSpeechAdapter.create('hi-IN',{started:()=>{},transcript:()=>{},ended:()=>{},failed:()=>assert.fail('unexpected error')});session.start();recognition.onspeechstart?.();
 for(let i=0;i<20;i++){recognition.onresult?.({resultIndex:0,results:{length:1,0:{isFinal:false,0:{transcript:'Rahul ke naam '+i}}}});t.mock.timers.tick(1000);assert.equal(stops,0);}
 recognition.onresult?.({resultIndex:0,results:{length:1,0:{isFinal:true,0:{transcript:'Rahul ke naam se customer add kar do'}}}});recognition.onspeechend?.();t.mock.timers.tick(1800);assert.equal(stops,1);session.abort();
 let delivered=false,failure='';const bounded=new SpeechTurn('bounded','bounded',()=>delivered=true),long=browserSpeechAdapter.create('hi-IN',{started:()=>bounded.started(),transcript:(value,final)=>bounded.transcript(value,final),ended:()=>bounded.finish(),failed:problem=>{failure=problem;bounded.finish(problem);}});long.start();recognition.onspeechstart?.();
 for(let i=0;i<60;i++){recognition.onresult?.({resultIndex:0,results:{length:1,0:{isFinal:false,0:{transcript:'Long unfinished statement '+i}}}});t.mock.timers.tick(1000);}
 assert.equal(failure,'speechError');assert.equal(delivered,false);assert.equal(bounded.phase,'error');long.abort();}finally{Object.assign(globalThis,{window:previous});}
});
test('a worldwide customer question is a scoped clarification even inside a previous write/report draft',()=>{
 const store=new Store(':memory:');try{const s=store.register({name:'QA',email:randomUUID()+'@example.test',password:'Fixture-only-2026',businessName:'QA',category:'grocery'}),state=new SaaSService(store).state(s.user.id,s.businesses[0].id);for(const prior of ['Aaj ki sale batao','Create a customer named Priya']){const command=advancePageVoice('Duniya mein kitne customers hain?',state,advanceVoice(prior,state),{path:'/app/customers',intent:'customer'});assert.equal(command.intent,'unknown');assert.equal(command.fields.operation,'shopScope');assert.equal(buildVoiceRequest(command,state,randomUUID()),null);assert.match(replyForTask({command,state,language:'en',turn:2,question:nextVoiceQuestion(command,state),ready:false})!.text,/cannot verify a worldwide/);}}finally{store.close();}
});
test('recovered fallback language and bounded timestamps remain untrusted, while confirmed requests survive recovery',()=>{
 const command={intent:'customer',transcript:'Rahul',fields:{name:'Rahul'},items:[],changed:[],changedItems:[],warnings:[]},value={command,key:'qa',pending:{path:'/customers',body:{name:'Rahul',idempotencyKey:'qa'}},updatedAt:Date.now(),language:'en',languageSource:'app',history:[{id:'a',role:'user',text:'Rahul',at:'invalid'}]};const restored=readConversationSession(JSON.stringify(value));assert.equal(restored?.languageSource,'app');assert.equal(restored?.history?.[0].at,undefined);assert.equal(restored?.pending?.body.idempotencyKey,'qa');
});
