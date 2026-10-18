import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import sharp from 'sharp';
import jsQR from 'jsqr';
import {Store} from '../src/lib/server/store';
import {SmartUpiService} from '../src/lib/server/smart-upi-service';
import {handleRequest} from '../src/lib/server/router';

test('dashboard QR uses the exact confirmed primary destination and never changes financial records',async()=>{
 const store=new Store(':memory:');try{const s=store.register({name:'QR QA',email:randomUUID()+'@example.test',password:'Fixture-only-2026',businessName:'QR QA'}),user=s.user.id,business=s.businesses[0].id,service=new SmartUpiService(store);
 assert.deepEqual(await service.paymentDisplay(user,business),{destination:null});
 service.saveDestination(user,business,{upiId:'merchant.saved@bank',payee:'Merchant & Sons',confirmDestination:true,idempotencyKey:randomUUID()});const before=store.state(user,business),first=(await service.paymentDisplay(user,business)).destination!;assert.equal(first.upiId,'merchant.saved@bank');assert.equal(first.payee,'Merchant & Sons');assert.equal(first.state,'saved');
 const image=await sharp(Buffer.from(first.qrDataUrl.split(',')[1],'base64')).ensureAlpha().raw().toBuffer({resolveWithObject:true}),decoded=jsQR(new Uint8ClampedArray(image.data),image.info.width,image.info.height);assert.ok(decoded);const uri=new URL(decoded.data);assert.equal(uri.searchParams.get('pa'),first.upiId);assert.equal(uri.searchParams.get('pn'),first.payee);assert.equal(uri.searchParams.get('cu'),'INR');assert.equal(uri.searchParams.has('am'),false);assert.equal(uri.searchParams.has('tr'),false);assert.deepEqual(store.state(user,business),before);
 service.saveDestination(user,business,{upiId:'next.destination@bank',payee:'Other till',primary:true,confirmDestination:true,idempotencyKey:randomUUID()});assert.equal((await service.paymentDisplay(user,business)).destination!.upiId,'next.destination@bank');
 const other=store.register({name:'Other',email:randomUUID()+'@example.test',password:'Fixture-only-2026',businessName:'Other'});await assert.rejects(()=>service.paymentDisplay(other.user.id,business),{code:'NOT_FOUND'});assert.deepEqual(await service.paymentDisplay(other.user.id,other.businesses[0].id),{destination:null});
 const token=store.issueSession(user),url=`http://localhost/api/businesses/${business}/smart-upi/display`,response=await handleRequest(new Request(url,{headers:{Cookie:'dukaanset_session='+token}}),store);assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'private, no-store');assert.equal((await response.json()).destination.upiId,'next.destination@bank');assert.equal((await handleRequest(new Request(url),store)).status,401);
 }finally{store.close();}
});
