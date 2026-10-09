# DukaanSet VoiceOS V4

VoiceOS prepares the existing business forms. A recognised or typed command does not post a sale, receive inventory, collect money, finalise a day or send a message. The merchant reviews the actual form and presses its existing confirmation button.

## Run and use

Use Node 24 and `npm run dev`, then open `http://127.0.0.1:3000`. The highlighted VoiceOS microphone in the app header opens the global assistant. Billing has **Bolkar Bill Banao** above its product selector; Stock retains its prominent **Bolkar Stock Jodo** card above the catalogue. Customers, payments, purchases, suppliers, expenses, reports, DemandPulse and closing expose contextual voice actions.

1. Choose **Spoken language** independently of the app's English, Hindi or Hinglish display language. `en-IN` and `hi-IN` are real browser recognition locales; Hinglish has no invented browser locale.
2. Start the microphone explicitly, speak and stop. Review the transcript, or type a command when recognition is unavailable.
3. Press **Fill draft**. Global VoiceOS then offers **Open workflow**; report questions display authorised business figures directly.
4. Resolve product/variant choices and missing information. Edit the ordinary form as needed, then press Save/Confirm. Voice corrections patch this same draft.

No separate voice credentials are required for the shipped browser speech adapter. Its speech service, browser support, microphone permission and internet connection still determine whether transcription works on a particular device. The application explains failures and provides typing. It does not fabricate recognised audio. See [MDN SpeechRecognition](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition) and [recognition language](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/lang).

## Integrated workflows

| Action | Result after review and explicit confirmation |
| --- | --- |
| Sale | Existing invoice transaction records snapshots, cash/UPI receipts, credit and one stock deduction. Explicit unit prices belong to this invoice; they do not change the catalogue. |
| Stock | Existing atomic voice-stock batch adds matching products or reviewed new-product drafts, records movements and provides repeat history. New-product selling prices remain explicit. |
| Customer / supplier | Existing contact forms fill name/phone, require review and use recoverable idempotency keys. Voice-assisted duplicate names/phone numbers are refused unless the merchant deliberately chooses a separate contact. |
| Old-dues payment | Existing collection service allocates oldest outstanding invoices. Collections do not become new sales. Cash and UPI collections are separate entries. |
| Purchase receipt | Existing supplier purchase form receives multiple products, uses reviewed costs and records supplier credit. Cash is the currently supported purchase payment method. |
| Expense | Existing expense form records the reviewed description, amount and method. |
| DemandPulse | Existing request form records the product/variant and requested units separately from reported visitor count. It changes neither sales nor stock. Follow-up consent remains an explicit checkbox. |
| Reorder / follow-up | Opens the existing reviewed reorder draft or consent-aware message preview. A reorder does not receive stock; message preparation does not send a message. |
| Closing | Fills actual/opening cash in the existing reconciliation form. The normal confirmation finalises the day; the server calculates expected cash. |
| Reports / navigation | Authorised reports query real records. Screen/account navigation checks the active business's features and permissions. |

Examples: `quantity teen kar do`, `Nahi, cash 800 tha`, `phone 9876543210`, `2 piece`, `price 899 each`, `black T-shirt hatao`, `cancel draft`, `Stock kholo`, `Rahul ka account kholo`, `Aaj kitni sales hui?`. If several products/contacts could match, the merchant must select one. A correction that could affect several items stays unresolved. Clearing voice context keeps ordinary form values; cancelling an unsent bill clears its draft, while cancelling a sheet closes its unsaved form.

An unspecified sale payment is not inferred as fully paid. The bill remains blocked until the merchant selects its receipt method/amount in the normal payment section, including after a draft reload. A quoted price with an unclear basis, or a spoken unit that differs from the catalogue unit, requires a reviewed price basis. Exact conversions and whole-piece restrictions reuse the existing inventory validator. Repeated fractional quantities add as scaled integers. Numeric size/brand tokens are not silently treated as quantities.

## Architecture and data boundaries

`WorkspaceLayout` persists the app/session, operation forms, write-recovery context and one `VoiceOSProvider` across private route navigation. Its scope includes account, business and demo-reset epoch. `voice-os-provider.tsx` owns one recognition instance, one capture owner, indexed interim/final transcript replacement, stale-event generations, cleanup, timeout and explicit stop/abort. Existing stock and DemandPulse microphone controls use this same owner rather than starting competing recognition instances. Page cleanup, offline state, business switching and logout end capture.

`src/lib/voice/os.ts` is a bounded, allowlisted draft interpreter and entity resolver. It is deterministic code, **not a configured generative AI service**. Stock retains its specialised parser and new-product review within the shared engine. The interpreter outputs fields, item candidates, changes and clarification warnings; it has no write capability. Unsupported free-form language, accents or complex multi-workflow instructions can require correction or manual entry. Browser transcription quality and interpretation quality are different responsibilities.

All confirmed actions use the existing Store/SaaS services, authenticated same-origin routes, business references, permissions, transactions, audit records and integer paise/milli arithmetic. No alternate billing, stock or payments ledger was introduced. Contact/purchase/expense/payment recovery retains the immutable request and key when a response is uncertain. Invoice recovery freezes its exact prices, receipts, attachments and quantities before sending. Existing stock recovery remains intact.

`GET /api/businesses/:id/voice-report?period=today|week|all` requires reports permission and the VoiceOS feature (the existing voiceStock configuration key). It aggregates the complete ledger with India-day boundaries, excludes cancelled sales and subtracts refunds from recorded collections. It does not sum the capped 1,000-record UI history. Outstanding and stock answers are current; demand/recovered-sales answers explicitly identify current/all-time scope. UPI values are manual records, not bank-verified settlements.

The browser may transmit audio to its recognition service. DukaanSet does not retain raw audio or send transcripts to an LLM. Stock transcripts and ordinary drafts can exist in account/business-scoped browser session storage; unsent recovery bodies contain the structured values needed to retry. Ordinary drafts are cleared on logout, while unresolved writes retain their original identity for the same account. Server audit records trace the confirmed business operations. Demo screenshots/tests contain fictional data only.

The database schema remains version 3. This feature upgrade does not reset existing businesses, old invoices or stock. New/reset isolated demo workspaces have the V4 fixtures; existing demos acquire them only through the explicit Reset demo action.

## Mandatory isolated demo A–E

Use **Try demo**, choose English display if following these labels, and select Sharma Fashion Store. Reset is authorised only for the fictional, unshared demo workspace.

Fashion starts with four Blue Casual Shirt M units, an unavailable Blue Shirt XL, two existing XL requests and Rahul Sharma's historical unpaid ₹1,299 jeans invoice. It has no sale today initially. Historical opening stock and that sale reconcile; no synthetic balance was inserted.

| Demo | Command / review | Actual expected change |
| --- | --- | --- |
| A | `Rahul ko 2 blue shirts 899 ki ek bechi, 1000 cash mila aur 500 UPI se, baaki udhaar.` Choose Blue Casual Shirt M from the variant choices, then Save Sale. | New bill ₹1,798, cash ₹1,000, UPI ₹500, this bill's credit ₹298; M stock 4 → 2. Rahul's account balance becomes ₹1,597 including his historical ₹1,299. |
| B | Switch to Sharma Kirana Store: `4 doodh packet aur 5 kilo pyaz add kar do.` Open the stock workflow and Confirm & add stock. | Milk +4 packets and Onion +5kg in one stock batch; sales unchanged. |
| C | Switch back to Fashion: `Ek customer ne 2 XL blue shirts maangi thi, lekin available nahi hain.` Save request. | One extra request for two XL units; sales and inventory unchanged. Anonymous follow-up consent is not granted. |
| D | `Rahul ne 500 rupaye purane udhaar ke cash diye.` Review and Save payment. | Historical credit falls ₹1,299 → ₹799; the new bill retains ₹298 due. Account balance becomes ₹1,097. Today's cash collections +₹500; today's sales unchanged. |
| E | `Aaj kitni sales hui?` | Actual ledger answer ₹1,798 and one bill today after A–D. |

**Text-command demo** fills the same transcript field with an example and is separately labelled. The examples can be read aloud into a supported browser, but automated tests use typed commands or explicitly mocked speech events; they do not certify physical microphone accuracy.

## Deployment and remaining validation

VoiceOS is built into the existing Node 24 app and `dev` quality workflow. The Vercel gateway/durable-backend design is unchanged; [staging setup](VERCEL_STAGING_SETUP.md) and [staging status](staging-test-report.md) describe the missing hosted backend and sender configuration. The stable alias is not a successful live deployment.

Physical Android/desktop microphone, merchant accents/noisy recordings, live HTTPS speech permissions, live staging A–E and verified email delivery have **not** been certified in this implementation session. Regional languages, offline STT, optional TTS and a model-backed free-form voice interpreter are future adapters, not enabled features. The current parser deliberately asks for choices instead of claiming universal speech understanding.

See [V4 test results](v4-test-report.md) and the preserved [user brief](briefs/v4-voiceos-master.md).
