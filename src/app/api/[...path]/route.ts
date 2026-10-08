import { handleRequest } from "../../../lib/server/router";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export function GET(request: Request) { return handleRequest(request); }
export function POST(request: Request) { return handleRequest(request); }
