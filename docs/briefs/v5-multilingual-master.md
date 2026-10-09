# DUKAANSET V5 — FINAL UNIVERSAL MULTILINGUAL EXPERIENCE MASTER PROMPT

## COMPLETE WEBSITE-WIDE LANGUAGE CONSISTENCY, TRANSLATION ENGINE, DATA LOCALIZATION, UI/UX ENHANCEMENT & CI/CD QUALITY ENFORCEMENT

### PROJECT IDENTITY

**Project:** DukaanSet

**Tagline:** Apni Dukaan, Sab Set.

**Feature:** Universal Language Engine

**Application Type:** Premium Mobile-First, Multi-Tenant, AI-Powered SaaS Platform for Indian Shopkeepers.

**Supported Display Languages:**

1. English
2. हिंदी — Hindi in Devanagari
3. Hinglish — Romanized Hindi with approved commonly used English retail terminology

### YOUR ROLE

Act as a Principal Internationalization Architect, Senior Full-Stack Developer, SaaS Architect, Localization Engineer, Senior UI/UX Designer, Accessibility Engineer, QA Automation Engineer, and DevOps Engineer.

You must improve the EXISTING DukaanSet application.

Inspect the current codebase, identify all existing language-related problems, and implement a complete, centralized, reliable localization system.

Do not create a disconnected translation demo.

Do not stop after translating a few pages.

Do not only change the language selector's appearance.

**Implement localization throughout the entire application, including dynamic business content, notifications, errors, VoiceOS, AI, reports, invoices, and new future features.**

---

# 1. ABSOLUTE PRIMARY REQUIREMENT

## ONE SELECTED LANGUAGE = ONE CONSISTENT APPLICATION EXPERIENCE

The language selector in the application header is the global source of truth for display language.

### If English is selected:

All application-generated user-facing content must be in English.

Examples:

- My Shop
- Today's Sales
- New Sale
- Add Stock
- Money to Collect
- Customer History
- Save Changes
- Payment Received

No accidental Hindi or Hinglish system text should appear.

### If Hindi is selected:

All application-generated user-facing content must be in natural Hindi using Devanagari script.

Examples:

- मेरी दुकान
- आज की बिक्री
- नई बिक्री
- सामान जोड़ें
- लेने वाले पैसे
- ग्राहक की खरीदारी
- बदलाव सेव करें
- भुगतान प्राप्त हुआ

Do not leave English sentences or Romanized Hinglish system messages scattered across the application.

### If Hinglish is selected:

All application-generated user-facing content must use a consistent Roman-script Hinglish style.

Examples:

- Meri Dukaan
- Aaj Ki Bikri
- Nayi Bikri
- Stock Jodo
- Paise Lene Hain
- Customer Ki Shopping
- Changes Save Karo
- Payment Mil Gayi

No accidental Devanagari system sentences should appear in Hinglish mode.

Approved English terms such as Stock, Customer, Bill, Payment, UPI, and Dashboard may be used where defined in the product's Hinglish terminology glossary.

### Critical Exception — Original Business Data

Never silently alter or translate:

- Customer names
- Original product names
- Registered business names
- Brand names
- Phone numbers
- Addresses
- Invoice identifiers
- Payment references
- User-entered notes
- Legal records
- Historical financial data

These are source records, not interface translations.

Provide verified localized display names or aliases for appropriate product and category data.

Always preserve original business records and identities.

The goal is complete consistency of application-generated content without corrupting merchant data.

---

# 2. FIRST AUDIT THE COMPLETE EXISTING PROJECT

Before making code changes:

1. Inspect the repository.
2. Identify the frontend framework.
3. Identify the existing translation libraries.
4. Find all language selector components.
5. Review user language preference storage.
6. Inspect API responses.
7. Review server-side rendering and hydration.
8. Check authentication screens.
9. Check business onboarding.
10. Check all dashboard modules.
11. Inspect Inventory and Sales.
12. Inspect Customers and Payments.
13. Inspect DemandPulse.
14. Inspect VoiceOS.
15. Inspect AI Assistant responses.
16. Inspect notifications.
17. Inspect reports and generated PDFs.
18. Identify every hardcoded user-facing string.
19. Identify missing translations.
20. Identify mixed-language components.

Create a clear internal audit showing:

- Correctly localized features
- Incomplete features
- Missing translations
- Hardcoded strings
- Inconsistent terminology
- Dynamic messages requiring restructuring
- Components requiring refactoring

Then implement fixes.

Preserve working application functionality.

---

# 3. BUILD ONE CENTRALIZED LOCALIZATION ENGINE

Use one consistent architecture.

Recommended locale identifiers:

- `en`
- `hi`
- `hinglish`

Use a mature internationalization solution compatible with the existing framework.

For example, in a Next.js application, evaluate `next-intl` or the project's established internationalization library.

Do not introduce a second conflicting localization framework.

### Recommended Architecture

- Global Locale Provider
- Global Language Selector
- Translation Dictionaries
- Translation Hooks
- Locale-Aware Formatters
- Central Translation Registry
- Dynamic Message Formatter
- Localized Notification Service
- Localized Validation Layer
- Localized PDF Renderer
- AI Output Locale Controller
- Translation Completeness Validator

Every application module must use the shared localization engine.

Avoid locally hardcoding language-specific conditional expressions throughout components.

---

# 4. GLOBAL HEADER LANGUAGE SELECTOR

Maintain one prominent language selector in the main header.

Options:

- English
- हिंदी
- Hinglish

### Language Switching Behaviour

When a user changes the language:

1. Update global language state.
2. Re-render navigation labels.
3. Update dashboard content.
4. Update form labels.
5. Update placeholders.
6. Update validation messages.
7. Update notifications.
8. Update report headings.
9. Update payment statuses.
10. Update VoiceOS interface.
11. Update DemandPulse.
12. Update AI Assistant display language.
13. Update localized dates and units.
14. Save the preference.

The language should change without forcing the user to log out.

### Preserve Current Work

Switching language must NOT:

- Clear an unfinished bill.
- Remove selected products.
- Reset entered quantities.
- Clear customer information.
- Change entered payment values.
- Delete an active voice draft.
- Reset DemandPulse input.
- Redirect users unnecessarily.
- Trigger duplicate API mutations.

Only the display language must change.

---

# 5. PERSIST LANGUAGE ACROSS SESSIONS AND DEVICES

Store the user's language preference in the authenticated user profile.

Expected behaviour:

A user selects Hindi.

They close DukaanSet.

They return tomorrow.

The application opens in Hindi.

They log in on another device.

Their saved account preference is respected.

### Priority Order

Use a clearly defined preference-resolution strategy:

1. Explicit saved user preference
2. Current selected session preference
3. Onboarding language selection
4. Supported application default

For anonymous visitors, persist a temporary preference appropriately.

After authentication, reconcile that temporary selection with the user's stored preference according to a predictable rule.

### Prevent Language Flashing

Do not render an English dashboard briefly before displaying the user's saved Hindi or Hinglish language.

Resolve the initial locale before rendering important user-facing content.

Ensure server-side and client-side locale state agree.

Prevent hydration mismatches.

---

# 6. STRICTLY LOCALIZE ALL APPLICATION MODULES

The following modules must support all three languages completely.

## Public Website

- Hero
- Navigation
- Features
- Product benefits
- How It Works
- Business categories
- Pricing
- FAQs
- Contact
- Footer
- CTAs
- Metadata
- Error pages

## Authentication

- Login
- Register
- Forgot Password
- Reset Password
- Verification
- Session Expired
- Logout
- Authentication Errors

## Onboarding

- Welcome
- Language Selection
- Business Details
- Business Category
- First Product
- Demo Setup
- Completion

## Dashboard

- Greetings
- Today's Sales
- Money Received
- Money Pending
- Low Stock
- Quick Actions
- Today's Work
- Recent Activity
- Charts
- AI Recommendations

## Inventory

- Product Management
- Product Categories
- Add Stock
- Stock In
- Stock Out
- Quantities
- Units
- Product Variants
- Stock Alerts
- Movement History

## Sales

- New Sale
- Product Selector
- Quantity
- Unit Price
- Customer
- Cash
- Online Payment
- Udhaar
- Split Payment
- Save Sale
- Invoice History
- Returns
- Refunds

## Customers

- Customer Profiles
- Customer 360°
- Purchase History
- Payment History
- Outstanding Amount
- Customer Statements

## DemandPulse

- Nahi Mila
- Missed Customer Requests
- Demand Entry
- Demand History
- Reorder Suggestions
- Follow-up Actions
- Available-Again Alerts
- Recovered Sales

## VoiceOS

- Microphone Controls
- Listening
- Processing
- Transcript
- Recognized Details
- Missing Information
- Corrections
- Form Preview
- Save Actions
- Errors
- Success Messages

## Other Modules

- Suppliers
- Purchases
- Expenses
- Reports
- Daily Closing
- Notifications
- AI Assistant
- Team Management
- Settings
- Help
- Subscription Management
- Demo Mode

There must be no unfinished localization islands.

---

# 7. STANDARD TRANSLATION FILE STRUCTURE

Use centralized, structured language dictionaries.

Suggested structure:

src/locales/
  en/
    common.json
    auth.json
    dashboard.json
    inventory.json
    sales.json
    customers.json
    payments.json
    demandpulse.json
    voiceos.json
    purchases.json
    reports.json
    settings.json
    notifications.json
    errors.json

  hi/
    [same namespaces]

  hinglish/
    [same namespaces]

Every locale must contain the required translation keys.

Example keys:

- dashboard.todaySales
- dashboard.pendingPayments
- sales.newSale
- sales.saveSale
- inventory.addStock
- customers.purchaseHistory
- payments.amountReceived
- demandpulse.recordMissedDemand
- voiceos.listening
- common.save
- common.cancel

Do not use English strings directly as translation keys if stable semantic keys are more appropriate.

Use typed translation keys where supported.

---

# 8. CREATE A MASTER LANGUAGE GLOSSARY

Maintain one approved terminology glossary.

| Concept | English | Hindi | Hinglish |
|---|---|---|---|
| Home | Home | होम | Home |
| My Shop | My Shop | मेरी दुकान | Meri Dukaan |
| Sales | Sales | बिक्री | Bikri |
| New Sale | New Sale | नई बिक्री | Nayi Bikri |
| Inventory | Stock | सामान का स्टॉक | Stock |
| Add Stock | Add Stock | सामान जोड़ें | Stock Jodo |
| Customer | Customer | ग्राहक | Customer |
| Payment | Payment | भुगतान | Payment |
| Money Pending | Money to Collect | लेने वाले पैसे | Paise Lene Hain |
| Low Stock | Low Stock | कम बचा सामान | Stock Kam Hai |
| New Bill | New Bill | नया बिल | Naya Bill |
| Save | Save | सेव करें | Save Karo |
| Cancel | Cancel | रद्द करें | Cancel Karo |
| Reports | Reports | रिपोर्ट | Reports |
| Demand Request | Missed Request | अधूरी मांग | Nahi Mila Request |

Use language familiar to Indian shopkeepers.

Avoid unnecessarily formal Hindi.

Avoid inconsistent spelling and terminology across screens.

Keep product brand names such as DukaanSet, VoiceOS and DemandPulse as proper names where appropriate.

---

# 9. STRICT DYNAMIC MESSAGE LOCALIZATION

This is a critical requirement.

Static UI translation is not sufficient.

Dynamic application-generated messages must also use the selected language.

Examples:

### Low Stock

English:
"Three products are running low."

Hindi:
"तीन सामान का स्टॉक कम हो रहा है।"

Hinglish:
"Teen products ka stock kam ho raha hai."

### Outstanding Payment

English:
"Rahul has ₹500 pending."

Hindi:
"राहुल के ₹500 बकाया हैं।"

Hinglish:
"Rahul ke ₹500 baaki hain."

### Sale Success

English:
"Sale saved successfully."

Hindi:
"बिक्री सफलतापूर्वक सेव हो गई।"

Hinglish:
"Sale successfully save ho gayi."

### DemandPulse

English:
"Blue Shirt XL is available again."

Hindi:
"नीली शर्ट का एक्सएल साइज़ फिर उपलब्ध है।"

Hinglish:
"Blue Shirt XL dobara available hai."

Use localized message templates with structured variables.

Do not store only an English message string as the notification's authoritative data.

Prefer:

- Message type
- Business data
- Structured parameters
- Selected locale
- Localized renderer

Handle pluralization and grammar using an appropriate message-formatting library.

---

# 10. BACKEND ERROR CODE LOCALIZATION

Do not return raw English exception messages directly to users.

Backend APIs should return stable error codes and safe structured details.

Example:

`INSUFFICIENT_STOCK`

`CUSTOMER_NOT_FOUND`

`INVALID_QUANTITY`

`PAYMENT_EXCEEDS_TOTAL`

`UNAUTHORIZED_ACTION`

The frontend must translate these errors according to the selected language.

For example:

English:
"Only 4 shirts are available."

Hindi:
"सिर्फ 4 शर्ट उपलब्ध हैं।"

Hinglish:
"Sirf 4 shirts available hain."

Keep technical error details in secure logs.

Do not leak stack traces, secrets, database information or internal identifiers.

---

# 11. COMPLETE AI ASSISTANT LANGUAGE CONTROL

The AI Assistant must follow the selected display language.

### English Selected

Respond in English.

Example:

"Today's total sales were ₹8,500."

### Hindi Selected

Respond in Hindi using Devanagari.

Example:

"आज की कुल बिक्री ₹8,500 रही।"

### Hinglish Selected

Respond in Romanized Hinglish.

Example:

"Aaj ki total bikri ₹8,500 rahi."

### Required Implementation

Pass the requested output locale explicitly to the AI response service.

Use structured data and controlled templates for high-value financial summaries where possible.

Validate the output language.

Avoid relying only on one generic AI prompt instruction.

Ensure fallback messages use the selected language.

Never fabricate financial figures.

If the user explicitly asks the AI to translate or produce a document in another language, handle that requested output language as a separate task without unexpectedly changing the application's global preference.

---

# 12. VOICEOS LANGUAGE INTEGRATION

Voice input language and application display language must be separate.

Example:

The shopkeeper selects English.

They speak:

"Rahul ka do shirts ka bill bana do."

VoiceOS may recognize the Hindi/Hinglish instruction.

The populated form must show English application labels:

- Customer
- Product
- Quantity
- Price
- Payment
- Outstanding
- Save Sale

If Hindi is selected, show the same form with Hindi interface labels.

If Hinglish is selected, display Hinglish labels.

Do not automatically change the display language based on the recognized spoken language.

Preserve the original recognized transcript when necessary.

The business records, product IDs and financial values must remain unchanged.

---

# 13. PRODUCT AND CUSTOMER DATA LOCALIZATION

Do not translate database records destructively.

Support optional localized display-name fields for appropriate catalogue items.

Example:

Product ID: 125

Original Name:
Blue Casual Shirt

English Display:
Blue Casual Shirt

Hindi Display:
नीली कैज़ुअल शर्ट

Hinglish Display:
Blue Casual Shirt

The system should use the approved localized display name.

If no approved translation exists, preserve the original product name and provide an obvious way for an authorised merchant to add a localized display name.

Never fabricate product variants, sizes, brands or identities through automatic translation.

Keep product IDs identical across languages.

For customers, preserve the original name unless a verified preferred display form is explicitly stored.

Invoice records must remain historically accurate.

---

# 14. LANGUAGE-AWARE BILLING AND PDF GENERATION

The selected language must affect invoice presentation.

Localize:

- Invoice Title
- Invoice Number Label
- Customer Label
- Date Label
- Product Label
- Quantity Label
- Price Label
- Total Label
- Payment Method Label
- Outstanding Balance Label
- Footer Instructions

Use correct Hindi font support for Devanagari PDFs.

Ensure:

- Proper glyph shaping
- No broken Hindi characters
- No missing fonts
- Correct line wrapping
- Consistent monetary amounts
- Printable layouts
- Legally required details remain preserved

Do not silently change original issued invoices.

Generate localized representations using the authoritative transaction data.

---

# 15. LOCALE-AWARE NUMBERS, DATES, CURRENCY AND UNITS

Use proper locale formatting.

### Money

Use consistent Indian currency formatting.

Examples:

₹1,500

₹25,000

₹1,25,000

Currency values must remain financially identical across languages.

### Dates

English:
9 October 2026

Hindi:
9 अक्टूबर 2026

Hinglish:
9 October 2026

### Units

English:
5 kilograms

Hindi:
5 किलो

Hinglish:
5 kilo

Keep stored quantities unchanged.

Use business-local timezone for dates and daily reporting.

Choose and document one clear numeral-display policy appropriate for Indian shopkeepers; do not arbitrarily switch between numeral systems in different components.

---

# 16. FONT AND RESPONSIVE LAYOUT

Use appropriate typography:

English: Inter or Manrope

Hindi: Noto Sans Devanagari

Hinglish: Inter or Manrope

Test on mobile:

- Buttons
- Inputs
- Navigation
- Cards
- Tables
- Dialogs
- Bottom Sheets
- Notifications
- Charts
- Reports

Hindi text may occupy more space.

Make component widths and heights flexible.

Avoid clipped text, overflow and overlapping labels.

Maintain the premium DukaanSet design system in all languages.

---

# 17. STRICT TRANSLATION FALLBACK POLICY

Never silently show English application labels in Hindi mode because a translation key is missing.

Never silently display Hindi text in Hinglish mode.

### During Development

Report missing translations clearly.

### During CI

Fail required translation-completeness checks when necessary localization resources are absent.

### In Production

Use an appropriate localized fallback state when a translation unexpectedly fails.

Log the missing key securely.

Do not expose raw keys such as:

`dashboard.todaySales`

Do not expose internal exception text.

Treat untranslated production UI strings as defects that require fixing.

---

# 18. NO HARDCODED USER-FACING STRINGS

Audit all components and services.

Find and localize:

- JSX text
- Button labels
- Form labels
- Placeholders
- Navigation
- Dialog titles
- Toast messages
- Error banners
- Validation strings
- Tooltips
- Notifications
- Empty states
- Loading states
- Chart labels
- Report headings
- PDF templates
- AI prompts that produce UI-facing text
- VoiceOS instructions
- DemandPulse messages

Use the central translation engine.

Introduce lint or static analysis rules where feasible to prevent future hardcoded UI strings.

---

# 19. STRICT FUTURE-FEATURE LOCALIZATION POLICY

DukaanSet will continue adding new capabilities.

Every new user-facing feature must include:

1. English translations.
2. Hindi translations.
3. Hinglish translations.
4. Localized validation messages.
5. Localized empty states.
6. Localized notifications.
7. Responsive translated layouts.
8. Appropriate automated tests.

A future feature is not ready for release if its required translations are missing.

This rule must apply to:

- New VoiceOS capabilities
- New DemandPulse actions
- Billing enhancements
- Customer features
- Inventory improvements
- AI insights
- Supplier modules
- New reports
- New onboarding screens

Language completeness must be part of the feature Definition of Done.

---

# 20. MULTILINGUAL NOTIFICATION SYSTEM

Localize:

- In-app notifications
- Payment reminders
- Stock alerts
- DemandPulse alerts
- Customer follow-ups
- Daily closing reminders
- System messages
- Emails and other communications where implemented

Generate notification text using structured events and locale-specific templates.

For customer-facing messages, use an appropriate customer communication-language preference where available.

Do not assume the shopkeeper's UI language is always the correct language for the customer.

Respect messaging permissions and consent requirements.

Do not automatically send messages simply because a translated template exists.

---

# 21. MULTILINGUAL MARKETING WEBSITE AND SEO

Localize the DukaanSet public marketing website.

Support appropriate locale-specific routes.

Example:

`/en`

`/hi`

`/hinglish`

Translate:

- Homepage
- Features
- Pricing
- FAQs
- Product benefits
- How It Works
- Contact
- Public demo instructions

Configure:

- Appropriate document language
- Locale-specific page titles
- Meta descriptions
- Canonical URLs
- Alternate-language metadata
- Relevant hreflang links
- Sitemap handling

Do not accidentally expose private dashboard pages to search indexing.

Avoid duplicate-content problems caused by incorrect locale routes.

---

# 22. LOCALIZED SEARCH WITHOUT CHANGING UI LANGUAGE

Allow users to search catalogue records using language variations where suitable.

Example:

Milk

Doodh

दूध

All may resolve to the same configured product when aliases exist.

The displayed result must respect the selected display language when an approved localized name is available.

Search input language must not automatically change the interface language.

Do not silently merge unrelated products.

---

# 23. AUTOMATED TRANSLATION VALIDATION

Implement automated checks for:

- Missing translation keys
- Duplicate keys
- Empty translations
- Invalid variables
- Incorrect placeholders
- Inconsistent interpolation
- Invalid plural messages
- Untranslated validation messages
- Missing notification templates
- Missing report labels
- Missing VoiceOS translations
- Missing DemandPulse translations
- Wrong-script interface strings
- Unexpected English fallback in Hindi/Hinglish

Allow explicit exceptions for approved brand names, source data, identifiers and intentionally shared technical terminology.

Prevent false positives by using an approved localization glossary and exception registry.

Generate a language-coverage report.

---

# 24. COMPLETE MULTILINGUAL END-TO-END TESTING

Use Playwright or the existing test framework.

Test all major workflows in all three languages.

### English

- Login
- Registration
- Onboarding
- Dashboard
- Inventory
- New Sale
- Customers
- Payments
- DemandPulse
- VoiceOS
- Reports
- Settings

Verify application-generated text is English.

### Hindi

Repeat the same tests with Hindi selected.

Verify Devanagari Hindi throughout system-generated content.

### Hinglish

Repeat with Hinglish.

Verify consistent Romanized Hinglish interface text.

### Additional Critical Tests

Switch language:

- During an unsaved bill.
- During a payment form.
- During VoiceOS transcription.
- During a DemandPulse draft.
- During a validation error.
- With an open modal.
- While asynchronous requests are loading.
- Before generating an invoice.
- After logging out and logging back in.
- After switching businesses.
- On another device using the same account.

No business data must be lost.

No duplicate financial operation should occur.

---

# 25. CI/CD QUALITY GATE — MANDATORY

Integrate localization validation into the existing GitHub Actions pipeline.

The project uses or plans to use:

- Feature branches
- `dev` branch
- Vercel staging
- `main` production branch

### On Pull Requests

Run:

1. Translation completeness checks.
2. Translation schema validation.
3. Hardcoded UI string checks.
4. Type checking.
5. Linting.
6. Unit tests.
7. Localization-related component tests.
8. Build verification.

### On Staging

Run multilingual smoke tests.

Verify:

- English dashboard
- Hindi dashboard
- Hinglish dashboard
- Language persistence
- Localized errors
- VoiceOS draft labels
- DemandPulse labels
- PDF output where test infrastructure supports it

### Release Rule

Known mandatory localization failures must block release approval.

Use required GitHub status checks or the existing approved release gates.

Do not falsely claim a Vercel Preview Deployment was prevented by CI unless deployment gating has actually been configured.

---

# 26. APPLICATION PERFORMANCE

Language switching should feel fast.

Use:

- Efficient translation namespaces
- Appropriate lazy loading
- Cache management
- Server/client locale synchronization
- Avoidance of unnecessary rerenders

Do not unnecessarily reload the entire dashboard.

Prevent stale cached translations from appearing after language changes.

Include locale in cache keys for genuinely locale-dependent responses.

Prefer language-neutral structured business data where practical.

---

# 27. ACCESSIBILITY

Update page language metadata appropriately.

Use suitable BCP 47 locale information and test the treatment of Romanized Hinglish with supported assistive technologies.

Localize:

- Screen-reader labels
- Form error announcements
- Button descriptions
- Navigation labels
- Dialog accessibility text

Test Devanagari fonts and screen-reader pronunciation where feasible.

Ensure keyboard navigation and touch accessibility remain consistent.

---

# 28. FINAL DEMONSTRATION SCENARIO

Create a complete working language-switching demonstration using an isolated fictional business.

### Demo Business

Sharma Kirana Store

### Scenario A — English

Select English.

Open:

- Dashboard
- Inventory
- New Sale
- Customer Profile
- DemandPulse
- VoiceOS
- Reports

Verify consistent English UI.

### Scenario B — Hindi

Switch to Hindi.

Keep the same business and data.

Verify that all application-generated labels, notifications, forms and messages change to Hindi.

### Scenario C — Hinglish

Switch to Hinglish.

Verify all supported content follows the approved Hinglish wording and Roman-script style.

### Scenario D — Create a Sale

Start a sale in English.

Enter products, customer and payments.

Switch to Hindi before saving.

All inputs and numeric values must remain intact.

Save the sale.

The success notification and resulting customer history must use Hindi UI labels.

### Scenario E — VoiceOS

Select English display language.

Speak a Hindi/Hinglish command.

Verify the recognised command fills an English-labelled form.

Switch to Hindi.

Verify the same draft displays Hindi interface labels without losing information.

### Scenario F — DemandPulse

Create a missed customer demand.

Verify all generated statuses and messages follow the selected language.

### Scenario G — Persistence

Select Hindi.

Log out.

Log in again.

The application must open with Hindi consistently.

No unexpected English dashboard flash should appear.

---

# 29. REQUIRED DELIVERABLES

Deliver:

1. Audited existing localization architecture.
2. One centralized language engine.
3. Working global header selector.
4. Persistent user language preferences.
5. Complete English translation dictionaries.
6. Complete Hindi translation dictionaries.
7. Complete Hinglish translation dictionaries.
8. Master terminology glossary.
9. Fully localized public website.
10. Fully localized authentication.
11. Fully localized onboarding.
12. Fully localized dashboard.
13. Fully localized inventory.
14. Fully localized billing.
15. Fully localized customers and payments.
16. Fully localized DemandPulse.
17. Fully localized VoiceOS interface.
18. Fully localized AI display responses.
19. Localized notifications.
20. Localized dynamic error messages.
21. Localized report labels and generated invoice documents.
22. Optional verified product display names.
23. Locale-aware financial and date formatting.
24. Strict translation fallback policy.
25. Hardcoded-string detection.
26. Translation validation scripts.
27. Automated multilingual tests.
28. GitHub Actions quality gates.
29. Verified Vercel staging behaviour where access is available.
30. Final localization audit report.

---

# 30. FINAL ACCEPTANCE CRITERIA

Do not mark this feature complete until:

- English mode consistently displays English application-generated content.
- Hindi mode consistently displays Hindi application-generated content.
- Hinglish mode consistently displays approved Romanized Hinglish application-generated content.
- No unapproved mixed-language system strings remain.
- All application modules follow the global language.
- Dynamic content is localized.
- Backend errors are localized.
- Notifications follow the correct language preferences.
- AI UI-facing responses respect the requested locale.
- VoiceOS input language is independent of display language.
- Product and customer source records remain unchanged.
- Switching languages preserves active drafts.
- Financial amounts remain identical.
- Invoice PDFs render correctly.
- Preferences persist between sessions.
- Mobile layouts remain clean.
- Mandatory translation completeness tests pass.
- Major multilingual E2E tests pass.
- The implementation has been verified on actual rendered screens.

Document any genuine limitations rather than claiming untested completeness.

---

# FINAL EXECUTION INSTRUCTION

You are not being asked to provide suggestions or mockups.

Inspect the existing DukaanSet repository.

Implement the complete localization architecture.

Remove fragmented language handling.

Audit and translate every application-generated user-facing string.

Ensure the selected display language controls the entire website, application dashboard, forms, validation messages, notifications, reports, AI-facing interface, VoiceOS screens and PDF presentation layers.

Preserve all original merchant-entered data and financial records.

Implement strict translation completeness requirements and automated CI/CD enforcement.

Test every important module in English, Hindi and Hinglish.

Do not stop after completing only the dashboard.

## NON-NEGOTIABLE PRODUCT RULE

**ENGLISH SELECTED → COMPLETE ENGLISH APPLICATION EXPERIENCE.**

**HINDI SELECTED → COMPLETE HINDI APPLICATION EXPERIENCE.**

**HINGLISH SELECTED → COMPLETE HINGLISH APPLICATION EXPERIENCE.**

No accidental language mixing.

No missing production-facing translations.

No broken mobile layouts.

No lost business data.

No unfinished localization across modules.

### FINAL PRODUCT PROMISE

**DukaanSet — Aapki Dukaan, Aapki Bhasha, Aapka Hisaab.**

**BEGIN IMPLEMENTATION IN THE EXISTING DUKAANSET CODEBASE. DO NOT STOP AT PLANNING.**
