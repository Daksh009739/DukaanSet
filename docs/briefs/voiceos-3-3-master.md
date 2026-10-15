# DUKAANSET VOICEOS 3.3 — FINAL ULTIMATE PRODUCTION MASTER PROMPT

## BUILD THE MOST RELIABLE, NATURAL, HANDS-FREE AI BUSINESS ASSISTANT POSSIBLE WITHIN THE EXISTING DUKAANSET APPLICATION

**Project:** DukaanSet — Apni Dukaan, Sab Set.

**Core Feature:** Global VoiceOS

**Priority:** P0 — Business Critical

**Implementation Target:** Existing DukaanSet repository

**Goal:** Fix the current broken VoiceOS and transform it into a genuinely working, premium, naturally conversational AI business agent.

---

# 1. YOUR MISSION — READ THIS FIRST

Act as a Principal AI Engineer, Speech Systems Engineer, Senior Full-Stack Architect, Conversational UX Specialist, Security Engineer and QA Automation Lead.

VoiceOS is DukaanSet's MAIN PRODUCT DIFFERENTIATOR.

This feature will be central to our startup, customer experience, product demonstrations and future marketing.

Treat its reliability as seriously as authentication, billing, inventory and financial records.

**DO NOT create another demo, mockup, placeholder assistant or frontend-only simulation.**

Your task is to:

- Audit the CURRENT VoiceOS implementation.
- Find and fix actual root causes.
- Implement fully automatic conversation turn-taking.
- Fix microphone lifecycle and auto-submission.
- Fix incorrect command routing.
- Fix duplicate-customer conversations.
- Improve automatic language responses.
- Implement genuine two-way spoken interaction.
- Integrate existing business backend operations.
- Simplify the UI drastically.
- Make the result feel like a premium commercial product.
- Verify the complete microphone-to-database-to-spoken-response workflow.

Work inside the EXISTING repository.

Do not stop at writing a plan.

---

# 2. EXACT FINAL USER EXPERIENCE

This is the required default experience.

## STEP 1 — USER OPENS VOICEOS

The merchant clicks the existing DukaanSet VoiceOS launcher once.

VoiceOS opens in a beautiful, simple conversation panel.

## STEP 2 — ASSISTANT GREETS AUTOMATICALLY

The assistant automatically speaks a short greeting in the application's currently selected topbar language.

Example:

"Hello! How can I help with your shop today?"

Use the merchant's selected assistant voice.

Do not require another button to play the greeting when browser policies permit playback following the opening interaction.

## STEP 3 — MICROPHONE AUTOMATICALLY ACTIVATES

As soon as the greeting ends, the microphone starts listening.

No manual mic click.

If browser permission is required, request it during the user-initiated opening flow.

After permission is granted, continue automatically wherever technically supported.

## STEP 4 — MERCHANT SPEAKS

"Rahul ke naam se ek customer add kar do."

## STEP 5 — VOICEOS DETECTS SENTENCE COMPLETION

Automatically detect the end of the user's utterance using reliable speech endpointing.

Finalise the transcript.

Stop listening for that turn.

Automatically send the completed sentence into the conversation engine.

**Do not require the user to press Stop or Send.**

## STEP 6 — AGENT UNDERSTANDS THE ACTION

Identify:

Intent: CREATE_CUSTOMER

Customer Name: Rahul

Active Business: Current authenticated shop

Check real existing customer records.

## STEP 7 — ASSISTANT SPEAKS

If Rahul does not exist:

"Bilkul! Rahul ka naya customer ready hai. Save kar doon?"

Show the correct customer draft.

If Rahul already exists:

"Rahul naam ka customer pehle se hai. Usi ko kholna hai ya same naam se naya customer banana hai?"

## STEP 8 — MIC AUTOMATICALLY STARTS AGAIN

After the assistant finishes speaking, VoiceOS automatically starts listening for the next answer.

No microphone click.

## STEP 9 — USER ANSWERS NATURALLY

"Koi nahi, same naam se naya customer bana do."

VoiceOS understands the active duplicate-customer question.

It prepares a SEPARATE customer draft.

It does not show the previous sales report.

It does not repeat the duplicate warning endlessly.

## STEP 10 — FINAL CONFIRMATION

Assistant:

"Rahul ka alag customer record ready hai. Save kar doon?"

Mic automatically resumes.

User:

"Haan, save kar do."

## STEP 11 — REAL BACKEND EXECUTION

Validate the current business, permissions and customer constraints.

Create the actual authorised customer record.

Prevent duplicate requests from being submitted twice.

## STEP 12 — VERIFIED SPOKEN SUCCESS

Only after backend success:

"Rahul ka naya customer successfully add ho gaya."

Show the real saved customer details.

The merchant can naturally continue with another task while the VoiceOS session remains open.

### ABSOLUTE CORE REQUIREMENT

**OPEN ONCE → GREET → AUTO LISTEN → USER SPEAKS → AUTO END TURN → AUTO PROCESS → ASSISTANT SPEAKS → AUTO LISTEN AGAIN.**

No repeated manual microphone activation during a normal conversation.

---

# 3. FIX THE EXISTING VIDEO-OBSERVED FAILURES

The existing VoiceOS has exhibited these problems:

### FAILURE A — MANUAL MIC DEPENDENCY

User must repeatedly click the microphone to start speaking or answer a follow-up question.

**FIX:** Automatic microphone activation after greeting and after assistant follow-ups.

### FAILURE B — INCOMPLETE AUTO-ENDPOINTING

VoiceOS sometimes stays in Listening even after a sentence is complete.

**FIX:** Reliable end-of-utterance detection, final transcript creation and exactly-once dispatch.

### FAILURE C — DUPLICATE CUSTOMER NOT RESOLVED

User asks to create Rahul, existing Rahul is found, then user says:

"Koi nahi, phir se add kar do."

Assistant fails to complete the intended separate-customer workflow.

**FIX:** Conversation-aware duplicate resolution.

### FAILURE D — WRONG INTENT ROUTING

A customer-creation command has incorrectly produced a "Business answer · Today" sales summary.

**FIX:** Correct intent routing, contextual clarification priority, request sequencing and stale-response prevention.

### FAILURE E — OVERCOMPLICATED UI

VoiceOS contains too many controls, states, panels and generic labels.

**FIX:** Replace the cluttered experience with one simple, premium conversational workspace.

### FAILURE F — INCONSISTENT LANGUAGE BEHAVIOUR

Assistant responses do not reliably follow the agreed global-language default and detected user-speech policy.

**FIX:** Implement one consistent language precedence system.

### FAILURE G — FRONTEND/BACKEND DISCONNECTION

Some commands are recognised without producing the expected business draft or actual saved result.

**FIX:** Trace the complete command pipeline and connect it to real authorised backend services.

Do not simply hide these failures with new animations.

---

# 4. MY RECOMMENDATION — ONE DEFAULT HANDS-FREE EXPERIENCE

Remove the requirement for merchants to choose between Quick Mode and Talk Mode before speaking.

The default VoiceOS experience should be naturally conversational.

Internally optimise quick commands and multi-turn conversations, but do not expose unnecessary technical modes.

### ONLY ESSENTIAL CONTROLS

- Open VoiceOS
- Pause/Resume
- Close
- Choose Assistant Voice
- Optional text input
- Confirm & Save when needed

Keep a visible microphone status indicator.

The merchant should not need to understand how speech recognition, intent routing or AI processing works.

### PAUSE BEHAVIOUR

When the merchant presses Pause, stop listening and prevent automatic microphone restart.

Resume only when the merchant explicitly chooses to resume.

Closing VoiceOS must release microphone and audio resources immediately.

Never capture audio after the session is closed.

---

# 5. PRODUCTION-GRADE AUDIO STATE MACHINE

Audit and replace fragile microphone logic where necessary.

Implement a reliable conversational audio controller with explicit states such as:

IDLE
OPENING
REQUESTING_PERMISSION
GREETING
LISTENING
FINALISING
UNDERSTANDING
CLARIFYING
SPEAKING
DRAFT_READY
AWAITING_CONFIRMATION
EXECUTING
SUCCESS
PAUSED
ERROR
CLOSED

### MANDATORY

- Only one active microphone capture.
- One unique session ID per VoiceOS session.
- One unique turn ID per spoken utterance.
- Exactly one dispatch for each final user turn.
- No processing interim transcripts as completed commands.
- No old callbacks updating new conversations.
- No duplicate TTS playback.
- No microphone activation during backend execution unless explicitly required by a safe interaction.
- No assistant speech being transcribed as user speech.
- Automatic mic restart after completed spoken replies when awaiting a follow-up or new task.
- Correct cleanup when VoiceOS closes.
- Safe handling of React rerenders and component unmounting.
- Correct cancellation and abort handling.

Use a proper reducer or state-machine architecture.

Separate microphone state, playback state, conversation state, action draft and backend execution state.

Do not manage the entire assistant through loosely coordinated booleans.

---

# 6. INTELLIGENT VOICE ACTIVITY DETECTION

Implement real automatic speech endpointing.

Use the configured STT provider's reliable utterance-completion events, appropriate VAD or a tested combination.

### REQUIRED

- Speech-start detection
- Background-noise tolerance
- Natural short-pause handling
- End-of-sentence/end-of-turn detection
- Final transcript confirmation
- Auto-stop of the current listening turn
- Auto-submit to the conversation engine
- No-speech timeout
- Recovery from recognition errors

### IMPORTANT

Do not stop listening after a fixed number of seconds from microphone activation.

A merchant may speak a long sentence or multiple product names.

Use adaptive/configurable endpointing thresholds.

Test short utterances like:

"Haan."

"Nahi."

"Cash."

"500 rupaye."

and longer billing commands.

Do not cut off valid speech.

Do not wait indefinitely after a clearly completed utterance.

---

# 7. CONVERSATION STATE AND MEMORY

The assistant must remember the CURRENT active task.

Store structured state including:

- Active business
- Current conversation ID
- Current task and intent
- Last assistant question
- Customer/product references
- Quantity and units
- Price and payment details
- Pending clarification
- Duplicate resolution
- Current editable draft
- Confirmation status
- Execution status

### EXAMPLE

Assistant:

"Rahul pehle se hai. Naya banana hai?"

User:

"Haan, naya bana do."

The agent must understand that "naya bana do" refers to creating a separate Rahul customer.

Do not restart generic intent classification without considering the outstanding question.

### CORRECTIONS

Support:

"Rahul nahi Rohan."

"10 kilo nahi 12 kilo."

"Cash nahi UPI."

"Last product hata do."

"Cancel kar do."

Update the active draft rather than creating unrelated actions.

### CONTEXT SAFETY

Do not let previous sales-report results overwrite customer-creation actions.

Do not carry customer, product or financial context between shops without explicit revalidation.

---

# 8. CORRECT DUPLICATE CUSTOMER HANDLING

A duplicate customer name is not automatically an error.

If Rahul already exists:

Show a short conversational clarification:

"Rahul naam ka customer pehle se hai. Usi ko kholna hai ya alag customer banana hai?"

Accept natural answers:

"Usi ko kholo."

"Naya bana do."

"Same naam se alag bana do."

"Koi nahi, phir se add kar do."

"Nahi, dusra Rahul hai."

### SEPARATE CUSTOMER ACTION

When explicitly requested:

- Keep existing Rahul unchanged.
- Prepare a distinct Rahul customer draft.
- Apply real unique-field validation.
- Require final confirmation.
- Create a new customer only if backend rules permit.
- Preserve separate customer identifiers.
- Never silently merge records.
- Prevent duplicate execution caused by repeated final transcripts.

If the same verified phone number or another unique identifier conflicts, explain the relevant restriction.

Do not repeat the duplicate-name warning after the explicit decision has already been captured.

---

# 9. AUTOMATIC LANGUAGE POLICY — FINAL

**NO separate Assistant Reply Language selector.**

### DEFAULT

Use the global topbar application language for:

- Initial greeting
- Default instructions
- Fallback responses
- Ambiguous-language cases

### AFTER USER SPEAKS

Clear English → English spoken response.

Clear Hindi → Hindi spoken response.

Clear Hinglish → Hinglish spoken response.

Mixed Hindi-English → Natural mixed-language response.

### SHORT RESPONSES

For "haan", "yes", "okay", "500 cash", etc., keep the conversation's established language when appropriate.

Fall back to the global topbar language if no reliable conversational language is established.

### USER SWITCHES LANGUAGE

Adapt when the change is clear.

Do not continually flip language because of unreliable short-utterance detection.

Keep the existing application display-language preference unchanged.

---

# 10. ASSISTANT VOICE PERSONALISATION

Give the user ONE main voice-personalisation setting:

**Choose Assistant Voice**

Place it in:

VoiceOS Header → Voice Settings

and

Main Settings → VoiceOS → Choose Assistant Voice

### FEATURES

- Multiple genuine available voices
- Female-sounding and male-sounding styles where supported
- Real audio previews
- Clear selected state
- Persistent authenticated-user preference
- Multilingual support verified against provider capabilities

Do not invent unavailable voices.

Do not add a separate Reply Language dropdown.

Do not change the selected voice unnecessarily between conversation turns.

Use an appropriate fallback if a voice-language combination is unsupported.

---

# 11. NATURAL TWO-WAY SPOKEN RESPONSES

VoiceOS must speak naturally, not only display text.

### GOOD RESPONSE

"Rahul ka customer ready hai. Save kar doon?"

### BAD RESPONSE

"Intent recognised: CREATE_CUSTOMER. Entity resolution completed. Please select execution."

### REQUIRED

- Short, friendly responses
- Natural Indian-language pronunciation
- Correct customer/product names
- Accurate spoken currency and quantities
- Low response latency
- Clear voice activity indicator
- Stop speaking when the session is paused or closed
- No repeated greetings
- No reading entire forms aloud

Use genuine configured TTS, not fake audio indicators.

If TTS fails, preserve the text response and offer appropriate recovery.

---

# 12. COMPLETE BUSINESS UNDERSTANDING

Support natural speech across existing authorised DukaanSet modules.

### CUSTOMER

"Rahul naam ka customer add karo."

### STOCK

"10 kilo daal stock mein add karo."

### BILLING

"Rahul ko 10 kilo daal bechi."

### PAYMENT

"Rahul ke 500 rupaye cash jama karo."

### PRODUCT

"Maggi Masala ka naya product add karo."

### REPORT

"Aaj kitni sales hui?"

### INVENTORY QUERY

"Kaunse products ka stock kam hai?"

### DUPLICATE

"Koi nahi, same naam se naya customer bana do."

### GENERAL QUESTION

"Duniya mein kitne customers hain?"

Do not confuse a general question with a customer-creation command.

Answer supported factual questions appropriately; never invent information or a global customer count.

Use one typed intent/action registry rather than disconnected keyword handlers.

---

# 13. COMPLETE BUSINESS BACKEND INTEGRATION

Integrate VoiceOS with supported existing services for:

- Customers
- Products
- Stock
- Sales and Billing
- Payments and Udhaar
- Purchases and Suppliers
- Expenses
- DemandPulse
- Reports
- Invoice PDFs
- Customer Statements
- Shop Closing
- Intelligence Suite

Use real business data.

Resolve actual records.

Ask only missing required details.

Show editable drafts.

Require final confirmation for mutations.

Execute through authorised existing backend services.

### NEVER

- Invent prices.
- Confuse a customer with a product.
- Confuse stock addition with a sale.
- Create financial records from unconfirmed interim speech.
- Claim a record is saved before backend success.
- Execute arbitrary AI-generated SQL or unrestricted actions.

For new stock products, support preparation of product creation and inventory addition in one confirmed operation where valid.

Preserve existing business rules, variants, units and financial calculations.

---

# 14. MY RECOMMENDATION — SIMPLIFY THE UI COMPLETELY

The current VoiceOS page feels unnecessarily complicated.

Implement a premium but minimal assistant interface.

### HEADER

DukaanSet VoiceOS

Active Shop Name

Choose Assistant Voice

Close

### MAIN AREA

One clean conversation stream.

Current question prominently visible.

Previous messages compact.

Meaningful drafts embedded naturally in the conversation.

No duplicate unrelated answer cards.

### BOTTOM

One microphone/status area.

Optional type-message fallback.

Pause control.

One primary confirmation button when needed.

### DEFAULT OPEN STATE

Show the assistant greeting and immediately enter the hands-free conversation cycle.

Do not fill the page with many example cards or instructional panels.

### COLORS

Deep Teal: #103B36

Forest: #062F29

Mint: #22C99D

Off-White: #F7FAF8

Charcoal: #1A2624

### VISUAL STANDARD

Premium typography.

Clean spacing.

Soft shadows.

Refined microphone animation.

Smooth but restrained transitions.

Responsive layout.

No oversized empty spaces.

No complicated technical configuration.

No excessive scrolling.

Keep important listening and confirmation controls visible.

---

# 15. PRESERVE THE APPROVED DUKAANSET DASHBOARD

Do not redesign unrelated application screens.

Maintain:

- White premium sidebar
- Deep teal scenic hero
- Greeting and business identity
- Date/weather elements
- Desktop VoiceOS launcher at hero top-right
- Mobile VoiceOS white hero pill
- Quick actions
- Financial summary cards
- Sales chart
- Top Products
- Recent Bills
- Low Stock

You may refine VoiceOS-related entry points, loading states and visual consistency without changing the approved Dashboard layout.

Do not introduce a duplicate VoiceOS banner.

---

# 16. VOICE CONFIRMATION AND SECURITY

A completed sentence should automatically trigger interpretation, NOT automatically commit a business mutation.

For record-changing actions:

**Understand → Draft → Ask for Confirmation → User Says Yes → Validate → Execute → Verify.**

Allow spoken confirmation such as:

"Haan, save kar do."

"Yes, confirm."

"Bilkul, bana do."

### SAFETY REQUIREMENTS

- Confirm the exact pending draft.
- Reject ambiguous confirmation.
- Revalidate before committing.
- Use backend permissions.
- Enforce active-business isolation.
- Use idempotency keys.
- Use database transactions where appropriate.
- Maintain audit logs.
- Check actual execution status before retrying an uncertain request.
- Never overwrite or merge an existing record without explicit authorised action.

Read-only questions can return results directly.

After a successful mutation, VoiceOS may resume listening for a new task while the user-initiated session remains open.

---

# 17. MY RECOMMENDATION — REAL ENGINEERING QUALITY

Use a hybrid conversational AI architecture.

### SPEECH LAYER

Reliable STT, VAD, endpointing and TTS.

### REASONING LAYER

Intent understanding, entity extraction, conversation context and clarification.

### BUSINESS LAYER

Typed authorised tools backed by existing domain services.

### SAFETY LAYER

Permissions, validation, idempotency and audit trails.

### EXPERIENCE LAYER

Minimal premium UI, auto-listening, natural replies, clear drafts and confirmation.

Use modern, tested technology suited to the existing stack.

If the current speech provider cannot reliably support the requirements, integrate a suitable real provider behind a clean abstraction.

Evaluate latency, language quality, usage cost, privacy, provider limits and browser compatibility.

Never embed provider secrets in frontend code.

Do not fabricate API results.

---

# 18. MUST-PASS END-TO-END TESTS

## TEST A — AUTOMATIC GREETING

Open VoiceOS once.

Expected:

Assistant speaks automatically when browser policies permit.

## TEST B — AUTOMATIC MIC START

After greeting:

Mic starts without a second click.

## TEST C — AUTOMATIC MIC STOP

Speak:

"Rahul naam ka customer add karo."

Expected:

Sentence completion detected.

Listening turn closes automatically.

## TEST D — AUTO COMMAND DISPATCH

The final transcript is processed once.

CREATE_CUSTOMER draft appears.

## TEST E — DUPLICATE CUSTOMER

Existing Rahul is found.

Assistant asks whether to use existing or create separate.

## TEST F — AUTOMATIC FOLLOW-UP

After assistant asks the question:

Mic automatically starts again.

## TEST G — NATURAL DUPLICATE OVERRIDE

Merchant says:

"Koi nahi, same naam se naya bana do."

Expected:

A distinct customer draft appears.

No incorrect sales summary.

## TEST H — SPOKEN SAVE

Merchant says:

"Haan, save kar do."

Expected:

Exactly one backend customer record created where permitted.

## TEST I — VERIFIED SUCCESS

Assistant announces success only after backend confirmation.

## TEST J — LANGUAGE DEFAULT

Topbar English.

Initial assistant greeting English.

## TEST K — LANGUAGE ADAPTATION

Clear Hindi speech → Hindi reply.

Clear English speech → English reply.

Hinglish speech → Hinglish reply.

## TEST L — NO STALE RESPONSE

Request today's sales.

Then request Rahul customer creation.

Expected:

Second command routes to Customer Creation, never replays the sales report as the current action.

## TEST M — REAL BILLING

Speak a multi-turn Rahul billing command.

Expected:

Correct product, quantity, payment, invoice, inventory and ledger after confirmation.

## TEST N — INTERRUPT/CANCEL

Pause, cancel or close during listening/speaking.

Expected:

Audio stops correctly.

No accidental command execution.

## TEST O — REAL MOBILE

Test microphone, automatic listening and assistant speech on real supported Android/mobile browsers.

## TEST P — RELIABILITY

Test duplicate STT events, network failure, background noise, stale asynchronous responses, microphone permission denial and shop switching.

Do not treat text-only simulations as proof that real audio works.

---

# 19. MY RECOMMENDATION — MEASURABLE RELEASE QUALITY

Define objective acceptance criteria rather than vague claims such as "AI is fully working".

Measure:

- Automatic endpointing success
- Intent-routing accuracy
- Entity extraction accuracy
- Duplicate-follow-up completion
- Spoken turn latency
- Successful confirmed backend actions
- Duplicate transaction prevention
- Language response consistency
- User correction success
- Mobile microphone compatibility

Create automated regression tests and a multilingual spoken-command evaluation set.

Record failures with privacy-safe diagnostic events.

Gate production rollout on demonstrated results.

Do not claim 100% accuracy without evidence.

---

# 20. STRICT IMPLEMENTATION PRIORITY

### PHASE 1 — REPRODUCE AND DEBUG

Inspect existing code.

Trace microphone events, transcripts, conversation state, intent routing and backend calls.

Identify actual root causes.

### PHASE 2 — FIX HANDS-FREE AUDIO LOOP

Implement:

Auto greeting.

Auto mic start.

Real endpointing.

Auto mic stop per turn.

Auto command dispatch.

Auto mic restart after assistant reply.

### PHASE 3 — FIX CONTEXT AND ROUTING

Repair:

Duplicate-customer handling.

Active clarification state.

Stale messages.

Wrong sales-report routing.

Race conditions.

### PHASE 4 — REAL ACTION EXECUTION

Connect and verify customer, stock, billing and payment workflows.

### PHASE 5 — LANGUAGE AND NATURAL VOICE

Implement automatic language precedence and selected assistant voice.

### PHASE 6 — PREMIUM SIMPLE UI

Remove clutter and unnecessary controls.

Build a clean responsive conversation workspace.

### PHASE 7 — SECURITY AND RELIABILITY

Validate permissions, tenant isolation, transactions, idempotency, error recovery and cancellation.

### PHASE 8 — REAL TESTING

Run microphone-to-backend-to-spoken-response tests.

Test supported desktop and mobile browsers.

### PHASE 9 — RELEASE PREPARATION

Use the existing feature branch → dev → review → main workflow.

Do not deploy known critical bugs.

---

# 21. FINAL NON-NEGOTIABLE RULES

DO NOT REQUIRE MANUAL MIC ACTIVATION AFTER EVERY RESPONSE.

DO NOT REQUIRE MANUAL MIC STOP AFTER EVERY FINISHED SENTENCE.

DO NOT AUTOMATICALLY COMMIT RECORD CHANGES WITHOUT CONFIRMATION.

DO NOT REPEAT THE SAME DUPLICATE WARNING AFTER THE USER CHOOSES CREATE SEPARATE.

DO NOT ROUTE CUSTOMER CREATION INTO SALES REPORTING.

DO NOT REPLAY OLD RESPONSES AS NEW RESULTS.

DO NOT CREATE A SEPARATE REPLY LANGUAGE SELECTOR.

DO NOT INVENT ASSISTANT VOICES.

DO NOT EXPOSE TECHNICAL COMPLEXITY TO SHOPKEEPERS.

DO NOT BREAK EXISTING BUSINESS SERVICES.

DO NOT CLAIM BACKEND SUCCESS BEFORE ACTUAL VERIFICATION.

DO NOT LEAVE THE MICROPHONE OPEN AFTER THE SESSION IS CLOSED.

DO NOT BUILD A DUMMY SPEECH ASSISTANT.

DO NOT STOP AT DESIGN MOCKUPS OR A PLAN.

DO NOT MARK THE FEATURE COMPLETE WITHOUT REAL END-TO-END TESTING.

---

# 22. FINAL DEFINITION OF DONE

DukaanSet VoiceOS is complete only when:

1. Merchant opens VoiceOS once.
2. Assistant automatically greets.
3. Mic automatically activates.
4. Merchant speaks naturally.
5. Mic automatically detects completed speech.
6. Transcript automatically submits.
7. Correct intent and entity are extracted.
8. Assistant responds appropriately.
9. Follow-up listening starts automatically.
10. Contextual answers and corrections work.
11. Duplicate customer creation works when explicitly authorised.
12. Correct editable action draft appears.
13. Spoken confirmation works.
14. Real backend mutation succeeds exactly once.
15. All relevant UI data refreshes.
16. Assistant speaks verified success.
17. Language defaults to the global selector and adapts to clear spoken language.
18. Selected assistant voice persists.
19. Interface remains extremely simple and premium.
20. Real desktop and mobile microphone workflows pass.

---

# 23. FINAL DIRECTIVE TO CODEX

**BEGIN ACTUAL IMPLEMENTATION IN THE EXISTING DUKAANSET REPOSITORY.**

First reproduce the known failures.

Then fix the root causes of microphone lifecycle, command dispatch, context management, duplicate customer resolution and backend integration.

Implement a reliable hands-free conversational loop.

The merchant must be able to finish a complete business workflow through natural spoken conversation without repeatedly touching the microphone.

Keep the UI simple enough for a nontechnical Indian shopkeeper.

Preserve the approved DukaanSet brand, Dashboard and existing business workflows.

Use real AI and speech integrations only where their capabilities are genuinely supported.

Run actual end-to-end tests.

Report code changes, observed root causes, passed/failed tests and remaining infrastructure requirements accurately.

## MOST IMPORTANT ACCEPTANCE SCENARIO

**User opens VoiceOS.**

Assistant greets.

**Mic automatically ON.**

User:

"Rahul naam ka customer add kar do."

**Mic automatically ends the turn and command auto-submits.**

Assistant:

"Rahul pehle se hai. Usi ko kholna hai ya naya banana hai?"

**Mic automatically ON.**

User:

"Koi nahi, same naam se naya bana do."

**Mic automatically ends the turn.**

Assistant:

"Rahul ka alag customer ready hai. Save kar doon?"

**Mic automatically ON.**

User:

"Haan, save kar do."

**Backend saves exactly one authorised customer record.**

Assistant:

"Rahul ka naya customer successfully add ho gaya."

### THIS FLOW MUST WORK FROM START TO FINISH WITHOUT REPEATED MANUAL MICROPHONE CLICKS.

## FINAL PRODUCT PROMISE

# DUKAANSET VOICEOS
### AAP BOLO. DUKAANSET SUNE, SAMJHE, JAWAAB DE AUR KAAM KARE.

**IMPLEMENT. TEST. VERIFY. DO NOT SHIP A DUMMY EXPERIENCE.**
