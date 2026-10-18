import {test} from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {configureHostinger} from '../scripts/hostinger-config.mjs';
import {backendSettings, stagingDemoOnly} from '../scripts/deployment-config.mjs';
import {Store} from '../src/lib/server/store';
import {handleRequest} from '../src/lib/server/router';

const origin='https://qa-stage.hostingersite.com';
const home=process.platform==='win32'?'C:\\hosting-account\\merchant':'/home/merchant';
const settings=()=>({DUKAANSET_ENV:'staging',DUKAANSET_HOSTINGER_STAGING:'1',DUKAANSET_PUBLIC_ORIGIN:origin,AUTH_BASE_URL:origin,NEXT_PUBLIC_SITE_URL:origin,DUKAANSET_STAGING_DEMO_ONLY:'1',NEXT_PUBLIC_DUKAANSET_DEMO_ONLY:'1',AUTH_EMAIL_MODE:'unavailable',DUKAANSET_DEPLOYMENT_TOKEN:'s'.repeat(43)});

test('Hostinger staging data lives in the private account home and keeps the same path across releases',()=>{
  const a=settings(),b=settings();const first=configureHostinger(a,home),second=configureHostinger(b,home);
  assert.deepEqual(first,second);
  assert.equal(first.root,path.join(home,'.dukaanset-staging','qa-stage.hostingersite.com'));
  assert.equal(first.database,path.join(first.root,'dukaanset.sqlite'));
  assert.equal(backendSettings(a).environment,'staging');
  for(const extra of [{DUKAANSET_ENV:'production'},{DUKAANSET_HOSTINGER_STAGING:'0'},{DUKAANSET_PUBLIC_ORIGIN:'https://qa-stage.hostingersite.com.evil.test'},{DATABASE_PATH:path.join(home,'public_html','records.sqlite')}])assert.throws(()=>configureHostinger({...settings(),...extra},home));
  for(const bad of [path.parse(home).root,path.join(home,'hbuilds','versions','123'),path.join(home,'public_html'),path.join(home,'nodejs')])assert.throws(()=>configureHostinger(settings(),bad));
});

test('only explicitly labelled staging can run without hosted email; normal hosted email checks stay strict',()=>{
  const env=settings();configureHostinger(env,home);assert.equal(backendSettings(env).environment,'staging');
  assert.equal(stagingDemoOnly(env),true);
  for(const extra of [{DUKAANSET_STAGING_DEMO_ONLY:'0'},{NEXT_PUBLIC_DUKAANSET_DEMO_ONLY:'0'},{AUTH_EMAIL_MODE:'file'},{AUTH_EMAIL_MODE:'resend'},{DUKAANSET_ENV:'production'}])assert.throws(()=>backendSettings({...env,...extra}));
  assert.equal(stagingDemoOnly({...env,DUKAANSET_ENV:'production'}),false);
});

test('demo-only staging rejects real authentication and real sessions while preserving isolated demo workflows',async()=>{
  const env=settings(),saved=Object.fromEntries(Object.keys(env).map(key=>[key,process.env[key]]));
  const store=new Store(':memory:');
  const account=store.register({name:'Private owner',email:'owner-stage@example.test',password:'test-password-stage-123',businessName:'Private shop',category:'grocery',language:'en'});
  const realToken=store.issueSession(account.user.id);
  const originalUsers=store.db.prepare('SELECT id,email FROM users WHERE demo=0').all();
  Object.assign(process.env,env);
  const post=(action:string,body:unknown={})=>handleRequest(new Request(origin+'/api/auth/'+action,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(body)}),store);
  try{
    assert.equal((await post('register',{name:'No account'})).status,403);
    assert.equal((await post('login',{email:'owner-stage@example.test',password:'test-password-stage-123'})).status,403);
    assert.equal((await post('forgot',{email:'owner-stage@example.test'})).status,403);
    assert.throws(()=>store.authenticate(realToken),/demo sessions only/);
    const real=await handleRequest(new Request(origin+'/api/session',{headers:{Cookie:'dukaanset_session='+realToken}}),store);
    assert.equal(real.status,401);
    const demo=await post('demo',{language:'hi'});assert.equal(demo.status,201);
    const cookie=demo.headers.get('set-cookie')!;assert.match(cookie,/Secure/);
    const session=await demo.json();assert.equal(session.user.demo,true);
    const read=await handleRequest(new Request(origin+'/api/businesses/'+session.businesses[0].id+'/state',{headers:{Cookie:cookie.split(';')[0]}}),store);
    assert.equal(read.status,200);
    assert.deepEqual(store.db.prepare('SELECT id,email FROM users WHERE demo=0').all(),originalUsers);
  }finally{
    store.close();for(const [key,value] of Object.entries(saved))if(value===undefined)delete process.env[key];else process.env[key]=value;
  }
});
