import test from 'node:test';
import assert from 'node:assert/strict';
import {Store} from '../src/lib/server/store';
import {AssistantService} from '../src/lib/server/assistant';
import {AuthenticationService} from '../src/lib/server/authentication';
import {SaaSService} from '../src/lib/server/saas';
import {mkdtempSync,readdirSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {RequestError,money} from '../src/lib/client';
import {createLocaleEngine,dateText,localizedError,renderSystemMessage,systemMessage,text,unitText} from '../src/lib/locale';
import {validAnswerLanguage} from '../src/lib/ai-locale';
import {financialQuestion} from '../src/lib/financial-answer';
import {matchProducts} from '../src/lib/voice/parser';
import {dictionaryIssues,compareDictionary,visibleTextIssues,checkLocales} from '../scripts/check-locales.mjs';

test('all dictionaries and visible copy pass the release gate; injected defects fail it',()=>{
 assert.deepEqual(checkLocales().issues,[]);
 assert.match(dictionaryIssues('{"save":"Save","save":"Again"}','fixture').join(' '),/duplicate/);
 assert.match(compareDictionary({hello:'Hello {{name}}'},{hello:'नमस्ते'},'hi','fixture').join(' '),/interpolation/);
 assert.match(compareDictionary({hello:'Hello'},{hello:'Hello'},'hi','fixture').join(' '),/Latin/);
 assert.match(compareDictionary({hello:'Hello'},{hello:'नमस्ते'},'hinglish','fixture').join(' '),/Devanagari/);
 assert.match(compareDictionary({hello:'Hello'}, {},'hi','fixture').join(' '),/mismatch/);
 assert.match(compareDictionary({items_other:'Items'},{items_other:'सामान'},'hi','fixture').join(' '),/plural sibling/);
 assert.match(visibleTextIssues('export function X(){return <button>Save product now</button>}','fixture.tsx').join(' '),/hardcoded/);
 assert.match(visibleTextIssues('export function X(){return <button>{true?"Save now":"Continue"}</button>}','fixture.tsx').join(' '),/hardcoded/);
 assert.match(visibleTextIssues('export function X(){return <button>{t("missingNewKey")}</button>}','fixture.tsx').join(' '),/unknown/);
});
test('independent request engines never borrow another user language or fall back to English',async()=>{
 const en=createLocaleEngine('en'),hi=createLocaleEngine('hi'),h=createLocaleEngine('hinglish');
 assert.equal(en.t('save'),'Save');assert.equal(hi.t('save'),'सहेजें');assert.notEqual(h.t('save'),en.t('save'));
 await h.changeLanguage('hi');assert.equal(en.language,'en');assert.equal(hi.language,'hi');
 assert.equal(hi.t('futureMissingKey'),hi.t('translationUnavailable'));assert.notEqual(hi.t('futureMissingKey'),en.t('translationUnavailable'));
});
test('existing system messages change language while merchant names and exact values are retained',()=>{
 const message=systemMessage(text('en','translation','taskCreditDetail',{name:'Sharma & Sons',amount:'₹1,250'}));
 const translated=renderSystemMessage(message,'hi');assert(translated.includes('Sharma & Sons'));assert(translated.includes('₹1,250'));assert(!translated.includes('outstanding'));
 assert.equal(renderSystemMessage({literal:'Amul Gold 500ml'},'hi'),'Amul Gold 500ml');
 assert(!localizedError(new RequestError('UNKNOWN','SECRET INTERNAL STACK',500),'hi').includes('SECRET'));
 const error=new RequestError('INSUFFICIENT_STOCK','internal',409,{name:'Amul Gold',quantityMilli:2500,unit:'kg'});
 assert.match(localizedError(error,'hi'),/Amul Gold.*2.5.*किलो/);
});
test('India money, dates and units keep Latin digits with Hindi month names',()=>{
 for(const language of ['en','hi','hinglish']){assert(money(123456789,language).includes('12,34,567.89'));assert(!/[०-९]/.test(money(123456789,language)));}
 assert.match(dateText('2026-10-09','hi'),/9.*अक्टूबर.*2026/);assert.match(dateText('2026-10-09T00:30:00Z','hi',{hour:'numeric',minute:'2-digit',hour12:false}),/06:00/);
 assert.equal(unitText('kg','hi'),'किलो');assert.equal(unitText('MerchantCustomUnit','hi'),'MerchantCustomUnit');
 assert.equal(unitText('piece','en',1),'piece');assert.equal(unitText('piece','en',2),'pieces');assert.equal(unitText('box','en',1),'box');assert.equal(unitText('box','en',2),'boxes');assert.equal(unitText('kg','hi',2),'किलो');
});
test('reviewed product display names are tenant scoped, searchable and preserve issued bill snapshots',()=>{
 const store=new Store(':memory:');try{const session=store.demo('hi'),business=session.businesses[0].id,product=store.state(session.user.id,business).products.find(p=>p.unit==='kg')!;
 const invoice=store.createInvoice(session.user.id,business,{items:[{productId:product.id,quantityMilli:1000}],paidPaise:product.pricePaise,paymentMethod:'cash',idempotencyKey:'locale-snapshot'});
 const updated=store.editProduct(session.user.id,business,product.id,{displayNames:{hi:'सत्यापित नाम',hinglish:'Satyaapit naam'}});
 assert.equal(updated.name,product.name);assert.deepEqual(matchProducts('सत्यापित नाम',[updated]).ids,[product.id]);
 const after=store.state(session.user.id,business);assert.equal(after.invoices.find(i=>i.id===invoice.id)!.items[0].name,product.name);assert.equal(after.invoices.find(i=>i.id===invoice.id)!.totalPaise,invoice.totalPaise);
 const foreign=store.demo('en');assert.throws(()=>store.editProduct(foreign.user.id,foreign.businesses[0].id,product.id,{displayNames:{en:'Foreign'}}),{code:'NOT_FOUND'});
 assert.throws(()=>store.editProduct(session.user.id,business,product.id,{displayNames:{fr:'Unsupported'}}),{code:'INVALID_INPUT'});
 }finally{store.close();}
});
test('AI script guard preserves source names but rejects English prose for Hindi and Hinglish',()=>{
 assert(validAnswerLanguage('Amul Gold की बिक्री देखें।','hi',['Amul Gold']));assert(!validAnswerLanguage('Review Amul Gold sales.','hi',['Amul Gold']));
 assert(validAnswerLanguage('Amul Gold ki bikri dekhein.','hinglish',['Amul Gold']));assert(!validAnswerLanguage('Review sales today.','hinglish'));assert(!validAnswerLanguage('बिक्री देखें।','en'));
 assert.equal(financialQuestion('Aaj ki bikri kitni hai?'),'sales');assert.equal(financialQuestion('Predict tomorrow sales'),null);
});
test('recorded financial answers use exact authorised SQL totals in all locales without calling an AI provider',async()=>{
 const store=new Store(':memory:'),fetch=global.fetch;try{const session=store.demo('en'),business=session.businesses[0].id,assistant=new AssistantService(store),before=store.state(session.user.id,business);global.fetch=async()=>{throw Error('No external call expected');};
 const totals=store.voiceReport(session.user.id,business,'today','assistant');for(const language of ['en','hi','hinglish'] as const){const result=await assistant.ask(session.user.id,business,{question:'today sales',locale:language});assert.equal(result.locale,language);assert.equal(result.provider,'recorded-data');assert(result.answer.includes(money(totals.salesPaise,language)));assert(validAnswerLanguage(result.answer,language));}
 assert.deepEqual(store.state(session.user.id,business).totals,before.totals);
 const foreign=store.demo();await assert.rejects(assistant.ask(foreign.user.id,business,{question:'today sales',locale:'hi'}),{code:'NOT_FOUND'});
 await assert.rejects(assistant.ask(session.user.id,business,{question:'today sales',locale:'fr'}),{code:'INVALID_INPUT'});
 }finally{global.fetch=fetch;store.close();}
});

test('verification and reset messages use the saved profile language and retain trusted one-use URLs',async()=>{
 const directory=mkdtempSync(join(tmpdir(),'dukaanset-v5-mail-')),previousDirectory=process.env.AUTH_MAIL_DIRECTORY,previousMode=process.env.AUTH_EMAIL_MODE,store=new Store(':memory:');process.env.AUTH_MAIL_DIRECTORY=directory;process.env.AUTH_EMAIL_MODE='file';
 try{const auth=new AuthenticationService(store,'http://127.0.0.1:3001');for(const language of ['en','hi','hinglish']as const){const email=`v5-${language}@example.test`,session=await auth.register({name:'Original Merchant',email,password:'Test-only-password-2026',language});const messages=()=>readdirSync(directory).map(file=>JSON.parse(readFileSync(join(directory,file),'utf8'))).filter(message=>message.to===email);const verification=messages().find(message=>message.kind==='verification');assert.equal(verification.subject,text(language,'v3','emailVerifySubject'));assert(verification.text.includes(text(language,'v3','emailExpiryOther')));const token=new URL(verification.url).searchParams.get('token');assert(token);auth.verify({token});await auth.forgot({email});const reset=messages().find(message=>message.kind==='reset');assert.equal(reset.subject,text(language,'v3','emailResetSubject'));assert(reset.text.includes(text(language,'v3','emailExpiryReset')));assert.equal(new URL(reset.url).origin,'http://127.0.0.1:3001');assert.equal(store.session(session.user.id).user.language,language);}}
 finally{store.close();rmSync(directory,{recursive:true,force:true});if(previousDirectory===undefined)delete process.env.AUTH_MAIL_DIRECTORY;else process.env.AUTH_MAIL_DIRECTORY=previousDirectory;if(previousMode===undefined)delete process.env.AUTH_EMAIL_MODE;else process.env.AUTH_EMAIL_MODE=previousMode;}
});
test('communication locale is explicit and never writes a contact attempt, sale or preference',()=>{
 const store=new Store(':memory:');try{const session=store.demo('en'),business=session.businesses.find(b=>b.category==='clothing')!,saas=new SaaSService(store),product=store.state(session.user.id,business.id).products.find(p=>p.name==='Blue Shirt')!;store.adjustStock(session.user.id,business.id,{productId:product.id,quantityMilli:10000,reason:'receipt',idempotencyKey:'locale-followup-stock'});const before=saas.state(session.user.id,business.id),request=before.demand.requestsList.find(r=>r.eligibleFollowUp)!;assert(request);
 for(const language of ['en','hi','hinglish']){const result=saas.message(session.user.id,business.id,request.id,language);assert.equal(result.locale,language);assert(result.message.includes(request.productName));assert(result.message.includes(request.customerName));assert(result.message.includes(business.name));}
 assert.equal(store.session(session.user.id).user.language,'en');assert.deepEqual(saas.state(session.user.id,business.id),before);assert.throws(()=>saas.message(session.user.id,business.id,request.id,'fr'),{code:'INVALID_INPUT'});
 }finally{store.close();}
});
