# Premium business workspaces — 13 October 2026

Refreshed DemandPulse, Reports, Shop Closing, Business Intelligence, Today’s Work, Help and the account panel. The approved dashboard, logo and sidebar remain the visual foundation.

## Changes

- Shared compact VoiceOS strip, icon-led page headings, metric hierarchy, softer surfaces, clear action buttons and hover/focus feedback.
- DemandPulse: request-to-sale journey, compact product/request cards, searchable request directory and existing status/reorder/follow-up actions.
- Reports: sales/collections separated from expenses, supplier liabilities and stock valuation; readable product names, weekly amounts and the existing live-data charts.
- Closing: review/count/confirm navigation, localized session date, concise disclosures and explicit acknowledgement before the closing action becomes available. Cash-count, stale-review and ledger safeguards remain intact.
- Intelligence: responsive tool selection, clear estimated-profit/cost-coverage cards and linked action rows. Estimate limitations remain visible; each tool retains its existing review/save flow.
- Today’s Work: searchable, filterable task rows linked to their actual customer/product/request, task-specific dues and a session-aware closing shortcut.
- Help: searchable task guides, whole-card links, practical questions and permission-aware destinations.
- Account: clear identity and active shop, grouped shortcuts, language preferences, compact demo tools and a fixed sign-out footer. Closing the panel restores focus to its desktop or mobile entry point.

## Validation

| Check | Result |
| --- | --- |
| New workspace browser suite | 6 scenarios passed |
| Dev responsive coverage | 63 layouts: 7 views × 3 languages × 320/390/1440 px |
| Automated dev accessibility | 42 layout scans plus the account flow scan passed |
| Existing closing regressions | 3 distinct scenarios passed across targeted runs: counted close/revisions/PDF/next session; stale/concurrent/skipped counts; linked records and keyboard tabs |
| Demand and role regressions | 2 passed: request → reorder → receipt → follow-up → attributed sale; protected staff operations and Help destinations |
| Compiled production review | 63 layouts / 42 accessibility scans passed |
| Compiled runtime / CSP | No page errors or CSP violations |
| Read-only navigation | Invoices, receipts, stock movements, expenses, purchases and demand requests unchanged |
| Source checks | Typecheck, lint, locale parity and diff whitespace checks passed |
| Production build | Passed |

The browser fixtures use isolated fictional shops. The counted-close test performs an actual confirmed close and verifies the saved report and unchanged financial records. The production layout sweep only reads shop records and updates the fictional user’s language preference. It does not use the user’s local demo database.

Earlier test runs found a cost-coverage definition-list issue, account-caption contrast, mobile focus restoration and obsolete dashboard test selectors. The fixes retain the accessibility and financial assertions. The final compiled checks also cover CSS ordering so older demand-card styling cannot override the new layout.

Automated accessibility checks supplement visual inspection; they do not establish complete manual accessibility conformance or physical-device acceptance. This UI refresh does not configure or certify live voice providers.

## Evidence

The `production/` directory contains screenshots of all seven views at 390 and 1440 px and the compiled JSON results. `dev/` contains the three language layout manifests. Reproduce with:

```powershell
npm run test:e2e -- tests/e2e/insight-workspaces.spec.ts
npm run test:e2e -- tests/e2e/closing-dashboard.spec.ts
npm run test:e2e -- tests/e2e/v3-demand.spec.ts --grep "missed XL request|owner invites"
npm run build
node scripts/qa/insight-workspaces-production.mjs
```

Run these in a disposable verification checkout. Browser tests own ports 3001/3002, preserve normal API limits, use isolated databases and release their servers on completion.
