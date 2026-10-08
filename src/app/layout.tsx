import type { Metadata, Viewport } from 'next';
import './globals.css';
import '@/components/marketing.css';
import { PwaRegistration } from '@/components/pwa';

const siteUrl=process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
export const metadata:Metadata={metadataBase:new URL(siteUrl),title:{default:'DukaanSet — Apni Dukaan, Sab Set.',template:'%s · DukaanSet'},description:'Sales, stock, customers and everyday hisaab. A simpler business workspace for Indian shopkeepers.',manifest:'/manifest.webmanifest',icons:{icon:'/icon.svg',apple:'/brand/icon-192.png'},openGraph:{title:'DukaanSet — Apni Dukaan, Sab Set.',description:'Your business. All in one place.',images:['/social.png'],type:'website'},twitter:{card:'summary_large_image'}};
export const viewport:Viewport={width:'device-width',initialScale:1,themeColor:'#103B36'};
export default function RootLayout({children}: {children:React.ReactNode}) {return <html lang="en" dir="ltr"><body>{children}<PwaRegistration/></body></html>;}
