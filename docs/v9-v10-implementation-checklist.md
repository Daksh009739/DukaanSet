# V9 / V10.1 implementation checklist

Audit: the home duplicates its four metrics in a second section, displays a large trend chart and placeholder AI card, and puts closing below other content. Customer detail has documents and demand expanded together. Four record routes fall through to list pages. Purchase creation is a received purchase; DemandPulse reorder drafts are the existing order workflow. Closing uses calendar-day cash sums, requires a count, has no frozen financial report, and prevents further trading until midnight.

## Accounting and session policy

- All sums use safe integer paise from complete server queries, independently of recent-list limits.
- Sales are issued totals less cancellation events during the session. Collections are positive receipts; cash/UPI refunds are separate outflows. Credit is original sale credit, not a balance reduced by later receipts.
- Receivable at a boundary comes from dated invoice, cancellation and signed payment events. Legacy purchase payments are cash; later supplier payments record their actual method.
- A business date uses the owner's IANA timezone and cutoff. An initial session starts at that boundary. Closing freezes a session. The owner explicitly opens the next session with a confirmed float; same-day continued trading is a distinct session. No implicit reopening.
- Count is optional where allowed. An uncounted close is pending verification, including every automatic close. Differences never create expenses.
- Previews carry an input fingerprint. Finalization recalculates under SQLite's immediate transaction and rejects stale previews. One immutable version per session; reconciliation creates a new version with actor/reason, preserving the original.
- Auto-close is disabled by default. A backend worker, durable SQLite jobs, retries and owner notices implement scheduling. Hosted scheduling remains dependent on the persistent backend documented in Vercel setup.

## Delivery checks

- [x] Additive migration, business sessions, complete snapshots and versioned reconciliation.
- [x] Owner configuration, explicit manager grant, job retry and owner notices.
- [x] Dashboard hierarchy, shared detail patterns and complete histories.
- [x] Customer Activity / Bills / Hisaab; contextual invoice and document actions.
- [x] Product / received purchase / supplier / payment detail routes.
- [x] Closing review, optional count, next opening, cash adjustments and report history.
- [x] Branded, translated frozen closing PDFs and VoiceOS review integration.
- [x] Isolated real-transaction demo, invariant/security/concurrency/scheduler tests.
- [x] Locale, responsive, keyboard, accessibility and existing regression checks.
Release gate: feature PR to dev and required exact-head CI. Live gate results are recorded on the PR.
- [ ] Hosted staging verification: requires persistent HTTPS backend/private volume and verified sender; production requires release approval.

The live database is backed up privately before the additive migration. Merchant data and credentials are excluded from verification copies and Git.
