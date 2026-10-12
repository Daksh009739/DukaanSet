import type {V3State} from '../v3-contracts';
import type {VoiceCommand} from './os';
import {detectIntent,resolveVoiceProduct,spokenText} from './os';
import {canonicalUnit,catalogueUnits,voicePricePaise} from './parser';
import {prepareStockCommand} from './stock-command';

const creation=/(?:product|item|utpaad|प्रोडक्ट|उत्पाद)\b|प्रोडक्ट|उत्पाद/iu;
const action=/add|create|new|naya|bana|jod|नया|बना|जोड़/iu;
const unitPattern=/(?:^|\s)(kg|kilos?|kilograms?|g|grams?|packets?|pieces?|pcs|box|litres?|ml|metres?|meter|bag|किलो|ग्राम|पैकेट|पीस|लीटर)(?=\s|$)/iu;
const generic=/^(?:best|accha|achha|sabse accha|सबसे अच्छा|अच्छा)\s+(?:product|item|प्रोडक्ट|उत्पाद)/iu;
function productName(raw:string){
 const declaration=raw.match(/^\s*(.+?)\s+(?:naam (?:ka|ki)|नाम (?:का|की))\s+(?:product|item|प्रोडक्ट|उत्पाद)/iu)
  ||raw.match(/(?:product|item|प्रोडक्ट|उत्पाद)\s+(?:named|called|naam|नाम)\s+(.+?)(?=\s+(?:add|create|selling|price|unit|जोड़)|[,;।]|$)/iu)
  ||raw.match(/(?:product (?:ka )?naam|product name|the name|naam|नाम)\s+(?:is\s+)?(.+?)(?=\s+(?:hai|है|selling|price|unit)|[,;।]|$)/iu);
 const source=declaration?.[1]||raw;
 if(declaration)return source.replace(/[.!।]+$/,'').trim();
 return source.replace(/\b(?:add|create|make|a|an|the|new|naya|naye|ek|product|item|karo|karna|kar|do|bana|banao|banana|hai|naam|ka|ki|name|is|please)\b|प्रोडक्ट|उत्पाद|नया|नए|जोड़ो|जोड़|बनाओ|बना|करना|करो|है|नाम|का|की|एक/giu,' ').replace(/\s+/g,' ').replace(/[.!।]+$/,'').trim();
}
/** A catalog product has explicit price/unit and zero opening stock; stock batches use their existing engine. */
export function prepareCatalogueCommand(raw:string,state:V3State,previous?:VoiceCommand):VoiceCommand|null{
 const text=spokenText(raw),continuing=['catalogueProduct','productMeaning'].includes(previous?.fields.operation||''),declared=/(?:naam|named|called|name|नाम)/iu.test(raw);
 const requested=creation.test(raw)&&action.test(raw);
 if(!requested&&!continuing)return null;
 const detected=detectIntent(raw);if(continuing&&!['stock','unknown'].includes(detected))return null;
 if(/recommend|suggest|sujhao|सुझा|recommendation/.test(text))return null;
 if(!continuing&&/bill|invoice|sold|bech|purchase|supplier|बिल|बेच|खरीद|सप्लायर/iu.test(raw))return null;
 // Explicit opening quantities belong to the atomic product+stock draft.
 if(/\d+(?:\.\d+)?\s+(?:kg|kilo|packet|piece|box|litre|किलो|पैकेट|पीस)/iu.test(text)&&!/selling price|selling rate|unit price|बिक्री दर/.test(text)){
  if(!continuing||!previous?.fields.name)return null;
  const rows=prepareStockCommand(previous.fields.name+' '+raw,state.products);if(rows.length!==1)return null;
  const row=rows[0];if(row.newProduct){row.newProduct.price=previous.fields.price||'';row.sellingPrice=row.newProduct.price;}
  return{intent:'stock',transcript:raw,fields:{preparedItems:'true',['newUnit.'+row.id]:previous.fields.unit||row.unit},items:[{id:row.id,query:row.query,productId:row.productId,candidates:row.candidates,quantity:row.quantity,unit:row.unit,price:row.sellingPrice||'',priceBasis:row.sellingPrice?'unit':''}],changed:['operation'],changedItems:[row.id],warnings:state.configuration.permissions.inventory?[]:['permission']};
 }
 const fields:Record<string,string>={...continuing?previous?.fields:{},operation:'catalogueProduct'};
 if(generic.test(text)&&!declared)fields.operation='productMeaning';
 const unit=text.match(unitPattern)?.[1],price=text.match(/(?:selling price|selling rate|price|rate|daam|दाम|बिक्री दर)\s*(\d+(?:\.\d{1,2})?)/iu)?.[1]
  ||text.match(/(\d+(?:\.\d{1,2})?)\s*(?:rupaye|rupees|रुपये)(?:\s+(?:per|prati|प्रति))?/iu)?.[1];
 if(unit)fields.unit=canonicalUnit(unit);
 if(price!==undefined)fields.price=price;
 if(continuing&&fields.name&&fields.unit&&fields.price===undefined&&/^\d+(?:\.\d{1,2})?$/.test(text))fields.price=text;
 if(fields.operation==='catalogueProduct'){
  const stripped=raw.replace(/(?:selling price|selling rate|price|rate|daam|दाम|बिक्री दर).*$/iu,'').replace(/₹\s*\d+(?:\.\d{1,2})?.*$/u,'');
  if(requested||declared||continuing&&!previous?.fields.name&&!unit&&!price){const name=productName(stripped);if(name&&!/^\d+$/.test(name)&&!unitPattern.test(name))fields.name=name;}
  if(fields.name){const match=resolveVoiceProduct(fields.name,state.products);fields.existingProductId=match.exact&&match.ids.length===1?match.ids[0]:'';}
 }
 return{intent:'stock',transcript:raw,fields,items:[],changed:Object.keys(fields),changedItems:[],warnings:state.configuration.permissions.inventory&&state.configuration.features.voiceStock?[]:['permission']};
}
export function catalogueQuestion(command:VoiceCommand){
 if(command.fields.operation==='productMeaning')return'productMeaning';
 if(command.fields.operation!=='catalogueProduct')return null;
 if(!command.fields.name)return'productName';
 if(command.fields.existingProductId)return'productExists';
 if(!catalogueUnits.includes(canonicalUnit(command.fields.unit||'') as typeof catalogueUnits[number]))return'productUnit';
 if(voicePricePaise(command.fields.price||'')===null)return'productPrice';
 return'';
}
