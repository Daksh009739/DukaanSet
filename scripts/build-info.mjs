import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const git = (...args) => spawnSync('git', args, { encoding: 'utf8', windowsHide: true }).stdout?.trim() || '';
export function writeBuildInfo(env = process.env) {
  const raw = env.DUKAANSET_GIT_SHA || env.RENDER_GIT_COMMIT || env.GITHUB_SHA || git('rev-parse', 'HEAD');
  const branch = env.DUKAANSET_GIT_BRANCH || env.RENDER_GIT_BRANCH || env.GITHUB_HEAD_REF || env.GITHUB_REF_NAME || git('branch', '--show-current');
  const info = { commit: /^[a-f0-9]{40}$/i.test(raw) ? raw : null, branch: /^[a-zA-Z0-9/_.-]{1,100}$/.test(branch) ? branch : null, builtAt: new Date().toISOString(), version: JSON.parse(readFileSync('package.json', 'utf8')).version, environment: env.DUKAANSET_ENV || 'local', publicOrigin: env.NEXT_PUBLIC_SITE_URL || null };
  writeFileSync('.dukaanset-build.json', JSON.stringify(info, null, 2));
  return info;
}
