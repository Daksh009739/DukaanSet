import type { ApiError } from './contracts';

export class RequestError extends Error {
  constructor(public code: string, message: string, public status: number,public details?: {name:string;quantityMilli:number;unit:string}) { super(message); }
}
export async function api<T>(path: string, body?: unknown, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`/api${path}`, {
    method: body === undefined ? 'GET' : 'POST', credentials: 'same-origin', cache: 'no-store', signal,
    headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const data = await response.json();
  if (!response.ok) {
    const error = data as ApiError;
    throw new RequestError(error.error?.code || 'UNKNOWN', error.error?.message || 'Please try again.', response.status,error.error?.details);
  }
  return data as T;
}
export function minorUnits(value: string, precision = 2, signed = false): number {
  value = value.trim();
  const expression = new RegExp(`^${signed ? '-?' : ''}\\d+(?:\\.\\d{1,${precision}})?$`);
  if (!expression.test(value.trim())) throw new RequestError('INVALID_AMOUNT', 'Enter a valid amount.', 400);
  const negative = value.startsWith('-');
  const [whole, fraction = ''] = value.replace('-', '').split('.');
  const amount = Number(whole) * 10 ** precision + Number(fraction.padEnd(precision, '0'));
  if (!Number.isSafeInteger(amount) || amount > 1_000_000_000) throw new RequestError('INVALID_AMOUNT', 'Amount is too large.', 400);
  return negative ? -amount : amount;
}
export function money(paise: number, language = 'en'): string {
  return new Intl.NumberFormat(language === 'hi' ? 'hi-IN-u-nu-latn' : 'en-IN-u-nu-latn', { style: 'currency', currency: 'INR', maximumFractionDigits: paise % 100 ? 2 : 0 }).format(paise / 100);
}
export function quantity(milli: number): string {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 3 }).format(milli / 1000);
}
export function lineTotal(pricePaise: number, quantityMilli: number): number {
  return Number((BigInt(pricePaise) * BigInt(quantityMilli) + 500n) / 1000n);
}
export function businessDay(timestamp: string | Date = new Date()): string {
  return new Date(new Date(timestamp).getTime() + 19_800_000).toISOString().slice(0,10);
}
export const today = () => businessDay();
