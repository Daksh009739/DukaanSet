import { spawn } from 'node:child_process';
import { readFileSync, mkdirSync, accessSync, constants } from 'node:fs';
import { backendSettings, verifyBackendBuild } from './deployment-config.mjs';
// New database, WAL and auth files on the private volume belong to this user.
process.umask(0o077);
try {
  const settings = backendSettings(process.env);
  if (settings.environment !== 'local') {
    const info = JSON.parse(readFileSync('.dukaanset-build.json', 'utf8'));
    verifyBackendBuild(info, process.env);
    mkdirSync(process.env.DUKAANSET_DATA_ROOT, { recursive: true });
    accessSync(process.env.DUKAANSET_DATA_ROOT, constants.W_OK);
  }
  const child = spawn(process.execPath, ['scripts/run.mjs', 'start', '--hostname', process.env.HOSTNAME_BIND || '0.0.0.0', '--port', process.env.PORT || '3000'], { stdio: 'inherit', windowsHide: true });
  child.on('error', error => { console.error(error.message); process.exitCode = 1; });
  child.on('exit', code => { process.exitCode = code ?? 1; });
  process.on('SIGTERM', () => child.kill('SIGTERM'));
  process.on('SIGINT', () => child.kill('SIGINT'));
} catch (error) { console.error(error.message); process.exitCode = 1; }
