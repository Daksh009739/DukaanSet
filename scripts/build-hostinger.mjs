import {spawnSync} from 'node:child_process';
import {cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {verifyBackendBuild} from './deployment-config.mjs';

if (process.env.DUKAANSET_ENV !== 'staging' || process.env.DUKAANSET_HOSTINGER_STAGING !== '1') throw new Error('Hostinger packaging is limited to the approved staging deployment.');
// Hostinger's shared Linux image can lack the glibc required by native SWC.
// Webpack supports Next's WASM fallback while Turbopack requires native SWC.
const result = spawnSync(process.execPath, ['scripts/run.mjs', 'build', '--webpack'], {stdio:'inherit',windowsHide:true,env:process.env});
if (result.status !== 0) process.exit(result.status ?? 1);
const info = JSON.parse(readFileSync('.dukaanset-build.json','utf8'));
verifyBackendBuild(info, process.env);
const output = path.resolve('.hostinger');
if (path.dirname(output) !== process.cwd() || path.basename(output) !== '.hostinger') throw new Error('Unsafe output directory.');
if (!existsSync('.next/standalone/server.js')) throw new Error('The standalone Next.js server was not generated.');
rmSync(output,{recursive:true,force:true});
mkdirSync(output,{recursive:true});
cpSync('.next/standalone',output,{recursive:true,dereference:true});
// Native Sharp bindings also need their platform's adjacent libvips libraries;
// tracing just the .node entry can omit the DLL/.so loaded by the OS loader.
if (existsSync('node_modules/@img')) cpSync('node_modules/@img',path.join(output,'node_modules/@img'),{recursive:true,dereference:true});
cpSync('public',path.join(output,'public'),{recursive:true});
cpSync('.next/static',path.join(output,'.next/static'),{recursive:true});
for (const name of ['deployment-config.mjs','hostinger-config.mjs']) cpSync('scripts/'+name,path.join(output,name));
cpSync('scripts/start-hostinger.mjs',path.join(output,'start.mjs'));
// A CommonJS entry also works with hosting supervisors that load startup files
// via require(); the guarded ESM startup still owns all initialization.
writeFileSync(path.join(output,'start.js'),"import('./start.mjs').catch(error=>{console.error(error.message);process.exitCode=1;});\n");
cpSync('.dukaanset-build.json',path.join(output,'.dukaanset-build.json'));
function inspect(directory) {
  for (const item of readdirSync(directory,{withFileTypes:true})) {
    const file = path.join(directory,item.name);
    if (item.isDirectory()) inspect(file);
    else if (/^\.env(?:\.|$)|\.sqlite(?:-|$)|^\.data$/i.test(item.name)) throw new Error('Private environment/database file found in deployment output.');
  }
}
inspect(output);
console.log('Hostinger staging package ready: .hostinger, entry start.js');
