import type { MetadataRoute } from 'next';
export default function robots():MetadataRoute.Robots{return {rules:{userAgent:'*',allow:'/',disallow:['/app','/api','/login','/register','/onboarding','/forgot-password','/reset-password']},sitemap:`${process.env.NEXT_PUBLIC_SITE_URL||'http://localhost:3000'}/sitemap.xml`};}
