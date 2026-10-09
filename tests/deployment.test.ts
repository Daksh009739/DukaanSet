import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gatewaySettings, backendSettings, gatewayOutput, checkBackend, verifyBackendBuild } from '../scripts/deployment-config.mjs';
import { requireSameOrigin, handleRequest } from '../src/lib/server/router';
import { Store, getStore } from '../src/lib/server/store';
import { GET as deployment } from '../src/app/api/deployment/route';
import { GET as health } from '../src/app/api/health/route';
import { deploymentCheckAuthorized } from '../src/lib/server/deployment';

const token = 'a'.repeat(43), sha = 'b'.repeat(40);
const gateway = () => ({ VERCEL_ENV: 'preview', VERCEL_GIT_COMMIT_REF: 'dev', VERCEL_GIT_COMMIT_SHA: sha, DUKAANSET_BACKEND_ORIGIN: 'https://backend-staging.example.com', DUKAANSET_PUBLIC_ORIGIN: 'https://staging.example.com', DUKAANSET_DEPLOYMENT_TOKEN: token });
const backend = () => ({ DUKAANSET_ENV: 'staging', DUKAANSET_PUBLIC_ORIGIN: 'https://staging.example.com', AUTH_BASE_URL: 'https://staging.example.com', NEXT_PUBLIC_SITE_URL: 'https://staging.example.com', DUKAANSET_DATA_ROOT: process.platform === 'win32' ? 'C:\\private\\staging' : '/var/lib/staging', DATABASE_PATH: process.platform === 'win32' ? 'C:\\private\\staging\\shop.sqlite' : '/var/lib/staging/shop.sqlite', AUTH_EMAIL_MODE: 'resend', RESEND_API_KEY: 'test-only-unused', AUTH_EMAIL_FROM: 'test@example.com', DUKAANSET_DEPLOYMENT_TOKEN: token });
function environment(values: Record<string, string | undefined>, work: () => unknown) {
  const saved = Object.fromEntries(Object.keys(values).map(key => [key, process.env[key]]));
  for (const [key, value] of Object.entries(values)) if (value === undefined) delete process.env[key]; else process.env[key] = value;
  try { return work(); } finally { for (const [key, value] of Object.entries(saved)) if (value === undefined) delete process.env[key]; else process.env[key] = value; }
}

test('gateway fails closed for wrong branches, missing secrets, production credentials and proxy loops', () => {
  assert.equal(gatewaySettings(gateway()).environment, 'staging');
  for (const extra of [{ VERCEL_GIT_COMMIT_REF: 'main' }, { VERCEL_GIT_COMMIT_REF: 'feature/test' }, { VERCEL_GIT_COMMIT_SHA: 'fake' }, { DUKAANSET_DEPLOYMENT_TOKEN: '' }, { RESEND_API_KEY: 'private' }, { DATABASE_PATH: '/tmp/app.sqlite' }, { DUKAANSET_BACKEND_ORIGIN: 'https://staging.example.com' }, { DUKAANSET_BACKEND_ORIGIN: 'http://localhost:3000' }, { DUKAANSET_BACKEND_ORIGIN: 'https://user:secret@example.com' }, { DUKAANSET_PUBLIC_ORIGIN: 'https://staging.example.com/path' }]) assert.throws(() => gatewaySettings({ ...gateway(), ...extra }));
  assert.equal(gatewaySettings({ ...gateway(), VERCEL_ENV: 'production', VERCEL_GIT_COMMIT_REF: 'main' }).environment, 'production');
});
test('backend checks require isolated durable storage, matching auth origins and real email configuration', () => {
  assert.equal(backendSettings(backend()).environment, 'staging');
  for (const extra of [{ VERCEL: '1' }, { DUKAANSET_ENV: 'other' }, { AUTH_EMAIL_MODE: 'file' }, { RESEND_API_KEY: '' }, { DATABASE_PATH: '/tmp/shop.sqlite' }, { DATABASE_PATH: 'relative.sqlite' }, { AUTH_BASE_URL: 'https://production.example.com' }, { DUKAANSET_DATA_ROOT: '/var/lib/production' }]) assert.throws(() => backendSettings({ ...backend(), ...extra }));
  assert.deepEqual(backendSettings({ DUKAANSET_ENV: 'local' }), { environment: 'local' });
});
test('gateway covers pages, APIs and assets without shipping SQLite functions or secrets', () => {
  const settings = gatewaySettings(gateway()), output = gatewayOutput(settings), text = JSON.stringify(output);
  assert.equal(output.version, 3); assert.equal(output.routes[0].dest, `${settings.origin}/$1`);
  for (const pathname of ['/', '/api/auth/login', '/app/stock/voice', '/_next/static/chunk.js', '/api/businesses/demo/attachments/photo', '/robots.txt']) assert.ok(new RegExp(output.routes[0].src).test(pathname));
  assert.ok(!text.includes(token)); assert.equal(output.routes[0].headers['X-Robots-Tag'], 'noindex, nofollow, noarchive');
  assert.equal(gatewayOutput({ ...settings, environment: 'production' }).routes[0].headers['X-Robots-Tag'], undefined);
});
test('a backend cannot claim staging readiness using a local or production static-page build', () => {
  const env = backend(), info = { environment: 'staging', publicOrigin: env.DUKAANSET_PUBLIC_ORIGIN, commit: sha, branch: 'dev', builtAt: new Date().toISOString(), version: '0.1.0' };
  verifyBackendBuild(info, env);
  for (const extra of [{ environment: 'local' }, { environment: 'production' }, { publicOrigin: 'http://localhost:3000' }, { branch: 'main' }, { commit: null }, { builtAt: null }]) assert.throws(() => verifyBackendBuild({ ...info, ...extra }, env));
});
test('gateway readiness verifies backend commit, environment, origin and rejects redirected token requests', async () => {
  const settings = gatewaySettings(gateway());
  const ready = { environment: 'staging', branch: 'dev', commit: sha, publicOrigin: settings.publicOrigin, ready: true, builtAt: new Date().toISOString(), version: '0.1.0' };
  await checkBackend(settings, async (url: RequestInfo | URL, options?: RequestInit) => { assert.equal(url, `${settings.origin}/api/deployment`); assert.equal(options!.redirect, 'error'); assert.equal((options!.headers as Record<string, string>).Authorization, `Bearer ${token}`); return Response.json(ready); });
  for (const extra of [{ commit: 'c'.repeat(40) }, { environment: 'production' }, { branch: 'main' }, { ready: false }, { publicOrigin: 'https://production.example.com' }, { builtAt: null }]) await assert.rejects(checkBackend(settings, async () => Response.json({ ...ready, ...extra })));
  await assert.rejects(checkBackend(settings, async () => new Response(null, { status: 503 })));
});
test('explicit proxy origin permits same-site HTTPS posts without trusting forwarding headers', () => {
  environment({ DUKAANSET_ENV: 'staging', DUKAANSET_PUBLIC_ORIGIN: 'https://staging.example.com' }, () => {
    requireSameOrigin(new Request('http://backend.internal/api/auth/login', { headers: { origin: 'https://staging.example.com', host: 'backend.internal' } }));
    const attempts: Record<string, string>[] = [{ origin: 'https://evil.example.com', 'x-forwarded-host': 'staging.example.com', 'x-forwarded-proto': 'https' }, { origin: 'https://staging.example.com', 'sec-fetch-site': 'cross-site' }, {}];
    for (const headers of attempts) assert.throws(() => requireSameOrigin(new Request('http://backend.internal/api/auth/login', { headers })));
  });
});
test('health reveals no data; build details require an owner session or a narrowly scoped deployment token', async () => {
  const previous = globalThis.dukaanStore, store = new Store(':memory:'); globalThis.dukaanStore = store;
  const previousToken = process.env.DUKAANSET_DEPLOYMENT_TOKEN, previousVercel = process.env.VERCEL, previousEnvironment = process.env.DUKAANSET_ENV;
  process.env.DUKAANSET_DEPLOYMENT_TOKEN = token; delete process.env.VERCEL; process.env.DUKAANSET_ENV = 'local';
  try {
    assert.deepEqual(await health().json(), { ok: true });
    assert.equal(deployment(new Request('https://staging.example.com/api/deployment')).status, 401);
    assert.equal(deploymentCheckAuthorized(new Request('https://staging.example.com/api/deployment', { headers: { Authorization: `Bearer ${token.slice(1)}` } })), false);
    assert.equal(deploymentCheckAuthorized(new Request('https://staging.example.com/api/deployment', { headers: { Authorization: `Bearer ${'é'.repeat(43)}` } })), false);
    const result = deployment(new Request('https://staging.example.com/api/deployment', { headers: { Authorization: `Bearer ${token}` } }));
    assert.equal(result.status, 200); assert.ok(!JSON.stringify(await result.json()).includes(token));
    assert.equal((await handleRequest(new Request('https://staging.example.com/api/session', { headers: { Authorization: `Bearer ${token}` } }), store)).status, 401);
    const account = store.register({ name: 'QA Owner', email: 'staging-check@example.com', password: 'strong-password-123', businessName: 'Fictional QA Shop', category: 'grocery', language: 'en' }), session = store.issueSession(account.user.id);
    const request = new Request('https://staging.example.com/api/deployment', { headers: { Cookie: `dukaanset_session=${session}` } });
    assert.equal(deployment(request).status, 200);
    const details = await deployment(request).json(); assert.equal(details.publicOrigin, undefined);
    store.db.prepare("UPDATE memberships SET role='staff' WHERE user_id=?").run(account.user.id);
    assert.equal(deployment(request).status, 403);
  } finally { store.close(); globalThis.dukaanStore = previous; for (const [key, value] of Object.entries({ DUKAANSET_DEPLOYMENT_TOKEN: previousToken, VERCEL: previousVercel, DUKAANSET_ENV: previousEnvironment })) if (value === undefined) delete process.env[key]; else process.env[key] = value; }
});
test('the default SQLite runtime refuses accidental Vercel execution', () => {
  environment({ VERCEL: '1' }, () => assert.throws(() => getStore(), /persistent backend/));
});
