import path from 'node:path';
import { isIP } from 'node:net';

export function httpsOrigin(value, name) {
  let url;
  try { url = new URL(value); } catch { throw new Error(`${name} must be a configured HTTPS origin.`); }
  if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash || isIP(url.hostname.replace(/^\[|\]$/g, '')) || /^(localhost|.*\.local$)/i.test(url.hostname)) {
    throw new Error(`${name} must be a public HTTPS origin without credentials, paths or queries.`);
  }
  return url.origin;
}

export function gatewaySettings(env) {
  const environment = env.VERCEL_ENV === 'production' ? 'production' : env.VERCEL_ENV === 'preview' ? 'staging' : env.DUKAANSET_ENV;
  if (!['staging', 'production'].includes(environment)) throw new Error('Select a staging or production deployment environment.');
  const branch = env.VERCEL_GIT_COMMIT_REF || env.DUKAANSET_GIT_BRANCH;
  if (branch !== (environment === 'staging' ? 'dev' : 'main')) throw new Error('Only dev Preview and main Production are supported; provision isolated backends before enabling PR previews.');
  const commit = env.VERCEL_GIT_COMMIT_SHA || env.DUKAANSET_GIT_SHA;
  if (!/^[a-f0-9]{40}$/i.test(commit || '')) throw new Error('A full Git commit SHA is required.');
  const origin = httpsOrigin(env.DUKAANSET_BACKEND_ORIGIN, 'DUKAANSET_BACKEND_ORIGIN');
  const publicOrigin = httpsOrigin(env.DUKAANSET_PUBLIC_ORIGIN, 'DUKAANSET_PUBLIC_ORIGIN');
  if (origin === publicOrigin) throw new Error('Backend and public origins must differ to prevent a proxy loop.');
  if (!/^[A-Za-z0-9_-]{43,128}$/.test(env.DUKAANSET_DEPLOYMENT_TOKEN || '')) throw new Error('Configure a dedicated random deployment-check token on both hosts.');
  for (const key of ['DATABASE_PATH', 'DATABASE_URL', 'RESEND_API_KEY', 'OPENAI_API_KEY', 'AUTH_MAIL_DIRECTORY']) {
    if (env[key]) throw new Error(`Remove ${key} from the Vercel gateway; application secrets and data belong on the isolated backend.`);
  }
  return { environment, branch, commit, origin, publicOrigin, token: env.DUKAANSET_DEPLOYMENT_TOKEN };
}

export function backendSettings(env) {
  const environment = env.DUKAANSET_ENV || 'local';
  if (!['local', 'staging', 'production'].includes(environment)) throw new Error('DUKAANSET_ENV must be local, staging or production.');
  if (environment === 'local') return { environment };
  if (env.VERCEL === '1') throw new Error('The SQLite backend requires a persistent Node host, not Vercel Functions.');
  const publicOrigin = httpsOrigin(env.DUKAANSET_PUBLIC_ORIGIN, 'DUKAANSET_PUBLIC_ORIGIN');
  if (httpsOrigin(env.AUTH_BASE_URL, 'AUTH_BASE_URL') !== publicOrigin || httpsOrigin(env.NEXT_PUBLIC_SITE_URL, 'NEXT_PUBLIC_SITE_URL') !== publicOrigin) {
    throw new Error('Authentication and site URLs must match this environment public origin.');
  }
  if (!path.isAbsolute(env.DUKAANSET_DATA_ROOT || '') || !path.isAbsolute(env.DATABASE_PATH || '')) throw new Error('Configure an absolute persistent data root and database path.');
  const relative = path.relative(env.DUKAANSET_DATA_ROOT, env.DATABASE_PATH);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative) || /(?:^|[\\/])tmp(?:[\\/]|$)/i.test(env.DATABASE_PATH)) throw new Error('Database must be inside the designated persistent volume, outside temporary storage.');
  if (environment === 'staging' && !/(?:^|[\\/])[^\\/]*staging[^\\/]*(?:[\\/]|$)/i.test(env.DUKAANSET_DATA_ROOT)) throw new Error('Staging needs its own clearly named staging volume.');
  if (env.AUTH_EMAIL_MODE !== 'resend' || !env.RESEND_API_KEY || !env.AUTH_EMAIL_FROM) throw new Error('Hosted authentication requires Resend credentials and a verified sender.');
  if (!/^[A-Za-z0-9_-]{43,128}$/.test(env.DUKAANSET_DEPLOYMENT_TOKEN || '')) throw new Error('Configure the dedicated deployment-check token.');
  return { environment, publicOrigin };
}

export function gatewayOutput(settings) {
  /** @type {Record<string, string>} */
  const headers = { 'Cache-Control': 'no-store', 'CDN-Cache-Control': 'no-store', 'Vercel-CDN-Cache-Control': 'no-store' };
  if (settings.environment === 'staging') headers['X-Robots-Tag'] = 'noindex, nofollow, noarchive';
  return { version: 3, routes: [{ src: '^/(.*)$', dest: `${settings.origin}/$1`, headers }] };
}

export function verifyBackendBuild(info, env) {
  if ((env.DUKAANSET_ENV || 'local') === 'local') return;
  if (!info || !/^[a-f0-9]{40}$/i.test(info.commit || '') || info.branch !== (env.DUKAANSET_ENV === 'staging' ? 'dev' : 'main') || info.environment !== env.DUKAANSET_ENV || info.publicOrigin !== env.DUKAANSET_PUBLIC_ORIGIN || !Number.isFinite(Date.parse(info.builtAt || '')) || !info.version) {
    throw new Error('Build metadata, static-page environment or site origin does not match this release.');
  }
}

export async function checkBackend(settings, fetcher = fetch) {
  // Never follow a redirect carrying the check token to another host.
  const response = await fetcher(`${settings.origin}/api/deployment`, { headers: { Authorization: `Bearer ${settings.token}` }, redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error('Backend deployment check did not succeed.');
  const info = await response.json();
  if (info.environment !== settings.environment || info.branch !== settings.branch || info.commit !== settings.commit || info.publicOrigin !== settings.publicOrigin || !info.ready || !info.builtAt || !info.version) {
    throw new Error('Backend environment, origin, readiness or commit does not match this deployment.');
  }
  return info;
}
