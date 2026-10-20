import { buildInfo, readBuildInfo, deploymentCheckAuthorized } from '@/lib/server/deployment';
import { getStore, type Store } from '@/lib/server/store';
import {withVercelDemo} from '@/lib/server/vercel-demo';
import {vercelDemoEnabled, vercelDemoSettings} from '../../../../scripts/vercel-demo-config.mjs';
import { backendSettings, verifyBackendBuild } from '../../../../scripts/deployment-config.mjs';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
const headers = { 'Cache-Control': 'no-store' };
export function GET(request: Request) {
  if(vercelDemoEnabled())return withVercelDemo(request,store=>inspect(request,store));
  return inspect(request);
}
function inspect(request:Request, provided?:Store) {
  const internal = deploymentCheckAuthorized(request);
  try {
    if (internal) { if(vercelDemoEnabled())vercelDemoSettings();else backendSettings(process.env); verifyBackendBuild(readBuildInfo(), process.env); }
    const store = provided||getStore();
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
