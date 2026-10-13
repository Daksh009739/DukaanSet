import {mkdirSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {pdfSuiteFixture} from './pdf-suite-fixtures';
import {renderPdf} from '../../src/lib/server/pdf-renderer';
import {branding} from '../../src/lib/server/document-snapshots';
import type {DocumentKind,DocumentModel,DocumentFormat} from '../../src/lib/document-contracts';
import type {Language} from '../../src/lib/contracts';
import {businessDay} from '../../src/lib/client';

const output=path.resolve(process.argv[2]||'.local/qa/pdf-suite');mkdirSync(output,{recursive:true});
async function main(){
const f=pdfSuiteFixture(),manifest:{name:string;language:string;format:string;pages:number;bytes:number;reference:string}[]=[];
try{
 const inputs:[DocumentKind,string][]=[['invoice',f.invoice.id],['statement',f.customer.id],['receipt',f.receipt.payments[0].id],['stock-report',f.business],['purchase-order',f.order.id],['purchase',f.purchase.id],['business-report',f.business]];
 for(const language of ['en','hi','hinglish'] as Language[])for(const format of ['a4','mono','58mm','80mm'] as DocumentFormat[]){
  const models=inputs.map(([kind,sourceId])=>f.documents.model(f.user,f.business,{kind,sourceId,language,format,start:businessDay(),end:businessDay(),detailed:false}));
  models.push({kind:'statement',closingReport:f.report,sourceId:f.report.id,businessId:f.business,reference:f.report.reference,language,format,detailed:true,generatedAt:f.report.asOf,merchant:f.report.merchant,customer:{id:null,name:'',phone:''},legacy:false});
  models.push({kind:'closing-preview',closingPreview:f.preview,sourceId:f.business,businessId:f.business,reference:`PREVIEW-${f.preview.session.businessDate}`,language,format,detailed:true,generatedAt:f.preview.asOf,merchant:branding(f.store.db,f.business),customer:{id:null,name:'',phone:''},legacy:false});
  for(const model of models){const kind=model.closingReport?'closing':model.kind,name=`${kind}-${language}-${format}`,pdf=await renderPdf(model);writeFileSync(path.join(output,name+'.pdf'),pdf.bytes);writeFileSync(path.join(output,name+'.json'),JSON.stringify(model,null,2));manifest.push({name,language,format,pages:pdf.pages,bytes:pdf.bytes.length,reference:model.reference});}
 }
 // Dense mixed-script rows stress repeated headings and summaries after pagination.
 for(const language of ['en','hi','hinglish'] as Language[]){const model=f.documents.model(f.user,f.business,{kind:'invoice',sourceId:f.invoice.id,language,format:'a4'});model.invoice!.items=Array.from({length:67},(_,i)=>({...model.invoice!.items[i%4],name:`${i+1}. Long catalogue name / लंबा उत्पाद नाम with a measured row and mixed script`,variation:'Dark green / गहरा हरा / XL - Pack of five'}));model.invoice!.subtotalPaise=model.invoice!.items.reduce((n,i)=>n+i.totalPaise,0);model.invoice!.totalPaise=model.invoice!.subtotalPaise-model.invoice!.discountPaise;model.invoice!.balancePaise=model.invoice!.totalPaise-model.invoice!.paidPaise;const pdf=await renderPdf(model),name=`multipage-${language}-a4`;writeFileSync(path.join(output,name+'.pdf'),pdf.bytes);manifest.push({name,language,format:'a4',pages:pdf.pages,bytes:pdf.bytes.length,reference:model.reference});}
 writeFileSync(path.join(output,'manifest.json'),JSON.stringify({fixture:'Fictional records; memory database only; not live business documents',documents:manifest},null,2)+'\n');console.log(JSON.stringify({documents:manifest.length,pages:manifest.reduce((n,v)=>n+v.pages,0),output}));
}finally{f.store.close();}
}
void main().catch(error=>{console.error(error);process.exitCode=1;});
