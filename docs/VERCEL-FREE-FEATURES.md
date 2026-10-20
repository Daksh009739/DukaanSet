# DukaanSet: free Vercel feature availability

Public address: https://dukaanset-dev.vercel.app/login. Source: `dev`. This deployment uses the existing free Vercel Hobby project and its connected free Upstash database. No paid plan, trial, domain or metered upgrade is enabled by this change.

Choose **Start a blank workspace** to enter a merchant name, business name and category and begin without prefilled products, customers, bills or payments. **Explore the demo** remains a separate choice with clearly labelled sample records. A blank preview is a browser session, not an email/password account. It uses the same business services and calculations as the existing app.

## Available in the free browser workspace

| Area | Available functions |
| --- | --- |
| Workspace setup | Blank workspace; merchant and business details; category selection; supported module preferences; switching between the workspace's businesses |
| Dashboard | Totals and charts calculated from saved entries; recent bills; stock alerts; task links; saved merchant payment QR and UPI details |
| Products and stock | Create/edit products and services; SKU/unit/pricing; stock receipts and corrections; catalogue import; movement history; low-stock alerts; manual product photos |
| Sales and billing | Search products; quantities, discounts and supported tax fields; customer selection; cash/manual UPI/split receipts; drafts; stock checks; retry-safe confirmation; cancellation subject to existing financial rules |
| Customers and Udhaar | Unique customer records, including duplicate names; customer detail/history; unpaid balances; statements; recorded repayments; consent-aware reminder preparation |
| Payments | Record cash or manually observed UPI receipts; payment history; exact allocations and balances; no implied bank verification |
| Purchases and suppliers | Supplier records; received purchases; stock/cost updates; payable balances; supplier payment entries; reorder drafts and receipt confirmation |
| Expenses and cash | Record expenses; existing cash movements and cash reconciliation |
| Reports | Recorded sales, collections, pending balances, expenses, stock value and existing deterministic business insights |
| Manual shop closing | Review totals, enter cash count, acknowledge differences, save closing, history and corrections through the existing authorised operations |
| PDFs and printing | Existing invoices, receipts, customer statements, stock/business reports, purchase documents and closing PDFs; English/Hindi/Hinglish; supported A4/monochrome/58mm/80mm variants |
| DemandPulse | Record missed requests; product/customer association; restocking workflow; follow-up records; confirmed-sale conversion through existing services |
| Business modes | Existing retail, grocery, medical, restaurant, salon, clothing, electronics, wholesale and service settings; implemented activity/order/appointment/service records where enabled |
| VoiceOS without a paid AI key | Typed commands and the existing deterministic conversational parser; authorised record summaries; product/customer/bill workflows; unique-customer clarification and retained conversation context; confirmation before supported financial writes |
| Merchant QR | Save a UPI destination or supported QR image; display the saved destination and generated payment QR; include supported payment details in PDFs. Saving a QR does not connect bank tracking |
| Export and trust | Download supported JSON/CSV/PDF business exports; view available audit/history and explicit integration statuses |
| Languages and layout | English, Hindi and Hinglish; existing responsive pages, details, sheets, search, filters and navigation |

## Available with practical limits

| Feature | Limit |
| --- | --- |
| Workspace storage | Private snapshot for this cookie/browser session, up to **7 days**. Clearing cookies, expiry or explicit reset can remove access. No recovery email or cross-device account login. Export important entries |
| Storage size | Application guard: at most 32 MiB expanded / 4 MiB compressed per workspace snapshot. Other free service quotas also apply. No durable merchant backup guarantee |
| Microphone input | Browser speech recognition when supported and permission is granted; typed input remains available. Device/browser support and recognition quality vary; physical desktop/Android acceptance is separate from automated tests |
| Spoken replies | Available browser/device voices; the voice list and Hindi support depend on that device |
| Product-image suggestions | Click **Automatic images** in the product image manager, or refresh suggestions after the existing cooldown. One product is processed during that request using the existing Wikimedia Commons provider. It needs no paid key; provider availability, licence and match rules still apply. Upload your own permitted image if no suggestion is found. There is no always-on enrichment worker |
| Document/photo capture | Upload and manually review supported entries, preview totals and explicitly confirm supported stock/sale/purchase saves. Automatic handwriting/OCR extraction remains unavailable without the configured vision provider |
| Manual WhatsApp use | Existing copy/share/open-WhatsApp actions can hand the message to the merchant's device. The merchant reviews and sends it. This is not automatic delivery or a delivery receipt |
| Reminders | Prepare/review reminders using recorded overdue balances and consent. Provider delivery and automatic sending are not enabled |
| Uploads and large PDFs | Vercel Functions have a 4.5 MB request/response payload limit; individual app upload controls may be stricter (product photos: 2 MB). Large images/documents or very large exports may need compression or smaller date ranges |
| Offline/PWA | Existing installable shell and offline fallback where the browser supports them; financial writes require a successful online response |
| Free usage | Existing Upstash Free plan includes 500,000 monthly commands; storage, bandwidth and Vercel usage caps apply. Exhausted quota can make the preview unavailable; no automatic paid upgrade is authorised |

## Unavailable in this deployment

| Feature | What is missing |
| --- | --- |
| Real email/password registration and login | Supported permanent account storage plus configured verification-email delivery; the preview never bypasses verification or pretends to register an account |
| Verification email, password recovery and team invitations | Verified sender and server-side email credentials; real account/team storage |
| Permanent, multi-device business accounts and recovery | Production-suitable durable backend/database and backup/recovery operation; the expiring Redis preview is not a replacement |
| Verified Smart UPI collection, automatic payer recognition, provider webhooks and reconciliation | Approved payment-provider connection, server credentials, merchant authorisation, webhook configuration and supported durable execution. Manually recording UPI is available but is not verified receipt of money |
| AI-generated advice and unrestricted LLM interpretation | Configured AI provider, model and credentials; deterministic summaries and supported commands remain available |
| Automatic photo-to-stock, handwriting recognition and photo-to-bill extraction | Configured vision provider/model; manual reviewed capture remains available |
| Hosted speech transcription, premium cloud speech and personal voice cloning | Provider credentials, required verification/enrolment and any provider charges |
| Automatic WhatsApp/SMS/email delivery | Authorised messaging provider, approved senders/templates, consent and credentials |
| Precise unattended closing, continuous image enrichment, frequent UPI polling and always-on jobs | Persistent worker or another supported durable scheduler. Manual closing and request-driven image lookup remain available |
| Live weather | Weather-provider credentials; the app shows unavailable rather than invented weather |
| Paid subscription checkout and unsupported category modules | No payment checkout/provider is connected by this deployment; a category setting does not create capabilities that are absent from the existing implementation |

## Hosting boundaries

Vercel's [Hobby plan](https://vercel.com/docs/plans/hobby) is for personal, non-commercial use. This is a free showcase/preview, not a claim that a commercial production service can run indefinitely without a paid eligible plan. The app's 180-second API duration remains below the current Hobby limit. [Function limits](https://vercel.com/docs/functions/limitations) and [Upstash pricing](https://upstash.com/pricing/redis) govern actual usage. Hobby [cron jobs](https://vercel.com/docs/cron-jobs/usage-and-pricing) run at most daily with imprecise timing, so adding one would not make the existing 20/30-second workers equivalent.

No local merchant database, API secrets, customer list or real payment history is imported. Every API operation still uses existing session/business permissions, integer-money calculations, idempotency and snapshot compare-and-set protection. An unavailable provider is never replaced with a fabricated success or verified payment.

## Verified delivery — 20 October 2026

The feature implementation was published from `dev` at `aa7c786ebbfe8e847d99a251c29de57d47230e42` to the existing Vercel project. The optimized build, TypeScript, source lint, translation parity and all **451 backend tests** passed. Compiled browser checks passed English, Hindi and Hinglish, nine responsive authentication layouts, zero scoped WCAG A/AA violations, exact billing, multilingual PDFs, unchanged financial history during document generation and retention after a server restart.

Live HTTPS acceptance passed blank setup with zero prefilled records, repeated onboarding, duplicate-name customer IDs, a part-paid sale and retry, manual UPI repayment and retry, exact outstanding balance, supplier/purchase/stock/expense records, DemandPulse, saved UPI QR display, private product photos, manual document-to-stock review with repeat-save protection, three-language PDFs, exports, customer statements, authorised multilingual summaries, manual closing, business isolation and logout. A separate live check ran on-demand image lookup to an honest no-match fallback and confirmed invoices, payments and stock movements were unchanged. A typed VoiceOS request in the live browser returned the empty workspace's actual ₹0 / zero bills.

An existing QA session's exact stock and single invoice/payment survived the actual code deployment. These checks used isolated, explicitly identified QA entries. They do not establish physical microphone acceptance, provider-paid integrations, permanent-account recovery or commercial production readiness. The complete GitHub Quality workflow runs independently; its broader result must not be inferred from these targeted passing checks.
