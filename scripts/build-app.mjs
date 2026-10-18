import {spawnSync} from 'node:child_process';
// The ordinary build is unchanged. The explicitly selected hosting environment
// also assembles its traced server package after that same Next.js build.
const args=process.env.DUKAANSET_HOSTINGER_STAGING==='1'
  ? ['scripts/build-hostinger.mjs']
  : ['scripts/run.mjs','build',...process.argv.slice(2)];
const result=spawnSync(process.execPath,args,{stdio:'inherit',windowsHide:true,env:process.env});
process.exit(result.status??1);
