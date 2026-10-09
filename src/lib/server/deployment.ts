import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { timingSafeEqual } from 'node:crypto';

export function deploymentEnvironment() {
  return process.env.DUKAANSET_ENV === 'staging' ? 'staging' : process.env.DUKAANSET_ENV === 'production' ? 'production' : 'local';
}
export function readBuildInfo(): { commit: string | null; branch: string | null; builtAt: string | null; version: string | null; environment: string | null; publicOrigin: string | null } {
  try { return JSON.parse(readFileSync(resolve(/* turbopackIgnore: true */ '.dukaanset-build.json'), 'utf8')); } catch { return { commit: null, branch: null, builtAt: null, version: null, environment: null, publicOrigin: null }; }
}
export function buildInfo() {
  const { commit, branch, builtAt, version } = readBuildInfo();
  return { environment: deploymentEnvironment(), commit, branch, builtAt, version };
}
export function deploymentCheckAuthorized(request: Request) {
  const secret = process.env.DUKAANSET_DEPLOYMENT_TOKEN;
  if (!secret || !/^[A-Za-z0-9_-]{43,128}$/.test(secret)) return false;
  const received = request.headers.get('authorization') || '';
  const expected = `Bearer ${secret}`;
  return /^Bearer [A-Za-z0-9_-]{43,128}$/.test(received) && received.length === expected.length && timingSafeEqual(Buffer.from(received), Buffer.from(expected));
}
