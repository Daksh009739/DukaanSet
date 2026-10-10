import type { Product } from './contracts';
export interface ProductMedia { url: string | null; selected: 'automatic' | 'merchant' | 'default'; status: 'queued' | 'ready' | 'suggestions' | 'fallback' | 'failed' | 'disabled'; source: string; attribution: string; license: string; licenseUrl: string; sourceUrl: string; category: string }
export interface MediaCandidate { id: string; title: string; remoteUrl: string; sourceUrl: string; author: string; license: string; licenseUrl: string; width: number; height: number; mime: string; confidence: number; automatic: boolean }
export const normalizedMediaName = (value: string) => value.normalize('NFKC').toLocaleLowerCase().replace(/[\u200b-\u200d]/g, '').replace(/[^\p{L}\p{M}\p{N}]+/gu, ' ').trim();
const equivalents: Record<string, string> = { pyaz: 'onion', pyaaz: 'onion', pyaj: 'onion', 'प्याज़': 'onion', 'प्याज': 'onion', onions: 'onion', aloo: 'potato', aalu: 'potato', 'आलू': 'potato', potatoes: 'potato', tamatar: 'tomato', 'टमाटर': 'tomato', tomatoes: 'tomato' };
export function productIdentity(product: Pick<Product, 'name' | 'variation' | 'barcode'> & Partial<Pick<Product, 'aliases'>>) {
  const name = normalizedMediaName(product.name), normalized = equivalents[name] || name;
  const branded = /\b(maggi|coca cola|cocacola|pepsi|parle|lays|lay s|amul|nestle)\b/.test(normalized);
  const generic = ['onion', 'potato', 'tomato'].includes(normalized) && !product.variation ? normalized : '';
  const category = generic || /\b(fruit|vegetable|apple|banana|carrot)\b/.test(normalized) ? 'produce' : /\b(water|cola|juice|milk|bottle)\b/.test(normalized) ? 'drink' : /\b(shirt|jeans|dress|clothing)\b/.test(normalized) ? 'clothing' : /\b(pipe|hammer|screw|hardware)\b/.test(normalized) ? 'hardware' : /\b(phone|mobile|charger)\b/.test(normalized) ? 'mobile' : /\b(rice|dal|daal|noodles|biscuit|flour|oil|food)\b/.test(normalized) ? 'food' : 'general';
  return { normalized, branded, generic, category, query: `${normalized} ${normalizedMediaName(product.variation || '')}`.trim(), barcode: product.barcode || '' };
}
export function usableLicense(license: string, url: string): boolean {
  return /^(CC BY(?:-SA)? (?:2\.0|2\.5|3\.0|4\.0)|CC0|Public domain)$/i.test(license.trim()) && /^https:\/\/(?:creativecommons\.org\/(?:licenses\/(?:by|by-sa)\/(?:2\.0|2\.5|3\.0|4\.0)|publicdomain\/(?:zero|mark)\/1\.0)|commons\.wikimedia\.org\/wiki\/)/.test(url);
}
/** Conservative: generic raw produce only auto-attaches; packaging always needs merchant review. */
export function scoreCandidate(product: Parameters<typeof productIdentity>[0], candidate: Omit<MediaCandidate, 'confidence' | 'automatic'>): MediaCandidate {
  const identity = productIdentity(product), title = normalizedMediaName(candidate.title.replace(/^File:/i, ''));
  const rights = usableLicense(candidate.license, candidate.licenseUrl), quality = candidate.width >= 240 && candidate.height >= 240 && Math.max(candidate.width, candidate.height) / Math.min(candidate.width, candidate.height) <= 3 && ['image/jpeg', 'image/png', 'image/webp'].includes(candidate.mime);
  const words = title.split(' '), exactGeneric = !!identity.generic && words.some(word => (equivalents[word] || word) === identity.generic);
  const exclusions = /\b(cooked|soup|sauce|dish|fried|roasted|dried|powder|onion rings|spring|green onion|plant|field|flower|painting|logo|watermark|salad|chopped|sliced|market)\b/.test(title);
  const tokens = identity.query.split(' ').filter(Boolean), matching = tokens.filter(token => words.includes(token)).length;
  const confidence = !rights || !quality ? 0 : exactGeneric && !exclusions ? .96 : tokens.length ? Math.min(.85, matching / tokens.length * .85) : 0;
  return { ...candidate, confidence, automatic: confidence >= .95 && !identity.branded };
}
