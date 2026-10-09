import { mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { setTimeout } from 'node:timers/promises';
import { gatewaySettings, gatewayOutput, checkBackend } from './deployment-config.mjs';

try {
  const settings = gatewaySettings(process.env);
  for (const task of ['typecheck', 'test']) {
    const result = spawnSync(process.execPath, ['scripts/run.mjs', task], { stdio: 'inherit', env: process.env });
    if (result.status !== 0) throw new Error(`${task} failed; no gateway published.`);
  }
  const deadline = Date.now() + 600_000;
  while (true) {
    try { await checkBackend(settings); break; }
    catch {
      if (Date.now() >= deadline) throw new Error('Backend is not ready at this commit. Inspect its deploy logs and push/redeploy after fixing it. Previous Vercel deployment remains unchanged.');
      console.log('Waiting for the isolated backend to finish deploying this commit…');
      await setTimeout(10_000);
    }
  }
  mkdirSync('.vercel/output', { recursive: true });
  writeFileSync('.vercel/output/config.json', JSON.stringify(gatewayOutput(settings), null, 2));
  console.log(`Gateway verified: ${settings.environment}, ${settings.branch}, ${settings.commit}.`);
} catch (error) { console.error(error.message); process.exitCode = 1; }
