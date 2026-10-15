import path from 'node:path';
import {spawn} from 'node:child_process';
import {mkdirSync,readdirSync,writeFileSync,createWriteStream,readFileSync} from 'node:fs';
const output='.local/qa/application18';mkdirSync(output+'/results',{recursive:true});mkdirSync(output+'/logs',{recursive:true});
const requested=process.argv.slice(2),files=requested.length?requested:readdirSync('tests/e2e').filter(name=>name.endsWith('.spec.ts')).sort(),runs=[];
for(const file of files){
 const name=file.replace('.spec.ts',''),log=createWriteStream(output+'/logs/'+name+'.log'),startedAt=new Date().toISOString(),serverMode=/\/auth\/register|privateMail\(/.test(readFileSync('tests/e2e/'+file,'utf8'))?'development':'production';
 const code=await new Promise((resolve,reject)=>{const child=spawn(process.execPath,['node_modules/@playwright/test/cli.js','test','tests/e2e/'+file,'--config','scripts/qa/application18-production.config.ts','--output',output+'/traces/'+name],{env:{...process.env,DUKAANSET_QA_SERVER_MODE:serverMode,DUKAANSET_QA_JSON_REPORT:path.resolve(output+'/results/'+name+'.json')},windowsHide:true,stdio:['ignore','pipe','pipe']});child.stdout.pipe(log);child.stderr.pipe(log);child.on('error',reject);child.on('exit',value=>resolve(value??1));});
 log.end();let stats={},errors=[];try{const result=JSON.parse(readFileSync(output+'/results/'+name+'.json','utf8'));stats=result.stats;errors=result.errors;}catch{}
 runs.push({suite:file,serverMode,startedAt,completedAt:new Date().toISOString(),exitCode:code,stats,errors});writeFileSync(output+'/summary.json',JSON.stringify({checkedAt:new Date().toISOString(),productionByDefault:true,developmentMailTransportForRegistration:true,freshDatabasePerSuite:true,runs},null,2)+'\n');console.log(JSON.stringify(runs.at(-1)));}
if(runs.some(run=>run.exitCode!==0))process.exitCode=1;
