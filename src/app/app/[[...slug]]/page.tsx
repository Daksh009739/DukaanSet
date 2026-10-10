import {serverLocale} from '@/lib/server/locale';
import {text} from '@/lib/locale';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Workspace } from '@/components/workspace';
const sections=new Set(['sales','stock','products','customers','purchases','suppliers','payments','expenses','reports','todays-work','daily-closing','settings','ai','help','demand']);
export default async function AppPage({params}: {params:Promise<{slug?:string[]}>}) {
  const {slug=[]}=await params;
  const [section,id,record]=slug,uuid=(value:string)=>/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value);
  const nested=slug.length===3&&uuid(record)&&((section==='reports'&&id==='closings')||(section==='purchases'&&id==='orders'));
  if(slug.length>3||(slug.length===3&&!nested)||(section&&!sections.has(section))||(id&&!['sales','customers','stock','products','settings','purchases','suppliers','payments','reports'].includes(section)))notFound();
  if(['stock','products'].includes(section)&&id&&!['history','voice','voice-history'].includes(id)&&!uuid(id))notFound();
  if(section==='reports'&&id&&id!=='closings'||section==='purchases'&&id==='orders'&&!record)notFound();
  return <Suspense fallback={<p>{text(await serverLocale(),'translation','loading')}</p>}><Workspace slug={slug}/></Suspense>;
}
