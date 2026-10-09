import {createInstance,type i18n,type TOptions,type ThirdPartyModule} from 'i18next';
import {locale,messages,formatLocales,type Locale,type Namespace} from '@/locales/registry';
export {locale,languageTags,formatLocales,locales,type Locale} from '@/locales/registry';
export const localeCookie='ds_locale';
export function saveLocale(value:string){if(typeof document!=='undefined')document.cookie=`${localeCookie}=${locale(value)}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol==='https:'?'; Secure':''}`;}
export function initialBrowserLocale():Locale {if(typeof document==='undefined')return 'en';const match=document.cookie.split('; ').find(part=>part.startsWith(localeCookie+'='));return locale(match?.split('=')[1]);}
export function createLocaleEngine(language:string,plugin?:ThirdPartyModule):i18n {
 const instance=createInstance();if(plugin)instance.use(plugin);
 void instance.init({resources:messages,lng:locale(language),supportedLngs:['en','hi','hinglish'],fallbackLng:false,load:'currentOnly',defaultNS:'translation',initAsync:false,interpolation:{escapeValue:false},returnEmptyString:false,parseMissingKeyHandler:key=>{if(process.env.NODE_ENV!=='test')console.warn('[localization] Missing key:',key);return messages[locale(instance.language)].translation.translationUnavailable;}});
 return instance;
}
const engines=new Map<Locale,i18n>();
export function text(language:string,namespace:Namespace,key:string,options:TOptions={}):string{const selected=locale(language);let engine=engines.get(selected);if(!engine){engine=createLocaleEngine(selected);engines.set(selected,engine);}return String(engine.t(key,{...options,ns:namespace}));}
export function unitText(unit:string,language:string='en',count?:number):string{const key=unit.toLowerCase();const labels=messages[locale(language)].translation.units;if(!Object.hasOwn(labels,key))return unit;return count===undefined?labels[key as keyof typeof labels]:text(language,'translation','quantityUnits.'+key,{count});}
export function dateText(value:string|Date,language:string,options:Intl.DateTimeFormatOptions={day:'numeric',month:'long',year:'numeric'}):string {const date=new Date(typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)?value+'T12:00:00+05:30':value);return Number.isNaN(date.getTime())?'—':new Intl.DateTimeFormat(formatLocales[locale(language)],{timeZone:'Asia/Kolkata',hourCycle:'h23',...options}).format(date);}
export type SystemMessage={namespace:Namespace;key:string;parameters:Record<string,string>}|{literal:string};
const templates:{namespace:Namespace;key:string;value:string}[]=[];
function flatten(namespace:Namespace,value:unknown,prefix=''){if(!value||typeof value!=='object')return;for(const [key,item]of Object.entries(value)){if(typeof item==='string')templates.push({namespace,key:prefix+key,value:item});else flatten(namespace,item,prefix+key+'.');}}
for(const resources of Object.values(messages))for(const [namespace,value]of Object.entries(resources))flatten(namespace as Namespace,value);
const escape=(value:string)=>value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
/** Only for interface notifications/errors; never translate merchant records through this adapter. */
export function systemMessage(value:string):SystemMessage {
 const exact=templates.find(template=>template.value===value);if(exact)return {namespace:exact.namespace,key:exact.key,parameters:{}};
 for(const template of templates){if(!template.value.includes('{{'))continue;const names:string[]=[];let source='',last=0;for(const match of template.value.matchAll(/\{\{\s*(\w+)\s*\}\}/g)){source+=escape(template.value.slice(last,match.index))+'(.+?)';names.push(match[1]);last=match.index!+match[0].length;}source+=escape(template.value.slice(last));const match=new RegExp('^'+source+'$','u').exec(value);if(match)return {namespace:template.namespace,key:template.key,parameters:Object.fromEntries(names.map((name,index)=>[name,match[index+1]]))};}
 return {literal:value};
}
export function renderSystemMessage(value:SystemMessage|string|null,language:string):string {if(!value)return '';const descriptor=typeof value==='string'?systemMessage(value):value;if('literal'in descriptor)return descriptor.literal;const parameters={...descriptor.parameters};if(parameters.unit){for(const resources of Object.values(messages)){const found=Object.entries(resources.translation.units).find(([,label])=>label===parameters.unit);if(found){parameters.unit=unitText(found[0],language);break;}}}return text(language,descriptor.namespace,descriptor.key,parameters);}
export function localizedError(error:unknown,language:string):string {if(error&&typeof error==='object'&&'code'in error&&error.code==='INSUFFICIENT_STOCK'&&'details'in error){const detail=error.details as {name?:unknown;quantityMilli?:unknown;unit?:unknown};if(typeof detail?.name==='string'&&typeof detail.quantityMilli==='number'&&Number.isSafeInteger(detail.quantityMilli)&&typeof detail.unit==='string')return text(language,'translation','stockErrorDetail',{name:detail.name,quantity:new Intl.NumberFormat('en-IN-u-nu-latn',{maximumFractionDigits:3}).format(detail.quantityMilli/1000),unit:unitText(detail.unit,language,detail.quantityMilli/1000)});}
 const code=error&&typeof error==='object'&&'code'in error?String(error.code):'UNKNOWN',selected=locale(language),errors=messages[selected].translation.errors;return Object.hasOwn(errors,code)?errors[code as keyof typeof errors]:text(selected,'translation',code==='OFFLINE'?'noConnection':'invalidInput');}
