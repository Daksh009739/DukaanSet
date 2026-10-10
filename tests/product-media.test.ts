import { test } from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { Store } from '../src/lib/server/store';
import { ProductMediaService } from '../src/lib/server/product-media-service';
import { safeMediaUrl, publicMediaAddress, limitedBytes, type ProductImageSearchAdapter } from '../src/lib/server/product-media-provider';
import { productIdentity, scoreCandidate, usableLicense, type MediaCandidate } from '../src/lib/product-media';
import { rolePermissions } from '../src/lib/v3-contracts';

const product = (name: string, variation = '') => ({ name, variation, barcode: '' });
const candidate = { id: 'fixture-onion', title: 'File:Onions on white.jpg', remoteUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a1/Onion.jpg', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Onion.jpg', author: 'Fictional fixture author', license: 'CC BY 4.0', licenseUrl: 'https://creativecommons.org/licenses/by/4.0/', width: 640, height: 480, mime: 'image/jpeg' };
const fixture = () => { const store = new Store(':memory:'), session = store.register({ name: 'Media QA', email: `${crypto.randomUUID()}@example.test`, password: 'Strong-private-123', language: 'en', businessName: 'Fictional Media Shop', category: 'grocery' }), user = session.user.id, business = session.businesses[0].id; return { store, user, business, add: (name: string) => store.createProduct(user, business, { name, unit: 'kg', pricePaise: 7000, quantityMilli: 10000 }) }; };
test('verified produce aliases resolve without merging product types or branded variants', () => {
  for (const name of ['Pyaz', 'Pyaaz', 'Pyaj', 'प्याज़', 'Onion']) assert.equal(productIdentity(product(name)).generic, 'onion');
  for (const name of ['Aloo', 'Aalu', 'आलू', 'Potato']) assert.equal(productIdentity(product(name)).generic, 'potato');
  assert.equal(productIdentity(product('टमाटर')).generic, 'tomato');
  for (const name of ['Cooking Oil', 'Hair Oil', 'Chana Dal', 'Moong Dal', 'Water Bottle', 'Empty Plastic Bottle', 'Maggi Atta', 'Maggi Masala']) assert.equal(productIdentity(product(name)).generic, '');
  assert.notEqual(productIdentity(product('Maggi Masala')).query, productIdentity(product('Maggi Atta')).query);
});
test('rights and technical quality are mandatory, cooked foods and brand packaging never auto-attach', () => {
  assert.equal(scoreCandidate(product('Pyaz'), candidate).automatic, true);
  for (const change of [{ license: 'CC BY-NC 4.0' }, { licenseUrl: '' }, { width: 20 }, { mime: 'image/svg+xml' }, { title: 'File:Fried onion rings.jpg' }]) assert.equal(scoreCandidate(product('Pyaz'), { ...candidate, ...change }).automatic, false);
  assert.equal(scoreCandidate(product('Coca Cola 500ml'), { ...candidate, title: 'File:Coca Cola 1l bottle.jpg' }).automatic, false);
  assert.equal(scoreCandidate(product('Maggi Masala Noodles'), { ...candidate, title: 'File:Maggi Atta noodles.jpg' }).automatic, false);
  assert.equal(usableLicense('CC BY 4.0', 'https://evil.test/'), false);
});
test('remote URL policy rejects redirects, credentials, ports and all internal destinations', () => {
  assert.equal(safeMediaUrl(candidate.remoteUrl).hostname, 'upload.wikimedia.org');
  for (const raw of ['http://upload.wikimedia.org/wikipedia/commons/a.jpg', 'https://127.0.0.1/a', 'https://upload.wikimedia.org.evil.test/wikipedia/commons/a', 'https://user@upload.wikimedia.org/wikipedia/commons/a', 'https://upload.wikimedia.org:8443/wikipedia/commons/a', 'https://upload.wikimedia.org/private/a', 'file:///etc/passwd']) assert.throws(() => safeMediaUrl(raw));
  for (const address of ['127.0.0.1', '10.2.3.4', '192.168.1.2', '169.254.169.254', '172.20.1.1', '100.64.1.2', '::1', '::ffff:127.0.0.1', 'fc00::1', 'fe80::1', '2001:db8::1']) assert.equal(publicMediaAddress(address), false);
  assert.equal(publicMediaAddress('208.80.154.224'), true);
});
test('stream limits stop oversized chunked and declared downloads', async () => {
  await assert.rejects(limitedBytes(new Response(new Uint8Array(20)), 10));
  await assert.rejects(limitedBytes(new Response('x', { headers: { 'content-length': '99' } }), 10));
});
test('creation queues durable enrichment without delaying product or stock commit; provider failure is independent', async () => {
  const f = fixture(); try {
    const item = f.add('Pyaz'), media = new ProductMediaService(f.store, { search: async () => { throw Error('Provider outage'); }, download: async () => { throw Error(); } });
    assert.equal(media.summary(f.business, item.id).status, 'queued'); await media.processOne();
    assert.equal(f.store.state(f.user, f.business).products[0].quantityMilli, 10000); assert.equal(f.store.state(f.user, f.business).products[0].pricePaise, 7000);
    for (let i = 0; i < 2; i++) { f.store.db.prepare('UPDATE product_media SET available_at=?').run('2000-01-01'); await media.processOne(); }
    assert.equal(media.summary(f.business, item.id).status, 'failed'); assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM movements').get()!.n, 1);
  } finally { f.store.close(); }
});
test('licensed thumbnail, cache deduplication and suggestion association preserve financial records', async () => {
  const f = fixture(); try {
    let searches = 0; const image = await sharp({ create: { width: 640, height: 480, channels: 3, background: '#eeeeee' } }).jpeg().toBuffer();
    const provider: ProductImageSearchAdapter = { search: async p => { searches++; return [scoreCandidate(p, candidate)]; }, download: async () => ({ bytes: image, mime: 'image/jpeg' }) }, media = new ProductMediaService(f.store, provider);
    const first = f.add('Pyaz'), second = f.add('Pyaaz'), before = f.store.state(f.user, f.business);
    await media.processOne(); await media.processOne(); assert.equal(searches, 1);
    const detail = media.detail(f.user, f.business, first.id); assert.equal(detail.media.status, 'ready'); assert.ok(detail.media.url); assert.equal(detail.media.license, 'CC BY 4.0');
    assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM media_assets').get()!.n, 1);
    const thumb = media.read(f.user, f.business, first.id, null); assert.equal(thumb.mime, 'image/webp'); const meta = await sharp(thumb.bytes).metadata(); assert.ok(meta.width! <= 512); assert.equal(meta.exif, undefined);
    const after = f.store.state(f.user, f.business); assert.deepEqual(after.metrics, before.metrics); assert.deepEqual(after.movements, before.movements); assert.deepEqual(after.invoices, before.invoices); assert.equal(after.products.find(p => p.id === second.id)!.media!.url?.includes('/image'), true);
  } finally { f.store.close(); }
});
test('merchant upload wins over in-flight automatic lookup and another tenant cannot read or change it', async () => {
  const f = fixture(); try {
    const item = f.add('Pyaz'), bytes = await sharp({ create: { width: 400, height: 400, channels: 3, background: '#123456' } }).png().toBuffer();
    let release: (c: MediaCandidate[]) => void = () => {};
    const media = new ProductMediaService(f.store, { search: () => new Promise(resolve => { release = resolve; }), download: async () => ({ bytes, mime: 'image/png' }) }), job = media.processOne();
    await media.upload(f.user, f.business, item.id, bytes, 'image/png', true); const url = media.summary(f.business, item.id).url;
    release([scoreCandidate(item, candidate)]); await job; assert.equal(media.summary(f.business, item.id).selected, 'merchant'); assert.equal(media.summary(f.business, item.id).url, url);
    const other = f.store.register({ name: 'Other QA', email: `${crypto.randomUUID()}@example.test`, password: 'Strong-private-123', businessName: 'Other Shop', category: 'general', language: 'en' });
    assert.throws(() => media.read(other.user.id, f.business, item.id, null)); assert.throws(() => media.select(other.user.id, f.business, item.id, { selection: 'default' })); assert.throws(() => media.detail(f.user, other.businesses[0].id, item.id));
  } finally { f.store.close(); }
});
test('uploads require rights, decoded formats, quota, inventory permission; default selection remains pinned', async () => {
  const f = fixture(); try {
    const item = f.add('Pyaz'), media = new ProductMediaService(f.store);
    await assert.rejects(media.upload(f.user, f.business, item.id, Buffer.from('<svg/>'), 'image/svg+xml', true)); await assert.rejects(media.upload(f.user, f.business, item.id, Buffer.from('invalid'), 'image/png', true)); await assert.rejects(media.upload(f.user, f.business, item.id, Buffer.from('x'), 'image/jpeg', false));
    media.select(f.user, f.business, item.id, { selection: 'default' }); assert.equal(media.summary(f.business, item.id).url, null);
    media.saveSettings(f.user, f.business, { enabled: false }); assert.equal(await media.processOne(), false); assert.equal(media.summary(f.business, item.id).status, 'disabled');
  } finally { f.store.close(); }
});
test('renamed products clear automatic association; stale identity results and concurrent consumers do not attach', async () => {
  const f = fixture(); try {
    const item = f.add('Pyaz'); let release: (c: MediaCandidate[]) => void = () => {};
    const media = new ProductMediaService(f.store, { search: () => new Promise(resolve => { release = resolve; }), download: async () => { throw Error(); } }), job = media.processOne();
    assert.equal(await media.processOne(), false); f.store.editProduct(f.user, f.business, item.id, { name: 'Hair Oil' }); release([scoreCandidate(item, candidate)]); await job; assert.equal(media.summary(f.business, item.id).url, null); assert.equal(media.summary(f.business, item.id).status, 'queued');
  } finally { f.store.close(); }
});
test('inventory-disabled staff cannot modify images or media settings, and storage limits are enforced', async () => {
  const f = fixture(); try {
    const item = f.add('Pyaz'), media = new ProductMediaService(f.store), bytes = await sharp({ create: { width: 50, height: 50, channels: 3, background: '#fff' } }).png().toBuffer();
    f.store.db.prepare('UPDATE memberships SET role=?,permissions_json=? WHERE user_id=? AND business_id=?').run('staff', JSON.stringify({ ...rolePermissions('staff'), inventory: false, settings: false }), f.user, f.business);
    assert.throws(() => media.select(f.user, f.business, item.id, { selection: 'default' })); await assert.rejects(media.upload(f.user, f.business, item.id, bytes, 'image/png', true)); assert.throws(() => media.saveSettings(f.user, f.business, { enabled: false }));
    f.store.db.prepare("UPDATE memberships SET role='owner' WHERE user_id=? AND business_id=?").run(f.user, f.business);
    const insert = f.store.db.prepare('INSERT INTO media_assets VALUES(?,?,?,?,?,?,?)');
    f.store.transaction(() => { for (let i = 0; i < 1000; i++) insert.run(crypto.randomUUID(), f.business, Buffer.from('x'), 'fixture-' + i, 'image/webp', '{}', new Date().toISOString()); });
    await assert.rejects(media.upload(f.user, f.business, item.id, bytes, 'image/png', true), { code: 'ATTACHMENT_LIMIT' });
  } finally { f.store.close(); }
});
