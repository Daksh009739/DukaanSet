import {readFileSync, mkdirSync, accessSync, constants} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname} from 'node:path';
import {configureHostinger} from './hostinger-config.mjs';
import {backendSettings, verifyBackendBuild} from './deployment-config.mjs';

try {
  process.chdir(dirname(fileURLToPath(import.meta.url)));
  process.umask(0o077);
  const {root} = configureHostinger(process.env);
  backendSettings(process.env);
  verifyBackendBuild(JSON.parse(readFileSync('.dukaanset-build.json', 'utf8')), process.env);
  mkdirSync(root, {recursive:true, mode:0o700});
  accessSync(root, constants.W_OK);
  process.env.HOSTNAME = process.env.HOSTNAME_BIND || '0.0.0.0';
  process.env.DUKAANSET_CLOSING_WORKER = '1';
  await import('./server.js');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
