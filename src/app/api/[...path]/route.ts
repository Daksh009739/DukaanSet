import { handleRequest } from "../../../lib/server/router";
import {withVercelDemo} from '../../../lib/server/vercel-demo';
import {vercelDemoEnabled} from '../../../../scripts/vercel-demo-config.mjs';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
export function GET(request: Request) { return vercelDemoEnabled()?withVercelDemo(request):handleRequest(request); }
export function POST(request: Request) { return vercelDemoEnabled()?withVercelDemo(request):handleRequest(request); }
