# V18.1 business companion acceptance

Verified 14 October 2026 IST against the existing authenticated DukaanSet application. The dashboard layout, invoice calculations, receipt posting, Customer 360° and reconciliation services are preserved.

## Passed

- **378/378 repository tests**, including **38 dedicated Smart UPI regression tests**.
- TypeScript, lint, locale parity (3,031 keys; zero detected hardcoded visible strings) and the isolated production build.
- Compiled English, Hindi and Hinglish workflows: merchant/reliable-payer linking explanations; verified invoice-specific QR evidence; identifying duplicate-customer shortlists; remembered Customer IDs; month-to-date collection questions; inbox deferral; explicitly confirmed customer creation; unchanged financial rows during identification; approved manual reminder copying; receipt matching; reconciliation; imports; profile refresh and provider disconnection.
- **33 layout checks** across the existing profile/UPI pages at 320, 390, 768 and 1440 pixels, plus the new mobile reminder, expanded insights and customer-confirmation views.
- **15 scoped WCAG A/AA axe scans**, with zero detected violations, covering those pages and the new mobile review surfaces. Selected screenshots were visually inspected.

The unit matrix additionally checks deterministic net collections without duplicate counting, repeated-receipt pattern rules, truly overdue versus merely pending invoices, unchanged payment originals and ledgers, consent withdrawal, changed phone numbers, stale balance approvals, existing communication opt-outs, role restrictions and cross-business access. Create-and-link retries return the same customer and never recreate a financial receipt. Keeping a payment unmatched changes review metadata only. Reconciled customer associations remain locked to their existing ledger allocation.

## Evidence

- `production-report.json`: executed workflow flags, viewport checks and accessibility results.
- `smart-upi-tests.txt`, `full-tests.txt`, `production-build.txt`: command output.
- `why-linked-en.png`, `review-inbox-en.png`, `insights-en.png`: compiled desktop views.
- `reminder-*-390.png`, `insights-hinglish-390.png`, `confirm-customer-hi-390.png`: compiled mobile review views.

The expanded browser harness initially reached the existing request limit. The acceptance flow now pauses between functional and layout phases; application request limits remain unchanged.

## Delivery and acceptance boundaries

Reminder delivery is explicitly manual: the merchant reviews and approves a draft before copying it. No reminder is sent automatically or represented as sent. Existing document-sharing opt-outs override reminder-specific permission, and a prepared message is not a delivery receipt.

All QA merchant data and provider responses are explicitly fictional and isolated. The harness exercises the real compiled UI, signed-event handling, services and database, with intercepted official provider endpoints and simulated speech/camera inputs. Live Razorpay authorisation, real provider events and physical-device microphone/camera acceptance remain the existing external release prerequisites; this report does not establish them.
