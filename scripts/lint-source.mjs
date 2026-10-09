import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {checkLocales} from './check-locales.mjs';
const require=createRequire(import.meta.url),parser=require('next/dist/compiled/babel').parser();
const issues=[...checkLocales().issues];let checked=0;
function scan(directory){for(const entry of fs.readdirSync(directory,{withFileTypes:true})){const file=path.join(directory,entry.name);if(entry.isDirectory())scan(file);else if(/\.tsx?$/.test(file)){
 checked++;const source=fs.readFileSync(file,'utf8');if(source.charCodeAt(0)===0xfeff)issues.push(file+': unexpected byte-order mark');
 const ast=parser.parse(source,{sourceType:'module',plugins:['typescript',...(file.endsWith('.tsx')?['jsx']:[])]});
 function visit(node){if(!node||typeof node!=='object')return;if(node.type==='DebuggerStatement')issues.push(file+': debugger statement');if(node.type==='ObjectProperty'&&node.key.name==='defaultValue'&&node.value.type==='StringLiteral')issues.push(file+': literal translation fallback is forbidden; use a central key');for(const[key,value]of Object.entries(node)){if(['loc','comments','tokens'].includes(key))continue;if(Array.isArray(value))value.forEach(visit);else if(value&&typeof value==='object')visit(value);}}visit(ast);
}}}scan('src');
parser.parse(fs.readFileSync('public/sw.js','utf8'),{sourceType:'script'});
if(issues.length){console.error(issues.join('\n'));process.exitCode=1;}else console.log(`Source syntax, localization and no-debugger rules passed (${checked} source files).`);
