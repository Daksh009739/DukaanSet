import {z} from 'zod';
export type CaptureKind='stock'|'sale'|'purchase';
export type CaptureScope='inventory'|'sales'|'purchases';
const amount=z.string().regex(/^\d{1,9}(?:\.\d{1,2})?$/).nullable();
const label=z.string().max(160).nullable();
export const extractionSchema=z.object({
 documentType:z.enum(['stock','sale','purchase','unknown']),sourceText:z.string().max(20000),
 billNumber:z.string().max(80).nullable(),documentDate:z.string().max(10).nullable(),partyName:label,
 subtotal:amount,discount:amount,tax:amount,total:amount,
 items:z.array(z.object({originalText:z.string().max(1000),name:label,quantity:z.string().regex(/^\d{1,7}(?:\.\d{1,3})?$/).nullable(),unit:z.string().max(30).nullable(),unitPrice:amount,priceUnit:z.string().max(30).nullable(),rateType:z.enum(['selling','purchase','unknown']),lineTotal:amount,uncertain:z.array(z.enum(['name','quantity','unit','price','type','unreadable'])).max(6)}).strict()).max(100),
 unreadable:z.array(z.string().max(500)).max(100)
}).strict();
export type CaptureExtraction=z.infer<typeof extractionSchema>;
export interface CaptureRow{productId:string;name:string;quantity:string;unit:string;price:string;priceUnit:string;rateType:'selling'|'purchase'|'none'|'unknown';newSellingPrice:string;service:boolean;originalText:string;lineTotal:string}
export interface CaptureReview{kind:CaptureKind;rows:CaptureRow[];partyId:string;billNumber:string;documentDate:string;discount:string;sourceTax:string;statedTotal:string;finalRatesConfirmed:boolean}
export interface CaptureRecord{id:string;scope:CaptureScope;status:'uploaded'|'extracting'|'review'|'failed'|'committed';filename:string;createdAt:string;extraction:CaptureExtraction|null;review:CaptureReview|null;result:{kind:CaptureKind;id:string;href:string}|null}
export interface CapturePreview{kind:CaptureKind;totalPaise:number|null;discountPaise:number;rows:{name:string;productId:string;unit:string;quantityMilli:number;pricePaise:number|null;rateType:CaptureRow['rateType'];sellingPricePaise:number;priorSellingPricePaise:number|null;beforeMilli:number|null;afterMilli:number|null}[];reviewHash:string}
