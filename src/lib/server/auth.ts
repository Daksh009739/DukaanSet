import type { Session } from "../contracts";
import {cache} from 'react';
import { getStore } from "./store";
import { DomainError, isDomainError } from "./validation";
import {withVercelDemo} from './vercel-demo';
import {vercelDemoEnabled,vercelDemoSettings} from '../../../scripts/vercel-demo-config.mjs';

/** Use the HttpOnly cookie value for server-rendered, protected pages. */
export const sessionForCookie=cache(async(cookieValue: string | undefined): Promise<Session | null> => {
  if (!cookieValue) return null;
  if(vercelDemoEnabled()) {
    if(!/^[A-Za-z0-9_-]{40,100}$/.test(cookieValue))return null;
    const response=await withVercelDemo(new Request(vercelDemoSettings().origin+'/api/session',{headers:{Cookie:'dukaanset_session='+cookieValue}}),store=>Response.json(store.session(store.authenticate(cookieValue))));
    if(response.status===401)return null;
    if(!response.ok)throw new DomainError('UNAVAILABLE','Demo session storage is unavailable.',503);
    return response.json();
  }
  try { const store = getStore(); return store.session(store.authenticate(cookieValue)); }
  catch (error) { if (isDomainError(error) && error.status === 401) return null; throw error; }
});
