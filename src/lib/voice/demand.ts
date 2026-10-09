export interface SpokenDemand { productName:string;variant:string;unit:string;quantityMilli:number|null;observedPeopleCount:number|null }
const numbers:Record<string,number>={one:1,two:2,three:3,four:4,five:5,ek:1,do:2,teen:3,char:4,paanch:5,'एक':1,'दो':2,'तीन':3,'चार':4,'पांच':5};
const value=(token:string)=>numbers[token.toLowerCase()]??(/^\d+(?:\.\d{1,3})?$/.test(token)?Number(token):null);
export function parseDemandSpeech(raw:string):SpokenDemand{
  const text=raw.trim().slice(0,1000).replace(/[०-९]/g,c=>String('०१२३४५६७८९'.indexOf(c)));
  const people=text.match(/(\d+|one|two|three|four|five|ek|do|teen|char|paanch|एक|दो|तीन|चार|पांच)\s+(?:customers?|log|grahak|ग्राहक)/i);
  const quantity=text.match(/(?:^|\s)([-+−]?\d+(?:\.\d+)?|one|two|three|four|five|ek|do|teen|char|paanch|एक|दो|तीन|चार|पांच)\s+(pieces?|pcs|packets?|kg|kilograms?|litres?|meters?|किलो|पीस|पैकेट)(?=\s|[,.।]|$)/i);
  const unitToken=quantity?.[2]?.toLowerCase();const unit=unitToken&&/kg|kilogram|किलो/.test(unitToken)?'kg':unitToken&&/litre/.test(unitToken)?'litre':unitToken&&/meter/.test(unitToken)?'meter':unitToken&&/packet|पैकेट/.test(unitToken)?'packet':'piece';
  const variant=text.match(/\b(?:XXL|XL|XS|S|M|L)\b|\b\d+(?:\.\d+)?\s*[- ]?inch\b|\d+\s*इंच/i)?.[0]||'';
  const productName=text.replace(people?.[0]||/a^/,'').replace(quantity?.[0]||/a^/,'').replace(/\b(?:aaj|today|ne|asked|for|maangi|maanga|manga|available|nahi|thi|tha|not|unavailable|the|was|hai)\b|आज|ने|मांगी|मांगा|नहीं|उपलब्ध|था|थी/gi,' ').replace(/\s+/g,' ').trim();
  const amount=quantity?value(quantity[1]):null;
  return {productName,variant,unit,quantityMilli:amount!==null?Math.round(amount*1000):null,observedPeopleCount:people?value(people[1]):null};
}
