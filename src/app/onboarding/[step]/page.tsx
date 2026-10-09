import {RestoreLocale} from '@/components/locale-provider';
import {serverLocale} from '@/lib/server/locale';
import {text} from '@/lib/locale';
import { Onboarding } from '@/components/onboarding';
export async function generateMetadata(){return {title:text(await serverLocale(),'v3','onboarding'),robots:{index:false,follow:false}};}
export default async function Setup(){return <><RestoreLocale language={await serverLocale()}/><Onboarding/></>;}
