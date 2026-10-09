import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Workspace } from '@/components/workspace';
const sections=new Set(['sales','stock','products','customers','purchases','suppliers','payments','expenses','reports','todays-work','daily-closing','settings','ai','help']);
export default async function AppPage({params}: {params:Promise<{slug?:string[]}>}) {
  const {slug=[]}=await params;
  if(slug.length>2 || (slug[0]&&!sections.has(slug[0])) || (slug[1]&&!['sales','customers','stock','products','settings'].includes(slug[0])))notFound();
  if(['stock','products'].includes(slug[0])&&slug[1]&&!['history','voice','voice-history'].includes(slug[1]))notFound();
  return <Suspense fallback={<p>Loading DukaanSet…</p>}><Workspace slug={slug}/></Suspense>;
}
