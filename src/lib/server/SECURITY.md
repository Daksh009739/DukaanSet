# Request and storage boundaries

All POST operations require an exact matching Origin and reject `Sec-Fetch-Site: cross-site`. The target authority comes from the validated incoming HTTP Host, because Next.js normalizes loopback request URLs to localhost. Forwarded-host headers are ignored. Host-less synthetic requests use their URL authority; actual HTTP requests supply Host.

A deployment must restrict accepted public hosts at its trusted ingress, preserve the validated public Host, terminate HTTPS, and present the correct scheme to Next.js. Arbitrary client-controlled proxy headers must not become trusted routing input. `NEXT_PUBLIC_SITE_URL` sets public metadata; it is not an origin authorization policy. HTTPS and ingress configuration need deployment review before public use.

Session cookies are HttpOnly and SameSite=Lax. They carry Secure for every production response and every HTTPS response. HTTP development cookies support local testing. A production HTTP session is intentionally not a supported deployment configuration.

The SQLite path is server configuration, never request input. Its directory is created at runtime. The scoped Turbopack annotation prevents dynamic database paths from being traced into application bundles; it does not skip runtime path resolution or database initialization. Keep database, WAL, journal, backups, secrets and browser test artifacts outside deployment packages and source control.

This local single-process implementation does not claim production readiness. Ingress/HTTPS, managed persistence, backup/restore procedures, distributed throttling and account recovery remain deployment requirements.
