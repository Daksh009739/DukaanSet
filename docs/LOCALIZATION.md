# DukaanSet localization

DukaanSet has one display locale: `en` (English), `hi` (Hindi in Devanagari), or `hinglish` (Roman Hinglish). Display language changes interface copy, notices, dates, units, reports and document labels. It does not translate merchant records or post business transactions.

## Resources and rendering

`src/locales/{en,hi,hinglish}` contains eight matching JSON dictionaries: common, errors, retail, saas, sales, inventoryVoice, voiceos and marketing. `registry.ts` is the resource manifest and exports locale types, script tags and typed namespace copies. Components use the existing translation hooks; pure/server code uses `text()` from `src/lib/locale.ts`.

Each root gets its own synchronous i18next instance. English fallback is disabled. Missing keys log only the key and show the selected locale's generic unavailable text. No customer names, transcripts or financial records are logged by this mechanism. Hindi's document tag is `hi`; Roman Hinglish uses `hi-Latn`. All three layouts are left to right.

React-i18next 17 returns a new snapshot wrapper after a language change. Fetch callbacks use `useLocaleEngine()` for the stable underlying instance. Using the changing snapshot as a fetch dependency previously reloaded the workspace and unmounted open forms. A browser regression now verifies that a locale change does not request business state or close a payment/DemandPulse form.

## Preference priority

Public URL prefixes explicitly select their page locale. `/en`, `/hi` and `/hinglish` have localized metadata and corresponding detail pages. Unprefixed public URLs remain English aliases with canonical links to `/en`.

Private/auth/onboarding server rendering uses the authenticated user's saved language first, then the `ds_locale` preference cookie, then English. The proxy strips incoming locale headers before adding a trusted route locale. Saved preference therefore works on a new device even with an English preference cookie. Auth, onboarding and private route boundaries also restore the server preference before paint when the persistent root is reused after a public-page navigation.

The anonymous cookie lasts one year, applies to `/`, uses SameSite=Lax, and is Secure on HTTPS. Profile changes update labels immediately, queue authenticated saves in order and roll back the latest failed choice to the last confirmed preference. There is no language key in account/business draft scopes.

## Three independent choices

1. Display language controls the interface and selected document labels.
2. Spoken language (`en-IN` or `hi-IN`) controls the browser's recognition request. Changing display language preserves this selection, capture and transcript. Typing another language remains possible.
3. Communication language controls reminder and DemandPulse message previews. Users choose it separately inside the sheet. A display-language change leaves that chosen preview language intact. Copying/reviewing a preview sends no message and records no contact attempt. Existing explicit follow-up recording still requires live consent, contact information, stock and authorization.

Verification/reset/invitation emails use the recipient's saved profile locale. Their link routes, token entropy, expiration and one-use validation are unchanged. Development uses a private outbox. Production still requires the configured real email adapter.

## Data, formatting and documents

Product/customer/shop/supplier names, brand names, variants, notes, addresses, invoice numbers, SKU/IDs and phone digits are source data. They retain their original spelling. Products may have three optional, manually reviewed display names; the canonical name remains searchable and issued invoice snapshots retain their original names and values. The additive SQLite V4 migration adds `display_names_json` without rebuilding or resetting existing ledgers.

Amounts remain integer paise and quantities integer thousandths. Money uses India grouping and Latin digits in every locale. Dates use Asia/Kolkata, Latin digits, localized month names and 24-hour times. Canonical units remain API values; only their labels change. `unitText(unit, locale, count)` selects singular/plural forms for counted units; unknown merchant units remain unchanged.

Invoice and customer-statement PDFs use localized labels and the existing canvas font/shaping pipeline with Manrope and Noto Sans Devanagari. Their monetary values and source names match the saved ledger. Language/business/document changes invalidate pending exports so an old asynchronous result cannot prepare or download the wrong document.

Structured backend error codes resolve to localized messages; raw provider/internal English messages are not displayed. Stock error details carry the original product name, precise quantity and canonical unit separately. Existing interface notifications are converted to key/parameter descriptors for re-rendering. Merchant notes and AI answers never pass through that notification adapter.

The public offline document reads the locale cookie and has all three resource sets. Private HTML/APIs and business records are never cached. If that public document is absent, the service worker returns a small three-language reconnect page.

## AI answers

The client explicitly sends the display locale. Language or business changes abort/discard stale responses while preserving the question. Exact supported financial-total questions use authorized full-ledger SQL totals and localized templates without an external provider. Other questions require the existing explicitly configured OpenAI provider/model.

Provider instructions specify English, Devanagari Hindi or Roman Hinglish, preserve source names and identify records as untrusted input. `completeFinancialReport` is authoritative for its stated period; limited lists disclose their limitations. A script/grammar heuristic rejects clearly wrong-language output and shows a localized unavailable message. This is a practical guard, not a guarantee of linguistic quality. Physical speech recognition and live provider quality still require device/provider acceptance.

## Retail glossary and exceptions

| Concept | English | हिंदी | Hinglish |
| --- | --- | --- | --- |
| Sales | Sales | बिक्री | Bikri |
| Amount due | Amount due | बकाया | Baaki rakam |
| Customer | Customer | ग्राहक | Customer |
| Save | Save | सहेजें | Save karein |
| Kilogram | Kilogram | किलो | Kilo |
| Quantity | Quantity | मात्रा | Quantity |

Brand names (DukaanSet, VoiceOS, DemandPulse), recognized technical acronyms (UPI, PDF, CSV, SKU, GST, OTP), language autonyms and documented CSV column codes may keep their source spelling. Roman Hinglish permits familiar short retail/technical terms but not copied English explanatory sentences. Spoken examples are input examples, independent of the display locale; demo source names are deliberately preserved.

## Adding a feature

Add a semantic key in the appropriate English namespace, then write complete Hindi and Hinglish equivalents with identical interpolation parameters. Keep original names out of dictionary translations, pass them as parameters, and use canonical units in form option values. Do not add literal JSX copy or `defaultValue` translation fallbacks. If an async operation depends on language, capture the request's locale and invalidate its result when the current locale/scope changes.

Run `npm run test:locales`, `npm run lint`, `npm run typecheck` and relevant tests. The localization gate checks JSON duplicates/empty text, key and parameter parity, Hindi script exceptions, Hinglish copied prose, plural siblings, unknown literal translation keys and detectable raw JSX labels. It is an AST-based guard, not a proof that every dynamic string is translated. Browser tests and visual review remain required for new forms and documents.

GitHub Quality runs these gates, backend tests, production build and critical product, VoiceOS and localization browser suites. Local full E2E runs each suite with a fresh server and the isolated `.data/e2e.sqlite`; no merchant database is reset.
