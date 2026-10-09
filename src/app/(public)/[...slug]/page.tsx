import {notFound} from 'next/navigation';
import {MarketingHome,PublicPage} from '@/components/marketing';
import type {PublicPageKey} from '@/components/marketing-content';
import {publicRoute,publicMetadata,publicPageKeys} from '@/lib/public-locale';
import {locales} from '@/locales/registry';
type Props={params:Promise<{slug:string[]}>};
export function generateStaticParams(){return [...publicPageKeys.map(key=>({slug:key.split('/')})),...locales.flatMap(language=>[{slug:[language]},...publicPageKeys.map(key=>({slug:[language,...key.split('/')]}))])].filter(p=>p.slug.join('/')!=='hi');}
export async function generateMetadata({params}:Props){const route=publicRoute((await params).slug);return publicMetadata(route.language,route.key);}
export default async function DetailPage({params}:Props){const {language,key}=publicRoute((await params).slug);if(!key)return <MarketingHome language={language}/>;if(!publicPageKeys.includes(key))notFound();return <PublicPage pageKey={key as PublicPageKey} language={language}/>;}
