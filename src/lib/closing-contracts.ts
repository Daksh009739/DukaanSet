import type { Branding } from './document-contracts';
export interface ClosingSettings {
  enabled: boolean; timezone: string; closingTime: string; cutoff: string;
  allowSkipCount: boolean; notifications: boolean; managerIds: string[]; revision: number;
}
export interface BusinessSession {
  id: string; businessDate: string; openedAt: string; timezone: string; cutoff: string;
  openingCashPaise: number; status: 'open' | 'closed'; closedAt: string | null;
}
export interface ClosingTotals {
  grossSalesPaise: number; discountsPaise: number; returnsPaise: number; netSalesPaise: number;
  collectionsPaise: number; cashCollectionsPaise: number; upiCollectionsPaise: number;
  saleCollectionsPaise: number; olderDuesCollectionsPaise: number; creditCollectionsPaise: number; newCreditPaise: number;
  openingReceivablePaise: number; closingReceivablePaise: number; creditReversalsPaise: number;
  expensesPaise: number; cashExpensesPaise: number; supplierPaymentsPaise: number; cashSupplierPaymentsPaise: number;
  refundsPaise: number; cashRefundsPaise: number; upiRefundsPaise: number;
  depositsPaise: number; withdrawalsPaise: number; expectedCashPaise: number;
  billCount: number; purchaseCount: number; lowStockCount: number;
}
export interface ClosingPreview {
  inventory: {productId:string;name:string;variant:string;unit:string;availableMilli:number;soldMilli:number;receivedMilli:number;returnedMilli:number;wastedMilli:number}[];
  session: BusinessSession; asOf: string; fingerprint: string; totals: ClosingTotals;
  sources: { invoices: string[]; payments: string[]; purchases: string[]; expenses: string[]; supplierPayments: string[]; cashMovements: string[]; returns: string[] };
  warnings: string[];
}
export interface ClosingReport extends ClosingPreview {
  id: string; reference: string; version: number; calculationVersion: string; merchant: Branding;
  actorKind?: 'user'|'system'; authorizedBy?:string; actorId: string; actorName: string; method: 'manual' | 'automatic'; scheduledAt: string | null;
  actualCashPaise: number | null; differencePaise: number | null; verification: 'pending' | 'matched' | 'difference';
  reason: string; sourceReferences: string[];
  revisionActorId?: string; revisionActorName?: string; revisedAt?: string;
  linkedCorrections?: {sourceId:string;type:string;date:string;amountPaise:number}[];
}
export interface LegacyCashClosing { id:string; businessDate:string; closedAt:string; openingCashPaise:number; expectedCashPaise:number; actualCashPaise:number; differencePaise:number }
export interface ClosingOverview {
  today:string; settings: ClosingSettings; session: BusinessSession; latest: ClosingReport | null;
  canClose: boolean; notices: { id: string; kind: string; date: string; sessionId: string }[];
  legacy: LegacyCashClosing[];
}
