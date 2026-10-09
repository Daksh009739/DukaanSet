# DUKAANSET V3 — COMPLETE SAAS ENHANCEMENT & DEMANDPULSE MASTER PROMPT

## BUILD A PREMIUM, MOBILE-FIRST, FULLY CONNECTED MULTI-BUSINESS APPLICATION

### PROJECT IDENTITY

**Product Name:** DukaanSet

**Tagline:** Apni Dukaan, Sab Set.

**Product Type:** Multi-Tenant, AI-Powered Business Management SaaS.

**Target Market:** Indian small businesses, kirana stores, hardware stores, vegetable sellers, clothing shops, mobile accessory shops, wholesalers, and other local merchants.

**Core Product Vision:** Make everyday business operations easier through personalised dashboards, connected workflows, voice assistance, customer management, smart inventory, and actionable business intelligence.

**New Signature Feature:** DukaanSet DemandPulse — Track missed customer demand and help merchants recover potential sales.

---

# 1. YOUR ROLE & RESPONSIBILITY

Act as a complete professional product development team:

- Principal SaaS Architect
- Senior Full-Stack Engineer
- Senior Mobile UI/UX Designer
- AI Product Engineer
- Database Architect
- Authentication and Security Engineer
- Product Manager
- Business Analyst
- Quality Assurance Engineer
- Accessibility Specialist
- Performance Engineer

Your assignment is to upgrade the EXISTING DukaanSet application into a polished, secure, production-oriented SaaS product.

You must inspect the current codebase, understand existing functionality, identify missing features, and implement the complete product vision systematically.

Do not unnecessarily rebuild working functionality.

Do not create a separate disconnected application.

Do not stop after designing static screens.

Implement real navigation, authentication, application state, database operations, API integration, business logic, and testing.

The application must be demonstrable to actual shopkeepers and business partners.

## MOST IMPORTANT RULE

**ADVANCED BACKEND. SIMPLE FRONTEND.**

The backend may contain sophisticated business logic, but the shopkeeper must see a clean, understandable, easy-to-use application.

Complexity should be handled internally by the system rather than transferred to the user.

---

# 2. START WITH A COMPLETE EXISTING PROJECT AUDIT

Before implementing new features:

1. Inspect the repository and project structure.
2. Identify the current frontend framework.
3. Identify existing APIs and backend services.
4. Understand database tables and relationships.
5. Review authentication implementation.
6. Inspect current dashboards.
7. Inspect inventory and sales workflows.
8. Inspect customer and payment functionality.
9. Identify incomplete modules.
10. Identify duplicated components.
11. Review responsive layouts.
12. Find broken buttons and routes.
13. Review existing language support.
14. Identify performance and accessibility problems.
15. Run existing tests.

Create an implementation checklist showing:

- Fully working features
- Partially implemented features
- Missing features
- Features requiring refactoring
- Security concerns
- UI/UX improvements

Preserve existing user data and working behaviour.

After the audit, implement enhancements using a coherent architecture.

---

# 3. COMPLETE LOGIN & REGISTRATION SYSTEM

This is a mandatory requirement.

The application must have a fully working user authentication system.

A visitor must not be able to access private merchant data without authentication and authorisation.

## Public Authentication Screens

Create premium, modern, responsive pages for:

- Register
- Login
- Forgot Password
- Reset Password
- Email Verification
- Logout
- Account Settings
- Session Expired
- Unauthorised Access

Use the existing authentication technology when it is secure and suitable.

Otherwise, implement a proven authentication solution compatible with the project's architecture.

## Registration Flow

A new user visits DukaanSet.

They tap:

**Get Started Free**

The system asks for the essential details:

- Full name
- Email address or supported phone-based identity
- Password where password authentication is used
- Password confirmation where appropriate

After successful registration and verification, guide the user through business onboarding.

Do not force unnecessary information during registration.

Do not implement fake OTP verification.

If phone OTP is provided, use a properly configured provider.

## Login Flow

The user enters their credentials.

After successful authentication:

1. Verify the account.
2. Retrieve the user's authorised businesses.
3. Determine the active business.
4. Load saved language preference.
5. Load business-specific feature settings.
6. Redirect to the appropriate dashboard.

Returning users must not repeat registration or onboarding.

## Authentication Security

Implement:

- Secure password hashing
- Proper session management
- Secure cookies or appropriately protected tokens
- Authentication rate limits
- Account recovery
- Session expiry handling
- Protected API routes
- CSRF protection where relevant
- Secure logout
- Server-side authorisation
- Safe handling of invalid login attempts

Never store plaintext passwords.

Never expose authentication secrets in frontend code.

---

# 4. BUSINESS ONBOARDING AFTER REGISTRATION

The onboarding process must be simple, fast, and visually polished.

The shopkeeper should understand what to do without needing technical training.

## Step 1 — Choose Language

Offer:

- English
- Hindi
- Hinglish

Save the preference immediately.

## Step 2 — Business Details

Ask:

- Shop name
- Primary business category
- Optional location
- Optional contact information

## Step 3 — Select Business Type

Provide visually understandable category cards:

- Grocery / Kirana
- Hardware / Electrical
- Fruits & Vegetables
- Clothing / Fashion
- Mobile Accessories
- General Store / Other

## Step 4 — Optional Quick Setup

Offer:

- Add First Product
- Import Products
- Try Demo Products
- Skip for Now

Do not require the owner to complete full inventory setup before exploring the dashboard.

## Step 5 — Personalised Dashboard

Redirect to the dashboard configured for the selected business.

### Important UX Requirement

Do not create a lengthy onboarding process with 10–15 mandatory pages.

Use progressive onboarding.

Collect additional details only when necessary.

---

# 5. COMPLETE MULTI-TENANT BUSINESS ARCHITECTURE

DukaanSet must be one platform supporting multiple independent businesses.

Each business must have isolated:

- Products
- Inventory
- Customers
- Invoices
- Payments
- Outstanding balances
- Suppliers
- Demand requests
- Reports
- Settings

A shopkeeper must never access another shop's information without authorisation.

## Multiple Business Accounts

One user may own multiple shops.

Example:

Sharma Kirana Store

Sharma Hardware Store

Sharma Vegetable Store

Provide a simple **Switch Business** option.

When the user switches businesses, the system must update:

- Dashboard
- Business name
- Products
- Customers
- Billing records
- DemandPulse
- Reports
- Enabled modules
- AI context

Never mix data across businesses.

---

# 6. SMART FEATURE MANAGEMENT — EXTREMELY IMPORTANT

DukaanSet will contain many powerful capabilities.

However, the interface must not become crowded.

Build a **Business Feature Configuration Engine**.

This engine decides which features are relevant to the selected business.

## Shared Core Features

- Dashboard
- Sales
- Inventory
- Customers
- Payments
- Udhaar
- Purchases
- Suppliers
- Reports
- Settings

## Advanced Features

- Voice Stock Entry
- Photo Sales
- DemandPulse
- Today's Work
- AI Assistant
- Daily Closing
- Expiry Tracking
- Wastage Tracking
- Product Variants
- Unit Conversion

## Business-Based Visibility

A grocery shop should prioritise expiry, packets, stock, and daily billing.

A hardware shop should prioritise units, supplier orders, customer credit, and stock.

A vegetable shop should prioritise weight billing, daily prices, and wastage.

A clothing shop should prioritise product variants, sizes, colours, sales, and returns.

Do not display irrelevant modules simply because the platform supports them.

### Feature Settings

Allow authorised owners to enable or disable optional modules from Settings.

A feature disabled in the UI must also be checked appropriately by the backend.

Never use frontend visibility as the only security mechanism.

### Contextual Feature Discovery

Show features when they become relevant.

Examples:

- Product out of stock → Offer Record Demand
- Customer payment pending → Offer Add Payment
- Product stock low → Offer Reorder
- Customer purchase completed → Update Customer History
- New stock received → Review related DemandPulse requests

The application should guide the user naturally instead of showing dozens of unrelated buttons.

---

# 7. REDESIGN THE MAIN DASHBOARD

Create a premium, mobile-first dashboard with a clear information hierarchy.

The dashboard must answer:

- How much did I sell today?
- How much money came in?
- How much money is pending?
- What stock is low?
- What needs my attention today?

## Recommended Dashboard Structure

### Top Header

- Business name
- Business switcher
- Language selector
- Notifications
- Profile

### Primary Metrics

Show four relevant business metrics.

Possible examples:

- Today's Sales
- Payments Received
- Money to Collect
- Low Stock

### Quick Actions

- New Bill
- Add Stock
- Add Payment

Show business-specific alternatives where helpful.

### Today's Work

Display the most important actionable tasks.

Examples:

"3 customers have pending payments."

"5 products need restocking."

"2 DemandPulse requests can be followed up."

### DemandPulse Preview

Show a compact card such as:

"8 customers requested unavailable products this week."

Provide one clear action:

**View Demand**

### Recent Activity

Display a small list of recent transactions and updates.

### AI Assistant

Provide a compact Ask AI entry point.

Do not overload the dashboard with unnecessary charts.

Advanced reports must remain available separately.

---

# 8. NEW X-FACTOR — DUKAANSET DEMANDPULSE

## FEATURE NAME

**DukaanSet DemandPulse**

## USER-FACING HEADING

English: Missed Customer Requests

Hindi: ग्राहकों को क्या नहीं मिला?

Hinglish: Customer Ko Kya Nahi Mila?

## MAIN PURPOSE

Track products requested by customers that were unavailable or could not be supplied.

Help merchants understand:

- What customers are asking for
- Which products are frequently unavailable
- Which products may need restocking
- Which customers requested those products
- Which customers can be contacted after restocking
- Which missed requests eventually became actual sales

This feature must integrate directly with existing Inventory, Customers, Purchases, Sales, and Today's Work.

Do not create a disconnected standalone dashboard.

---

# 9. REAL-WORLD DEMANDPULSE EXAMPLE

A customer visits Sharma Fashion Store.

The customer asks:

"Do you have a Blue Shirt in XL?"

The shopkeeper checks and discovers XL is out of stock.

The customer leaves without purchasing.

Normally, this missed demand may be forgotten.

With DukaanSet:

The shopkeeper taps:

**Nahi Mila**

They record:

Product: Blue Shirt

Size: XL

Requested Quantity: 2

Customer: Optional

Contact Permission: Optional

The system saves the request.

Later, additional customers request the same item.

DukaanSet aggregates the requests and shows the total requested quantity.

The owner can then prepare a reorder.

When stock arrives, eligible customer follow-ups become available.

If a customer eventually purchases the product, the original request can be connected to the confirmed invoice.

This creates a traceable missed-demand-to-sale workflow.

---

# 10. ONE-TAP DEMAND ENTRY

The most important UX goal is making demand capture extremely fast.

Provide an action:

**Nahi Mila**

It should be accessible from:

- Inventory product card
- Product search results
- Out-of-stock warning
- New Sale screen
- DemandPulse section

## Existing Product Request

If the user taps Nahi Mila from a product card, prefill:

- Product
- Variant, where relevant
- Product category

Ask only for:

- Requested quantity
- Optional customer
- Optional contact permission

## Product Not in Catalogue

Sometimes a customer asks for a product that the shop has never stocked.

The shopkeeper should still be able to record that demand.

Allow:

- Product name
- Optional category
- Requested variant
- Quantity
- Optional customer information

Do not force the user to create a full inventory product merely to record a request.

The request may remain an unmatched demand record until the owner decides to create or associate a catalogue product.

Keep this workflow simple and separate from the sales product-selection process.

---

# 11. DEMAND REQUEST DATA MODEL

Each demand request should capture appropriate fields:

- Unique request ID
- Business ID
- Existing product ID, if applicable
- Free-text product name, if no catalogue item exists
- Variant details
- Requested quantity
- Unit
- Optional customer ID
- Contact permission status
- Request date and time
- Request status
- Optional notes
- Linked purchase/order record, if applicable
- Linked sale invoice, if converted

Suggested statuses:

- Open
- Stock Ordered
- Stock Available
- Customer Contacted
- Converted to Sale
- Closed
- Cancelled

Make state transitions explicit.

Do not automatically treat every unavailable product request as a confirmed customer order.

---

# 12. SMART DEMAND AGGREGATION

DukaanSet should summarise recorded requests.

Example:

Blue Shirt XL

4 customer requests

8 pieces requested

Current Stock: 0

Show an action:

**Prepare Reorder**

### Important Accuracy Rules

Distinguish:

- Number of requests
- Total requested quantity
- Unique identified customers
- Confirmed customer orders
- Actual completed sales

These values are not interchangeable.

If an anonymous person requests two shirts, record one request for two pieces.

Do not automatically count two unique customers.

Deduplicate or identify repeat requests where there is sufficient reliable information.

Do not silently discard repeated legitimate demand.

---

# 13. DEMAND-BASED REORDER SUGGESTIONS

Integrate DemandPulse with the existing purchase and supplier workflow.

If several customers request an unavailable product, DukaanSet should suggest considering a reorder.

Example:

"Blue Shirt XL: 8 pieces requested. No stock available."

Provide:

- View Requests
- Prepare Reorder
- Dismiss Suggestion

## Reorder Logic

Use:

- Recorded demand
- Existing stock
- Recent sales
- Existing pending purchase orders
- Supplier information
- Minimum stock thresholds

Start with explainable rule-based suggestions.

Do not claim that every request will become a sale.

Do not automatically order goods from suppliers without owner approval.

Do not label speculative demand as guaranteed revenue.

---

# 14. STOCK ARRIVAL → DEMANDPULSE CONNECTION

This is a critical integration.

When new inventory is received:

1. Identify the actual product and variant.
2. Update inventory using the existing stock-in service.
3. Check unresolved DemandPulse requests.
4. Identify requests related to the received product.
5. Calculate available quantities.
6. Show appropriate follow-up opportunities.
7. Allow the owner to review the requests.

Example:

Blue Shirt XL had zero stock.

A new purchase receipt adds 10 XL shirts.

The system checks existing demand requests and shows:

"Blue Shirt XL is available again. Review pending customer requests."

Do not automatically reserve stock for customers unless a separate reservation workflow is explicitly implemented.

Do not send customer notifications automatically without the necessary permissions and messaging integration.

---

# 15. CUSTOMER FOLLOW-UP SYSTEM

If a customer gave appropriate contact permission and the shopkeeper saved their contact details, allow the owner to prepare a follow-up message.

Example:

"Hello Rahul, the Blue Shirt XL you asked about is available at our store. Please contact us if you are still interested."

Provide:

- View Customer
- Prepare Message
- Mark Contacted
- View Demand Request

Keep the process easy.

### WhatsApp Integration

Initial implementation may support user-initiated message sharing.

Advanced WhatsApp Business API features must follow applicable platform rules, consent requirements, approved templates, and messaging costs.

Never access private WhatsApp conversations without permission.

Never send unsolicited bulk marketing messages.

If the customer did not provide contact permission, retain the demand record without making it eligible for promotional follow-up.

---

# 16. RECOVERED SALES TRACKING

When a customer who previously requested an unavailable product returns and purchases it, allow the sale to be linked to the original DemandPulse request.

## Required Logic

Demand Request

→ Product Restocked

→ Customer Follow-Up, if applicable

→ Actual Sale

→ Confirmed Invoice

→ Recovered Sale Attribution

Only mark a request as converted after a valid sale has been saved and associated with the request.

Do not automatically mark a request converted merely because stock arrived.

Do not claim revenue from unfulfilled requests.

### Recovered Revenue

Calculate recoverable or recovered sales metrics carefully.

Actual recovered revenue must be based on confirmed attributable invoice amounts, accounting for relevant returns or cancellations.

Avoid counting the same invoice revenue twice if multiple demand requests reference the same purchase.

Provide a clear explanation of attribution rules.

---

# 17. DEMANDPULSE DASHBOARD

Create a simple, modern DemandPulse screen.

Do not use complex analytics terminology.

Recommended sections:

### Main Summary

- Requests Received
- Products Requested
- Stock Available Again
- Sales Recovered

### Top Requested Products

Show:

- Product name
- Variant
- Total requested quantity
- Current stock status

### Requests Requiring Attention

Examples:

- Products requiring reorder consideration
- Requests ready for follow-up
- Open requests with missing details

### Recent Requests

Use simple mobile cards.

Each card should have a clear primary action.

Avoid large desktop-style tables on mobile.

---

# 18. VOICE-POWERED DEMAND CAPTURE

Integrate the existing DukaanSet voice architecture.

A shopkeeper should be able to say:

"Aaj teen customers ne XL blue shirt maangi, available nahi thi."

The system should create an editable demand draft.

Another example:

"Do customers ne 2-inch PVC pipe maanga."

The system should understand the product description and proposed request information.

### Voice Processing Rules

- Support Hindi, English, and Hinglish speech.
- Extract products and variants.
- Extract quantities.
- Distinguish number of customers from requested units.
- Ask for missing information.
- Show an editable preview.
- Confirm before saving.
- Respect active business permissions.

Do not silently invent missing quantities.

Do not create an actual invoice from a demand request.

Do not use voice input to directly modify financial records without confirmation.

---

# 19. DEMANDPULSE + AI ASSISTANT

The DukaanSet AI Assistant should support questions such as:

- Which products did customers request but could not buy?
- Which sizes are most frequently unavailable?
- What should I consider ordering?
- Which requests are ready for customer follow-up?
- How many missed requests turned into actual sales?
- Show demand trends for the last 30 days.

AI must retrieve actual authorised records.

It must not invent statistics.

Where appropriate, the AI should explain why it recommends a reorder.

Example:

"Blue Shirt XL has 8 pieces of recorded unmet demand and no available stock. Review supplier availability before ordering."

This is a suggestion, not an automatic purchase instruction.

---

# 20. OPTIONAL FUTURE FEATURE — NEARBY SHOP NETWORK

Prepare the architecture for a future opt-in feature.

Concept:

A shopkeeper does not have the requested product.

Another participating DukaanSet merchant nearby may have it.

The system could facilitate a stock-availability enquiry.

Possible future workflow:

1. Merchant records missing product.
2. Merchant chooses Find Nearby Stock.
3. Authorised participating shops receive an appropriate availability request.
4. Another shop may respond.
5. Merchants coordinate fulfilment under agreed rules.

This is a future-phase marketplace/network capability.

Do not implement automatic cross-business stock visibility.

Do not disclose merchant inventory, customer identities, financial details, or contact information without suitable permissions.

Real geographic availability and fulfilment must be supported by verified data and explicit merchant participation.

Do not make this feature appear operational without an actual participating network.

---

# 21. INTEGRATE DEMANDPULSE WITH EXISTING MODULES

DemandPulse must connect with:

## Inventory

Stock availability, product variants, stock receipts.

## Sales

Create sale from eligible demand request and link confirmed invoice.

## Customers

Customer request history and authorised follow-ups.

## Purchases

Reorder drafts and supplier purchase information.

## Today's Work

Show relevant open demand tasks.

## Reports

Recorded demand, requests resolved, and confirmed attributed sales.

## AI Assistant

Explain relevant business opportunities using actual business data.

## Notifications

Show internal actionable alerts without unnecessary notification spam.

These integrations must reuse existing backend services where appropriate.

---

# 22. COMPLETE FEATURE MANAGEMENT UX

Now ensure that the overall DukaanSet application stays simple despite many modules.

The user must not see every feature at once.

## Recommended Mobile Navigation

Use a small number of core navigation destinations:

1. Home
2. Sales
3. Stock
4. More

Provide a prominent New Bill action.

Place relevant advanced modules inside contextual sections.

DemandPulse can be available through:

- Home's Today's Work
- Relevant stock cards
- Stock search
- More → DemandPulse

Do not force the shopkeeper to visit a dedicated DemandPulse page for every request.

## Contextual Actions

Product unavailable → Nahi Mila

Stock received → Review Demand

Customer has pending dues → Add Payment

End of day → Aaj Ka Hisaab

Product sold → Inventory updates automatically

Each workflow should connect directly to the next meaningful action.

## User Experience Principle

**Show the right feature at the right moment.**

Do not overwhelm users with all the platform's capabilities.

---

# 23. OWNER & STAFF ROLES

Implement proper business roles.

Suggested roles:

- Owner
- Manager
- Staff

An owner can manage business settings, users, and relevant administrative controls.

Staff members should only access the operations authorised by the owner.

Possible permissions:

- Create sales
- View customer accounts
- Record payments
- Manage stock
- View reports
- Manage DemandPulse
- Edit business settings
- Manage team members

Use server-side permissions.

Do not rely only on hiding buttons.

---

# 24. THREE-LANGUAGE SUPPORT

The entire application must support:

- English
- Hindi
- Hinglish

Example DemandPulse labels:

English: Record Missed Demand

Hindi: ग्राहक की मांग दर्ज करें

Hinglish: Nahi Mila? Note Karo

English: Stock Available Again

Hindi: सामान फिर उपलब्ध है

Hinglish: Maal Wapas Aa Gaya

English: Follow Up

Hindi: ग्राहक से संपर्क करें

Hinglish: Customer Se Baat Karo

Translate headings, buttons, forms, notifications, errors, help text, and relevant reports.

Persist language preference per user.

Allow instant switching without logout.

Original customer and product data must remain unchanged.

---

# 25. PREMIUM MOBILE-FIRST DESIGN

Refine the entire user interface to match DukaanSet's premium brand identity.

Suggested palette:

Deep Teal: #103B36

Mint: #22C99D

Warm Amber: #F5B942

Off-White: #F7FAF8

Charcoal: #273C38

Implement:

- Modern typography
- Consistent spacing
- Premium dashboard cards
- Clear quick actions
- Mobile bottom navigation
- Accessible bottom sheets
- Responsive forms
- Touch-friendly controls
- Searchable lists
- Smooth lightweight interactions
- Clear loading states
- Meaningful empty states
- Readable financial information

Test common mobile widths from 320px upward.

The product must remain practical on affordable Android smartphones.

Avoid excessive animations, nested menus, and unnecessary visual complexity.

---

# 26. CUSTOMER 360° + DEMAND HISTORY

Extend the existing Customer 360° profile.

Show:

- Customer purchase history
- Payment history
- Outstanding balance
- Recent demand requests
- Requested products
- Contact permission status
- Follow-up history, where applicable

The customer profile should clearly distinguish completed purchases from products merely requested.

Do not mix purchase totals with speculative demand values.

Provide contextual actions that respect the customer's contact preferences.

---

# 27. REQUIRED BACKEND ARCHITECTURE

Inspect and reuse the existing application architecture where suitable.

A recommended stack, if compatible:

- Next.js / React
- TypeScript
- Node.js
- PostgreSQL
- Prisma
- Tailwind CSS
- Secure authentication
- Zod validation
- TanStack Query

Define services such as:

- AuthenticationService
- BusinessService
- BusinessSettingsService
- InventoryService
- SalesService
- CustomerService
- PaymentService
- PurchaseService
- DemandPulseService
- DemandAggregationService
- DemandFollowUpService
- DemandConversionService
- NotificationService
- AIService

Business rules must be enforced on the backend.

Use proper multi-tenant isolation.

---

# 28. DATABASE REQUIREMENTS

Reuse existing tables and introduce the necessary new entities through safe migrations.

Core entities include:

- Users
- Businesses
- Business Memberships
- Business Settings
- Products
- Product Variants
- Inventory Movements
- Customers
- Invoices
- Invoice Items
- Payments
- Purchases
- Suppliers
- Notifications
- Audit Logs

New DemandPulse entities may include:

### DemandRequests

- ID
- Business ID
- Customer ID, optional
- Product ID, optional
- Free-text product name
- Variant description
- Requested quantity
- Unit
- Status
- Requested timestamp
- Notes
- Created by

### DemandFollowUps

- ID
- Demand Request ID
- Contact channel
- Permission reference
- Follow-up status
- Timestamp
- Created by

### DemandConversions

- ID
- Demand Request ID
- Linked Invoice ID
- Linked Invoice Item ID, where applicable
- Attributed quantity
- Attributed amount
- Conversion timestamp

### ProductAliases

Use existing product alias functionality where available, without forcing sales to use AI matching.

### BusinessFeatureSettings

Store enabled modules and relevant business configuration.

Define appropriate foreign keys, indexes, constraints, status transitions, and tenant-scoping rules.

Protect against duplicate conversion attribution.

---

# 29. SECURITY & PRIVACY

Implement:

- Secure authentication
- Role-based access control
- Tenant isolation
- Backend validation
- Rate limiting
- Safe file handling
- Audit history
- Protected customer data
- Secure session management
- Appropriate deletion and retention controls

Protect customer contact information.

Do not automatically contact customers without an appropriate permission basis.

AI tools must respect authenticated business and role restrictions.

Do not expose stock data between unrelated businesses.

---

# 30. COMPLETE PRODUCT DEMO MODE

Build an isolated, resettable demonstration environment.

This must help business partners and shopkeepers understand the product without needing a long explanation.

## Demo Business A — Sharma Fashion Store

Products:

- Blue Shirt — XL
- White Shirt — M
- Black T-Shirt

Create example demand requests for out-of-stock XL shirts.

## Demo Business B — Sharma Kirana Store

Products:

- Milk
- Rice
- Flour
- Dal
- Oil

Create examples of customers requesting unavailable brands or package sizes.

## Demo Business C — Sharma Hardware Store

Products:

- PVC Pipes
- Electrical Switches
- LED Bulbs
- Fittings

Create example demand requests for missing pipe sizes.

## Demo Flow

1. Open the public DukaanSet website.
2. Select Try Demo.
3. Choose a demo business.
4. View its personalised dashboard.
5. Open Inventory.
6. Find an unavailable product.
7. Tap Nahi Mila.
8. Record a customer request.
9. View the DemandPulse summary.
10. Prepare a reorder draft.
11. Receive stock through the existing Stock In workflow.
12. Review available-again demand requests.
13. Prepare a customer follow-up where permission exists.
14. Create a real demo sale against the stock.
15. Link the sale to the demand request.
16. Verify updated inventory and customer history.
17. Show the confirmed recovered-sale record.
18. Switch to Hindi or Hinglish.
19. Verify the same data in the selected language.
20. Reset the demo safely.

Use actual application business logic with fictional, isolated seed data.

Do not hardcode fake successful transitions.

If a real communication integration is unavailable, simulate only the presentation layer and clearly label it as a demo.

---

# 31. COMPLETE USER JOURNEY AFTER LOGIN

The application's primary journey must be:

Register

→ Verify Account

→ Select Language

→ Set Up Business

→ Open Personalised Dashboard

→ Add Products

→ Create Sales

→ Automatically Update Inventory

→ Track Customer Payments

→ Record Missed Demand

→ Review Reorder Suggestions

→ Receive Stock

→ Follow Up With Eligible Customers

→ Track Actual Recovered Sales

→ Review Daily Business Summary

Returning users should login and land directly on their saved business dashboard.

Every stage must have a clear path forward.

Do not make users complete optional features before performing everyday business tasks.

---

# 32. NOTIFICATION MANAGEMENT

Create a simple notification system.

Avoid excessive alerts.

Prioritise:

- Customer payment reminders
- Important stock shortages
- DemandPulse follow-up opportunities
- Relevant purchase receipts
- Important system messages

Group duplicate notifications.

Allow users to control optional notification categories.

Do not let informational notifications obscure critical business actions.

Use in-app notifications initially.

External notification channels can be added through authorised integrations.

---

# 33. AUTOMATED TESTING

Implement and execute tests for:

- Registration
- Login
- Logout
- Password reset
- Account verification
- Protected routes
- Business onboarding
- Business switching
- Language persistence
- Feature permissions
- Demand request creation
- Existing-product demand
- Uncatalogued-product demand
- Demand aggregation
- Reorder suggestion logic
- Stock receipt integration
- Demand follow-up eligibility
- Demand conversion attribution
- Linked invoice creation
- Customer purchase history
- Inventory correctness
- Multi-tenant isolation
- Mobile responsiveness
- Demo reset
- Network and API failures

Important acceptance rules:

- No unauthorised business access.
- No unconfirmed demand counted as actual sales.
- No duplicate recovered revenue.
- No silent customer messaging.
- No stock changes merely from demand creation.
- No demand request automatically converted when stock arrives.
- No broken mobile navigation.
- No fake successful financial updates.
- No cross-tenant information leakage.

Provide actual test results and document unresolved defects.

---

# 34. IMPLEMENTATION PRIORITIES

## Phase 1 — Core User Experience

- Existing project audit
- Premium mobile UI redesign
- Functional login and registration
- Secure business onboarding
- Personalised dashboards
- Business switching
- Three-language support
- Smart navigation and feature visibility

## Phase 2 — Complete DemandPulse Core

- Nahi Mila action
- Demand request form
- Existing and uncatalogued products
- Quantity recording
- Demand history
- Demand aggregation
- Reorder draft preparation
- Today's Work integration

## Phase 3 — Connected Demand Recovery

- Stock receipt integration
- Available-again detection
- Customer follow-up records
- Consent-aware message preparation
- Invoice-linked demand conversions
- Actual recovered-sales reporting

## Phase 4 — AI and Voice Enhancements

- Voice demand capture
- AI-based summaries
- Explainable reorder suggestions
- Better natural-language interactions
- Multilingual improvement

## Phase 5 — Advanced Network Features

- Opt-in nearby merchant network
- Availability enquiries
- Supplier discovery integrations
- Advanced demand forecasting
- Cross-shop coordination with permission controls

Do not compromise the functional core by rushing unfinished advanced integrations.

---

# 35. REQUIRED FINAL DELIVERABLES

Provide:

1. Updated DukaanSet application source code.
2. Fully working authentication.
3. Registration and onboarding.
4. Business-personalised dashboards.
5. Business switching.
6. Smart feature configuration.
7. Enhanced mobile design system.
8. DemandPulse module.
9. One-tap Nahi Mila entry.
10. Demand aggregation.
11. Demand history.
12. Reorder draft integration.
13. Stock availability integration.
14. Consent-aware customer follow-ups.
15. Actual sale conversion tracking.
16. Customer 360° integration.
17. AI assistant integration where configured.
18. Voice demand entry where implemented.
19. Three-language support.
20. Working demo workspaces.
21. Backend APIs and database migrations.
22. Authorisation and security protections.
23. Automated tests and results.
24. Deployment documentation.
25. Feature completion and limitations report.

Do not represent incomplete integrations as fully working.

---

# 36. FINAL QUALITY REQUIREMENTS

The entire application should feel like one polished product.

No disconnected features.

No confusing navigation.

No inconsistent design patterns.

No meaningless buttons.

No unnecessary repeated inputs.

No fake financial calculations.

No invented AI results.

No unsupported claims of production readiness.

Every feature should have a logical purpose and clear connection to the user's business workflow.

Review actual mobile screens and test the complete product journey.

Refine the design until the primary user flows are clear, consistent, responsive, and pleasant to use.

Prioritise practical usability over visual decoration.

---

# FINAL EXECUTION INSTRUCTION

Do not stop after writing a plan.

Inspect the existing DukaanSet codebase and implement the requested features.

Build the application in coherent, testable stages while preserving working functionality.

The final demonstration should make it obvious how DukaanSet helps a real shopkeeper:

1. Manage daily sales and stock.
2. Track customer money and purchases.
3. Record missed demand.
4. Identify useful reorder opportunities.
5. Contact interested customers appropriately.
6. Track actual sales recovered from those requests.
7. Understand the business from one simple dashboard.

### PRODUCT DIFFERENTIATION

Traditional billing software focuses mainly on transactions and records.

DukaanSet should help merchants manage transactions **and take action on unmet customer demand**.

### FINAL PRODUCT PROMISE

**DukaanSet — Sirf Jo Bika Uska Nahi, Jo Bik Sakta Tha Uska Bhi Hisaab.**

**BEGIN IMPLEMENTATION IN THE EXISTING DUKAANSET APPLICATION.**
