import {cookies,headers} from 'next/headers';
import {locale,localeCookie,type Locale} from '../locale';
import {sessionForCookie} from './auth';
export async function serverLocale():Promise<Locale>{const [jar,requestHeaders]=await Promise.all([cookies(),headers()]);const routeLocale=requestHeaders.get('x-dukaanset-display-locale');if(routeLocale)return locale(routeLocale);const session=sessionForCookie(jar.get('dukaanset_session')?.value);return session?.user.language||locale(jar.get(localeCookie)?.value);}
