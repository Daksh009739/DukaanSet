import { createHash, randomUUID } from 'node:crypto';
import sharp from 'sharp';
import type { Store } from './store';
import type { Product } from '../contracts';
import { productIdentity, usableLicense, type ProductMedia, type MediaCandidate } from '../product-media';
import { CommonsImageSearchAdapter, type ProductImageSearchAdapter } from './product-media-provider';
import { access } from './access';
import { DomainError, object, keys, oneOf } from './validation';
import { decodePhoto } from './images';

type MediaRow = { product_id: string; business_id: string; selected: ProductMedia['selected']; asset_id: string | null; candidates_json: string; status: ProductMedia['status']; attempts: number; available_at: string; updated_at: string; identity: string; lease: string | null };
type StoredCandidate = MediaCandidate & { assetId: string };
const at = () => new Date().toISOString();
export class ProductMediaService {
  constructor(readonly store: Store, readonly provider: ProductImageSearchAdapter = new CommonsImageSearchAdapter()) {}
  private permit(userId: string, businessId: string, write = false) { const p = access(this.store.db, userId, businessId).permissions; if (write ? !p.inventory : !(p.inventory || p.sales || p.demand || p.reports || p.purchases || p.customers)) throw new DomainError('FORBIDDEN', 'Your role cannot access product images.', 403); }
  private product(businessId: string, productId: string): Product { const row = this.store.db.prepare('SELECT * FROM products WHERE id=? AND business_id=?').get(productId, businessId) as Record<string, string | number> | undefined; if (!row) throw new DomainError('NOT_FOUND', 'Product not found.', 404); return { id: productId, name: String(row.name), variation: String(row.variation), barcode: String(row.barcode), aliases: JSON.parse(String(row.aliases_json)), sku: String(row.sku), unit: String(row.unit), pricePaise: Number(row.price_paise), costPaise: Number(row.cost_paise), quantityMilli: Number(row.quantity_milli), minStockMilli: Number(row.min_stock_milli), expiryDate: null, packSize: null }; }
  private row(businessId: string, productId: string) { return this.store.db.prepare('SELECT * FROM product_media WHERE business_id=? AND product_id=?').get(businessId, productId) as MediaRow | undefined; }
  enabled(businessId: string) { return (this.store.db.prepare('SELECT enabled FROM media_settings WHERE business_id=?').get(businessId) as { enabled: number } | undefined)?.enabled !== 0; }
  decorateProducts(businessId: string, products: Product[]): Product[] {
    const rows = this.store.db.prepare('SELECT m.*,a.metadata_json FROM product_media m LEFT JOIN media_assets a ON a.id=m.asset_id AND a.business_id=m.business_id WHERE m.business_id=?').all(businessId) as (MediaRow & { metadata_json: string | null })[], byId = new Map(rows.map(row => [row.product_id, row])), enabled = this.enabled(businessId);
    return products.map(product => { const row = byId.get(product.id), source = JSON.parse(row?.metadata_json || '{}') as Partial<MediaCandidate>; return { ...product, media: { url: row?.asset_id ? `/api/businesses/${businessId}/product-media/${product.id}/image?v=${row.asset_id}` : null, selected: row?.selected || 'automatic', status: !enabled && !row?.asset_id ? 'disabled' : row?.status || 'fallback', source: source.sourceUrl ? 'wikimedia-commons' : row?.selected === 'merchant' && row.asset_id ? 'merchant' : '', attribution: source.author || '', license: source.license || '', licenseUrl: source.licenseUrl || '', sourceUrl: source.sourceUrl || '', category: productIdentity(product).category } }; });
  }
  settings(userId: string, businessId: string) { this.store.assertMember(userId, businessId); return { enabled: this.enabled(businessId), provider: 'wikimedia-commons', pending: Number((this.store.db.prepare("SELECT count(*) AS n FROM product_media WHERE business_id=? AND status='queued'").get(businessId) as { n: number }).n) }; }
  saveSettings(userId: string, businessId: string, raw: unknown) { this.store.assertPermission(userId, businessId, 'settings'); const input = object(raw); keys(input, ['enabled']); if (typeof input.enabled !== 'boolean') throw new DomainError('INVALID_INPUT', 'Choose whether automatic images are enabled.'); this.store.db.prepare('INSERT INTO media_settings VALUES(?,?) ON CONFLICT(business_id) DO UPDATE SET enabled=excluded.enabled').run(businessId, Number(input.enabled)); return this.settings(userId, businessId); }
  summary(businessId: string, productId: string): ProductMedia {
    const row = this.row(businessId, productId), product = this.product(businessId, productId), metadata = row?.asset_id ? (this.store.db.prepare('SELECT metadata_json FROM media_assets WHERE id=? AND business_id=?').get(row.asset_id, businessId) as { metadata_json: string } | undefined)?.metadata_json : null, source = metadata ? JSON.parse(metadata) as Partial<MediaCandidate> : {};
    return { url: row?.asset_id ? `/api/businesses/${businessId}/product-media/${productId}/image?v=${row.asset_id}` : null, selected: row?.selected || 'automatic', status: !this.enabled(businessId) && !row?.asset_id ? 'disabled' : row?.status || 'fallback', source: source.sourceUrl ? 'wikimedia-commons' : row?.selected === 'merchant' && row.asset_id ? 'merchant' : '', attribution: source.author || '', license: source.license || '', licenseUrl: source.licenseUrl || '', sourceUrl: source.sourceUrl || '', category: productIdentity(product).category };
  }
  detail(userId: string, businessId: string, productId: string) { this.permit(userId, businessId); this.product(businessId, productId); const row = this.row(businessId, productId); return { media: this.summary(businessId, productId), candidates: (JSON.parse(row?.candidates_json || '[]') as StoredCandidate[]).map(({ remoteUrl: _remoteUrl, assetId, ...candidate }) => ({ ...candidate, url: `/api/businesses/${businessId}/product-media/${productId}/image?candidate=${assetId}` })) }; }
  read(userId: string, businessId: string, productId: string, candidate: string | null) { this.permit(userId, businessId); this.product(businessId, productId); const row = this.row(businessId, productId), choices = JSON.parse(row?.candidates_json || '[]') as StoredCandidate[], id = candidate ? choices.find(c => c.assetId === candidate)?.assetId : row?.asset_id; if (!id) throw new DomainError('NOT_FOUND', 'Image not found.', 404); const asset = this.store.db.prepare('SELECT bytes,mime FROM media_assets WHERE id=? AND business_id=?').get(id, businessId) as { bytes: Uint8Array; mime: string } | undefined; if (!asset) throw new DomainError('NOT_FOUND', 'Image not found.', 404); return asset; }
  refresh(userId: string, businessId: string, productId: string) {
    this.permit(userId, businessId, true); this.product(businessId, productId); const row = this.row(businessId, productId); if (row && Date.now() - Date.parse(row.updated_at) < 60000) throw new DomainError('RATE_LIMITED', 'Wait a minute before refreshing image suggestions.', 429);
    this.store.db.prepare("UPDATE product_media SET status='queued',attempts=0,available_at=?,updated_at=?,lease=NULL WHERE business_id=? AND product_id=?").run(at(), at(), businessId, productId); return this.detail(userId, businessId, productId);
  }
  select(userId: string, businessId: string, productId: string, raw: unknown) {
    this.permit(userId, businessId, true); this.product(businessId, productId); const input = object(raw); keys(input, ['selection', 'candidateId']); const selection = oneOf(input.selection, 'Image selection', ['default', 'automatic', 'merchant'] as const), row = this.row(businessId, productId);
    const candidate = selection === 'merchant' ? (JSON.parse(row?.candidates_json || '[]') as StoredCandidate[]).find(c => c.id === input.candidateId) : null;
    if (selection === 'merchant' && (!candidate || !usableLicense(candidate.license, candidate.licenseUrl))) throw new DomainError('INVALID_INPUT', 'Choose a permitted suggestion for this product.');
    this.store.transaction(() => { this.store.db.prepare("UPDATE product_media SET selected=?,asset_id=?,status=?,attempts=0,available_at=?,updated_at=?,lease=NULL WHERE business_id=? AND product_id=?").run(selection, candidate?.assetId || null, selection === 'automatic' ? 'queued' : 'ready', at(), at(), businessId, productId); this.store.audit(userId, businessId, 'product.image', selection); }); return this.detail(userId, businessId, productId);
  }
  private async asset(businessId: string, bytes: Buffer, mime: string, metadata: Partial<MediaCandidate>) {
    const decoded = await decodePhoto(bytes, mime), thumbnail = await sharp(decoded.bytes).resize(512, 512, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toBuffer(), hash = createHash('sha256').update(thumbnail).digest('hex');
    const existing = this.store.db.prepare('SELECT id FROM media_assets WHERE business_id=? AND sha256=?').get(businessId, hash) as { id: string } | undefined; if (existing) return existing.id;
    const usage = this.store.db.prepare('SELECT coalesce(sum(length(bytes)),0) AS size,count(*) AS n FROM media_assets WHERE business_id=?').get(businessId) as { size: number; n: number }; if (usage.size + thumbnail.length > 104857600 || usage.n >= 1000) throw new DomainError('ATTACHMENT_LIMIT', 'Product image storage is full.');
    const id = randomUUID(); this.store.db.prepare('INSERT INTO media_assets VALUES(?,?,?,?,?,?,?)').run(id, businessId, thumbnail, hash, 'image/webp', JSON.stringify(metadata), at()); return id;
  }
  async upload(userId: string, businessId: string, productId: string, bytes: Buffer, mime: string, rights: boolean) { this.permit(userId, businessId, true); this.product(businessId, productId); if (!rights) throw new DomainError('INVALID_INPUT', 'Confirm permission to use the photo.'); const id = await this.asset(businessId, bytes, mime, {}); this.store.transaction(() => { this.store.db.prepare("UPDATE product_media SET selected='merchant',asset_id=?,status='ready',updated_at=?,lease=NULL WHERE business_id=? AND product_id=?").run(id, at(), businessId, productId); this.store.audit(userId, businessId, 'product.image', 'merchant'); }); return this.detail(userId, businessId, productId); }
  /** Claim one durable job. The lease guards against late results, retries and merchant edits. */
  async processOne(): Promise<boolean> {
    const row = this.store.db.prepare("SELECT m.* FROM product_media m LEFT JOIN media_settings s ON s.business_id=m.business_id WHERE coalesce(s.enabled,1)=1 AND ((m.status='queued' AND m.lease IS NULL AND m.available_at<=?) OR (m.lease IS NOT NULL AND m.updated_at<?)) ORDER BY m.available_at LIMIT 1").get(at(), new Date(Date.now() - 120000).toISOString()) as MediaRow | undefined; if (!row) return false;
    const lease = randomUUID(), product = this.product(row.business_id, row.product_id), identity = JSON.stringify(productIdentity(product));
    const claimed = this.store.db.prepare("UPDATE product_media SET lease=?,updated_at=?,identity=? WHERE product_id=? AND business_id=? AND updated_at=?").run(lease, at(), identity, row.product_id, row.business_id, row.updated_at); if (!claimed.changes) return false;
    try {
      const cacheKey = 'commons-v2:' + identity;
      const cached = this.store.db.prepare('SELECT candidates_json FROM media_search_cache WHERE query=? AND expires_at>?').get(cacheKey, at()) as { candidates_json: string } | undefined;
      const candidates: MediaCandidate[] = cached ? JSON.parse(cached.candidates_json) : await this.provider.search(product);
      if (!cached) this.store.db.prepare('INSERT INTO media_search_cache VALUES(?,?,?) ON CONFLICT(query) DO UPDATE SET candidates_json=excluded.candidates_json,expires_at=excluded.expires_at').run(cacheKey, JSON.stringify(candidates), new Date(Date.now() + 7 * 86400000).toISOString());
      const stored: StoredCandidate[] = [];
      for (const candidate of candidates.slice(0, 3)) { if (!usableLicense(candidate.license, candidate.licenseUrl)) continue; try { const image = await this.provider.download(candidate.remoteUrl); stored.push({ ...candidate, assetId: await this.asset(row.business_id, image.bytes, image.mime, candidate) }); } catch { /* A bad candidate never blocks product saving or other suggestions. */ } }
      if (candidates.length && !stored.length) throw Error('Candidate downloads unavailable');
      const automatic = stored.find(c => c.automatic), currentIdentity = JSON.stringify(productIdentity(this.product(row.business_id, row.product_id)));
      if (identity !== currentIdentity) { this.store.db.prepare("UPDATE product_media SET status='queued',lease=NULL,available_at=? WHERE product_id=? AND lease=?").run(at(), row.product_id, lease); return true; }
      this.store.db.prepare("UPDATE product_media SET candidates_json=?,asset_id=CASE WHEN selected='automatic' THEN ? ELSE asset_id END,status=?,lease=NULL,updated_at=? WHERE product_id=? AND business_id=? AND lease=?").run(JSON.stringify(stored), automatic?.assetId || null, automatic ? 'ready' : stored.length ? 'suggestions' : 'fallback', at(), row.product_id, row.business_id, lease);
    } catch {
      const attempts = row.attempts + 1;
      this.store.db.prepare("UPDATE product_media SET status=?,attempts=?,available_at=?,lease=NULL,updated_at=? WHERE product_id=? AND business_id=? AND lease=?").run(attempts >= 3 ? 'failed' : 'queued', attempts, new Date(Date.now() + attempts * 60000).toISOString(), at(), row.product_id, row.business_id, lease);
    }
    return true;
  }
}
