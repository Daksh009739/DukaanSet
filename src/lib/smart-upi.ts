export type UpiState='saved'|'verified'|'active'|'paused'|'disconnected';
export type UpiStatus='pending'|'successful'|'failed'|'refunded';
export interface UpiDestination{id:string;masked:string;payee:string;primary:boolean;state:UpiState;createdAt:string}
export interface UpiConnection{id:string;provider:'razorpay';masked:string;state:UpiState;mode:'test'|'live';lastSync:string|null;revocationPending:boolean;capabilities:{tracking:boolean;history:boolean;dynamicQr:boolean;settlements:boolean;refunds:boolean}}
export interface UpiTransaction{id:string;reference:string;bankReference:string;amountPaise:number;refundedPaise:number;netPaise:number;occurredAt:string;observedAt:string;status:UpiStatus;verified:boolean;mode:'test'|'live'|null;canReconcile:boolean;payerKey:string|null;maskedPayer:string;customerId:string|null;customerName:string;providerName:string;original:{reference:string;bankReference:string;amountPaise:number;status:string;occurredAt:string;observedAt:string};allocatedPaise:number;advancePaise:number;unallocatedPaise:number;needsReview:boolean;allocations:{id:string;category:string;amountPaise:number;reversedPaise:number;invoiceId:string|null;paymentId:string|null}[]}
export interface UpiSummary{timezone:string;today:string;collectedPaise:number;successful:number;unmatched:number;refundsPaise:number;testMode:boolean}
export interface UpiCentre{destinations:UpiDestination[];connections:UpiConnection[];providerAvailable:boolean;canManage:boolean;summary:UpiSummary;transactions:UpiTransaction[];total:number;payers:{transactionId:string;key:string;masked:string;count:number;netPaise:number;lastAt:string;customerId:string|null;customerName:string;providerName:string}[]}
export interface MerchantProfile{phone:string;avatarUrl:string|null;revision:number;sessionCount:number;plan:{available:boolean};shop:{name:string;category:string;location:string;contact:string;logo:string}}
export interface CustomerUpiSummary{timezone:string;testMode:boolean;count:number;netPaise:number;advancePaise:number;lastAt:string|null;transactions:UpiTransaction[]}
/** QR extraction is destination parsing, never identity or bank-access verification. */
export function parseUpiDestination(raw:string){
 let upiId=raw.trim(),payee='';
 if(/^upi:/i.test(upiId)){const url=new URL(upiId);if(url.protocol.toLowerCase()!=='upi:'||url.hostname.toLowerCase()!=='pay'||url.pathname&&url.pathname!=='/'||url.searchParams.getAll('pa').length!==1||url.searchParams.getAll('pn').length>1||url.searchParams.has('cu')&&url.searchParams.get('cu')!=='INR')throw Error('UPI_INVALID');upiId=url.searchParams.get('pa')||'';payee=url.searchParams.get('pn')||'';}
 if(!/^[A-Za-z0-9][A-Za-z0-9._-]{1,99}@[A-Za-z0-9][A-Za-z0-9.-]{1,29}$/.test(upiId)||/[\u0000-\u001F\u007F]/.test(payee)||payee.length>160)throw Error('UPI_INVALID');
 return{upiId:upiId.toLowerCase(),payee};
}
export function maskUpi(value:string){const [name,handle]=value.split('@');return handle?name.slice(0,2)+'•••@'+handle:value.slice(0,4)+'•••'+value.slice(-4);}
