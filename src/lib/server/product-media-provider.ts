import { createHash } from 'node:crypto';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import type { Product } from '../contracts';
import { productIdentity, scoreCandidate, type MediaCandidate } from '../product-media';
import { MAX_IMAGE_BYTES } from './images';

export interface ProductImageSearchAdapter { search(product: Product): Promise<MediaCandidate[]>; download(url: string): Promise<{ bytes: Buffer; mime: string }>; }
export function safeMediaUrl(raw: string, api = false): URL {
  const url = new URL(raw), allowed = api ? ['commons.wikimedia.org'] : ['upload.wikimedia.org', 'thumb.wikimedia.org'];
  if (url.protocol !== 'https:' || !allowed.includes(url.hostname) || url.username || url.password || url.port || (api ? url.pathname !== '/w/api.php' : !url.pathname.startsWith('/wikipedia/commons/'))) throw Error('Unsafe media URL');
  return url;
}
export function publicMediaAddress(address: string): boolean {
  if (isIP(address) === 4) { const [a,b] = address.split('.').map(Number); return !(a === 0 || a === 10 || a === 127 || a === 169 && b === 254 || a === 172 && b >= 16 && b <= 31 || a === 192 && b === 168 || a === 100 && b >= 64 && b <= 127 || a >= 224); }
  // Wikimedia IPv6 is global unicast. Reject mapped, local, link-local and multicast addresses.
  return isIP(address) === 6 && /^[23][0-9a-f]{3}:/i.test(address) && !address.toLowerCase().startsWith('2001:db8:');
}
async function restrictedFetch(raw: string, api = false) {
  const url = safeMediaUrl(raw, api), addresses = await lookup(url.hostname, { all: true });
  if (!addresses.length || addresses.some(row => !publicMediaAddress(row.address))) throw Error('Nonpublic media host');
  const response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(9000), headers: { 'User-Agent': 'DukaanSet/1.0 (product-media; https://github.com/Daksh009739/DukaanSet)', Accept: api ? 'application/json' : 'image/jpeg,image/png,image/webp' } });
  if (!response.ok) throw Error('Media provider unavailable');
  return response;
}
export async function limitedBytes(response: Response, limit: number): Promise<Buffer> {
  if (Number(response.headers.get('content-length') || 0) > limit) throw Error('Media exceeds download limit');
  if (!response.body) throw Error('Empty media');
  const reader = response.body.getReader(), chunks: Uint8Array[] = []; let length = 0;
  try { while (true) { const chunk = await reader.read(); if (chunk.done) break; length += chunk.value.length; if (length > limit) throw Error('Media exceeds download limit'); chunks.push(chunk.value); } } finally { await reader.cancel(); }
  return Buffer.concat(chunks);
}
const plain = (raw: string) => raw.replace(/<[^>]*>/g, '').replace(/&(?:amp|quot|lt|gt);/g, ' ').slice(0, 400).trim();
export class CommonsImageSearchAdapter implements ProductImageSearchAdapter {
  async search(product: Product): Promise<MediaCandidate[]> {
    const identity = productIdentity(product);
    const query = identity.generic ? `${identity.generic} white background` : identity.query;
    const url = new URL('https://commons.wikimedia.org/w/api.php');
    for (const [key, value] of Object.entries({ action: 'query', format: 'json', generator: 'search', gsrsearch: query, gsrnamespace: '6', gsrlimit: '6', prop: 'imageinfo', iiprop: 'url|mime|size|extmetadata', iiurlwidth: '480' })) url.searchParams.set(key, value);
    const response = await restrictedFetch(url.href, true), data = JSON.parse((await limitedBytes(response, 500000)).toString()) as { query?: { pages?: Record<string, { title: string; imageinfo?: { url: string; thumburl?: string; descriptionurl: string; width: number; height: number; mime: string; extmetadata?: Record<string, { value: string }> }[] }> } };
    return Object.values(data.query?.pages || {}).flatMap(page => {
      const info = page.imageinfo?.[0]; if (!info) return [];
      const meta = info.extmetadata || {}, value = (key: string) => plain(meta[key]?.value || '');
      const remoteUrl = info.thumburl || info.url;
      try { safeMediaUrl(remoteUrl); } catch { return []; }
      if (!info.descriptionurl.startsWith('https://commons.wikimedia.org/wiki/File:') || value('Restrictions')) return [];
      const candidate = scoreCandidate(product, { id: createHash('sha256').update(info.url).digest('hex').slice(0, 32), title: page.title, remoteUrl, sourceUrl: info.descriptionurl, author: value('Artist') || value('Attribution'), license: value('LicenseShortName'), licenseUrl: meta.LicenseUrl?.value?.replace(/^http:/, 'https:') || '', width: info.width, height: info.height, mime: info.mime });
      return candidate.confidence >= .4 && candidate.author ? [candidate] : [];
    }).sort((a, b) => b.confidence - a.confidence).slice(0, 3);
  }
  async download(url: string) { const response = await restrictedFetch(url); return { bytes: await limitedBytes(response, MAX_IMAGE_BYTES), mime: response.headers.get('content-type')?.split(';')[0] || '' }; }
}
