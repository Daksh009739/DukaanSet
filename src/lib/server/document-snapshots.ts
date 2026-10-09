import type { DatabaseSync } from 'node:sqlite';
import type { Branding, IssuedSnapshot } from '../document-contracts';

export function branding(db: DatabaseSync, businessId: string): Branding {
  const shop = db.prepare('SELECT name FROM businesses WHERE id=?').get(businessId) as { name: string };
  const settings = db.prepare('SELECT location,contact FROM business_settings WHERE business_id=?').get(businessId) as { location: string; contact: string } | undefined;
  const row = db.prepare('SELECT data_json,revision FROM invoice_branding WHERE business_id=?').get(businessId) as { data_json: string; revision: number } | undefined;
  return { name: shop.name, address: settings?.location || '', phone: settings?.contact || '', email: '', website: '', tagline: '', footer: '', terms: '', returnPolicy: '', accent: '#103B36', logo: '', upiId: '', payee: '', ...row && JSON.parse(row.data_json), revision: row?.revision || 0 };
}
export function captureIssued(db: DatabaseSync, businessId: string, customerId: string | null, customerName: string): IssuedSnapshot {
  const contact = customerId ? db.prepare('SELECT phone FROM customers WHERE business_id=? AND id=?').get(businessId, customerId) as { phone: string } : null;
  return { merchant: branding(db, businessId), customer: { id: customerId, name: customerName, phone: contact?.phone || '' }, provenance: 'issued' };
}
