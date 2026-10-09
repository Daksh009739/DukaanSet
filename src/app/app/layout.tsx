import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { sessionForCookie } from '@/lib/server/auth';
import { WorkspaceLayout } from '@/components/workspace';
export const dynamic='force-dynamic';
export const runtime='nodejs';
export const metadata:Metadata={title:'Your business',robots:{index:false,follow:false}};
export default async function PrivateLayout({children}: {children:React.ReactNode}) {const jar=await cookies();if(!sessionForCookie(jar.get('dukaanset_session')?.value))redirect('/login');return <WorkspaceLayout>{children}</WorkspaceLayout>;}
