import {httpsOrigin} from './deployment-config.mjs';

/** @param {Record<string,string|undefined>} [env] */
export const vercelDemoEnabled = (env = process.env) => env.DUKAANSET_VERCEL_DEMO === '1';

// This adapter is a demonstration deployment, never a production database mode.
/** @param {Record<string,string|undefined>} [env] */
export function vercelDemoSettings(env = process.env) {
  if (!vercelDemoEnabled(env) || env.DUKAANSET_ENV !== 'staging' || env.DUKAANSET_STAGING_DEMO_ONLY !== '1' || env.NEXT_PUBLIC_DUKAANSET_DEMO_ONLY !== '1' || env.AUTH_EMAIL_MODE !== 'unavailable') throw new Error('Vercel demo hosting requires explicitly labelled, demo-only staging.');
  if ((env.VERCEL_GIT_COMMIT_REF || env.DUKAANSET_GIT_BRANCH) !== 'dev') throw new Error('Only the dev branch can use Vercel demo hosting.');
  const origin = httpsOrigin(env.DUKAANSET_PUBLIC_ORIGIN, 'DUKAANSET_PUBLIC_ORIGIN');
  if (origin !== httpsOrigin(env.AUTH_BASE_URL, 'AUTH_BASE_URL') || origin !== httpsOrigin(env.NEXT_PUBLIC_SITE_URL, 'NEXT_PUBLIC_SITE_URL')) throw new Error('Demo authentication and site origins must match.');
  const redis = new URL(env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL || 'https://invalid.local');
  const token = env.KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN;
  if (redis.protocol !== 'https:' || !redis.hostname.endsWith('.upstash.io') || redis.username || redis.password || redis.pathname !== '/' || redis.search || redis.hash || !token || token.length < 20) throw new Error('Configure the connected private Upstash Redis store.');
  // Existing merchant files and hosted backend volumes must never enter this mode.
  if (env.DATABASE_PATH || env.DUKAANSET_DATA_ROOT || env.DUKAANSET_HOSTINGER_STAGING === '1') throw new Error('Vercel demo hosting must not use an existing merchant database.');
  return {origin, redis:redis.origin, token, ttl:604800};
}
