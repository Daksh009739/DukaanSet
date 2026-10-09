import type { BusinessState, Category } from './contracts';
export const moduleKeys = ['voiceStock','photoSales','demandPulse','todaysWork','assistant','dailyClosing','expiryTracking','wastageTracking','variants','unitConversion'] as const;
export type ModuleKey = typeof moduleKeys[number];
export type Features = Record<ModuleKey,boolean>;
export const permissionKeys = ['sales','customers','payments','inventory','purchases','reports','demand','settings','team'] as const;
export type Permission = typeof permissionKeys[number];
export type Permissions = Record<Permission,boolean>;
export type Role = 'owner'|'manager'|'staff';
export type DemandStatus = 'open'|'ordered'|'available'|'contacted'|'converted'|'closed'|'cancelled';
export interface DemandFollowUp { id:string; channel:'phone'|'whatsapp'|'manual'; date:string; actorName:string }
export interface DemandConversion { id:string; invoiceId:string; invoiceNumber:string; productId:string; quantityMilli:number; amountPaise:number; date:string; reversed:boolean }
export interface DemandRequest { id:string; productId:string|null; productName:string; variant:string; unit:string; quantityMilli:number; customerId:string|null; customerName:string; customerPhone:string; contactPermission:boolean; observedPeopleCount:number|null; notes:string; date:string; status:DemandStatus; stockMilli:number; matched:boolean; remainingMilli:number; eligibleFollowUp:boolean; followUps:DemandFollowUp[]; conversions:DemandConversion[] }
export interface DemandGroup { key:string; productId:string|null; productName:string; variant:string; unit:string; requestCount:number; quantityMilli:number; uniqueCustomers:number; reportedPeople:number; stockMilli:number; pendingOrderMilli:number; recentSoldMilli:number; minStockMilli:number; suggestedMilli:number; matched:boolean; dismissed:boolean; requestIds:string[] }
export interface ReorderDraft { id:string; productId:string; productName:string; variant:string; unit:string; quantityMilli:number; supplierId:string|null; supplierName:string; costPaise:number; status:'draft'|'received'|'cancelled'; requestIds:string[]; date:string; purchaseId:string|null }
export interface DemandSummary { requests:number; openRequests:number; products:number; identifiedCustomers:number; availableRequests:number; readyFollowUps:number; convertedRequests:number; recoveredPaise:number; groups:DemandGroup[]; requestsList:DemandRequest[]; orders:ReorderDraft[] }
export interface BusinessConfiguration { features:Features; role:Role; permissions:Permissions; notificationPreferences:{stock:boolean;credit:boolean;demand:boolean}; location:string; contact:string; revision:number }
export interface TeamMember { userId:string; name:string; email:string; role:Role; permissions:Permissions }
export interface V3State extends BusinessState { configuration:BusinessConfiguration; demand:DemandSummary }
export function featureDefaults(category:Category, legacy=false):Features { return {voiceStock:true,photoSales:legacy||['clothing','mobile','general'].includes(category),demandPulse:true,todaysWork:true,assistant:true,dailyClosing:true,expiryTracking:legacy||category==='grocery',wastageTracking:legacy||category==='vegetables',variants:legacy||['clothing','hardware','mobile'].includes(category),unitConversion:legacy||['grocery','hardware','vegetables'].includes(category)}; }
export function rolePermissions(role:Role):Permissions { return Object.fromEntries(permissionKeys.map(key=>[key,role==='owner'||(role==='manager'&&!['settings','team'].includes(key))||(role==='staff'&&['sales','customers','payments','demand'].includes(key))])) as Permissions; }
export function equivalentUnits(a:string,b:string){const aliases:Record<string,string>={pcs:'piece',pieces:'piece',unit:'piece',kilogram:'kg',gram:'g',grams:'g',liter:'litre',l:'litre',metre:'meter',m:'meter'};return (aliases[a]||a)===(aliases[b]||b);}
