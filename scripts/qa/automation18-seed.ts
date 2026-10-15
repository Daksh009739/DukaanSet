import {Store} from '../../src/lib/server/store';
import {DocumentCaptureService} from '../../src/lib/server/document-capture';
import {randomUUID} from 'node:crypto';
import {mkdirSync,writeFileSync} from 'node:fs';
import sharp from 'sharp';
import type {CaptureExtraction} from '../../src/lib/capture-contracts';
async function main(){
const store=new Store(),records=[],out='.local/qa/automation18';mkdirSync(out,{recursive:true});
for(const language of ['en','hi','hinglish'] as const){
 const session=store.register({name:'Automation QA Merchant',email:'automation18-'+language+'@example.test',password:'Automation18-fixture-only-2026',businessName:'Automation QA '+language,category:'grocery',language}),user=session.user.id,business=session.businesses[0].id;store.db.prepare('UPDATE users SET email_verified=1 WHERE id=?').run(user);
 const customer=store.createContact(user,business,'customers',{name:'Rahul',phone:'9000000042'}),duplicate=store.createContact(user,business,'customers',{name:'Rahul',phone:'9000000099'}),supplier=store.createContact(user,business,'suppliers',{name:'Gupta Traders',phone:'9000000012'}),dal=store.createProduct(user,business,{name:'Dal',unit:'kg',pricePaise:12000,costPaise:8000,quantityMilli:10000,minStockMilli:2000}),sugar=store.createProduct(user,business,{name:'Sugar',unit:'kg',pricePaise:4500,costPaise:3000,quantityMilli:10000,minStockMilli:1000});
 const image=(title:string)=>sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="650"><rect width="900" height="650" fill="#fffef8"/><text x="55" y="70" font-size="27">${title} — QA FIXTURE ${language}</text><text x="55" y="150" font-size="24">Gupta Traders — Source bill QA-42</text><text x="55" y="220" font-size="24">Sugar / चीनी — 2 kg — 30/kg</text><text x="55" y="290" font-size="24">Total 60</text><text x="55" y="400" font-size="19">Printed test fixture. Human review required.</text></svg>`)).png().toBuffer();
 writeFileSync(out+'/stock-'+language+'.png',await image('Stock note'));
 const service=new DocumentCaptureService(store),capture=await service.upload(user,business,'purchases',await image('Supplier bill'),'image/png','supplier-'+language+'.png');
 const extraction:CaptureExtraction={documentType:'purchase',sourceText:'Gupta Traders\nQA-42\nSugar / चीनी - 2 kg - 30/kg\nTotal 60',billNumber:'QA-42',documentDate:'2026-01-02',partyName:'Gupta Traders',subtotal:'60',discount:null,tax:null,total:'60',items:[{originalText:'Sugar / चीनी - 2 kg - 30/kg',name:'Sugar',quantity:'2',unit:'kg',unitPrice:'30',priceUnit:'kg',rateType:'purchase',lineTotal:'60',uncertain:[]}],unreadable:[]};
 // Fixture-only extraction. This does not claim to exercise a live OCR provider.
 store.db.prepare("UPDATE document_captures SET extraction_json=?,status='review' WHERE id=?").run(JSON.stringify(extraction),capture.id);
 records.push({language,user,business,email:session.user.email,customer:customer.id,duplicate:duplicate.id,supplier:supplier.id,dal:dal.id,sugar:sugar.id,capture:capture.id});
}
writeFileSync(out+'/seeds.json',JSON.stringify(records,null,2));store.close();
}
void main();
