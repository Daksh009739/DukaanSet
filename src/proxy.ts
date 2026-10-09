import {NextRequest,NextResponse} from 'next/server';
/** Trusted route locale for SSR. Incoming client headers are always replaced. */
export function proxy(request:NextRequest){const headers=new Headers(request.headers);headers.delete('x-dukaanset-display-locale');const path=request.nextUrl.pathname,segment=path.split('/')[1];if(['en','hi','hinglish'].includes(segment))headers.set('x-dukaanset-display-locale',segment);else if(!/^\/(?:app|onboarding|login|register|forgot-password|reset-password|verify-email|accept-invite)(?:\/|$)/.test(path))headers.set('x-dukaanset-display-locale','en');return NextResponse.next({request:{headers}});}
export const config={matcher:['/((?!api|_next|.*\\..*).*)']};
