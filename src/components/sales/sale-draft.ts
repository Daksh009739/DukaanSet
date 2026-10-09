import { lineTotal, minorUnits } from '@/lib/client';
import type { Product, SaleAttachment } from '@/lib/contracts';

export type SalePaymentMode = 'cash' | 'upi' | 'credit' | 'split';
export interface SaleRequest {
  idempotencyKey: string;
  customerId: string | null;
  items: { productId: string; quantityMilli: number; attachmentIds: string[] }[];
  discountPaise: number;
  payments: { method: 'cash' | 'upi'; amountPaise: number }[];
  dueDate: string | null;
}
export interface PendingSale {
  request: SaleRequest;
  totals: { subtotal: number; discount: number; total: number; cash: number; upi: number; paid: number; pending: number };
  conflict: boolean;
}
export interface SaleDraft {
  version: 2;
  items: Record<string, string>;
  customerId: string;
  discount: string;
  received: string;
  cash: string;
  upi: string;
  mode: SalePaymentMode;
  dueDate: string;
  key: string;
  attachments: Record<string, SaleAttachment[]>;
  savedInvoiceId: string;
  pendingSale: PendingSale | null;
  recoveryBlocked: boolean;
}

export const freshDraft = (): SaleDraft => ({ version: 2, items: {}, customerId: '', discount: '0', received: '', cash: '', upi: '', mode: 'cash', dueDate: '', key: crypto.randomUUID(), attachments: {}, savedInvoiceId: '', pendingSale: null, recoveryBlocked: false });

const record = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const uuid = (value: unknown): value is string => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
const integer = (value: unknown, min = 0, max = 1_000_000_000): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value >= min && value <= max;
const date = (value: unknown): value is string => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;

/** A draft may only display authenticated images belonging to this business and product. */
export function restoreAttachment(value: unknown, businessId: string, productId: string): SaleAttachment | null {
  if (!record(value) || !uuid(value.id) || value.productId !== productId || !uuid(productId) || !uuid(businessId)) return null;
  const url = `/api/businesses/${businessId}/attachments/${value.id}`;
  if (value.url !== url || typeof value.mime !== 'string' || !['image/jpeg', 'image/png', 'image/webp'].includes(value.mime) || !integer(value.size, 1, 2 * 1024 * 1024) || typeof value.date !== 'string' || value.date.length > 40 || !Number.isFinite(Date.parse(value.date)) || new Date(value.date).toISOString() !== value.date) return null;
  return { id: value.id, url, productId, mime: value.mime as SaleAttachment['mime'], size: value.size, date: value.date };
}

function restorePendingSale(value: unknown, key: string): PendingSale | null {
  if (!record(value) || !record(value.request) || !record(value.totals)) return null;
  const request = value.request;
  if (!uuid(request.idempotencyKey) || request.idempotencyKey !== key || (request.customerId !== null && !uuid(request.customerId)) || !integer(request.discountPaise) || (request.dueDate !== null && !date(request.dueDate))) return null;
  if (!Array.isArray(request.items) || !request.items.length || request.items.length > 100 || !Array.isArray(request.payments) || request.payments.length > 2) return null;
  const productIds = new Set<string>(), photoIds = new Set<string>(), methods = new Set<string>();
  const items: SaleRequest['items'] = [];
  for (const item of request.items) {
    if (!record(item) || !uuid(item.productId) || productIds.has(item.productId) || !integer(item.quantityMilli, 1) || !Array.isArray(item.attachmentIds) || item.attachmentIds.length > 3) return null;
    productIds.add(item.productId);
    const attachmentIds: string[] = [];
    for (const id of item.attachmentIds) { if (!uuid(id) || photoIds.has(id)) return null; photoIds.add(id); attachmentIds.push(id); }
    items.push({ productId: item.productId, quantityMilli: item.quantityMilli, attachmentIds });
  }
  const payments: SaleRequest['payments'] = [];
  for (const payment of request.payments) {
    if (!record(payment) || (payment.method !== 'cash' && payment.method !== 'upi') || methods.has(payment.method) || !integer(payment.amountPaise, 1)) return null;
    methods.add(payment.method); payments.push({ method: payment.method, amountPaise: payment.amountPaise });
  }
  const summary = value.totals;
  if (!['subtotal', 'discount', 'total', 'cash', 'upi', 'paid', 'pending'].every(name => integer(summary[name], 0, 1_000_000_000_000))) return null;
  const totals = summary as PendingSale['totals'];
  if (totals.discount !== request.discountPaise || totals.total !== totals.subtotal - totals.discount || totals.paid !== totals.cash + totals.upi || totals.pending !== totals.total - totals.paid || totals.cash !== (payments.find(payment => payment.method === 'cash')?.amountPaise || 0) || totals.upi !== (payments.find(payment => payment.method === 'upi')?.amountPaise || 0) || (totals.pending > 0 && !request.customerId)) return null;
  return { request: { idempotencyKey: request.idempotencyKey, customerId: request.customerId as string | null, items, discountPaise: request.discountPaise, payments, dueDate: request.dueDate as string | null }, totals: { subtotal: totals.subtotal, discount: totals.discount, total: totals.total, cash: totals.cash, upi: totals.upi, paid: totals.paid, pending: totals.pending }, conflict: value.conflict === true };
}

/** Matches the backend's count-unit restriction; weight, volume and length allow thousandths. */
export const isWholeQuantityUnit = (unit: string) => ['pcs', 'piece', 'pieces', 'unit', 'pair', 'box', 'bottle', 'packet', 'pack'].includes(unit.toLowerCase());

export function restoreDraft(raw: string | null, businessId: string): SaleDraft {
  const fresh = freshDraft();
  if (!raw) return fresh;
  const parsed: unknown = JSON.parse(raw);
  if (!record(parsed)) return { ...fresh, recoveryBlocked: true };
  const value = parsed as Partial<SaleDraft> & { method?: string };
  if (!record(value.items)) return { ...fresh, recoveryBlocked: Boolean(value.pendingSale), key: uuid(value.key) ? value.key : fresh.key };
  const items = Object.fromEntries(Object.entries(value.items).filter(([id, amount]) => uuid(id) && typeof amount === 'string' && amount.length < 40).slice(0, 100));
  const attachments: Record<string, SaleAttachment[]> = {};
  if (record(value.attachments)) for (const [id, photos] of Object.entries(value.attachments)) {
    if (!items[id] || !Array.isArray(photos)) continue;
    const valid = photos.slice(0, 3).map(photo => restoreAttachment(photo, businessId, id)).filter((photo): photo is SaleAttachment => Boolean(photo));
    if (valid.length) attachments[id] = [...new Map(valid.map(photo => [photo.id, photo])).values()];
  }
  const key = uuid(value.key) ? value.key : fresh.key;
  const pendingSale = restorePendingSale(value.pendingSale, key);
  const recoveryBlocked = value.recoveryBlocked === true || Boolean(value.pendingSale && !pendingSale);
  const mode = value.mode || value.method;
  return { ...fresh, items: pendingSale ? Object.fromEntries(pendingSale.request.items.map(item => [item.productId, String(item.quantityMilli / 1000)])) : items,
    customerId: pendingSale ? pendingSale.request.customerId || '' : uuid(value.customerId) ? value.customerId : '',
    discount: pendingSale ? String(pendingSale.totals.discount / 100) : typeof value.discount === 'string' ? value.discount : '0',
    received: pendingSale ? String(pendingSale.totals.paid / 100) : typeof value.received === 'string' ? value.received : '',
    cash: pendingSale ? String(pendingSale.totals.cash / 100) : typeof value.cash === 'string' ? value.cash : '',
    upi: pendingSale ? String(pendingSale.totals.upi / 100) : typeof value.upi === 'string' ? value.upi : '',
    mode: ['cash', 'upi', 'credit', 'split'].includes(mode || '') ? mode as SalePaymentMode : 'cash',
    dueDate: pendingSale ? pendingSale.request.dueDate || '' : date(value.dueDate) ? value.dueDate : '', key, attachments,
    savedInvoiceId: !pendingSale && !recoveryBlocked && uuid(value.savedInvoiceId) ? value.savedInvoiceId : '',
    pendingSale, recoveryBlocked,
  };
}

export function calculateSale(draft: SaleDraft, products: Product[]) {
  const rows = Object.entries(draft.items).map(([id, value]) => ({ product: products.find(product => product.id === id), value })).filter((row): row is { product: Product; value: string } => Boolean(row.product));
  let subtotal = 0;
  let quantityValid = rows.length === Object.keys(draft.items).length;
  const items = rows.map(row => {
    let quantityMilli = 0;
    let error: 'quantityInvalid' | 'wholeQuantity' | 'stockShortage' | '' = '';
    let totalPaise = 0;
    try {
      quantityMilli = minorUnits(row.value, 3);
      if (!quantityMilli) error = 'quantityInvalid';
      else if (isWholeQuantityUnit(row.product.unit) && quantityMilli % 1000) error = 'wholeQuantity';
      else if (quantityMilli > row.product.quantityMilli) error = 'stockShortage';
      totalPaise = lineTotal(row.product.pricePaise, quantityMilli);
      if (!Number.isSafeInteger(totalPaise)) error = 'quantityInvalid';
    } catch { error = 'quantityInvalid'; }
    if (error) quantityValid = false;
    subtotal += totalPaise;
    return { ...row, quantityMilli, totalPaise, error };
  });
  let discount = 0;
  let discountValid = true;
  try { discount = minorUnits(draft.discount || '0'); } catch { discountValid = false; }
  if (discount > subtotal || !Number.isSafeInteger(subtotal)) discountValid = false;
  const total = Math.max(0, subtotal - discount);
  let cash = 0;
  let upi = 0;
  let paymentValid = true;
  try {
    if (draft.mode === 'cash') cash = draft.received === '' ? total : minorUnits(draft.received);
    if (draft.mode === 'upi') upi = draft.received === '' ? total : minorUnits(draft.received);
    if (draft.mode === 'split') { cash = minorUnits(draft.cash || '0'); upi = minorUnits(draft.upi || '0'); }
  } catch { paymentValid = false; }
  const paid = cash + upi;
  const overpaid = paid > total;
  return { items, subtotal, discount, total, cash, upi, paid, pending: Math.max(0, total - paid), quantityValid, discountValid, paymentValid, overpaid };
}
