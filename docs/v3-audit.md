# V3 audit and implementation checklist

9 October 2026. Baseline commit `d864fa2`: Next 16 App Router, React/TypeScript, Node 24 native SQLite, guarded server services, local fonts and three-language copy. The 58 existing backend/client/voice tests passed before V3 edits. A verified SQLite-consistent **pre-V3** snapshot was created under ignored `.data/backups/` before migration. The supplied [V3 brief](briefs/v3-master.md) is preserved verbatim.

| Area | Baseline | V3 work |
| --- | --- | --- |
| Sales/stock/customer ledgers | Working, transactional, scoped, idempotent; photos/PDFs and signed refunds tested | Preserve and connect demand attribution |
| Authentication | Working passwords, sessions, matching Origin, cookie protection and process throttles | Real expiring verification/reset tokens, configured delivery and progressive onboarding |
| Business access | Owner membership; isolated multi-shop data | Explicit manager/staff permissions on server reads and writes |
| Settings/navigation | Mostly static; advanced modules visible broadly | Persisted category defaults, owner overrides, revision checks and backend feature gates |
| DemandPulse | Missing | Requests, aggregation, reorder drafts, receipt detection, consent-aware manual follow-up, invoice attribution and reversal |
| Dashboard/tasks/notifications/reports | Real V2 financial aggregates | Compact demand preview and grouped actionable demand tasks, preference controls |
| Voice | Browser adapter and reviewed rule parser | Reuse deliberate speech capture for editable demand drafts; never infer units from visitor counts |
| AI | Local read-only summary; no live model adapter | Authorised demand summaries plus explicitly configured, read-only OpenAI Responses adapter; mocked failure/redaction tests, no paid calls |
| Catalogue import | CSV export only | Reviewed bounded CSV import with atomic opening stock, SKU collision rollback and durable exact-payload retry |
| UI/a11y | V2 phone workflows verified | Reuse cards/sheets and test the connected V3 journey at 320px upward |

Existing legacy accounts remain usable after migration. Their email addresses are **not** represented as verified; new public accounts require an actual one-use verification link. Demo identities remain isolated and explicitly fictional. No migration drops merchant tables or financial history.

Key invariants: a request never changes stock or sales; receipt does not convert demand; contact preparation is user initiated and permission checked; attribution cannot exceed a real invoice line or the request's remaining quantity; cancellations remove attributed revenue without deleting history; UI hiding never replaces server permission checks.

Delivered scope, roles, status/revenue semantics, provider requirements and remaining work are recorded in [V3 implementation](v3-implementation.md). Final verification passed TypeScript, production build, 88 unit/API/client/voice tests, all 32 browser scenarios and 7 local production smoke checks. A final enhanced staff-permission browser regression passed separately. The [QA report](v3-test-report.md) links screenshots and sanitized migration evidence.

The pre-V3 snapshot copy and actual local upgrade both preserved every original column/value in 17 V2 tables, with clean integrity and foreign keys across reopen. No merchant database or mail outbox is committed. Existing V2 screenshots remain historical evidence rather than being overwritten by this run.

Nearby merchant networking is explicitly future scope. Hosted deployment, actual provider delivery/model accuracy, physical speech/device/screen-reader acceptance and commercial readiness require separate operational/device evidence.
