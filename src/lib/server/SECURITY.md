# Request and storage boundaries

Account and business POST operations require an exact matching Origin and reject `Sec-Fetch-Site: cross-site`. The specific official `/api/whatsapp/webhook` callback instead requires a valid HMAC signature over its raw bytes plus matching WABA/phone, recipient and delivery identity; it does not use a user session or Origin. The target authority for other operations comes from the validated incoming HTTP Host, because Next.js normalizes loopback request URLs to localhost. Forwarded-host headers are ignored. Host-less synthetic requests use their URL authority; actual HTTP requests supply Host.

A deployment must restrict accepted public hosts at its trusted ingress, preserve the validated public Host, terminate HTTPS, and present the correct scheme to Next.js. Arbitrary client-controlled proxy headers must not become trusted routing input. `NEXT_PUBLIC_SITE_URL` sets public metadata; it is not an origin authorization policy. HTTPS and ingress configuration need deployment review before public use.

Session cookies are HttpOnly and SameSite=Lax. They carry Secure for every production response and every HTTPS response. HTTP development cookies support local testing. A production HTTP session is intentionally not a supported deployment configuration.

The SQLite path is server configuration, never request input. Its directory is created at runtime. The scoped Turbopack annotation prevents dynamic database paths from being traced into application bundles; it does not skip runtime path resolution or database initialization. Keep database, WAL, journal, backups, secrets and browser test artifacts outside deployment packages and source control.

V3 adds real hashed, expiring, one-use verification/reset/invitation tokens and server-enforced role/module permissions. New accounts require verification; legacy accounts retain access without a false verified marker. Reset/password change revokes sessions. Token-link GET requests do not consume tokens, and Referrer-Policy is no-referrer. Private local outbox files are development-only; production requires a configured sender and trusted HTTPS AUTH_BASE_URL. No credentials/tokens are included in business exports.

This local single-process implementation does not claim production readiness. Ingress/HTTPS, persistent storage, backup/restore procedures, distributed throttling, live sender validation and provider-dependent recovery timing remain operational requirements. See [V3 implementation](../../../docs/v3-implementation.md) and [deployment preparation](../../../docs/deployment.md).
