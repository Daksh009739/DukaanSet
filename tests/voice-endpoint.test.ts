import test from 'node:test';
import assert from 'node:assert/strict';
import {browserSpeechAdapter,type RecognitionLike} from '../src/lib/voice/speech';
import {SpeechTurn} from '../src/lib/voice/speech-turn';

for(const mode of ['final','interim','late-final','abort','network']as const)test(`missing speechend: ${mode} is bounded, releases the turn and cannot submit twice`,t=>{
 t.mock.timers.enable({apis:['setTimeout']});let native!:RecognitionLike,stops=0,dispatches=0,aborts=0,failure='';
 const turn=new SpeechTurn('session','turn',receipt=>{dispatches++;assert.equal(receipt.text,'राहुल के नाम से 100 रुपये का बिल बनाओ');});
 const result=(final:boolean)=>native.onresult?.({resultIndex:0,results:{length:1,0:{isFinal:final,0:{transcript:'राहुल के नाम से 100 रुपये का बिल बनाओ'}}}});
 class Recognition{lang='';continuous=true;interimResults=true;maxAlternatives=1;onstart=null;onend=null;onresult=null;onerror=null;constructor(){native=this;}start(){native.onstart?.();}stop(){stops++;if(mode==='late-final'){result(true);native.onend?.();native.onend?.();}}abort(){aborts++;}}
 const prior=globalThis.window;Object.assign(globalThis,{window:{SpeechRecognition:Recognition}});
 try{const session=browserSpeechAdapter.create('hi-IN',{started:()=>turn.started(),transcript:(value,final)=>turn.transcript(value,final),finalizing:()=>turn.finalizing(),ended:()=>turn.finish(),failed:problem=>{failure=problem;turn.finish(problem);}});session.start();native.onspeechstart?.();result(mode==='final');
 if(mode==='abort'){turn.cancel();session.abort();}else if(mode==='network')native.onerror?.({error:'network'});
 for(let i=0;i<4;i++){t.mock.timers.tick(800);native.onspeechstart?.();result(mode==='final');}assert.equal(stops,0);t.mock.timers.tick(400);
 if(mode==='abort'||mode==='network'){assert.equal(stops,0);assert.equal(dispatches,0);}else{assert.equal(stops,1);t.mock.timers.tick(3000);assert.equal(dispatches,mode==='interim'?0:1);}
 native.onend?.();result(true);t.mock.timers.tick(60000);assert.equal(dispatches,mode==='final'||mode==='late-final'?1:0);assert.equal(failure,mode==='network'?'network':'');assert.ok(aborts>=1,'terminal states release native recognition without depending on provider cleanup');session.abort();assert.ok(aborts>=1);
 }finally{Object.assign(globalThis,{window:prior});}
});
