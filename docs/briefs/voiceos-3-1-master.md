# DUKAANSET VOICEOS 3.1
## FINAL PRODUCTION-GRADE MASTER IMPLEMENTATION PROMPT FOR CODEX

### FIX EXISTING BUGS • AUTOMATIC MICROPHONE STOP • CORRECT LANGUAGE RESPONSES • TWO-WAY CONVERSATIONAL AI • REAL BUSINESS AUTOMATION • PREMIUM VOICEOS UI • FULL APPLICATION INTEGRATION

**Product:** DukaanSet
**Tagline:** Apni Dukaan, Sab Set.
**Primary Feature:** Global VoiceOS
**Priority:** P0 — Business Critical
**Implementation Target:** Existing DukaanSet application and repository

---

# 1. CRITICAL PROJECT INSTRUCTION

You are acting as a Principal AI Engineer, Senior Full-Stack Developer, Speech Systems Engineer, SaaS Architect, UI/UX Designer and QA Automation Engineer.

The existing DukaanSet VoiceOS was recently enhanced, but its current implementation is broken and unreliable.

**YOUR TASK IS NOT TO DESIGN ANOTHER DEMO. YOUR TASK IS TO FIX THE ROOT CAUSES AND MAKE THE EXISTING VOICEOS WORK END TO END.**

VoiceOS is DukaanSet's PRIMARY PRODUCT DIFFERENTIATOR.

Our future product marketing will depend heavily on its accuracy, simplicity and reliability.

Treat VoiceOS with the same seriousness as authentication, billing and financial record management.

### NON-NEGOTIABLE

- Work directly in the existing repository.
- Audit existing code before rewriting anything.
- Fix actual bugs, not just their visual symptoms.
- Reuse authorised existing backend services.
- Do not create a disconnected application or fake AI demo.
- Do not assume missing APIs already exist.
- Implement missing supported integrations properly.
- Verify actual database updates.
- Preserve the approved DukaanSet brand identity.
- Do not stop at a development plan.
- Do not mark the feature complete until tests pass.

---

# 2. KNOWN EXISTING BUGS — REPRODUCE AND FIX

The current VoiceOS has exhibited the following issues during actual usage.

## BUG 1 — CUSTOMER COMMAND NOT EXECUTING

User speaks:

"Rahul ke naam se ek customer add kar do."

The microphone captures the sentence and displays its transcript, but the application fails to produce the correct customer-creation draft or complete the requested flow.

Sometimes the interface returns to the previous state.

### EXPECTED

1. Speech is recognised.
2. Sentence completion is detected.
3. Microphone automatically stops listening for that turn.
4. Final transcript is submitted exactly once.
5. Intent is identified as CREATE_CUSTOMER.
6. Customer name is identified as Rahul.
7. Existing customer matches are checked.
8. A proper Customer Creation draft appears.
9. Only genuinely required missing fields are requested.
10. User confirms.
11. Actual backend customer record is created.
12. The verified result appears in the Customers module.
13. VoiceOS announces success in the appropriate language.

**Customer creation must not ask for product price, stock quantity or payment method.**

## BUG 2 — MICROPHONE DOES NOT AUTO-STOP

The merchant currently has to manually stop the microphone after finishing a sentence.

### REQUIRED FIX

Implement reliable end-of-utterance detection.

When the user finishes speaking:

- Detect the speech ending.
- Allow a short configurable silence window.
- Finalise the transcript.
- Stop the recording/listening turn automatically.
- Dispatch the recognised command.
- Start the assistant response flow.

The microphone should not remain stuck at "Listening..." after a completed utterance.

Do not use a fixed timeout from the moment the microphone starts, as this would cut off longer sentences.

Use the actual speech provider's final-result/end-of-turn events or implement appropriate voice activity detection (VAD), with tunable silence thresholds.

Handle natural pauses, long product names, low-volume voices and background shop noise.

### QUICK MODE

Automatically end the listening turn, process the command and show the next state.

### TALK MODE

Automatically end each user turn, process it and reply aloud.

Keep the deliberately activated Talk Mode session available for follow-up conversation.

Resume listening safely after assistant speech finishes, when appropriate.

Never transcribe the assistant's own voice as another user command.

---

# 3. BUG 3 — PREVIOUS ANSWER APPEARING AGAIN

The existing system has shown an old sales-summary response even after the merchant speaks an unrelated customer-creation command.

This indicates a possible conversation-state, transcript-finalisation, command-dispatch or stale-response-handling issue.

### INVESTIGATE

- Stale React state
- Incorrect effect dependencies
- Speech recognition callbacks
- Duplicate or missing event listeners
- Final transcript dispatch
- Async race conditions
- Reused response state
- Old promises completing after new requests
- Incorrect conversation identifiers
- Request cancellation
- Draft reset behaviour
- Voice session lifecycle

### REQUIRED RESULT

If the merchant says:

"Rahul naam ka customer add kar do."

The system must not show an unrelated previous sales report as the new result.

Each recognised utterance must be associated with the correct conversation turn, request ID and pending action.

Retain genuine conversation history, but never mistake previous responses for a new command's result.

Implement stale-request protection and exactly-once dispatch per final utterance.

---

# 4. BUG 4 — CORRECT LANGUAGE BEHAVIOUR

This requirement is extremely important.

The application already has a global language selector in the top navigation.

It supports:

- English
- Hindi
- Hinglish

**Do not create a separate VoiceOS Reply Language dropdown.**

Implement the following language policy.

## RULE A — DEFAULT LANGUAGE

When VoiceOS first opens, or when no clear spoken-language signal exists, its greeting, instructions and default responses must follow the language selected in the application's global topbar.

Example:

Topbar selected: English

Initial VoiceOS greeting:

"Hello! How can I help with your shop today?"

Topbar selected: Hindi

Initial greeting:

"नमस्ते! आज दुकान के किस काम में मदद करूँ?"

Topbar selected: Hinglish

Initial greeting:

"Namaste! Aaj dukaan ke kis kaam mein help karun?"

## RULE B — MATCH CLEAR USER SPEECH

If the merchant clearly speaks English, respond in English.

If the merchant clearly speaks Hindi, respond in Hindi.

If the merchant clearly speaks Hinglish, respond in natural Hinglish.

Examples:

User: "Create a customer named Rahul."

Reply: "Sure. I've prepared Rahul's customer details. Shall I save them?"

User: "राहुल के नाम से कस्टमर बना दो।"

Reply: "बिल्कुल। राहुल के नाम से नया कस्टमर तैयार है। सेव कर दूँ?"

User: "Rahul naam ka customer add kar do."

Reply: "Bilkul! Rahul ka customer ready hai. Save kar doon?"

## RULE C — AMBIGUOUS SHORT REPLIES

For short utterances like:

- Yes
- Haan
- Okay
- Cash
- 500

Continue the conversation's established language.

If there is insufficient evidence, use the topbar's selected language.

## RULE D — GLOBAL LANGUAGE CHANGES

If the user changes the application's language, update VoiceOS default interface text and future fallback responses accordingly.

Do not unnecessarily erase an active draft.

Keep the global display-language preference and automatic spoken-language detection connected through a clear precedence policy.

### IMPORTANT

Do not hardcode Hindi responses.

Do not use the English topbar selection to prevent a clearly Hindi-speaking user from receiving Hindi responses.

Do not continuously switch languages due to unreliable detection of short phrases.

---

# 5. ASSISTANT VOICE SELECTION

Provide only one voice-personalisation feature:

## CHOOSE ASSISTANT VOICE

Allow the merchant to select from genuinely available assistant voices.

Support female-sounding, male-sounding and other voice styles where the configured provider offers them.

### LOCATION

VoiceOS Header → Settings → Choose Assistant Voice

Also accessible through:

Main Settings → VoiceOS → Choose Assistant Voice

### FEATURES

- Real voice choices
- Audio preview
- Selected checkmark
- Persistent user preference
- Restore selection after refresh/login
- Compatible multilingual TTS
- Graceful fallback if the selected voice does not support a language

Do not invent voice options.

Do not introduce a separate reply-language preference.

Do not use different disconnected voice-setting implementations.

---

# 6. REBUILD THE MICROPHONE LIFECYCLE CORRECTLY

Implement an explicit, testable speech-session state machine.

Suggested states:

IDLE

REQUESTING_PERMISSION

LISTENING

SPEECH_DETECTED

FINALISING_TRANSCRIPT

UNDERSTANDING

CLARIFYING

DRAFT_READY

AWAITING_CONFIRMATION

EXECUTING

SPEAKING

COMPLETED

ERROR

CANCELLED

### REQUIRED BEHAVIOUR

- State transitions must be predictable.
- Only one microphone capture session should be active.
- Only one final transcript dispatch occurs per user turn.
- Interim transcripts must never trigger financial writes.
- Stop actions must cancel the correct session.
- Unmounting or closing VoiceOS must release resources.
- A late STT event must not revive a closed session.
- A late network response must not overwrite a newer active task.
- TTS and microphone capture must be coordinated.
- Timeouts must have recoverable handling.
- Cancel must not silently commit anything.

### MY RECOMMENDATION

Separate these concerns:

1. Audio capture state
2. Conversation state
3. Current business-action draft
4. Backend execution state
5. Audio playback state

Do not manage the entire VoiceOS through a few loosely coordinated booleans.

---

# 7. INTELLIGENT END-OF-SPEECH DETECTION

The merchant should feel that VoiceOS naturally understands when they finish speaking.

### IMPLEMENT

Use provider endpointing and/or configurable VAD with suitable:

- Speech-start detection
- Silence detection
- End-of-utterance handling
- Noise filtering
- Partial/final transcript handling
- Long-sentence continuation
- No-speech timeout
- Manual override

Tune thresholds using real Hindi, Hinglish and English recordings.

### EXAMPLE

Merchant:

"Rahul ke naam se ek customer add kar do."

Merchant finishes speaking.

Short silence follows.

VoiceOS automatically:

- Finalises transcription
- Ends that listening turn
- Processes the CREATE_CUSTOMER request
- Displays the correct draft
- Replies naturally

### CRITICAL

No second tap required.

No manual mic-off required for a normal completed sentence.

No repeated command execution.

Do not claim automatic endpointing works until it has been tested with actual recorded speech and browser microphones.

---

# 8. NATURAL TWO-WAY CONVERSATIONAL AI

VoiceOS must work like a genuinely useful business assistant.

Example:

Merchant:

"Rahul ka bill bana do."

Assistant speaks:

"Sure. What products did Rahul purchase?"

Merchant:

"10 kilo daal."

Assistant:

"What's the selling price per kilo?"

Ask this only when there is no suitable verified existing price.

Merchant:

"80 rupaye."

Assistant:

"Total is ₹800. How was the payment made?"

Merchant:

"500 cash, baaki udhaar."

Assistant prepares the bill and gives the appropriate same-language summary.

Merchant:

"Haan, save kar do."

The backend executes the validated transaction.

Only after actual success should VoiceOS announce completion.

### MUST SUPPORT

- Natural follow-up questions
- Multiple conversational turns
- Context memory within an active task
- Spoken corrections
- Interruptions
- Cancel
- Retry
- Typed-message fallback
- Clear final confirmation

Never restart the task unnecessarily after every follow-up.

---

# 9. INTENT AND ENTITY UNDERSTANDING

Do not depend only on exact keyword matching.

Use a robust hybrid interpretation engine with:

- Natural-language intent recognition
- Structured schemas
- Semantic entity roles
- Deterministic numerical parsing
- Actual customer/product matching
- Contextual clarification
- Confidence-based uncertainty handling

### CUSTOMER

"Rahul naam ka customer add karo."

Intent: CREATE_CUSTOMER

Customer Name: Rahul

### STOCK

"10 kilo daal stock mein add karo."

Intent: ADD_STOCK

Product: Daal

Quantity: 10 kg

### BILLING

"Rahul ko 10 kilo daal bechi."

Intent: CREATE_SALE

Customer: Rahul

Product: Daal

Quantity: 10 kg

### PAYMENT

"Rahul ke ₹500 purane udhaar cash mein jama kar do."

Intent: RECORD_CUSTOMER_PAYMENT

Customer: Rahul

Amount: ₹500

Method: Cash

### AMBIGUOUS COMMAND

"Rahul ke naam se 10 product add kar do."

Ask whether the merchant means ten different products or quantity ten of one item, and clarify whether it is a sale or stock operation when necessary.

### CRITICAL

Never create a product named "Rahul Daal" from a customer-and-product sentence.

Never invent products, prices, payment methods or customer records.

---

# 10. INTELLIGENT QUESTION ENGINE

VoiceOS should never ask irrelevant questions.

### Customer Creation

Ask only for required customer details.

Do not ask payment or product questions.

### Stock Addition

Ask for product, quantity, unit or required inventory details.

Do not demand customer payment details.

### Billing

Resolve actual products, quantities, verified prices, customer and payment.

### Reports

Return actual data without requiring write confirmation.

### General Questions

For ordinary non-business questions, provide a grounded answer when supported, without confusing the request with a customer or inventory action.

For example:

"Duniya mein kitne customers hain?"

Do not create a customer or fabricate a global count.

Clarify whether the merchant means their shop's customers if the context is ambiguous.

If an external factual answer is unavailable, explain the limitation.

### MAIN RULE

Ask the minimum number of questions necessary to perform the correct action safely.

---

# 11. REAL BACKEND ACTION EXECUTION

Connect VoiceOS to the actual application's backend services.

Support existing authorised workflows for:

- Customer creation
- Customer lookup
- Product creation
- Stock addition
- Stock checking
- Sales
- Billing
- Payment collection
- Udhaar
- Purchases
- Suppliers
- Expenses
- DemandPulse
- Reports
- Invoice PDFs
- Shop Closing
- Intelligence Suite

Use one central typed VoiceOS action registry.

Do not create duplicate financial logic inside the AI layer.

### REQUIRED PIPELINE

User Speech

→ Final Transcript

→ Language Detection

→ Intent Identification

→ Entity Extraction

→ Real Record Resolution

→ Required Clarifications

→ Editable Action Draft

→ Explicit Confirmation

→ Authorised Backend Transaction

→ Verified Result

→ Spoken Success

### CONFIRMATION RULE

Automatically detecting a complete sentence should automatically **process and prepare the command**, not silently commit a record-changing action.

Write operations require clear final confirmation.

Read-only answers and authorised navigation actions can execute directly.

---

# 12. ZERO FAKE SUCCESS

If a user says:

"Rahul customer add kar do."

VoiceOS must not simply respond:

"Rahul added successfully."

unless the backend has actually created the record.

### REQUIRED

- Confirmed backend response
- Actual record identifier
- Appropriate UI refresh
- Business-scope verification
- Duplicate-prevention handling
- Error reporting
- Retry safety

If an operation fails:

"Rahul ka customer save nahi ho saka. Details safe hain, dobara try kar sakte hain."

Use the correct language policy for that response.

Do not invent success states.

---

# 13. PRODUCTION-LEVEL SECURITY AND FINANCIAL SAFETY

Implement:

- Real authentication
- Server-side permissions
- Tenant/business isolation
- Correct active-shop context
- Strict request schemas
- Validation
- Atomic database transactions
- Idempotency keys
- Duplicate command protection
- Audit logging
- Stale draft revalidation
- Accurate inventory movements
- Correct customer ledgers
- Safe failure recovery

Use deterministic business services for financial calculations.

Never allow the LLM to generate unrestricted database queries.

Never commit an action from unstable interim speech recognition.

---

# 14. PREMIUM VOICEOS PAGE REDESIGN

The current VoiceOS interface appears too generic and unfinished.

Redesign it into a sophisticated, focused business-agent workspace.

Use the existing DukaanSet brand identity.

### BRAND COLOURS

Deep Teal: #103B36

Dark Forest: #062F29

Mint: #22C99D

Off-White: #F7FAF8

Charcoal: #1A2624

### PAGE HEADER

Show:

DukaanSet VoiceOS

Supporting line:

"Your intelligent business assistant"

Also show:

- Actual active shop
- Conversation status
- Choose Assistant Voice settings
- Close/minimise

### MAIN CONVERSATION AREA

Build a clean professional conversational interface with:

- Distinct merchant messages
- Assistant replies
- Appropriate spacing
- Clear timestamps where useful
- Subtle icons
- Intelligent structured cards
- Scrollable history
- Context-preserving corrections

### EMPTY STATE

Show a premium but minimal assistant welcome.

Examples:

"Create a customer"

"Add stock"

"Make a bill"

"Show today's sales"

These examples must trigger or suggest genuinely supported actions.

### MICROPHONE AREA

Design a modern microphone control.

Show accurate state:

- Tap to Speak
- Listening
- Understanding
- Speaking
- Waiting for Answer

Use subtle waveform animation.

No heavy fake AI graphics.

No oversized empty spaces.

No confusing multiple microphones.

---

# 15. PREMIUM BUSINESS ACTION PREVIEW

Replace generic labels such as "Review your action" with meaningful business-specific previews.

### CUSTOMER EXAMPLE

**New Customer**

Name: Rahul

Phone: Optional, unless required by the existing business rule

Primary Action: Confirm & Save Customer

### BILL EXAMPLE

**New Bill**

Customer: Rahul

Product: Daal

Quantity: 10 kg

Price: ₹80/kg

Total: ₹800

Payment: ₹500 Cash + ₹300 Udhaar

Primary Action: Confirm & Save Bill

### STOCK EXAMPLE

**Stock Addition**

Product: Daal

Quantity: +10 kg

Primary Action: Save Stock

### UX RULES

- All values must be editable.
- Show only relevant fields.
- Keep the primary action obvious.
- Put errors beside the affected information.
- Do not require opening another complicated form for a straightforward complete command.
- Allow cancellation without side effects.

---

# 16. MY RECOMMENDATION — PREMIUM DASHBOARD INTEGRATION

Improve the quality of the Dashboard presentation where required, but preserve its already approved design direction.

### PRESERVE

- White premium sidebar
- Deep teal scenic hero
- Actual shop greeting
- Date and weather cards
- Desktop top-right VoiceOS launcher
- Mobile white VoiceOS bar
- Quick actions
- Financial summary cards
- Sales Overview
- Top Products
- Recent Bills
- Low Stock Alerts

### ENHANCE

- Typography consistency
- Icon quality
- Card spacing
- Hero content alignment
- Clean loading states
- Responsive balance
- Product thumbnails
- Empty states
- Hover/focus interactions
- Subtle animations
- Financial information hierarchy

Do not redesign the approved layout without a genuine functional need.

Do not introduce additional fake cards or invented insights.

Real data must remain the source of truth.

---

# 17. MOBILE EXPERIENCE

VoiceOS is especially important for small Indian shopkeepers using Android phones.

Implement a polished mobile conversational experience.

### REQUIREMENTS

- Comfortable microphone target
- Full or near-full-screen voice conversation
- Clearly visible listening state
- Automatic utterance finalisation
- Smooth assistant spoken replies
- Easy correction
- Sticky confirmation action
- Correct keyboard handling
- Safe-area padding
- Proper scroll behaviour
- No overlapping controls
- Clean audio-session teardown

Test actual mobile browsers, not just desktop responsive emulation.

---

# 18. RELIABLE STT + TTS INTEGRATION

Audit the existing Speech-to-Text and Text-to-Speech providers.

Evaluate whether the current implementation genuinely supports:

- Hindi
- English
- Hinglish
- Indian accents
- Real auto-endpointing
- Natural spoken replies
- Multiple voice choices
- Voice previews
- Interruption
- Low latency

If the existing provider is insufficient, integrate a suitable production-capable provider behind a clean service abstraction.

Evaluate provider capabilities, cost, language coverage, latency and privacy.

Use actual credentials configured through secure environment variables.

Do not invent API responses or hide unavailable integrations behind a fake UI.

Do not expose secret keys in frontend code.

Use a functional fallback where appropriate.

---

# 19. CONVERSATION AND AUDIO FAILURE RECOVERY

Handle:

- Microphone permission denied
- Microphone unavailable
- Silence / no speech
- Recognition timeout
- Partial transcription
- Network disconnect
- Backend timeout
- TTS failure
- Assistant interrupted
- User closes dialog
- New command before old response finishes
- Duplicate final recognition events
- Active shop changes
- Expired authentication

### IMPORTANT

Keep valid drafts where safe.

Do not duplicate financial operations.

Do not allow a stale response to replace the current conversation.

Do not leave the microphone active in the background after closure.

---

# 20. ROOT CAUSE DEBUGGING AND LOGGING

Before implementing cosmetic fixes, instrument the actual command pipeline.

For every turn, capture safe diagnostic metadata such as:

- Conversation ID
- Turn ID
- Speech session ID
- Transcript finalisation event
- Language decision
- Intent classification
- Clarification state
- Action draft status
- Backend request status
- Completion status
- Error code
- Relevant timings

Avoid logging raw sensitive customer information or audio unnecessarily.

### DEBUG THIS SPECIFIC FAILURE

Input:

"Rahul ke naam se ek customer add kar do."

Trace:

Audio capture

→ STT final result

→ Turn complete

→ Command dispatch

→ CREATE_CUSTOMER intent

→ Rahul entity extraction

→ Customer matching

→ Draft creation

→ UI rendering

→ User confirmation

→ Backend mutation

→ Verified result

Identify precisely where the current flow fails.

Fix the root cause and add a regression test.

---

# 21. MANDATORY REAL END-TO-END TESTS

Do not validate VoiceOS using only mocked transcripts and fake success screens.

### TEST 1 — AUTO MICROPHONE STOP

Speak:

"Rahul naam ka customer add kar do."

Expected:

Microphone automatically finalises after the sentence.

No manual Stop required.

Exactly one command dispatched.

### TEST 2 — CUSTOMER CREATION

Expected:

Customer draft for Rahul.

Correct confirmation.

Actual backend save.

Customer visible in Customers.

### TEST 3 — LANGUAGE DEFAULT

Set topbar to English.

Open VoiceOS without speaking.

Expected:

English default greeting.

### TEST 4 — HINDI SPEECH

Speak clearly in Hindi.

Expected:

Natural Hindi response.

### TEST 5 — HINGLISH SPEECH

Speak:

"Rahul naam ka customer add kar do."

Expected:

Natural Hinglish response.

### TEST 6 — PREVIOUS RESPONSE ISOLATION

First request today's sales.

Then request creation of Rahul.

Expected:

The second command produces customer-creation UI, not the old sales summary.

### TEST 7 — TWO-WAY CONVERSATION

Request a bill with incomplete details.

Answer follow-up questions by voice.

Expected:

One consistent task draft.

### TEST 8 — SPOKEN CONFIRMATION

Speak:

"Haan, save kar do."

Expected:

Only the currently visible validated draft is committed.

### TEST 9 — DUPLICATE RECOGNITION

Simulate duplicate final speech events.

Expected:

One dispatch and one eventual mutation.

### TEST 10 — MOBILE

Verify the same experience on actual supported mobile browsers.

### TEST 11 — MULTI-SHOP SAFETY

Switch businesses.

Expected:

No stale customer/product context leaks between shops.

### TEST 12 — PROVIDER FAILURE

Simulate STT, TTS and backend failures.

Expected:

Honest error handling and safe recovery.

---

# 22. MY RECOMMENDATION — RELEASE GATES

Treat VoiceOS as a business-critical feature.

### GATE A — CORE RELIABILITY

Customer, stock, sales and payment intent tests pass.

Automatic microphone endpointing works.

No old-response replay.

### GATE B — REAL TRANSACTIONS

Confirmed actions update correct database records.

No accidental duplicates.

Correct permissions and business isolation.

### GATE C — CONVERSATION

Missing details are requested naturally.

Conversation context persists.

Corrections work.

### GATE D — AUDIO QUALITY

Actual speech and spoken replies tested in English, Hindi and Hinglish.

### GATE E — PREMIUM UX

Desktop and mobile interfaces are accessible, responsive and visually consistent.

### GATE F — PRODUCTION READINESS

Tests, monitoring, secrets management, feature flags and rollback readiness verified.

Do not ship known P0 failures.

Do not claim perfect recognition or universal command coverage without measured results.

---

# 23. IMPLEMENTATION ORDER

## PHASE 1 — REPRODUCE CURRENT BUGS

Run the existing app.

Reproduce and document the customer-command, auto-stop, stale-response and language bugs.

Inspect frontend and backend logs.

## PHASE 2 — FIX THE CORE SPEECH ENGINE

Repair microphone lifecycle, final transcript handling, silence detection and command dispatch.

## PHASE 3 — FIX CONVERSATION STATE

Eliminate stale replies, race conditions, duplicate command processing and missing draft transitions.

## PHASE 4 — FIX INTENT AND ENTITY UNDERSTANDING

Implement reliable customer/product/stock/billing interpretation with real data resolution.

## PHASE 5 — FIX LANGUAGE AND TWO-WAY VOICE

Implement topbar-language defaults, automatic spoken-language matching, real TTS and voice selection.

## PHASE 6 — CONNECT REAL BACKEND ACTIONS

Validate the complete customer, stock, billing, payment and other supported business workflows.

## PHASE 7 — PREMIUM UI/UX

Improve the VoiceOS interface and refine the existing Dashboard without breaking approved visual structures.

## PHASE 8 — END-TO-END VERIFICATION

Run real microphone, provider, backend, permission and responsive tests.

## PHASE 9 — STAGING RELEASE

Follow the repository's existing feature branch → dev → review → main workflow.

Do not deploy unverified financial automation directly to production.

---

# 24. FINAL DELIVERABLES

Deliver:

1. Fixed automatic microphone stop.
2. Correct final transcript dispatch.
3. Fixed command routing.
4. Reliable CREATE_CUSTOMER flow.
5. Fixed stale-response handling.
6. Consistent conversation state machine.
7. Correct global language defaults.
8. Automatic same-language spoken replies.
9. Genuine assistant voice selection.
10. Real voice previews and persisted preference.
11. Working Quick Mode.
12. Working Talk Mode.
13. Natural clarification questions.
14. Correct customer/product separation.
15. Multi-turn conversational memory.
16. Editable action drafts.
17. Spoken and on-screen confirmation.
18. Real authorised backend execution.
19. Actual success verification.
20. Duplicate prevention.
21. Secure multi-tenant support.
22. Premium VoiceOS desktop UI.
23. Premium VoiceOS mobile UI.
24. Safe Dashboard visual refinements.
25. Audio/provider failure recovery.
26. Multilingual integration tests.
27. Actual microphone-to-database tests.
28. Root cause report.
29. Changed-file summary.
30. Remaining limitations and configuration requirements.

---

# 25. ABSOLUTE RULES

DO NOT SIMPLY CHANGE MICROPHONE BUTTON TEXT.

DO NOT REQUIRE MANUAL MICROPHONE STOP AFTER A NORMAL FINISHED SENTENCE.

DO NOT DISPATCH THE SAME SPEECH TURN TWICE.

DO NOT REPLAY OLD BUSINESS RESPONSES FOR NEW COMMANDS.

DO NOT HARDCODE CUSTOMER SUCCESS MESSAGES.

DO NOT TURN CUSTOMER CREATION INTO PRODUCT CREATION.

DO NOT ASK PAYMENT QUESTIONS WHILE CREATING A BASIC CUSTOMER.

DO NOT CREATE A SECOND LANGUAGE SELECTOR.

DO NOT IGNORE THE GLOBAL TOPBAR LANGUAGE.

DO NOT FORCE ONE LANGUAGE FOR EVERY RESPONSE.

DO NOT INVENT PROVIDER CAPABILITIES.

DO NOT COMMIT BUSINESS WRITES WITHOUT CONFIRMATION.

DO NOT CLAIM SUCCESS BEFORE DATABASE VERIFICATION.

DO NOT BUILD A FRONTEND-ONLY AI DEMO.

DO NOT BREAK APPROVED DASHBOARD AND SIDEBAR DESIGNS.

DO NOT CALL THE FEATURE FINISHED WHILE THE ORIGINAL REPRODUCTION CASE STILL FAILS.

---

# 26. FINAL DEFINITION OF DONE

The implementation is not complete until the following exact experience works:

### SCENARIO A — CUSTOMER

Merchant opens VoiceOS.

The current topbar language is English.

VoiceOS opens with an English default greeting.

Merchant says:

"Rahul naam ka customer add kar do."

The microphone automatically detects sentence completion and stops that listening turn.

The system recognises CREATE_CUSTOMER and Rahul.

VoiceOS replies naturally in Hinglish:

"Bilkul! Rahul ka naya customer ready hai. Save kar doon?"

A premium editable customer draft appears.

Merchant says:

"Haan, save kar do."

The application creates the customer through its real backend.

The Customers page reflects the saved record.

VoiceOS responds with an actual verified success message.

### SCENARIO B — BILLING

Merchant says:

"Rahul ka bill bana do."

VoiceOS asks for products.

Merchant replies:

"10 kilo daal, 80 rupaye kilo."

VoiceOS calculates and validates ₹800.

VoiceOS asks how payment was made only if that is required and not already known.

Merchant replies:

"500 UPI, 300 udhaar."

VoiceOS shows the complete invoice draft.

Merchant confirms.

The backend creates the invoice, updates inventory and records payment/receivable data correctly.

VoiceOS announces success only after verification.

### SCENARIO C — NO STALE RESPONSE

Merchant requests:

"Aaj ki sale batao."

VoiceOS provides the actual report.

Merchant then says:

"Rahul naam ka customer add karo."

VoiceOS must process CREATE_CUSTOMER.

The previous sales-summary result must not replace the new action.

---

# 27. FINAL EXECUTION DIRECTIVE TO CODEX

You are responsible for actually IMPLEMENTING and VERIFYING this complete VoiceOS correction within the existing DukaanSet repository.

Start by auditing the current system and reproducing the documented bugs.

Prioritise root cause fixes over cosmetic enhancements.

Make the microphone automatically detect finished speech.

Make final transcripts consistently trigger the right workflow.

Implement predictable conversation state and prevent stale responses.

Respect the global application language as the default while matching clearly detected user speech.

Provide real two-way spoken responses and a single assistant voice-selection setting.

Connect actual customer, stock, billing, payment and other supported actions to secure existing backend services.

Improve the VoiceOS interface to premium commercial quality.

Maintain the previously approved DukaanSet Dashboard and brand design.

Run real tests and disclose any unverified third-party speech services, missing credentials or infrastructure blockers.

Do not stop at writing a plan.

Do not claim implementation success without code changes and passing verification.

## CORE PRODUCT STANDARD

**A MERCHANT SHOULD SPEAK NATURALLY, STOP SPEAKING, AND DUKAANSET SHOULD TAKE OVER THE NEXT STEP WITHOUT REQUIRING MANUAL MICROPHONE MANAGEMENT.**

**AI MUST UNDERSTAND, CLARIFY, SPEAK, PREPARE, CONFIRM AND EXECUTE RELIABLY.**

# DUKAANSET VOICEOS 3.1

### AAP BOLO, DUKAANSET SAMJHE — AUR KAAM SAMBHALE.

**BEGIN ACTUAL PRODUCTION-ORIENTED IMPLEMENTATION NOW.**
