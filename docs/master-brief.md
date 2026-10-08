# MASTER PROMPT: BUILD DUKAANSET — A PREMIUM, MOBILE-FIRST, AI-POWERED MULTI-BUSINESS SAAS PLATFORM

## YOUR ROLE AND RESPONSIBILITY

Act as an elite multidisciplinary product development team consisting of:

- Principal Product Designer and UI/UX Architect
- Senior Mobile-First Frontend Engineer
- Full-Stack SaaS Architect
- Senior Backend and Database Engineer
- AI Product Engineer
- Product Manager and Business Analyst
- Accessibility and Usability Specialist
- SEO and Web Performance Engineer
- Security Engineer
- Quality Assurance and Automation Engineer
- Brand Identity and Design Systems Specialist

Your assignment is to DESIGN, ARCHITECT, DEVELOP, INTEGRATE, TEST, and REFINE an ambitious commercial SaaS product called **DukaanSet**.

Treat this project as a serious startup product intended for real businesses, not as a student demonstration, template, basic CRUD application, landing-page exercise, or superficial dashboard.

The final application should feel like a thoughtfully engineered commercial product, with excellent visual design, clear logic, reusable architecture, working interactions, reliable data, and exceptional mobile usability.

**Product quality, mobile experience, simplicity, performance, security, and business logic must guide every decision.**

Do not simply produce attractive screens filled with meaningless charts and fake buttons. The system must have coherent navigation, functional states, sensible data flows, and clearly defined behaviour.

If an external integration requires unavailable credentials, implement a clean integration boundary, configure its environment variables, and explain its status. Never pretend that an unavailable integration works.

Do not claim that a feature is finished without implementing and testing it.

---

# 1. PRODUCT IDENTITY

**Product name:** DukaanSet

**Primary tagline:** Apni Dukaan, Sab Set.

**Extended tagline:** Your Business. All in One Place.

**Product category:** Multi-tenant, AI-powered business management SaaS.

**Initial market:** Indian small businesses and local shopkeepers.

**Primary platform:** Mobile-first responsive web application.

**Additional platform:** Desktop/tablet web experience.

**Future platform:** Installable PWA and potential Android application distributed through Google Play.

**Supported application languages:**

1. English
2. Hindi — Devanagari script
3. Hinglish — Romanized Hindi

**Brand personality:**

- Modern
- Trustworthy
- Intelligent
- Minimal
- Indian-friendly
- Approachable
- Professional
- Reliable
- Effortlessly simple

## Core Product Vision

Build one unified application that automatically adapts to the needs of different businesses.

A hardware shop should see hardware-specific inventory workflows.

A grocery shop should see grocery-specific stock, expiry, and billing workflows.

A fruit and vegetable shop should see weight-based billing, daily prices, and wastage tracking.

A clothing business should eventually receive size and colour variations.

A mobile accessories shop should eventually receive product variants, serial numbers, and warranty workflows.

All of these experiences should be powered by one shared platform, reusable business services, configurable modules, and a secure multi-tenant architecture.

**Our competitive strategy is not to have the largest number of features. It is to make important business tasks significantly easier to complete.**

## Product Philosophy

Every design and engineering decision must follow these principles:

1. Fewer clicks.
2. Less typing.
3. Less confusion.
4. Faster everyday operations.
5. Clearer business information.
6. Only relevant features for each business.
7. A beautiful yet extremely practical mobile experience.
8. AI assistance that solves meaningful problems.
9. No fake functionality or misleading financial information.
10. Reliable behaviour under real-world conditions.

A shopkeeper should not need to open ten pages to discover today's sales, outstanding payments, or low-stock products.

The most important information must appear immediately.

---

# 2. MANDATORY COMPETITOR RESEARCH

Before implementing the final design, research established competitors and study their current product capabilities.

Primary competitors:

- Vyapar — https://vyaparapp.in/
- myBillBook — https://mybillbook.in/
- Khatabook — https://khatabook.com/
- Zoho Books — https://www.zoho.com/in/books/
- Tally — https://tallysolutions.com/
- Marg ERP — https://margcompusoft.com/

Additional competitors may be researched if relevant.

Study their:

- Marketing homepages
- Product positioning
- Mobile navigation patterns
- Onboarding processes
- Dashboard layouts
- Billing flows
- Inventory screens
- Credit management workflows
- Reports and charts
- Pricing presentation
- Mobile screenshots and demonstrations
- AI-related capabilities
- User complaints and friction points
- Accessibility and terminology
- Business-specific modules

Use current, verifiable sources. Clearly distinguish observed functionality from assumptions about their internal systems.

If browser inspection is available, review both desktop and mobile layouts and document the findings.

## Competitor Analysis Deliverable

Produce a feature comparison containing:

- What each competitor already does well
- Which workflows appear unnecessarily complex, where evidence supports this
- Which features DukaanSet must match
- Which workflows DukaanSet can simplify
- Which potential improvements require user validation
- Which features are unnecessary for the first release

Never copy competitors' layouts, copyrighted illustrations, icons, screenshots, branding, source code, or distinctive visual assets.

Take inspiration from established usability patterns while creating a clearly original product.

### Important Competitive Reality

Billing, inventory, payment reminders, multilingual interfaces, AI bill scanning, and multiple-business management already exist in competing products.

Do not describe these features as unique inventions.

Our differentiation should come from how these capabilities work together.

**DukaanSet's proposed advantages:**

- A personalised dashboard based on business type
- A practical "Today's Work" assistant
- One transaction updating all related records
- Contextual actions instead of excessive navigation
- A simplified mobile billing experience
- Business-specific AI assistance
- Clear financial explanations in simple language
- English, Hindi, and Hinglish across the application
- Smart defaults and progressive disclosure
- A reliable daily business-closing experience

---

# 3. BRAND IDENTITY AND LOGO SYSTEM

Develop an original premium visual identity for DukaanSet.

The product must not look like a generic Bootstrap dashboard, copied admin template, cryptocurrency platform, or visually cluttered ERP.

## Proposed Brand Palette

Primary Deep Teal: `#103B36`

Primary Mint: `#22C99D`

Warm Amber: `#F5B942`

Background Off-White: `#F7FAF8`

Dark Text: `#273C38`

Use semantic tokens for success, warning, danger, information, surfaces, borders, and muted text.

Verify colour contrast and adjust values where necessary.

Use a restrained palette. Avoid filling every metric card with a different bright colour.

## Typography

Use a premium, highly readable typography system.

Recommended candidates:

- Manrope or Inter for English and Hinglish
- Noto Sans Devanagari for Hindi

Create consistent font sizes, weights, line heights, heading scales, and responsive typography rules.

Numbers and financial amounts must be especially easy to scan.

## Original Logo

Create an original DukaanSet logo using an editable SVG or other maintainable vector representation.

Suggested concept:

A simplified storefront combined with a subtle checkmark representing "Sab Set."

Explore multiple sketches internally and select a balanced, distinctive direction.

Deliver:

- Primary horizontal logo
- Compact square symbol
- Light-background version
- Dark-background version
- Monochrome version
- Favicon
- PWA icons, including appropriate maskable variants
- App splash-screen branding

Avoid overused artificial-intelligence brain icons, overly complex shop illustrations, and existing competitor logo shapes.

### Replaceable Branding Architecture

The logo must be easy to replace later.

Create a central brand configuration and reusable Logo component.

Never hardcode logo assets in dozens of unrelated components.

If a new official logo is provided later, changing the central logo assets and tokens should update the application consistently.

The name DukaanSet is the selected working brand. Domain and trademark clearance must be completed before commercial deployment; do not falsely imply legal clearance.

---

# 4. MOBILE-FIRST DESIGN — HIGHEST PRIORITY

**The mobile user experience is the single most important visual and interaction priority in this project.**

Assume many users operate their businesses primarily through affordable Android smartphones.

Design for narrow screens first, then progressively enhance the experience for tablets, laptops, and desktop monitors.

Do not create a desktop dashboard and merely squeeze it into a mobile viewport.

Create the mobile interaction model intentionally.

## Required Mobile Viewports

Test at representative widths such as:

- 320px
- 360px
- 375px
- 390px
- 412px
- 430px

Also test common tablet and desktop widths.

## Mobile Navigation

Use a compact, understandable bottom navigation bar.

Suggested navigation:

1. Home
2. Bills
3. Stock
4. More

Provide a prominent contextual action for creating a new bill.

The final navigation should be selected based on usability testing rather than blindly following this proposal.

Features such as customers, purchases, reports, settings, and AI must remain easy to discover without cluttering the primary navigation.

Ensure:

- Comfortable touch targets, preferably at least 44×44 CSS pixels
- Safe-area support for phones with notches and gesture navigation
- Proper handling of on-screen keyboards
- Clear active navigation states
- No accidental horizontal scrolling
- No overlapping bottom bars
- No important buttons hidden behind mobile keyboards
- No horizontal financial tables that become unusable
- No tiny text or difficult-to-tap controls

## Mobile UI Interaction Patterns

Use:

- Sticky bottom action areas where useful
- Bottom sheets for compact tasks
- Searchable product selectors
- Expandable cards
- Clear segmented controls
- Short forms with progressive disclosure
- Contextual menus
- Well-designed confirmation sheets
- Small informational tooltips
- Skeleton loading states
- Helpful empty states
- Inline validation
- Accessible toast feedback
- Undo where technically and financially appropriate

Avoid:

- Deep navigation chains
- Unnecessary confirmation dialogs
- Endless popups
- Heavy glassmorphism
- Excessive visual animation
- Decorative 3D effects that slow the app
- Complex nested menus
- Unnecessary floating buttons
- Multi-column forms on narrow screens
- Long setup questionnaires

## Performance Expectations

The application must remain usable on mid-range and budget devices.

Optimise for real-world mobile networks and intermittent connectivity.

Use efficient JavaScript bundles, route-level code splitting, modern image formats, lazy loading where appropriate, data caching, and minimal unnecessary re-renders.

Animations should be tasteful, fast, and purposeful.

Respect reduced-motion preferences.

**The result should feel like a polished mobile application, not a website awkwardly viewed on a phone.**

---

# 5. COMPLETE DESIGN SYSTEM

Build a reusable design system before spreading UI styles across the application.

Include:

### Foundations

- Colour tokens
- Typography tokens
- Spacing scale
- Border radius scale
- Elevation and shadows
- Icon sizes
- Motion durations
- Transition timing
- Breakpoints
- Surface hierarchy
- Contrast rules
- Focus indicators

### Core Components

- Buttons
- Icon buttons
- Text inputs
- Number inputs
- Currency inputs
- Search inputs
- Selects
- Multi-selects
- Checkboxes
- Radio groups
- Switches
- Date pickers
- Tabs
- Segmented controls
- Badges
- Cards
- Tables
- Lists
- Modals
- Bottom sheets
- Drawers
- Tooltips
- Dropdowns
- Toasts
- Progress indicators
- Loading skeletons
- Empty states
- Error states
- Confirmation interfaces
- Pagination controls
- Chart containers

### Business Components

- Metric cards
- Money display
- Payment status chips
- Stock quantity indicators
- Customer balance cards
- Invoice item rows
- Product search cards
- Quick action tiles
- AI insight cards
- Reorder suggestion rows
- Daily task cards
- Language selector
- Business selector
- Invoice preview
- Daily closing summary
- Transaction history
- Payment method selector

Every component must support relevant interaction, loading, disabled, error, success, and empty states.

Use a consistent icon family such as Lucide.

Ensure RTL support is not accidentally introduced for English, Hindi, or Hinglish; these are left-to-right in our intended interface.

---

# 6. PUBLIC MARKETING WEBSITE

Build a high-end, conversion-focused marketing website distinct from the authenticated application.

The marketing website should feel premium, original, fast, and credible.

## Homepage Sections

### A. Header

Include:

- DukaanSet logo
- Features
- Business Types
- How It Works
- Pricing
- Help
- Login
- Get Started

Create responsive desktop and mobile navigation.

### B. Hero Section

Primary headline direction:

**Apni Dukaan, Sab Set.**

Supporting idea:

Manage your sales, stock, customers, outstanding payments, and everyday business tasks from one simple platform.

Include:

- Clear primary CTA
- Secondary product-demo CTA
- Original visual preview of the actual application
- Lightweight background details
- Strong visual hierarchy
- Mobile-specific layout
- Clear explanation of what the product does

Do not invent customer numbers, rankings, ratings, testimonials, or business partnerships.

### C. Product Benefits

Explain actual user outcomes:

- Create bills faster
- Know today's sales
- Track customer payments
- Manage inventory
- See what needs attention
- Reduce repeated entry

### D. Industry-Based Product Previews

Create interactive previews for:

- Grocery
- Hardware
- Vegetable/Fruit
- Mobile Accessories
- Clothing
- General Business

When a category changes, update the relevant dashboard preview, features, and example workflows.

### E. How It Works

Use a simple visual sequence:

Create Account → Choose Business → Add Products → Start Billing → Track Business.

### F. AI Assistant Showcase

Demonstrate example questions and show clearly labelled sample responses.

### G. Mobile Experience Showcase

Present a realistic phone-frame preview of the application.

Use screenshots or components generated from the actual interface rather than unrelated generic stock imagery.

### H. Language Support

Show English, Hindi, and Hinglish versions of important screens.

### I. Pricing

Present clearly explained plans with no misleading fees or invented discounts.

### J. FAQs

Answer practical merchant questions about:

- Billing
- Stock
- Udhaar
- Mobile support
- Language selection
- Privacy
- Data export
- Offline limitations
- GST-related capabilities
- Pricing
- Support

### K. Footer

Include legitimate company information and appropriate links:

- About
- Contact
- Terms
- Privacy
- Security
- Help Centre
- Pricing
- Product Features

Do not invent a registered company identity, physical address, or legal status.

## Additional Public Pages

Create detailed public pages for:

- Features overview
- Billing
- Stock management
- Udhaar management
- AI assistant
- Business types
- Grocery solution
- Hardware solution
- Vegetable shop solution
- Mobile shop solution
- Pricing
- Contact
- Help centre
- About
- Privacy and terms placeholders requiring legal review

Prioritise high-quality pages over dozens of thin, duplicate SEO pages.

---

# 7. AUTHENTICATION AND BUSINESS ONBOARDING

Build a secure and exceptionally simple onboarding journey.

## User Flow

Visitor → Registration → Basic Identity → Business Setup → Language Selection → Dashboard.

Avoid asking dozens of questions at the start.

### Essential Setup

Collect only what is needed:

- Name
- Email or phone, according to implemented authentication
- Shop/business name
- Primary business category
- Preferred application language

Optional details can be completed later:

- Business address
- GST registration information
- Logo
- Additional business category
- Supplier details
- Initial opening stock
- Staff members
- Invoice preferences

Support secure login, logout, account recovery, and session handling.

Do not create a fake OTP flow; use an actual provider when configured or offer a legitimate alternative.

## Business Category Selection

Initial categories:

- Grocery / Kirana
- Hardware / Electrical
- Fruits & Vegetables
- Mobile Accessories
- Clothing / Fashion
- General Store / Other

Design the system to support future categories without restructuring the whole application.

## Multiple Business Support

One user may own more than one business.

Examples:

- One grocery shop
- One hardware shop
- One warehouse

Allow authorised users to switch between their businesses.

Changing the active business must also switch all related data, dashboard configuration, permissions, reports, and AI context.

Never mix information from unrelated businesses.

## Mixed Business Support

A store may sell groceries and vegetables together.

Allow a primary business type plus optional feature modules.

Avoid forcing businesses into rigid categories that do not match their real operations.

---

# 8. DYNAMIC BUSINESS CONFIGURATION ENGINE

Implement a configurable multi-business system, not multiple duplicated applications.

Business type must control:

- Dashboard widgets
- Home screen priorities
- Enabled modules
- Product fields
- Inventory behaviour
- Billing defaults
- Units of measurement
- Relevant alerts
- AI suggestions
- Reports
- Navigation priorities

Create a structured capability configuration.

For example:

Hardware:
Billing, Stock, Customer Credit, Suppliers, Product Units, Unit Conversion.

Grocery:
Billing, Stock, Expiry Tracking, Batch Management, Barcode Support.

Vegetable:
Weight Billing, Daily Prices, Fresh Stock, Wastage Tracking.

Clothing:
Product Variants, Sizes, Colours, Returns.

Mobile Accessories:
Model Variants, Warranty, Serial Numbers where applicable.

Shared core services must remain reusable.

The UI may hide a module based on business configuration, but the backend must independently enforce permissions and subscription entitlements.

---

# 9. DASHBOARD — MOST IMPORTANT APPLICATION SCREEN

Create a premium yet extremely simple dashboard.

The purpose is to answer:

- How much did I sell today?
- How much money did I receive?
- Who owes me money?
- What stock is low?
- What needs my attention?
- What should I do next?

Do not overload the home screen with twenty charts.

## Recommended Mobile Dashboard Layout

### Top Header

- Shop name
- Business switcher
- Current date
- Language selector
- Notifications
- Profile access

### Greeting

Example:

"Good Morning! Here is your shop's update."

Translate naturally into the selected language.

### Primary Metrics

Display the most relevant 4 metrics.

For a grocery shop:

- Today's Sales
- Money to Collect
- Low Stock
- Today's Bills

For a hardware shop:

- Today's Sales
- Outstanding Credit
- Low Stock
- Pending Supplier Orders

For a vegetable shop:

- Today's Sales
- Remaining Stock
- Recorded Wastage
- Today's Bills

### Primary Quick Actions

Prioritise:

- New Bill
- Add Payment
- Add Stock

Adjust by business type.

### Today's Work

Create a section highlighting actionable issues.

Examples:

- 3 customer payments are overdue
- 5 products need restocking
- 2 products are approaching expiry
- A supplier payment is due
- Today's shop closing has not been completed

Each item should open the exact relevant task, preferably inline or in a focused sheet.

### AI Quick Help

A compact conversational assistant entry point.

Example suggested questions:

- Show today's sales
- Who has pending payments?
- What should I reorder?
- Compare this week with last week

### Recent Activity

Show a limited, useful feed.

Avoid exposing advanced reports on the home screen unless clearly justified.

## Dashboard UX Requirements

- Mobile-first card hierarchy
- Clear financial typography
- Useful empty states
- Fast refresh
- Accessible interactions
- Consistent spacing
- No horizontal overflow
- Proper loading placeholders
- Real business-specific data
- Clear distinction between sales, collections, profit, and outstanding balances

The last point is critical. Financial metrics must not be misleading.

---

# 10. BILLING SYSTEM — COMPLETE BUSINESS LOGIC

Build an efficient and reliable sales billing system.

Support:

- Quick product search
- Product favourites
- Quantity adjustment
- Unit selection
- Item discounts
- Invoice discounts
- Tax handling where applicable
- Customer selection
- Walk-in customers
- Cash sales
- UPI payments recorded by the user
- Credit sales
- Partial payments
- Multiple payment allocations
- Draft invoices
- Confirmed invoices
- Invoice sharing
- Downloadable PDFs
- Print-friendly invoices
- Returns and refunds
- Authorised cancellation or reversal

## Mobile Billing Flow

Step 1: Tap New Bill.

Step 2: Search or select products; enter quantities.

Step 3: Review totals, choose payment method, and confirm.

Frequently purchased products should be easy to access.

Use a sticky bill summary and a prominent final action.

Allow new customer creation without losing the draft.

## Transaction Example

A customer buys ₹1,000 worth of products.

Customer pays ₹600.

Remaining amount: ₹400.

When the bill is successfully confirmed, the system must:

1. Save the invoice.
2. Save invoice line items.
3. Record the received payment.
4. Record the outstanding balance.
5. Reduce applicable inventory.
6. Record inventory movements.
7. Update derived reports.
8. Produce an audit record.

These actions must happen consistently within an appropriate database transaction.

If validation fails, do not partially save the transaction.

Use idempotency protection to prevent duplicate bills on repeated taps.

Money must use precise decimal arithmetic or integer minor units, not unsafe floating-point calculations.

Returns and corrections must have traceable references to the original transactions.

For tax rules, use a configurable, validated calculation service. Do not invent GST rules or automatically represent ordinary PDF invoices as government-registered e-invoices.

---

# 11. INVENTORY MANAGEMENT

Create a robust shared inventory service.

Core product information:

- Product name
- SKU
- Category
- Cost price
- Selling price
- Quantity
- Unit
- Supplier
- Minimum stock threshold
- Optional barcode
- Optional tax classification
- Status

Support:

- Stock additions
- Sales deductions
- Purchase receipts
- Returns
- Wastage
- Corrections
- Stock movement history
- Inventory valuation rules
- Low-stock alerts
- Quick product search
- Product import/export

Do not update stock through scattered manual field changes without recording the reason.

Use an inventory movement model that allows stock history to be reconstructed.

## Business-Specific Inventory

### Grocery

- Batch details
- Expiry dates
- Packets and loose goods
- Barcode support
- Expiring-soon alerts

### Hardware

- Pieces, boxes, metres and other units
- Unit conversions
- Product variants
- Supplier-based reorder lists

### Vegetables

- Kilograms and grams
- Daily changing prices
- Fresh stock arrivals
- Recorded wastage
- Remaining quantities
- Optional grade and quality attributes

A quantity of 500 grams must calculate correctly when the product price is specified per kilogram.

### Clothing

- Size and colour variants
- Returns and exchanges
- Variant-wise stock

### Mobile Accessories

- Phone model compatibility
- Colour variants
- Warranty fields
- Serial number tracking where needed

Build extensible product schemas rather than creating an entirely separate database for every industry.

---

# 12. CUSTOMER AND UDHAR MANAGEMENT

Build customer profiles that are simple enough for non-technical shopkeepers.

Show:

- Customer name
- Contact information
- Outstanding amount
- Total purchases
- Payments received
- Invoice history
- Due dates
- Last payment
- Recent activity

Provide prominent actions:

- Add Payment
- View Bills
- Prepare Reminder
- Share Statement

## Udhar Logic

An outstanding balance must be derived from valid transaction records and payment allocations.

Support partial repayments.

A customer can owe money on multiple invoices.

Show both overall outstanding money and invoice-specific balances.

Clearly distinguish overdue amounts from amounts that are not yet due.

Reminder messages should be polite and editable.

Do not automatically send WhatsApp messages without required permissions, consent, and supported integrations.

Maintain customer financial history and appropriate audit trails.

---

# 13. PURCHASES AND SUPPLIERS

Develop an integrated purchase management system.

Features:

- Supplier directory
- New purchase entry
- Purchase item rows
- Purchase receipts
- Supplier payment records
- Outstanding supplier balances
- Purchase returns
- Purchase history
- Stock receipt confirmation
- Reorder suggestions

The system should distinguish purchase orders from actual goods received.

Stock must update at the appropriate receipt or confirmation event, not merely because a proposed supplier order was drafted.

Provide a simple mobile flow for receiving products.

Support a future AI-based purchase-bill scanning module.

AI-extracted information must be reviewed before being saved.

---

# 14. TODAY'S WORK — SIGNATURE PRODUCT FEATURE

Develop a distinctive daily action centre called **Today's Work**.

Its purpose is not to display generic notifications.

Its purpose is to turn important business conditions into actions.

Examples:

- Customer payment overdue → Open collection details
- Stock below threshold → Prepare reorder list
- Product nearing expiry → Review affected batches
- Supplier invoice outstanding → View supplier payment
- Shop not closed today → Start daily closing

Each task should contain:

- Clear short title
- Explanation
- Relevant amount or quantity
- Priority
- Primary action
- Optional secondary action
- Dismiss/snooze rules where appropriate

Avoid alert overload.

Prioritise only meaningful items.

Allow users to mark applicable operational tasks complete, but never mark financial obligations as settled merely because a notification was dismissed.

Implement a rule-based engine first.

Advanced AI prioritisation can be added after sufficient data and validation.

---

# 15. DAILY BUSINESS CLOSING

Build an intuitive end-of-day summary.

Suggested heading:

**Today's Hisaab**

Show:

- Today's sales
- Recorded cash received
- Recorded UPI received
- Credit sales
- Payments collected against older dues
- Expenses
- Cash adjustments
- Expected closing cash
- Actual counted cash
- Difference, if any

Provide a guided closing checklist.

Allow the owner to review and confirm the day.

Do not assume a UPI payment was verified merely because it was recorded as UPI.

Differentiate manually recorded payments from provider-verified payments when an integration exists.

Make closed-day corrections controlled and auditable.

This should be one of DukaanSet's defining daily-use experiences.

---

# 16. MULTILINGUAL EXPERIENCE — REQUIRED

Support three complete display languages:

1. English
2. Hindi
3. Hinglish

Do not translate only the navigation menu.

Language selection must affect:

- Marketing content where available
- Dashboard
- Navigation
- Buttons
- Forms
- Validation errors
- Alerts
- Empty states
- Notifications
- Reports
- Help
- AI responses
- Onboarding
- Billing interface
- Account settings

## Translation Examples

English: Today's Sales

Hindi: आज की बिक्री

Hinglish: Aaj Ki Bikri

English: Money to Collect

Hindi: लेने वाले पैसे

Hinglish: Paise Lene Hain

English: Create Bill

Hindi: नया बिल बनाएँ

Hinglish: Naya Bill Banao

Use simple and natural wording.

Avoid awkward literal translations.

Use a scalable internationalisation library such as react-i18next or next-intl depending on the final architecture.

Store translations in organised dictionaries.

Language preference must be per user account, not merely per business.

Users must be able to switch language instantly without logging out.

The selected preference must persist.

Do not automatically translate customer names, legal identifiers, or product descriptions stored by users.

Allow document language selection independently when appropriate.

For AI, understand the language of the user's request and prefer the selected response language.

Where a translation is unavailable, use a clearly defined fallback rather than broken text.

---

# 17. DUKAANSET AI ASSISTANT

Build an AI architecture designed around authorised business data.

AI must not be a decorative chatbot.

It should help merchants understand and operate their businesses.

## Initial AI Capabilities

Read-only queries:

- What were my sales today?
- Which customers have overdue balances?
- Which products are running low?
- What sold the most this week?
- How much money was collected today?
- Which invoices remain unpaid?

Use approved backend tools to retrieve the required data.

The AI must not invent figures.

If necessary data is unavailable, explain the limitation.

## Future Action Capabilities

- Prepare an invoice
- Prepare a payment reminder
- Draft a reorder list
- Suggest purchase quantities
- Organise supplier invoice data
- Suggest daily tasks

Actions that affect financial or inventory data must be previewed and explicitly confirmed by an authorised user.

## AI Architecture

User request → Intent classification → Permission check → Business-specific context → Approved backend tool → Validated result → User-friendly response.

Use typed tools and strict schemas.

Never give an LLM unrestricted database access.

Enforce tenant isolation and permissions on every tool call.

Protect against prompt injection, unauthorised actions, data leakage, malformed tool output, and fabricated financial information.

Keep sensitive data minimised.

Create appropriate usage limits and AI cost controls.

If the LLM provider is not configured, show an honest unavailable state and preserve useful non-AI workflows.

Do not silently replace AI with fabricated answers.

---

# 18. VOICE-ASSISTED BUSINESS ACTIONS

Design the application to support future voice input.

Examples:

"Show today's sales."

"Ramesh ka kitna paisa baaki hai?"

"Do kilo tamatar ka bill banao."

Voice input should work alongside normal touch interactions.

For speech-driven writes:

- Transcribe
- Identify user intent
- Match records
- Show a structured preview
- Confirm
- Execute safely

Test noisy environments, different accents, code-switching, and ambiguous product names.

Never submit an invoice directly from an unverified transcription.

Implement real voice integration only when a suitable provider and testing environment are available.

Otherwise design the UI and service contract, and clearly label the feature as not yet enabled.

---

# 19. WHATSAPP AND DOCUMENT AUTOMATION

Design optional modules for:

- Share invoice through WhatsApp
- Prepare payment reminder
- Share customer statement
- Import order text
- Generate invoice draft from order text
- Scan supplier bills
- Export documents

Initial WhatsApp support may use user-initiated sharing.

Full WhatsApp Business API integration must follow Meta's current platform requirements.

Do not claim access to private WhatsApp conversations.

Do not send unsolicited bulk messages.

Documents created by the application must have accurate totals and correct business information.

---

# 20. REPORTS AND FINANCIAL CLARITY

Develop practical reports that merchants can understand without accounting knowledge.

Suggested reports:

- Daily Sales
- Weekly Sales
- Monthly Sales
- Payments Received
- Money to Collect
- Money to Pay
- Stock Summary
- Fast-Moving Products
- Low Stock
- Purchases
- Expenses
- Recorded Wastage
- Profit Estimates

Use simple charts when they genuinely help.

Do not confuse sales with revenue collected.

Do not present gross margin as net profit.

If cost data or expenses are incomplete, label profit calculations as estimates.

Provide meaningful filters, date ranges, clear totals, and exports.

Keep the most important metrics on the home screen; advanced reporting can live in a dedicated section.

---

# 21. COMPLETE APPLICATION ROUTES AND SCREENS

Implement a complete, logically organised experience.

## Public

- `/`
- `/features`
- `/features/billing`
- `/features/inventory`
- `/features/udhar`
- `/features/ai`
- `/business-types`
- `/business-types/grocery`
- `/business-types/hardware`
- `/business-types/vegetables`
- `/pricing`
- `/how-it-works`
- `/help`
- `/contact`
- `/about`
- `/privacy`
- `/terms`

## Authentication

- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/verify-account` where applicable

## Onboarding

- `/onboarding/welcome`
- `/onboarding/business`
- `/onboarding/language`
- `/onboarding/products`
- `/onboarding/complete`

Keep this flow concise and skippable where safe.

## Protected Application

- `/app`
- `/app/sales`
- `/app/sales/new`
- `/app/sales/[id]`
- `/app/products`
- `/app/products/new`
- `/app/products/[id]`
- `/app/stock`
- `/app/customers`
- `/app/customers/[id]`
- `/app/purchases`
- `/app/suppliers`
- `/app/payments`
- `/app/expenses`
- `/app/reports`
- `/app/todays-work`
- `/app/daily-closing`
- `/app/ai`
- `/app/settings`
- `/app/settings/business`
- `/app/settings/language`
- `/app/settings/team`
- `/app/settings/billing`
- `/app/settings/security`
- `/app/help`

Provide intentional 404, access-denied, unavailable-feature, loading, and error screens.

Routes may be reorganised for better architecture, but no requested user workflow should disappear.

Do not add unnecessary visible navigation just because a route exists.

---

# 22. FRONTEND TECHNOLOGY

Use a modern, maintainable TypeScript-first architecture.

Preferred stack:

- Next.js with React and TypeScript
- Tailwind CSS
- shadcn/ui or Radix-based accessible primitives
- Lucide icons
- TanStack Query where client-side server state benefits from it
- React Hook Form
- Zod for schema validation
- Recharts for relevant data visualisations
- i18n library suitable for the final architecture

Use Next.js primarily to support excellent marketing-page SEO, reusable React components, and a unified development experience.

Keep private application rendering appropriate for authenticated business data.

Use a reusable API client, typed contracts, and structured error handling.

Do not place all functionality inside giant page files.

Use maintainable component, feature, and service boundaries.

---

# 23. BACKEND AND DATABASE ARCHITECTURE

Preferred architecture:

- Node.js
- TypeScript
- Modular backend services
- PostgreSQL
- Prisma ORM or equivalent
- Secure authentication
- Object storage for documents
- Background job processing when needed
- Validated REST APIs or another well-defined typed interface

A monorepo may contain:

- Marketing and application frontend
- Backend API
- Shared business types
- Shared validation schemas
- Design system
- Database schema and migrations
- Tests
- Documentation

## Important Entities

- Users
- Businesses
- Business Memberships
- Business Settings
- Business Modules
- Roles and Permissions
- Customers
- Suppliers
- Products
- Product Variants
- Product Batches
- Units
- Inventory Movements
- Sales Invoices
- Invoice Items
- Payments
- Payment Allocations
- Purchases
- Purchase Items
- Expenses
- Daily Closings
- AI Interactions
- Notifications
- Audit Logs
- Subscription Plans
- Subscriptions
- Feature Entitlements

Define relationships, indexes, constraints, lifecycle rules, and transactional boundaries.

## Multi-Tenant Requirements

Every business-owned record must belong to a tenant.

Every protected backend request must validate the authenticated user's membership, role, and access to the selected business.

Use defence-in-depth against cross-tenant access.

Never trust a client-supplied business ID without checking authorisation.

Provide tests verifying that Business A cannot access Business B's records.

## Reliability Requirements

- Transactional invoice creation
- Correct inventory adjustments
- Idempotent financial operations
- Audited reversals
- Reliable payment allocations
- Consistent customer balances
- Clear API validation
- Centralised error handling
- Concurrency protection
- Background job retry policies
- Appropriate database migrations
- Backup and recovery strategy

---

# 24. SECURITY, PRIVACY, AND COMPLIANCE

Implement security as a core requirement, not a final decoration.

Include:

- Secure authentication and session handling
- Strong password hashing where passwords are used
- Authorisation by role
- Business tenant isolation
- Input validation
- Output encoding
- CSRF protection where relevant
- Rate limiting
- Secure file uploads
- Appropriate security headers
- HTTPS requirements
- Secrets in environment variables
- Audit trails
- Safe logging practices
- Sensitive data minimisation
- Secure backup handling
- Account and business data export
- Appropriate deletion and retention controls

Do not expose secret keys in client-side code.

Never request UPI PINs, banking passwords, or OTPs unrelated to legitimate authentication.

Do not store payment card details directly.

Review applicable Indian privacy and tax requirements before production use.

Do not invent legal compliance claims.

If official GST or e-invoicing integration is unavailable, clearly distinguish ordinary invoice creation from verified government e-invoice generation.

---

# 25. SEARCH ENGINE OPTIMISATION

SEO must be implemented continuously rather than added at the end.

Focus SEO efforts on the public marketing website.

Private user dashboards, customer records, invoices, and personal business data should require authentication and must never be exposed to search engines.

## Technical SEO

Implement:

- Crawlable server-rendered or statically generated public pages
- Unique page titles
- Unique meta descriptions
- Correct heading hierarchy
- Canonical URLs
- XML sitemap
- Robots configuration
- Open Graph metadata
- Social preview images
- Descriptive image alt text
- Clean URL structures
- Appropriate structured data
- Internal links
- Fast-loading mobile layouts

Evaluate SoftwareApplication, Organization, and relevant supported structured data where applicable.

Use accurate schema values. Do not add fabricated ratings or reviews.

## Content Strategy

Create useful original content for topics such as:

- Billing software for small shops
- Inventory management for kirana stores
- Udhar tracking
- Hardware shop stock management
- Vegetable shop billing
- Digital shop accounting
- How to manage customer credit

Avoid keyword stuffing and repetitive pages.

## Multilingual SEO

Provide meaningful English and Hindi public pages.

Use language-specific URLs and appropriate multilingual SEO signals where supported.

Treat Hinglish as an editorial localisation choice and verify correct language annotations before introducing them.

Avoid generating low-quality machine-translated duplicate pages.

## Performance Targets

Aim for strong Core Web Vitals:

- LCP at or below 2.5 seconds
- INP at or below 200 milliseconds
- CLS at or below 0.1

Evaluate performance using appropriate lab and field data.

Do not claim perfect SEO rankings or guaranteed Google positions.

Configure analytics and Search Console readiness, while respecting consent and privacy requirements.

---

# 26. PROGRESSIVE WEB APP AND FUTURE ANDROID READINESS

Build DukaanSet as a PWA-ready application.

Include:

- Web app manifest
- Appropriate app icons
- Maskable icons
- Standalone display configuration
- Installability support
- Secure HTTPS delivery
- Mobile safe-area handling
- Sensible application loading screens
- Network status awareness
- Appropriate service-worker caching
- Safe offline fallback

Do not cache sensitive financial responses in unsafe shared storage.

### Offline Strategy

For the initial release:

- Make network state clear
- Preserve local unsent form drafts when safe
- Avoid data loss on temporary connectivity failures
- Do not pretend an invoice has synced if it has not

True offline financial transactions require conflict handling, local encryption considerations, unique identifiers, reconciliation, and reliable synchronisation.

Treat advanced offline billing as a dedicated, tested implementation phase.

### Future Play Store

Design so the web application can later be evaluated for Android distribution using a Trusted Web Activity or suitable native shell.

Keep device-specific functionality behind clear interfaces.

Evaluate current Google Play policies and capabilities before publishing.

Do not assume that adding a manifest automatically makes an app compliant with Play Store requirements.

---

# 27. ACCESSIBILITY AND INCLUSIVE UX

Make DukaanSet usable by people with varied technical experience, visual abilities, language preferences, and devices.

Target WCAG 2.2 AA where applicable.

Provide:

- Semantic UI
- Keyboard navigation
- Focus visibility
- Accessible form labels
- Screen reader announcements
- Descriptive button labels
- Sufficient contrast
- Scalable text
- Reduced-motion behaviour
- Meaningful error messages
- Accessible charts and alternatives
- Clear success feedback

Do not communicate payment success or failure using colour alone.

Ensure Hindi text renders properly and does not clip or overlap.

Test text expansion across all supported languages.

---

# 28. INTERACTION QUALITY AND EDGE CASES

Every primary UI component must behave sensibly.

Handle:

- Empty business account
- No products
- No customers
- First invoice
- No internet connection
- Slow API responses
- Expired session
- Insufficient permissions
- Invalid input
- Duplicate form submission
- Deleted product referenced by historical invoice
- Stock shortage
- Product returns
- Negative or invalid quantities
- Partial payments
- Multi-user concurrent edits
- Wrong invoice amount
- Business switching
- Changing language mid-task
- App refreshing during form entry
- Long product names
- Large amounts
- Long customer lists
- Missing profile image
- Upload failures
- PDF generation failure
- AI service failure

Do not rely on perfect internet, perfectly formatted data, or error-free users.

For business-critical tasks, preserve draft state where appropriate.

Make errors understandable and actionable.

Example:

Avoid: "HTTP 409 Conflict."

Prefer: "This product was updated on another device. Review the latest stock before saving."

Provide equivalent Hindi and Hinglish messages.

---

# 29. REUSABLE BUSINESS LOGIC

Organise business logic into clear services rather than scattering calculations across frontend components.

Core services should include:

- Business configuration
- Product catalogue
- Inventory ledger
- Sales invoicing
- Payments
- Customer balances
- Purchases
- Suppliers
- Tax calculation
- Reports
- Daily closing
- Notifications
- AI tool orchestration

Separate:

- Presentation logic
- Domain rules
- Database access
- External integrations
- Authentication and authorisation

The frontend should never be the authoritative source of financial totals.

The backend must validate transaction totals, permissions, stock movements, and important constraints.

Use documented state transitions for draft, confirmed, cancelled, returned, and paid records.

---

# 30. DEMO DATA AND REAL USER DATA

Provide an isolated demo experience for showcasing the UI.

Create realistic but clearly fictional sample datasets for:

- Grocery
- Hardware
- Vegetables

Show business-specific dashboard previews.

Demo mode must not be confused with a real merchant account.

Do not mix seed data into a real user's business without explicit selection.

New users should receive useful onboarding empty states, sample templates, or an optional guided demo.

Every real record must persist correctly through the implemented backend.

---

# 31. SAAS PRICING AND SUBSCRIPTION ARCHITECTURE

Prepare the product for a subscription business model.

Suggested initial pricing experiments:

Free / Trial

Starter

AI Pro

Do not hardcode speculative commercial prices throughout the application.

Create centralised plan configuration and configurable feature entitlements.

Support future:

- Subscription lifecycle
- Billing cycles
- Usage limits
- AI quotas
- Upgrade and downgrade paths
- Payment status
- Grace periods
- Invoice history
- Plan-based access

Only implement real payment collection when a legitimate payment provider is configured.

Do not present fake successful subscription transactions.

---

# 32. QUALITY ASSURANCE AND TESTING

Treat this project as a product requiring real testing.

Use appropriate automated tools, including:

- Unit tests
- Integration tests
- API tests
- End-to-end browser tests
- Accessibility checks
- Responsive viewport tests
- Security-focused tests
- Financial correctness tests

Suggested tools:

- Vitest
- React Testing Library
- Playwright
- API testing utilities
- Lighthouse
- Axe accessibility tooling

## Mandatory Tests

### Billing

Test invoice totals, discounts, payments, partial payments, refunds, stock updates, and duplicate submissions.

### Inventory

Test sales deductions, purchase additions, returns, wastage, low-stock thresholds, and unit conversions.

### Customers

Test credit balances, partial repayments, overdue calculations, and transaction history.

### Multi-Tenancy

Test that unrelated business accounts cannot access each other's data.

### Languages

Test English, Hindi, and Hinglish UI, including long text, labels, errors, and number formatting.

### Mobile

Test key flows across representative phone sizes.

### Authentication

Test protected routes, expired sessions, role-based access, and password reset where implemented.

### AI

Test read-only tool permissions, denied actions, malformed outputs, and cross-tenant protection.

Do not claim 100% bug-free operation.

Instead, maintain a test report, known-issues register, and clear acceptance criteria.

---

# 33. USER EXPERIENCE ACCEPTANCE TARGETS

Use these as initial product targets to validate with actual merchants.

- A first-time user should understand the main dashboard without reading a long manual.
- An experienced user should start billing directly from home.
- A routine bill should require approximately three main user actions, excluding necessary item entry.
- Outstanding payments should be visible without navigating through several reports.
- Low-stock warnings should link directly to the relevant stock action.
- Users should be able to change language without restarting the session.
- Switching business type should update relevant dashboard configuration consistently.
- A user should not need to enter the same financial information in multiple modules.
- Everyday screens should be fast and readable on affordable Android devices.
- Business-critical records must remain consistent and traceable.

These are design and testing objectives, not guaranteed results.

---

# 34. DESIGN REVIEW AND REFINEMENT PROCESS

Do not stop after producing the first acceptable UI.

Evaluate each important screen against:

1. Visual hierarchy
2. Mobile ergonomics
3. Readability
4. Number of user actions
5. Navigation clarity
6. Language simplicity
7. Data correctness
8. Accessibility
9. Responsiveness
10. Consistency with the design system
11. Empty states
12. Error states
13. Business-type relevance
14. Conversion or task-completion purpose

Remove anything that adds visual complexity without improving understanding.

Every visible card, button, chart, section, and feature must justify its existence.

Perform responsive visual review at mobile and desktop dimensions.

Use browser screenshots and automated visual checks where tools permit.

Fix layout defects, interaction problems, and accessibility issues before considering a screen complete.

---

# 35. IMPLEMENTATION ORDER

Build the product in coherent, testable vertical slices.

## Stage 1 — Research and Architecture

- Competitor research
- Product requirements
- User roles
- Information architecture
- Business workflow mapping
- Data model
- Design system definition
- Implementation roadmap

## Stage 2 — Brand and Marketing UI

- Original logo
- Design tokens
- Responsive public website
- Homepage
- Product illustrations/screens
- Feature pages
- Basic SEO
- Marketing language support

## Stage 3 — Mobile App Foundation

- Application shell
- Bottom navigation
- Authentication
- Onboarding
- Business selection
- Language selector
- Responsive dashboard
- Reusable app components

## Stage 4 — Connected Core Business Workflows

- Products
- Stock
- Customers
- Sales
- Invoice creation
- Payments
- Credit
- Purchases
- Suppliers

Connect these to a real backend and database.

## Stage 5 — Business-Specific Experiences

- Grocery dashboard
- Hardware dashboard
- Vegetable dashboard
- Relevant product fields
- Contextual alerts
- Configurable modules

## Stage 6 — Daily Operations

- Today's Work
- Daily closing
- Reports
- Notifications
- Invoice documents
- Business settings

## Stage 7 — AI Capabilities

- Business questions
- Read-only tools
- Permission-safe orchestration
- AI assistance interface
- Suggested actions
- Confirmed AI draft actions where implemented

## Stage 8 — Hardening and Release Preparation

- Responsive QA
- Accessibility
- Performance optimisation
- Security checks
- SEO validation
- Automated testing
- PWA configuration
- Documentation
- Deployment configuration

If the complete build cannot fit into one development session, implement the highest-priority vertical slice fully, document what is completed, and continue in the same order when execution resumes.

Never represent unfinished stages as implemented.

---

# 36. DEVELOPMENT EXECUTION RULES

You must not stop at a theoretical product plan.

You are instructed to produce actual application code and working UI.

If an existing repository is provided, inspect it before making changes and preserve working functionality.

If the repository is empty, establish the project using the agreed architecture.

Create a clear project structure, implement the shared design system, and begin building functional features.

Do not repeatedly ask questions already answered by this specification.

For minor unresolved design choices, use your expert judgement and document the decision.

For choices involving legal obligations, external costs, credentials, irreversible operations, or deployment, obtain required approval rather than guessing.

Before each major implementation stage:

- Define the expected user workflow
- Identify dependent data and API contracts
- Implement the necessary components
- Connect appropriate application state
- Test the workflow
- Review the responsive experience
- Verify that the feature actually works

Do not create purely decorative buttons or charts that imply nonexistent functionality.

Use reliable placeholder interfaces only where dependencies are genuinely missing, and clearly label their status.

Maintain a simple implementation progress record.

---

# 37. REQUIRED DELIVERABLES

Provide:

1. Competitor analysis and positioning summary.
2. Product requirements documentation.
3. Application architecture.
4. Original, replaceable DukaanSet brand assets.
5. Responsive marketing website.
6. Mobile-first authenticated application shell.
7. Reusable design system.
8. Complete onboarding and business-category selection.
9. English, Hindi, and Hinglish translations.
10. Dynamic dashboards for initial business categories.
11. Connected billing, inventory, customer, and payment workflows.
12. Purchase and supplier management.
13. Today's Work and daily closing.
14. Defined AI integration architecture.
15. Secure backend and database migrations.
16. Seed/demo data.
17. SEO configuration.
18. PWA configuration.
19. Automated tests.
20. Deployment documentation and environment variable examples.
21. README with local installation and run instructions.
22. Clear list of completed, partial, and future features.

Include genuine evidence of testing rather than unsupported quality claims.

---

# 38. FINAL PRODUCT VISION

DukaanSet should become a trusted daily business companion for Indian merchants.

A grocery shop owner should open it and immediately understand sales, payments, and stock.

A hardware store owner should find customer credit, supplier orders, and product quantities without navigating complex accounting screens.

A vegetable seller should update daily rates, record weight-based sales, and understand remaining stock.

Every merchant should see an experience that matches their business.

Every screen should work beautifully on mobile.

Every financial interaction should follow reliable logic.

Every label should be understandable.

Every important task should require as few reasonable steps as possible.

AI should make the product easier to use, not more confusing.

The entire experience should feel like one consistent product, from the first marketing page to the final daily business report.

**DukaanSet is not simply a billing app. It is a personalised operating system for everyday small-business operations.**

## NON-NEGOTIABLE FINAL INSTRUCTION

Prioritise **mobile-first UI/UX excellence** throughout the project.

Make the design unusually polished, deeply consistent, exceptionally practical, and commercially credible.

Do not sacrifice usability for visual decoration.

Do not sacrifice business correctness for speed.

Do not sacrifice security for convenience.

Do not copy competitor interfaces.

Do not create meaningless screens or fake interactions.

Think through the product, the user, the business logic, and the system architecture before making each major development decision.

Then build, test, review, and improve the application systematically.

**Our goal is to create one of the simplest and most thoughtfully designed business-management experiences for Indian shopkeepers.**

**Product:** DukaanSet

**Brand Promise:** Apni Dukaan, Sab Set.

**Primary Priority:** Exceptional mobile-first UI/UX.

**Engineering Priority:** Correct and secure business logic.

**Business Priority:** Make everyday shop operations easier.

**BEGIN IMPLEMENTATION NOW.**
