import type { Product } from '../contracts';

export type VoiceProduct = Product;
export type RowIssue = 'unknown' | 'ambiguous' | 'quantity' | 'unit' | 'conversion' | 'whole' | 'limit' | 'correction';
export interface VoiceRow { id: string; query: string; productId: string; candidates: string[]; quantity: string; unit: string; quantityMilli: number | null; issues: RowIssue[]; source: 'voice' | 'manual' }
export interface VoiceDraft { version: 1; key: string; transcript: string; applied: string; rows: VoiceRow[]; updatedAt: number; submitted?: { source:'voice'|'manual'|'mixed'; items:{productId:string;quantityMilli:number}[] } }

const synonyms: Record<string, string> = {
  doodh:'milk', dudh:'milk', दूध:'milk', dal:'dal', daal:'dal', दाल:'dal', lentils:'dal', lentil:'dal',
  pyaz:'onion', pyaaz:'onion', प्याज:'onion', प्याज़:'onion', onions:'onion', aloo:'potato', alu:'potato', आलू:'potato', potatoes:'potato',
  chawal:'rice', चावल:'rice', atta:'flour', आटा:'flour', tamatar:'tomato', टमाटर:'tomato', tomatoes:'tomato',
  biscuits:'biscuit', बिस्कुट:'biscuit', चीनी:'sugar', cheeni:'sugar', chini:'sugar', नमक:'salt', namak:'salt',
};
const numbers: Record<string, number> = {
  zero:0, one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19,twenty:20,thirty:30,forty:40,fifty:50,sixty:60,seventy:70,eighty:80,ninety:90,hundred:100,
  ek:1,do:2,teen:3,char:4,chaar:4,panch:5,paanch:5,chhe:6,che:6,saat:7,aath:8,nau:9,das:10,gyarah:11,barah:12,bees:20,pachas:50,sau:100,
  शून्य:0,एक:1,दो:2,तीन:3,चार:4,पांच:5,पाँच:5,छह:6,सात:7,आठ:8,नौ:9,दस:10,ग्यारह:11,बारह:12,बीस:20,पचास:50,सौ:100,
  half:0.5,aadha:0.5,adha:0.5,आधा:0.5,आधे:0.5,dedh:1.5,डेढ़:1.5,डेढ:1.5,dhai:2.5,ढाई:2.5,
  terah:13,chaudah:14,pandrah:15,solah:16,satrah:17,atharah:18,unnis:19,ikkis:21,baees:22,teis:23,chaubis:24,pachis:25,pachees:25,tees:30,chaalis:40,sath:60,sattar:70,assi:80,nabbe:90,dhaai:2.5,
  तेरह:13,चौदह:14,पंद्रह:15,पन्द्रह:15,सोलह:16,सत्रह:17,अठारह:18,उन्नीस:19,इक्कीस:21,बाईस:22,तेईस:23,चौबीस:24,पच्चीस:25,तीस:30,चालीस:40,साठ:60,सत्तर:70,अस्सी:80,नब्बे:90,
};
const units: Record<string,string> = {
  kg:'kg',kgs:'kg',kilo:'kg',kilos:'kg',kilogram:'kg',kilograms:'kg',किलो:'kg',किलोग्राम:'kg',
  g:'g',gm:'g',gms:'g',gram:'g',grams:'g',ग्राम:'g',
  l:'litre',liter:'litre',liters:'litre',litre:'litre',litres:'litre',लीटर:'litre',लीटरों:'litre',
  ml:'ml',milliliter:'ml',millilitres:'ml',मिलीलीटर:'ml',
  piece:'piece',pieces:'piece',pcs:'piece',unit:'piece',units:'piece',पीस:'piece',नग:'piece',
  packet:'packet',packets:'packet',pack:'packet',packs:'packet',पैकेट:'packet',पैकेट्स:'packet',
  box:'box',boxes:'box',डिब्बा:'box',डिब्बे:'box',बॉक्स:'box',
  dozen:'dozen',dozens:'dozen',darjan:'dozen',दर्जन:'dozen',
  m:'metre',meter:'metre',meters:'metre',metre:'metre',metres:'metre',मीटर:'metre',
};
const noise = new Set('bhai please add stock jodo jod जोड़ जोड़ो जोड़ जोड़ो kar karo karna karni kardo do de dena karado bhi aur and ke ka ki ko mein hai se quantity of the a an hata hatao remove delete sorry nahi nahin no actually instead badlo change update make quantity कर करो देना दो के का की को भी और है से मात्रा हटा हटाओ नहीं माफ'.split(' '));

export function normalize(value: string): string {
  return value.normalize('NFKC').toLowerCase().replace(/[०-९]/g, character=>String(character.charCodeAt(0)-2406)).replace(/[।,;!?…]/g,' ').replace(/(?<!\d)\.|\.(?!\d)/g,' ').replace(/[^\p{L}\p{M}\p{N}.\s-]/gu,' ').replace(/\s+/g,' ').trim();
}
function canonical(value:string):string { return normalize(value).split(' ').map(token=>synonyms[token]||token).join(' '); }
export function canonicalUnit(value:string):string { return units[normalize(value)]||normalize(value); }
function editDistance(a:string,b:string):number { const row=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){let last=row[0];row[0]=i;for(let j=1;j<=b.length;j++){const prior=row[j];row[j]=Math.min(row[j]+1,row[j-1]+1,last+(a[i-1]===b[j-1]?0:1));last=prior;}}return row[b.length]; }
export function matchProducts(query:string, products:VoiceProduct[]):{ids:string[];exact:boolean} {
  const target=canonical(query);if(!target)return{ids:[],exact:false};
  const labels=products.map(product=>({id:product.id, labels:[product.name,...product.variation?[`${product.name} ${product.variation}`]:[],...product.aliases||[]].map(canonical)}));
  const exact=labels.filter(product=>product.labels.includes(target)).map(product=>product.id);
  if(exact.length)return{ids:exact,exact:true};
  const tokens=target.split(' ');
  const partial=labels.filter(product=>product.labels.some(label=>tokens.every(token=>label.split(' ').includes(token)))).map(product=>product.id);
  if(partial.length)return{ids:partial,exact:true};
  // Catalog labels are bounded; avoid quadratic fuzzy work on pasted paragraphs.
  if(target.length>100)return{ids:[],exact:false};
  const phonetic=(word:string)=>word.replace(/[aeiou]/g,'').replace(/(.)\1+/g,'$1');
  const fuzzy=labels.filter(product=>product.labels.some(label=>label.split(' ').some(token=>target.length>=4&&(editDistance(token,target)<=(target.length>=7?2:1)||(target.length>=5&&phonetic(token)===phonetic(target)))))).map(product=>product.id);
  return{ids:fuzzy,exact:false};
}

function extractNumber(tokens:string[]):{value:string;indices:number[]} {
  // A correction such as "2 se 3 kilo" uses the clear new value after se/from.
  const separator=tokens.findIndex(token=>token==='se'||token==='से'||token==='to');
  const start=separator>=0?separator+1:0;
  for(let i=start;i<tokens.length;i++){
    const token=tokens[i];let value:number;
    if((token==='do'||token==='दो')&&['kar','karo','add','jodo','जोड़','जोड़ो','कर'].includes(tokens[i-1]))continue;
    if(['size','model','साइज','मॉडल'].includes(tokens[i-1]))continue;
    if(/^-?\d+(?:\.\d+)?$/.test(token))value=Number(token);
    else if(Object.hasOwn(numbers,token))value=numbers[token];else continue;
    const indices=[i];
    if(tokens[i+1]==='hundred'||tokens[i+1]==='sau'||tokens[i+1]==='सौ'){value*=100;indices.push(i+1);if(numbers[tokens[i+2]]!==undefined){value+=numbers[tokens[i+2]];indices.push(i+2);}}
    else if(value>=20&&value%10===0&&numbers[tokens[i+1]]>0&&numbers[tokens[i+1]]<10){value+=numbers[tokens[i+1]];indices.push(i+1);}
    if(separator>=0){for(let j=0;j<separator;j++)if(numbers[tokens[j]]!==undefined||/^\d/.test(tokens[j]))indices.push(j);}
    return{value:String(value),indices};
  }
  return{value:'',indices:[]};
}
export function validateRow(row:VoiceRow, products:VoiceProduct[]):VoiceRow {
  const issues:RowIssue[]=[];const product=products.find(item=>item.id===row.productId);
  if(!product)issues.push(row.candidates.length?'ambiguous':'unknown');
  if(!/^\d+(?:\.\d{1,3})?$/.test(row.quantity)||Number(row.quantity)<=0)issues.push('quantity');
  if(!row.unit)issues.push('unit');
  if(!issues.includes('quantity')&&['piece','packet','box','pair','bottle'].includes(canonicalUnit(row.unit))&&Number(row.quantity)%1!==0)issues.push('whole');
  let quantityMilli:number|null=null;
  if(product&&!issues.includes('quantity')&&row.unit){
    const base=canonicalUnit(product.unit),spoken=canonicalUnit(row.unit);let factor:number|undefined;
    if(spoken===base)factor=1000;
    else if(base==='kg'&&spoken==='g')factor=1;
    else if(base==='g'&&spoken==='kg')factor=1_000_000;
    else if(base==='litre'&&spoken==='ml')factor=1;
    else if(base==='ml'&&spoken==='litre')factor=1_000_000;
    else if(base==='piece'&&spoken==='dozen')factor=12000;
    else if(product.packSize&&['box','packet'].includes(spoken)&&base!=='box')factor=product.packSize*1000;
    if(!factor)issues.push('conversion');
    else{const [whole,fraction='']=row.quantity.split('.');const numerator=(BigInt(whole)*1000n+BigInt(fraction.padEnd(3,'0')))*BigInt(factor);quantityMilli=Number(numerator/1000n);if(numerator%1000n!==0n||!Number.isSafeInteger(quantityMilli)||quantityMilli<=0||quantityMilli>1_000_000_000)issues.push('limit');else if(['piece','packet','box','pair','bottle'].includes(base)&&quantityMilli%1000!==0&&!issues.includes('whole'))issues.push('whole');}
  }
  return{...row,issues,quantityMilli:issues.length?null:quantityMilli};
}
function rowFrom(clause:string,products:VoiceProduct[],index:number):VoiceRow {
  const tokens=normalize(clause).replace(/(\d)(kg|gm|grams?|ml|litres?)\b/g,'$1 $2').split(' ');const amount=extractNumber(tokens);
  const unitIndices=tokens.map((token,index)=>units[token]?index:-1).filter(index=>index>=0);const adjacent=amount.indices.length?Math.max(...amount.indices)+1:-1;const unitIndex=unitIndices.includes(adjacent)?adjacent:unitIndices.at(-1)??-1;const unit=unitIndex>=0?units[tokens[unitIndex]]:'';
  const query=tokens.filter((token,i)=>!amount.indices.includes(i)&&i!==unitIndex&&!noise.has(token)&&!(numbers[token]!==undefined&&i<(tokens.indexOf('se')>=0?tokens.indexOf('se'):0))).join(' ').replace(/(\d)\s+(ml|g)\b/g,'$1$2');
  const matches=matchProducts(query,products);const productId=matches.ids.length===1&&matches.exact?matches.ids[0]:'';
  return validateRow({id:`spoken-${index}`,query,productId,candidates:matches.ids,quantity:amount.value,unit,quantityMilli:null,issues:[],source:'voice'},products);
}

export function parseVoiceTranscript(transcript:string, products:VoiceProduct[], existing:VoiceRow[]=[]):VoiceRow[] {
  const rows=existing.map(row=>({...row}));
  // Split correction markers before punctuation is normalized, retaining their intent.
  const clauses=transcript.replace(/\b(no|nahi|nahin|sorry|actually|instead)\b|नहीं|माफ/gi,'|CORRECT|').replace(/[।,;!\n…]+|\.{2,}|\b(?:aur|and)\b|और/gi,'|').split('|').map(value=>value.trim()).filter(Boolean).flatMap(clause=>{
    if(clause==='CORRECT'||/\b(?:quantity|se|change)\b|मात्रा|से/.test(clause))return[clause];
    const tokens=clause.split(/\s+/);const parts:string[]=[];let current:string[]=[];
    for(const token of tokens){const value=normalize(token);const prior=normalize(current.at(-1)||'');const numeric=/^-?\d+(?:\.\d+)?$/.test(value)||numbers[value]!==undefined;const commandDo=(value==='do'||value==='दो')&&['kar','karo','add','jodo','जोड़','जोड़ो','कर'].includes(prior);const compound=numbers[prior]!==undefined||(prior==='a'&&value==='half');
      if(numeric&&!commandDo&&!compound&&current.length){const parsed=rowFrom(current.join(' '),products,0);if(parsed.quantity&&parsed.query){parts.push(current.join(' '));current=[];}}
      current.push(token);
    }if(current.length)parts.push(current.join(' '));return parts;
  });
  let correction=false;let addedThisPass=false;
  for(const clause of clauses){
    if(clause==='CORRECT'){correction=true;continue;}
    const normalized=normalize(clause);const removal=/\b(?:hata|hatao|remove|delete)\b|हटा|हटाओ/.test(normalized);const explicitChange=/\b(?:badlo|change|update|quantity)\b|मात्रा/.test(normalized);
    const next=rowFrom(clause,products,rows.length);
    if(!next.query&&!next.quantity&&!next.unit)continue;
    const same=rows.map((row,index)=>({row,index})).filter(({row})=>next.query&&(canonical(row.query)===canonical(next.query)||(next.productId&&row.productId===next.productId)));
    if(removal){if(same.length===1)rows.splice(same[0].index,1);else rows.push({...next,issues:['correction'],productId:''});correction=false;continue;}
    if(correction||explicitChange||(!next.query&&next.quantity)){
      let target=same.length===1?same[0].index:-1;
      if(target<0&&!next.query){const incomplete=rows.map((row,index)=>({row,index})).filter(({row})=>row.issues.includes('quantity')||row.issues.includes('unit'));if(incomplete.length===1)target=incomplete[0].index;else if(correction&&rows.length&&(rows.length===1||addedThisPass))target=rows.length-1;}
      if(target>=0){const prior=rows[target];rows[target]=validateRow({...prior,quantity:next.quantity||prior.quantity,unit:next.unit||prior.unit},products);}else rows.push({...next,issues:['correction'],productId:''});
    }else{rows.push(next);addedThisPass=true;}
    correction=false;
  }
  return rows.map((row,index)=>({...row,id:`row-${index}`}));
}

export function newVoiceDraft():VoiceDraft { return{version:1,key:globalThis.crypto.randomUUID(),transcript:'',applied:'',rows:[],updatedAt:Date.now()}; }
export function draftStorageKey(userId:string,businessId:string):string {return`ds-voice-draft-${userId}-${businessId}`;}

/** Replace indexed interim/final results rather than appending repeated recognizer events. */
export class TranscriptCollector {
  private segments=new Map<number,{text:string;final:boolean}>();
  update(index:number,text:string,final:boolean){this.segments.set(index,{text,final});}
  get text(){return[...this.segments].sort((a,b)=>a[0]-b[0]).map(([,segment])=>segment.text).join(' ').trim();}
  get finalText(){return[...this.segments].sort((a,b)=>a[0]-b[0]).filter(([,segment])=>segment.final).map(([,segment])=>segment.text).join(' ').trim();}
}
