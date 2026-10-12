# DUKAANSET VOICEOS 3.0
# FINAL ULTIMATE CODEX MASTER IMPLEMENTATION PROMPT

## PROJECT: DUKAANSET — APNI DUKAAN, SAB SET.

### MISSION: BUILD A PRODUCTION-GRADE, NATURAL, TWO-WAY, MULTILINGUAL, VOICE-FIRST AI BUSINESS AGENT

You are a Principal AI Engineer, Full-Stack Architect, Conversational AI Specialist, Voice UX Designer, Security Engineer and QA Automation Engineer.

Your responsibility is to completely audit, repair, enhance and integrate the EXISTING DukaanSet VoiceOS across the entire application.

**VoiceOS is our MAIN PRODUCT DIFFERENTIATOR and future marketing centerpiece. Treat it as a core business system, not a secondary feature.**

Do not create a separate demo project. Work directly in the existing repository and reuse established services, authentication, permissions, database models and UI components.

The final result must be genuinely usable, accurate, modern, secure and production-oriented.

---

# 1. FINAL PRODUCT VISION

Build an AI assistant that a normal Indian shopkeeper can talk to naturally.

The merchant should not need to remember predefined commands, select business modules or repeatedly fill complicated forms.

The AI must:

- Listen to natural speech.
- Automatically recognise the user's spoken language.
- Understand the user's actual business intent.
- Identify customers, products, quantities, units, prices and payment methods.
- Resolve real records from the active business.
- Ask relevant questions when information is missing.
- Remember answers within the active conversation.
- Reply naturally in a voice chosen by the merchant.
- Show a clean, editable action draft.
- Accept spoken or on-screen confirmation.
- Execute the actual authorised backend operation.
- Verify the transaction result.
- Speak a natural success or failure response.

**This must be an actual conversational business agent—not a decorative microphone, keyword-only command parser or frontend simulation.**

---

# 2. MOST IMPORTANT LANGUAGE RULE

## AUTOMATIC SAME-LANGUAGE CONVERSATION

There must be NO Assistant Reply Language selector anywhere in VoiceOS.

Detect the language automatically.

### English

Merchant:

"Create a bill for Rahul."

VoiceOS:

"Sure. What products did Rahul purchase?"

### Hindi

Merchant:

"राहुल के नाम से बिल बना दो।"

VoiceOS:

"बिल्कुल। राहुल ने कौन-कौन सा सामान लिया है?"

### Hinglish

Merchant:

"Rahul ka bill bana do."

VoiceOS:

"Bilkul! Rahul ne kya-kya samaan liya?"

### Mixed Hindi-English

Respond naturally in the same mixed conversational style.

### Additional Requirements

- Maintain the current conversational language across short replies such as "haan", "yes", "500 cash" or "okay".
- If the merchant clearly changes language, adapt.
- Support Hindi written in Devanagari, English and Romanized Hindi.
- Keep the existing application's display-language preference completely independent.
- Do not force the user to choose an input or reply language before speaking.
- Use conversation-level language context when a single utterance is ambiguous.

The user chooses only the assistant's voice, not the assistant's reply language.

---

# 3. ASSISTANT VOICE PERSONALIZATION

## ONE CORE PERSONALIZATION SETTING: CHOOSE ASSISTANT VOICE

Allow merchants to choose their preferred AI assistant voice.

Provide several genuine configured voices, including female-sounding and male-sounding options where supported.

Suggested presentation labels:

- Warm & Friendly
- Calm & Confident
- Soft & Natural
- Clear & Professional

These are UX labels, not promises that a provider has these exact voice names.

Show the provider's actual supported voices.

Each available voice must support:

- Selection
- Real audio preview
- Clear selected state
- Persistent user preference
- Appropriate multilingual capability

The selected voice should remain consistent when the merchant switches between Hindi, Hinglish and English wherever genuinely supported.

If a voice cannot support the current language, use a clearly documented compatible fallback rather than silently producing incorrect speech.

**Do not implement a Reply Language selector.**

---

# 4. EXACT VOICE SETTINGS PLACEMENT

### INSIDE VOICEOS

In the VoiceOS header, show:

- DukaanSet VoiceOS logo/name
- Current active shop
- Compact assistant settings icon
- Close button

Settings icon opens:

**Choose Assistant Voice**

Show a premium list/grid of actual available voices.

Each card displays:

- Voice name
- Short description
- Play Preview
- Selected checkmark

Use DukaanSet's premium white, deep-teal and mint appearance.

### MAIN APPLICATION SETTINGS

Provide:

Settings → VoiceOS → Choose Assistant Voice

Reuse the SAME component, preference and backend implementation.

Do not duplicate voice-selection state.

### SAVE BEHAVIOUR

Persist the chosen voice against the authenticated user.

Restore the same preference on future sessions and supported devices.

Do not ask the merchant to choose a voice again every time VoiceOS opens.

---

# 5. PREMIUM VOICEOS USER INTERFACE

Completely polish the EXISTING VoiceOS UI.

Use DukaanSet branding:

- Deep Teal: #103B36
- Forest Teal: #062F29
- Mint: #22C99D
- Off-White: #F7FAF8
- Charcoal: #1A2624

### INITIAL STATE

Display:

DukaanSet VoiceOS

"Namaste! Aaj main aapki kya help kar sakta hoon?"

A large premium microphone.

A small typed-message fallback.

A few short example commands.

A visible Quick Mode / Talk Mode control.

Keep the appearance premium, simple and uncluttered.

### LISTENING STATE

Display:

- Listening animation/waveform
- Clear microphone status
- Live transcription
- Stop Listening control

### THINKING STATE

Display:

- Subtle processing indicator
- Current interpreted task where useful
- No meaningless fake progress percentages

### ASSISTANT SPEAKING STATE

Display:

- Natural speaking waveform
- Spoken reply in text
- Stop Speaking control

### DRAFT READY

Show a structured editable action card with a clear primary confirmation action.

### SUCCESS

Show a verified success card with actual record information.

### ERROR

Show a useful recovery message without discarding valid user input.

Avoid unnecessary dropdowns, technical forms, duplicate microphones and repeated navigation.

---

# 6. QUICK MODE AND TALK MODE

## QUICK MODE

Designed for fast billing, customer creation and stock updates.

Flow:

Speak → Understand → Clarify if needed → Show Draft → Confirm → Execute.

Keep spoken responses concise.

## TALK MODE

Designed for continuous natural conversation while the merchant deliberately keeps the session active.

Flow:

Merchant speaks.

VoiceOS understands.

VoiceOS replies aloud.

Merchant answers naturally.

VoiceOS remembers context.

VoiceOS completes the draft.

Merchant confirms.

VoiceOS executes and announces verified success.

### IMPORTANT ENGINEERING REQUIREMENTS

- Reliable microphone permission handling
- Natural turn-taking
- Echo cancellation where supported
- Stop Speaking
- Stop Listening
- Cancel Conversation
- Interruption/barge-in where actually supported
- Correct session cleanup
- No accidental self-transcription of TTS audio
- No listening after the user closes VoiceOS
- Typed fallback if microphone fails

Build reliable turn-based conversation first. Do not falsely claim full-duplex streaming if the actual provider or device stack does not support it.

---

# 7. CONVERSATIONAL INTELLIGENCE — CORE FUNCTIONALITY

VoiceOS must understand ordinary merchant language rather than predefined phrases only.

Examples:

"Rahul naam ka customer add karo."

"10 kilo daal stock mein add kar do."

"Rahul ka bill bana do."

"Maggi ke 20 packet add karo."

"Rahul ne 500 rupaye cash diye."

"Aaj kitni sale hui?"

"Is customer ka statement bana do."

"Maggi ka stock kam hai kya?"

"Kal kitna business hua?"

Use structured natural-language interpretation with robust entity resolution.

**Never blindly convert an entire sentence into a product or customer name.**

---

# 8. HANDLE AMBIGUOUS COMMANDS INTELLIGENTLY

Example:

"Rahul ke naam se 10 product add kar do."

This is ambiguous.

The assistant must not assume that "10 product" means a specific inventory item.

Respond naturally:

"Rahul ka bill banana hai ya stock add karna hai? Aur 10 alag products hain ya ek product ki quantity 10 hai?"

Use follow-up answers to resolve the operation.

### DIFFERENT EXAMPLE

"Best product add kar do."

Do not invent a product.

Ask whether the merchant wants to create a product with a specific name or wants a product recommendation.

**The AI must be intelligent enough to know when it does not have enough information.**

---

# 9. PERFECT CUSTOMER/PRODUCT ENTITY SEPARATION

Merchant says:

"Rahul ko 10 kilo daal 80 rupaye kilo bechi."

Correct interpretation:

Intent: CREATE_SALE

Customer: Rahul

Product: Daal

Quantity: 10

Unit: kg

Unit Price: ₹80

Total: ₹800

Incorrect:

Product = Rahul Daal

Product = Rahul Ke Naam Se Daal

Intent = ADD_STOCK

Build robust semantic entity-role extraction.

Use actual customer/product search to resolve names.

Ask clarification if multiple verified matches exist.

---

# 10. INTELLIGENT MULTI-TURN CONVERSATION

The assistant must maintain an active task draft.

Example conversation:

**Merchant:**

"Rahul ka bill bana do."

**VoiceOS speaks:**

"Bilkul! Rahul ne kya samaan liya?"

**Merchant:**

"10 kilo daal."

**VoiceOS speaks:**

"Daal ka rate kitna hai?"

Only ask this if there is no suitable verified price already available.

**Merchant:**

"80 rupaye kilo."

**VoiceOS speaks:**

"Total ₹800 hua. Payment kaise hui?"

**Merchant:**

"500 cash, baaki udhaar."

**VoiceOS speaks:**

"Rahul ka ₹800 bill ready hai. ₹500 cash aur ₹300 udhaar. Save kar doon?"

**Merchant:**

"Haan, save karo."

The system must:

1. Validate Rahul's customer record.
2. Resolve the correct Daal product.
3. Validate available inventory and actual business rules.
4. Validate total and payment split.
5. Execute the authorised atomic transaction.
6. Verify backend success.
7. Refresh the affected records.

Then speak:

"Rahul ka bill save ho gaya. ₹300 udhaar record ho gaya aur daal ka stock update ho gaya."

Never say this before the backend confirms success.

---

# 11. SMART QUESTION ENGINE — MY RECOMMENDATION

The agent should ask the MINIMUM number of useful questions.

Do not ask for information the merchant already supplied.

Do not ask for information that is safely available from authoritative business data.

Use verified existing defaults where appropriate, but never fabricate missing values.

Examples:

Unknown product:

"Kaunsa product add karna hai?"

Multiple customers:

"Rahul Sharma ya Rahul Verma?"

Unclear quantity:

"10 packet ya 10 kilo?"

Missing payment:

"Cash mila, UPI ya udhaar?"

Insufficient stock:

"Stock mein sirf 6 kilo available hai. Quantity 6 kilo karni hai ya pehle stock update karna hai?"

### CRITICAL

Only ask payment questions for actions where payment matters.

A stock addition does not automatically need a customer or payment method.

A read-only report does not need confirmation.

---

# 12. ADVANCED CONVERSATION MEMORY

Maintain conversation state for:

- Active business
- Current intent
- Customer
- Products
- Variants
- Quantities
- Units
- Selling prices
- Discounts
- Payment details
- Outstanding clarification
- Editable action draft
- Confirmation status
- Execution status

Support natural corrections:

"Rahul nahi, Rohan."

"10 kilo nahi, 12 kilo."

"Cash nahi, UPI."

"Ek Maggi aur add karo."

"Last product hata do."

"Cancel kar do."

Do not restart the workflow unnecessarily.

Do not confuse details from an earlier completed conversation with a new task.

Do not carry pending drafts into another shop after business switching without explicit revalidation.

---

# 13. ADVANCED MULTI-PRODUCT AUTOMATION

Merchant:

"10 kilo pyaz, 5 kilo aloo aur 20 packet Maggi stock mein add karo."

VoiceOS must identify all three separate products and quantities.

Search the existing active-business catalogue.

Match trusted aliases.

Resolve existing variants.

Prepare missing products for creation where supported.

Show one combined editable stock draft.

Provide ONE final Save All Stock action.

On confirmation:

- Perform valid product creation.
- Update inventory.
- Record movements.
- Prevent duplicate submission.
- Refresh stock data.
- Trigger existing asynchronous approved product-image enrichment where supported.

Do not force unnecessary product-selection screens.

Do not fabricate product prices or supplier costs.

---

# 14. GLOBAL APPLICATION AUTOMATION

VoiceOS must connect to real existing services across the application.

Supported domains:

- Customers
- Products
- Inventory
- Billing
- Invoices
- Payments
- Udhaar
- Purchases
- Suppliers
- Expenses
- DemandPulse
- Reports
- Smart Invoice Studio
- Customer Statements
- Shop Closing
- WhatsApp document preparation
- ProfitPilot AI
- Smart Reorder Planner
- Purchase Bill Intelligence
- What-If Simulator
- Smart Action Center

Use actual implemented backend capabilities.

Do not invent endpoints or claim unsupported tools work.

All modules must share ONE global VoiceOS action engine.

Context from the current page can help resolve phrases like:

"Iska bill dikhao."

"Isme 10 kilo aur add karo."

"Is customer ka balance batao."

Explicitly spoken customer/product names must override stale page context.

---

# 15. PRODUCTION-GRADE AGENT ARCHITECTURE

Implement this pipeline:

**Microphone / Typed Message**

↓

**Reliable Speech Recognition**

↓

**Automatic Language Detection**

↓

**Intent Classification**

↓

**Structured Entity Extraction**

↓

**Conversation State & Clarification Engine**

↓

**Authorised Business Data Resolution**

↓

**Validated Action Draft**

↓

**Spoken + Visual Confirmation**

↓

**Deterministic Business Action Engine**

↓

**Verified Database Result**

↓

**Same-Language TTS Response**

### ARCHITECTURAL RECOMMENDATION

Use a hybrid AI and deterministic system.

AI handles:

- Natural language
- Intent understanding
- Entity extraction
- Clarification
- Conversational responses

Existing backend domain services handle:

- Pricing
- Taxes
- Invoice totals
- Stock movements
- Payments
- Customer ledgers
- Permissions
- Transactions
- Audit history

Never let an LLM execute arbitrary SQL or unrestricted backend actions.

Use typed tools and strict action schemas.

---

# 16. RELIABLE AUDIO TECHNOLOGY

Evaluate and integrate genuinely available speech technologies.

For STT:

- Hindi recognition
- English recognition
- Hinglish/code-switching
- Indian accents
- Spoken currency and quantities
- Common shop noise

For TTS:

- Natural Indian-language pronunciation
- Genuine selectable voices
- Hindi/English/Hinglish support
- Low latency
- Audio playback control
- Streaming if supported
- Reliable voice previews

### PROVIDER SELECTION

Evaluate suitable speech providers against real capabilities, latency, pricing, SDK compatibility, privacy and service availability.

Prefer production-quality neural TTS for Talk Mode when supported.

Use a tested fallback when advanced audio services fail.

Keep provider credentials server-side.

Do not hardcode unsupported provider names or fabricate working integrations.

---

# 17. SPEECH RESPONSE QUALITY — MY RECOMMENDATION

VoiceOS should sound like a helpful business assistant.

Responses should be:

- Natural
- Brief
- Clear
- Friendly
- Professional
- Contextual
- In the same language as the user

Do not speak lengthy invoice tables.

Keep detailed information on the screen.

Speak the important total, missing detail, risk or confirmation.

For example:

"Rahul ka ₹800 bill ready hai. ₹500 cash aur ₹300 udhaar. Save kar doon?"

Not a long technical explanation.

Pronounce rupee amounts, product names and Indian names naturally.

Avoid unnecessary repeated phrases.

---

# 18. ONE FINAL CONFIRMATION — FINANCIAL SAFETY

If a command is complete, proceed directly to its editable draft.

Do not ask irrelevant questions.

However, do not silently save financial, inventory or customer-record changes merely because all fields are present.

Allow one clear final confirmation:

"Haan, save karo."

OR

"Confirm & Save"

### READ-ONLY COMMANDS

"Aaj ki sale batao."

Return the result directly.

### NAVIGATION COMMANDS

"Customers kholo."

Open the authorised page directly.

### WRITE COMMANDS

"Rahul ka bill banao."

Prepare → Verify → Confirm → Commit.

For high-risk operations, enforce existing domain-specific authorisation and verification.

---

# 19. BACKEND ACCURACY AND SECURITY

This is non-negotiable.

Implement:

- Active business isolation
- Real authenticated user context
- Backend role permissions
- Strict data validation
- Correct inventory units
- Product variant validation
- Accurate financial arithmetic
- Atomic related database operations
- Idempotency keys
- Audit logging
- Transaction result verification
- Stale draft revalidation
- Duplicate action prevention
- Safe retries
- Error recovery

A speech recognition mistake must never cause an unintended silent financial transaction.

Never create fake success responses.

Never expose one shop's customer or financial data to another shop.

---

# 20. PREMIUM GLOBAL UI PLACEMENT

Preserve previously approved DukaanSet UI designs.

### DESKTOP DASHBOARD

Keep the compact VoiceOS launcher at the TOP-RIGHT of the approved dark teal hero.

Do not centre it.

### MOBILE DASHBOARD

Keep the wide white VoiceOS bar in the approved mobile hero.

### OTHER AUTHENTICATED PAGES

Reuse the existing global VoiceOS launcher or contextual access mechanism.

Do not create duplicate microphones or separate engines.

### VOICEOS INTERFACE

Desktop:

Premium responsive assistant dialog or side panel consistent with the current application.

Mobile:

Polished bottom sheet or full-screen conversation interface.

Keep listening, messages, drafts and confirmation clearly visible.

---

# 21. MY RECOMMENDATION — SMART INTERRUPTION AND RECOVERY

The merchant may interrupt the assistant.

Example:

VoiceOS:

"Rahul ka 10 kilo daal..."

Merchant:

"Ruko, 12 kilo hai."

Expected:

Stop speaking where supported.

Understand the correction.

Update the draft to 12 kg.

Recalculate from verified prices.

Continue the SAME conversation.

### FAILURE RECOVERY

If microphone recognition fails:

Allow retry or typing.

If TTS fails:

Display text.

If backend fails:

Keep the draft.

If server response is uncertain:

Check actual transaction status before retrying.

Never commit the same operation twice.

---

# 22. MY RECOMMENDATION — REAL-TIME BUSINESS INTELLIGENCE

VoiceOS should also answer business questions using actual records.

Examples:

"Aaj ki sale kitni hai?"

"Sabse zyada bikne wala product kya hai?"

"Rahul ka kitna udhaar pending hai?"

"Kaunse products ka stock kam hai?"

"Kal kitni cash collection hui?"

"Maggi reorder karna chahiye kya?"

Provide factual read-only answers using actual backend data.

Clearly distinguish:

- Confirmed facts
- Estimates
- Recommendations
- Simulations

Do not present AI-generated estimates as actual sales or profit.

---

# 23. MY RECOMMENDATION — PRIVACY AND COST CONTROL

Because VoiceOS will be used heavily by Indian shops, implement practical cost and privacy safeguards.

- Do not keep microphone recording active after session closure.
- Minimise unnecessary audio retention.
- Protect customer and financial details.
- Avoid sending unnecessary customer data to AI providers.
- Use configurable provider credentials.
- Track speech and AI usage costs.
- Prevent accidental repeated TTS generation.
- Cache safe metadata where appropriate.
- Provide rate limits and abuse protection.
- Handle poor mobile connectivity gracefully.

Never use raw merchant audio for model training without appropriate consent.

---

# 24. MY RECOMMENDATION — VOICEOS QUALITY ENGINE

Build a real evaluation and testing system.

Measure:

- Intent accuracy
- Entity extraction accuracy
- Product matching accuracy
- Customer matching accuracy
- Quantity recognition
- Payment parsing
- Clarification success
- Conversation completion
- Draft correction frequency
- Actual backend execution success
- Speech latency
- TTS latency
- Duplicate prevention

Build a representative Hindi, Hinglish and English command dataset.

Test mixed-language speech and ordinary Indian shop expressions.

Add regression cases for every discovered failure.

Do not call the system 100% accurate without measured evidence.

---

# 25. MUST-PASS END-TO-END TEST

The most important test is a COMPLETE two-way spoken business transaction.

### TEST SCENARIO

**Merchant:**

"Rahul ka bill banao."

**VoiceOS replies aloud:**

"Bilkul! Rahul ne kya samaan liya?"

**Merchant:**

"10 kilo daal."

**VoiceOS:**

Uses verified existing pricing where available; otherwise asks the rate.

**Merchant:**

"80 rupaye kilo."

**VoiceOS:**

"Total ₹800 hua. Payment kaise hui?"

**Merchant:**

"500 cash, baaki udhaar."

**VoiceOS:**

"Rahul ka ₹800 bill ready hai. ₹500 cash aur ₹300 udhaar. Save kar doon?"

**Merchant:**

"Haan, save kar do."

### EXPECTED RESULT

- Correct customer resolved
- Correct product resolved
- Correct quantity and unit
- Correct total
- Correct payment split
- Actual invoice saved
- Stock deducted correctly
- ₹500 cash collection recorded
- ₹300 receivable recorded
- No duplicate transactions
- Correct business isolation
- Backend success verified
- UI refreshed
- Spoken success in the same language

Only then is the test considered passed.

---

# 26. ADDITIONAL MANDATORY TESTS

Test:

- Incomplete customer creation
- New product creation
- Existing stock addition
- Multiple-item stock addition
- Multiple-item billing
- Missing price
- Missing payment method
- Ambiguous customer name
- Similar product names
- Quantity correction
- Product removal from draft
- Sales vs stock ambiguity
- Hindi-only conversation
- English-only conversation
- Hinglish conversation
- Mixed-language switching
- Short follow-up replies
- Different selected assistant voices
- Actual voice previews
- Voice preference persistence
- Stop Speaking
- Cancel operation
- Microphone permission denial
- Noisy audio
- Network failure
- Backend transaction failure
- Duplicate confirmation
- Mobile experience
- Role restrictions
- Multi-business switching

Test genuine audio-to-action workflows with configured providers, not only typed input.

---

# 27. IMPLEMENTATION PHASES

## PHASE 1 — COMPLETE CURRENT SYSTEM AUDIT

Inspect the existing repository.

Identify root causes of failures.

Map all current VoiceOS entry points and domain services.

## PHASE 2 — CONVERSATIONAL INTELLIGENCE

Implement robust intent/entity extraction, structured drafts, clarification and contextual memory.

## PHASE 3 — TWO-WAY SPEECH ENGINE

Integrate real STT and TTS, automatic language detection, natural spoken replies and reliable conversation turns.

## PHASE 4 — ASSISTANT VOICE SELECTION

Implement genuine selectable voices, previews, persistent preferences and cross-language voice compatibility.

## PHASE 5 — PREMIUM VOICEOS EXPERIENCE

Implement polished desktop/mobile UI, listening states, speaking states, conversation history and editable drafts.

## PHASE 6 — REAL BUSINESS AUTOMATION

Connect supported customer, product, inventory, billing, payment, purchase and reporting workflows to actual existing services.

## PHASE 7 — ADVANCED BUSINESS TOOLS

Integrate existing DemandPulse, Shop Closing, Intelligence Suite, invoices and authorised document workflows.

## PHASE 8 — SECURITY AND RELIABILITY

Add idempotency, permissions, tenant isolation, transactional correctness, privacy protections, error recovery and performance improvements.

## PHASE 9 — QUALITY ASSURANCE

Test English, Hindi, Hinglish, actual audio, desktop, mobile and real backend transactions using safe isolated test data.

Use the existing feature/* → dev → main review and deployment workflow.

---

# 28. DELIVERABLES

Deliver a fully implemented VoiceOS upgrade including:

- One reusable Global VoiceOS engine
- Automatic same-language responses
- Real selectable assistant voices
- Actual audio previews
- Persistent voice preferences
- Premium VoiceOS interface
- Quick Mode
- Talk Mode
- Natural two-way speech
- Structured business intent detection
- Contextual memory
- Smart clarification
- Editable drafts
- Spoken and screen confirmation
- Real backend automation
- Verified spoken success
- Cancel and interruption handling
- Secure tenant-aware operations
- Real mobile support
- Error and offline-degradation handling
- Multilingual evaluation tests
- End-to-end business transaction tests
- Implementation screenshots or recordings
- Final QA report
- Accurate list of remaining provider or infrastructure requirements

---

# 29. STRICT NON-NEGOTIABLE RULES

DO NOT BUILD A BASIC SPEECH-TO-TEXT FEATURE.

DO NOT BUILD A KEYWORD-ONLY ASSISTANT.

DO NOT CREATE A SEPARATE DEMO APP.

DO NOT ADD AN ASSISTANT REPLY LANGUAGE SELECTOR.

DO NOT FORCE THE MERCHANT TO SELECT A SPOKEN LANGUAGE.

DO NOT INVENT VOICES OR PROVIDER CAPABILITIES.

DO NOT BUILD FAKE CONVERSATIONAL RESPONSES.

DO NOT FORGET ACTIVE CONVERSATION DETAILS.

DO NOT CONFUSE CUSTOMER NAMES AND PRODUCT NAMES.

DO NOT CONFUSE SALES WITH STOCK ADDITIONS.

DO NOT INVENT FINANCIAL VALUES.

DO NOT SAVE BUSINESS CHANGES WITHOUT EXPLICIT CONFIRMATION.

DO NOT CLAIM SUCCESS BEFORE BACKEND VERIFICATION.

DO NOT DUPLICATE BUSINESS ACTIONS ON RETRY.

DO NOT CHANGE THE APPROVED DASHBOARD HERO.

DO NOT BREAK THE EXISTING APP'S DISPLAY LANGUAGE SETTING.

DO NOT IGNORE MOBILE PERFORMANCE.

DO NOT CLAIM UNTESTED FEATURES ARE PRODUCTION-READY.

DO NOT STOP AT UI MOCKUPS OR AN IMPLEMENTATION PLAN.

---

# 30. FINAL IMPLEMENTATION INSTRUCTIONS TO CODEX

Start by inspecting the existing DukaanSet codebase and identifying its actual stack, working services and current VoiceOS limitations.

Implement the upgrades directly in the current application.

Use the existing design system, business services, database, authentication and route structure.

Build one global, secure, reusable conversational business-action engine.

Integrate genuine speech recognition and natural text-to-speech.

Provide real assistant voice selection, but NEVER a reply-language selector.

Automatically detect the user's spoken language and reply in the same language.

Support multi-turn spoken clarification.

Show editable action drafts.

Require explicit final confirmation for record-changing operations.

Execute through verified authorised backend services.

Only announce success after the actual operation succeeds.

Test the complete microphone-to-database-to-spoken-response journey.

Where provider credentials or infrastructure are unavailable, complete the integration code where feasible, document the exact configuration needed and mark live capabilities as unverified rather than faking success.

Do not finish until implementation, testing and any remaining limitations are clearly reported.

## FINAL ACCEPTANCE SCENARIO

Merchant:

"Rahul ka bill banao."

DukaanSet:

"Bilkul! Rahul ne kya samaan liya?"

Merchant:

"10 kilo daal, 80 rupaye kilo."

DukaanSet:

"Total ₹800 hua. Payment kaise hui?"

Merchant:

"500 UPI, 300 udhaar."

DukaanSet:

"Rahul ka bill ready hai. Save kar doon?"

Merchant:

"Haan, save karo."

DukaanSet executes the real validated transaction.

After verified success, DukaanSet speaks:

"Rahul ka bill successfully save ho gaya. Stock aur udhaar update ho gaya."

## FINAL PRODUCT EXPERIENCE

**AAP BOLO → DUKAANSET SAMJHE → DUKAANSET JAWAAB DE → KAAM TAIYAAR KARE → AAP CONFIRM KARO → DUKAANSET KAAM COMPLETE KARE.**

## PRODUCT PROMISE

# DUKAANSET VOICEOS 3.0
### AAP BOLO, DUKAANSET KAAM SAMBHALE.

**BEGIN IMPLEMENTATION NOW IN THE EXISTING DUKAANSET REPOSITORY.**
