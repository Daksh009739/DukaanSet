# DUKAANSET V9 — ULTIMATE PREMIUM DASHBOARD & SIMPLIFIED DETAIL PAGES MASTER PROMPT

## COMPLETE AUTHENTICATED APPLICATION UI/UX TRANSFORMATION

### Build an Exceptionally Modern, Premium, Minimal, Mobile-First and Easy-to-Understand Business Management Experience

---

# PROJECT IDENTITY

**Product Name:** DukaanSet

**Tagline:** Apni Dukaan, Sab Set.

**Application Type:** AI-Powered, Multi-Tenant, Multi-Business SaaS Platform

**Target Audience:** Nontechnical Indian shopkeepers and small-business owners.

**Primary Objective:** Redesign the existing authenticated Home Dashboard and all business detail pages to eliminate confusion, reduce visual clutter, improve navigation, and deliver an exceptionally polished SaaS product experience.

### Pages to Redesign

- Home Dashboard
- Customer Detail
- Sales/Bill Detail
- Inventory/Product Detail
- Purchase Detail
- Supplier Detail
- Payment Detail
- Related transaction and ledger detail screens

### CORE DESIGN PHILOSOPHY

**SHOW LESS. EXPLAIN BETTER. ACT FASTER.**

The application must remain powerful internally while appearing extremely simple to the shopkeeper.

---

# 1. YOUR ROLE

Act as an elite multidisciplinary product team:

- Principal Product Designer
- Senior SaaS UX Architect
- Senior UI Designer
- Mobile Product Designer
- Design System Architect
- Senior Full-Stack Engineer
- React/Next.js Specialist
- Financial Software UX Specialist
- Accessibility Engineer
- QA Automation Engineer
- Product Usability Specialist

Your assignment is to redesign and implement the existing DukaanSet application's authenticated dashboard and detail-page experience.

This is an implementation task.

Do not stop at UI suggestions or mockups.

Inspect the actual repository, understand the existing architecture, update the relevant components, and verify all redesigned screens in a browser.

Do not create an unrelated application.

Do not replace functioning backend services unnecessarily.

Preserve all existing business logic, data, authentication, role permissions, multi-tenant isolation and database relationships.

---

# 2. UNDERSTAND THE REAL PROBLEM

The current DukaanSet application has multiple detail pages containing excessive information, complicated layouts, inconsistent actions and unclear visual hierarchy.

Examples include:

- Customer Details
- Bill Details
- Stock Details
- Purchase Details
- Supplier Details
- Payment Details

These pages currently feel difficult for a normal user to understand.

The Home Dashboard also needs a complete visual and usability transformation.

A nontechnical shopkeeper should not have to spend time understanding where important information is located.

### USER EXPERIENCE TARGET

When a shopkeeper opens a page, they should immediately understand:

1. What am I looking at?
2. What is the current status?
3. What information matters most?
4. What should I do next?

The interface must answer these questions without requiring excessive scrolling or exploration.

---

# 3. MANDATORY EXISTING PROJECT AUDIT

Before changing code, inspect:

- Current authenticated dashboard
- Existing sidebar and mobile navigation
- Customer detail routes
- Sales detail routes
- Product detail routes
- Purchase detail routes
- Supplier detail routes
- Payment detail routes
- Existing UI component library
- Existing design tokens
- API and backend integration
- Current translation system
- Authentication and permissions
- Loading and error handling
- Mobile layouts

Identify:

- Unnecessary cards
- Repeated data
- Confusing headings
- Too many visible buttons
- Inconsistent status badges
- Unclear payment terminology
- Technical information exposed unnecessarily
- Poor grouping of data
- Excessive scrolling
- Broken alignment
- Weak visual hierarchy
- Awkward mobile layouts
- Unnecessary navigation steps

Create a practical implementation checklist.

Then implement the changes.

Do not assume the existing public-website design accurately represents authenticated pages.

Inspect the actual authenticated application.

---

# 4. FINAL PREMIUM DESIGN DIRECTION

The redesigned application should feel like a premium modern SaaS workspace.

### Visual Character

- Clean
- Sophisticated
- Minimal
- Professional
- Calm
- Trustworthy
- Fast
- Mobile-first
- Intuitive

### Brand Colours

Primary Deep Teal: `#103B36`

Mint Accent: `#22C99D`

Off-White Background: `#F7FAF8`

Primary Text: `#1A2624`

Secondary Text: `#687B75`

Warm Amber: `#F5B942`

Border Colour: `#E4ECE8`

White: `#FFFFFF`

Use semantic design tokens for success, warning, error and neutral states with accessible text contrast.

### Typography

Use the established DukaanSet typography system.

Recommended:

- Manrope or Plus Jakarta Sans for headings.
- Inter for interface text.
- Noto Sans Devanagari for Hindi.

### Design Requirements

- Strong typography hierarchy
- Elegant compact cards
- Professional iconography
- Consistent border radius
- Appropriate whitespace
- Subtle shadows
- Meaningful status colours
- Carefully styled financial figures
- Lightweight microinteractions
- Premium empty states
- Smooth responsive behaviour

Avoid oversized decorative cards, unnecessary gradients, heavy glass effects and excessive animation.

---

# 5. CREATE A UNIVERSAL DETAIL PAGE SYSTEM

Build a shared design structure that every important detail page follows.

## STANDARD DETAIL PAGE STRUCTURE

### SECTION A — COMPACT HEADER

Display:

- Back navigation
- Entity name
- Small status badge
- Relevant primary action
- More Options menu, where appropriate

Do not waste excessive vertical space on enormous headings.

### SECTION B — MAIN SUMMARY

Show the most important information prominently.

Prefer two to four meaningful values.

Do not show the same information repeatedly in multiple cards.

### SECTION C — QUICK ACTIONS

Show the user's most common actions.

Prioritise one main action.

Keep secondary actions visible only when useful.

### SECTION D — ESSENTIAL DETAILS

Show the information required for normal everyday decisions.

### SECTION E — RECENT ACTIVITY

Display a short preview of recent records.

Provide access to complete history.

### SECTION F — ADVANCED INFORMATION

Use:

- Expandable sections
- Tabs
- Secondary panels
- Bottom sheets
- More Options menus

Do not permanently remove advanced data.

### GOLDEN RULE

A detail page should feel simple even when its underlying database contains hundreds of records.

---

# 6. COMPLETE HOME DASHBOARD TRANSFORMATION

The Home Dashboard is the most important screen after login.

It must become the primary command centre for everyday shop operations.

However, it should not feel like a complicated enterprise analytics dashboard.

## MAIN PURPOSE

The dashboard must immediately answer:

- How much did I sell today?
- How much money came in?
- How much money is still pending?
- Which products need attention?
- What should I do next?

Use real authorised business data.

---

# 7. NEW HOME DASHBOARD LAYOUT

## A. SMART PERSONALIZED HEADER

Display:

- Appropriate greeting
- Active shop name
- Shop switcher
- Language selector
- Notification icon
- Profile avatar

Suggested English presentation:

**Good Morning!**

Here's your shop at a glance.

Use the selected display language.

Do not unnecessarily repeat the shop name and category across multiple cards.

## B. BUSINESS SUMMARY

Show four primary business metrics.

### Today's Sales

Actual value of completed sales in the relevant business period.

### Money Received

Actual collections for the period.

### Money to Collect

Current outstanding customer receivables.

### Low Stock

Number of products or variants requiring stock attention.

### IMPORTANT ACCOUNTING RULE

Today's Sales and Money Received are not necessarily equal.

Customer outstanding and supplier payable balances must not be mixed.

All metrics must use authoritative backend data and consistent definitions.

### Card Design

Use compact premium cards.

Highlight values more than labels.

Support appropriate trend indicators only when actual comparison data exists.

Avoid decorative statistics.

---

# 8. DASHBOARD QUICK ACTIONS

Create a prominent section:

**Quick Actions**

Show:

- New Sale
- Add Stock
- Add Payment
- More Actions

Each action should use a simple icon and understandable label.

Make New Sale the visually strongest default action where appropriate.

Keep actions comfortably tappable.

Do not place 10–15 equally prominent buttons on the dashboard.

### BUSINESS PERSONALIZATION

For clothing businesses, prioritise sales and variant stock.

For grocery stores, prioritise fast billing and stock.

For hardware businesses, prioritise purchases and customer payments.

For vegetable sellers, prioritise quantity, daily prices and wastage.

Use business-specific configuration without creating unrelated dashboard implementations.

---

# 9. SMART TODAY'S WORK SECTION

Create a compact section:

**Today's Work**

This should display actionable business tasks rather than generic notifications.

Examples:

"3 customers have pending payments."

"4 products are running low."

"2 customers requested unavailable products."

"One supplier purchase is awaiting stock receipt."

Each task must show a relevant action.

Examples:

- Collect Payment
- Review Stock
- View Demand
- Receive Stock

### SMART PRIORITIZATION

Prioritise:

1. Important operational issues.
2. Payment collection opportunities.
3. Low stock.
4. DemandPulse follow-ups.
5. Other contextual reminders.

Avoid displaying the same task repeatedly.

Show only a short list by default.

Provide View All.

Do not invent tasks or AI-generated figures.

---

# 10. DASHBOARD RECENT ACTIVITY

Create a clean Recent Activity section.

Examples:

- Sale completed
- Customer payment received
- Stock received
- Purchase recorded
- Demand request added

Display:

- Small event icon
- Short description
- Amount or quantity
- Date or relative time
- Relevant status

Show only a few recent events initially.

Provide View All.

Do not show a giant transaction table on the homepage.

---

# 11. SMART BUSINESS INSIGHTS

Add one compact contextual insight when reliable business data supports it.

Examples:

"Blue Shirt XL has recorded unmet demand."

"Milk stock is running low."

"Three customers have overdue payments."

Provide one clear action.

Do not fill the dashboard with unnecessary AI cards.

Do not generate fake predictions.

If there is no useful insight, hide the section.

---

# 12. CUSTOMER DETAIL PAGE — COMPLETE REDESIGN

This is one of the highest-priority pages.

## GOAL

When a shopkeeper opens a customer profile, they should immediately understand:

- Customer identity
- Total shopping
- Money received
- Money pending
- Recent purchases
- Next useful action

## HEADER

Show:

**Customer Name**

Phone number where available.

Optional customer reference.

Small status indicator if useful.

Avoid showing excessive account metadata.

## MAIN FINANCIAL SUMMARY

Display three meaningful values:

### Total Shopping

Actual customer purchases according to the defined reporting period and adjustment rules.

### Money Received

Actual recorded customer payments.

### Money Pending

Current amount receivable from the customer.

Use consistent ledger definitions.

Consider opening balances, credits, refunds and adjustments.

Do not calculate outstanding as a simple difference between lifetime sales and lifetime payments when historical accounting conditions require more.

## MAIN ACTIONS

Show:

**New Sale**

**Add Payment**

**Generate PDF**

Move rarely used actions into More Options.

---

# 13. CUSTOMER HISTORY — MAKE IT EASY TO UNDERSTAND

Replace complicated tables with a readable chronological activity timeline.

### Example

**9 October**

Blue Casual Shirt × 2

Bill: ₹1,798

Paid: ₹1,500

Remaining: ₹298

---

**5 October**

Cash Payment Received

₹1,000

---

**2 October**

Denim Jeans × 1

Bill: ₹1,299

Each event should have:

- Clear activity type
- Date
- Short description
- Amount
- Relevant payment status
- Tap-to-view details

Display the latest few records first.

Provide View All History.

Do not display every transaction immediately.

---

# 14. CUSTOMER DETAIL TABS

Use a maximum of three primary tabs initially:

### Activity

Combined purchase and payment timeline.

### Bills

Individual invoices and document actions.

### Hisaab

Outstanding amounts, payments and complete customer account information.

Use clear tab names in all supported languages.

Avoid creating seven or eight tabs.

Place additional information such as addresses, notes and DemandPulse history in relevant expandable sections.

---

# 15. CUSTOMER SMART ACTIONS

The page should react to actual customer state.

### If Money Is Pending

Display:

**₹1,298 to Collect**

Primary contextual action:

**Add Payment**

### If No Money Is Pending

Display:

**No Pending Balance**

Do not display misleading payment warnings.

### If Customer Has a Credit Balance

Use an accurate label for money held as customer credit.

Do not show a negative amount as ordinary overdue udhaar.

### If Customer Has Recent Purchases

Provide:

**View Latest Bill**

### If Customer Has Multiple Purchases

Provide:

**Generate Hisaab PDF**

These actions must use real customer data.

---

# 16. SMART INVOICE STUDIO INSIDE CUSTOMER DETAILS

Integrate the existing Smart Invoice Studio.

When the merchant taps:

**Generate PDF**

Open a compact bottom sheet.

Show:

1. Individual Bill
2. Customer Hisaab
3. Payment Receipt

### Individual Bill

Choose an existing invoice.

### Customer Hisaab

Choose the date range.

### Payment Receipt

Choose an existing payment.

Do not require the shopkeeper to re-enter customer or transaction details.

Reuse actual financial records.

PDF generation must not create another invoice or payment.

---

# 17. BILL DETAIL PAGE — PREMIUM FINANCIAL SUMMARY

Redesign the Bill Details page completely.

## HEADER

Show:

Invoice Number

Date

Customer Name

Payment Status

## MAIN SUMMARY

Highlight:

### Total Bill

### Amount Received

### Balance Due

Use clean typography and strong financial hierarchy.

## PRODUCTS

Show readable product rows.

Each row includes:

- Product name
- Variant
- Quantity
- Unit price
- Total

Avoid complicated wide tables on mobile.

## PRIMARY ACTIONS

Display contextually:

- Download PDF
- Share on WhatsApp
- Add Payment, if applicable

### PAYMENT STATUS

Use understandable labels:

- Paid
- Partially Paid
- Unpaid
- Refunded, where applicable

### ADVANCED DETAILS

Place below expandable headings:

- Discount breakdown
- Tax breakdown
- Payment allocations
- Notes
- Adjustments
- Audit information

Preserve historical invoice accuracy.

Later payments may change the current balance and status, but must not silently rewrite the original issued invoice.

---

# 18. BILL DETAIL PAGE — WHATSAPP INTEGRATION

Connect the existing WhatsApp Invoice Delivery feature.

When the shopkeeper taps WhatsApp:

1. Select the existing invoice.
2. Retrieve the linked customer.
3. Retrieve the appropriate contact number.
4. Prepare the real Premium Modern invoice PDF.
5. Show the recipient preview.
6. Use the supported sharing or authorised direct-delivery workflow.

If WhatsApp Business API is configured, enable permitted direct delivery.

Otherwise, offer supported manual PDF sharing.

Do not falsely claim a PDF was automatically delivered.

Sharing must never modify stock, payments or invoice totals.

---

# 19. STOCK / PRODUCT DETAIL PAGE — COMPLETE SIMPLIFICATION

The product page must immediately answer:

- What is this product?
- How much stock is available?
- What is its price?
- Do I need to add stock?
- What happened to its stock recently?

## HEADER

Show:

- Product thumbnail
- Product name
- Category
- Variant or unit
- Stock status

## MAIN STOCK SUMMARY

Create one visually prominent stock card.

Example:

**Available Stock**

**24 pieces**

Show low-stock or out-of-stock status only where applicable.

## PRODUCT INFORMATION

Show:

- Selling Price
- Purchase Cost, if authorised
- Current Stock
- Unit
- Relevant variant

Do not show technical database fields.

## QUICK ACTIONS

- Add Stock
- New Sale
- More Options

If unavailable:

**Nahi Mila?**

Open DemandPulse with the product preselected.

---

# 20. STOCK MOVEMENT TIMELINE

Display the latest stock movements.

Examples:

**+10 pieces**

Stock Added

**−2 pieces**

Sold

**+1 piece**

Return Accepted

**−1 piece**

Damaged Stock Adjustment

Use clear quantity signs and activity labels.

Show dates.

Provide View All History.

Do not overwhelm the initial page with hundreds of movement records.

### VARIANTS

If the product has variants such as size or colour, show a compact variant stock summary.

Example:

Blue Shirt:

M — 4

L — 3

XL — 0

Variant quantities must remain independently accurate.

---

# 21. PURCHASE DETAIL PAGE — COMPLETE REDESIGN

This page must clearly distinguish:

- What was ordered.
- What was received.
- What was paid.
- What is pending.

## HEADER

Display:

Purchase Reference

Supplier

Date

Purchase Status

## MAIN SUMMARY

Show:

### Total Purchase

### Amount Paid

### Payment Pending

### Goods Received Status

## ITEMS SECTION

For each item show:

- Product
- Ordered Quantity
- Received Quantity
- Unit Cost
- Total

Use concise rows or cards.

## CONTEXTUAL PRIMARY ACTION

If awaiting goods:

**Receive Stock**

If goods are received but supplier payment remains:

**Add Payment**

If completed:

**View Purchase Summary**

Only show actions valid for the current purchase state and user's permissions.

---

# 22. PURCHASE ACTIVITY TIMELINE

Show actual progress.

Example:

Purchase Created

↓

Goods Partially Received

↓

Remaining Goods Received

↓

Supplier Payment Recorded

↓

Purchase Completed, where applicable

Use simple status components.

Do not fake progress for events that have not occurred.

### IMPORTANT BACKEND RULE

Creating a purchase order must not increase inventory.

Confirmed stock receiving must update inventory.

Supplier payments must update supplier ledgers.

Do not mix these operations.

---

# 23. SUPPLIER DETAIL PAGE

Apply the same premium and simplified system.

Display:

- Supplier name
- Phone number
- Total relevant purchases
- Amount paid
- Amount payable
- Recent purchase activity

Primary actions:

- New Purchase
- Add Payment
- View History

Separate supplier payables from customer receivables.

Use clear terminology.

Keep advanced supplier information expandable.

---

# 24. PAYMENT DETAIL PAGE

Redesign the Payment Details page.

Display:

### Main Amount

Prominently show the payment amount.

### Essential Information

- Customer or supplier
- Payment method
- Date
- Related invoice or purchase
- Payment status
- Transaction reference where applicable

Provide:

- View Linked Invoice
- Generate Payment Receipt
- Relevant authorised actions

Move internal references and audit information into Advanced Details.

Do not introduce unsafe direct editing of completed financial records.

Use the application's proper correction or reversal workflows.

---

# 25. SMART CONTEXTUAL ACTION ENGINE

This is an important recommendation.

Do not show the same buttons on every page regardless of the current situation.

The application should determine relevant actions from actual state and permissions.

### Examples

Customer has outstanding money:

Show **Add Payment** prominently.

Invoice is fully paid:

Emphasise **Download PDF** and **Share**.

Product is out of stock:

Show **Add Stock** and **Nahi Mila?**

Purchase is awaiting delivery:

Show **Receive Stock**.

Purchase has unpaid balance:

Show **Add Supplier Payment**.

Customer has many purchases:

Make **Generate Hisaab** easy to find.

### Implementation

Use a reusable contextual-action configuration layer.

Determine visible actions from:

- Entity type
- Entity status
- Business type
- Current user permissions
- Available integrations

Do not rely on hidden buttons as the only form of authorisation.

All mutations must be validated on the backend.

---

# 26. ONE-SCREEN CLARITY — CRITICAL UX REQUIREMENT

For common mobile screen sizes, prioritise showing the following above or near the first fold:

- Page title
- Current status
- Most important amount or quantity
- Primary action

Do not promise that every screen size can fit every secondary field without scrolling.

The goal is to ensure that the first visible screen answers the user's main question.

### Example — Customer

Name

Pending Amount

Add Payment

Recent Activity

### Example — Bill

Invoice Number

Total

Payment Status

Download PDF

### Example — Product

Product Name

Available Stock

Add Stock

### Example — Purchase

Supplier

Receiving Status

Pending Amount

Next Action

Do not sacrifice text readability to fit an arbitrary screen height.

---

# 27. PROGRESSIVE DISCLOSURE

Advanced information must remain accessible without cluttering the default view.

Use:

- Show More
- View All
- Expand Details
- Advanced Information
- More Options

Avoid deeply nested menus.

Commonly used information should not require several taps.

### RULE

Frequently needed information = visible.

Occasionally needed information = expandable.

Rare administrative controls = More Options.

---

# 28. PREMIUM MOBILE BOTTOM SHEETS

Use compact bottom sheets for short workflows.

Examples:

- Add Payment
- Add Stock
- Generate PDF
- Select Date Range
- Record Demand
- Choose Customer
- Select Product Variant

### Requirements

- Clear title
- Minimal fields
- Large touch targets
- Fixed or easily accessible primary action
- Correct keyboard handling
- Loading feedback
- Cancel and close controls
- Accessible focus behaviour
- Form-state preservation

Avoid opening one bottom sheet inside another repeatedly.

Use dedicated pages for workflows that genuinely require more space.

---

# 29. SMART VOICEOS INTEGRATION

Use the existing VoiceOS system contextually.

Do not overload each detail page with multiple microphone buttons.

Provide one appropriately positioned voice action where useful.

Examples:

### Customer

"Rahul ke 500 rupaye payment record karo."

### Bill

"Is bill ka PDF dikhao."

### Stock

"Is product ke 10 pieces add karo."

### Purchase

"Is purchase ka supplier payment record karo."

### DemandPulse

"Customer ko XL shirt chahiye thi, available nahi thi."

VoiceOS must prefill an editable draft.

Financial or inventory mutations require explicit confirmation.

Do not duplicate the underlying business services.

---

# 30. BUSINESS-SPECIFIC PERSONALIZATION

DukaanSet supports multiple business categories.

Use the same core design system with relevant information adapted to each shop type.

## Clothing

Prioritise:

- Size
- Colour
- Variant stock
- Sales
- Returns

## Grocery

Prioritise:

- Available quantity
- Pack size
- Fast billing
- Credit customers
- Low stock

## Hardware

Prioritise:

- Units
- Bulk quantities
- Purchases
- Suppliers
- Contractor balances

## Vegetables

Prioritise:

- Weight
- Current price
- Stock
- Wastage
- Daily sales

Do not create separate inconsistent page designs for every category.

Use data-driven configuration.

---

# 31. THREE-LANGUAGE SUPPORT

Every redesigned page must follow DukaanSet's global language selection.

Supported:

- English
- Hindi in Devanagari
- Hinglish in Roman script

Translate:

- Headings
- Buttons
- Summary labels
- Payment statuses
- Empty states
- Validation messages
- Activity descriptions
- Quick actions
- Bottom sheets
- Notifications
- Errors

### Examples

English:

Money to Collect

Hindi:

लेने वाले पैसे

Hinglish:

Paise Lene Hain

English:

Add Stock

Hindi:

सामान जोड़ें

Hinglish:

Stock Jodo

English:

Recent Activity

Hindi:

हाल की गतिविधियाँ

Hinglish:

Recent Activity

Do not hardcode mixed-language system strings.

Preserve original customer names and business data.

Language switching must not discard active drafts.

---

# 32. EMPTY STATES, LOADING STATES AND ERRORS

Create polished states for every page.

## Empty Customer History

"No purchases yet."

Offer a relevant New Sale action.

## Empty Stock History

"No stock movements recorded yet."

## No Supplier Payments

"No payments recorded."

## No Outstanding Balance

Display a calm positive state.

## Loading

Use skeleton components shaped like the actual page.

## Error

Display a clear explanation and Retry action.

Do not show blank pages.

Do not expose technical error details.

All messages must be localized.

---

# 33. MICROINTERACTIONS AND ANIMATION

Use subtle premium motion.

Recommended:

- Smooth tab switching
- Expand/collapse transitions
- Bottom-sheet opening
- Button feedback
- Loading-to-content transition
- Successful action feedback
- Status updates
- Lightweight number changes

Avoid:

- Excessive bounce
- Aggressive parallax
- Distracting glowing effects
- Heavy 3D scenes
- Unnecessary animation delays

Respect reduced-motion preferences.

The dashboard must feel responsive rather than animated for decoration.

---

# 34. PREMIUM DESKTOP EXPERIENCE

Desktop pages must look like a sophisticated SaaS product.

Use:

- Professional sidebar
- Balanced content width
- Clear page headings
- Responsive grids
- Useful whitespace
- Consistent cards
- Compact activity lists
- Clean financial sections

Avoid stretching small cards across excessive screen width.

Avoid huge empty spaces.

Do not make every page a collection of large independent boxes.

Prefer coherent sections and visual grouping.

---

# 35. ACCESSIBILITY REQUIREMENTS

Implement:

- Clear contrast
- Keyboard navigation
- Visible focus indicators
- Semantic headings
- Accessible buttons
- Proper form labels
- Screen-reader announcements
- Accessible tab controls
- Accessible bottom sheets
- Touch-friendly interactions
- Reduced-motion support

Test relevant layouts in English, Hindi and Hinglish.

Do not use colour alone to communicate payment or stock status.

---

# 36. REAL BACKEND CONNECTIONS

This redesign must use existing authoritative services.

Do not use fake frontend-only values.

Preserve:

- Customer ledger accuracy
- Inventory movement accuracy
- Purchase receiving logic
- Payment allocations
- Invoice history
- Product variants
- Tenant isolation
- Role permissions
- Audit trails

### MUTATION SAFETY

After saving a real transaction:

- Wait for backend confirmation.
- Refresh affected information.
- Avoid duplicate submissions.
- Preserve correct balances.
- Display accurate success or error feedback.

Do not introduce new client-side accounting logic that conflicts with backend calculations.

---

# 37. REUSABLE UI COMPONENTS

Create a unified set of components.

Recommended:

- DashboardShell
- DashboardGreeting
- BusinessSwitcher
- MetricCard
- QuickActionGrid
- TodayTasks
- RecentActivityList
- DetailPageLayout
- CompactDetailHeader
- EntitySummaryCard
- FinancialSummary
- StatusBadge
- SmartActionBar
- ContextualAction
- DetailTabs
- ActivityTimeline
- TransactionRow
- ProductMovementRow
- PurchaseProgress
- ExpandableSection
- MoreOptionsMenu
- MobileBottomSheet
- EmptyState
- ErrorState
- LoadingSkeleton

Keep components reusable and maintainable.

Do not create one oversized component with dozens of unrelated conditions.

---

# 38. COMPLETE UX QUALITY REVIEW

After implementing each page, inspect the rendered application.

Ask:

- Can a new user understand this page quickly?
- Is the most important information obvious?
- Are the main actions easy to find?
- Is there unnecessary information?
- Is the page too long?
- Are repeated cards making it confusing?
- Are payment terms understandable?
- Are statuses visually clear?
- Does it work properly on mobile?
- Does it look consistent with DukaanSet branding?

Use these questions to guide further refinement.

Do not stop after a superficial CSS update.

---

# 39. MOBILE RESPONSIVENESS

Test at:

- 320px
- 360px
- 375px
- 390px
- 412px
- 430px
- 768px
- 1024px
- 1440px

Verify:

- No horizontal scrolling
- No clipped financial values
- No overlapping actions
- No broken tabs
- No inaccessible buttons
- No oversized headers
- No keyboard overlap
- No hidden confirmation controls
- Correct Hindi text rendering

Treat mobile as the primary product experience.

Desktop is a responsive extension, not the sole design target.

---

# 40. AUTOMATED TESTING

Use the project's existing testing tools.

Add tests for:

## Dashboard

- Correct metrics
- Quick actions
- Business switching
- Today's Work
- Recent activities

## Customers

- Correct outstanding balance
- Customer history
- Activity tabs
- Payment actions
- Generate PDF

## Bills

- Invoice totals
- Payment status
- Product rows
- PDF action
- WhatsApp action

## Inventory

- Stock quantity
- Variant stock
- Stock movement history
- Add Stock
- DemandPulse action

## Purchases

- Order quantities
- Received quantities
- Payment status
- Receive Stock
- Supplier payments

## General

- Permissions
- Multilingual support
- Mobile navigation
- Bottom sheets
- Loading states
- Empty states
- Error handling
- Duplicate submission protection
- Business isolation

Use visual regression testing where practical.

Report actual results.

---

# 41. USER ACCEPTANCE SCENARIOS

Implement and test these real-world flows.

### Scenario A — Customer Payment

A shopkeeper opens Rahul Sharma's customer profile.

They immediately see the outstanding amount.

They tap Add Payment.

They enter the amount.

They save it.

The customer balance updates correctly.

### Scenario B — Bill Download

A shopkeeper opens an invoice.

They immediately see total, received and pending amounts.

They tap Download PDF.

The original authorised invoice is downloaded.

No duplicate sale is created.

### Scenario C — Stock Refill

A shopkeeper opens an out-of-stock product.

They see stock quantity zero.

They tap Add Stock.

They record received stock.

The product quantity updates correctly.

### Scenario D — Purchase Receiving

A shopkeeper opens a purchase.

They immediately see the supplier, ordered items and pending receipt status.

They receive the products.

Inventory updates appropriately.

### Scenario E — Dashboard

The owner logs in.

They immediately understand today's sales, collections, outstanding customer money, stock alerts and important tasks.

All values must come from real records.

---

# 42. GITHUB CI/CD AND VERCEL STAGING

Work inside the existing DukaanSet codebase.

Use the established branching strategy:

`feature/*` → `dev` → `main`

### Required Checks

- Lint
- Type checking
- Component tests
- Critical business logic tests
- Localization validation
- Build verification
- Relevant E2E tests
- Visual regression checks where configured

Test redesigned pages in the actual Vercel staging environment if available.

Do not merge unfinished work directly into production.

Do not claim a successful staging deployment unless verified.

---

# 43. IMPLEMENTATION PRIORITIES

## PHASE 1 — FOUNDATION & HOME DASHBOARD

- Inspect existing application.
- Audit the current UI.
- Create unified design tokens.
- Build shared detail-page components.
- Redesign the authenticated Home Dashboard.
- Improve dashboard navigation and actions.

## PHASE 2 — CUSTOMER & BILL DETAILS

- Customer profile redesign.
- Customer financial summary.
- Customer timeline.
- Customer quick actions.
- Bill detail redesign.
- Invoice actions.
- Payment summary.

## PHASE 3 — STOCK & PURCHASE DETAILS

- Product detail redesign.
- Stock status.
- Variant information.
- Stock movements.
- Purchase summary.
- Receiving progress.
- Supplier payment information.

## PHASE 4 — ADDITIONAL DETAIL PAGES

- Supplier details.
- Payment details.
- Related ledger views.
- Other existing entity detail pages.

## PHASE 5 — FINAL PRODUCT POLISH

- Mobile responsiveness.
- Language completeness.
- Accessibility.
- Motion design.
- Visual testing.
- Automated testing.
- Staging verification.
- Usability improvements.

Do not delay critical functionality merely to perfect decorative details.

---

# 44. FINAL DELIVERABLES

Provide:

1. Completely redesigned Home Dashboard.
2. Premium Customer Detail page.
3. Premium Bill Detail page.
4. Premium Stock Detail page.
5. Premium Purchase Detail page.
6. Supplier Detail redesign.
7. Payment Detail redesign.
8. Shared detail-page design system.
9. Premium responsive components.
10. Smart summary cards.
11. Modern activity timelines.
12. Context-aware primary actions.
13. Better financial information hierarchy.
14. Improved status components.
15. Simplified navigation.
16. Mobile-friendly bottom sheets.
17. Expandable advanced information.
18. Business-specific dashboard content.
19. Contextual VoiceOS integration.
20. Contextual DemandPulse integration.
21. Smart Invoice Studio integration.
22. Appropriate WhatsApp sharing actions.
23. Complete English support.
24. Complete Hindi support.
25. Complete Hinglish support.
26. Accessibility improvements.
27. Performance optimisation.
28. Automated tests.
29. Visual regression screenshots.
30. Staging verification where available.
31. Documentation of the changes.
32. Actual implementation and QA report.

---

# 45. FINAL ACCEPTANCE CRITERIA

Do not mark the project complete until:

- The Home Dashboard is noticeably more modern.
- The dashboard is easy to understand.
- Important financial information appears prominently.
- Quick actions are obvious.
- Customer Details are clean and understandable.
- Customer balances are accurate.
- Customer activity is easy to browse.
- Bill Details show the important amounts clearly.
- Invoice PDF actions work.
- Stock Details display available inventory prominently.
- Purchase Details distinguish ordered, received and paid amounts.
- Supplier and Payment pages are simplified.
- Advanced information remains available.
- The interface contains no unnecessary repeated cards.
- The number of visible competing actions is reduced.
- Every page has consistent visual structure.
- Mobile layouts are excellent.
- English, Hindi and Hinglish are consistent.
- Existing authentication and permissions work.
- Financial and inventory records remain accurate.
- The redesigned application uses real backend data.
- Important workflows pass testing.
- Actual rendered screens have been reviewed.
- Deployment status is reported truthfully.

---

# FINAL EXECUTION INSTRUCTION

You must completely transform the EXISTING DukaanSet authenticated Home Dashboard and all major business detail pages.

This is a full user-experience redesign, not a superficial styling task.

Do not merely change colours, border radius or shadows.

Rebuild the information hierarchy so that nontechnical shopkeepers immediately understand their business records.

Reduce complexity through:

- Clear financial summaries
- Compact headers
- Consistent page layouts
- Contextual smart actions
- Simple activity timelines
- Progressive disclosure
- Mobile-first interactions
- Modern typography
- Premium visual design
- Meaningful status presentation
- Minimal navigation
- Business-specific workflows

Do not remove essential business functionality.

Keep backend financial logic accurate.

Preserve all user records.

Use the existing multilingual system.

Reuse VoiceOS, DemandPulse and Smart Invoice Studio appropriately.

Test the actual application thoroughly.

## FINAL DESIGN STANDARD

**Premium SaaS Quality**

**Minimal Visual Clutter**

**One-Screen Clarity**

**Smart Contextual Actions**

**Modern Mobile Experience**

**Consistent Business Workflows**

**Accurate Financial Information**

## THE MOST IMPORTANT PRODUCT RULE

**A shopkeeper should understand the most important information on a page without needing training.**

## FINAL PRODUCT PROMISE

**DukaanSet — Kam Clicks, Saaf Hisaab, Sab Set.**

**BEGIN IMPLEMENTATION IN THE EXISTING DUKAANSET REPOSITORY. DO NOT STOP AT PLANNING OR MOCKUPS.**