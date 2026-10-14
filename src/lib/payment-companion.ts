import type {Language} from './contracts';

export type LinkReason='reliablePayer'|'merchantConfirmed'|'invoiceReference'|'allocationConfirmed'|'legacyAssociation'|'unlinked';
export interface PaymentLinkExplanation {reason:LinkReason;at:string|null;reference:string|null;canCorrect:boolean}
export interface OverdueCustomer {id:string;name:string;phoneSuffix:string;amountPaise:number;oldestDueDate:string;daysOverdue:number;invoiceCount:number}
export interface PaymentInsights {canReviewCustomers:boolean;day:string;timezone:string;testMode:boolean;verifiedNetPaise:number;receiptCount:number;unidentifiedCount:number;unallocatedCount:number;overdue:OverdueCustomer[];longPendingCount:number;patterns:{transactionIds:string[];count:number;amountPaise:number;startedAt:string;endedAt:string}[]}
export interface ReminderContext {customerId:string;name:string;phone:string;optedOut:boolean;overduePaise:number;oldestDueDate:string|null;invoiceCount:number;day:string;timezone:string;preferences:{consent:boolean;channel:'none'|'manual';language:Language;revision:number};eligible:boolean}
export interface ReminderPreview {message:string;amountPaise:number;invoiceCount:number;asOf:string;delivery:'manual';sent:false}
