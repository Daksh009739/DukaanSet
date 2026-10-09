# DUKAANSET V2 — ULTIMATE MASTER PROMPT
## Transform the Existing Application Into a Premium, Fully Functional, Demo-Ready Multi-Business SaaS Product

### YOUR ROLE

Act as an elite team of Senior Full-Stack Engineers, SaaS Architects, Principal UI/UX Designers, Mobile Product Designers, Business Analysts, AI Engineers, QA Automation Engineers, and Product Managers.

You have been assigned to transform an already-developed first version of **DukaanSet** into a polished, commercially credible, fully interactive, mobile-first SaaS application.

**Product Name:** DukaanSet

**Tagline:** Apni Dukaan, Sab Set.

**Product Vision:** One smart platform for every type of local business.

**Target Audience:** Indian shopkeepers, kirana stores, hardware stores, vegetable sellers, wholesalers, mobile accessory shops, clothing stores, and other small businesses.

**Main Goal:** Deliver the strongest possible working product demonstration while building a reliable foundation for a real production SaaS business.

This is an existing project. You must inspect, understand, improve, and extend the current codebase instead of unnecessarily rebuilding everything from scratch.

---

# 1. MOST IMPORTANT INSTRUCTION

DO NOT BUILD A BASIC WEBSITE.

DO NOT BUILD ANOTHER GENERIC ADMIN DASHBOARD.

DO NOT ONLY CHANGE COLOURS AND FONTS.

DO NOT CREATE BEAUTIFUL SCREENS WITH NONFUNCTIONAL BUTTONS.

I want DukaanSet to look and behave like a serious, professionally engineered SaaS product.

The application must be:

- Visually premium
- Exceptionally mobile-friendly
- Simple enough for non-technical shopkeepers
- Fully responsive
- Functionally connected
- Logically organised
- Multilingual
- Business-type personalised
- AI-ready
- Scalable
- Secure
- Suitable for live product demonstrations

**UI/UX is the highest design priority, while financial accuracy, functionality, and security are non-negotiable engineering requirements.**

Every screen must have a purpose.

Every important button must perform a real action.

Every form must validate its data.

Every business operation must have a clearly defined workflow.

Every dashboard metric must originate from actual application data.

Do not present mock data as real data or unfinished features as completed.

---

# 2. FIRST, AUDIT THE EXISTING PROJECT

Before making changes:

1. Inspect the complete repository.
2. Understand the current frontend architecture.
3. Identify the backend and database setup.
4. Inspect the existing routes.
5. Review all available components.
6. Identify existing features and their actual functionality.
7. Locate incomplete integrations.
8. Identify UI inconsistencies.
9. Find nonresponsive screens.
10. Identify broken buttons, links, and forms.
11. Review authentication and authorisation.
12. Check existing database relationships.
13. Identify performance issues.
14. Inspect the current branding, assets, and design system.
15. Run existing tests and document current failures.

Prepare an internal audit containing:

- What already works
- What is partially implemented
- What is broken
- What is missing
- What should be redesigned
- What can be reused
- What should be refactored

Preserve existing working functionality and user data.

Do not destructively replace the application or database without a justified migration and a safe rollback strategy.

Then proceed with implementation.

---

# 3. RESEARCH MODERN SAAS UI AND COMPETITORS

Review current products such as:

- Vyapar
- myBillBook
- Khatabook
- Zoho Books
- Tally
- Marg ERP

Examine their publicly accessible product experiences, features, mobile interfaces, onboarding workflows, billing systems, inventory processes, reports, and usability patterns.

Identify proven interface patterns, but do not copy their visual designs.

Our main differentiation must be:

**DukaanSet should make everyday shop operations easier, faster, and more understandable.**

Existing competitors already provide many standard billing and inventory features.

Therefore, focus on superior integration, contextual actions, business-personalised workflows, and reduced interaction complexity.

If live browser research is unavailable, do not invent observations. Use established UX principles and clearly identify assumptions.

---

# 4. COMPLETE UI/UX REDESIGN — HIGHEST PRIORITY

Redesign and refine the entire application with a premium, consistent design system.

The visual result should feel comparable in polish to modern commercial SaaS products while remaining familiar to Indian shopkeepers.

## Design Direction

Use:

- Modern typography
- Excellent spacing
- Clean layouts
- Clear information hierarchy
- Premium cards
- Beautiful but restrained shadows
- Subtle gradients
- Consistent border radii
- Well-defined colour tokens
- Smooth microinteractions
- Meaningful illustrations
- Professional iconography
- Clear interactive states
- Elegant empty states
- Skeleton loaders
- Polished dialogs and bottom sheets
- Strong mobile navigation

Avoid:

- Cluttered dashboards
- Overdecorated layouts
- Excessive glassmorphism
- Random colours
- Confusing technical terminology
- Tiny mobile buttons
- Unnecessarily complex navigation
- Heavy animations
- Inconsistent component styling
- Generic template aesthetics

## Suggested Brand Colours

Primary Deep Teal: #103B36

Accent Mint: #22C99D

Warm Amber: #F5B942

Off-White: #F7FAF8

Charcoal: #273C38

Use accessible contrast and semantic colours for errors, warnings, success, and information.

## Typography

Use Inter or Manrope for English and Hinglish.

Use Noto Sans Devanagari for Hindi.

Maintain consistent responsive typography, clear monetary amounts, and excellent readability.

## Logo

Create or refine an original, modern DukaanSet logo.

Use a simple storefront-inspired identity with an optional checkmark concept representing "Sab Set."

Provide favicon, responsive logo variants, and PWA icons.

Make the logo replaceable from a central component and asset directory so that a new official logo can be introduced later.

---

# 5. MOBILE-FIRST EXPERIENCE — EXTREMELY IMPORTANT

Most target users will operate DukaanSet on smartphones.

Design the application primarily for mobile devices rather than scaling down the desktop interface.

Prioritise Android smartphones with small screens and moderate hardware.

Test representative screen widths:

- 320px
- 360px
- 375px
- 390px
- 412px
- 430px
- Tablet widths
- Desktop widths

## Mobile Experience Requirements

Create a premium app-like interface featuring:

- Compact top navigation
- Bottom navigation
- Prominent New Bill action
- Contextual quick actions
- Bottom sheets
- Thumb-friendly controls
- Large touch targets
- Sticky actions where useful
- Short forms
- Searchable product selectors
- Fast page transitions
- Accessible inputs
- Proper keyboard handling
- Smooth safe-area support
- No horizontal overflow

Suggested bottom navigation:

Home | Bills | Stock | More

The most important workflows must be accessible without opening multiple unnecessary pages.

### Mobile UX Rule

If the user wants to create a bill, they should not have to navigate through several menus.

If the user wants to view outstanding payments, they should see them immediately or through one obvious action.

If an item is running low, the user should be able to open its reorder workflow directly from the dashboard.

**Reduce the number of taps without removing necessary validation or confirmation.**

---

# 6. PREMIUM DASHBOARD REDESIGN

The dashboard must become the visual and functional centre of DukaanSet.

It must instantly answer:

- How much did I sell today?
- How much money did I receive?
- How much money is pending?
- Which products are running low?
- What work needs my attention?
- How is my business performing?

## Dashboard Sections

### A. Smart Header

Display:

- Business name
- Business selector
- Current date
- Language selector
- Notifications
- Profile menu

### B. Business Overview

Display four highly relevant metrics.

For a grocery shop:

- Today's Sales
- Money to Collect
- Low Stock
- Today's Bills

For a hardware shop:

- Today's Sales
- Customer Credit
- Low Stock
- Supplier Orders

For a vegetable shop:

- Today's Sales
- Remaining Stock
- Recorded Wastage
- Today's Bills

Use meaningful amounts and quantities based on actual database records.

### C. Quick Actions

Provide:

- New Bill
- Add Payment
- Add Stock
- Add Customer, where relevant

### D. Today's Work

Create an intelligent section that highlights important tasks.

Examples:

"5 customers have pending payments."

"3 products need restocking."

"2 product batches will expire soon."

"Today's closing is still pending."

Each item should open the relevant action immediately.

### E. Sales Summary

Provide a clean, understandable sales chart.

Support relevant date filters and accurate financial totals.

### F. Recent Transactions

Show recently completed sales and payments.

### G. AI Business Assistant

Offer contextual suggestions and quick questions.

The dashboard must remain clean and understandable, even with all these capabilities.

Use progressive disclosure rather than displaying every feature simultaneously.

---

# 7. MULTI-BUSINESS PERSONALISATION ENGINE

DukaanSet must support different kinds of businesses through one unified application.

During onboarding, ask users what type of business they operate.

Support:

1. Grocery / Kirana
2. Hardware / Electrical
3. Fruits / Vegetables
4. Mobile Accessories
5. Clothing / Fashion
6. General Store / Other

The selected business type must determine:

- Dashboard layout
- Key metrics
- Relevant navigation
- Product fields
- Inventory features
- Billing behaviour
- Reports
- Alerts
- AI suggestions

## Grocery-Specific Features

- Barcode-ready products
- Product batches
- Expiry tracking
- Packaged and loose goods
- Inventory alerts
- Customer credit

## Hardware-Specific Features

- Unit conversions
- Product variants
- Supplier management
- Bulk quantities
- Customer credit
- Reorder suggestions

## Vegetable-Specific Features

- Weight-based billing
- Daily price changes
- Fresh stock
- Remaining stock
- Wastage tracking
- Kilogram/gram conversions

## Clothing-Specific Features

- Size variations
- Colour variations
- Product variants
- Returns and exchanges

## Mobile Accessories Features

- Brand and model compatibility
- Product variations
- Warranty tracking
- Serial numbers where applicable

## Mixed Businesses

Allow users to enable additional modules where appropriate.

A general store selling groceries and vegetables should not need two completely separate applications.

Use a shared backend and configurable feature modules rather than creating duplicated systems.

---

# 8. FULLY FUNCTIONAL BILLING SYSTEM

The billing experience must be exceptionally fast.

Required features:

- Product search
- Product selection
- Quantity controls
- Selling price
- Discounts
- Customer selection
- Walk-in sales
- Cash payment
- Recorded UPI payment
- Partial payment
- Credit sales
- Invoice preview
- Invoice confirmation
- PDF generation
- Invoice download
- Print
- Share
- Returns and refunds
- Invoice history

## Important Business Example

A customer purchases products worth ₹1,000.

They pay ₹600.

The remaining ₹400 goes into their outstanding balance.

After invoice confirmation:

- Invoice is stored.
- Stock is adjusted.
- ₹600 is recorded as received.
- ₹400 is recorded as outstanding.
- Customer history is updated.
- Dashboard reports reflect the transaction.
- An audit record is created.

All related changes must be consistent.

Use safe transactions, validation, and idempotency to prevent partial or duplicate financial records.

Do not treat a manually recorded UPI payment as provider-verified payment confirmation.

---

# 9. INVENTORY MANAGEMENT

Implement complete inventory workflows.

Features:

- Add product
- Edit product
- Product categories
- SKU and optional barcode
- Cost price
- Selling price
- Quantity
- Unit
- Supplier
- Stock adjustment
- Stock history
- Low-stock warnings
- Purchase stock receipt
- Return stock adjustment
- Wastage records
- Product search and filters
- CSV import/export

Maintain a reliable inventory movement history.

Support business-specific product properties.

The user should be able to complete common inventory tasks directly from relevant alerts or contextual actions.

---

# 10. CUSTOMER AND UDHAR MANAGEMENT

Develop a complete credit-management system.

Features:

- Customer profiles
- Customer purchase history
- Outstanding balances
- Due dates
- Partial payments
- Payment history
- Customer statements
- Reminder drafts
- Search and filters

Provide simple headings such as:

"Paise Lene Hain"

"Payment Jodo"

"Customer Ka Hisaab"

Make customer balances clearly visible and traceable to actual transactions.

---

# 11. SUPPLIERS AND PURCHASES

Implement:

- Supplier profiles
- Purchase entry
- Purchase order drafts
- Product receiving
- Supplier payment tracking
- Supplier outstanding balances
- Purchase history
- Stock updates
- Reorder suggestions

Distinguish an order being placed from stock actually being received.

Do not increase inventory merely because a purchase-order draft was created.

---

# 12. DAILY CLOSING — IMPORTANT DIFFERENTIATOR

Create a premium feature called:

**Aaj Ka Hisaab**

It should show:

- Today's Sales
- Cash Collected
- Recorded UPI Payments
- Credit Sales
- Old Dues Collected
- Expenses
- Expected Cash
- Actual Cash
- Any Difference

Provide a simple daily closing workflow.

Allow owners to review the information and confirm the closing.

Maintain the appropriate financial history.

This feature should make shopkeepers want to open DukaanSet every day.

---

# 13. THREE-LANGUAGE SUPPORT

Implement complete language support:

1. English
2. Hindi
3. Hinglish

Examples:

Today's Sales / आज की बिक्री / Aaj Ki Bikri

New Bill / नया बिल / Naya Bill

Low Stock / कम स्टॉक / Stock Kam Hai

Money to Collect / लेने वाले पैसे / Paise Lene Hain

The entire application must translate:

- Navigation
- Headings
- Forms
- Buttons
- Notifications
- Errors
- Reports
- Dashboard labels
- Onboarding screens
- Help content
- AI responses

Store the selected language per user.

Support instant switching without logout.

Use a structured translation architecture.

Do not automatically translate customer names, product names or sensitive original records.

---

# 14. AI BUSINESS ASSISTANT

Make AI a meaningful part of DukaanSet.

Implement a contextual assistant capable of answering questions from authorised business records.

Examples:

"How much did I sell today?"

"Which customers have overdue payments?"

"What products are low in stock?"

"Which products sold the most?"

"How much money was collected this week?"

Use backend-approved tools and validated records.

AI must not fabricate amounts.

Future write-action capabilities may include:

- Draft an invoice
- Prepare reminders
- Suggest reorders
- Organise purchase information
- Suggest daily tasks

Financial changes must require user confirmation and backend permission checks.

If AI credentials are missing, provide a clearly labelled demo simulation only in demo mode. Never pretend a simulated AI response is connected to a real model or actual merchant records.

---

# 15. DEMO MODE — CRITICAL FOR TODAY'S PRESENTATION

Create a dedicated, polished **Demo Experience**.

The purpose is to let real shopkeepers and business partners understand DukaanSet through interaction.

## Demo Requirements

Provide fictional but realistic seeded businesses:

### Demo Business 1

Sharma Kirana Store

Products such as milk, rice, sugar, flour, and oil.

### Demo Business 2

Sharma Hardware Store

Products such as pipes, LED bulbs, fittings, switches, and tools.

### Demo Business 3

Fresh Sabzi Store

Products such as tomatoes, potatoes, onions, coriander, and spinach.

Each demo business should have:

- Products
- Customers
- Suppliers
- Sample invoices
- Payments
- Stock records
- Outstanding balances
- Dashboard metrics

## Interactive Demo Workflow

Allow the presenter to:

1. Open Demo Mode.
2. Select Grocery, Hardware, or Vegetable business.
3. Show the personalised dashboard.
4. Create a new invoice.
5. Record a partial payment.
6. Show the updated outstanding balance.
7. Open stock and verify the deduction.
8. View recent activity and reports.
9. Switch the application language.
10. Open Today's Work.
11. Demonstrate daily closing.
12. Explore AI assistance where properly implemented.

Provide a clear **Reset Demo Data** action.

Changes made during the demonstration must persist within the appropriate isolated demo workspace until reset.

Do not let demo actions change real merchant data.

Provide a prominent Demo Mode indicator.

Ensure that the entire walkthrough can be completed smoothly on a smartphone.

---

# 16. PUBLIC WEBSITE AND PARTNER PRESENTATION EXPERIENCE

Upgrade the marketing website to clearly explain the product.

A visitor should understand within seconds:

- What DukaanSet is
- Who it is designed for
- What problems it solves
- How it works
- Why it is useful
- How to try the demo

Required sections:

- Premium hero
- Clear product explanation
- Real-world problems
- Product solution
- Business categories
- Dashboard previews
- Billing walkthrough
- Feature overview
- AI assistant explanation
- Mobile application preview
- Three-language support
- How It Works
- Pricing or planned pricing
- FAQs
- Contact
- Footer

Include a prominent **Try Live Demo** CTA.

Use realistic product screenshots rather than unrelated decorative stock images.

Do not fabricate testimonials, customer counts, or certifications.

---

# 17. ANIMATIONS AND INTERACTIONS

Enhance the interface using subtle, intentional motion.

Consider:

- Smooth navigation transitions
- Card hover interactions
- Button press feedback
- Animated tab indicators
- Bottom sheet animations
- Skeleton loaders
- Elegant success confirmation
- Lightweight metric transitions
- Scroll-triggered marketing reveals
- Smooth accordion expansions

Avoid excessive animation and unnecessary 3D effects.

Optimise for lower-powered Android smartphones.

Support reduced-motion preferences.

---

# 18. SEARCH ENGINE OPTIMISATION

Improve the public website's SEO.

Include:

- Unique titles
- Meta descriptions
- Semantic headings
- Sitemap
- Robots configuration
- Canonical URLs
- Open Graph tags
- Appropriate structured data
- Descriptive alt text
- Fast page loading
- Mobile-first performance
- Internal linking
- Relevant business solution pages

Keep private application data inaccessible to search engines.

Create valuable product-specific content rather than low-quality keyword-stuffed pages.

---

# 19. PROGRESSIVE WEB APP AND FUTURE ANDROID APP

Make DukaanSet PWA-ready.

Implement:

- Web app manifest
- Installable application experience
- App icons
- Mobile splash branding
- Responsive application shell
- Network awareness
- Safe caching
- Offline fallback
- Draft preservation where feasible

Design the codebase so that future Android distribution can be evaluated.

Do not claim full offline financial transaction support unless safe synchronisation and conflict handling are implemented and tested.

---

# 20. SECURITY AND PRODUCTION ARCHITECTURE

Use the existing architecture where technically sound.

Improve it where necessary.

Recommended technology choices, if compatible with the repository:

- React / Next.js
- TypeScript
- Tailwind CSS
- Node.js
- PostgreSQL
- Prisma
- Zod
- TanStack Query
- Secure authentication
- Role-based access control

Requirements:

- Multi-tenant business isolation
- Secure authentication
- User roles and permissions
- Input validation
- Server-side financial calculations
- Transaction safety
- Idempotent financial operations
- Audit logs
- Secure file storage
- Rate limiting
- Safe error handling
- Environment variable management
- Database migrations
- Backups and recovery planning

A user must never access another business's data without explicit authorisation.

Do not store passwords, API keys, or sensitive secrets in frontend code.

---

# 21. FUNCTIONAL TESTING

Test every important workflow.

At minimum:

### UI Testing

- Mobile responsiveness
- Navigation
- Forms
- Dialogs
- Bottom sheets
- Language changes
- Empty states
- Loading states
- Error states

### Business Testing

- Invoice creation
- Stock deduction
- Partial payment
- Customer outstanding balance
- Product purchase
- Inventory receipt
- Daily closing
- Returns
- Report calculations

### Security Testing

- Authentication
- Protected routes
- Business isolation
- Role permissions
- Unauthorised requests

### Demo Testing

- Demo shop selection
- Demo reset
- Bill creation
- Dashboard updates
- Language switching
- Data isolation

Use automated tests where appropriate.

Provide a report containing actual passing tests, failures, and remaining limitations.

Never claim that the application is bug-free without evidence.

---

# 22. DEVELOPMENT PRIORITY

Since the application is intended for a demonstration today, prioritise a complete, reliable presentation path first.

## Priority 0 — Must Be Working for Demonstration

- Premium mobile UI
- Consistent branding
- Functional dashboard
- Business switching
- Grocery, Hardware, and Vegetable demo data
- Product listing
- New Bill
- Payment recording
- Automatic stock update
- Customer credit update
- Language switching
- Reports with real calculations
- Demo reset
- Reliable navigation

## Priority 1 — Complete Product Core

- Supplier management
- Purchases
- Expense tracking
- Daily closing
- Advanced inventory
- Roles and permissions
- Production database integration
- Data exports
- AI read-only assistant

## Priority 2 — Advanced Features

- Voice commands
- AI bill scanning
- WhatsApp Business integration
- Advanced forecasting
- Multi-branch support
- Full offline synchronisation
- Advanced industry-specific modules

Design the complete product architecture now, but do not undermine the working demonstration by attempting unfinished advanced integrations.

Implement as much of the full vision as can be genuinely completed and verified.

---

# 23. MANDATORY END-TO-END DEMONSTRATION SCENARIO

The following scenario must work:

A presenter opens DukaanSet on an Android-sized screen.

They select **Sharma Kirana Store**.

The dashboard displays sales, pending payments, stock alerts, and quick actions.

They tap **Naya Bill**.

They select products worth ₹850.

They choose an existing customer.

The customer pays ₹500.

They save the invoice with ₹350 remaining as credit.

The application then:

- Saves the invoice.
- Records ₹500 as received.
- Records ₹350 as outstanding.
- Deducts the products from stock.
- Updates customer history.
- Updates relevant dashboard totals.
- Updates recent activity.

The presenter switches to the customer profile and shows the ₹350 outstanding balance.

They switch the language from English to Hindi and then Hinglish.

They return to the dashboard and show the same business information in the selected language.

They switch to a vegetable store and demonstrate weight-based billing.

Then they switch to a hardware store and show its relevant inventory and customer-credit features.

The demonstration must be understandable to someone with no technical knowledge.

Use clear sample data and an isolated demo workspace.

---

# 24. FINAL CODE QUALITY REQUIREMENTS

Do not create giant monolithic components.

Keep:

- Reusable components
- Clear routing
- Feature-based architecture
- Reusable hooks
- Typed API contracts
- Centralised design tokens
- Translation dictionaries
- Shared validation rules
- Clear service boundaries
- Reliable state management
- Automated tests

Use readable, maintainable code.

Avoid duplicated business logic.

Handle edge cases.

Fix console errors and browser warnings.

Do not leave broken links or meaningless controls.

Do not hardcode sample business data into production calculation logic.

---

# 25. REQUIRED FINAL DELIVERABLES

Provide:

1. Enhanced DukaanSet source code.
2. Redesigned mobile-first UI.
3. Updated design system.
4. Reusable brand assets.
5. Working personalised dashboards.
6. Functional billing system.
7. Working inventory and customer credit flows.
8. Business-category switching.
9. English, Hindi, and Hinglish.
10. Interactive demo workspace.
11. Seeded demo data and reset capability.
12. Connected reports.
13. Updated marketing website.
14. Production-oriented backend architecture.
15. Working environment configuration.
16. Tests and test results.
17. Documentation.
18. Local setup instructions.
19. Deployment instructions.
20. A clear feature completion report.

Clearly identify:

- Fully implemented features
- Partially implemented features
- Demo-only capabilities
- Features awaiting API credentials
- Future features
- Known issues
- Remaining production-readiness work

If possible, provide a deployment preview and a runnable development environment.

Do not claim a deployment exists unless it has actually been created.

---

# 26. FINAL EXECUTION INSTRUCTION

Your responsibility is not merely to suggest improvements.

**Inspect the existing project and actually implement the improvements.**

Start with the mobile application shell and design system.

Then make the highest-priority demonstration workflows fully functional.

Extend the application systematically while maintaining working behaviour.

Run the project, inspect the actual rendered screens, test the interactions, and fix defects.

Make the user experience feel polished, original, fast, and dependable.

Whenever possible, validate the mobile experience through browser automation and screenshots.

The user must be able to demonstrate DukaanSet to:

- Local shopkeepers
- Business partners
- Potential customers
- Mentors
- Investors
- Technical collaborators

The product should clearly communicate its value through normal use rather than requiring a long technical explanation.

**Ultimate Vision:**

DukaanSet — a smart, multilingual, mobile-first operating system for India's local businesses.

**Primary Design Goal:** Exceptional UI/UX.

**Primary Functional Goal:** Reliable everyday business management.

**Primary Demonstration Goal:** A complete, realistic shopkeeper journey.

**Primary Long-Term Goal:** A scalable commercial SaaS product.

**BEGIN BY AUDITING THE EXISTING REPOSITORY, THEN IMPLEMENT THE ENHANCEMENTS. DO NOT STOP AT PLANNING OR DESIGN MOCKUPS.**
