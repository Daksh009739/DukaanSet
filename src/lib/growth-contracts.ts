import type {Category,VoiceReport} from './contracts';
import type {BusinessConfiguration} from './v3-contracts';
export type ActivityKind='order'|'appointment';
export type ActivityStatus='scheduled'|'in_progress'|'completed'|'cancelled';
export interface BusinessActivity{id:string;kind:ActivityKind;label:string;customerId:string|null;customerName:string;scheduledAt:string;endsAt:string|null;tableLabel:string;status:ActivityStatus;revision:number;createdAt:string}
export interface BusinessMode{category:Category;orders:boolean;appointments:boolean;revision:number}
export interface ShopSummary{day:string;timezone:string;category:Category;demo:boolean;upiTestMode:boolean;report:VoiceReport;outstandingPaise:number|null;verifiedUpiPaise:number|null;unmatched:number|null;lowStock:number|null;ordersToday:number|null;bookingsTomorrow:number|null;actions:{kind:'overdue'|'unmatched'|'stock'|'orders'|'appointments';count:number;href:string}[]}
export interface TrustOverview{serverAnsweredAt:string;demo:boolean;emailVerified:boolean;role:string;permissions:BusinessConfiguration['permissions'];backup:{status:'unreported'};checkoutAvailable:false;referralCode:string|null;mode:BusinessMode;audit:{id:string;action:string;date:string}[];canExport:boolean}
