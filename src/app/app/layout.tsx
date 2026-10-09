import {serverLocale} from '@/lib/server/locale';
import {text} from '@/lib/locale';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { sessionForCookie } from '@/lib/server/auth';
import { WorkspaceLayout } from '@/components/workspace';
export const dynamic='force-dynamic';
export const runtime='nodejs';
export async function generateMetadata():Promise<Metadata>{return {title:text(await serverLocale(),'translation','home'),robots:{index:false,follow:false}};}
export default async function PrivateLayout({children}: {children:React.ReactNode}) {const jar=await cookies(),session=sessionForCookie(jar.get('dukaanset_session')?.value);if(!session)redirect('/login');return <WorkspaceLayout initialLanguage={session.user.language}>{children}</WorkspaceLayout>;}
