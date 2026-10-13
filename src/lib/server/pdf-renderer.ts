import PDFDocument from 'pdfkit';
import { PDFDocument as PDFLibDocument } from 'pdf-lib';
import QRCode from 'qrcode';
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { DocumentModel } from '../document-contracts';
import { text, unitText, dateText } from '../locale';
import { quantity } from '../client';

const palette={teal:'#082F2A',ink:'#173331',muted:'#637D7A',mint:'#1CC69C',pale:'#EFFBF6',soft:'#F5F9F8',line:'#DAE6E3',amber:'#A86400',amberBg:'#FFF3DE',red:'#B43E4C',redBg:'#FDEDEF'};
type Cell={text:string;detail?:string;bold?:boolean;status?:'good'|'warn'|'bad'};
type Column={label:string;fraction:number;align?:'right'|'left'};

/** Shared premium design for preview, authenticated download, print and attachments. */
export async function renderPdf(model:DocumentModel):Promise<{bytes:Buffer;pages:number}> {
  const thermal=['58mm','80mm'].includes(model.format),mono=thermal||model.format==='mono';
  const width=model.format==='58mm'?164.41:model.format==='80mm'?226.77:595.28;
  const margin=thermal?10:42,content=width-margin*2,pageHeight=841.89,bottom=thermal?780:757;
  const c=mono?{...palette,teal:'#151515',ink:'#171717',muted:'#606060',mint:'#4D4D4D',pale:'#F1F1F1',soft:'#F6F6F6',line:'#D8D8D8',amber:'#444444',amberBg:'#EEEEEE',red:'#222222',redBg:'#E5E5E5'}:palette;
  const doc=new PDFDocument({size:[width,pageHeight],margin:0,bufferPages:true,autoFirstPage:false,info:{Title:`${model.reference} - DukaanSet`,Author:model.merchant.name,Subject:model.kind,CreationDate:new Date(model.generatedAt)}});
  for(const [key,file]of Object.entries({regular:'Lato-Regular.ttf',bold:'Lato-Bold.ttf',black:'Lato-Black.ttf',hindi:'NotoSansDevanagari.ttf',hindiBold:'NotoSansDevanagari-Bold.ttf'}))doc.registerFont(key,readFileSync(resolve(process.cwd(),'public/fonts/pdf',file)));
  const logo=readFileSync(resolve(process.cwd(),'public/brand',mono?'invoice-logo.png':'storefront-logo.png'));
  const merchantLogo=model.merchant.logo?Buffer.from(model.merchant.logo.split(',')[1],'base64'):null;
  const shopLogo=merchantLogo&&mono?await sharp(merchantLogo).grayscale().png().toBuffer():merchantLogo;
  const chunks:Buffer[]=[];const completed=new Promise<Buffer>((resolve,reject)=>{doc.on('data',chunk=>chunks.push(Buffer.from(chunk)));doc.on('end',()=>resolve(Buffer.concat(chunks)));doc.on('error',reject);});
  const L=(key:string,params:Record<string,string|number>={})=>text(model.language,'documents',key,params);
  const W=(key:string,params:Record<string,string|number>={})=>text(model.language,'workspace',key,params);
  const amount=(paise:number)=>new Intl.NumberFormat(model.language==='hi'?'hi-IN-u-nu-latn':'en-IN',{style:'currency',currency:'INR',minimumFractionDigits:2,maximumFractionDigits:2}).format(paise/100);
  const unit=(u:string)=>({kg:'kg',kilogram:'kg',g:'g',gram:'g',grams:'g',l:'L',liter:'L',litre:'L',ml:'ml'}[u]||unitText(u,model.language));
  const date=(v:string)=>dateText(v,model.language,{day:'numeric',month:'short',year:'numeric'});
  const fullDate=(v:string)=>dateText(v,model.language,{day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'});
  const closing=model.closingReport||model.closingPreview;
  const title=closing?L('suiteClosing'):model.receipt?.kind==='refund'?L('refundReceipt'):L(`suiteTitle.${model.kind}`);
  const category=closing?'operations':model.invoice?'sales':model.ledger?'ledger':model.receipt?'collection':model.stockReport?'inventory':model.procurement?'procurement':'reports';
  let y=0,pages=0;
  const split=(v:string)=>v.split(/([\u0900-\u097f]+)/u).filter(Boolean);
  function font(run:string,bold=false,black=false){return /[\u0900-\u097f]/u.test(run)?bold||black?'hindiBold':'hindi':black?'black':bold?'bold':'regular';}
  function measure(v:string,size:number,bold=false){doc.fontSize(size);return split(v).reduce((sum,run)=>sum+doc.font(font(run,bold)).widthOfString(run),0);}
  function wrap(v:string,w:number,size:number,bold=false){const result:string[]=[];const graphemes=new Intl.Segmenter(model.language==='hi'?'hi':'en',{granularity:'grapheme'});for(const p of String(v).split('\n')){let line='';for(const word of p.split(/\s+/u)){const next=line?line+' '+word:word;if(measure(next,size,bold)<=w){line=next;continue;}if(line){result.push(line);line='';}if(measure(word,size,bold)<=w){line=word;continue;}for(const {segment}of graphemes.segment(word)){if(line&&measure(line+segment,size,bold)>w){result.push(line);line='';}line+=segment;}}result.push(line);}return result;}
  const textHeight=(v:string,w:number,size:number,bold=false)=>wrap(v,w,size,bold).length*size*1.45;
  function write(v:string,x:number,at:number,w:number,size=thermal?8:10,colour=c.ink,bold=false,align:'left'|'right'='left',black=false){
    const lines=wrap(v,w,size,bold);doc.fontSize(size).fillColor(colour);
    lines.forEach((line,index)=>{let left=x+(align==='right'?Math.max(0,w-measure(line,size,bold)):0);for(const run of split(line)){doc.font(font(run,bold,black)).text(run,left,at+index*size*1.45+size,{lineBreak:false,baseline:'alphabetic'});left+=doc.widthOfString(run);}});
    return lines.length*size*1.45;
  }
  function rule(at=y){doc.moveTo(margin,at).lineTo(width-margin,at).lineWidth(.5).strokeColor(c.line).stroke();}
  function box(x:number,at:number,w:number,h:number,fill=c.soft,r=12,stroke=false){doc.roundedRect(x,at,w,h,r);if(stroke)doc.lineWidth(.6).fillAndStroke(fill,c.line);else doc.fill(fill);}
  function newPage(first=false){
    doc.addPage();pages++;doc.rect(0,0,width,thermal?2:6).fill(c.teal);if(!mono)doc.rect(0,6,Math.min(width,110),1).fill(c.mint);
    if(thermal){doc.image(logo,margin,12,{width:Math.min(130,content)});y=44;write(model.merchant.name,margin,y,content,11,c.ink,true);y+=textHeight(model.merchant.name,content,11,true)+5;write(title,margin,y,content,9,c.teal,true);y+=textHeight(title,content,9,true)+6;rule();y+=8;return;}
    doc.image(logo,margin,29,{width:144});write(L('brandTagline'),margin+43,62,175,8,c.muted);
    const nameWidth=shopLogo?210:250;if(shopLogo)doc.image(shopLogo,width-margin-nameWidth-42,29,{fit:[32,32],align:'center',valign:'center'});
    const nameH=textHeight(model.merchant.name,nameWidth,9,true);write(model.merchant.name,width-margin-nameWidth,30,nameWidth,9,c.teal,true,'right');
    const address=[model.merchant.address,model.merchant.phone].filter(Boolean).join(' / ');const addressH=address?write(address,width-margin-nameWidth,34+nameH,nameWidth,8,c.muted,false,'right'):0;
    y=Math.max(85,40+nameH+addressH);rule();y+=18;
    if(!first){write(title,margin,y,content*.45,13,c.teal,true);write(model.reference,margin+content*.47,y,content*.53,9,c.muted,false,'right');y+=Math.max(24,textHeight(model.reference,content*.53,9)+8);}
  }
  function ensure(h:number){if(y+h>bottom)newPage();}
  function block(v:string,size=thermal?8:10,colour=c.ink,bold=false){for(const line of wrap(v,content,size,bold)){ensure(size*1.45+4);write(line,margin,y,content,size,colour,bold);y+=size*1.45;}y+=4;}
  function section(v:string,reserve=0){ensure((thermal?38:48)+reserve);y+=thermal?8:12;block(model.language==='en'?v.toUpperCase():v,8,c.muted,true);y+=thermal?3:6;}
  function note(v:string,tone:'good'|'warn'|'bad'='good'){const size=thermal?7:8,w=content-22,h=textHeight(v,w,size)+18;ensure(h+10);box(margin,y,content,h,tone==='warn'?c.amberBg:tone==='bad'?c.redBg:c.pale,8);write(v,margin+11,y+9,w,size,tone==='warn'?c.amber:tone==='bad'?c.red:c.teal);y+=h+10;}
  function pill(v:string,x:number,at:number,w:number,tone:'good'|'warn'|'bad'='good',size=8){const h=Math.max(20,textHeight(v,w-18,size,true)+12);box(x,at,w,h,tone==='good'?c.pale:tone==='warn'?c.amberBg:c.redBg,h/2);write(v,x+9,at+6,w-18,size,tone==='good'?c.teal:tone==='warn'?c.amber:c.red,true);return h;}
  function heading(status:string,tone:'good'|'warn'|'bad'='good'){
    if(thermal){block(model.reference,8,c.muted);block(status,8,c.ink,true);return;}
    const statusW=Math.min(190,Math.max(90,measure(status,8,true)+24)),titleW=content-statusW-15;
    write(L('suiteCategory.'+category).toUpperCase(),margin,y,content,8,c.mint,true);y+=21;
    const titleH=write(title,margin,y,titleW,27,c.ink,true),statusH=pill(status,width-margin-statusW,y+2,statusW,tone);y+=Math.max(titleH,statusH)+3;
    block(L('suiteSubtitle.'+category),9,c.muted);y+=10;
  }
  function hero(label:string,value:string,detail:string,side:[string,string][]=[],receipt=false){
    if(thermal){section(label);block(value,16,c.ink,true);if(detail)block(detail,7,c.muted);for(const [k,v]of side)pair(k,v);y+=5;return;}
    const left=receipt?margin+110:margin+22,leftW=side.length?content*.54-24:content-(left-margin)-24;
    const sideHeight=side.reduce((n,[,v])=>n+12+textHeight(v,content*.36-20,16,true)+9,0)+22;
    const valueSize=receipt?36:31,h=Math.max(receipt?132:112,sideHeight,48+textHeight(value,leftW,valueSize,true)+textHeight(detail,leftW,9));ensure(h+16);
    box(margin,y,content,h,c.teal,17);
    doc.save().roundedRect(margin,y,content,h,17).clip();if(!receipt){doc.rect(margin,y+18,3,45).fill(c.mint);for(const radius of [46,64,84])doc.circle(width-margin-6,y+h*.63,radius).strokeColor(mono?'#545454':'#2B6055').lineWidth(.5).stroke();}doc.restore();
    if(receipt){doc.circle(margin+54,y+54,27).fill(c.mint);doc.moveTo(margin+43,y+54).lineTo(margin+51,y+62).lineTo(margin+66,y+46).lineWidth(3).strokeColor(c.teal).stroke();}
    write(label.toUpperCase(),left,y+20,leftW,8,mono?'#D0D0D0':'#AEDCD0',true);write(value,left,y+40,leftW,valueSize,'#FFFFFF',true,'left',true);
    write(detail,left,y+44+textHeight(value,leftW,valueSize,true),leftW,9,mono?'#DFDFDF':'#C5E5DC');
    if(side.length){const sx=margin+content*.64,sw=content*.36-20;doc.moveTo(sx-17,y+20).lineTo(sx-17,y+h-20).strokeColor(mono?'#696969':'#417367').lineWidth(.7).stroke();let sy=y+22;for(const [k,v]of side){write(k.toUpperCase(),sx,sy,sw,7,mono?'#D0D0D0':'#A9DCCB');sy+=12;sy+=write(v,sx,sy,sw,16,'#FFFFFF',true)+9;}}
    y+=h+16;
  }
  function pair(key:string,value:string,highlight=false){const size=thermal?8:10,keyW=content*.53,valueW=content*.43,sizeV=highlight?(thermal?11:15):size;
    const h=Math.max(textHeight(key,keyW,size),textHeight(value,valueW,sizeV,true))+12;ensure(h);if(highlight)box(margin,y,content,h,c.pale,8);write(key,margin+5,y+6,keyW,size,highlight?c.teal:c.muted,highlight);write(value,margin+content*.56-5,y+6,valueW,sizeV,c.ink,true,'right');y+=h;if(!highlight)rule();}
  function identity(leftLabel:string,leftValue:string,leftDetail:string,rightLabel:string,rightValue:string,rightDetail:string,shaded=false){
    if(thermal){section(leftLabel);block(leftValue,10,c.ink,true);if(leftDetail)block(leftDetail,7,c.muted);section(rightLabel);block(rightValue,9,c.ink,true);if(rightDetail)block(rightDetail,7,c.muted);return;}
    const w=content*.48-20,h=Math.max(textHeight(leftValue,w,13,true)+textHeight(leftDetail,w,8),textHeight(rightValue,w,12,true)+textHeight(rightDetail,w,8))+35;ensure(h+12);
    if(shaded)box(margin,y,content,h,c.soft);const pad=shaded?15:0,x2=margin+content*.56;
    write(leftLabel.toUpperCase(),margin+pad,y+12,w,8,c.muted,true);write(rightLabel.toUpperCase(),x2,y+12,w,8,c.muted,true);
    const lh=write(leftValue,margin+pad,y+31,w,13,c.ink,true),rh=write(rightValue,x2,y+31,w,12,c.ink,true);write(leftDetail,margin+pad,y+36+lh,w,8,c.muted);write(rightDetail,x2,y+36+rh,w,8,c.muted);y+=h+12;if(!shaded)rule();
  }
  function table(columns:Column[],rows:Cell[][],tail=0){
    if(!rows.length){block(L('noRecords'),9,c.muted);return;}
    if(thermal){for(const [rowIndex,cells]of rows.entries()){const h=cells.reduce((n,cell,i)=>n+textHeight(`${columns[i].label}: ${cell.text}`,content,8,cell.bold)+4+(cell.detail?textHeight(cell.detail,content,7)+4:0),10);ensure(Math.min(h+(rowIndex===rows.length-1?tail:0),bottom-140));for(let i=0;i<cells.length;i++){block(`${columns[i].label}: ${cells[i].text}`,8,c.ink,cells[i].bold);if(cells[i].detail)block(cells[i].detail!,7,c.muted);}y+=5;rule();y+=5;}return;}
    const widths=columns.map(col=>content*col.fraction),size=9;
    const rowHeight=(cells:Cell[])=>Math.max(26,Math.max(...cells.map((cell,i)=>textHeight(cell.text,widths[i]-22,size,cell.bold)+ (cell.detail?textHeight(cell.detail,widths[i]-22,8)+4:0)))+9);
    function header(){const h=Math.max(29,...columns.map((col,i)=>textHeight(col.label.toUpperCase(),widths[i]-22,7.5,true)+18));box(margin,y,content,h,c.soft,7);let x=margin;columns.forEach((col,i)=>{write(col.label.toUpperCase(),x+11,y+9,widths[i]-22,7.5,c.muted,true,col.align);x+=widths[i];});y+=h;}
    ensure(32+rowHeight(rows[0]));header();
    for(const cells of rows){const h=rowHeight(cells);if(y+h>bottom){newPage();header();}let x=margin;
      cells.forEach((cell,i)=>{const w=widths[i]-22,align=columns[i].align||'left';if(cell.status)pill(cell.text,x+11,y+4,w,cell.status,7);else{const used=write(cell.text,x+11,y+5,w,size,c.ink,cell.bold,align);if(cell.detail)write(cell.detail,x+11,y+9+used,w,8,c.muted,false,align);}x+=widths[i];});y+=h;rule();
    }y+=6;
  }
  function totals(leftTitle:string,leftPairs:[string,string][],sumPairs:[string,string][],totalLabel:string,total:string){
    if(thermal){section(leftTitle,Math.min(240,(leftPairs.length+sumPairs.length+1)*28+70));for(const [k,v]of leftPairs)pair(k,v);for(const [k,v]of sumPairs)pair(k,v);pair(totalLabel,total,true);return;}
    const sw=content*.44,px=margin+content-sw,pw=sw-28,size=9;
    const pairHeight=(k:string,v:string,w:number)=>Math.max(textHeight(k,w*.53,size),textHeight(v,w*.45,size,true))+7;
    const leftH=leftPairs.reduce((n,[k,v])=>n+pairHeight(k,v,content*.42),0)+24,summaryH=sumPairs.reduce((n,[k,v])=>n+pairHeight(k,v,pw),0)+textHeight(total,pw*.6,18,true)+33,h=Math.max(leftH,summaryH);
    ensure(h+10);const start=y;write(leftTitle.toUpperCase(),margin,y+6,content*.48,8,c.muted,true);let ly=y+26;
    for(const [k,v]of leftPairs){const rowH=pairHeight(k,v,content*.42);write(k,margin,ly,content*.27,size,c.muted);write(v,margin+content*.27,ly,content*.17,size,c.ink,true,'right');ly+=rowH;}
    box(px,y,sw,summaryH,c.pale,12);let sy=y+15;for(const [k,v]of sumPairs){write(k,px+14,sy,pw*.53,size,c.muted);write(v,px+14+pw*.55,sy,pw*.45,size,c.ink,true,'right');sy+=pairHeight(k,v,pw);}
    doc.moveTo(px+14,sy+2).lineTo(px+sw-14,sy+2).strokeColor(c.line).lineWidth(.5).stroke();sy+=12;
    write(totalLabel.toUpperCase(),px+14,sy,pw*.36,9,c.teal,true);write(total,px+14+pw*.38,sy-3,pw*.62,18,c.teal,true,'right');y=start+h+12;
  }
  function metrics(items:{label:string;value:string;detail?:string;tone?:'good'|'warn'|'bad'}[],columns=2,compact=false){
    if(thermal){for(const item of items)pair(item.label,item.value,true);return;}
    for(let offset=0;offset<items.length;offset+=columns){const group=items.slice(offset,offset+columns),w=(content-12*(columns-1))/columns,valueSize=compact?20:22,h=Math.max(compact?68:84,...group.map(v=>textHeight(v.label,w-42,8)+textHeight(v.value,w-42,valueSize,true)+(v.detail?textHeight(v.detail,w-42,compact?7:8):0)+(compact?18:34)));ensure(h+12);
      group.forEach((v,i)=>{const x=margin+i*(w+12);box(x,y,w,h,'#FFFFFF',12,true);doc.rect(x+14,y+14,3,27).fill(v.tone==='warn'?c.amber:v.tone==='bad'?c.red:c.mint);write(v.label.toUpperCase(),x+27,y+14,w-42,8,c.muted,true);const used=write(v.value,x+27,y+32,w-42,valueSize,c.ink,true);if(v.detail)write(v.detail,x+27,y+34+used,w-42,compact?7:8,c.muted);});y+=h+12;
    }
  }
  newPage(true);
  if(model.invoice){const inv=model.invoice,status=text(model.language,'sales',inv.status);
    heading(status,inv.status==='cancelled'?'bad':inv.balancePaise>0?'warn':'good');
    hero(L('invoiceTotal'),amount(inv.totalPaise),`${L('productsShown',{count:inv.items.length})} / ${date(inv.date)}`,[[L('received'),amount(inv.paidPaise)],[L('balanceDue'),amount(inv.balancePaise)]]);
    identity(L('billTo'),model.customer.name||text(model.language,'sales','walkIn'),model.customer.phone,L('invoiceDetails'),model.reference,fullDate(inv.date));
    if(inv.dueDate)block(`${L('dueDate')}: ${date(inv.dueDate)}`,9,c.muted);
    section(L('itemisedPurchase'));
    table([{label:L('productVariant'),fraction:.49},{label:L('quantity'),fraction:.14},{label:L('unitPrice'),fraction:.17,align:'right'},{label:L('amount'),fraction:.20,align:'right'}],inv.items.map((i,n)=>[{text:`${String(n+1).padStart(2,'0')}  ${i.name}`,detail:i.variation,bold:true},{text:`${quantity(i.quantityMilli)} ${unit(i.unit)}`},{text:amount(i.pricePaise)},{text:amount(i.totalPaise),bold:true}]));
    const payments=inv.payments.length?inv.payments:model.originalPayments||[],cash=payments.filter(p=>p.method==='cash').reduce((n,p)=>n+p.amountPaise,0),upi=payments.filter(p=>p.method==='upi').reduce((n,p)=>n+p.amountPaise,0);
    totals(L('paymentBreakdown'),[[text(model.language,'sales','cash'),amount(cash)],[text(model.language,'sales','upi'),amount(upi)],[L('balanceDue'),amount(inv.balancePaise)]],[[L('subtotal'),amount(inv.subtotalPaise)],[L('discount'),amount(-inv.discountPaise)]],L('total'),amount(inv.totalPaise));
    if(inv.originalPaidPaise!==inv.paidPaise||inv.status==='cancelled'){section(L('issuedPayment'));pair(L('issuedPayment'),amount(inv.originalPaidPaise));pair(L('issuedDue'),amount(inv.originalBalancePaise));note(L('currentPayment')+' / '+L('asOf',{date:date(model.generatedAt)}));}
    const later=inv.payments.filter(p=>p.kind!=='sale');if(later.length){section(L('laterPayments'));table([{label:L('date'),fraction:.25},{label:L('description'),fraction:.43},{label:L('amount'),fraction:.32,align:'right'}],later.map(p=>[{text:date(p.date)},{text:`${L(p.kind)} / ${text(model.language,'sales',p.method)}`},{text:amount(p.amountPaise),bold:true}]));}
    block(L('nonGst')+(model.originalPayments?.some(p=>p.method==='upi')?' '+L('recordedUpi'):''),thermal?7:8,c.muted);if(inv.status==='cancelled')note(L('cancelledInvoiceNote'),'bad');
  }
  if(model.ledger){const l=model.ledger;heading(L(l.closingPaise>0?'balanceOpen':l.closingPaise<0?'creditBalance':'settled'),l.closingPaise>0?'warn':'good');
    hero(L('closingReceivable'),amount(l.closingPaise),`${L('period')} / ${date(l.start)} - ${date(l.end)}`,[[L('debit'),amount(l.debitsPaise)],[L('credit'),amount(l.creditsPaise)]]);
    identity(L('accountHolder'),model.customer.name,model.customer.phone,L('opening'),amount(l.openingPaise),model.merchant.name,true);
    section(L('transactionHistory'));table([{label:L('date'),fraction:.16},{label:L('description'),fraction:.34},{label:L('debit'),fraction:.16,align:'right'},{label:L('credit'),fraction:.16,align:'right'},{label:L('running'),fraction:.18,align:'right'}],l.rows.map(r=>[{text:date(r.date)},{text:r.reference,detail:L(r.kind)},{text:r.debitPaise?amount(r.debitPaise):'-'},{text:r.creditPaise?amount(r.creditPaise):'-',bold:true},{text:amount(r.balancePaise),bold:true}]));
    note(`${L('ledgerExplanation')} ${L('closing')}: ${amount(l.closingPaise)}`);
    if(model.detailed&&model.purchaseDetails){section(L('activity'));for(const row of l.rows.filter(r=>r.kind==='purchase')){block(`${row.reference} / ${date(row.date)}`,10,c.teal,true);table([{label:L('description'),fraction:.58},{label:L('quantity'),fraction:.19},{label:L('amount'),fraction:.23,align:'right'}],(model.purchaseDetails[row.invoiceId||'']||[]).map(i=>[{text:i.name,detail:i.variation,bold:true},{text:`${quantity(i.quantityMilli)} ${unit(i.unit)}`},{text:amount(i.totalPaise),bold:true}]));}}
  }
  if(model.receipt){const r=model.receipt;heading(L(r.kind==='refund'?'refundRecorded':'paymentRecorded'));hero(L(r.kind==='refund'?'refund':'received'),amount(Math.abs(r.amountPaise)),`${model.reference}\n${fullDate(r.date)}`,[],true);
    section(L('paymentDetails'));pair(L(r.kind==='refund'?'paidTo':'receivedFrom'),model.customer.name||text(model.language,'sales','walkIn'));if(model.customer.phone)pair(L('phone'),model.customer.phone);pair(L('method'),text(model.language,'sales',r.method));pair(L('recordedBy'),model.merchant.name);
    section(L('allocation'));table([{label:L('reference'),fraction:.65},{label:L('amount'),fraction:.35,align:'right'}],r.allocations.map(a=>[{text:a.number||L('unallocated')},{text:amount(a.amountPaise),bold:true}]));
    if(r.balanceBeforePaise!==undefined&&r.balanceAfterPaise!==undefined){section(L('accountImpact'),thermal?55:84);metrics([{label:L('balanceBefore'),value:amount(r.balanceBeforePaise)},{label:L('balanceAfter'),value:amount(r.balanceAfterPaise)}],2,true);}
    pair(L('currentBalance'),amount(r.balanceAsOfPaise));block(L('asOf',{date:date(model.generatedAt)}),thermal?7:8,c.muted);
  }
  if(model.procurement){const p=model.procurement,isOrder=model.kind==='purchase-order';heading(L(p.status==='draft'?'draftNotReceived':p.status==='cancelled'?'orderCancelled':'goodsReceived'),p.status==='draft'?'warn':p.status==='cancelled'?'bad':'good');
    hero(L(isOrder?'orderValue':'purchaseValue'),amount(p.totalPaise),`${model.reference} / ${date(p.date)}`,[[L('supplier'),p.supplier.name||L('supplierNotAssigned')],[L('lineItems'),String(p.items.length)]]);
    identity(L('supplier'),p.supplier.name||L('supplierNotAssigned'),p.supplier.phone,L('deliverTo'),model.merchant.name,model.merchant.address);
    section(L('orderItems'));table([{label:L('productVariant'),fraction:.48},{label:L('quantity'),fraction:.15},{label:L('unitCost'),fraction:.17,align:'right'},{label:L('amount'),fraction:.20,align:'right'}],p.items.map(i=>[{text:i.name,detail:i.variation,bold:true},{text:`${quantity(i.quantityMilli)} ${unit(i.unit)}`},{text:amount(i.costPaise)},{text:amount(i.totalPaise),bold:true}]));
    totals(L('fulfilment'),isOrder?[[L('status'),L(p.status==='draft'?'draftNotReceived':p.status==='cancelled'?'orderCancelled':'goodsReceived')]]:[[L('received'),amount(p.paidPaise||0)],[L('supplierPayable'),amount(p.balancePaise||0)]],[[L('subtotal'),amount(p.totalPaise)]],L(isOrder?'orderTotal':'total'),amount(p.totalPaise));
    note(L(isOrder?'purchaseOrderNote':'receivedPurchaseNote'),isOrder?'warn':'good');if(p.purchaseId)pair(L('linkedPurchase'),`PUR-${p.purchaseId}`);
  }
  if(model.stockReport){const r=model.stockReport;heading(L('productsShown',{count:r.rows.length}));hero(L('inventorySnapshot'),date(model.generatedAt),L('stockSnapshotNote'));
    metrics([{label:L('healthy'),value:String(r.healthy)},{label:L('lowStock'),value:String(r.low),tone:'warn'},{label:L('outOfStock'),value:String(r.out),tone:'bad'}],3);
    section(L('itemAvailability'));table([{label:L('productVariant'),fraction:.47},{label:L('available'),fraction:.18,align:'right'},{label:L('reorderLevel'),fraction:.18,align:'right'},{label:L('status'),fraction:.17}],r.rows.map(p=>[{text:p.name,detail:[p.variation,p.sku].filter(Boolean).join(' / '),bold:true},{text:`${quantity(p.quantityMilli)} ${unit(p.unit)}`,bold:true},{text:`${quantity(p.minStockMilli)} ${unit(p.unit)}`},{text:L(p.quantityMilli<=0?'outOfStock':p.quantityMilli<=p.minStockMilli?'lowStock':'healthy'),status:p.quantityMilli<=0?'bad':p.quantityMilli<=p.minStockMilli?'warn':'good'}]),thermal?textHeight(L('stockAlertNote'),content-22,7)+28:0);note(L('stockAlertNote'));
  }
  if(model.businessReport){const r=model.businessReport;heading(L('recordedHistory'));hero(L('netSales'),amount(r.salesPaise),`${date(r.start)} - ${date(r.end)}`,[[L('received'),amount(r.receivedPaise)],[L('balanceDue'),amount(r.outstandingPaise)]]);
    metrics([{label:L('expenses'),value:amount(r.expensesPaise)},{label:L('supplierPayable'),value:amount(r.supplierDuePaise)},{label:L('stockAtCost'),value:amount(r.stockValuePaise)},{label:L('billsInPeriod'),value:String(r.rows.length)}]);note(L('reportBasisNote'));
    section(L('salesHistory'));table([{label:L('reference'),fraction:.22},{label:L('billTo'),fraction:.27},{label:L('amount'),fraction:.17,align:'right'},{label:L('balanceDue'),fraction:.17,align:'right'},{label:L('status'),fraction:.17}],r.rows.map(i=>[{text:i.reference,detail:date(i.date)},{text:i.customer||text(model.language,'sales','walkIn')},{text:amount(i.totalPaise),bold:true},{text:amount(i.balancePaise)},{text:text(model.language,'sales',i.status),status:i.status==='cancelled'?'bad':i.balancePaise>0?'warn':'good'}]));
  }
  if(closing){const r=closing,T=r.totals,saved=model.closingReport;heading(L(!saved?'previewNotFinalised':saved.verification==='matched'?'closingVerified':'savedPending'),!saved||saved.verification!=='matched'?'warn':'good');
    hero(W('businessDate'),date(r.session.businessDate),model.merchant.name,[[L('dayStatus'),W(r.session.status==='closed'?'sessionClosed':'sessionOpen')]]);
    metrics([{label:W('netSales'),value:amount(T.netSalesPaise),detail:L('invoiceCount',{count:T.billCount})},{label:W('collections'),value:amount(T.collectionsPaise),detail:L('pastCredit',{amount:amount(T.olderDuesCollectionsPaise)})},{label:W('newCredit'),value:amount(T.newCreditPaise),tone:'warn'},{label:W('olderCollections'),value:amount(T.olderDuesCollectionsPaise)}],2,true);
    section(L('collectionMix'));const h=thermal?90:98;ensure(h+12);const start=y;box(margin,y,content,h,c.soft);let sy=y+10;
    for(const [k,v]of [[W('cashCollections'),T.cashCollectionsPaise],[W('upiCollections'),T.upiCollectionsPaise]] as [string,number][]){write(k,margin+16,sy,content*.6,9);write(amount(v),margin+content*.6,sy,content*.4-16,9,c.ink,true,'right');sy+=24;box(margin+16,sy,content-32,7,c.line,3);if(v>0)box(margin+16,sy,(content-32)*v/Math.max(1,T.cashCollectionsPaise+T.upiCollectionsPaise),7,c.mint,3);sy+=20;}y=Math.max(start,y)+h+12;
    ensure(thermal?110:105);section(W('cashReconciliation'));if(thermal){pair(W('openingCash'),amount(r.session.openingCashPaise));pair(L('netCashMovement'),amount(T.expectedCashPaise-r.session.openingCashPaise));pair(W('expectedCash'),amount(T.expectedCashPaise),true);}else{for(const [i,[key,value]]of [[W('openingCash'),r.session.openingCashPaise],[L('netCashMovement'),T.expectedCashPaise-r.session.openingCashPaise],[W('expectedCash'),T.expectedCashPaise]].entries()){const x=margin+i*content/3;write(String(key).toUpperCase(),x,y,content/3-10,7,c.muted,true);write(amount(Number(value)),x,y+19,content/3-10,15,c.teal,true);}y+=48;}
    note(!saved?L('closingPreviewNote'):saved.actualCashPaise===null?L('countPendingNote'):`${W('actualCash')}: ${amount(saved.actualCashPaise)} / ${W('difference')}: ${amount(saved.differencePaise||0)}`,!saved||saved.verification!=='matched'?'warn':'good');
    section(L('accountingDetail'),thermal?160:180);
    for(const [heading,pairs]of [
      [W('netSales'),[['grossSales',T.grossSalesPaise],['discounts',-T.discountsPaise],['returns',-T.returnsPaise],['netSales',T.netSalesPaise]]],
      [W('paymentsBreakdown'),[['cashCollections',T.cashCollectionsPaise],['upiCollections',T.upiCollectionsPaise],['saleCollections',T.saleCollectionsPaise],['olderCollections',T.olderDuesCollectionsPaise],['refunds',T.refundsPaise]]],
      [W('closingReceivable'),[['openingReceivable',T.openingReceivablePaise],['newCredit',T.newCreditPaise],['creditCollections',-T.creditCollectionsPaise],['creditReversals',-T.creditReversalsPaise],['closingReceivable',T.closingReceivablePaise]]],
      [W('cashReconciliation'),[['openingCash',r.session.openingCashPaise],['cashCollections',T.cashCollectionsPaise],['cashExpenses',-T.cashExpensesPaise],['cashSupplierPayments',-T.cashSupplierPaymentsPaise],['cashRefunds',-T.cashRefundsPaise],['deposits',T.depositsPaise],['withdrawals',-T.withdrawalsPaise],['expectedCash',T.expectedCashPaise]]],
      [W('expensesSuppliers'),[['cashExpenses',T.cashExpensesPaise],['noncashExpenses',T.expensesPaise-T.cashExpensesPaise],['supplierPayments',T.supplierPaymentsPaise]]]
    ] as [string,[string,number][]][]){section(heading,Math.min(260,pairs.length*(thermal?24:28)));for(const [key,value]of pairs)pair(W(key),amount(value),['netSales','expectedCash','closingReceivable'].includes(key));}
    section(W('inventorySummary'));pair(text(model.language,'translation','purchases'),String(T.purchaseCount));pair(text(model.language,'translation','lowStock'),String(T.lowStockCount));
    for(const p of r.inventory){ensure(90);block(`${p.name}${p.variant?' / '+p.variant:''}`,10,c.teal,true);block(`${W('soldQuantity',{quantity:quantity(p.soldMilli),unit:unit(p.unit)})} / ${W('receivedQuantity')}: ${quantity(p.receivedMilli)} / ${W('returnedQuantity')}: ${quantity(p.returnedMilli)} / ${W('wastedQuantity')}: ${quantity(p.wastedMilli)} ${unit(p.unit)}`,8,c.muted);pair(W('availableStock'),`${quantity(p.availableMilli)} ${unit(p.unit)}`);}
    if(saved){section(L('auditDetails'));block(`${W('version')}: ${saved.version} / ${W(saved.method)} / ${saved.actorKind==='system'?W('schedulerActor'):saved.actorName}`,8,c.muted);block(`${W('closedAt')}: ${fullDate(saved.asOf)} / ${r.session.timezone} / ${W('cutoff')}: ${r.session.cutoff}`,8,c.muted);if(saved.scheduledAt)block(`${W('scheduledAt')}: ${fullDate(saved.scheduledAt)}`,8,c.muted);if(saved.reason){block(saved.reason);block(saved.sourceReferences.join(', '),8,c.muted);}if(saved.revisedAt)block(`${W('revisedBy')}: ${saved.revisionActorName} / ${fullDate(saved.revisedAt)}`,8,c.muted);if(saved.linkedCorrections?.length){block(W('linkedCorrectionHint'),8,c.muted);for(const correction of saved.linkedCorrections)pair(`${correction.sourceId} / ${date(correction.date)}`,amount(correction.amountPaise));}block(`${W('session')}: ${r.session.id}`,7,c.muted);block(`${W('calculationVersion')}: ${saved.calculationVersion}`,7,c.muted);}
  }
  if(model.receipt?.method==='upi')block(L('recordedUpi'),thermal?7:8,c.muted);
  if(model.merchant.upiId&&model.merchant.payee&&model.invoice&&model.invoice.status!=='cancelled'&&model.invoice.balancePaise>0){const uri=`upi://pay?pa=${encodeURIComponent(model.merchant.upiId)}&pn=${encodeURIComponent(model.merchant.payee)}&am=${(model.invoice.balancePaise/100).toFixed(2)}&cu=INR&tn=${encodeURIComponent(model.reference)}`;const qr=await QRCode.toBuffer(uri,{type:'png',width:240,margin:2,errorCorrectionLevel:'M'});ensure(130);doc.image(qr,margin,y,{width:82});y+=88;block(L('qrNote'),thermal?7:8,c.muted);}
  if(model.legacy)note(L('legacy'),'warn');
  for(const v of [model.merchant.tagline,model.merchant.email,model.merchant.website,model.merchant.terms,model.merchant.returnPolicy,model.merchant.footer])if(v)block(v,thermal?7:8,c.muted);
  // Thermal pages use exact paper width and trim the last roll segment to its content.
  const lastHeight=thermal?Math.max(120,Math.min(pageHeight,y+58)):pageHeight;
  for(let i=0;i<pages;i++){doc.switchToPage(i);const footerY=(thermal&&i===pages-1?lastHeight:pageHeight)-(thermal?43:61);rule(footerY);if(thermal){write(L('footer'),margin,footerY+8,content,6,c.muted);write(date(model.generatedAt),margin,footerY+22,content*.56,6,c.muted);write(L('page',{page:i+1,total:pages}),margin+content*.57,footerY+22,content*.43,6,c.muted,false,'right');}else{write('DUKAANSET',margin,footerY+10,content*.22,8,c.teal,true);write(L('footer'),margin+content*.22,footerY+10,content*.55,7,c.muted);write(L('page',{page:i+1,total:pages}),margin+content*.78,footerY+10,content*.22,7,c.muted,false,'right');write(date(model.generatedAt),margin,footerY+27,content*.36,6.5,c.muted);write(title,margin+content*.37,footerY+27,content*.63,6.5,c.muted,false,'right');}}
  doc.end();let bytes=await completed;
  if(thermal&&lastHeight<pageHeight){const pdf=await PDFLibDocument.load(bytes,{updateMetadata:false}),last=pdf.getPage(pages-1);last.translateContent(0,lastHeight-pageHeight);last.setSize(width,lastHeight);bytes=Buffer.from(await pdf.save({useObjectStreams:false}));}
  return {bytes,pages};
}
