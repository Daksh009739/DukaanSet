import type {Store} from './store';
import type {OverdueCustomer,ReminderContext,ReminderPreview} from '../payment-companion';
import {ClosingService,safeSum} from './closing';
import {DeliveryService} from './whatsapp';
import {DomainError,keys,object,language,integer} from './validation';
import {money} from '../client';
import {text} from '../locale';

/** Invoice balances are the only source of overdue amounts. Linking observations never enters this calculation. */
export class CustomerReminderService {
 constructor(readonly store:Store){}
 private scope(user:string,business:string){this.store.assertPermission(user,business,'customers');}
 overdue(user:string,business:string):OverdueCustomer[]{
  this.scope(user,business);const day=new Intl.DateTimeFormat('en-CA',{timeZone:new ClosingService(this.store).settings(business).timezone,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const rows=this.store.db.prepare("SELECT c.id,c.name,c.phone,SUM(i.balance_paise) amount,MIN(i.due_date) oldest,COUNT(*) count FROM invoices i JOIN customers c ON c.id=i.customer_id AND c.business_id=i.business_id WHERE i.business_id=? AND i.status!='cancelled' AND i.balance_paise>0 AND i.due_date IS NOT NULL AND i.due_date<? GROUP BY c.id ORDER BY oldest,c.id").all(business,day);
  return rows.map(r=>({id:String(r.id),name:String(r.name),phoneSuffix:String(r.phone).replace(/\D/g,'').slice(-4),amountPaise:safeSum([Number(r.amount)]),oldestDueDate:String(r.oldest),daysOverdue:Math.floor((Date.parse(day+'T12:00Z')-Date.parse(String(r.oldest)+'T12:00Z'))/86400000),invoiceCount:Number(r.count)}));
 }
 context(user:string,business:string,id:string):ReminderContext {
  this.scope(user,business);const customer=this.store.db.prepare('SELECT name,phone FROM customers WHERE business_id=? AND id=?').get(business,id);if(!customer)throw new DomainError('NOT_FOUND','Customer not found.',404);
  const communication=new DeliveryService(this.store).preferences(user,business,id),phone=communication.number||String(customer.phone),settings=new ClosingService(this.store).settings(business),day=new Intl.DateTimeFormat('en-CA',{timeZone:settings.timezone,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()),due=this.overdue(user,business).find(c=>c.id===id),pref=this.store.db.prepare('SELECT * FROM customer_reminder_preferences WHERE business_id=? AND customer_id=?').get(business,id),consent=Boolean(pref?.consent&&pref.phone_snapshot===phone&&pref.channel==='manual'&&!communication.optedOut);
  return{customerId:id,name:String(customer.name),phone,optedOut:communication.optedOut,overduePaise:due?.amountPaise||0,oldestDueDate:due?.oldestDueDate||null,invoiceCount:due?.invoiceCount||0,day,timezone:settings.timezone,preferences:{consent,channel:pref?.channel==='manual'?'manual':'none',language:language(pref?.language||(communication.updatedAt?communication.language:this.store.session(user).user.language)),revision:Number(pref?.revision||0)},eligible:Boolean(due&&consent&&phone.replace(/\D/g,'').length>=7)};
 }
 savePreferences(user:string,business:string,id:string,raw:unknown){
  const input=object(raw);keys(input,['consent','channel','language','revision','confirm','phone']);if(input.confirm!==true||typeof input.consent!=='boolean'||!['none','manual'].includes(String(input.channel)))throw new DomainError('INVALID_INPUT','Confirm the customer communication preference.');
  return this.store.transaction(()=>{const current=this.context(user,business,id),revision=integer(input.revision,'Revision'),lang=language(input.language);if(revision!==current.preferences.revision||input.phone!==current.phone)throw new DomainError('CONFLICT','Customer communication details changed. Refresh and review.',409);if(input.consent&&(current.optedOut||input.channel!=='manual'||current.phone.replace(/\D/g,'').length<7))throw new DomainError('INVALID_INPUT','A customer-approved contact number without an opt-out is required.');
   this.store.db.prepare('INSERT INTO customer_reminder_preferences VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(business_id,customer_id) DO UPDATE SET consent=excluded.consent,channel=excluded.channel,language=excluded.language,phone_snapshot=excluded.phone_snapshot,revision=excluded.revision,actor_id=excluded.actor_id,updated_at=excluded.updated_at').run(business,id,input.consent?1:0,String(input.channel),lang,current.phone,revision+1,user,new Date().toISOString());this.store.audit(user,business,'customer.reminder.preference',id+' '+(input.consent?'consented':'withdrawn'));return this.context(user,business,id);
  });
 }
 preview(user:string,business:string,id:string,raw:unknown):ReminderPreview {
  const input=object(raw);keys(input,['confirm','revision','amountPaise','day']);if(input.confirm!==true)throw new DomainError('INVALID_INPUT','Review and approve the reminder.');
  return this.store.transaction(()=>{const current=this.context(user,business,id);if(integer(input.revision,'Revision')!==current.preferences.revision||input.amountPaise!==current.overduePaise||input.day!==current.day)throw new DomainError('CONFLICT','The balance or communication preferences changed. Review again.',409);if(!current.eligible)throw new DomainError('REMINDER_NOT_ELIGIBLE','Only overdue invoices with current customer consent can be reminded.',409);
   const businessName=this.store.session(user).businesses.find(b=>b.id===business)!.name,message=text(current.preferences.language,'workspace','smartUpi.reminderMessage',{name:current.name,business:businessName,amount:money(current.overduePaise,current.preferences.language),date:current.oldestDueDate!});this.store.audit(user,business,'customer.reminder.approved',id+' manual draft only');return{message,amountPaise:current.overduePaise,invoiceCount:current.invoiceCount,asOf:new Date().toISOString(),delivery:'manual',sent:false};
  });
 }
}
