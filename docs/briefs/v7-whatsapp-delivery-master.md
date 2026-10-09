# DUKAANSET V7 — FINAL SMART WHATSAPP INVOICE DELIVERY MASTER PROMPT

## Build a Premium, Secure, Multilingual, Fully Integrated WhatsApp PDF Delivery System

### PROJECT INFORMATION

**Project Name:** DukaanSet

**Tagline:** Apni Dukaan, Sab Set.

**Existing Module:** Smart Invoice Studio & Customer Hisaab

**New Feature:** DukaanSet Smart WhatsApp Delivery

**Primary Goal:** Allow a shopkeeper to send a real, professional PDF invoice to the correct customer's WhatsApp number with minimum steps.

**Additional Documents:**
- Customer Account Statements
- Payment Receipts
- Appropriate Refund/Credit Documents

**Target Users:** Nontechnical Indian shopkeepers operating grocery, hardware, clothing, vegetable, mobile accessory, general stores and other small businesses.

**Core Product Philosophy:** Advanced technology in the backend. Extremely simple user experience in the frontend.

---

# 1. YOUR ROLE

Act as an expert development team consisting of:

- Principal Full-Stack Engineer
- WhatsApp Business Platform Integration Specialist
- SaaS Solutions Architect
- Senior Backend Engineer
- PDF Generation Engineer
- Senior Mobile UI/UX Designer
- Application Security Engineer
- Internationalization Engineer
- DevOps Engineer
- Quality Assurance Engineer

Your responsibility is to implement the complete feature inside the EXISTING DukaanSet application.

Inspect the repository before making changes.

Reuse current:

- Authentication
- Business management
- Smart Invoice Studio
- Customer 360°
- Sales and Billing
- Payments
- Udhaar Ledger
- Customer History
- Language Engine
- VoiceOS
- Database
- GitHub CI/CD
- Vercel staging deployment

Do not build a disconnected messaging application.

Do not generate fake PDFs.

Do not create fake delivery statuses.

Do not claim WhatsApp messages are delivered unless actual provider information confirms delivery.

---

# 2. EXACT USER REQUIREMENT

A shopkeeper creates a new sale.

DukaanSet generates the real branded invoice.

The customer may have previously purchased products multiple times.

The shopkeeper can open the customer profile and view the correct invoice.

A prominent action should be available:

**Send on WhatsApp**

The system should:

1. Identify the selected invoice.
2. Identify the correct customer.
3. Retrieve the saved WhatsApp number.
4. Prepare the actual PDF from the existing invoice.
5. Display recipient details.
6. Display a short message preview.
7. Allow the shopkeeper to confirm sending.
8. Send the document through an officially configured integration, or launch an accurate manual-sharing flow.
9. Record the real sharing or delivery outcome.
10. Display that information inside the customer profile.

The shopkeeper must not have to download the file and manually search for it again when an appropriate direct integration is available.

---

# 3. TWO REAL SENDING MODES

Build both modes using one unified user interface.

## MODE A — MANUAL WHATSAPP PDF SHARING

Available for merchants without an official WhatsApp Business API connection.

Use supported native device-sharing capabilities.

Workflow:

Invoice Preview

→ Share PDF

→ Device Share Sheet

→ Select WhatsApp

→ Select Customer

→ Complete Send

Use the Web Share API where supported.

Check actual file-sharing capability with `navigator.canShare`.

Pass the actual PDF file through `navigator.share` when supported.

If unavailable, provide:

- Download PDF
- Open WhatsApp Chat with appropriate prefilled text where supported
- Copy secure document link, when a secure sharing facility exists

Do not falsely claim that `wa.me` directly attaches a PDF.

Do not claim that a device share-sheet action successfully delivered a WhatsApp message.

Do not assume that native sharing can force the recipient to the customer's saved number.

Label this mode clearly as:

**Share via WhatsApp**

## MODE B — OFFICIAL DIRECT WHATSAPP PDF DELIVERY

This is the preferred premium experience once the necessary WhatsApp Business Platform connection is configured.

Workflow:

Invoice Preview

→ Send on WhatsApp

→ Customer Number Automatically Selected

→ Confirm

→ Backend Sends PDF

→ Provider Status Tracked

Use Meta's officially supported WhatsApp Business Platform Cloud API or an appropriately authorised Business Solution Provider.

The actual PDF must be delivered as a supported document message when the account, template and conversation conditions permit.

If direct sending of a document is not available under the applicable messaging conditions, provide a truthful compliant fallback, such as an approved template containing an appropriately secured document-access link if supported.

Do not misrepresent a link message as an attached PDF.

---

# 4. SINGLE SIMPLE WHATSAPP BUTTON

Add a clear WhatsApp action in:

1. New Sale success screen.
2. Invoice preview.
3. Sales history.
4. Customer 360° profile.
5. Individual customer purchase history.
6. Smart Invoice Studio document centre.
7. Customer Account Statement preview.
8. Payment Receipt preview.

Use a consistent green WhatsApp-style action with appropriate branding guidelines.

Example:

**Send Bill on WhatsApp**

Do not create separate complicated interfaces in every section.

All entry points must use the same shared document-delivery component.

---

# 5. ONE-TAP CUSTOMER SELECTION

When the shopkeeper opens a saved invoice from a customer profile, the system already knows:

- Active business
- Customer
- Invoice
- Document type
- Customer phone number
- Document language preference

Prefill these details automatically.

Do not ask the user to search for the same customer again.

If a dedicated WhatsApp number is saved, prefer it.

If only a general phone number exists, allow the shopkeeper to review its suitability for WhatsApp delivery.

If no number exists, show a compact Add WhatsApp Number form.

Do not discard the current invoice selection.

### Important

A contact number is not proof that the number belongs to an active WhatsApp user.

Use proper phone number validation and handle provider failures gracefully.

---

# 6. SMART RECIPIENT CONFIRMATION

Before direct API sending, show a compact mobile confirmation sheet.

Example:

**Send Invoice on WhatsApp**

Customer: Rahul Sharma

WhatsApp: +91 XXXXX XX210

Invoice: DS-2026-0125

Date: 9 October 2026

Amount: ₹1,798

Document: Invoice PDF

Language: English

Message:

"Hello Rahul, thank you for shopping at Sharma Fashion Store. Your invoice is attached."

Primary Action:

**Send Invoice**

Secondary Action:

Cancel

Allow the shopkeeper to edit or select the intended number through an authorised workflow.

Avoid unnecessary repeated confirmations after this step.

---

# 7. ACTUAL PDF — NOT JUST A MESSAGE

The system must use the real PDF generated by DukaanSet Smart Invoice Studio.

The PDF must include relevant existing details:

- Shop logo
- Shop name
- Shop address
- Contact details
- GST information, where applicable
- Invoice number
- Invoice date
- Customer information
- Products
- Quantities
- Unit prices
- Applicable taxes and discounts
- Total amount
- Relevant payment details
- Outstanding amount
- Document footer

The document must maintain the Premium Modern design.

### Most Important Rule

Sending the invoice must not create a second sale.

It must not deduct inventory again.

It must not create another payment.

It must not alter customer outstanding balances.

Document delivery is independent of financial transactions.

---

# 8. SUPPORT THREE DOCUMENT TYPES

## A. Individual Invoice

The merchant selects an existing completed invoice.

The system sends the PDF associated with that invoice.

## B. Customer Hisaab Statement

The merchant selects a date range.

DukaanSet generates the correct account statement showing:

- Opening balance
- Purchases
- Payments
- Adjustments
- Closing balance

The statement can be sent through WhatsApp.

## C. Payment Receipt

The merchant selects a recorded payment.

DukaanSet generates the existing payment receipt and prepares it for WhatsApp sending.

### Important Distinction

Invoice, Account Statement and Payment Receipt must remain separate document types.

Generating or sending any of these must not create new financial transactions.

---

# 9. OFFICIAL WHATSAPP CLOUD API INTEGRATION

Implement a maintainable, server-side integration with the current officially supported WhatsApp Business Platform.

Inspect current Meta API documentation at implementation time.

Support:

- WhatsApp Business Account configuration
- Authorised business sender
- Phone Number ID
- Appropriate access permissions
- Secure token handling
- Document media uploads
- Document message requests
- Approved template sending where required
- Webhook verification
- Delivery status processing
- Provider error handling

### Document Sending

Preferred supported flow:

1. Generate or retrieve authorised PDF.
2. Validate file size and PDF format.
3. Upload PDF to the supported WhatsApp media endpoint.
4. Receive a valid media identifier.
5. Send a document message using the media identifier under permitted messaging conditions.
6. Record the provider's returned message identifier.
7. Process subsequent status events.

Use the exact current API requirements, version and supported limits.

Do not hardcode an obsolete API version.

Do not use unofficial WhatsApp Web bots, session scraping or fragile browser automation.

---

# 10. WHATSAPP TEMPLATE RULES

Respect Meta's current WhatsApp Business messaging requirements.

Distinguish between:

- Permitted replies inside the customer-service conversation window.
- Business-initiated messages requiring an approved template.

Use approved templates where required.

Evaluate the appropriate transaction/utility template category under the provider's current rules.

If a template supports a suitable PDF document header, use it where approved.

If not, choose an officially supported alternative and clearly label its behaviour.

Do not send arbitrary free-form messages outside permitted conditions.

Do not automatically fall back to an unapproved template.

If the selected outgoing language does not have an approved template, explain the limitation and offer an authorised alternative instead of silently switching languages.

---

# 11. MULTILINGUAL WHATSAPP DELIVERY

DukaanSet supports:

- English
- Hindi
- Hinglish

The sending interface must follow the global DukaanSet language preference.

The customer-facing message should use the customer's preferred communication language where available.

Provide an optional language selection inside the send sheet.

Do not unnecessarily modify the shopkeeper's global display language.

### English Message

Hello Rahul,

Thank you for shopping at Sharma Fashion Store.

Your invoice DS-2026-0125 for ₹1,798 is attached.

Thank you!

### Hindi Message

नमस्ते राहुल,

शर्मा फैशन स्टोर से खरीदारी करने के लिए धन्यवाद।

आपका ₹1,798 का बिल DS-2026-0125 इस संदेश के साथ भेजा गया है।

धन्यवाद!

### Hinglish Message

Namaste Rahul,

Sharma Fashion Store se shopping karne ke liye shukriya.

Aapka ₹1,798 ka bill DS-2026-0125 is message ke saath bheja gaya hai.

Dhanyavaad!

Adapt the wording to the actual approved template.

Only say the PDF is attached if the message truly includes the PDF as an attachment.

Do not silently mix application-generated Hindi, English and Hinglish strings.

Preserve original customer and product names.

---

# 12. CUSTOMER CONSENT AND PRIVACY

Implement appropriate contact preferences.

Store where necessary:

- Customer phone
- WhatsApp number
- Preferred communication language
- Messaging permission
- Opt-out state
- Applicable permission source
- Last updated timestamp

Before direct business-initiated delivery, verify the appropriate messaging basis and platform rules.

Distinguish transactional invoice delivery from promotional marketing.

Do not use invoice delivery consent as blanket permission to send unrelated advertising.

Handle opt-outs appropriately.

Do not send documents to unrelated phone numbers.

---

# 13. DELIVERY TRACKING SYSTEM

Integrate a truthful delivery-status system.

Possible statuses:

- Not Sent
- Preparing PDF
- Awaiting Confirmation
- Queued
- Submitted
- Sent
- Delivered
- Read, when available
- Failed
- Cancelled
- Unknown

The status must come from actual application or provider events.

### Important

An API request accepted by WhatsApp does not prove the customer received the document.

Display submitted, sent, delivered and read as distinct states.

For manual sharing, show:

**Manual Sharing Initiated**

Do not display a false Delivered status.

---

# 14. CUSTOMER 360° DELIVERY HISTORY

Extend the customer profile with:

**Shared Documents**

For every sending attempt, show:

- Document
- Invoice or receipt number
- Date
- Sending method
- Destination number, appropriately masked
- Actual status
- Last update time

Example:

Invoice DS-2026-0125

WhatsApp Business API

Delivered

9 October 2026

Provide:

- View Document
- View Status
- Resend, where appropriate

This makes customer communication traceable without complicating the shopkeeper's workflow.

---

# 15. POST-SALE SMART WHATSAPP ACTION

After every successful sale, show:

**Sale Saved Successfully**

Display:

Invoice: DS-2026-0125

Total: ₹1,798

Received: ₹1,500

Outstanding: ₹298

Actions:

- View Invoice
- Send on WhatsApp
- New Sale

The customer and invoice must already be selected.

A WhatsApp failure must never undo a successfully committed sale.

Do not force the merchant to send every invoice.

Keep sharing optional.

---

# 16. SMART RESEND AND FAILURE RECOVERY

If an invoice fails to send:

Display a clear and understandable error.

Example:

"Invoice could not be sent. Check the customer's number or try again."

Provide an appropriate Retry or Resend option.

### Retry Requirements

- Avoid duplicate simultaneous sends.
- Use idempotent delivery-request handling.
- Track each send attempt.
- Retry only when appropriate.
- Handle rate limits.
- Avoid repeating permanent errors.
- Reconcile uncertain submission results before resending.

If a timeout occurs after the provider may already have accepted the message, do not blindly submit another copy.

Use provider message references and webhook data wherever available.

---

# 17. WEBHOOK-BASED DELIVERY UPDATES

Implement secure WhatsApp status webhooks.

Requirements:

1. Validate webhook verification requests.
2. Verify event authenticity.
3. Process the correct business connection.
4. Resolve the provider message ID.
5. Update the correct delivery attempt.
6. Handle duplicate events.
7. Handle out-of-order statuses.
8. Store appropriate timestamps.
9. Record failures accurately.

Never allow an unauthenticated request to mark arbitrary documents as delivered.

Keep webhook processing independent of customer ledger mutations.

---

# 18. MULTI-BUSINESS SAAS ARCHITECTURE

DukaanSet supports many independent businesses.

Each business must have separate:

- WhatsApp sending configuration
- Business sender identity
- Invoice branding
- Customer contacts
- Delivery history
- Message templates or template mappings
- Usage records
- Communication preferences

Support an appropriate merchant-connected WhatsApp Business sender model.

A platform-managed sending model may also be considered if legally, commercially and technically supported.

Do not imply the shopkeeper's personal WhatsApp number can automatically send official API messages.

Always make the real business sender clear.

Never send one shop's customer documents using another shop's unauthorised sender.

---

# 19. SIMPLE WHATSAPP SETTINGS

Create:

**Settings → WhatsApp & Invoice Sharing**

Show simple information:

- WhatsApp Connection
- Connected Sender
- Direct Sending Availability
- Message Language
- Template Status
- Test Connection
- Disconnect

If the merchant has not connected the official integration:

Display:

"Direct WhatsApp sending is not connected. You can still share invoice PDFs manually."

Provide:

**Share Manually**

Do not overwhelm nontechnical shopkeepers with Phone Number IDs, access tokens and API terminology.

Keep advanced configuration inside an appropriate administrator setup flow.

---

# 20. REUSABLE BACKEND ARCHITECTURE

Build a shared document delivery system.

Suggested services:

- DocumentDeliveryService
- WhatsAppConnectionService
- WhatsAppCloudAPIAdapter
- WhatsAppMediaService
- WhatsAppTemplateService
- WhatsAppWebhookService
- DeliveryStatusService
- CommunicationPreferencesService
- SecureDocumentAccessService
- DocumentDeliveryAuditService

### Direct Delivery Flow

Authenticated Merchant

→ Authorised Business

→ Existing Invoice or Document

→ Correct Customer

→ Valid WhatsApp Destination

→ Communication Eligibility Check

→ Real PDF Generation

→ Approved Message Selection

→ Media Upload

→ Provider Submission

→ Delivery Record

→ Webhook Status Update

Keep all provider credentials on the backend.

Use durable job processing when required by runtime or reliability needs.

---

# 21. DATABASE REQUIREMENTS

Reuse existing business and document data.

Introduce only necessary new entities.

### WhatsAppConnections

Store:

- Business reference
- Provider
- Sender identity
- Connection status
- Encrypted secret reference
- Configuration metadata

### DocumentDeliveryRequests

Store:

- Business ID
- Document type
- Document reference
- Customer ID
- Destination
- Language
- Sending mode
- Requesting user
- Request timestamp

### DocumentDeliveryAttempts

Store:

- Request reference
- Attempt number
- Provider message ID
- Submission result
- Delivery status
- Failure code
- Relevant timestamps

### CustomerCommunicationPreferences

Store:

- Customer reference
- Business reference
- Preferred language
- Relevant messaging permission
- Opt-out information

Protect all records using tenant-scoped authorisation.

Never duplicate accounting balances inside messaging tables.

---

# 22. SECURE PDF ACCESS

Customer invoices may contain private financial information.

Implement:

- Authentication
- Business authorisation
- Customer-document ownership validation
- Safe PDF access
- Secure file storage
- Expiring document links where appropriate
- Secure provider media handling
- Document-access logging
- Proper retention controls

Do not publish customer invoices under predictable permanent public URLs.

Do not expose PDFs to other businesses.

If using a secure link fallback, make its access and expiry behaviour clear.

---

# 23. VOICEOS INTEGRATION

Connect with existing DukaanSet VoiceOS.

Example:

"Rahul ka last bill WhatsApp pe bhejna hai."

The system must:

1. Identify Rahul.
2. Find the correct invoice.
3. Prepare the existing PDF.
4. Open the recipient preview.
5. Select the configured sharing mode.
6. Wait for explicit merchant confirmation.
7. Execute the appropriate sharing process.

Another example:

"Rahul ka is month ka hisaab WhatsApp karna hai."

Prepare the appropriate Customer Hisaab Statement.

VoiceOS must never send sensitive documents automatically merely because a speech recogniser interpreted a command.

---

# 24. PREMIUM MOBILE-FIRST DESIGN

Follow DukaanSet's established design system.

Colours:

- Deep Teal #103B36
- Mint #22C99D
- Off-White #F7FAF8
- Amber #F5B942

Optimise for common Android smartphones.

Use:

- One clear WhatsApp action
- Compact recipient confirmation
- Preselected customer and invoice
- Clear document summary
- Loading indicators
- Delivery feedback
- Easy retry
- Simple back navigation

Do not introduce a separate complicated messaging dashboard for basic invoice sharing.

Keep advanced delivery information inside the customer profile or settings.

---

# 25. OPTIONAL SMART AUTOMATIONS

Prepare architecture for future automation.

Possible optional enhancements:

### Automatic Invoice Delivery

When explicitly enabled by an authorised merchant and all messaging conditions are satisfied, offer an approved workflow for automatically sending invoices after completed sales.

Default behaviour must remain manual confirmation.

### Payment Receipt Delivery

Allow an authorised merchant to send a receipt after a payment is successfully recorded.

### Account Statement Delivery

Offer customer statement sharing for selected periods.

### Payment Reminder Preparation

Prepare an optional outstanding-payment reminder based on actual ledger records.

Do not automatically send collection reminders without suitable permission and configuration.

### DemandPulse Follow-Up

Reuse the messaging infrastructure to support appropriate customer restock notifications.

Keep DemandPulse promotions or availability notices separate from transactional invoice communications and apply the appropriate message rules.

Do not enable unsolicited campaigns by default.

---

# 26. REALISTIC DEMO MODE

Create an isolated test workspace.

### Shop

Sharma Fashion Store

### Customer

Rahul Sharma

### Example Invoice

DS-2026-0125

Blue Shirt × 2

Total: ₹1,798

Recorded Payments: ₹1,500

Balance Due: ₹298

### Required Demo

1. Open the customer profile.
2. Select the invoice.
3. Preview the Premium Modern PDF.
4. Tap Send on WhatsApp.
5. Show the selected customer and phone.
6. Preview the message.
7. Select the available sending mode.
8. Confirm.
9. Show the truthful submission result.
10. Open the document delivery history.

If testing official sending, use an authorised test WhatsApp recipient and configured provider environment.

If the provider is unavailable, use a clearly labelled mock adapter.

Never claim a mock message was delivered to a real phone.

---

# 27. AUTOMATED QA TESTING

Test:

- Existing invoice selection
- Customer lookup
- Saved WhatsApp number
- Invalid number handling
- Missing contact information
- Recipient confirmation
- Actual PDF generation
- Manual share-sheet integration
- Browser compatibility
- WhatsApp API connection
- Media upload
- Approved templates
- Conversation-window rules
- Customer messaging preferences
- Provider submission
- Webhook statuses
- Duplicate webhooks
- Duplicate sends
- Failed messages
- Retry handling
- Resend handling
- Customer delivery history
- English message templates
- Hindi message templates
- Hinglish message templates
- VoiceOS sharing requests
- Mobile layout
- Business isolation
- Secure document access

### Financial Safety Tests

Sending must never:

- Create another invoice.
- Deduct inventory.
- Generate a duplicate payment.
- Increase outstanding balance.
- Rewrite the original invoice.
- Change historical transaction data.

Record actual test results.

---

# 28. GITHUB CI/CD AND VERCEL STAGING

Integrate with the existing DukaanSet workflow.

Development branch:

`dev`

Production branch:

`main`

Requirements:

- Appropriate tests run in GitHub Actions.
- Staging uses test credentials.
- Production credentials remain isolated.
- Webhooks use correct environment-specific HTTPS endpoints.
- PDF generation works on staging.
- Correct customer and invoice access are verified.
- Real or mocked provider integration is clearly distinguished.
- Failed builds and integration errors are visible.

If deployment architecture requires a worker or durable queue, configure an appropriate compatible service.

Do not assume every long-running delivery operation can safely execute inside a short-lived serverless function.

Do not claim the feature is live until actual provider configuration and sending behaviour have been verified.

---

# 29. IMPLEMENTATION PHASES

## Phase 1 — Essential Sharing

Implement:

- WhatsApp button
- Customer-number prefill
- Invoice PDF preparation
- Recipient preview
- Manual native PDF sharing
- Unsupported-browser fallback
- Customer sharing history for known manual actions

## Phase 2 — Official Direct Delivery

Implement:

- Business WhatsApp connection
- Official Cloud API integration
- PDF media upload
- Permitted message sending
- Approved templates
- Explicit confirmation
- Secure tenant isolation

## Phase 3 — Reliable Tracking

Implement:

- Delivery request records
- Provider message IDs
- Webhook status updates
- Failure handling
- Safe retries
- Resend functionality
- Customer document history

## Phase 4 — Advanced Experience

Implement:

- Customer statements
- Payment receipt sending
- English/Hindi/Hinglish messaging
- VoiceOS commands
- Advanced merchant settings
- Approved optional automation

Build each phase as an integrated, testable feature.

Do not block the basic manual-sharing capability merely because official API onboarding is not complete.

---

# 30. FINAL ACCEPTANCE CRITERIA

The system is complete only when:

1. The WhatsApp action is available on relevant invoice screens.
2. The selected invoice is correct.
3. The correct customer is identified.
4. Recipient details are verified before direct sending.
5. The actual PDF is generated.
6. Manual PDF sharing works where device APIs support it.
7. A proper fallback exists elsewhere.
8. Official direct delivery works for configured authorised merchants.
9. Messaging rules and applicable permissions are respected.
10. PDF document messaging uses an officially supported flow.
11. Delivery tracking uses genuine provider events.
12. Duplicate sends are controlled.
13. Sending failures have safe recovery paths.
14. Customer profiles show accurate document delivery history.
15. All three display languages are supported.
16. Customer-facing messages respect the applicable language preference and approved template.
17. Tenant data remains isolated.
18. Invoice and ledger data remain unchanged by sending.
19. The feature works on mobile.
20. Relevant automated and staging tests pass.

Clearly report any feature that requires external Meta onboarding, approved templates, provider credentials or additional configuration.

---

# 31. FINAL DELIVERABLES

Provide:

1. Fully integrated WhatsApp action.
2. Customer-number autofill.
3. Recipient confirmation sheet.
4. Secure existing-PDF retrieval.
5. Native PDF sharing.
6. Browser fallback.
7. Official WhatsApp Cloud API adapter.
8. WhatsApp Business configuration flow.
9. Document-media upload.
10. Approved template integration.
11. Secure document delivery service.
12. Provider message tracking.
13. Webhook processing.
14. Delivery history.
15. Retry and resend support.
16. Account Statement sharing.
17. Payment Receipt sharing.
18. English messaging.
19. Hindi messaging.
20. Hinglish messaging.
21. VoiceOS integration.
22. Multi-tenant access control.
23. Mobile-first UI.
24. Automated tests.
25. Vercel staging verification.
26. Setup documentation.
27. Actual implementation-status report.

---

# FINAL EXECUTION INSTRUCTION

Inspect the existing DukaanSet repository and implement the complete Smart WhatsApp Invoice Delivery System.

Reuse Smart Invoice Studio, Customer 360°, existing invoices, payment receipts, account statements, business settings, VoiceOS and the universal language engine.

Do not create disconnected financial documents.

Do not fabricate WhatsApp delivery.

Do not use unofficial WhatsApp automation.

Do not send private customer financial documents without appropriate authorisation.

Keep the shopkeeper experience minimal.

### PRIMARY WORKFLOW

**Invoice Open → WhatsApp Tap → Customer Confirm → Actual PDF Share/Send.**

### AFTER SENDING

Record the appropriate genuine event and show its status inside Customer 360°.

### PRODUCT PROMISE

**DukaanSet — Bill Banao, WhatsApp Par Bhejo, Customer Ka Saara Hisaab Ek Jagah Rakho.**

**BEGIN IMPLEMENTATION IN THE EXISTING DUKAANSET APPLICATION. DO NOT STOP AT PLANNING.**
