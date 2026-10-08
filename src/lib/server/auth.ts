import type { Session } from "../contracts";
import { getStore } from "./store";
import { DomainError } from "./validation";

/** Use the HttpOnly cookie value for server-rendered, protected pages. */
export function sessionForCookie(cookieValue: string | undefined): Session | null {
  if (!cookieValue) return null;
  try { const store = getStore(); return store.session(store.authenticate(cookieValue)); }
  catch (error) { if (error instanceof DomainError && error.status === 401) return null; throw error; }
}
