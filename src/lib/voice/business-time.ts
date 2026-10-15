import type {ClosingSettings} from '../closing-contracts';
/** Match the trading-day boundary used by reports and closing, without importing server code. */
export function voiceBusinessDay(settings?:Pick<ClosingSettings,'timezone'|'cutoff'>,at=new Date()):string{
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:settings?.timezone||'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(at);
 const part=(type:string)=>parts.find(p=>p.type===type)!.value,day=part('year')+'-'+part('month')+'-'+part('day');
 if(part('hour')+':'+part('minute')>=(settings?.cutoff||'00:00'))return day;
 const prior=new Date(day+'T12:00:00Z');prior.setUTCDate(prior.getUTCDate()-1);return prior.toISOString().slice(0,10);
}
