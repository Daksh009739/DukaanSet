import {voiceIntents,type VoiceCommand} from './os';
export interface ConversationSession {key:string;command:VoiceCommand;updatedAt:number;pending:{path:string;body:Record<string,unknown>}|null}
const object=(value:unknown):value is Record<string,unknown>=>Boolean(value&&typeof value==='object'&&!Array.isArray(value));
const strings=(value:unknown,max:number):value is string[]=>Array.isArray(value)&&value.length<=max&&value.every(v=>typeof v==='string'&&v.length<=120);
/** Browser recovery is untrusted input; it cannot introduce new action paths. */
export function readConversationSession(raw:string|null,now=Date.now()):ConversationSession|null {
 try{
  if(!raw||raw.length>500_000)return null;const value=JSON.parse(raw);if(!object(value)||typeof value.key!=='string'||value.key.length>100||!object(value.command)||typeof value.updatedAt!=='number'||!Number.isFinite(value.updatedAt)||value.updatedAt>now+300000)return null;
  const c=value.command;if(!voiceIntents.includes(c.intent as typeof voiceIntents[number])||typeof c.transcript!=='string'||c.transcript.length>5000||!object(c.fields)||Object.keys(c.fields).length>50||!Object.values(c.fields).every(v=>typeof v==='string'&&v.length<=5000)||!strings(c.changed,50)||!strings(c.changedItems,100)||!strings(c.warnings,100)||c.removedProducts!==undefined&&!strings(c.removedProducts,100))return null;
  if(!Array.isArray(c.items)||c.items.length>100||!c.items.every(item=>object(item)&&['id','query','productId','quantity','unit','price'].every(key=>typeof item[key]==='string'&&String(item[key]).length<=150)&&strings(item.candidates,2000)&&['','unit','total','unclear'].includes(String(item.priceBasis))))return null;
  let pending:ConversationSession['pending']=null;
  if(value.pending!==undefined&&value.pending!==null){if(!object(value.pending)||!['/voice-sale','/customers','/payments','/expenses'].includes(String(value.pending.path))||!object(value.pending.body)||value.pending.body.idempotencyKey!==value.key)return null;pending={path:String(value.pending.path),body:value.pending.body};}
  if(!pending&&now-value.updatedAt>30*60*1000)return null;
  return{key:value.key,command:c as unknown as VoiceCommand,updatedAt:value.updatedAt,pending};
 }catch{return null;}
}
