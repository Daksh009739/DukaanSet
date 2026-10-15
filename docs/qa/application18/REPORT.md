# Application-wide regression report

Verified on **15 October 2026 (Asia/Kolkata)** using isolated databases and fictional QA accounts. The merchant preview and real business records were not used as test data.

## Result

| Check | Final result |
| --- | --- |
| Backend/library regressions | **428 passed, 0 failed, 0 skipped** |
| Browser regressions | **153 passed across all 28 suites; 0 failed, skipped or flaky** |
| Browser server modes | 25 compiled-production suites; 3 development suites for private file-mail registration fixtures |
| Loaded application-module coverage | **96.88% lines / 85.68% branches / 94.24% functions** |
| TypeScript, source rules and translations | Passed; 3,279 keys per language, full key/variable parity |
| Isolated Next.js production build | Passed |
| PDF visual regression matrix | 111 existing reference documents / 216 pages re-rendered; zero out-of-page glyphs; all 18 contact sheets inspected |
| Current PDF workflows | Fresh authenticated preview, download, print-format, period and ledger-integrity assertions passed in the browser suites |
| Reviewed document automation | 36 viewport checks and 9 scoped WCAG A/AA axe scans; all three languages passed |
| Smart UPI fixture acceptance | 33 viewport checks and 15 scoped axe scans; all three languages passed |
| Business-growth acceptance | 36 viewport checks and 9 scoped axe scans; all three languages passed |
| My Voice AI fixture acceptance | Compiled workflow passed; 3 scoped accessibility scans; synthetic audio and explicitly simulated providers |
| Typed VoiceOS evaluation | 66/66 labelled intents, 188/188 labelled slots; 24/24 language cases and 9 confirmation-control cases |
| Private backup / restore | CLI backup of an active WAL database restored exact invoices, payments, products, customers, stock movements and original image bytes; missing sources correctly fail |

Coverage describes V8/tsx-instrumented application modules loaded by the Node tests. It does **not** measure React/browser branch coverage or establish that every conceivable input, device or external-service failure has been tested. The typed VoiceOS corpus is a regression set, not measured real-world speech accuracy.

## Feature and edge-case matrix

| Area | Exercised behaviours and boundaries |
| --- | --- |
| Authentication / onboarding | Verification and reset tokens, password recovery, session persistence/revocation, fresh-device login, profile-language precedence, consent/terms, minimal empty-workspace setup, no demo financial seed in real accounts |
| Business isolation / permissions | Owner, manager and staff restrictions; revoked memberships; inaccessible modules; tenant-scoped IDs, private evidence and exports; source callbacks and origin validation |
| Dashboard / navigation / public pages | Approved dashboard, real metrics, search, account panels, sidebar rail/drawer, shop switching, nested tools, keyboard actions, narrow/short viewports, localised public routes, metadata and 404s |
| Billing | Item snapshots, integer minor-unit arithmetic, rounding, discounts, split cash/recorded UPI, unpaid/partial/paid bills, insufficient stock, invalid receipts, repeated clicks, uncertain responses, replay conflicts, cancellation and refunds |
| Inventory / media | Whole/fractional quantities, exact unit conversions, ambiguous catalogue names, variants/aliases, CSV import/export, duplicate SKU rejection, stock history, source images, invalid formats and size limits, service items without physical stock |
| Customers / Udhaar | Duplicate names with unique IDs, conversation context, complete histories and pagination, customer edits preserving issued snapshots, partial repayments, overpayment/advance boundaries, statements and original payment records |
| Smart UPI | Explicit fixture OAuth/token exchange and signed events, verified/unverified separation, original references, refunds, amount/status bounds, duplicate events, safe linking/audit/Why Linked, correction, unmatched inbox, named-payer confirmation, invoice proofs, reconciliation and cross-business rejection |
| Reminders / communications | Genuinely overdue balances separated from all outstanding balances; consent/preferences, opt-outs, approval, language persistence, clipboard/manual delivery, uncertain sends, recipient review and no fabricated delivery status |
| Purchases / suppliers / expenses | Orders versus received goods, receipt confirmation, supplier payables/payments, deterministic totals, supplier-role matching, recorded expenses and private document exports |
| Reports / closing | Recorded sales versus receipts, verified UPI shown separately, refunds/cancellations, cash count and differences, deposits/withdrawals, timezone cutoffs/DST, stale previews, durable automatic jobs, restarts/backoff, frozen closing versions and late corrections |
| VoiceOS | Hindi/English/Hinglish interpretation, ambiguous intent/customer/product clarification, conversation follow-ups, typed/touch alternatives, read-only immediate reports, contextual navigation, write confirmation, cancellation, interrupted/duplicated turns, no invented identities or numeric facts |
| Voice capture / My Voice AI | Browser recording/playback with synthetic media, silence/retry/error behaviour, permission-denied fallback, released tracks, voice enrollment consent, fixture ownership verification, preview approval, activation/deletion, provider failures and scoped profiles |
| PDFs | Invoices, receipts, statements, reports, orders, purchases and closing; private generation/download, immutable snapshots, 58/80 mm and A4/monochrome layouts, Hindi shaping, multi-page tables, totals, filenames, sharing initiation and original customer details |
| Scan & Add Stock / Scan Bill | Exact original retention, pixel/hash deduplication, extraction consent/schema/lease/failure, unreadable and unsupported evidence, unknown rate clarification, editable rows, unique party selection, source dates/references, tax-inclusive acknowledgement, exact totals, stale previews, atomic rollback, unpaid imports and repeat-safe saves |
| Business modes / tools | All 13 categories configured, atomic category/module changes, separate order and appointment records, appointment clashes, service billing/cancellation, optional referral/private feedback, scoped export and truthful backup/Pro states |
| Autopilot / health | Complete recorded comparison windows, missing baseline/history, authorised priorities, unpaid plus partially paid bill filtering, read-only health questions, no automatic stock/financial changes and optional device-scoped recap link |
| Persistence / deployment checks | Schema migration, idempotency state, restarts, immutable historical records, backup/restore, absent-source failure, durable-storage/origin/key requirements and fail-closed deployment configuration |

## Defects corrected during this work

- A Smart UPI detail refresh could clear the selected drawer while a newly identified payer left the unmatched filter. Keep the scoped selection loaded during refresh; the delayed-refresh browser fixture passes without another ledger write.
- The header profile/shop controls had 22 px touch targets. Increase their minimum height to 28 px; the affected WCAG 2.2 target-size checks and header layout regression now pass.
- The new pending-bill action initially selected only fully unpaid bills. The outstanding filter includes both partial and unpaid balances and excludes paid/cancelled bills.
- Scan final previews now show the actual catalogue selling-price effects; conflicting new-product selling prices fail review. Choosing no stock price update leaves current prices unchanged.

Older tests were updated to the approved three-field onboarding, profile/account display, conversation history, consent-aware reminders and invoice-detail views. Their financial and permission assertions were retained. Production continues to reject file-based email delivery; the three mail-dependent browser suites run on an isolated development server rather than weakening this guard.

The previous remote CI failed because its headless Linux PDF popup had no viewer URL. The print check now exercises the real `window.open` with `noopener` and compares the exact printed blob bytes with the generated/downloaded PDF; it does not require an installed native PDF viewer. The corrected three-language suite passes locally. Physical printing remains a separate acceptance item. CI now includes the compiled business-growth and document-automation checks, with sufficient time for the existing full workflow.

## Acceptance still pending

The automated result is green. **Live production acceptance remains incomplete**:

- No configured OpenAI credentials were supplied for real Hindi/English/Hinglish handwriting recognition. Extraction fixtures and the manual-review flow do not establish live recognition quality.
- Authorised Razorpay partner/merchant acceptance and real bank/provider reconciliation still require live or sandbox credentials. The provider fixtures are explicitly fictional.
- Real desktop/Android microphone runs, actual camera/keyboard behaviour, voice similarity/pronunciation, supported physical printers and installed PWA/HTTPS behaviour need device testing.
- Voice-cloning ownership infrastructure/provider eligibility and real STT/TTS quality are not established by synthetic media. The checked-in live VoiceOS gate correctly remains **not production ready** without the required human evidence.
- Production email delivery, external WhatsApp delivery, subscription checkout and deployed backup/sync status were not verified. No outbound customer message, payment, merge or production deployment was performed.

## Evidence and reproduction

- [Final browser summary](final-browser-summary.json) and [all 153 browser cases](browser-cases.json)
- [All 428 backend cases](backend-cases.json) and [module coverage](coverage-summary.json)
- [Automation](automation-workflows.json), [Smart UPI](upi-regression.json), [growth](growth-workflows.json), [My Voice AI fixtures](voice34-fixture-acceptance.json)
- [PDF bounds audit](pdf-visual-audit.json) and [reference-fixture manifest](pdf-fixture-manifest.json)
- [Typed semantic evaluation](voice-semantic-evaluation.json), [language evaluation](voice-language-evaluation.json), [live VoiceOS gate](live-voice-gate.json)

Run against an isolated checkout/database, using Node 24:

```text
npm test
npm run lint
npm run test:locales
node node_modules/typescript/bin/tsc --noEmit
npm run build
node scripts/qa/backend18-coverage.mjs
node scripts/qa/application18-production-review.mjs
node scripts/qa/automation18-production-review.mjs
node scripts/qa/upi18-production-review.mjs
node scripts/qa/growth18-production-review.mjs
node scripts/qa/voice34-production-review.mjs
```

The browser runner starts a fresh server/database for each suite and records the server mode. Tests using the private development file-mail helper run in development; other suites use the compiled build. Do not run a build while a compiled acceptance server is using the same checkout. Keep `scripts/run.mjs` wrappers sequential because they regenerate offline assets.
