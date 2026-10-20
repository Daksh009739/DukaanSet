import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash,randomUUID} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {vercelDemoSettings} from '../scripts/vercel-demo-config.mjs';
import {withVercelDemo,redisDemoRepository,type DemoRepository} from '../src/lib/server/vercel-demo';
import {handleRequest} from '../src/lib/server/router';
import {Store} from '../src/lib/server/store';
import {sessionForCookie} from '../src/lib/server/auth';

const origin='https://dukaanset-demo.vercel.app';
const settings={DUKAANSET_VERCEL_DEMO:'1',DUKAANSET_ENV:'staging',DUKAANSET_STAGING_DEMO_ONLY:'1',NEXT_PUBLIC_DUKAANSET_DEMO_ONLY:'1',AUTH_EMAIL_MODE:'unavailable',DUKAANSET_GIT_BRANCH:'dev',DUKAANSET_PUBLIC_ORIGIN:origin,AUTH_BASE_URL:origin,NEXT_PUBLIC_SITE_URL:origin,UPSTASH_REDIS_REST_URL:'https://fixture.upstash.io',UPSTASH_REDIS_REST_TOKEN:'test-only-not-a-real-token-123456'};
async function configured(work:()=>Promise<void>){const keys=[...Object.keys(settings),'DATABASE_PATH','DUKAANSET_DATA_ROOT','DUKAANSET_HOSTINGER_STAGING','VERCEL_GIT_COMMIT_REF','KV_REST_API_URL','KV_REST_API_TOKEN'],saved=Object.fromEntries(keys.map(k=>[k,process.env[k]]));for(const k of keys)delete process.env[k];Object.assign(process.env,settings);try{await work();}finally{for(const[k,v]of Object.entries(saved))if(v===undefined)delete process.env[k];else process.env[k]=v;}}
class Repository implements DemoRepository {
  values=new Map<string,string>();writes=0;reject=false;
  async read(key:string){return this.values.get(key)||null;}
  async compareAndSet(key:string,previous:string|null,next:string){if(this.reject||(this.values.get(key)||null)!==previous)return false;this.values.set(key,next);this.writes++;return true;}
  async ping(){}
}
const request=(path:string,cookie='',body?:unknown,requestOrigin=origin)=>new Request(origin+path,{method:body===undefined?'GET':'POST',headers:{Origin:requestOrigin,...cookie?{Cookie:cookie}:{},...body===undefined?{}:{'Content-Type':'application/json'}},...body===undefined?{}:{body:JSON.stringify(body)}});
async function demo(repo:Repository){const response=await withVercelDemo(request('/api/auth/demo','',{language:'en'}),undefined,repo);assert.equal(response.status,201);assert.match(response.headers.get('set-cookie')!,/Secure/);return{cookie:response.headers.get('set-cookie')!.split(';')[0],session:await response.json()};}
async function operation(repo:Repository,cookie:string,path:string,body?:unknown){return withVercelDemo(request(path,cookie,body),undefined,repo);}

test('Vercel demo configuration rejects production, real volumes, wrong branches and credential exfiltration endpoints',()=>{
  assert.equal(vercelDemoSettings(settings).ttl,604800);
  for(const extra of [{DUKAANSET_ENV:'production'},{DUKAANSET_STAGING_DEMO_ONLY:'0'},{NEXT_PUBLIC_DUKAANSET_DEMO_ONLY:'0'},{AUTH_EMAIL_MODE:'resend'},{DUKAANSET_GIT_BRANCH:'main'},{VERCEL_GIT_COMMIT_REF:'feature/a'},{UPSTASH_REDIS_REST_URL:'https://fixture.upstash.io.evil.test'},{UPSTASH_REDIS_REST_URL:'https://fixture.upstash.io/redirect'},{UPSTASH_REDIS_REST_TOKEN:''},{DATABASE_PATH:'/tmp/merchant.sqlite'},{DUKAANSET_DATA_ROOT:'/private/records'},{DUKAANSET_HOSTINGER_STAGING:'1'},{AUTH_BASE_URL:'https://other.vercel.app'}])assert.throws(()=>vercelDemoSettings({...settings,...extra}));
});
test('snapshots restore the existing schema and cannot replace an on-disk merchant database',()=>{
  const first=new Store(':memory:');try{first.demo('hi');const snapshot=first.db.serialize(),second=new Store(':memory:',snapshot);try{assert.equal(second.db.prepare('SELECT COUNT(*) n FROM users').get()!.n,1);assert.equal(second.db.prepare('PRAGMA user_version').get()!.user_version,17);assert.throws(()=>new Store('merchant.sqlite',snapshot),/isolated memory/);}finally{second.close();}}finally{first.close();}
});
test('demo sessions survive independent function instances and retain language and tenant isolation',async()=>configured(async()=>{
  const repo=new Repository(),a=await demo(repo),b=await demo(repo),base='/api/businesses/'+a.session.businesses[0].id;
  assert.equal((await operation(repo,a.cookie,'/api/account/language',{language:'hi'})).status,200);
  assert.equal((await(await operation(repo,a.cookie,'/api/session')).json()).user.language,'hi');
  assert.equal((await operation(repo,b.cookie,base+'/state')).status,404);
  assert.equal((await operation(repo,'','/api/session')).status,401);
  assert.equal((await operation(repo,a.cookie,'/api/auth/register',{})).status,403);
  assert.equal((await withVercelDemo(request('/api/auth/demo','',{},'https://evil.test'),undefined,repo)).status,403);
  assert.equal((await operation(repo,a.cookie,'/api/auth/logout',{})).status,200);
  assert.equal((await operation(repo,a.cookie,'/api/session')).status,401);
}));
test('invoice idempotency, stock and immutable payment history persist across snapshot round trips',async()=>configured(async()=>{
  const repo=new Repository(),{cookie,session}=await demo(repo),base='/api/businesses/'+session.businesses[0].id;
  const seed=await(await operation(repo,cookie,base+'/state')).json();
  const p=await(await operation(repo,cookie,base+'/products',{name:'Snapshot test',sku:'SNAP-1',unit:'pcs',quantityMilli:3000,pricePaise:10000,costPaise:6000,minStockMilli:0})).json();
  const payload={idempotencyKey:randomUUID(),items:[{productId:p.id,quantityMilli:1000}],payments:[{method:'cash',amountPaise:10000}]};
  const first=await(await operation(repo,cookie,base+'/invoices',payload)).json(),second=await(await operation(repo,cookie,base+'/invoices',payload)).json();assert.equal(first.id,second.id);assert.equal(first.totalPaise,10000);
  const state=await(await operation(repo,cookie,base+'/state')).json();assert.equal(state.products.find((x:{id:string})=>x.id===p.id).quantityMilli,2000);assert.equal(state.payments.filter((x:{invoiceId:string})=>x.invoiceId===first.id).length,1);
  for(const original of seed.payments)assert.deepEqual(state.payments.find((x:{id:string})=>x.id===original.id),original);
}));

test('blank previews reuse onboarding and real calculations without inserting fictional shops or financial records',async()=>configured(async()=>{
  const repo=new Repository(),created=await withVercelDemo(request('/api/auth/demo','',{language:'hi',scenario:'blank'}),undefined,repo);
  assert.equal(created.status,201);const cookie=created.headers.get('set-cookie')!.split(';')[0],guest=await created.json();
  assert.equal(guest.user.demo,true);assert.equal(guest.user.language,'hi');assert.equal(guest.user.name,'Guest');assert.deepEqual(guest.businesses,[]);
  const setup={name:'QA Empty Business',merchantName:'QA Owner',category:'grocery',idempotencyKey:randomUUID()};
  const onboard=await operation(repo,cookie,'/api/onboarding',setup);assert.equal(onboard.status,201);const session=await onboard.json();
  assert.equal(session.user.name,'QA Owner');assert.equal(session.businesses.length,1);const base='/api/businesses/'+session.businesses[0].id;
  const again=await(await operation(repo,cookie,'/api/onboarding',setup)).json();assert.deepEqual(again.businesses,session.businesses);
  const state=await(await operation(repo,cookie,base+'/state')).json();for(const key of ['products','customers','suppliers','invoices','payments','purchases','expenses'])assert.equal(state[key].length,0,key);
  const product=await(await operation(repo,cookie,base+'/products',{name:'Entered item',unit:'pcs',quantityMilli:2000,pricePaise:10000,costPaise:6000})).json();
  const invoice=await(await operation(repo,cookie,base+'/invoices',{items:[{productId:product.id,quantityMilli:1000}],payments:[{method:'cash',amountPaise:10000}],idempotencyKey:randomUUID()})).json();
  assert.equal(invoice.totalPaise,10000);assert.equal(invoice.paidPaise,10000);
  assert.equal((await operation(repo,cookie,'/api/auth/register',{})).status,403);
  assert.equal((await operation(repo,cookie,'/api/auth/demo/reset',{})).status,200);
  const cleared=await(await operation(repo,cookie,base+'/state')).json();assert.equal(cleared.products.length,0);assert.equal(cleared.invoices.length,0);assert.equal(cleared.customers.length,0);
  assert.equal((await(await operation(repo,cookie,'/api/session')).json()).businesses.length,1);
}));
test('concurrent financial requests cannot overwrite each other and an explicit retry creates one additional invoice',async()=>configured(async()=>{
  const repo=new Repository(),{cookie,session}=await demo(repo),base='/api/businesses/'+session.businesses[0].id;
  const p=await(await operation(repo,cookie,base+'/products',{name:'Concurrent stock',sku:'CAS-1',unit:'pcs',quantityMilli:3000,pricePaise:10000,costPaise:6000,minStockMilli:0})).json();
  const payloads=[0,1].map(()=>({idempotencyKey:randomUUID(),items:[{productId:p.id,quantityMilli:1000}],payments:[{method:'cash',amountPaise:10000}]}));
  let arrived=0,release:()=>void=()=>{};const gate=new Promise<void>(resolve=>release=resolve);
  const results=await Promise.all(payloads.map(body=>{const req=request(base+'/invoices',cookie,body);return withVercelDemo(req,async store=>{arrived++;if(arrived===2)release();await gate;return handleRequest(req,store);},repo);}));
  assert.deepEqual(results.map(r=>r.status).sort(),[201,409]);const lost=results.findIndex(r=>r.status===409);assert.equal((await operation(repo,cookie,base+'/invoices',payloads[lost])).status,201);
  const state=await(await operation(repo,cookie,base+'/state')).json();assert.equal(state.products.find((x:{id:string})=>x.id===p.id).quantityMilli,1000);assert.equal(state.invoices.filter((i:{items:{productId:string}[]})=>i.items.some(x=>x.productId===p.id)).length,2);
}));
test('CAS failure and corrupt snapshots fail closed without returning success or replacing records',async()=>configured(async()=>{
  const repo=new Repository(),{cookie,session}=await demo(repo),before=[...repo.values];repo.reject=true;
  const response=await operation(repo,cookie,'/api/account/language',{language:'hi'});assert.equal(response.status,409);assert.equal(response.headers.get('set-cookie'),null);assert.deepEqual([...repo.values],before);
  repo.reject=false;repo.values.set(before[0][0],'invalid');assert.equal((await operation(repo,cookie,'/api/session')).status,503);assert.equal(repo.values.get(before[0][0]),'invalid');
  assert.equal((await operation(repo,cookie,'/api/upi/razorpay/webhook',{})).status,403);assert.ok(session.user.demo);
}));
test('non-demo snapshots cannot authenticate in the demo adapter',async()=>configured(async()=>{
  const repo=new Repository(),store=new Store(':memory:');
  try{const account=store.register({name:'Private owner',email:'private@example.test',password:'safe-test-password-123',businessName:'Private records',category:'grocery',language:'en'}),token=store.issueSession(account.user.id),key='dukaanset:vercel-demo:v1:'+createHash('sha256').update(token).digest('hex');repo.values.set(key,gzipSync(store.db.serialize()).toString('base64'));assert.equal((await operation(repo,'dukaanset_session='+token,'/api/session')).status,401);}finally{store.close();}
}));
test('an interrupted storage acknowledgement cannot duplicate an invoice when the merchant retries the same request',async()=>configured(async()=>{
  const repo=new Repository(),{cookie,session}=await demo(repo),base='/api/businesses/'+session.businesses[0].id;
  const state=await(await operation(repo,cookie,base+'/state')).json(),product=state.products.find((p:{quantityMilli:number;pricePaise:number})=>p.quantityMilli>=1000&&p.pricePaise>0),payload={idempotencyKey:randomUUID(),items:[{productId:product.id,quantityMilli:1000}],payments:[{method:'cash',amountPaise:product.pricePaise}]},original=repo.compareAndSet.bind(repo);
  repo.compareAndSet=async(...args)=>{const saved=await original(...args);if(saved)throw new Error('Simulated lost acknowledgement');return saved;};
  assert.equal((await operation(repo,cookie,base+'/invoices',payload)).status,503);repo.compareAndSet=original;
  const retry=await operation(repo,cookie,base+'/invoices',payload);assert.equal(retry.status,201);const invoice=await retry.json(),after=await(await operation(repo,cookie,base+'/state')).json();assert.equal(after.invoices.filter((i:{id:string})=>i.id===invoice.id).length,1);assert.equal(after.payments.filter((p:{invoiceId:string})=>p.invoiceId===invoice.id).length,1);assert.equal(after.products.find((p:{id:string})=>p.id===product.id).quantityMilli,product.quantityMilli-1000);
}));
test('protected server-rendered pages use the shared demo session and respect logout without a local database',async()=>configured(async()=>{
  const repo=new Repository(),{cookie}=await demo(repo),savedFetch=globalThis.fetch,savedVercel=process.env.VERCEL;
  process.env.VERCEL='1';
  globalThis.fetch=(async(_url:RequestInfo|URL,options:RequestInit)=>{const args=JSON.parse(String(options.body));return Response.json({result:args[0]==='PING'?'PONG':args[1].includes('SET')?Number(await repo.compareAndSet(args[3],args[4]==='missing'?null:args[5],args[6])):await repo.read(args[3])});})as typeof fetch;
  try{const token=cookie.split('=')[1];assert.equal((await sessionForCookie(token))?.user.demo,true);assert.equal(await sessionForCookie(undefined),null);assert.equal(await sessionForCookie('invalid'),null);assert.equal((await operation(repo,cookie,'/api/auth/logout',{})).status,200);assert.equal(await sessionForCookie(token),null);}finally{globalThis.fetch=savedFetch;if(savedVercel===undefined)delete process.env.VERCEL;else process.env.VERCEL=savedVercel;}
}));
test('Redis transport uses primary reads and atomic bounded CAS without redirects or public credentials',async()=>configured(async()=>{
  const commands:unknown[][]=[];const repo=redisDemoRepository((async(url:RequestInfo|URL,options:RequestInit)=>{assert.equal(url,'https://fixture.upstash.io');assert.equal(options.redirect,'error');const args=JSON.parse(String(options.body));commands.push(args);return Response.json({result:args[0]==='PING'?'PONG':args[1].includes('SET')?1:null});}) as typeof fetch);
  assert.equal(await repo.read('key'),null);assert.equal(await repo.compareAndSet('key',null,'snapshot'),true);await repo.ping();assert.equal(commands[0][0],'EVAL');assert.equal(commands[1].at(-1),604800);
  const bad=redisDemoRepository((async()=>new Response('unavailable',{status:503}))as typeof fetch);await assert.rejects(bad.ping(),/unavailable/);
}));
