import type { Invoice, Language, Payment } from './contracts';

export type DocumentKind = 'invoice' | 'statement' | 'receipt';
export type DocumentFormat = 'a4' | 'mono' | '58mm' | '80mm';
export interface Branding {
  name: string; address: string; phone: string; email: string; website: string;
  tagline: string; footer: string; terms: string; returnPolicy: string;
  accent: string; logo: string; upiId: string; payee: string; revision: number;
}
export interface IssuedSnapshot { merchant: Branding; customer: { id: string | null; name: string; phone: string }; provenance: 'issued' | 'legacy'; }
export interface LedgerRow {
  id: string; date: string; reference: string; kind: 'purchase' | 'sale' | 'repayment' | 'refund' | 'cancellation';
  debitPaise: number; creditPaise: number; balancePaise: number; invoiceId: string | null; paymentId: string | null;
}
export interface CustomerLedger {
  customer: { id: string; name: string; phone: string }; start: string; end: string; asOf: string;
  openingPaise: number; closingPaise: number; debitsPaise: number; creditsPaise: number;
  purchaseCount: number; rows: LedgerRow[]; invoices: { id: string; number: string; date: string }[];
  receipts: { id: string; date: string; amountPaise: number; method: string; kind: string }[];
}
export interface DocumentModel {
  kind: DocumentKind; sourceId: string; businessId: string; reference: string; language: Language;
  format: DocumentFormat; detailed: boolean; generatedAt: string; merchant: Branding;
  customer: { id: string | null; name: string; phone: string }; legacy: boolean;
  invoice?: Invoice & { originalPaidPaise: number; originalBalancePaise: number };
  ledger?: CustomerLedger;
  receipt?: { id: string; date: string; method: string; kind: string; amountPaise: number; allocations: { invoiceId: string; number: string; amountPaise: number }[]; balanceAsOfPaise: number };
  originalPayments?: Payment[];
  purchaseDetails?: Record<string, import('./contracts').InvoiceItem[]>;
}
export interface PreparedDocument { id: string; model: DocumentModel; filename: string; pdfUrl: string; pages: number; expiresAt: string; }
export interface DocumentEntry { id: string; kind: DocumentKind; sourceId: string; reference: string; language: Language; format: DocumentFormat; createdAt: string; expiresAt: string; }
export interface CommunicationPreferences { number: string; language: Language; permission: boolean; optedOut: boolean; source: string; updatedAt: string; }
export type DeliveryStatus = 'preparing' | 'submitting' | 'submitted' | 'sent' | 'delivered' | 'read' | 'failed' | 'unknown' | 'manual' | 'cancelled';
export interface Delivery { id: string; documentId: string; reference: string; kind: DocumentKind; customerId: string; mode: 'manual' | 'cloud'; destination: string; language: Language; status: DeliveryStatus; errorCode: string; createdAt: string; updatedAt: string; providerId: string | null; }
export interface SharingConnection { connected: boolean; enabled: boolean; sender: string; verifiedAt: string | null; templates: Partial<Record<Language, { name: string; language: string; body: string; keys: string[] }>>; }
