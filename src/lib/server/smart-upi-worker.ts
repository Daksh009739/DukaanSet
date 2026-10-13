import type {Store} from './store';
import {SmartUpiService} from './smart-upi-service';
import {upiProviderConfigured} from './smart-upi-provider';
const running=new WeakSet<Store>();
/** Poll authorised resources on the durable server; no simulated payment generation. */
export function startUpiWorker(store:Store){if(process.env.DUKAANSET_UPI_WORKER==='0'||!upiProviderConfigured())return;let busy=false;const timer=setInterval(async()=>{if(busy||running.has(store))return;busy=true;running.add(store);try{const connections=store.db.prepare("SELECT business_id,actor_id FROM upi_authorisations WHERE state='active'").all() as {business_id:string;actor_id:string}[];for(const row of connections)await new SmartUpiService(store).sync(row.actor_id,row.business_id).catch(()=>{});}catch{clearInterval(timer);}finally{running.delete(store);busy=false;}},60000);timer.unref();}
