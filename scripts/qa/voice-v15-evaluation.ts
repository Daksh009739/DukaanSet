import assert from 'node:assert/strict';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {Store} from '../../src/lib/server/store';
import {SaaSService} from '../../src/lib/server/saas';
import {advanceVoice,nextVoiceQuestion,salePreview} from '../../src/lib/voice/conversation';
import {spokenText} from '../../src/lib/voice/os';

type Case={text:string;previous?:string;intent:string;supplier?:string;period?:string;customer?:string;products?:string[];quantities?:string[];units?:string[];prices?:string[];basis?:string[];question?:string;amount?:string;method?:string;mode?:string;cash?:string;upi?:string;total?:number;pending?:number};
const cases=JSON.parse(readFileSync('tests/fixtures/voice-v15.json','utf8')) as Case[],store=new Store(':memory:'),session=store.register({name:'Evaluation fixture',email:'voice-evaluation@example.test',password:'Evaluation-only-2026',businessName:'Evaluation',category:'grocery'}),user=session.user.id,business=session.businesses[0].id;
try{
 for(const name of ['Rahul','Rohan','Chetna'])store.createContact(user,business,'customers',{name});
 for(const [name,unit,price]of [['Daal','kg',10000],['Aloo','kg',4000],['Pyaz','kg',4000],['Maggi','packet',2000],['Shirt','piece',89900]] as const)store.createProduct(user,business,{name,unit,pricePaise:price,quantityMilli:100000});
 const state=new SaaSService(store).state(user,business),latency:number[]=[],results:{text:string;intentCorrect:boolean;slotsCorrect:number;slots:number;errors:string[]}[]=[];
 for(const row of cases){const prior=row.previous?advanceVoice(row.previous,state):undefined,command=advanceVoice(row.text,state,prior),result={text:row.text,intentCorrect:command.intent===row.intent,slotsCorrect:0,slots:0,errors:[] as string[]},check=(label:string,actual:unknown,expected:unknown)=>{result.slots++;try{assert.deepEqual(actual,expected);result.slotsCorrect++;}catch{result.errors.push(label);}};
  if(row.supplier)check('supplier role',spokenText(command.fields.supplierQuery),row.supplier);if(row.period)check('date period',command.fields.period,row.period);
  if(row.customer)check('customer role',spokenText(command.fields.customerQuery),row.customer);
  for(const [label,field]of [['product','query'],['quantity','quantity'],['unit','unit'],['price','price'],['price basis','priceBasis']] as const){const expected=label==='product'?row.products:label==='quantity'?row.quantities:label==='unit'?row.units:label==='price'?row.prices:row.basis;if(expected)check(label,command.items.map(item=>item[field]),expected);}
  for(const key of ['amount','method','mode','cash','upi'] as const)if(row[key]!==undefined)check(key,command.fields[key],row[key]);
  if(row.question)check('clarification',nextVoiceQuestion(command,state),row.question);
  if(row.total!==undefined)check('total',salePreview(command,state.products).total,row.total);if(row.pending!==undefined)check('remaining credit',salePreview(command,state.products).pending,row.pending);
  for(let repeat=0;repeat<25;repeat++){const start=performance.now();advanceVoice(row.text,state,prior);latency.push(performance.now()-start);}results.push(result);
 }
 latency.sort((a,b)=>a-b);const slots=results.reduce((sum,r)=>sum+r.slots,0),correct=results.reduce((sum,r)=>sum+r.slotsCorrect,0),report={generatedAt:new Date().toISOString(),kind:'Labelled typed-transcript deterministic interpretation; fictional scoped records; no live speech or provider call',cases:cases.length,intentCorrect:results.filter(r=>r.intentCorrect).length,intentAccuracyPercent:results.filter(r=>r.intentCorrect).length/cases.length*100,labelledSlotChecks:slots,correctSlots:correct,slotAccuracyPercent:correct/slots*100,parseLatencyMs:{samples:latency.length,median:latency[Math.floor(latency.length/2)],p95:latency[Math.floor(latency.length*.95)],p99:latency[Math.floor(latency.length*.99)]},limitations:['Small manually labelled regression corpus; not an estimate of real-world speech accuracy.','Parser timings exclude microphone, transcription, provider, network, review and commit latency.'],results};
 mkdirSync('.local/qa-v15-evaluation',{recursive:true});writeFileSync('.local/qa-v15-evaluation/report.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({...report,results:undefined},null,2));assert.equal(report.intentCorrect,cases.length,'intent regression');assert.equal(correct,slots,'labelled slot regression');
}finally{store.close();}
