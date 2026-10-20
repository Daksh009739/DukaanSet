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

test('a live dev release is explicit on both hosts and still verifies the exact backend build', async () => {
  const values = { ...gateway(), VERCEL_ENV: 'production', DUKAANSET_RELEASE_BRANCH: 'dev' };
  assert.throws(() => gatewaySettings({ ...values, DUKAANSET_RELEASE_BRANCH: '' }));
  const settings = gatewaySettings(values);
  assert.equal(settings.environment, 'production');
  assert.equal(settings.branch, 'dev');
  const env = { ...backend(), DUKAANSET_ENV: 'production', DUKAANSET_RELEASE_BRANCH: 'dev' };
  assert.equal(backendSettings(env).environment, 'production');
  const info = { environment: 'production', branch: 'dev', commit: sha, publicOrigin: env.DUKAANSET_PUBLIC_ORIGIN, ready: true, builtAt: new Date().toISOString(), version: '0.1.0' };
  verifyBackendBuild(info, env);
  await checkBackend(settings, async () => Response.json(info));
  assert.throws(() => verifyBackendBuild(info, { ...env, DUKAANSET_RELEASE_BRANCH: '' }));
  for (const branch of ['main', 'feature/test']) {
    assert.throws(() => gatewaySettings({ ...values, VERCEL_GIT_COMMIT_REF: branch }));
    assert.throws(() => verifyBackendBuild({ ...info, branch }, env));
    await assert.rejects(checkBackend(settings, async () => Response.json({ ...info, branch })));
  }
  await assert.rejects(checkBackend(settings, async () => Response.json({ ...info, commit: 'c'.repeat(40) })));
  for (const branch of ['feature/test', 'DEV', 'main/dev']) assert.throws(() => gatewaySettings({ ...values, DUKAANSET_RELEASE_BRANCH: branch }));
});

test('real account deployments refuse leftover demo flags and cannot use the private local email outbox', () => {
  const gatewayEnv = { ...gateway(), VERCEL_ENV: 'production', DUKAANSET_RELEASE_BRANCH: 'dev' };
  const backendEnv = { ...backend(), DUKAANSET_ENV: 'production', DUKAANSET_RELEASE_BRANCH: 'dev' };
  for (const key of ['DUKAANSET_VERCEL_DEMO', 'DUKAANSET_STAGING_DEMO_ONLY', 'NEXT_PUBLIC_DUKAANSET_DEMO_ONLY']) {
    assert.throws(() => gatewaySettings({ ...gatewayEnv, [key]: '1' }), /demo-only/);
    assert.throws(() => backendSettings({ ...backendEnv, [key]: '1' }), /demo-only/);
  }
  for (const extra of [{ AUTH_EMAIL_MODE: 'file' }, { AUTH_EMAIL_MODE: 'unavailable' }, { RESEND_API_KEY: '' }, { AUTH_EMAIL_FROM: '' }]) assert.throws(() => backendSettings({ ...backendEnv, ...extra }));
  assert.throws(() => backendSettings({ ...backendEnv, VERCEL: '1' }), /persistent Node host/);
  assert.throws(() => gatewaySettings({ ...gatewayEnv, RESEND_API_KEY: 'private' }));
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
    assert.deepEqual(await (await health()).json(), { ok: true });
    assert.equal((await deployment(new Request('https://staging.example.com/api/deployment'))).status, 401);
    assert.equal(deploymentCheckAuthorized(new Request('https://staging.example.com/api/deployment', { headers: { Authorization: `Bearer ${token.slice(1)}` } })), false);
    assert.equal(deploymentCheckAuthorized(new Request('https://staging.example.com/api/deployment', { headers: { Authorization: `Bearer ${'é'.repeat(43)}` } })), false);
    const result = await deployment(new Request('https://staging.example.com/api/deployment', { headers: { Authorization: `Bearer ${token}` } }));
    assert.equal(result.status, 200); assert.ok(!JSON.stringify(await result.json()).includes(token));
    assert.equal((await handleRequest(new Request('https://staging.example.com/api/session', { headers: { Authorization: `Bearer ${token}` } }), store)).status, 401);
    const account = store.register({ name: 'QA Owner', email: 'staging-check@example.com', password: 'strong-password-123', businessName: 'Fictional QA Shop', category: 'grocery', language: 'en' }), session = store.issueSession(account.user.id);
    const request = new Request('https://staging.example.com/api/deployment', { headers: { Cookie: `dukaanset_session=${session}` } });
    assert.equal((await deployment(request)).status, 200);
    const details = await (await deployment(request)).json(); assert.equal(details.publicOrigin, undefined);
    store.db.prepare("UPDATE memberships SET role='staff' WHERE user_id=?").run(account.user.id);
    assert.equal((await deployment(request)).status, 403);
  } finally { store.close(); globalThis.dukaanStore = previous; for (const [key, value] of Object.entries({ DUKAANSET_DEPLOYMENT_TOKEN: previousToken, VERCEL: previousVercel, DUKAANSET_ENV: previousEnvironment })) if (value === undefined) delete process.env[key]; else process.env[key] = value; }
});
test('the default SQLite runtime refuses accidental Vercel execution', () => {
  environment({ VERCEL: '1' }, () => assert.throws(() => getStore(), /persistent backend/));
});
