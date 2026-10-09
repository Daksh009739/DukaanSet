import { minorUnits } from './client';
export type ImportedProduct={name:string;sku:string;unit:string;pricePaise:number;costPaise:number;quantityMilli:number;minStockMilli:number;variation:string};
/** Small CSV parser: quoted commas/newlines and doubled quotes; no expressions are evaluated. */
export function parseProductsCsv(raw:string):ImportedProduct[]{
  if(raw.length>262144)throw new Error('CSV_SIZE');const rows:string[][]=[];let row:string[]=[],field='',quoted=false,closed=false;
  const endField=()=>{row.push(field.trim());field='';closed=false;};const endRow=()=>{endField();if(row.some(value=>value!==''))rows.push(row);row=[];if(rows.length>101)throw new Error('CSV_LIMIT');};
  const text=raw.replace(/^\uFEFF/,'').replace(/\r\n/g,'\n').replace(/\r/g,'\n');
  for(let i=0;i<text.length;i++){const c=text[i];if(quoted){if(c==='"'){if(text[i+1]==='"'){field+='"';i++;}else{quoted=false;closed=true;}}else field+=c;}else if(c===',')endField();else if(c==='\n')endRow();else if(c==='"'){if(field.trim()||closed)throw new Error('CSV_FORMAT');quoted=true;}else if(closed&&c.trim())throw new Error('CSV_FORMAT');else field+=c;}
  if(quoted)throw new Error('CSV_FORMAT');if(field||row.length)endRow();
  const headers=rows.shift()?.map(value=>value.toLowerCase())||[],allowed=['name','sku','unit','price','cost','stock','min_stock','variant'];
  if(new Set(headers).size!==headers.length||headers.some(key=>!allowed.includes(key))||!['name','unit','price'].every(key=>headers.includes(key))||!rows.length)throw new Error('CSV_FORMAT');
  return rows.map(values=>{if(values.length!==headers.length)throw new Error('CSV_FORMAT');const data=Object.fromEntries(headers.map((key,index)=>[key,values[index]]));if(!data.name||data.name.length>100||!data.unit||!data.price)throw new Error('CSV_FORMAT');try{return {name:data.name,sku:data.sku||'',unit:data.unit,pricePaise:minorUnits(data.price),costPaise:minorUnits(data.cost||'0'),quantityMilli:minorUnits(data.stock||'0',3),minStockMilli:minorUnits(data.min_stock||'5',3),variation:data.variant||''};}catch{throw new Error('CSV_FORMAT');}});
}
