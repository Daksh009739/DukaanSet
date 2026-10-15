# V18.1 additional identity acceptance

Verified 14 October 2026 IST. This extends the existing Smart UPI and VoiceOS implementation without creating a separate customer or financial ledger.

## Passed

- **368/368 repository tests**, including **28 dedicated Smart UPI tests**.
- TypeScript, lint, locale parity and the isolated production build.
- English, Hindi and Hinglish compiled-browser payment workflows with two fictional customers both named Rahul. The shortlist displays distinct phone suffixes and Customer IDs, selection resolves the intended ID, and actual follow-up API requests keep that ID without repeated clarification.
- Provider-name hints are shown as unconfirmed identities. Receiving them does not create a customer. Anonymous receipts with no provider customer identifier still ingest normally and cannot create an automatic future binding.
- Customer identification leaves ledger receipts, invoice amounts and dues unchanged. Matching an existing receipt, confirmed allocation, imports, QR receipt mapping, customer history and disconnection continue to pass.
- **24 responsive layouts and six scoped axe scans**, with zero detected violations.

Unit tests also cover ambiguous allocation requests, missing pronoun context, repeated links, names shared by different customers, exact short names that could hide full-name matches, colliding phone/short-ID suffixes, Hindi names, cross-business selections, first provider hints, immutable first-observed status/reference/amount/timestamps, legitimate refund lifecycle updates, customer renaming and append-only association history. Financial rows are compared before and after linking/renaming. Direct updates/deletes of protected originals and association audits are rejected by SQLite triggers.

Compiled testing caught a possessive parsing issue with “today’s” and a customer picker using a product label. Both were fixed, and the expanded workflow passed afterward. Browser assertions inspect the live answer and selected Customer ID rather than accepting text from earlier conversation history.

## Evidence and limits

`production-report.json` contains the executed workflow/layout/accessibility results. `identity-tests.txt` and `full-tests.txt` contain test output. The screenshots show the actual compiled app with explicitly fictional merchant/provider fixtures.

The server-side Razorpay adapter uses the authorised customer API only when a stable provider customer identifier is available; missing/unsupported name lookup falls back safely. Official provider responses, recognition and synthesis are simulated in this acceptance harness. Actual Razorpay credentials/merchant authorisation and physical desktop/Android voice/camera acceptance remain the external release prerequisites documented in `docs/SMART-UPI.md`. This report establishes the implemented identity and accounting safeguards, not live-provider acceptance.
