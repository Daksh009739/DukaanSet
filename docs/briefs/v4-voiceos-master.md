# DUKAANSET V4 — ULTIMATE UNIVERSAL AI VOICEOS MASTER PROMPT

## Build a Premium, Multilingual, Voice-First Business Management Experience Across the Entire DukaanSet Application

### PROJECT INFORMATION

**Product Name:** DukaanSet

**Tagline:** Apni Dukaan, Sab Set.

**New Signature Feature:** DukaanSet VoiceOS

**VoiceOS Tagline:** Bolo, Check Karo, Save Karo — DukaanSet Sab Set Karega.

**Product:** Mobile-First, Multi-Business, AI-Powered SaaS for Indian Shopkeepers.

**Target Businesses:** Kirana, Grocery, Hardware, Vegetables, Clothing, Mobile Accessories, General Stores, Wholesalers and Other Small Businesses.

## YOUR ROLE

Act as a complete expert engineering and product team consisting of:

- Principal Full-Stack Engineer
- Senior AI and NLP Engineer
- Speech Recognition Specialist
- SaaS Solution Architect
- Senior Mobile UI/UX Designer
- Database and Backend Engineer
- Conversational UX Designer
- Security Engineer
- QA Automation Engineer
- Product Manager

Your responsibility is to **implement one unified AI Voice Operating System throughout the existing DukaanSet application**.

This is not a request for UI mockups or theoretical architecture.

Inspect the existing repository and integrate actual working code with the current business services.

Preserve existing functionality, authentication, multi-tenant isolation, inventory, billing, customer records, payments, DemandPulse, reports, and multilingual settings.

Do not unnecessarily rebuild working modules.

---

# 1. THE MAIN VISION

DukaanSet must become a voice-first business management application.

A shopkeeper should not have to type every product, customer, quantity, payment, or business request.

The shopkeeper should be able to speak naturally and let the application prepare the relevant action.

Examples:

**Voice Stock:**

"Bhai 4 doodh ke packet, 2 kilo dal aur 5 kilo pyaz stock mein add kar do."

**Voice Billing:**

"Rahul Sharma ko 2 blue shirts 899 rupaye ki ek bechi hain. Usne 1000 cash aur 500 UPI se diye, baaki udhaar."

**Voice Customer Payment:**

"Rahul ne aaj purane udhaar ke 500 rupaye cash diye."

**Voice DemandPulse:**

"Aaj ek customer XL blue shirt maang raha tha, hamare paas available nahi thi, usko 2 shirts chahiye thi."

**Voice Purchase:**

"Gupta Traders se 20 biscuit packet aur 10 kilo sugar stock mein aayi hai."

**Voice Reports:**

"Aaj kitni bikri hui aur kitna paisa lena baaki hai?"

The application must identify the intention, prepare the correct information, resolve ambiguity, and update actual business records only after the appropriate confirmation.

### Non-Negotiable Principle

**One Voice Engine. Multiple Business Workflows. Minimal Typing. Reliable Results.**

---

# 2. AUDIT THE EXISTING APPLICATION FIRST

Before development:

1. Inspect the complete codebase.
2. Locate existing stock voice functionality.
3. Review authentication and user permissions.
4. Review inventory and billing services.
5. Review customer and payment ledgers.
6. Review DemandPulse.
7. Review purchases, suppliers and reports.
8. Identify existing AI integrations.
9. Inspect language-switching architecture.
10. Review mobile navigation and design system.
11. Identify existing forms and validation schemas.
12. Run existing tests.

Build upon the current application.

Never create duplicate sales, inventory, or payment engines just for voice operations.

---

# 3. BUILD ONE SHARED DUKAANSET VOICEOS ENGINE

Do not build separate unrelated microphone systems for every feature.

Create one reusable central voice-processing architecture.

Recommended modules:

- GlobalVoiceLauncher
- ContextualVoiceButton
- VoiceRecorder
- SpeechToTextProvider
- VoiceLanguageHandler
- TranscriptNormalizer
- IntentRecognitionService
- StructuredEntityExtractor
- ProductResolver
- CustomerResolver
- SupplierResolver
- QuantityAndUnitNormalizer
- PaymentNormalizer
- ActiveDraftManager
- ConversationContextManager
- MissingInformationResolver
- VoiceCorrectionManager
- ActionConfirmationManager
- VoiceActionRouter
- VoicePermissionsGuard
- VoiceFeedbackService

### Shared Processing Pipeline

Microphone Input

→ Speech-to-Text

→ Spoken Language Interpretation

→ Intent Detection

→ Business Entity Extraction

→ Customer/Product/Supplier Resolution

→ Validation

→ Automatic Form Filling

→ Missing Information Follow-up

→ Editable Preview

→ User Confirmation

→ Existing Backend Service

→ Database Transaction

→ Dashboard and History Refresh

Each module must use the same shared processing system with its own validated action schema.

---

# 4. TWO VOICE EXPERIENCES

## A. Global Voice Assistant

Add a prominent, accessible microphone entry point to the main DukaanSet application.

The user should be able to invoke the assistant from relevant application screens.

Example commands:

"Rahul ka udhaar dikhao."

"Ek naya bill banana hai."

"Aaj ki sales batao."

"Stock mein kitna milk bacha hai?"

"DemandPulse mein kaunsi requests pending hain?"

The global assistant must understand the requested workflow and take the user to the correct destination or display the requested authorised information.

## B. Contextual Voice Buttons

Add voice actions to major workflows.

**Inventory:** Bolkar Stock Jodo

**Sales:** Bolkar Bill Banao

**Customers:** Bolkar Customer Jodo

**Payments:** Bolkar Payment Jodo

**DemandPulse:** Bolkar Demand Likho

**Purchases:** Bolkar Purchase Jodo

**Suppliers:** Bolkar Supplier Jodo

**Expenses:** Bolkar Kharcha Jodo

**Reports:** Bolkar Poochho

**Daily Closing:** Bolkar Hisaab Bharo

The contextual button must prioritise the current workflow.

Do not display unnecessary microphone buttons beside every input field.

A global launcher and one relevant contextual action per major workflow are preferred.

---

# 5. HINDI, ENGLISH AND HINGLISH

VoiceOS must support Indian shopkeepers who speak:

- Hindi
- English
- Hinglish
- Natural Hindi-English mixed sentences

The application's display language must continue supporting:

- English
- हिंदी
- Hinglish

The user may select English in Settings but speak Hindi.

Speech language and display language must be treated separately.

Use suitable speech-to-text providers and evaluate actual Hindi/Indian English/code-switching performance.

Do not assume that Hinglish has a universally supported speech-recognition locale.

Provide:

- Input language selection when necessary
- Automatic detection where dependable
- Editable transcript
- Manual correction
- Clear fallback when voice recognition is unavailable

### Spoken Number Support

Recognise expressions such as:

- Four
- Char
- चार
- 4
- Do kilo
- दो किलो
- Half kilo
- Aadha kilo
- Dedh kilo
- Dhai kilo
- 500 gram
- Paanch sau rupaye
- Ek hazaar rupaye

Normalise numbers, money, and units accurately.

Use appropriate decimal handling for inventory quantities and precise integer minor-unit arithmetic for money.

---

# 6. VOICE BILLING — HIGHEST PRIORITY

Allow complete invoice drafts through natural speech.

### Example

"Rahul Sharma ko do blue shirts 899 rupaye ki ek bechi hain. Usne 1000 cash aur 500 UPI se diye, baaki udhaar."

VoiceOS must prepare:

- Customer: Rahul Sharma
- Product: Blue Shirt
- Quantity: 2
- Unit Price: ₹899
- Invoice Total: ₹1,798
- Cash Received: ₹1,000
- UPI Recorded: ₹500
- Outstanding: ₹298

The example assumes no additional taxes or discounts.

Automatically populate the existing New Sale form.

The user can edit any field.

### After Save Sale

The existing backend must:

- Create the invoice.
- Deduct the correct inventory quantity.
- Record cash and online payments.
- Calculate outstanding balance.
- Update the customer ledger.
- Update customer purchase history.
- Refresh dashboard metrics.
- Create stock movement and audit records.

### Important Sales Rules

- VoiceOS must use actual inventory products.
- Do not implement AI image-based product recognition.
- Do not guess an ambiguous shirt size or product variant.
- Do not invent missing selling prices.
- Do not create duplicate catalogue products.
- Do not allow insufficient stock without the authorised business policy.
- Do not silently create an invoice from only a total amount when the products are unspecified.
- Do not treat manually recorded UPI payments as bank-verified.

If a uniquely resolvable product has been identified, avoid an unnecessary separate verification page.

Any ambiguity should be handled directly inside the editable draft.

---

# 7. SMART MULTI-PRODUCT VOICE BILLING

A shopkeeper must be able to speak multiple items in one command.

Example:

"Rahul ko 2 blue shirts, 1 jeans aur 3 black T-shirts bechi hain."

VoiceOS must create multiple invoice line items.

Use existing catalogue prices where appropriate.

Handle:

- Quantity
- Product variants
- Unit prices
- Discounts
- Tax rules
- Customer
- Payment methods
- Outstanding balance

If a user says:

"2 blue shirts 899 ki"

and the price basis is unclear, ask whether ₹899 is per shirt or the total.

Do not make financially material guesses.

Allow additional products to be added by voice to the same active invoice draft.

---

# 8. VOICE STOCK MANAGEMENT

Extend the existing Voice Stock Entry system.

Example:

"4 milk packets, 2 kilo dal, 5 kilo pyaz aur 10 kilo aloo add kar do."

Automatically prepare inventory rows.

Support:

- Multiple product extraction
- Quantities
- Units
- Product aliases
- Repeated products
- Unit conversions
- Corrected quantities
- Missing information
- Editable preview

### Voice Alias Example

Catalogue product: Amul Taaza Milk 500ml

Saved spoken alias: Doodh

Use business-specific aliases to improve recognition.

If an alias refers to multiple products, ask the user to choose.

### Stock Logic

After confirmation:

- Increase the appropriate product quantities.
- Create stock-in records.
- Update inventory history.
- Refresh stock alerts.
- Refresh relevant DemandPulse information.

Never update inventory before the user confirms the prepared operation.

---

# 9. VOICE CUSTOMER MANAGEMENT

Allow customer creation and customer searches through speech.

Examples:

"Naya customer add karo, naam Amit Kumar."

"Rahul Sharma ka account kholo."

"Priya ka pending payment batao."

VoiceOS must use existing customer records.

Support:

- Customer name
- Phone number
- Optional customer details
- Search by name
- Search by phone
- Outstanding balance queries
- Customer purchase history

If there are multiple possible customer matches, ask for clarification.

Do not automatically merge customer accounts.

Do not create duplicate customers without checking existing records.

For spoken phone numbers, show a clear review of the recognised digits.

---

# 10. VOICE PAYMENTS AND UDHAR

Allow shopkeepers to record payments with voice.

Example:

"Rahul Sharma ne purane udhaar ke 500 rupaye cash diye."

Prepare:

- Customer: Rahul Sharma
- Payment: ₹500
- Method: Cash
- Purpose: Outstanding collection
- Applicable invoice allocation

After confirmation:

- Record payment.
- Update outstanding ledger.
- Update invoice payment status.
- Update payment history.
- Refresh collection reports.

### Critical Rule

A payment collected against old udhaar is not a new sale.

Do not increase sales revenue again.

### Split Payment

Support commands like:

"Bill 1798 ka hai, 1000 cash mila aur 500 online mila."

Show:

- Total
- Cash
- Online
- Remaining

Always validate payment totals.

---

# 11. VOICE DEMANDPULSE — SIGNATURE X-FACTOR

Integrate VoiceOS with the complete DemandPulse module.

### Example 1

"Aaj ek customer Blue Shirt XL maang raha tha, lekin available nahi thi. Usko 2 shirts chahiye."

Prepare:

- Product: Blue Shirt
- Size: XL
- Quantity Requested: 2
- Reason: Out of Stock
- Customer: Optional
- Demand Status: Open

Show an editable DemandPulse preview.

On confirmation, create a demand request.

**Do not create an invoice or deduct stock.**

### Example 2

"Teen customers ne XL shirts maangi, total 5 shirts ki demand thi."

Distinguish:

- Customer Request Count: 3
- Total Requested Quantity: 5

Do not assume each person requested five shirts.

### Example 3

"Rahul ko black T-shirt XXL chahiye thi, hamare paas nahi thi."

Suggest the existing customer where unambiguous.

Save the relevant unavailable variant.

### Voice DemandPulse Questions

"Aaj kaunsa product sabse zyada maanga gaya?"

"Kaunsi demand abhi pending hai?"

"Kis customer ko stock aane par contact karna hai?"

"Kaunsi missed demand actual sale mein convert hui?"

Retrieve real authorised DemandPulse records.

Do not invent analytics.

---

# 12. VOICE-ASSISTED REORDER AND FOLLOW-UP

Support commands such as:

"Jo XL blue shirts ki demand hai uske liye reorder draft bana do."

Prepare a supplier reorder draft based on actual requests and configured stock rules.

Do not automatically place an order.

Another command:

"Rahul ke liye message prepare karo ki XL shirt wapas aa gayi hai."

Prepare a contact message if the customer has appropriate contact details and permission.

Do not automatically send customer messages without authorised confirmation and an appropriately configured messaging integration.

---

# 13. VOICE PURCHASES AND SUPPLIERS

Example:

"Gupta Traders se 20 biscuit packet aur 10 kilo sugar aayi hai."

VoiceOS should prepare an inventory receipt or purchase draft according to the user's stated intent.

Distinguish:

- Supplier order
- Actual stock receipt
- Supplier invoice
- Supplier payment

Do not automatically treat an order draft as received stock.

Ask for missing purchase prices or necessary supplier information.

Support supplier selection using existing records.

---

# 14. VOICE EXPENSES

Add contextual voice entry to Expenses.

Example:

"Aaj dukaan ka 1500 rupaye bijli ka bill cash diya."

Prepare:

- Expense Type: Electricity
- Amount: ₹1,500
- Payment Method: Cash
- Date: Business-local date
- Description: Electricity bill

Require appropriate confirmation before saving.

Update cash and expense reporting according to existing business logic.

Prevent duplicate expense creation from repeated voice recognition events.

---

# 15. VOICE REPORTS AND BUSINESS QUESTIONS

Allow the user to ask:

"Aaj kitni bikri hui?"

"Is week kitna cash collect hua?"

"Kitna udhaar baaki hai?"

"Kaun se products low stock mein hain?"

"Sabse zyada kis product ki sale hui?"

"DemandPulse mein kitni requests open hain?"

Use actual authenticated business data.

Do not use generic or fabricated answers.

The assistant must distinguish:

- Sales
- Collections
- Outstanding
- Expenses
- Stock quantity
- Missed demand
- Confirmed recovered sales

Show results in the user's selected display language.

Optional spoken responses may be supported where a reliable text-to-speech provider exists.

---

# 16. VOICE DAILY CLOSING

Integrate VoiceOS with Aaj Ka Hisaab.

Examples:

"Aaj ka closing dikhao."

"Actual cash 12,500 rupaye hai."

The assistant should open or populate the daily closing form.

Display:

- Expected cash
- Actual cash
- Difference
- Payments received
- Credit sales
- Relevant expenses

Do not finalise a daily closing without explicit authorised confirmation.

---

# 17. SMART CONVERSATIONAL MEMORY WITHIN ACTIVE DRAFTS

VoiceOS must support natural follow-up instructions.

Example conversation:

User:

"Rahul ka do shirts ka bill banao."

VoiceOS prepares the draft.

User:

"Quantity teen kar do."

VoiceOS changes quantity to 3.

User:

"Cash 1000 mila."

VoiceOS adds cash payment.

User:

"Nahi, cash 800 tha."

VoiceOS corrects the same payment field to ₹800.

### Required Behaviour

- Maintain context for the active draft.
- Understand field corrections.
- Preserve valid existing fields.
- Avoid duplicate items and payments.
- Support voice and manual edits together.
- Reset context appropriately after saving or cancelling.
- Keep draft context isolated to the authenticated business and user.

Do not confuse one customer's transaction with another.

---

# 18. SMART MISSING INFORMATION FOLLOW-UP

When required details are missing, ask only for those details.

Examples:

"Kaunsi shirt size?"

"Kitni quantity?"

"Udhaar kis customer ke naam?"

"Payment cash tha ya online?"

"Kaunsi dal?"

Do not ask the user to repeat their entire instruction.

Support voice or manual responses.

Display the question inside a compact bottom sheet or inline conversational interface.

Keep the process simple and understandable.

---

# 19. VOICE DRAFT → ONE-TAP SAVE

This is a mandatory system-wide design rule.

For all create/update operations affecting financial or inventory records:

1. Listen to the voice command.
2. Interpret the details.
3. Fill the existing form.
4. Highlight missing or ambiguous information.
5. Allow corrections.
6. Show an understandable summary.
7. Let the user press Save or Confirm.
8. Call the existing backend service.
9. Display success only after the backend confirms.

Never automatically commit financial, customer, stock, supplier, or DemandPulse write operations from unconfirmed speech.

For reports and read-only navigation, execute permitted read actions without unnecessary confirmation.

---

# 20. PREMIUM GLOBAL VOICEOS INTERFACE

Create a polished VoiceOS design consistent with DukaanSet.

Recommended brand colours:

- Deep Teal: #103B36
- Mint: #22C99D
- Off-White: #F7FAF8
- Amber: #F5B942

### UI Elements

- Global microphone launcher
- Contextual microphone buttons
- Listening animation
- Live transcript
- Stop Recording button
- Editable transcript
- Processing state
- Structured form preview
- Missing-information prompts
- Correction controls
- Save action
- Success summary

### Mobile UX

Optimise for Android smartphones.

Ensure:

- Large touch targets
- Fast microphone access
- Minimum navigation
- Safe-area support
- Responsive bottom sheets
- Clear keyboard behaviour
- No horizontal overflow
- Reduced-motion support
- Efficient animations
- Low-powered device compatibility

Do not make the interface visually crowded by adding too many microphone icons.

---

# 21. MANUAL MODE MUST ALWAYS WORK

Voice is an enhancement, not a mandatory requirement.

Every core operation must remain available manually.

Users must be able to:

- Type product details
- Search products
- Select customers
- Enter payments
- Record demand
- Add expenses
- Create purchase records
- View reports

Support hybrid input.

For example:

The owner speaks three products, manually changes one quantity, and then saves.

Voice and manual workflows must use the same validation schemas and trusted backend business services.

---

# 22. INTELLIGENT CONTEXT ROUTING

Implement structured voice intents.

Examples:

- CREATE_SALE_DRAFT
- ADD_STOCK_DRAFT
- CREATE_CUSTOMER_DRAFT
- RECORD_PAYMENT_DRAFT
- CREATE_DEMAND_DRAFT
- CREATE_PURCHASE_DRAFT
- RECEIVE_STOCK_DRAFT
- CREATE_EXPENSE_DRAFT
- PREPARE_FOLLOWUP_DRAFT
- GET_REPORT
- OPEN_SCREEN
- UPDATE_ACTIVE_DRAFT
- CANCEL_ACTIVE_DRAFT

Use the active business and current application context when interpreting commands.

If the intent is unclear, ask for clarification.

Never execute arbitrary database mutations based directly on unvalidated model output.

Use allowlisted actions and module-specific schemas.

---

# 23. VOICE ACCURACY AND FALLBACK STRATEGY

Speech recognition can fail because of background noise, device support, network conditions, pronunciation, or mixed-language speech.

Handle:

- No microphone permission
- No speech detected
- Unsupported browser
- Provider unavailable
- Incomplete transcription
- Conflicting quantities
- Ambiguous product names
- Ambiguous customer names
- Duplicate interim results
- Interrupted recordings
- Network timeouts

Provide:

- Retry
- Manual edit
- Input language override
- View transcript
- Continue manually

Do not assume that every Indian-accent or Hinglish command will be perfectly transcribed.

Evaluate real recognition accuracy through representative test recordings and merchant feedback.

---

# 24. SECURITY AND PRIVACY

Implement:

- User authentication
- Business tenant isolation
- Role-based permissions
- Secure microphone access
- Explicit recording initiation
- Clear recording indicators
- Secure API credentials
- Sensitive data protection
- Audit logs
- Backend validation
- Database transactions
- Idempotency
- Secure transcript handling

Do not record audio secretly.

Do not retain raw recordings unnecessarily.

If retention is needed, define a legitimate purpose, appropriate user permission, retention policy and deletion controls.

Do not expose customer phone numbers or payment details to unauthorised users.

Never place speech-provider API secrets in frontend code.

---

# 25. CONNECT WITH THE EXISTING DUKAANSET BACKEND

Every confirmed voice operation must reuse existing business services.

Examples:

Voice Billing → Sales Service

Voice Stock → Inventory Service

Voice Payment → Payment Service

Voice Customer → Customer Service

Voice DemandPulse → DemandPulse Service

Voice Purchases → Purchase Service

Voice Expenses → Expense Service

Voice Reports → Reporting Service

Voice Daily Closing → Closing Service

Do not duplicate inventory or payment calculations.

Enforce authorisation and validation on the server.

Do not create a second disconnected database for voice-generated records.

---

# 26. COMPLETE VOICEOS DEMO MODE

Create an isolated, realistic demonstration workspace.

Use example businesses:

- Sharma Kirana Store
- Sharma Fashion Store
- Sharma Hardware Store
- Fresh Sabzi Store

Include sample:

- Products
- Inventory
- Customers
- Payments
- Outstanding balances
- Suppliers
- Sales history
- DemandPulse requests

### Mandatory Demo A — Voice Billing

Speak:

"Rahul ko 2 blue shirts 899 ki ek bechi, 1000 cash mila aur 500 UPI se, baaki udhaar."

Confirm the generated invoice draft.

Verify:

- Invoice saved
- Stock reduced
- Payments recorded
- Outstanding calculated
- Customer history updated

### Mandatory Demo B — Voice Stock

Speak:

"4 doodh packet aur 5 kilo pyaz add kar do."

Confirm and verify actual stock increases.

### Mandatory Demo C — Voice DemandPulse

Speak:

"Ek customer ne 2 XL blue shirts maangi thi, lekin available nahi hain."

Confirm and verify demand request creation without sales or stock deduction.

### Mandatory Demo D — Voice Payment

Speak:

"Rahul ne 500 rupaye purane udhaar ke cash diye."

Confirm and verify the relevant outstanding balance updates.

### Mandatory Demo E — Voice Report

Ask:

"Aaj kitni sales hui?"

Show results calculated from actual demo business data.

Provide an authorised Reset Demo Data action.

If real speech recognition is unavailable, provide a separately labelled text-command demo simulator.

Do not portray simulated transcripts as real microphone recognition.

---

# 27. AUTOMATED TESTING

Implement appropriate tests for:

- Hindi voice instructions
- English voice instructions
- Hinglish phrases
- Mixed-language commands
- Numbers and currency
- Multi-product extraction
- Product aliases
- Customer resolution
- Split payments
- Corrected quantities
- Missing information
- Context retention
- Voice inventory updates
- Voice invoice generation
- Voice payment allocation
- Voice DemandPulse creation
- Voice supplier purchases
- Voice expenses
- Business reporting
- Permissions
- Tenant isolation
- Duplicate submissions
- Network failures
- Microphone failures
- Mobile layouts
- Language switching

### Financial Correctness Tests

Ensure:

- Stock is deducted once per confirmed sale.
- Stock is increased once per confirmed receipt.
- Payments are recorded once.
- Udhaar balances are calculated correctly.
- Demand requests are never counted as completed sales.
- Failed transactions do not partially modify business records.
- Historical records remain traceable.

Provide actual passing and failing test results.

---

# 28. VERCEL STAGING AND CI/CD INTEGRATION

DukaanSet already has a planned GitHub and Vercel deployment workflow.

Ensure VoiceOS is compatible with it.

Requirements:

- Code lives in the existing repository.
- Changes integrate through the `dev` branch workflow.
- GitHub Actions checks applicable code and tests.
- Successful commits deploy to Vercel staging through the configured integration.
- Speech-provider credentials are environment-specific.
- Staging uses isolated demo data.
- Microphone access works under HTTPS on supported browsers.
- Production secrets and merchant data remain protected.

Do not assume backend services or long-running audio-processing workloads are automatically compatible with Vercel's serverless runtime.

Choose an appropriate speech-processing architecture after inspecting the project.

Do not claim a live integration until the deployment and real-device behaviour have been verified.

---

# 29. IMPLEMENTATION PRIORITIES

## Phase 1 — Core VoiceOS Foundation

Build:

- Shared microphone system
- Real audio capture
- Speech-to-text integration
- Multilingual interpretation
- Structured intent handling
- Editable transcript
- Form auto-fill
- Missing-information handling
- One-tap confirmation

## Phase 2 — Essential Business Features

Fully connect:

- Voice Billing
- Voice Stock Entry
- Voice Payments
- Voice Customers
- Voice DemandPulse

## Phase 3 — Additional Business Workflows

Connect:

- Voice Purchases
- Voice Suppliers
- Voice Expenses
- Voice Reports
- Voice Daily Closing

## Phase 4 — Smart Conversational Enhancements

Add:

- Advanced corrections
- Multi-turn conversations
- Business-specific product aliases
- Better mixed-language recognition
- Context-aware shortcuts
- Optional spoken responses

## Phase 5 — Future Improvements

Evaluate:

- Additional Indian regional languages
- Improved low-connectivity operation
- Local/on-device speech recognition where viable
- Voice-led stock reconciliation
- More sophisticated business intelligence

Keep all completed workflows stable as new modules are added.

---

# 30. FINAL ACCEPTANCE CRITERIA

VoiceOS can be considered complete only after the following are verified:

1. Microphone recording works on supported devices.
2. Real speech-to-text is connected.
3. Hindi, English and Hinglish have been tested.
4. Contextual microphone buttons work.
5. Global voice navigation works.
6. Business intents route correctly.
7. Product and customer references resolve safely.
8. Forms populate from spoken information.
9. Corrections update the active draft.
10. Missing information can be supplied without restarting.
11. Manual input remains fully supported.
12. Write actions require confirmation.
13. Sales update inventory and customer records correctly.
14. Payments update outstanding balances correctly.
15. DemandPulse requests do not create fake revenue.
16. Reports use actual business data.
17. Backend permissions are enforced.
18. Duplicate operations are prevented.
19. Mobile usability is verified.
20. Critical automated tests pass.

If a capability remains incomplete, document it clearly.

Do not falsely mark demo simulations or unconfigured providers as production-ready.

---

# 31. FINAL DELIVERABLES

Provide:

- Complete integrated VoiceOS system.
- Shared speech recognition architecture.
- Global Voice Assistant.
- Contextual Voice Actions.
- Multilingual voice support.
- Voice Billing.
- Voice Stock.
- Voice Payments.
- Voice Customer Management.
- Voice DemandPulse.
- Voice Purchases.
- Voice Supplier Management.
- Voice Expenses.
- Voice Reports.
- Voice Daily Closing.
- Smart correction handling.
- Missing-information follow-ups.
- Product alias support.
- Editable voice drafts.
- One-tap confirmation.
- Manual fallback.
- Premium responsive mobile interface.
- Existing database integration.
- Security and privacy protections.
- Isolated demo workflows.
- Automated testing.
- Setup documentation.
- Staging deployment configuration.
- Actual implementation-status report.

---

# 32. FINAL EXECUTION INSTRUCTION

You are not being asked to provide suggestions only.

You must inspect the existing DukaanSet repository and implement the VoiceOS feature throughout the application.

Do not create disconnected microphone features.

Do not build static demonstrations with fake business updates.

Make VoiceOS populate the existing real forms and execute the existing backend workflows only after appropriate user confirmation.

Prioritise the shopkeeper's experience.

A non-technical shopkeeper should be able to operate the application using natural Hindi, English, or Hinglish.

The system must feel intelligent without becoming complicated.

## FINAL PRODUCT VISION

**DukaanSet VoiceOS**

One Application.

One Voice Engine.

Every Important Business Workflow.

Three Display Languages.

Minimum Typing.

Minimum Clicks.

Maximum Practical Simplicity.

### FINAL PRODUCT PROMISE

**"Bas Bolo, DukaanSet Samjhega. Ek Tap Mein Saara Hisaab Set."**

**BEGIN IMPLEMENTATION IN THE EXISTING DUKAANSET CODEBASE. DO NOT STOP AT PLANNING.**
