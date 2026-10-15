import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,readdirSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {Store} from '../src/lib/server/store';
import {DocumentCaptureService} from '../src/lib/server/document-capture';
import sharp from 'sharp';
import {randomUUID} from 'node:crypto';
const script=path.resolve('scripts/backup-database.mjs');
function scratch(){return mkdtempSync(path.join(tmpdir(),'dukaanset-backup-qa-'));}
function clean(directory:string){assert.ok(path.resolve(directory).startsWith(path.join(path.resolve(tmpdir()),'dukaanset-backup-qa-')));rmSync(directory,{recursive:true,force:true});}

test('private backup CLI preserves WAL ledger history and original scan evidence across restore',async()=>{const directory=scratch(),source=path.join(directory,'source.sqlite'),store=new Store(source);let restored:Store|undefined;try{const session=store.register({name:'Backup QA',email:randomUUID()+'@example.test',password:'Backup-fixture-only-2026',businessName:'Backup QA'}),user=session.user.id,business=session.businesses[0].id,product=store.createProduct(user,business,{name:'Backup rice',unit:'kg',pricePaise:10000,costPaise:6000,quantityMilli:10000}),customer=store.createContact(user,business,'customers',{name:'Backup customer'});store.createInvoice(user,business,{items:[{productId:product.id,quantityMilli:1000}],customerId:customer.id,payments:[{method:'cash',amountPaise:5000}],idempotencyKey:randomUUID()});const bytes=await sharp({create:{width:32,height:32,channels:3,background:'#f4fbf7'}}).png().toBuffer(),capture=await new DocumentCaptureService(store).upload(user,business,'inventory',bytes,'image/png','private.png'),before=store.state(user,business),result=spawnSync(process.execPath,[script,source],{cwd:directory,windowsHide:true,encoding:'utf8'});assert.equal(result.status,0,result.stderr);const files=readdirSync(path.join(directory,'.data','backups')).filter(name=>name.endsWith('.sqlite'));assert.equal(files.length,1);restored=new Store(path.join(directory,'.data','backups',files[0]));const after=restored.state(user,business);for(const key of ['invoices','payments','products','customers','movements']as const)assert.deepEqual(after[key],before[key]);assert.deepEqual(new DocumentCaptureService(restored).evidence(user,business,capture.id,true).bytes,bytes);assert.equal(restored.db.prepare('PRAGMA integrity_check').get()!.integrity_check,'ok');assert.deepEqual(restored.db.prepare('PRAGMA foreign_key_check').all(),[]);assert.equal(restored.db.prepare('PRAGMA user_version').get()!.user_version,17);}finally{restored?.close();store.close();clean(directory);}});

test('backup refuses a missing source and never fabricates a successful backup file',()=>{const directory=scratch();try{mkdirSync(path.join(directory,'empty'));const result=spawnSync(process.execPath,[script,path.join(directory,'missing.sqlite')],{cwd:directory,windowsHide:true,encoding:'utf8'});assert.notEqual(result.status,0);assert.match(result.stderr,/no backup was created/);assert.deepEqual(readdirSync(directory),['empty']);}finally{clean(directory);}});
