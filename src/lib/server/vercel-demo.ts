import {createHash} from 'node:crypto';
import {gzipSync, gunzipSync} from 'node:zlib';
import {Store} from './store';
import {handleRequest, requireSameOrigin} from './router';
import {DomainError, isDomainError} from './validation';
import {vercelDemoSettings} from '../../../scripts/vercel-demo-config.mjs';

export interface DemoRepository {
  read(key:string):Promise<string|null>;
  compareAndSet(key:string, previous:string|null, next:string):Promise<boolean>;
  ping():Promise<void>;
}
const MAX_BYTES=32*1024*1024, MAX_COMPRESSED=4*1024*1024;
const namespace='dukaanset:vercel-demo:v1:';
const sessionToken=(request:Request)=>request.headers.get('cookie')?.match(/(?:^|;\s*)dukaanset_session=([A-Za-z0-9_-]{40,100})(?:;|$)/)?.[1]||null;
const keyFor=(token:string)=>namespace+createHash('sha256').update(token).digest('hex');
const error=(code:string,message:string,status:number)=>Response.json({error:{code,message}},{status,headers:{'Cache-Control':'no-store'}});

/** Single-key atomic compare-and-set prevents separate function instances from
 * overwriting invoices or counting the same payment twice. No local file is data. */
export function redisDemoRepository(fetcher:typeof fetch=fetch):DemoRepository {
  const settings=vercelDemoSettings();
  const command=async(args:(string|number)[])=>{
    const result=await fetcher(settings.redis,{method:'POST',redirect:'error',cache:'no-store',headers:{Authorization:'Bearer '+settings.token,'Content-Type':'application/json'},body:JSON.stringify(args),signal:AbortSignal.timeout(45000)});
    if(!result.ok)throw new Error('Demo storage is unavailable.');
    const body=await result.json() as {result:unknown;error?:string};
    if(body.error)throw new Error('Demo storage rejected the operation.');
    return body.result;
  };
  return {
    // EVAL executes on the primary, including when a database has read replicas.
    async read(key){const value=await command(['EVAL',"return redis.call('GET',KEYS[1])",1,key]);if(value!==null&&typeof value!=='string')throw new Error('Invalid demo snapshot.');return value;},
    async compareAndSet(key,previous,next){return await command(['EVAL',"local current=redis.call('GET',KEYS[1]); if (ARGV[1]=='missing' and not current) or (ARGV[1]=='existing' and current==ARGV[2]) then redis.call('SET',KEYS[1],ARGV[3],'EX',ARGV[4]); return 1; end; return 0;",1,key,previous===null?'missing':'existing',previous||'',next,settings.ttl])===1;},
    async ping(){if(await command(['PING'])!=='PONG')throw new Error('Demo storage is unavailable.');},
  };
}

function decode(snapshot:string) {
  if(snapshot.length>Math.ceil(MAX_COMPRESSED*4/3)+4||!/^[A-Za-z0-9+/]+={0,2}$/.test(snapshot))throw new Error('Invalid demo snapshot.');
  const bytes=gunzipSync(Buffer.from(snapshot,'base64'),{maxOutputLength:MAX_BYTES});
  if(bytes.subarray(0,16).toString()!=='SQLite format 3\0')throw new Error('Invalid demo snapshot.');
  return bytes;
}
function encode(store:Store) {
  const bytes=store.db.serialize();
  if(bytes.length>MAX_BYTES)throw new DomainError('BODY_TOO_LARGE','Demo storage is full. Start a new demo.',413);
  const compressed=gzipSync(bytes);
  if(compressed.length>MAX_COMPRESSED)throw new DomainError('BODY_TOO_LARGE','Demo storage is full. Start a new demo.',413);
  return compressed.toString('base64');
}

/** Reuses the complete existing Store and services with a private, per-session
 * durable snapshot. An unsuccessful CAS never returns a successful mutation. */
export async function withVercelDemo(request:Request, work:(store:Store)=>Response|Promise<Response> = store=>handleRequest(request,store), supplied?:DemoRepository):Promise<Response> {
  let store:Store|undefined;
  try {
    vercelDemoSettings();
    if(request.method==='POST')requireSameOrigin(request);
    const path=new URL(request.url).pathname,creating=path==='/api/auth/demo'&&request.method==='POST';
    if(path.startsWith('/api/auth/')&&!['/api/auth/demo','/api/auth/demo/reset','/api/auth/logout'].includes(path))return error('DEMO_ONLY','This temporary site accepts demo sessions only.',403);
    if(path.includes('/webhook')||path.endsWith('/callback'))return error('DEMO_ONLY','External integrations are unavailable in this demo.',403);
    const token=sessionToken(request);
    if(!creating&&!token)return error('UNAUTHENTICATED','Please open a new demo.',401);
    const repository=supplied||redisDemoRepository(),key=token?keyFor(token):null;
    // Read requests may create audit or settings rows. Retry only these safe
    // reads against the newest version; financial POST retries remain explicit.
    for(let attempt=0;attempt<(request.method==='GET'?4:1);attempt++) {
      const previous=creating?null:await repository.read(key!);
      if(!creating&&!previous)return error('UNAUTHENTICATED','Your demo session has expired. Open a new demo.',401);
      store=new Store(':memory:',previous?decode(previous):undefined);
      const before=store.db.serialize();
      const response=await work(store);
      if(!response.ok)return response;
      const issued=response.headers.get('set-cookie')?.match(/^dukaanset_session=([A-Za-z0-9_-]{40,100});/)?.[1];
      const target=creating&&issued?keyFor(issued):key;
      if(!target)throw new Error('Demo session was not issued.');
      const after=store.db.serialize();
      if(!creating&&Buffer.from(before).equals(Buffer.from(after)))return response;
      if(await repository.compareAndSet(target,previous,encode(store)))return response;
      store.close();store=undefined;
      if(request.method!=='GET')break;
    }
    return error('CONFLICT','Your demo changed in another request. Refresh and try again.',409);
  } catch(cause) {
    return isDomainError(cause)?error(cause.code,cause.message,cause.status):error('UNAVAILABLE','Demo storage is temporarily unavailable. Please try again.',503);
  } finally { store?.close(); }
}
