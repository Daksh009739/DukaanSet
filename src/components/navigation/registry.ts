import {ShieldCheck,CalendarDays,LayoutDashboard,ShoppingCart,ReceiptText,Package,UsersRound,Wallet,Truck,MessageSquare,ChartNoAxesCombined,Timer,BrainCircuit,Sparkles,CircleHelp,Settings2,type LucideIcon} from 'lucide-react';
import type {V3State} from '@/lib/v3-contracts';

export type NavEntry={id:string;key:string;namespace?:'workspace'|'v3';href:string;icon:LucideIcon;badge?:number|'AI';badgeKey?:string};
export function routeActive(path:string,href:string){
  if(href==='/app')return path===href;
  if(href==='/app/sales'&&(path==='/app/sales/new'||path.startsWith('/app/sales/new/')))return false;
  if(href==='/app/stock'&&(path==='/app/products'||path.startsWith('/app/products/')))return true;
  return path===href||path.startsWith(href+'/');
}
/** A single authorization-aware source for the rail, expanded navigation and drawer. */
export function navigationFor(state:V3State|null){
  const p=state?.configuration.permissions,f=state?.configuration.features;
  const primary:NavEntry[]=[{id:'home',key:'v16.dashboard',namespace:'workspace',href:'/app',icon:LayoutDashboard}];
  const add=(allowed:boolean|undefined,entry:NavEntry)=>{if(allowed)primary.push(entry);};
  add(p?.sales,{id:'sale',key:'newBill',href:'/app/sales/new',icon:ShoppingCart});
  add(p?.sales,{id:'bills',key:'bills',href:'/app/sales',icon:ReceiptText});
  add(p?.inventory||p?.sales||p?.demand,{id:'stock',key:'v16.stock',namespace:'workspace',href:'/app/stock',icon:Package});
  add(p?.customers,{id:'customers',key:state&&['services','salon'].includes(state.business.category)?'growth.clients':'customers',...state&&['services','salon'].includes(state.business.category)?{namespace:'workspace' as const}:{},href:'/app/customers',icon:UsersRound});
  add(p?.payments,{id:'payments',key:'payments',href:'/app/payments',icon:Wallet});
  add(p?.purchases,{id:'purchases',key:'purchases',href:'/app/purchases',icon:Truck});
  add(p?.purchases,{id:'suppliers',key:'suppliers',href:'/app/suppliers',icon:Truck});
  add(p?.reports,{id:'expenses',key:'expenses',href:'/app/expenses',icon:ReceiptText});
  add(p?.demand&&f?.demandPulse,{id:'demand',key:'demandPulse',namespace:'v3',href:'/app/demand',icon:MessageSquare,...state?.demand.readyFollowUps?{badge:state.demand.readyFollowUps,badgeKey:'sidebar.followUps'}:{}});
  add(p?.reports,{id:'reports',key:'reports',href:'/app/reports',icon:ChartNoAxesCombined});
  add(p?.reports&&f?.dailyClosing,{id:'closing',key:'v16.closing',namespace:'workspace',href:'/app/daily-closing',icon:Timer});
  add(p?.reports&&f?.assistant,{id:'profit',key:'v16.profit',namespace:'workspace',href:'/app/intelligence',icon:BrainCircuit,badge:'AI'});
  const tools:NavEntry[]=[];
  if(f?.todaysWork)tools.push({id:'work',key:'work',href:'/app/todays-work',icon:LayoutDashboard});
  if(p?.reports&&f?.assistant)tools.push({id:'ai',key:'ai',href:'/app/ai',icon:Sparkles,badge:'AI'});
  tools.push({id:'trust',key:'growth.trustTitle',namespace:'workspace',href:'/app/trust',icon:ShieldCheck});
  if(p?.sales)tools.push({id:'business-tools',key:'growth.businessTools',namespace:'workspace',href:'/app/business-tools',icon:CalendarDays});
  tools.push({id:'help',key:'help',href:'/app/help',icon:CircleHelp});
  const settings:NavEntry={id:'settings',key:'settings',href:'/app/settings',icon:Settings2};
  return {primary,tools,settings};
}
