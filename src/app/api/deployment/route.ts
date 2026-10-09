import { buildInfo, readBuildInfo, deploymentCheckAuthorized } from '@/lib/server/deployment';
import { getStore } from '@/lib/server/store';
import { backendSettings, verifyBackendBuild } from '../../../../scripts/deployment-config.mjs';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'no-store' };
export function GET(request: Request) {
  const internal = deploymentCheckAuthorized(request);
  try {
    if (internal) { backendSettings(process.env); verifyBackendBuild(readBuildInfo(), process.env); }
    const store = getStore();
    if (!internal) {
      const token = request.headers.get('cookie')?.match(/(?:^|;\s*)dukaanset_session=([A-Za-z0-9_-]{40,100})(?:;|$)/)?.[1];
      const user = store.authenticate(token || null);
      if (!store.db.prepare("SELECT 1 FROM memberships WHERE user_id=? AND role='owner' LIMIT 1").get(user)) return Response.json({ error: { code: 'FORBIDDEN', message: 'Only business owners can inspect build information.' } }, { status: 403, headers });
    }
    store.db.prepare('SELECT 1').get();
    const info = buildInfo();
    // The internal gate also checks the public origin. Never return secret values,
    // backend hostnames, volume paths or provider configuration to the browser.
    return Response.json({ ...info, ready: true, ...(internal ? { publicOrigin: process.env.DUKAANSET_PUBLIC_ORIGIN || null } : {}) }, { headers });
  } catch {
    return Response.json({ error: { code: 'UNAVAILABLE', message: 'Build information is unavailable.' } }, { status: internal ? 503 : 401, headers });
  }
}
