import type { Product, StockBatchItem } from '../contracts';
import { canonicalProductName, canonicalUnit, catalogueUnits, matchProducts, newProductDraft, parseVoiceTranscript, validateRow, voicePricePaise, type VoiceRow } from './parser';
import { spokenStockText } from './os';
import {minorUnits} from '../client';

const number='(\\d+(?:\\.\\d{1,2})?)';
const rupees='(?:rupaye|rupees|rupee|रुपये|रुपए)';
const unitWords='(?:kg|kilo|kilograms?|g|grams?|packet|piece|pieces|pcs|box|litre|ml|metre|meter|किलो|ग्राम|पीस|पैकेट|लीटर)';
function priceUnitIn(value:string){return value.match(new RegExp(`(?:^|\\s)(${unitWords})(?=\\s|$)`))?.[1];}
export function stockBaseQuantity(row:VoiceRow,products:Product[]):number|null {
 // Price-independent conversion of a detached draft; no placeholder reaches a save.
 return validateRow({...row,newProduct:row.newProduct?{...row.newProduct,price:'1',cost:''}:undefined,sellingPrice:undefined,sellingTotal:undefined,purchaseCost:undefined,purchaseTotal:undefined,unclearAmount:undefined},products).quantityMilli;
}
function normalizePrices(row:VoiceRow,products:Product[]):VoiceRow {
 const product=products.find(p=>p.id===row.productId)||row.newProduct;
 for(const [key,unitKey] of [['sellingPrice','priceUnit'],['purchaseCost','costUnit']] as const){
  const unit=row[unitKey],amount=row[key];
  if(product&&unit&&canonicalUnit(unit)!==canonicalUnit(product.unit)&&amount!==undefined&&amount!==''){
   const converted=stockBaseQuantity({...row,quantity:'1',unit},products),numerator=BigInt(voicePricePaise(amount)??-1)*1000n;
   if(converted===null||numerator<0n||numerator%BigInt(converted)!==0n)row.unclearAmount=amount;
   else{row[key]=String(Number(numerator/BigInt(converted))/100);row[unitKey]=product.unit;if(row.newProduct)row.newProduct[key==='sellingPrice'?'price':'cost']=row[key];}
  }
 }
 if(row.purchaseTotal){const quantity=stockBaseQuantity(row,products),cost=quantity===null?null:exactUnitCost(row.purchaseTotal,String(quantity/1000));if(cost!==null){row.purchaseCost=cost;row.costUnit=product?.unit||row.newProduct?.unit;if(row.newProduct)row.newProduct.cost=cost;if(row.unclearAmount===row.purchaseTotal)row.unclearAmount=undefined;}else row.unclearAmount=row.purchaseTotal;}
 return validateRow(row,products);
}
export function exactUnitCost(total:string,qty:string):string|null {
 const amount=voicePricePaise(total);if(amount===null||!/^\d+(?:\.\d{1,3})?$/.test(qty))return null;
 const [whole,fraction='']=qty.split('.'),milli=BigInt(whole)*1000n+BigInt(fraction.padEnd(3,'0'));
 if(milli<=0n||BigInt(amount)*1000n%milli!==0n)return null;
 const result=Number(BigInt(amount)*1000n/milli);return result<=1_000_000_000?String(result/100):null;
}
/** This is shared by the global assistant and focused stock workspace. No writes. */
export function prepareStockCommand(raw:string,products:Product[],previous:VoiceRow[]=[]):VoiceRow[] {
 const text=spokenStockText(raw.replace(/₹\s*(\d+(?:\.\d{1,2})?)/g,'$1 rupaye')).trim(),rows:VoiceRow[]=previous.map(row=>({...row,newProduct:row.newProduct?{...row.newProduct}:undefined}));
 // A quantity/rate correction targets a catalogue identity, never appends stock.
 const correction=text.match(new RegExp(`^(.+?)\\s+(?:ka\\s+|का\\s+)?(?:rate|selling price|selling rate|daam|दाम|रेट)\\s+${number}`))
  ||text.match(new RegExp(`^(.+?)\\s+\\d+(?:\\.\\d+)?\\s+(?:nahi|nahin|नहीं)\\s+${number}\\s+(${unitWords})?`));
 if(correction&&rows.length){
  const targets=rows.filter(row=>canonicalProductName(row.query)===canonicalProductName(correction[1])||row.productId&&matchProducts(correction[1],products.filter(p=>p.id===row.productId)).exact);
  if(targets.length===1){const row=targets[0];if(/rate|price|daam|दाम|रेट/.test(correction[0])){row.sellingPrice=correction[2];row.sellingTotal=undefined;row.priceUnit=canonicalUnit(priceUnitIn(text.slice(correction[0].length))||products.find(p=>p.id===row.productId)?.unit||row.unit);if(row.newProduct)row.newProduct.price=correction[2];}
   else{row.quantity=correction[2];if(correction[3])row.unit=canonicalUnit(correction[3]);}
   return rows.map(row=>normalizePrices(row,products));
  }
  return rows.map(row=>({...validateRow(row,products),issues:[...row.issues,'correction']}));
 }
 // Keep amount phrases with their product, even when comma-separated from it.
 const clauses=text.replace(/[,;]\s*(?=\d+\s*(?:rupaye|rupees|रुपये)|selling|purchase|cost|rate)/g,' ')
  .split(/[,;।]|\b(?:aur|and)\b|और/).map(value=>value.trim()).filter(Boolean);
 let carryCorrection=false;
 for(const clause of clauses){
  let content=(carryCorrection?'nahi ':'')+clause;carryCorrection=/(?:nahi|nahin|नहीं|sorry|actually)\s*$/.test(clause);const prices:Partial<VoiceRow>={};
  const selling=content.match(new RegExp(`(?:selling (?:price|rate)|sale rate|bechni hai|बिक्री दर)\\s*${number}(?:\\s*${rupees})?(?:\\s*${unitWords})?`))
   ||content.match(new RegExp(`${number}\\s*${rupees}\\s*(?:${unitWords}\\s*)?(?:selling (?:price|rate)|bechni hai|bechna|बेचनी है)`));
  if(selling){prices.sellingPrice=selling[1];prices.priceUnit=canonicalUnit(priceUnitIn(selling[0])||'');content=content.replace(selling[0],' ');}
  const sellingTotal=content.match(new RegExp(`(?:total (?:batch )?selling value|batch selling value|कुल बिक्री मूल्य)\\s*${number}(?:\\s*${rupees})?`));
  if(sellingTotal){prices.sellingTotal=sellingTotal[1];content=content.replace(sellingTotal[0],' ');}
  const purchase=content.match(new RegExp(`(?:total (?:batch )?purchase cost|batch cost|कुल खरीद लागत)\\s*${number}(?:\\s*${rupees})?`))
   ||content.match(new RegExp(`(?:total|kul|कुल)\\s*${number}\\s*(?:${rupees})?(?:\\s*(?:mein|में))?\\s*(?:kharidi|kharida|purchase cost|cost|खरीदी|खरीदा)`))
   ||content.match(new RegExp(`${number}\\s*${rupees}\\s*(?:ki|ka|में|mein)?\\s*(?:kharidi|kharida|खरीदी|खरीदा)`));
  const cost=content.match(new RegExp(`(?:purchase cost|cost price|cost rate|खरीद दर)\\s*${number}(?:\\s*${rupees})?(?:\\s*${unitWords})?`));
  if(purchase){prices.purchaseTotal=purchase[1];content=content.replace(purchase[0],' ');}
  else if(cost){prices.purchaseCost=cost[1];prices.costUnit=canonicalUnit(priceUnitIn(cost[0])||'');content=content.replace(cost[0],' ');}
  const unclear=content.match(new RegExp(`${number}\\s*${rupees}(?:\\s*(?:ki|ka|की|का))?`));
  if(unclear){prices.unclearAmount=unclear[1];content=content.replace(unclear[0],' ');}
  content=content.replace(/\b(?:stock mein|stock|mein|rakhna|rakh|selling|price|rate|total|kharidi|kharida)\b|स्टॉक|में|रखना|खरीदी|खरीदा/g,' ');
  const parsed=parseVoiceTranscript(content,products,rows);
  // Existing parser safely supports adjacent numeric items and quantity-only replies.
  const touched=parsed.filter((row,index)=>!rows[index]||row.quantity!==rows[index].quantity||row.query!==rows[index].query);
  if(Object.keys(prices).length&&touched.length!==1){for(const row of touched)row.unclearAmount=prices.unclearAmount||prices.purchaseTotal||prices.sellingPrice||prices.purchaseCost;}
  else if(touched.length===1)Object.assign(touched[0],prices);
  rows.splice(0,rows.length,...parsed);
 }
 return rows.map(row=>{
  // Competing variants stay ambiguous, including an exact base-name match.
  const matches=products.filter(product=>matchProducts(row.query,[product]).exact).map(p=>p.id);
  if(!row.newProduct&&matches.length>1){row.productId='';row.candidates=matches;}
  if(!row.productId&&!row.newProduct&&!row.candidates.length&&row.query&&row.query.length<=100&&!row.issues.includes('correction')){
   row.newProduct=newProductDraft(row);if(!catalogueUnits.includes(canonicalUnit(row.unit) as typeof catalogueUnits[number]))row.newProduct.unit='';
  }
  if(row.productId&&!row.unit)row.unit=products.find(p=>p.id===row.productId)!.unit;
  if(row.newProduct&&row.sellingPrice!==undefined)row.newProduct.price=row.sellingPrice;
  const baseQuantity=stockBaseQuantity(row,products);
  if(row.sellingTotal){const rate=baseQuantity===null?null:exactUnitCost(row.sellingTotal,String(baseQuantity/1000));if(rate!==null){row.sellingPrice=rate;row.priceUnit=products.find(p=>p.id===row.productId)?.unit||row.newProduct?.unit;if(row.newProduct)row.newProduct.price=rate;}else row.unclearAmount=row.sellingTotal;}
  if(row.newProduct&&row.purchaseCost)row.newProduct.cost=row.purchaseCost;
  return normalizePrices(row,products);
 });
}
export function stockBatchItem(row:VoiceRow,products:Product[]):StockBatchItem {
 const product=products.find(p=>p.id===row.productId);
 const pricing={...row.purchaseCost?{purchaseCostPaise:voicePricePaise(row.purchaseCost)!}:{},...row.purchaseTotal?{purchaseTotalPaise:voicePricePaise(row.purchaseTotal)!}:{}};
 const quantity={quantityMilli:minorUnits(row.quantity,3),unit:row.unit};
 if(row.newProduct)return{newProduct:{name:row.newProduct.name.trim(),unit:row.newProduct.unit,pricePaise:voicePricePaise(row.newProduct.price)!,costPaise:row.newProduct.cost?voicePricePaise(row.newProduct.cost)!:0,sku:row.newProduct.sku.trim(),variation:row.newProduct.variation.trim()},...quantity,...pricing};
 return{productId:row.productId,...quantity,...row.sellingPrice!==undefined&&row.sellingPrice!==''?{sellingPricePaise:voicePricePaise(row.sellingPrice)!,previousPricePaise:product!.pricePaise}:{},...pricing};
}
