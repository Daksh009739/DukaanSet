# V14 premium application UX and shared VoiceOS

## Delivered changes

The approved dashboard composition and existing merchant ledger remain the reference. Stock and customer details now show compact summaries and readable timelines with real invoice references, signed movements, payment methods and statuses. Missing images use useful merchant wording; authorised discovery, photo overrides and source attribution remain available.

DemandPulse has a concise process and contextual catalogue preparation. Preparing a requested product creates and links it atomically with zero opening stock. It does not create an invoice, mark availability, record payment or count recovered revenue. Both DemandPulse and inventory permissions are required. The same frozen request can recover a lost acknowledgement without making a second product.

Business Assistant embeds the same scoped conversation used by the global launcher. Suggested financial questions, current business context and related records sit alongside the shared microphone and text composer. Settings use grouped desktop navigation and a compact grouped mobile selector. Account, security, shop, language and business features remain real validated settings; developer diagnostics sit under Advanced.

## Root causes and correction

The former inline interpreter treated page context as an intent restriction. Stock-like wording from Billing was blocked before it could reach a different workflow. The generic “add” wording also competed with “cash” before the system decided whether the user wanted stock or a sale. Repeated command words polluted parsing, while the old prepared/applied copy did not distinguish a draft from a committed transaction.

The shared router now gives explicit intent priority over page context. The exact disputed instruction preserves Aashirwad Aata 10 kg, Basmati Rice 2 kg and Daal 10 kg, then asks one stock-versus-sale question. Ambiguous dal variants require an explicit choice. Choosing stock uses the established atomic stock engine; choosing sale creates the editable cash-sale draft. A final confirmation executes the appropriate authoritative service. No interpretation, microphone stop or workflow navigation creates a business transaction.

Compiled consecutive-workflow testing also exposed a stale global stock seed after a successful receipt. Stock now explicitly reports its actual committed entry to the global conversation, retires the old seed once, persists the remaining draft and clears the completed command. Reopening or reloading cannot prepare that old successful stock instruction again. A browser regression checks the retired rows and unchanged authoritative entry count after reload.

Transcript handling now separates interim hypotheses from final results, replaces repeated recognition indices, normalises repeated command/unit words and preserves meaningful numbers. Only a successful final capture automatically prepares a draft. Denied, silent, aborted, replaced, offline or business-switched capture cannot prepare or save an old transcript. Text entry stays available where supported. Display language and speech language remain independent.

The shared text composer also avoids nesting a form inside existing manual domain forms. Enter prepares the voice instruction without submitting the enclosing sale, payment or expense form, and IME composition is respected.

Loaded production screenshots revealed that a restored report could wait indefinitely when its command hydrated before the business state. Report loading now depends on actual scoped report permission readiness, retains abort guards and resumes when the business records arrive. Browser reload and compiled screenshots assert a numeric answer instead of accepting a loading panel.

The registry declares schemas, entities, permissions, draft construction, confirmation, actual service mappings, retry policy and audit boundaries. Direct writes can construct only fixed allowlisted domain paths. Global Save dispatches through the registered request builder; other actions open the existing authorised review form. The capability matrix documents the precise distinction and genuine manual-only operations.

## Safety and architecture

All financial quantities and amounts use existing exact integer arithmetic and authoritative backend validation. Sale invoices, payment allocations, stock movements and new-customer dependencies continue to commit transactionally. Credit collection never creates a sale; reorder planning never implies goods receipt; receipt never implies supplier payment; sharing preparation never claims delivery.

Confirmed direct requests and stock batches keep a frozen idempotency key through uncertain network responses and reload recovery. Domain rejection requires review against refreshed business records. Command recovery is bounded and accepts only registered paths; tenant and role enforcement remain server-side. New DemandPulse product preparation is transactional and audited. No new schema migration, external database or production mock records were added.

Development diagnostics retain at most 30 non-sensitive metadata events. They exclude transcript text, audio, merchant names, phone numbers and financial amounts. The production diagnostics component renders nothing. No provider key was added to the browser.

## Screenshot audit and evidence

The V14 attachment supplied the written seven-screen audit but did not include the seven original image files. The approved dashboard reference is available in `docs/qa/v13/approved-reference.png`. Before screenshots were captured from the previously verified V13 production build with fictional data; after screenshots use the revised application and isolated fictional data. They demonstrate layout and workflow differences rather than identical balances or pixel matching.

Visual review corrected a customer-receipt label, mobile Settings navigation, photo-header spacing and repeated clarification copy. The audit covers 320, 360, 390, 430, 768, 1024, 1440 and 1920 pixel widths, plus English, Hindi and Hinglish mobile renders. Desktop/mobile automated accessibility covers the five redesigned main screens; VoiceOS accessibility remains covered by conversation and VoiceOS suites.

Before/after comparisons and actual idle, listening, clarification, review, saving, success and recovery captures are listed in `screenshots.md`. Listening captures use simulated recognition; they do not establish live speech quality.

## Verification and environment

Final command results, compiled-source comparison and browser checks are retained alongside this report. Tests use isolated fictional businesses, with payment and stock assertions read back from the backend rather than inferred from a success banner. The V14 Quality workflow includes the existing financial, security, localisation, accessibility and production checks plus the new V14 unit, browser and compiled review.

Local production verification uses a fresh dependency checkout to avoid Windows junction restrictions, then compares compiled source with the workspace. Rendering is reviewed after compilation because production CSS order can differ from development.

Live browser/cloud speech recognition and provider accuracy are not verified. Supported deterministic financial questions and catalogue aliases work without pretending that a generative provider is connected. A real audio acceptance test requires the merchant’s microphone/browser and any configured provider.

Vercel staging requires a real persistent HTTPS backend. The last inspected deployment refused to build because `DUKAANSET_BACKEND_ORIGIN` was absent. No backend URL or hosting credentials have been supplied; deployment success is not claimed. The release targets dev after exact-head Quality success. Main and production are not promoted by this work.
