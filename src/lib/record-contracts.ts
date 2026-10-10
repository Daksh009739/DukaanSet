import type {Product,Purchase,Supplier} from './contracts';
export interface InvoiceHistoryResult {invoices:import('./contracts').Invoice[];total:number;hasMore:boolean;totals:{salesPaise:number;receivedPaise:number;pendingPaise:number}}
export type RecordType='product'|'customer'|'purchase'|'supplier'|'payment';
export interface HistoryEntry { id:string;date:string;kind:string;label:string;amountPaise:number|null;quantityMilli:number|null;unit:string;href:string|null;reference?:string;status?:string;method?:string;items?:{name:string;quantityMilli:number;unit:string}[] }
export interface RecordHistory {entries:HistoryEntry[];total:number;offset:number;hasMore:boolean}
export interface RecordDetail {
 type:RecordType;product?:Product;purchase?:Purchase;supplier?:(Supplier&{purchasesPaise:number;paidPaise:number;purchaseCount:number});
 payment?:{id:string;partyId:string|null;partyName:string;partyType:'customer'|'supplier';invoiceId:string|null;purchaseId:string|null;amountPaise:number;method:string;date:string;kind:string;reference:string;allocations:{id:string;reference:string;amountPaise:number;href:string}[]};
}
