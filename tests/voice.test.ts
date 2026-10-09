import test from 'node:test';
import assert from 'node:assert/strict';
import { parseVoiceTranscript, validateRow, matchProducts, TranscriptCollector, draftStorageKey, type VoiceProduct } from '../src/lib/voice/parser';
import { configureRecognition, speechProblem, type RecognitionLike } from '../src/lib/voice/speech';
import { SAMPLE_COMMAND, voiceCopy } from '../src/lib/voice/copy';
import { Store } from '../src/lib/server/store';
import { handleRequest } from '../src/lib/server/router';

function product(id:string,name:string,unit:string,aliases:string[]=[],packSize:number|null=null):VoiceProduct{return{id,name,unit,aliases,packSize,barcode:'',variation:'',sku:id,pricePaise:100,costPaise:50,quantityMilli:10000,minStockMilli:1000,expiryDate:null};}
const catalog=[product('milk','Amul Taaza Milk','packet',['doodh','दूध']),product('toor','Toor Dal','kg',['dal','दाल']),product('moong','Moong Dal','kg',['dal','दाल']),product('onion','Red Onion','kg',['pyaz','pyaaz','प्याज']),product('potato','Potato','kg',['aloo','आलू']),product('biscuit','Parle Biscuit','packet',['biscuit','बिस्कुट']),product('screw','Screw','piece',['screws'],12)];

test('the supplied five-product utterance preserves quantities and asks which dal',()=>{
 const rows=parseVoiceTranscript(SAMPLE_COMMAND,catalog);assert.equal(rows.length,5);assert.deepEqual(rows.map(row=>row.quantity),['4','2','5','10','3']);assert.deepEqual(rows.map(row=>row.productId),['milk','','onion','potato','biscuit']);assert.deepEqual(rows[1].candidates,['toor','moong']);assert.deepEqual(rows[1].issues,['ambiguous']);assert.equal(rows[0].quantityMilli,4000);
});
test('English Hindi and Hinglish aliases produce the same confirmed candidate',()=>{
 for(const transcript of ['Add four milk packets.','चार दूध के पैकेट जोड़ दो।','Char doodh ke packet add kar do']){const rows=parseVoiceTranscript(transcript,catalog);assert.equal(rows.length,1);assert.equal(rows[0].productId,'milk');assert.equal(rows[0].quantityMilli,4000);assert.deepEqual(rows[0].issues,[]);}
});
test('multi-clause speech without punctuation and repeated explicit products are retained',()=>{
 const rows=parseVoiceTranscript('4 doodh packet 2 kilo pyaz 5 kilo aloo',catalog);assert.equal(rows.length,3);assert.deepEqual(rows.map(row=>row.quantityMilli),[4000,2000,5000]);const repeated=parseVoiceTranscript('2 kilo pyaz aur 3 kilo pyaz',catalog);assert.equal(repeated.length,2);assert.equal(repeated.reduce((sum,row)=>sum+row.quantityMilli!,0),5000);
});
test('half aadha dedh dhai Hindi digits and exact decimal conversion',()=>{
 for(const [text,milli] of [['half kilo pyaz',500],['aadha kilo pyaz',500],['dedh kilo pyaz',1500],['ढाई किलो प्याज',2500],['५०० ग्राम प्याज',500],['1.001 kilo pyaz',1001],['तेरह किलो प्याज',13000],['pachis kilo pyaz',25000]] as const){const row=parseVoiceTranscript(text,catalog)[0];assert.equal(row.quantityMilli,milli,text);}
});
test('latest correction replaces quantity and removal removes only one clear item',()=>{
 const rows=parseVoiceTranscript('10 kilo aloo add karo... nahi, 5 kilo aloo',catalog);assert.equal(rows.length,1);assert.equal(rows[0].quantityMilli,5000);const milk=parseVoiceTranscript('4 milk packets... sorry, 6 packets',catalog);assert.equal(milk.length,1);assert.equal(milk[0].quantityMilli,6000);const change=parseVoiceTranscript('Dal ki quantity 2 se 3 kilo kar do', [catalog[1]],parseVoiceTranscript('2 kilo dal',[catalog[1]]));assert.equal(change.length,1);assert.equal(change[0].quantityMilli,3000);assert.equal(parseVoiceTranscript('Pyaz hata do',catalog,parseVoiceTranscript('5 kilo pyaz',catalog)).length,0);
});
test('missing quantity is preserved and a quantity-only follow-up resolves one item',()=>{
 const rows=parseVoiceTranscript('5 kilo pyaz, 2 kilo dal aur aloo add kar do',catalog);assert.equal(rows.length,3);assert.equal(rows[2].quantity,'');assert.ok(rows[2].issues.includes('quantity'));const filled=parseVoiceTranscript('10 kilo',catalog,rows);assert.equal(filled.length,3);assert.equal(filled[2].quantityMilli,10000);assert.equal(filled[1].productId,'');
});
test('ambiguous quantity-only correction cannot silently change multiple existing items',()=>{
 const before=parseVoiceTranscript('4 milk packets, 3 packet biscuit',catalog);const after=parseVoiceTranscript('sorry 6 packets',catalog,before);assert.equal(after[0].quantity,'4');assert.equal(after[1].quantity,'3');assert.ok(after.at(-1)!.issues.includes('correction'));
});
test('fuzzy and phonetic matches are suggestions requiring product confirmation',()=>{
 const matches=matchProducts('biscut',catalog);assert.deepEqual(matches.ids,['biscuit']);assert.equal(matches.exact,false);const row=parseVoiceTranscript('3 packet biscut',catalog)[0];assert.equal(row.productId,'');assert.ok(row.issues.includes('ambiguous'));assert.ok(parseVoiceTranscript('2 kilo dragonfruit',catalog)[0].issues.includes('unknown'));assert.equal(matchProducts('aloo',catalog.filter(item=>item.id!=='potato')).ids.length,0);
});

test('long unknown paragraphs do not trigger unbounded fuzzy matching',()=>{
 assert.deepEqual(matchProducts('unrecognized '.repeat(350),catalog),{ids:[],exact:false});
});
test('dozen grams litre conversion and configured packs reject incompatible or fractional stock',()=>{
 assert.equal(parseVoiceTranscript('ek dozen screw',catalog)[0].quantityMilli,12000);assert.equal(parseVoiceTranscript('2 box screw',catalog)[0].quantityMilli,24000);const unconfigured=[{...catalog[6],packSize:null}];assert.ok(parseVoiceTranscript('2 box screw',unconfigured)[0].issues.includes('conversion'));assert.ok(parseVoiceTranscript('half packet milk',catalog)[0].issues.includes('whole'));assert.ok(parseVoiceTranscript('0 kilo pyaz',catalog)[0].issues.includes('quantity'));assert.ok(parseVoiceTranscript('-2 kilo pyaz',catalog)[0].issues.includes('quantity'));assert.ok(parseVoiceTranscript('0.001 gram pyaz',catalog)[0].issues.includes('limit'));const oil=product('oil','Oil','litre');assert.equal(parseVoiceTranscript('500 ml oil',[oil])[0].quantityMilli,500);
});

test('configured box conversion may target weight while an unsaved conversion is refused',()=>{
 const boxedRice=product('boxed-rice','Rice','kg',['chawal'],10);assert.equal(parseVoiceTranscript('2 box chawal',[boxedRice])[0].quantityMilli,20000);assert.ok(parseVoiceTranscript('2 box chawal',[{...boxedRice,packSize:null}])[0].issues.includes('conversion'));assert.ok(parseVoiceTranscript('half box chawal',[boxedRice])[0].issues.includes('whole'));assert.equal(parseVoiceTranscript('half dozen screw',catalog)[0].quantityMilli,6000);
});
test('manual product selection retains merchant names and validates every editable row',()=>{
 const row=parseVoiceTranscript('2 kilo dal',catalog)[0];assert.equal(validateRow({...row,productId:'toor'},catalog).quantityMilli,2000);assert.ok(validateRow({...row,productId:'foreign-business-id'},catalog).issues.includes('ambiguous'));assert.notEqual(draftStorageKey('user-a','business-a'),draftStorageKey('user-a','business-b'));assert.notEqual(draftStorageKey('user-a','business-a'),draftStorageKey('user-b','business-a'));
});
test('repeated interim and final recognition events replace indexed transcript segments',()=>{
 const collector=new TranscriptCollector();collector.update(0,'4 milk',false);collector.update(0,'4 milk packets',true);collector.update(0,'4 milk packets',true);collector.update(1,'2 kilo pyaz',true);assert.equal(collector.text,'4 milk packets 2 kilo pyaz');assert.equal(collector.finalText,collector.text);
});
test('recognition locale errors and stop are deliberate, with no automatic restart',()=>{
 let starts=0,stops=0;const recognition:RecognitionLike={lang:'',continuous:false,interimResults:false,maxAlternatives:0,onstart:null,onend:null,onresult:null,onerror:null,start(){starts++;},stop(){stops++;},abort(){}};let failure='';let words='';configureRecognition(recognition,'hi-IN',{started(){},ended(){},failed(value){failure=value;},transcript(value){words=value;}});assert.equal(starts,0);recognition.start();recognition.onresult!({resultIndex:0,results:{length:1,0:{isFinal:false,0:{transcript:'चार दूध'}}}});recognition.onresult!({resultIndex:0,results:{length:1,0:{isFinal:true,0:{transcript:'चार दूध के पैकेट'}}}});assert.equal(words,'चार दूध के पैकेट');recognition.onerror!({error:'not-allowed'});assert.equal(failure,'permission');recognition.stop();recognition.onend!();assert.equal(starts,1);assert.equal(stops,1);assert.equal(recognition.lang,'hi-IN');assert.equal(speechProblem('network'),'network');
});
test('all visible voice copy keys exist in all three language dictionaries',()=>{
 const english=voiceCopy('en');for(const language of ['hi','hinglish'])for(const key of Object.keys(english) as (keyof typeof english)[])assert.ok(voiceCopy(language)[key],`${language}.${key}`);
});

test('brand and saved variant tokens remain part of matching instead of invented quantity',()=>{
 const shirt={...product('red-shirt','Shirt','piece'),variation:'size 12 red'};const missing=parseVoiceTranscript('shirt size 12 red',[shirt])[0];assert.equal(missing.productId,'red-shirt');assert.ok(missing.issues.includes('quantity'));const milk=product('small-milk','Amul Taaza Milk 500ml','packet');assert.equal(parseVoiceTranscript('4 Amul Taaza Milk 500ml packets',[milk])[0].quantityMilli,4000);
});

test('voice batch API commits linked history once, rejects foreign IDs and rolls back invalid batches',async()=>{
 const store=new Store(':memory:');try{
  const owner=store.register({name:'Voice Test',email:'voice-test@example.test',password:'Voice-test-secret-2026',businessName:'Voice Shop',category:'grocery',language:'en'});const userId=owner.user.id,businessId=owner.businesses[0].id;const first=store.createProduct(userId,businessId,{name:'Onion',aliases:['pyaz'],unit:'kg',pricePaise:4000,quantityMilli:1000});const second=store.createProduct(userId,businessId,{name:'Milk',aliases:['doodh'],unit:'packet',pricePaise:3000,quantityMilli:2000});const other=store.createBusiness(userId,{name:'Other Shop',category:'general'});const foreign=store.createProduct(userId,other.id,{name:'Foreign',unit:'piece',pricePaise:100});const secret=store.issueSession(userId);const call=(body:unknown)=>handleRequest(new Request(`http://localhost/api/businesses/${businessId}/stockbatch`,{method:'POST',headers:{Origin:'http://localhost','Content-Type':'application/json',Cookie:`dukaanset_session=${secret}`},body:JSON.stringify(body)}),store);
  const body={idempotencyKey:'voice-batch-retry',source:'voice',items:[{productId:first.id,quantityMilli:500},{productId:second.id,quantityMilli:4000}]};const saved=await call(body);assert.equal(saved.status,201);const entry=await saved.json();const retry=await call(body);assert.equal(retry.status,201);assert.equal((await retry.json()).id,entry.id);const state=store.state(userId,businessId);assert.equal(state.products.find(p=>p.id===first.id)!.quantityMilli,1500);assert.equal(state.products.find(p=>p.id===second.id)!.quantityMilli,6000);assert.equal(state.inventoryEntries.length,1);assert.equal(entry.items.length,2);for(const line of entry.items)assert.ok(state.movements.some(m=>m.id===line.movementId&&m.referenceId===entry.id));assert.ok(!('transcript' in entry));
  const denied=await call({idempotencyKey:'foreign-attempt',source:'voice',items:[{productId:first.id,quantityMilli:1000},{productId:foreign.id,quantityMilli:1000}]});assert.equal(denied.status,404);assert.equal(store.state(userId,businessId).products.find(p=>p.id===first.id)!.quantityMilli,1500);const bad=await call({idempotencyKey:'invalid-attempt',source:'mixed',items:[{productId:first.id,quantityMilli:1000},{productId:second.id,quantityMilli:500}]});assert.equal(bad.status,400);assert.equal(store.state(userId,businessId).inventoryEntries.length,1);assert.equal(store.state(userId,businessId).products.find(p=>p.id===first.id)!.quantityMilli,1500);const changed=await call({...body,items:[{productId:first.id,quantityMilli:2000}]});assert.equal(changed.status,409);
 }finally{store.close();}
});
