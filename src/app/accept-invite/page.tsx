import {RestoreLocale} from '@/components/locale-provider';
import {serverLocale} from '@/lib/server/locale';
import {text} from '@/lib/locale';
import { Auth } from '@/components/auth';
export async function generateMetadata(){return {title:text(await serverLocale(),'v3','acceptInvite'),robots:{index:false,follow:false}};}
export default async function Invite(){return <><RestoreLocale language={await serverLocale()}/><Auth mode="invite"/></>;}
