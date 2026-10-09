import type { Store } from "./store";
import { getStore } from "./store";
import { DomainError, isDomainError } from "./validation";
import { createHash } from "node:crypto";
import { decodePhoto, MAX_IMAGE_BYTES } from "./images";
import { SaaSService } from './saas';
import { AuthenticationService } from './authentication';
import { authorize } from './access';
import { AssistantService } from './assistant';

const COOKIE = "dukaanset_session";
const buckets = new Map<string, { count: number; expires: number }>();
function throttle(key: string, limit: number, windowMs = 60_000) {
  const now = Date.now();
  if (buckets.size > 5000) for (const [id, bucket] of buckets) if (bucket.expires <= now) buckets.delete(id);
  const bucket = buckets.get(key);
  if (!bucket || bucket.expires <= now) { buckets.set(key, { count: 1, expires: now + windowMs }); return; }
  if (bucket.count >= limit) throw new DomainError("RATE_LIMITED", "Too many requests. Please try again shortly.", 429);
  bucket.count++;
}
function token(request: Request): string | null { return request.headers.get("cookie")?.match(/(?:^|;\s*)dukaanset_session=([A-Za-z0-9_-]{40,100})(?:;|$)/)?.[1] ?? null; }
function cookie(value: string, request: Request, remove = false): string {
  const secure = process.env.NODE_ENV === "production" || new URL(request.url).protocol === "https:";
  return `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${remove ? 0 : 604800}${secure ? "; Secure" : ""}`;
}
function json(value: unknown, status = 200, headers?: HeadersInit): Response {
  return Response.json(value, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", ...headers } });
}
export function requireSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  const internalUrl = new URL(request.url), host = request.headers.get("host");
  let targetOrigin = internalUrl.origin;
  if (host) {
    // Next normalizes loopback URLs to localhost. Bind to the browser's actual
    // HTTP authority instead; browsers cannot set Host. Do not trust forwarding
    // headers supplied by clients. A deployed reverse proxy must preserve Host.
    if (!/^(?:[a-z0-9.-]+|\[[a-f0-9:]+\])(?::\d{1,5})?$/i.test(host)) throw new DomainError("CSRF_REJECTED", "Request host was rejected.", 403);
    try { targetOrigin = new URL(`${internalUrl.protocol}//${host}`).origin; }
    catch { throw new DomainError("CSRF_REJECTED", "Request host was rejected.", 403); }
  }
  if (!origin || origin !== targetOrigin || request.headers.get("sec-fetch-site") === "cross-site") throw new DomainError("CSRF_REJECTED", "Request origin was rejected. Open DukaanSet on the same site and try again.", 403);
}
async function body(request: Request): Promise<unknown> {
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") throw new DomainError("INVALID_CONTENT_TYPE", "Send application/json.", 415);
  const bytes = await readBody(request, 65_536);
  try { return JSON.parse(bytes.toString("utf8")); } catch { throw new DomainError("INVALID_JSON", "Request body contains invalid JSON."); }
}
async function readBody(request: Request, max: number): Promise<Buffer> {
  const declared = request.headers.get("content-length");
  if (declared && !/^\d+$/.test(declared)) throw new DomainError("INVALID_INPUT", "Invalid content length.");
  if (declared && Number(declared) > max) throw new DomainError("BODY_TOO_LARGE", "Request exceeds the supported size.", 413);
  const reader = request.body?.getReader();
  if (!reader) throw new DomainError("INVALID_INPUT", "A request body is required.");
  let size = 0; const chunks: Uint8Array[] = [];
  while (true) { const part = await reader.read(); if (part.done) break; size += part.value.length; if (size > max) { await reader.cancel(); throw new DomainError("BODY_TOO_LARGE", "Request exceeds the supported size.", 413); } chunks.push(part.value); }
  return Buffer.concat(chunks);
}

export async function handleRequest(request: Request, store: Store = getStore()): Promise<Response> {
  try {
    const url = new URL(request.url), path = url.pathname.replace(/\/$/, ""), verb = request.method, saas=new SaaSService(store), auth=new AuthenticationService(store);
    if (!["GET", "POST"].includes(verb)) return json({ error: { code: "METHOD_NOT_ALLOWED", message: "Method not supported." } }, 405, { Allow: "GET, POST" });
    if (verb === "POST") requireSameOrigin(request);
    if (path.startsWith("/api/auth/") && verb === "POST") {
      throttle("auth:global", 40);
      const action = path.slice("/api/auth/".length);
      if (action === "logout") { store.logout(token(request)); return json({ ok: true }, 200, { "Set-Cookie": cookie("", request, true) }); }
      if (action === "demo/reset") {
        const userId = store.authenticate(token(request));
        throttle(`reset:${userId}`, 5);
        return json(store.resetDemo(userId));
      }
      if (action === "demo") {
        throttle("demo:global", 10, 600_000);
        const session = store.demo(), secret = store.issueSession(session.user.id);
        return json(session, 201, { "Set-Cookie": cookie(secret, request) });
      }
      if(action==='verify'){const session=auth.verify(await body(request));return json(session,200,{'Set-Cookie':cookie(store.issueSession(session.user.id),request)});}
      if(action==='forgot'){const input=await body(request);const address=input&&typeof input==='object'&&'email' in input?String(input.email).trim().toLowerCase().slice(0,254):'unknown';throttle('reset:email:'+address,3,3600000);return json(await auth.forgot(input));}
      if(action==='reset')return json(auth.reset(await body(request)),200,{'Set-Cookie':cookie('',request,true)});
      if(action==='verification'){const userId=store.authenticate(token(request));throttle(`verify:${userId}`,3,3600000);return json(await auth.resendVerification(userId));}
      if(action==='acceptinvite'){const userId=store.authenticate(token(request));return json(auth.acceptInvite(userId,await body(request)));}
      if (action !== "register" && action !== "login") throw new DomainError("NOT_FOUND", "Endpoint not found.", 404);
      const input = await body(request);
      const address = input && typeof input === "object" && "email" in input ? String(input.email).trim().toLowerCase().slice(0, 254) : "unknown";
      throttle(`auth:email:${address}`, 10, 600_000);
      const session = action === "register" ? await auth.register(input) : store.login(input), secret = store.issueSession(session.user.id);
      return json(session, action === "register" ? 201 : 200, { "Set-Cookie": cookie(secret, request) });
    }
    const userId = store.authenticate(token(request));
    throttle(`user:${userId}`, 180);
    if (path === "/api/session" && verb === "GET") return json(store.session(userId));
    if (path === "/api/account/language" && verb === "POST") return json(store.updateLanguage(userId, await body(request)));
    if(path==='/api/account/profile'&&verb==='POST')return json(auth.account(userId,await body(request)));
    if(path==='/api/account/password'&&verb==='POST')return json(auth.changePassword(userId,await body(request)),200,{'Set-Cookie':cookie('',request,true)});
    if(path==='/api/onboarding'&&verb==='POST')return json(saas.onboard(userId,await body(request)),201);
    if (path === "/api/businesses" && verb === "POST") return json(saas.createAdditionalBusiness(userId, await body(request)), 201);
    const match = path.match(/^\/api\/businesses\/([a-f0-9-]{36})\/([a-z-]+)(?:\/([a-f0-9-]{36})(?:\/([a-z]+))?)?$/);
    if (!match) throw new DomainError("NOT_FOUND", "Endpoint not found.", 404);
    const [, businessId, action, recordId, subAction] = match;
    store.assertMember(userId, businessId);
    if (action === "attachments" && recordId && !subAction && verb === "GET") {
      const photo = store.readAttachment(userId, businessId, recordId);
      return new Response(new Uint8Array(photo.bytes), { headers: { "Content-Type": photo.metadata.mime, "Content-Length": String(photo.bytes.length), "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "Content-Disposition": `inline; filename="${photo.metadata.id}.${photo.metadata.mime === "image/jpeg" ? "jpg" : photo.metadata.mime.split("/")[1]}"`, "Content-Security-Policy": "default-src 'none'; sandbox" } });
    }
    if (action === "state" && !recordId && verb === "GET") return json(saas.state(userId, businessId));
    if(action==='catalogue-import'&&!recordId&&verb==='POST')return json(saas.importCatalogue(userId,businessId,await body(request)),201);
    if(action==='configuration'&&!recordId)return json(verb==='GET'?saas.configuration(userId,businessId):saas.saveConfiguration(userId,businessId,await body(request)));
    if(action==='team'){if(!recordId)return json(verb==='GET'?saas.team(userId,businessId):await auth.invite(userId,businessId,await body(request)));if(verb==='POST'&&!subAction)return json(saas.updateMember(userId,businessId,recordId,await body(request)));}
    if(action==='demands'){
      if(verb==='GET'){if(recordId&&subAction==='message')return json(saas.message(userId,businessId,recordId));if(recordId&&!subAction)return json(saas.request(userId,businessId,recordId));if(!recordId)return json(saas.summary(userId,businessId));}
      if(verb==='POST'){if(!recordId)return json(saas.createDemand(userId,businessId,await body(request)),201);const input=await body(request);switch(subAction){case 'status':return json(saas.transition(userId,businessId,recordId,input));case 'associate':return json(saas.associate(userId,businessId,recordId,input));case 'consent':return json(saas.consent(userId,businessId,recordId,input));case 'followup':return json(saas.followUp(userId,businessId,recordId,input));case 'convert':return json(saas.convert(userId,businessId,recordId,input));}}
    }
    if(action==='suggestions'&&!recordId&&verb==='POST')return json(saas.dismiss(userId,businessId,await body(request)));
    if(action==='reorders'){if(!recordId)return json(verb==='GET'?saas.orders(userId,businessId):saas.reorder(userId,businessId,await body(request)),verb==='POST'?201:200);if(verb==='POST'&&subAction==='receive')return json(saas.receiveOrder(userId,businessId,recordId,await body(request)));if(verb==='POST'&&subAction==='cancel')return json(saas.cancelOrder(userId,businessId,recordId,await body(request)));}
    if (action === "export" && !recordId && verb === "GET") return json(store.export(userId, businessId), 200, { "Content-Disposition": `attachment; filename="dukaanset-${businessId}.json"` });
    if(action==='ai'&&!recordId){const assistant=new AssistantService(store);if(verb==='GET')return json(assistant.status(userId,businessId));if(verb==='POST'){throttle(`ai:${userId}`,5,60000);return json(await assistant.ask(userId,businessId,await body(request)));}}
    if (action === "customers" && recordId && subAction === "statement" && verb === "GET") return json(store.customerStatement(userId, businessId, recordId));
    if (verb !== "POST") throw new DomainError("METHOD_NOT_ALLOWED", "This operation requires POST.", 405);
    if (action === "invoices" && recordId && subAction === "cancel") return json(store.cancelInvoice(userId, businessId, recordId));
    if (action === "products" && recordId && subAction === "edit") return json(store.editProduct(userId, businessId, recordId, await body(request)));
    if (action === "attachments" && recordId && subAction === "delete") return json(store.deleteAttachment(userId, businessId, recordId));
    if (recordId) throw new DomainError("NOT_FOUND", "Endpoint not found.", 404);
    if (action === "attachments") {
      throttle(`upload:${userId}`, 20);
      const bytes = await readBody(request, MAX_IMAGE_BYTES), mime = request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() ?? "";
      const decoded = await decodePhoto(bytes, mime);
      return json(store.createAttachment(userId, businessId, request.headers.get("x-product-id") ?? "", decoded.mime, decoded.bytes, request.headers.get("x-idempotency-key") ?? "", createHash("sha256").update(bytes).digest("hex")), 201);
    }
    const input = await body(request);
    switch (action) {
      case "products": return json(store.createProduct(userId, businessId, input), 201);
      case "customers": return json(store.createContact(userId, businessId, "customers", input), 201);
      case "suppliers": return json(store.createContact(userId, businessId, "suppliers", input), 201);
      case "stock": return json(store.adjustStock(userId, businessId, input));
      case "stockbatch": return json(store.receiveStockBatch(userId, businessId, input), 201);
      case "invoices": return json(store.createInvoice(userId, businessId, input), 201);
      case "payments": return json(store.receivePayment(userId, businessId, input), 201);
      case "purchases": return json(store.createPurchase(userId, businessId, input), 201);
      case "expenses": return json(store.createExpense(userId, businessId, input), 201);
      case "closing": return json(store.createClosing(userId, businessId, input), 201);
      default: throw new DomainError("NOT_FOUND", "Endpoint not found.", 404);
    }
  } catch (error) {
    if (isDomainError(error)) return json({ error: { code: error.code, message: error.message } }, error.status, error.status === 429 ? { "Retry-After": "60" } : undefined);
    if (error instanceof Error && /UNIQUE constraint failed/.test(error.message)) return json({ error: { code: "CONFLICT", message: "A record with these details already exists." } }, 409);
    console.error("DukaanSet API operation failed", error instanceof Error ? error.name : "UnknownError");
    return json({ error: { code: "INTERNAL_ERROR", message: "The operation could not be completed. Please try again." } }, 500);
  }
}
