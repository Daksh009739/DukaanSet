import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';
const args = process.argv.slice(2);
// A fresh test server isolates mocks and process-local throttles between suites.
// This does not change or disable the application's production request limits.
const runs = args.length ? [args] : readdirSync('tests/e2e').filter(name => name.endsWith('.spec.ts')).sort().map(name => [`tests/e2e/${name}`]);
const summary = [];
for (const suite of runs) {
  const stem = path.basename(suite[0], '.spec.ts');
  const testEnv = { ...process.env }; delete testEnv.NO_COLOR;
  if (!args.length) testEnv.PLAYWRIGHT_HTML_OUTPUT_DIR = `playwright-report/${stem}`;
  const command = args.length ? suite : [...suite, '--output', `test-results/${stem}`];
  const code = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['node_modules/@playwright/test/cli.js', 'test', ...command], { stdio: 'inherit', windowsHide: true, env: testEnv });
    child.on('error', reject); child.on('exit', value => resolve(value ?? 1));
  });
  summary.push({ suite, exitCode: code }); mkdirSync('.local', { recursive: true }); writeFileSync('.local/e2e-summary.json', JSON.stringify({ checkedAt: new Date().toISOString(), runs: summary }, null, 2));
  if (code) { process.exitCode = Number(code); break; }
}
