import { getStore } from '@/lib/server/store';
import {redisDemoRepository} from '@/lib/server/vercel-demo';
import {vercelDemoEnabled} from '../../../../scripts/vercel-demo-config.mjs';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
export function GET() {
  if(vercelDemoEnabled())return (async()=>{try{await redisDemoRepository().ping();return Response.json({ok:true},{headers:{'Cache-Control':'no-store'}});}catch{return Response.json({ok:false},{status:503,headers:{'Cache-Control':'no-store'}});}})();
  try {
    getStore().db.prepare('SELECT 1').get();
    return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ ok: false }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
