import type { Invoice, Product } from './contracts';

export type ChartPeriod = 'week' | 'month' | 'year';
export interface DashboardData {
  sales: Record<ChartPeriod, { date: string; salesPaise: number }[]>;
  topProducts: { productId: string; revenuePaise: number; quantityMilli: number; share: number }[];
}
const dayFormatters = new Map<string, Intl.DateTimeFormat>();
export function localDay(date: string | Date, timezone = 'Asia/Kolkata'): string {
  let formatter = dayFormatters.get(timezone);
  if (!formatter) { formatter = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }); dayFormatters.set(timezone, formatter); }
  return formatter.format(new Date(date));
}
/** Calendar buckets, without treating receipts, cancelled bills or demand as sales. */
export function salesBuckets(invoices: Invoice[], period: ChartPeriod, now = new Date(), timezone = 'Asia/Kolkata') {
  const today = localDay(now, timezone), year = today.slice(0, 4), month = today.slice(0, 7);
  const count = period === 'week' ? 7 : period === 'year' ? 12 : Number(today.slice(8));
  const rows = Array.from({ length: count }, (_, i) => ({
    date: period === 'year' ? `${year}-${String(i + 1).padStart(2, '0')}-01` : period === 'month' ? `${month}-${String(i + 1).padStart(2, '0')}` : new Date(Date.parse(today + 'T12:00:00Z') - (6 - i) * 86400000).toISOString().slice(0, 10), salesPaise: 0,
  }));
  const byDate = new Map(rows.map(row => [period === 'year' ? row.date.slice(0, 7) : row.date, row]));
  for (const invoice of invoices) {
    if (invoice.status === 'cancelled') continue;
    const date = localDay(invoice.date, timezone), row = byDate.get(period === 'year' ? date.slice(0, 7) : date);
    if (row) row.salesPaise += invoice.totalPaise;
  }
  return rows;
}
/** Rank by sales value: quantities in kilograms and pieces must not be added together. */
export function rankedProducts(invoices: Invoice[], products: Product[], now = new Date(), timezone = 'Asia/Kolkata') {
  const first = salesBuckets([], 'week', now, timezone)[0].date, today = localDay(now, timezone);
  const totals = new Map<string, { revenuePaise: number; quantityMilli: number }>();
  for (const invoice of invoices) {
    const day = localDay(invoice.date, timezone);
    if (invoice.status === 'cancelled' || day < first || day > today) continue;
    for (const item of invoice.items) {
      const row = totals.get(item.productId) || { revenuePaise: 0, quantityMilli: 0 };
      row.revenuePaise += item.totalPaise; row.quantityMilli += item.quantityMilli; totals.set(item.productId, row);
    }
  }
  const total = [...totals.values()].reduce((sum, item) => sum + item.revenuePaise, 0);
  const byId = new Map(products.map(product => [product.id, product]));
  return [...totals.entries()].map(([id, row]) => ({ product: byId.get(id), ...row, share: total ? Math.round(row.revenuePaise / total * 100) : 0 })).filter(row => row.product).sort((a, b) => b.revenuePaise - a.revenuePaise).slice(0, 5);
}
