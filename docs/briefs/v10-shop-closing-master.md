# DUKAANSET V10 — ULTIMATE SMART SHOP CLOSING & DAILY HISAAB SYSTEM

## FINAL PRODUCTION-READY IMPLEMENTATION MASTER PROMPT

### Build a Premium, Automated, Financially Accurate, Mobile-First Daily Business Closing, Cash Reconciliation and Smart Reporting Experience

---

# PROJECT IDENTITY

**Project:** DukaanSet

**Tagline:** Apni Dukaan, Sab Set.

**New Feature:** DukaanSet Smart Shop Closing

**User-Facing Action:** Close Today / Aaj Ka Hisaab Band Karo

**Product Type:** Multi-Business, Multi-Tenant SaaS Platform for Indian Shopkeepers.

**Target Audience:** Kirana stores, clothing businesses, hardware shops, vegetable sellers, mobile accessory stores, general stores and other small merchants.

## CORE OBJECTIVE

At the end of the business day, the shopkeeper should be able to review and save their complete daily business summary in minimum steps.

The system must automatically calculate:

- Total daily sales
- Cash received
- UPI received
- Other payment collections
- New credit sales
- Previous outstanding payments collected
- Current customer outstanding balances
- Daily expenses
- Cash movement
- Expected closing cash
- Actual physical cash, when counted
- Cash difference
- Relevant stock and purchase activity
- Closing date and time
- Closing method and responsible user

Support both manual and optional scheduled automatic closing.

Save an accurate closing record that can be viewed later, downloaded as a professional PDF and used for future business reports.

## ABSOLUTE PRODUCT PHILOSOPHY

**Advanced Financial Intelligence in the Backend. Extremely Simple Daily Workflow in the Frontend.**

---

# 1. YOUR ROLE

Act as a complete product engineering team:

- Principal SaaS Architect
- Financial Systems Architect
- Senior Full-Stack Developer
- Senior Database Engineer
- Product Designer
- Mobile UX Specialist
- Automation Engineer
- Security Engineer
- Localization Engineer
- QA Automation Engineer

Your responsibility is to implement this feature inside the EXISTING DukaanSet application.

Do not create an independent accounting application.

Do not create duplicate financial records.

Do not replace correct existing business calculations unnecessarily.

Reuse the current:

- Authentication system
- Multi-business architecture
- Sales and Billing
- Inventory
- Customer 360°
- Udhaar Ledger
- Payment Records
- Supplier Purchases
- Expenses
- Returns and Refunds
- Smart Invoice Studio
- VoiceOS
- Reports
- Universal Language Engine
- GitHub CI/CD
- Vercel staging architecture

Inspect the actual source code before implementation.

Do not stop at planning, mockups or sample UI.

---

# 2. FEATURE NAMING AND CLARITY

The feature must be unmistakably about closing the current business day's accounts.

Recommended UI labels:

### English

Close Today

### Hindi

आज का हिसाब बंद करें

### Hinglish

Aaj Ka Hisaab Band Karo

Avoid making users think the action will:

- Delete their business
- Disable their store
- End their subscription
- Log them out permanently
- Delete business records

The system must clearly explain what daily closing means.

Preferred helper text:

"Review today's sales, payments and cash before closing your accounts."

---

# 3. COMPLETE MAIN USER JOURNEY

The standard workflow must remain extremely short.

**Dashboard → Close Today → Review Summary → Check Cash (Optional) → Confirm Close → Saved Report**

### Step 1: Close Today

The shopkeeper taps Close Today.

The system retrieves authoritative records for the current business day.

### Step 2: Review Summary

Show an automatically prepared summary.

The owner does not manually enter all sales and payments again.

### Step 3: Verify Cash

Allow optional physical cash matching.

### Step 4: Confirm Closing

Display a concise confirmation containing:

- Business name
- Business date
- Financial summary
- Closing status
- Any unresolved issues

### Step 5: Success

Save the closing.

Show:

**Today's Accounts Closed Successfully**

Allow:

- View Report
- Download PDF
- Return to Dashboard

Avoid unnecessary intermediate screens.

---

# 4. FINAL PREMIUM CLOSING SCREEN DESIGN

Follow DukaanSet's premium visual language.

### Colours

Deep Teal: #103B36

Mint: #22C99D

Off-White: #F7FAF8

Amber: #F5B942

Charcoal: #1A2624

### Design Requirements

- Clear financial hierarchy
- Compact premium cards
- Large readable totals
- Minimal visible actions
- Consistent status indicators
- Clean payment breakdown
- Elegant typography
- Meaningful icons
- Subtle animations
- Excellent mobile responsiveness

Do not create a cluttered accounting dashboard.

### First-Screen Summary

Show four important numbers:

**Today's Sales**

**Money Received**

**New Udhaar**

**Total Customer Money Pending**

Below these, show compact expandable sections:

- Payment Breakdown
- Cash Matching
- Expenses
- Returns and Refunds
- Stock Summary
- Purchases
- Advanced Details

The first screen must answer the user's main questions without excessive scrolling.

---

# 5. DAILY SALES CALCULATION

Calculate sales from actual sales records.

Distinguish:

- Gross sales
- Applicable discounts
- Returns and credit adjustments
- Net sales
- Completed sale count

Clearly define whether dashboard headline sales represent gross or net sales.

Use one consistent business definition across Dashboard, Reports and Daily Closing.

Do not count voided or invalid transactions as completed sales.

Do not calculate sales simply by summing payment records.

Credit sales are still sales, even when no money was received immediately.

---

# 6. CASH, UPI AND OTHER PAYMENT BREAKDOWN

This is a core requirement.

For each supported payment method, show:

- Collections against today's sales
- Collections against older customer dues
- Total recorded collections

Support:

- Cash
- UPI
- Bank Transfer
- Card, where available
- Other authorised methods

### Example

Cash collected from today's sales: ₹6,000

Cash collected against old udhaar: ₹400

**Total Cash Received: ₹6,400**

UPI collected from today's sales: ₹3,500

UPI collected against old udhaar: ₹600

**Total UPI Received: ₹4,100**

Total Cash + UPI Received: ₹10,500

### Critical Financial Rule

Do not double-count old udhaar payments as new sales.

Do not count the same split payment twice.

Do not confuse a recorded UPI payment with bank-verified settlement unless an integration provides verification.

Separate payments received from refunds and other outbound money movement.

---

# 7. DAILY UDHAAAR SUMMARY

Use the existing authoritative customer ledger.

Display:

**Opening Customer Outstanding**

**New Udhaar Today**

**Old Udhaar Collected**

**Returns and Credit Adjustments**

**Closing Customer Outstanding**

### Example

Opening Outstanding: ₹3,000

New Udhaar: +₹1,500

Old Udhaar Collected: −₹1,000

Closing Outstanding: ₹3,500

Actual calculations must account for additional applicable ledger movements, allocations and customer credit balances.

### Important

Do not calculate every customer's pending amount using an oversimplified lifetime sales minus lifetime payments formula.

Handle:

- Partial payments
- Split payments
- Previous balances
- Refunds
- Returns
- Credit notes
- Customer advances
- Corrections
- Payment reallocations

The closing report must reconcile to the actual customer ledger.

---

# 8. MY RECOMMENDATION — SMART CASH DRAWER MATCHING

Add an optional feature:

**Cash Matching**

The system calculates the expected cash physically available in the shop.

### Formula

Expected Closing Cash =

Opening Cash

+ Cash Collections

+ Other Valid Cash Inflows

− Cash Expenses

− Cash Refunds

− Cash Supplier Payments

− Cash Withdrawals

− Other Valid Cash Outflows

### Example

Opening Cash: ₹1,000

Cash Collected: ₹6,400

Cash Expenses: ₹700

Expected Closing Cash: ₹6,700

### Physical Cash Verification

Ask:

**How Much Cash Is Actually in the Drawer?**

Merchant enters:

₹6,650

System calculates:

Expected: ₹6,700

Actual: ₹6,650

Difference: −₹50

Status:

**₹50 Cash Short**

### Important Rules

Do not automatically create a financial adjustment for a cash difference.

Provide an authorised adjustment workflow with an appropriate reason.

Allow a merchant to skip physical cash verification when their business configuration permits.

If cash is not physically counted, mark:

**Cash Verification Pending**

Never falsely mark uncounted cash as verified.

---

# 9. MY RECOMMENDATION — SMART PRE-CLOSE CHECKLIST

Before finalising the business day, automatically detect relevant unresolved operational issues.

Examples:

- Unsaved sale currently in progress
- Pending payment submission
- Unconfirmed stock receipt
- Cash difference
- Unresolved register activity
- Offline transactions not yet synced
- Conflicting closing attempt

### UX

Show only actual actionable issues.

Example:

**Before You Close**

"One sale is still being edited."

"Cash has not been counted."

### Smart Behaviour

Classify issues:

- Blocking
- Needs Review
- Informational

Never block daily closing for irrelevant warnings.

Allow permitted exceptions to be acknowledged.

Do not silently include an unsaved transaction in financial totals.

Do not silently discard pending work.

---

# 10. MANUAL SHOP CLOSING

Provide a prominent:

**Close Today**

action.

On confirmation:

1. Authenticate and authorise the user.
2. Identify the active business and business session.
3. Establish a consistent transaction cutoff.
4. Calculate financial totals.
5. Validate any blocking issues.
6. Save the closing snapshot.
7. Record the actual closing time.
8. Record who performed the action.
9. Mark reconciliation status accurately.
10. Show the saved closing report.

Do not save a completed closing merely because the preview screen was opened.

Prevent duplicate finalisation when the merchant taps the button repeatedly.

---

# 11. OPTIONAL AUTOMATIC SHOP CLOSING

Add settings:

**Settings → Shop Timing & Daily Closing**

Allow:

- Enable Automatic Closing
- Scheduled Closing Time
- Business Timezone
- Cash Verification Preference
- Closing Notifications
- Business-Day Cutoff Configuration

### Example

Automatic Closing: ON

Closing Time: 10:00 PM

Timezone: Asia/Kolkata

At the scheduled business-day cutoff:

1. Determine the correct business session.
2. Execute the closing job through reliable backend infrastructure.
3. Calculate authoritative totals.
4. Save the closing record.
5. Record actual execution time.
6. Mark closing method as Automatic.
7. Leave physical cash verification pending if not performed.
8. Notify the authorised owner.

### Critical Distinction

Store separately:

- Scheduled Cutoff: 10:00 PM
- Actual Job Execution: 10:00:08 PM
- Business Date: 10 October 2026

Never claim that the job executed at the scheduled instant if execution happened later.

Automatic closing must be optional, not enabled unexpectedly.

---

# 12. MY RECOMMENDATION — SOFT CLOSE AND FINAL CLOSE

Use two conceptual stages internally.

### Soft Close / Review

The system prepares a temporary closing summary.

The merchant can inspect it.

No permanent finalisation occurs.

### Final Close

The merchant confirms, or an authorised automatic closing policy executes.

The system creates a durable closing record.

### Advantages

- Prevent accidental closing.
- Allow review of numbers.
- Make cash reconciliation easier.
- Avoid confusing incomplete drafts with final records.

The frontend does not need to expose complicated terminology.

Use simple labels such as:

**Review Today's Hisaab**

and:

**Confirm Close**

---

# 13. BUSINESS DATE AND ACTUAL CLOSING TIME

Support shops that close late at night.

Example:

Shop opens at 9:00 AM.

Shop closes at 1:00 AM the next calendar day.

The merchant may consider this one business day.

Support business-day boundaries independent of calendar midnight.

Store:

- Business Date
- Session Start
- Business Cutoff
- Actual Close Timestamp
- Business Timezone
- Closing Method

Use trusted backend timestamps.

Avoid using the frontend device clock as the authoritative time.

---

# 14. WHAT HAPPENS AFTER SHOP CLOSING?

Closing must define a clear financial boundary.

After closing:

- Previous transactions remain accessible.
- Reports remain accessible.
- Customer histories remain accessible.
- Inventory remains viewable.
- Users may access account settings.
- A new business session can begin according to the configured policy.

### Transactions After Closing

If a merchant starts a new sale after the day is closed, follow a clear workflow:

- Open or start the next valid business session, where authorised.
- Assign the sale to the correct business date.
- Do not silently modify the previous closed report.

### Delayed External Events

Payment webhooks and other genuine external events must still be processed securely.

Use the correct event-time and accounting policies.

Flag adjustments affecting a closed period for reconciliation.

Do not lose legitimate payments because the shop is marked closed.

---

# 15. MY RECOMMENDATION — SMART NEXT-DAY OPENING

Create a companion feature:

**Start Today's Business**

When the owner begins the next business day, show:

- Today's date
- Previous closing time
- Previous expected closing cash
- Previous cash verification status
- Suggested opening cash float

Allow the merchant to confirm actual opening cash.

Do not assume all money from the previous day remains in the drawer.

Example:

Previous Expected Closing Cash: ₹6,700

Owner Withdrew: ₹5,700

New Opening Cash: ₹1,000

Record transfers and withdrawals appropriately.

Keep the daily opening flow optional or automated according to business configuration.

Do not require a complicated opening process merely to view the application.

---

# 16. DAILY CLOSING HISTORY

Create:

**Reports → Daily Closings**

Display historical closing records.

### List Item

10 October 2026

Total Sales: ₹11,000

Closing Time: 10:08 PM

Method: Manual

Status: Completed

### Available Filters

- Today
- Yesterday
- Last 7 Days
- This Month
- Custom Dates

### Actions

- View Closing
- Download PDF
- View Cash Reconciliation
- View Corrections

Use compact mobile-friendly cards.

Do not make merchants navigate through complex report tables.

---

# 17. PREMIUM DAILY CLOSING DETAIL PAGE

Use the DukaanSet V9 simplified detail-page design system.

### Header

Business Date

Actual Closing Time

Closing Status

### Main Summary

Sales

Collections

Outstanding

Cash Position

### Secondary Sections

- Payment Breakdown
- Udhaar Summary
- Cash Matching
- Expenses
- Stock Summary
- Purchase Summary
- Audit Information

Use expandable sections.

Show advanced accounting details only when requested.

Keep all complete records accessible to authorised users.

---

# 18. PREMIUM DAILY CLOSING PDF

Integrate with the existing Smart Invoice Studio document infrastructure.

Use the Premium Modern design.

### Header

- Shop Logo
- Shop Name
- Merchant Contact
- Business Date
- Closing Timestamp
- Report Reference

### Main Financial Summary

- Gross Sales
- Returns / Discounts
- Net Sales
- Total Collections
- New Credit
- Outstanding Balance

### Payment Methods

- Cash
- UPI
- Bank
- Other Methods

### Cash Reconciliation

- Opening Cash
- Cash Inflows
- Cash Outflows
- Expected Closing Cash
- Actual Cash Count
- Difference
- Verification Status

### Additional Sections

- Customer Udhaar
- Expenses
- Supplier Payments
- Low Stock Overview, if selected
- Closing Actor and Method

### Footer

Generated with DukaanSet

### Important

This is a Daily Business Closing Report, not a tax invoice.

The PDF must accurately represent the saved report version.

Do not silently change an older PDF report when financial corrections occur.

Provide a revised report with appropriate revision information.

---

# 19. MY RECOMMENDATION — DAILY SMART INSIGHTS

After closing, show up to three genuinely useful observations.

Examples:

"18 sales were completed today."

"UPI was the most-used recorded payment method."

"Four products are running low."

"₹1,500 of today's sales was recorded as customer credit."

Use actual transaction data.

Avoid generic AI paragraphs.

Avoid invented profit improvements or revenue forecasts.

Use simple shopkeeper-friendly wording.

Keep advanced analytics in Reports.

---

# 20. FUTURE BUSINESS PERFORMANCE REPORTS

Use saved daily closing records to support future trends.

Potential features:

- Last 7 Days Sales
- Monthly Collections
- Customer Outstanding Trends
- Cash Difference Trends
- Payment Method Distribution
- Low Stock Trends
- Business Day Comparisons
- Shop Opening/Closing Consistency

Make these future-ready without overloading the initial feature.

Avoid treating closing snapshots alone as complete accounting books.

Underlying transactions must remain authoritative.

---

# 21. VOICEOS INTEGRATION

Connect Shop Closing to DukaanSet VoiceOS.

### Example Commands

"Aaj ki dukaan close kar do."

"Aaj ki total cash collection kitni hui?"

"Aaj ka closing report dikhao."

"Kal ki closing PDF banao."

### Workflow

Voice Command

→ Identify Intent

→ Resolve Business Session

→ Prepare Closing or Report

→ Show Financial Summary

→ Explicit Confirmation for Final Close

→ Execute Authorised Backend Action

Do not automatically finalise a business day solely because speech recognition detected a command.

---

# 22. OPTIONAL WHATSAPP OWNER REPORT

Integrate with the existing WhatsApp document-sharing architecture.

After closing, allow:

**Share Daily Report**

The owner may share the PDF using supported manual sharing.

If a correctly configured official WhatsApp Business integration exists, support authorised owner-facing delivery under applicable rules.

### Important

Daily closing reports contain sensitive internal business information.

Do not send them to ordinary customers.

Only allow authorised business owners or approved recipients.

Respect applicable messaging permissions and provider limitations.

---

# 23. MULTILINGUAL EXPERIENCE

Use the existing universal DukaanSet language engine.

Supported:

- English
- Hindi
- Hinglish

### Translate Everything

- Close Today
- Review Summary
- Total Sales
- Money Received
- New Udhaar
- Cash Received
- UPI Received
- Expected Cash
- Actual Cash
- Cash Difference
- Closing History
- Automatic Closing
- Closing Completed
- Cash Verification Pending
- Download Report
- Settings
- Confirmation Messages
- Validation Errors
- PDF Headings
- Notifications

Do not create another independent localization system.

Maintain consistent terminology.

Hindi must use Devanagari.

Hinglish must follow the approved Roman-script glossary.

Language changes must never modify numeric values or closing records.

---

# 24. BUSINESS-SPECIFIC CLOSING

Adapt secondary insights to the merchant's business type.

### Grocery

- Daily sales
- Cash and UPI
- Customer dues
- Low-stock items

### Clothing

- Sales
- Payments
- Returned items
- Variant inventory

### Hardware

- Supplier payments
- Customer credit
- Bulk sales
- Received stock

### Fruits and Vegetables

- Weight-based sales
- Cash collections
- Recorded wastage
- Remaining stock

Do not create a completely different closing engine for each business.

Use shared financial logic with relevant business-specific presentation.

---

# 25. MULTI-BUSINESS, MULTI-BRANCH AND STAFF PERMISSIONS

Every business must have independent closing records.

Do not combine records from unrelated merchants.

If the platform supports several branches or cash registers, scope closing appropriately.

### Suggested Roles

Owner:

Can review, close, configure automatic closing and approve corrections.

Manager:

Can close or reconcile if permitted.

Staff:

Can prepare or view permitted records, according to assigned permissions.

Enforce permissions on the backend.

Do not rely solely on hidden UI buttons.

Record the actual actor for every closing and correction.

---

# 26. FINANCIAL ACCURACY AND DATA INTEGRITY

Use authoritative business records.

Use safe monetary arithmetic.

Do not use inaccurate floating-point calculations for financial totals.

Support:

- Split payments
- Partial payments
- Credit sales
- Previous udhaar collection
- Returns
- Refunds
- Customer advances
- Expense classification
- Supplier payments
- Cash deposits
- Cash withdrawals
- Closing adjustments

### Mandatory Invariants

Sales do not equal collections.

Old udhaar payments do not create new sales.

UPI collections do not represent physical cash.

Cash withdrawals do not automatically represent business expenses.

Supplier purchase orders do not equal stock receipts.

Current customer outstanding must reconcile with the ledger.

Closing must never create duplicate sales or payments.

A closing report must be based on a consistent transaction cutoff.

---

# 27. SAFE AUTOMATIC CLOSING ARCHITECTURE

Use reliable server-side scheduling.

Do not depend on:

- Open browser tabs
- Client-side timers
- User device clocks
- Unreliable page refreshes

### Requirements

- Idempotent jobs
- Timezone-aware scheduling
- Business-level isolation
- Duplicate-job prevention
- Safe retry handling
- Transactionally consistent snapshots
- Accurate execution timestamps
- Failure monitoring
- Reconciliation status

If the scheduled closing encounters unresolved critical data issues, mark the session as needing review instead of fabricating a fully completed, reconciled state.

Ensure genuine transactions are not silently discarded.

---

# 28. CLOSING CORRECTIONS AND REOPENING

The system must support authorised corrections.

Example:

A merchant discovers a legitimately missed ₹500 payment after closing.

Provide:

**Review Closing**

or:

**Correct Closed Day**

### Requirements

- Permission check
- Correction reason
- Related transaction
- Original snapshot preservation
- Auditable revised summary
- Updated reconciliation status
- Clear revision history

Do not silently overwrite finalised financial snapshots.

Do not simply delete the previous close and recreate it without history.

Prevent duplicate ledger mutations.

---

# 29. DATABASE DESIGN

Inspect existing schemas first.

Reuse authoritative entities.

Suggested additional models:

## BusinessClosingSettings

- Business ID
- Auto-close enabled
- Closing time
- Timezone
- Business-day configuration
- Cash verification preference
- Notification settings

## BusinessSessions

- Business ID
- Business date
- Session start
- Cutoff time
- Actual close timestamp
- Status
- Closing actor
- Closing method

## DailyClosingSnapshots

- Session ID
- Calculation version
- Sales totals
- Payment totals
- Outstanding summary
- Expense totals
- Cash movement totals
- Source cutoff metadata
- Snapshot timestamp

## CashReconciliations

- Closing ID
- Expected cash
- Counted cash
- Difference
- Verification status
- Verification actor
- Verification time

## ClosingCorrections

- Closing reference
- Adjustment reference
- Correction reason
- Actor
- Timestamp
- Revision metadata

Use appropriate constraints and indexes.

Do not duplicate customer ledgers or inventory records in closing tables.

---

# 30. PREMIUM DASHBOARD INTEGRATION

Add a contextual Shop Closing card to the redesigned Home Dashboard.

### When Open

**Shop Open**

Today's Hisaab

Primary Action:

Close Today

### After Closing

**Today's Accounts Closed**

Closing Time: 10:08 PM

Action:

View Report

### Automatic Closing Enabled

Display the configured cutoff when helpful.

### Cash Verification Pending

Show one relevant reminder without making the entire dashboard appear broken.

Avoid repeatedly displaying the same closing information in many sections.

---

# 31. LOADING, EMPTY AND ERROR STATES

Handle:

- No sales today
- No payment activity
- Only credit sales
- Only UPI collections
- Zero outstanding
- No expenses
- Cash not counted
- Pending unsaved sale
- Already closed business session
- Failed closing calculation
- Scheduled job failure
- Network interruption
- Insufficient permissions
- Late financial adjustment
- Multiple concurrent closing attempts

A business day with zero sales can still be closed legitimately.

Do not generate fabricated entries.

Provide clear, localized messages and recovery actions.

---

# 32. REAL-WORLD FINANCIAL DEMO

Create an isolated fictional test business.

### Business

Sharma Fashion Store

### Business Day

10 October 2026

### Sales

Cash sales: ₹6,000

UPI sales: ₹3,500

New udhaar sales: ₹1,500

**Total Sales: ₹11,000**

### Previous Udhaar Collections

Cash: ₹400

UPI: ₹600

**Old Udhaar Collected: ₹1,000**

### Total Collections

Cash: ₹6,400

UPI: ₹4,100

**Total Money Received: ₹10,500**

### Customer Outstanding

Opening: ₹3,000

New Credit: +₹1,500

Collections Against Old Credit: −₹1,000

**Closing Outstanding: ₹3,500**

### Cash Drawer

Opening Cash: ₹1,000

Cash In: ₹6,400

Cash Expenses: ₹700

Expected Closing Cash: ₹6,700

Actual Counted Cash: ₹6,650

**Cash Difference: −₹50**

### Demo Workflow

1. Open the dashboard.
2. Tap Close Today.
3. View financial summary.
4. Expand payment breakdown.
5. Review customer outstanding.
6. Open Cash Matching.
7. Enter actual counted cash.
8. View the shortfall.
9. Confirm closing.
10. View success state.
11. Verify actual closing timestamp.
12. Open closing history.
13. Download the closing PDF.
14. Begin the next business day.
15. Test scheduled automatic closing.
16. Verify pending cash reconciliation.
17. Test a legitimate correction after closing.

All calculations must be performed by the real implementation using seeded records.

Do not hardcode the displayed results into production components.

---

# 33. AUTOMATED TESTING

Create tests for:

### Financial Calculations

- Cash sales
- UPI sales
- Split payments
- Credit sales
- Previous dues collection
- Partial payments
- Customer advances
- Refunds
- Returns
- Expenses
- Supplier payments
- Cash withdrawals
- Cash differences

### Session Management

- Manual closing
- Automatic closing
- Business-day cutoff
- Shops closing after midnight
- Repeated closing requests
- Concurrent transactions
- Delayed events
- Next-day opening
- Corrections and revisions

### Security

- Owner permissions
- Manager permissions
- Staff restrictions
- Cross-business isolation
- Sensitive report access

### Documents

- Accurate PDF report
- Historical version consistency
- Correct timezone
- Correct branding
- English
- Hindi
- Hinglish

### UX

- Mobile closing screen
- Cash entry
- Review and confirmation
- Loading state
- Error recovery
- Closing history
- Dashboard state change

Use actual test results.

Do not claim successful verification without running relevant tests.

---

# 34. CI/CD AND STAGING REQUIREMENTS

Implement inside the existing DukaanSet repository.

Follow the established workflow:

feature/* → dev → main

Run:

- Type checking
- Linting
- Financial unit tests
- Integration tests
- Scheduling tests
- Closing-state tests
- Tenant-isolation tests
- Localization validation
- PDF generation checks
- Build verification
- Relevant end-to-end tests

Verify the feature in the configured staging environment.

If the selected hosting runtime cannot reliably execute scheduled closing jobs, introduce an appropriate durable scheduler or worker infrastructure.

Keep staging and production financial data isolated.

Never claim deployment is complete without verification.

---

# 35. IMPLEMENTATION PRIORITY

## PHASE 1 — CORE DAILY CLOSING

Build:

- Dashboard Close Today action
- Daily financial calculations
- Premium closing screen
- Manual confirmation
- Saved closing snapshots
- Closing history
- Accurate timestamps

## PHASE 2 — CASH RECONCILIATION

Build:

- Opening cash
- Cash movement calculation
- Expected cash
- Actual counted cash
- Cash differences
- Verification states

## PHASE 3 — AUTOMATIC CLOSING

Build:

- Closing schedule settings
- Reliable backend scheduler
- Automatic closing records
- Safe job retries
- Pending reconciliation
- Owner notifications

## PHASE 4 — REPORTING AND OPENING

Build:

- Premium PDF
- Daily closing history
- Next-day opening
- Audited corrections
- Daily insights
- Multilingual support

## PHASE 5 — PREMIUM INTEGRATIONS

Build:

- VoiceOS commands
- Optional owner WhatsApp report
- Business-specific insights
- Future shift/register architecture
- Weekly and monthly trends

Keep the essential experience usable throughout implementation.

---

# 36. FINAL ACCEPTANCE CRITERIA

Do not consider this feature complete until:

1. The shopkeeper can manually close the business day.
2. All daily sales are calculated accurately.
3. Cash and UPI collections are separate and correct.
4. Old udhaar collections are not counted as new sales.
5. Split payments are not double-counted.
6. New credit and current outstanding are accurate.
7. Cash matching is supported.
8. Cash verification can remain pending.
9. Closing date and actual time are saved.
10. Scheduled automatic closing works when enabled.
11. Scheduled cutoff and actual execution time are distinct.
12. Business days crossing midnight are handled correctly.
13. The same session cannot be finalised twice unintentionally.
14. Late transactions follow a clear reconciliation policy.
15. Original closing snapshots are preserved.
16. Corrections remain auditable.
17. Daily history works.
18. Premium PDF reports work.
19. Next-day opening works.
20. Multi-business data remains isolated.
21. Role permissions are enforced.
22. English, Hindi and Hinglish work throughout.
23. VoiceOS requires confirmation before finalising closing.
24. Mobile experience is simple and polished.
25. Dashboard state updates correctly.
26. Financial invariants pass automated tests.
27. Actual staging behaviour is verified where available.

Document any unresolved limitations.

---

# FINAL EXECUTION DIRECTIVE

Implement DukaanSet Smart Shop Closing in the EXISTING DukaanSet application.

Do not build a disconnected daily sales calculator.

Use authoritative financial and inventory records.

Build a premium, clean, mobile-first experience.

Support manual and optional automatic daily closing.

Calculate sales, collections, customer outstanding, cash movements, expenses and reconciliation accurately.

Save:

- Business date
- Scheduled cutoff, if applicable
- Actual closing timestamp
- Closing method
- Closing actor
- Financial snapshot
- Cash verification status
- Audit metadata

Provide a premium Daily Closing PDF.

Make closing history accessible.

Support next-day opening and authorised historical corrections.

Integrate with VoiceOS, Smart Invoice Studio, the redesigned Dashboard and the universal language engine.

Never double-count transactions.

Never invent financial values.

Never mark physical cash verified without verification.

Never silently rewrite historical closing records.

Never confuse closing today's accounts with deleting or disabling a shop.

## FINAL PRIMARY USER JOURNEY

**Home → Close Today → Review Hisaab → Cash Check → Confirm → Report Saved.**

## FINAL AUTO-CLOSING JOURNEY

**Scheduled Cutoff → Consistent Calculation → Closing Saved → Owner Notified → Cash Verification When Available.**

## FINAL DESIGN PRINCIPLE

**Shopkeeper Se Kam Se Kam Kaam. System Se Maximum Accurate Calculation.**

## PRODUCT PROMISE

**DukaanSet — Din Bhar Dukaan Chalao. Raat Ko Hisaab Apne Aap Set.**

**BEGIN COMPLETE IMPLEMENTATION IN THE EXISTING DUKAANSET REPOSITORY. DO NOT STOP AT PLANNING OR MOCKUPS.**
