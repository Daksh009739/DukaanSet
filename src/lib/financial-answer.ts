import {money} from './client';
import {text,type Locale} from './locale';
import type {VoiceReport} from './contracts';
/** Deliberately narrow recorded-total queries; forecasts and explanations go to the configured read-only adapter. */
export function financialQuestion(question:string):'sales'|'cash'|'upi'|'expenses'|null {
 const value=question.normalize('NFKC').toLowerCase().trim().replace(/[?।.]+$/,'');
 const prefix='(?:(?:today|aaj(?: ki| ka)?|आज(?: की| का)?|this week|is hafte(?: ki| ka)?|इस सप्ताह(?: की| का)?|all time|kul|कुल)\\s+)?';
 const suffix='(?:\\s+(?:kitni(?: hui| hai| thi)?|kitna(?: hua| hai| tha)?|कितनी(?: हुई| है| थी)?|कितना(?: हुआ| है| था)?))?';
 for(const [kind,words]of [['sales','sales|bikri|बिक्री'],['cash','cash(?: collections?)?|nakad vasooli|नकद वसूली'],['upi','upi(?: collections?)?'],['expenses','expenses?|kharcha|kharch|खर्च']]as const)if(new RegExp('^'+prefix+'(?:'+words+')'+suffix+'$','u').test(value))return kind;
 return null;
}
export function financialAnswer(kind:NonNullable<ReturnType<typeof financialQuestion>>,report:VoiceReport,language:Locale):string {
 const label=kind==='sales'?'report0':kind==='cash'?'report2':kind==='upi'?'report3':'report6';
 const amount=kind==='sales'?report.salesPaise:kind==='cash'?report.cashPaise:kind==='upi'?report.upiPaise:report.expensesPaise;
 return text(language,'translation','recordedAnswerIntro')+'\n'+text(language,'voiceos',label)+': '+money(amount,language)+(kind==='sales'?'\n'+text(language,'voiceos','report1')+': '+new Intl.NumberFormat('en-IN-u-nu-latn').format(report.bills):'');
}
