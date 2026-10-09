import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { DocumentModel } from '../document-contracts';
import { text, unitText, dateText } from '../locale';
import { money, quantity } from '../client';

/** One server renderer supplies the preview, download, print and provider attachment. */
export async function renderPdf(model: DocumentModel): Promise<{ bytes: Buffer; pages: number }> {
  const thermal = model.format === '58mm' || model.format === '80mm', mono = model.format === 'mono' || thermal;
  const width = model.format === '58mm' ? 164.41 : model.format === '80mm' ? 226.77 : 595.28;
  const height = thermal ? 841.89 : 841.89, margin = thermal ? 10 : 36, content = width - margin * 2;
  const doc = new PDFDocument({ size: [width,height], margin, bufferPages: true, autoFirstPage: false, info: { Title: `${model.reference} - DukaanSet`, Author: model.merchant.name, Subject: model.kind, CreationDate: new Date(model.generatedAt) } });
  // Paths are explicit bundle assets; PDFKit/fontkit embeds and shapes these local fonts.
  doc.registerFont('Latin',readFileSync(resolve(process.cwd(),'public/fonts/pdf/Manrope.ttf')));
  doc.registerFont('Hindi',readFileSync(resolve(process.cwd(),'public/fonts/pdf/NotoSansDevanagari.ttf')));
  const chunks: Buffer[] = []; const complete = new Promise<Buffer>((resolve,reject)=>{doc.on('data',chunk=>chunks.push(Buffer.from(chunk)));doc.on('end',()=>resolve(Buffer.concat(chunks)));doc.on('error',reject);});
  const label=(key:string,options:Record<string,string|number>={})=>text(model.language,'documents',key,options);
  const amount=(paise:number)=>money(paise,model.language), date=(value:string)=>dateText(value,model.language);
  const accent=mono?'#172E2A':model.merchant.accent, ink='#273C38';
  let y=margin, pages=0;
  // Use font fallback runs without converting Hindi to raster pictures.
  function runs(value:string){return value.split(/([\u0900-\u097f\u20b9]+)/u).filter(Boolean);}
  function fontFor(value:string){return /[\u0900-\u097f\u20b9]/u.test(value)?'Hindi':'Latin';}
  function spanWidth(value:string,size:number){let width=0;doc.fontSize(size);for(const run of runs(value)){doc.font(fontFor(run));width+=doc.widthOfString(run);}return width;}
  function wrapped(value:string,w:number,size:number){
    const lines:string[]=[];const segmenter=new Intl.Segmenter('hi',{granularity:'grapheme'});
    for(const paragraph of value.split('\n')){let line='';for(const word of paragraph.split(/\s+/u)){const candidate=line?line+' '+word:word;if(spanWidth(candidate,size)<=w){line=candidate;continue;}if(line){lines.push(line);line='';}if(spanWidth(word,size)<=w){line=word;continue;}for(const {segment}of segmenter.segment(word)){if(line&&spanWidth(line+segment,size)>w){lines.push(line);line='';}line+=segment;}}lines.push(line);}
    return lines;
  }
  function measured(value:string,w:number,size:number){return wrapped(value,w,size).length*size*1.5+4;}
  function write(value:string,x:number,at:number,w:number,size=thermal?8:10,colour=ink){
    doc.fillColor(colour).fontSize(size);const lines=wrapped(value,w,size);
    for(let n=0;n<lines.length;n++){let left=x;for(const run of runs(lines[n])){doc.font(fontFor(run));doc.text(run,left,at+n*size*1.5+size,{lineBreak:false,baseline:'alphabetic'});left+=doc.widthOfString(run);}}
  }
  function space(h:number){if(y+h>height-60)newPage();}
  function block(value:string,size=thermal?8:10,colour=ink){const h=measured(value,content,size);space(h);write(value,margin,y,content,size,colour);y+=h;}
  function newPage(){doc.addPage();pages++;y=margin;const title=model.kind==='receipt'&&model.receipt?.kind==='refund'?label('refundReceipt'):label(model.kind);
    const logoSize=thermal?28:42,nameWidth=content-(model.merchant.logo?logoSize+30:20),nameHeight=measured(model.merchant.name,nameWidth,thermal?13:21),titleHeight=measured(title,content-20,thermal?8:11);const bandHeight=Math.max(thermal?55:74,nameHeight+titleHeight+20);
    doc.rect(margin,y,content,bandHeight).fill(accent);
    if(model.merchant.logo){doc.image(Buffer.from(model.merchant.logo.split(',')[1],'base64'),margin+9,y+10,{fit:[logoSize,logoSize]});}
    write(model.merchant.name,margin+(model.merchant.logo?logoSize+20:10),y+10,content-(model.merchant.logo?logoSize+30:20),thermal?13:21,'#FFFFFF');
    write(title,margin+10,y+nameHeight+12,content-20,thermal?8:11,'#FFFFFF');y+=bandHeight+12;
    if(pages>1){block(model.reference,thermal?8:10);}
  }
  newPage();
  for(const value of [model.merchant.tagline,model.merchant.address,[model.merchant.phone,model.merchant.email].filter(Boolean).join(' · '),model.merchant.website])if(value)block(value,thermal?8:9);
  y+=8;block(model.reference,thermal?10:15,accent);block(date(model.invoice?.date||model.receipt?.date||model.generatedAt));
  block(model.customer.name||text(model.language,'sales','walkIn'),thermal?10:12);
  if(model.customer.phone)block(model.customer.phone);
  if(model.legacy)block(label('legacy'),thermal?7:9);
  if(model.invoice?.dueDate)block(`${label('dueDate')}: ${date(model.invoice.dueDate)}`);
  y+=10;
  function pair(key:string,value:string,highlight=false){const size=highlight?(thermal?11:13):(thermal?8:10),tokenWidth=Math.max(...value.split(/\s+/u).map(word=>spanWidth(word,size))),valueSize=Math.max(thermal?6:8,Math.min(size,size*content*.38/Math.max(tokenWidth,1))),h=Math.max(measured(key,content*.55,size),measured(value,content*.39,valueSize))+8;space(h);if(highlight)doc.rect(margin,y-4,content,h).fill(mono?'#EDF1EF':'#E6F7F0');write(key,margin+4,y,content*.55,size);write(value,margin+content*.59,y,content*.39,valueSize);y+=h;}
  function table(headers:string[],rows:string[][],fractions:number[]){
    const size=thermal?7:9,cols=fractions.map(f=>f*content);
    const rowHeight=(cells:string[])=>Math.max(...cells.map((cell,i)=>measured(cell,cols[i]-8,size)))+10;
    function row(cells:string[],head=false){const h=rowHeight(cells);if(y+h>height-60){newPage();heading();}if(head)doc.rect(margin,y,content,h).fill(mono?'#E8EFEC':'#DFF4ED');let x=margin;cells.forEach((cell,i)=>{write(cell,x+4,y+5,cols[i]-8,size);x+=cols[i];});y+=h;doc.moveTo(margin,y).lineTo(width-margin,y).strokeColor('#E8EFEC').lineWidth(.5).stroke();}
    function heading(){row(headers,true);}
    heading();for(const cells of rows)row(cells);y+=12;
  }
  if(model.invoice){
    const inv=model.invoice;
    if(thermal){for(const [i,item]of inv.items.entries()){block(`${i+1}. ${item.name}${item.variation?' · '+item.variation:''}`);pair(`${quantity(item.quantityMilli)} ${unitText(item.unit,model.language,item.quantityMilli/1000)} × ${amount(item.pricePaise)}`,amount(item.totalPaise));}}
    else table(['#',label('description'),label('quantity'),label('unitPrice'),label('amount')],inv.items.map((item,i)=>[String(i+1),item.name+(item.variation?'\n'+item.variation:''),`${quantity(item.quantityMilli)} ${unitText(item.unit,model.language,item.quantityMilli/1000)}`,amount(item.pricePaise),amount(item.totalPaise)]),[.05,.38,.17,.19,.21]);
    space(150);pair(label('subtotal'),amount(inv.subtotalPaise));pair(label('discount'),amount(inv.discountPaise));pair(label('total'),amount(inv.totalPaise),true);
    pair(label('issuedPayment'),amount(inv.originalPaidPaise));for(const p of model.originalPayments||[])pair(text(model.language,'sales',p.method),amount(p.amountPaise));pair(label('issuedDue'),amount(inv.originalBalancePaise),true);
    block(label('currentPayment'),thermal?9:12,accent);block(label('asOf',{date:date(model.generatedAt)}),thermal?7:9);pair(text(model.language,'sales','receivedTotal'),amount(inv.paidPaise));pair(`${text(model.language,'sales',inv.status)} · ${text(model.language,'sales','pending')}`,amount(inv.balancePaise));
    const later=inv.payments.filter(p=>p.kind!=='sale');if(later.length){block(label('laterPayments'));for(const p of later)pair(`${date(p.date)} · ${label(p.kind)} · ${text(model.language,'sales',p.method)}`,amount(p.amountPaise));}
    block(label('nonGst'),thermal?7:9);
  }
  if(model.ledger){const l=model.ledger;block(`${date(l.start)} - ${date(l.end)}`);pair(label('opening'),amount(l.openingPaise),true);pair(label('debit'),amount(l.debitsPaise));pair(label('credit'),amount(l.creditsPaise));
    if(thermal){for(const row of l.rows){block(`${date(row.date)} · ${row.reference} · ${label(row.kind)}`);pair(`${label('debit')} / ${label('credit')}`,`${amount(row.debitPaise)} / ${amount(row.creditPaise)}`);pair(label('running'),amount(row.balancePaise));}}
    else table([label('date'),label('description'),label('debit'),label('credit'),label('running')],l.rows.map(row=>[date(row.date),`${row.reference}\n${label(row.kind)}`,amount(row.debitPaise),amount(row.creditPaise),amount(row.balancePaise)]),[.17,.26,.18,.18,.21]);
    pair(label('closing'),amount(l.closingPaise),true);if(!l.rows.length)block(label('noRecords'));
    if(model.detailed){block(label('activity'),thermal?9:12,accent);for(const row of l.rows.filter(r=>r.kind==='purchase')){block(`${row.reference} · ${date(row.date)}`); // Authoritative item snapshots are attached by the service only for detailed statements.
      const details=model.purchaseDetails?.[row.invoiceId||''];for(const item of details||[])block(`${item.name}${item.variation?' · '+item.variation:''} · ${quantity(item.quantityMilli)} ${unitText(item.unit,model.language,item.quantityMilli/1000)} · ${amount(item.totalPaise)}`);}}
  }
  if(model.receipt){const r=model.receipt;pair(label('amount'),amount(r.amountPaise),true);block(text(model.language,'sales',r.method));block(label('allocation'),thermal?9:12,accent);for(const allocation of r.allocations)pair(allocation.number,amount(allocation.amountPaise));pair(label('closing'),amount(r.balanceAsOfPaise));block(label('asOf',{date:date(model.generatedAt)}));}
  if(model.originalPayments?.some(p=>p.method==='upi')||model.receipt?.method==='upi')block(label('recordedUpi'),thermal?7:9);
  if(model.merchant.upiId&&model.merchant.payee&&model.invoice&&model.invoice.status!=='cancelled'&&model.invoice.balancePaise>0){space(130);const uri=`upi://pay?pa=${encodeURIComponent(model.merchant.upiId)}&pn=${encodeURIComponent(model.merchant.payee)}&am=${(model.invoice.balancePaise/100).toFixed(2)}&cu=INR&tn=${encodeURIComponent(model.reference)}`;const qr=await QRCode.toBuffer(uri,{type:'png',width:240,margin:2,errorCorrectionLevel:'M'});doc.image(qr,margin,y,{width:88});y+=94;block(label('qrNote'),thermal?7:9);}
  for(const value of [model.merchant.terms,model.merchant.returnPolicy,model.merchant.footer])if(value){y+=8;block(value,thermal?7:9);}
  block(label('generated',{date:date(model.generatedAt)}),thermal?7:9);
  for(let i=0;i<pages;i++){doc.switchToPage(i);write(label('footer'),margin,height-39,content,thermal?6:8);write(label('page',{page:i+1,total:pages}),margin,height-25,content,thermal?6:8);}
  doc.end();return {bytes:await complete,pages};
}
