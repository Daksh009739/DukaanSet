import type { Metadata, Viewport } from 'next';
import './globals.css';
import '@/components/locale.css';
import '@/components/marketing.css';
import '@/components/brand-experience.css';
import { PwaRegistration } from '@/components/pwa';
import {LocaleProvider} from '@/components/locale-provider';
import {SystemText} from '@/components/localized-data';
import {serverLocale} from '@/lib/server/locale';
import {languageTags,text} from '@/lib/locale';

const siteUrl=process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
export async function generateMetadata():Promise<Metadata>{const language=await serverLocale(),title='DukaanSet — '+text(language,'translation','tagline'),description=text(language,'marketing','heroDescription');return {metadataBase:new URL(siteUrl),title:{default:title,template:'%s · DukaanSet'},description,manifest:'/manifest.webmanifest',icons:{icon:'/icon.svg',apple:'/brand/icon-192.png'},openGraph:{title,description,images:['/social.png'],type:'website'},twitter:{card:'summary_large_image'}};}
export const viewport:Viewport={width:'device-width',initialScale:1,themeColor:'#103B36'};
export default async function RootLayout({children}: {children:React.ReactNode}) {const language=await serverLocale();return <html lang={languageTags[language]} dir="ltr"><body><LocaleProvider initialLanguage={language}>{process.env.DUKAANSET_ENV==='staging'&&<div className="environment-banner" role="status"><SystemText value={text(language,'translation','stagingBanner')}/></div>}{children}<PwaRegistration/></LocaleProvider></body></html>;}
