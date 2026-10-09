import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

let runtime = process.env.DUKAANSET_NODE || process.execPath;
const version = candidate => Number(spawnSync(candidate, ['-p', 'process.versions.node.split(".")[0]'], {encoding:'utf8', windowsHide:true}).stdout?.trim() || 0);
if (version(runtime) < 24 && process.platform === 'win32') {
  const installed = path.join(process.env.ProgramFiles || 'C:\\Program Files', 'nodejs', 'node.exe');
  if (existsSync(installed) && version(installed) >= 24) runtime = installed;
}
if (version(runtime) < 24) { console.error('DukaanSet requires Node.js 24 or newer. Set DUKAANSET_NODE to its executable.'); process.exit(1); }
const commands = {
  dev: ['node_modules/next/dist/bin/next', 'dev', '--hostname', '127.0.0.1'],
  build: ['node_modules/next/dist/bin/next', 'build'],
  start: ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1'],
  typecheck: ['node_modules/typescript/bin/tsc', '--noEmit'],
  test: ['--import', 'tsx', '--test', 'tests/backend.test.ts', 'tests/client.test.ts', 'tests/voice.test.ts'],
  e2e: ['scripts/run-e2e.mjs'],
  backup: ['scripts/backup-database.mjs'],
  smoke: ['scripts/check-production.mjs'],
};
const command = commands[process.argv[2]];
if (!command) { console.error('Unknown command.'); process.exit(1); }
const child = spawn(runtime, [...command, ...process.argv.slice(3)], {stdio:'inherit', windowsHide:true, env:process.env});
child.on('error', error => { console.error(error.message); process.exitCode=1; });
child.on('exit', code => { process.exitCode=code ?? 1; });
process.on('SIGINT', ()=>child.kill('SIGINT'));
process.on('SIGTERM', ()=>child.kill('SIGTERM'));
