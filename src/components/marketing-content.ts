import {CheckCheck,CircleHelp,Leaf,Package,ReceiptText,ShieldCheck,Smartphone,Sparkles,Store,Wallet,Wrench} from 'lucide-react';
import {copy,type Locale} from '@/locales/registry';
export type PublicPageKey=keyof ReturnType<typeof getPublicPages>;
const icons={features:CheckCheck,'features/billing':ReceiptText,'features/inventory':Package,'features/udhar':Wallet,'features/ai':Sparkles,'business-types':Store,'business-types/grocery':Store,'business-types/hardware':Wrench,'business-types/vegetables':Leaf,'business-types/mobile':Smartphone,pricing:Wallet,'how-it-works':CheckCheck,help:CircleHelp,contact:CircleHelp,about:Store,privacy:ShieldCheck,terms:ShieldCheck,security:ShieldCheck};
function getPublicPages(){return copy('marketing','en').pages;}
export const publicPageContent=getPublicPages();
export function publicPage(key:PublicPageKey,language:Locale){return {...copy('marketing',language).pages[key],icon:icons[key]};}
export function publicHref(path:string,language:Locale):string{const plain=path.replace(/^\/(?:en|hi|hinglish)(?=\/|$)/,'')||'/';return '/'+language+(plain==='/'?'':plain);}
