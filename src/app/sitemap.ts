import type {MetadataRoute} from 'next';
import {locales} from '@/locales/registry';
import {publicPageKeys} from '@/lib/public-locale';
export default function sitemap():MetadataRoute.Sitemap{if(process.env.DUKAANSET_ENV==='staging')return [];const root=process.env.NEXT_PUBLIC_SITE_URL||'http://localhost:3000';return locales.flatMap(language=>['',...publicPageKeys].map(key=>({url:root+'/'+language+(key?'/'+key:''),changeFrequency:'monthly' as const,priority:key?0.6:1,alternates:{languages:Object.fromEntries(locales.map(l=>[l==='hinglish'?'hi-Latn':l,root+'/'+l+(key?'/'+key:'')]))}})));}
