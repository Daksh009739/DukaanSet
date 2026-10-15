# Business growth extensions — V18.1

The existing workspace now supports grocery, retail, medical, restaurant, salon, clothing, electronics, wholesale, services, hardware, vegetables, mobile and general businesses. Billing, customers, payments, Udhaar, documents and reports still use their existing services and permissions. The approved dashboard layout is preserved.

## Getting started

Registration and email verification retain the existing security requirements. Business setup asks for merchant name, business name and category. A new workspace starts with an empty catalogue and no financial records; UPI and advanced configuration can be added later.

The registration and setup pages offer a short interactive VoiceOS demonstration. Its fictional example is labelled throughout and runs entirely in the browser. It never calls an account mutation, switches sessions or seeds a real workspace. Microphone input uses the existing browser speech adapter, with typed input and a tappable example when recording is unavailable.

## Business mode and progressive tools

Open **Business Tools → Trust & transparency** (`/app/trust`) to change category and optional tools. Category and order/appointment flags save in one transaction with revision checks. Existing core-module choices, customers and financial history are retained. Restaurant mode initially enables orders; salon mode initially enables appointments. Owners can enable either tool for another category. Salon and service navigation uses “Clients”.

`/app/business-tools` provides:

- A simple order queue with optional table labels, customer identifiers and explicit status confirmation.
- One shared appointment calendar with local shop time, duration and overlap checking. Cancelled and completed appointments release their slots.
- A service catalogue that opens the existing invoice composer.

Activity records do not post sales, receipts or stock movements. “Create invoice” opens the existing reviewed billing workflow. This increment supplies order lists/table labels and a shared appointment calendar; floor plans, kitchen routing, staff/resource calendars and specialised medical records are not implemented.

Services have immutable `stockTracked: false` catalogue metadata. They can be billed with physical goods, using existing integer arithmetic, receipts, Udhaar and invoice snapshots. Services cannot receive stock, be purchased as inventory or appear as low-stock alerts. Stock reports exclude them. Invoice cancellation refunds through the existing operation and records a separate cancellation event so closing reports remain correct without fictitious stock movements.

## Ask My Shop and VoiceOS

`/app/ai` adds a scoped daily summary and actionable priorities. It reuses the existing closing/report calculations, verified UPI observations, overdue-invoice service and inventory records. Recorded trading-session sales, calendar-day verified UPI and outstanding balances are labelled separately. They are never added together. Provider test mode is explicitly labelled; inaccessible measures are shown as unavailable.

Examples include:

- “Aaj meri dukaan ka hisaab batao.”
- “Aaj mere business mein kis cheez par dhyan dena chahiye?”
- “Aaj kitne orders aaye?”
- “Kal kitni bookings hain?”

The order/booking counters accept supported aggregate/date questions. A customer-specific or historical question is not answered using the business-wide current-day count. Existing insights, duplicate-customer clarification, selected Customer ID memory, UPI queries and reviewed financial actions retain their original paths.

Priorities link to permitted views for overdue customers, unmatched receipts, physical stock, pending orders and upcoming appointments. Appointment links include the relevant date. External reminders still require the existing merchant approval and customer preference checks; this add-on sends no messages.

## Trust, export and local referrals

The trust centre displays actual role permissions, payment-verification explanations, the last server response and recent owner-visible audit entries. Browser connectivity is labelled as a browser observation. Backup status is reported as unknown because no verified backup-status agent is configured. Business export is available to owners and includes scoped financial data, original UPI references, allocation/link history, activity records and feedback, without account passwords or provider authorisation tokens.

The existing daily functionality remains governed by existing permissions and feature settings. Subscription checkout is not configured in this application, so the page explains that state and offers the existing contact route; it creates no paid entitlement or charge.

Real business owners may explicitly create/copy an opaque referral link. Registration records the attribution privately. It grants no membership, reward or financial record. Feedback is stored privately with an explicit optional publication-permission field. No testimonial, rating or usage statistic is fabricated or automatically published.

## Data and migration

Schema 15 adds category-tool settings, non-financial activities, service tracking metadata, referral attribution and private feedback. Historical products remain stock tracked by default. Historical invoice snapshots and payment references are not rewritten.

Schema 16 adds `invoice_cancellations`, keyed by the original invoice. New cancellations write their existing authorised operation timestamp and actor atomically with the existing cancellation/refund. Migration recovers historical cancellation events only from matching existing audit records. Closing calculations combine the event with legacy stock-return evidence and deduplicate by invoice. Saved historical closing versions remain unchanged.

All new endpoints retain session authentication, same-origin mutation protection, membership checks, business scope, existing role permissions and existing rate limits. New activity/service/feedback writes bind retry keys to the exact business-scoped payload. Service billing and refunds continue to use the existing payment idempotency and reconciliation architecture.

## Verification

See [acceptance evidence](qa/business-growth/REPORT.md). Run:

```text
node scripts/run.mjs test
node node_modules/typescript/bin/tsc --noEmit
node scripts/lint-source.mjs
node scripts/check-locales.mjs
npm run build
node scripts/qa/growth18-production-review.mjs
node scripts/qa/upi18-production-review.mjs
```

The browser scripts require a built isolated checkout, Node 24+, Edge/Chromium and fresh disposable QA databases. They do not use real merchant accounts or live payment providers. Physical microphone/Android acceptance and genuine authorised provider acceptance remain separate deployment checks.
