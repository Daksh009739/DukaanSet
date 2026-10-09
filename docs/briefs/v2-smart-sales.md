# DUKAANSET V2 — FINAL SMART SALES & AUTOMATIC BUSINESS MANAGEMENT MASTER PROMPT

## BUILD A PREMIUM, MOBILE-FIRST, FULLY FUNCTIONAL SALES SYSTEM

### PROJECT INFORMATION

**Product:** DukaanSet

**Tagline:** Apni Dukaan, Sab Set.

**Feature:** Smart Sales, Photo Attachments, Automatic Inventory Deduction, Customer 360°, Payments and Udhaar Management.

**Project Type:** Multi-Business SaaS Application

**Target Users:** Indian shopkeepers, small businesses, grocery stores, clothing stores, hardware stores, vegetable sellers, mobile accessory shops and wholesalers.

**Main Priority:** Exceptionally simple mobile UI/UX with accurate, automatically connected business operations.

---

# 1. YOUR ROLE

Act as an expert team consisting of:

- Principal Product Designer
- Senior Mobile UI/UX Designer
- Senior Full-Stack Developer
- SaaS System Architect
- Backend and Database Engineer
- Business Logic Specialist
- Quality Assurance Engineer
- Application Security Engineer

Your responsibility is to upgrade the **existing DukaanSet application**, not build an unrelated application from scratch.

Inspect the existing repository, understand the current architecture and extend its billing, inventory, customers, payments and reporting modules.

Preserve working functionality.

Refactor weak or duplicated logic where necessary.

Build the requested feature as a fully connected, commercial-quality product experience.

Do not stop after creating UI mockups.

Implement the real workflow, backend services, database updates, and automated tests.

---

# 2. THE EXACT PRODUCT REQUIREMENT

The shopkeeper already maintains products inside DukaanSet's Inventory module.

Example:

**Inventory Before Sale**

Product: Blue Casual Shirt

Available Quantity: 4 pieces

Selling Price: ₹899 per piece

A customer visits the shop and purchases two shirts.

The shopkeeper must be able to:

1. Open New Sale.
2. Select Blue Casual Shirt from existing inventory.
3. Enter quantity 2.
4. Optionally upload or capture a shirt photograph.
5. Select an existing customer or add a new customer.
6. Record the payment method and amount.
7. Tap Save Sale.

When the transaction is successfully saved, DukaanSet must automatically:

- Generate the invoice.
- Reduce Blue Shirt stock from 4 to 2.
- Save the customer purchase.
- Record the amount received.
- Calculate outstanding money.
- Update the customer's account.
- Update sales reports.
- Update relevant dashboard values.
- Create inventory movement history.
- Save the transaction date and time.

**The shopkeeper must not enter the same transaction again in Inventory, Customer Ledger or Reports.**

One sale should automatically update every related business record.

---

# 3. NON-NEGOTIABLE SIMPLICITY RULES

This is extremely important.

DO NOT implement:

- AI product-photo recognition.
- AI-based product matching.
- Image similarity scores.
- Product matching verification screens.
- Automatic product identification from images.
- Multiple unnecessary confirmation pages.
- Separate manual stock-deduction steps.
- Repeated customer-detail forms.
- Unnecessary accounting terminology.
- Complicated navigation for basic sales.

The product selected from the existing inventory is the authoritative product reference.

A photo is an optional sale attachment, not a product identifier.

If New Sale is opened from an inventory product card, automatically preselect that product.

If New Sale is opened from the dashboard, show a searchable inventory product list.

**The final Save Sale action is the user's confirmation.**

Show an understandable order summary on the same screen before saving.

Keep exceptional warnings and validation inline wherever possible.

---

# 4. PREMIUM MOBILE-FIRST SALES UI

Completely enhance the Sales module's visual design.

The interface must look like a polished modern Android business application.

Follow DukaanSet's established brand identity:

- Deep Teal: #103B36
- Mint: #22C99D
- Amber: #F5B942
- Off-White: #F7FAF8
- Charcoal: #273C38

Use:

- Excellent visual hierarchy
- Professional typography
- Spacious layouts
- Large touch targets
- Rounded product cards
- Clean input fields
- Helpful icons
- Lightweight animations
- Bottom sheets
- Sticky actions
- Consistent spacing
- Attractive empty states
- Clear feedback

Optimise for 320px, 360px, 375px, 390px, 412px and 430px mobile widths, with responsive tablet and desktop layouts.

Prevent horizontal scrolling, overflowing text, keyboard overlap and hidden primary buttons.

Do not add unnecessary animations that make the app slow.

---

# 5. EXACT NEW SALE SCREEN STRUCTURE

Create one logically organised sales screen.

## Section A — Header

Display:

- Back button
- New Sale heading
- Optional Save Draft action
- Active business context where useful

## Section B — Select Products

Provide:

- Product search
- Product thumbnails
- Product names
- Selling prices
- Available quantities
- Relevant product variants
- Frequently selected products

Selecting a product should add it directly to the current sale.

Avoid requiring an extra product-details page.

## Section C — Selected Items

Show:

- Product image
- Product name
- Variant
- Quantity
- Price
- Line total
- Remove option

Provide large plus and minus controls.

Also allow direct quantity entry.

## Section D — Optional Photo

Provide:

- Take Photo
- Upload From Gallery
- Image Preview
- Replace Image
- Remove Image

Associate the attachment with the correct invoice item.

For invoices containing multiple products, allow an attachment to be associated with a specific line item.

Do not force the owner to upload photographs for every sale.

## Section E — Customer

Provide:

- Search Customer
- Select Existing Customer
- Add New Customer
- Walk-in Customer

Keep customer selection fast.

## Section F — Payment

Provide:

- Cash
- Online / UPI
- Udhaar
- Split Payment

## Section G — Order Summary

Display:

- Number of items
- Subtotal
- Discounts
- Applicable taxes
- Final total
- Payment received
- Pending amount

## Primary Action

**Save Sale**

Place a prominent action near the bottom of the screen.

The button must remain accessible on mobile.

When saving, show a loading state and prevent duplicate submissions.

---

# 6. MULTIPLE PRODUCTS IN ONE SALE

Support more than one product per invoice.

Example:

Blue Shirt × 2

Black T-Shirt × 1

Denim Jeans × 1

All selected items must appear on the same invoice.

Calculate their totals correctly.

When saved, decrease stock separately for each product or variant.

Maintain a single coherent invoice with individual invoice items.

Do not create unnecessary separate invoices for products purchased together.

---

# 7. AUTOMATIC INVENTORY DEDUCTION

This is one of the most important backend requirements.

Example:

Initial stock: 4 Blue Shirts

Sold quantity: 2

Remaining stock: 2

The system must automatically calculate and persist the correct remaining quantity after a successful sale.

### Required Backend Flow

1. Authenticate the user.
2. Verify access to the selected business.
3. Verify sales permissions.
4. Validate products and variants.
5. Validate quantities.
6. Validate stock availability.
7. Calculate invoice totals.
8. Create invoice and invoice items.
9. Create payment and ledger records.
10. Create inventory deduction records.
11. Update available stock consistently.
12. Write transaction audit information.
13. Commit the database transaction.
14. Return the saved invoice.
15. Refresh frontend data.

All connected financial and inventory operations must be atomic where appropriate.

A failed sale must not partially reduce stock.

### Insufficient Stock

If only 4 shirts are available and the user enters 6, display:

English: Only 4 shirts are available.

Hindi: स्टॉक में केवल 4 शर्ट उपलब्ध हैं।

Hinglish: Sirf 4 shirts stock mein hain.

Allow the user to correct the quantity immediately.

### Concurrency and Duplicate Protection

Two staff members may sell the same product simultaneously.

Protect stock correctness using suitable database locking or conditional inventory updates.

Use idempotency keys to ensure repeated Save taps do not create duplicate sales or stock deductions.

If variants exist, deduct the correct variant.

For example, Size M stock must not be deducted from Size L.

---

# 8. OPTIONAL PHOTO ATTACHMENT SYSTEM

Allow photos without making the sale complicated.

The image should be used for:

- Sale documentation
- Invoice-item reference
- Customer purchase history
- Optional product identification by the shopkeeper

It must not trigger AI matching.

### Image Requirements

- Camera capture
- Gallery upload
- Image preview
- Replace or remove
- Upload progress
- File validation
- Appropriate compression
- Secure storage
- Business-level access control

Preserve the sale draft if an image upload fails.

Allow the user to continue without the optional attachment.

Use the existing product image as the default thumbnail where appropriate.

---

# 9. SIMPLE CUSTOMER MANAGEMENT

Allow the shopkeeper to select or create customers within the New Sale workflow.

Customer details may include:

- Name
- Phone number
- Optional email
- Optional address

Avoid unnecessary mandatory fields.

Do not require a phone number for every fully paid walk-in sale.

For credit transactions, require an appropriate customer account so outstanding amounts can be tracked.

### Quick Add Customer

Open a compact mobile bottom sheet.

Enter basic customer details.

Save and return directly to the unfinished sale.

Previously selected products, quantities and payments must remain intact.

### Duplicate Customer Handling

Search existing customers before creating a new record.

If a phone number matches an existing profile, suggest it.

Never automatically merge different customers based only on a shared number.

---

# 10. COMPLETE PAYMENT SYSTEM

Support four payment types.

## Cash

Record the received cash amount.

## Online / UPI

Allow the shopkeeper to record money received through an online method.

Manually recorded UPI payments must not be labelled bank-verified unless an authorised payment integration confirms them.

## Udhaar

Allow a customer to pay later.

Record the outstanding amount against the correct customer.

## Split Payment

Allow a combination of payment methods.

### Example

Blue Shirt × 2 = ₹1,798

Cash Received = ₹1,000

Online Payment Recorded = ₹500

Pending = ₹298

Automatically calculate:

Outstanding = Invoice Total − Recorded Valid Payments.

Prevent unintended overpayments.

Provide clear payment status labels:

- Paid
- Partially Paid
- Unpaid
- Refunded, where applicable

Use exact financial arithmetic.

Do not calculate final authoritative amounts exclusively on the frontend.

---

# 11. AUTOMATIC CUSTOMER PURCHASE HISTORY

Every saved customer-linked sale must appear automatically inside the customer's profile.

Required information:

- Invoice number
- Date
- Time
- Product names
- Product thumbnails
- Product variants
- Quantities
- Unit prices
- Total amount
- Payment methods
- Payments received
- Outstanding balance
- Payment status
- Returns or refunds, when applicable

### Example Customer Purchase

Customer: Rahul Sharma

Date: 9 October 2026

Product: Blue Casual Shirt

Quantity: 2

Total: ₹1,798

Cash: ₹1,000

Online: ₹500

Pending: ₹298

Status: Partially Paid

The shopkeeper must be able to open Rahul Sharma's profile and view this purchase without manually entering any information again.

Preserve historical invoice snapshots.

Changing a product's current catalogue price must not rewrite an older invoice.

---

# 12. CUSTOMER 360° DASHBOARD

Upgrade the Customer module into a simple but comprehensive customer profile.

Display:

- Customer name
- Contact details
- Total shopping
- Total payments
- Current outstanding amount
- Recent purchases
- Payment history
- Purchase timeline

Provide quick actions:

- New Sale
- Add Payment
- View Bills
- Prepare Reminder
- View Statement

The customer profile should be understandable on a single mobile screen, using expandable history rather than excessive navigation.

### Outstanding Balance Logic

Example:

Previous balance: ₹2,000

New credit sale: ₹298

Updated balance: ₹2,298

Later payment: ₹1,000

Remaining balance: ₹1,298

All changes must be traceable to invoices and payment records.

Do not maintain inaccurate duplicate balance calculations.

---

# 13. CUSTOMER PAYMENT COLLECTION

Allow the shopkeeper to collect older outstanding amounts directly from a customer profile.

Use a simple Add Payment interface.

Fields:

- Amount
- Payment method
- Date
- Optional note

Allocate the payment to appropriate invoices using an explicit or clearly defined allocation rule.

Update:

- Customer outstanding balance
- Payment history
- Relevant invoice payment status
- Dashboard collections
- Related reports

Do not treat a payment towards an old invoice as a new product sale.

---

# 14. SALES HISTORY AND INVOICES

Create a complete Sales History module.

Display:

- Invoice number
- Date
- Customer
- Product summary
- Total amount
- Received amount
- Outstanding amount
- Status

Support:

- Search
- Date filtering
- Customer filtering
- Payment-status filtering
- Invoice viewing
- PDF download
- Printing
- Sharing
- Refunds and returns where implemented

On mobile, prefer readable cards rather than overly wide tables.

Show relevant details immediately.

---

# 15. RETURNS, REFUNDS AND EXCHANGES

Support appropriate post-sale operations.

Examples:

- Customer returns a shirt.
- Customer exchanges Size M for Size L.
- A product is damaged.
- A sale is cancelled.

Use traceable transaction adjustments.

Do not silently delete completed invoices.

A returned product should increase sellable stock only when it is actually accepted as resellable.

Damaged products must be handled separately.

Financial refunds must correctly affect invoice balances, payment records and customer history.

For exchanges, update the relevant product variants.

---

# 16. BUSINESS-SPECIFIC SALES EXPERIENCE

The Sales module must support the same multi-business system as DukaanSet.

## Clothing

- Sizes
- Colours
- Variants
- Product photographs
- Exchanges

## Grocery

- Quick product search
- Packets and loose products
- Barcode-ready catalogue
- Fast billing

## Hardware

- Pieces
- Boxes
- Metres
- Product specifications
- Bulk quantities

## Vegetables

- Kilograms
- Grams
- Daily prices
- Weight-based billing

## Mobile Accessories

- Compatible models
- Colour variants
- Warranty information where applicable

Use a shared sales engine with configurable fields.

Do not build separate duplicated billing systems for each business category.

---

# 17. THREE-LANGUAGE SUPPORT

The complete Sales module must support:

1. English
2. Hindi
3. Hinglish

Translate:

- Headings
- Buttons
- Labels
- Form instructions
- Validation messages
- Payment statuses
- Success messages
- Customer history labels
- Sales reports

Example:

English: New Sale

Hindi: नई बिक्री

Hinglish: Nayi Bikri

English: Money Pending

Hindi: बकाया पैसे

Hinglish: Paise Baaki Hain

English: Save Sale

Hindi: बिक्री सेव करें

Hinglish: Sale Save Karo

Use the existing translation system.

Remember the user's selected language across sessions.

Changing language must not discard the current sale draft.

Do not automatically translate stored customer names or product identities.

---

# 18. COMPLETE DASHBOARD CONNECTION

Every successful sale must automatically update relevant dashboard information.

Examples:

- Today's Sales
- Today's Bills
- Amount Collected
- Outstanding Payments
- Recent Sales
- Low Stock Alerts
- Sales Reports

Important accounting distinction:

Invoice Total: ₹1,798

Payment Collected: ₹1,500

Outstanding: ₹298

The dashboard must not incorrectly show ₹1,500 as the total value of the sale.

Sales, collections, outstanding money and profit are different concepts.

Use clear labels and consistent calculations.

---

# 19. POLISHED SALE SUCCESS EXPERIENCE

After successful saving, show:

**Sale Saved Successfully**

Invoice Number

Total Amount

Amount Received

Pending Amount

Stock Updated

Provide actions:

- View Invoice
- Share Invoice
- Open Customer
- New Sale
- Back to Dashboard

Do not show success before the backend transaction completes.

Keep the interface concise and professional.

If saving fails, preserve the draft and provide a clear recovery action.

---

# 20. TECHNICAL ARCHITECTURE

Inspect the existing project and reuse its working architecture.

Recommended logical frontend components:

- NewSalePage
- ProductSelector
- ProductCard
- SelectedSaleItem
- QuantityControl
- SalePhotoUploader
- CustomerSelector
- QuickCustomerForm
- PaymentSelector
- SplitPaymentForm
- SaleSummary
- SaveSaleButton
- SaleSuccessView
- SalesHistory
- CustomerProfile
- PurchaseTimeline

Recommended backend service boundaries:

- SalesService
- InvoiceService
- InventoryService
- PaymentsService
- CustomerLedgerService
- CustomerHistoryService
- RefundService
- AuditService

Keep authoritative business calculations in backend domain services.

Avoid duplicated logic across controllers and UI components.

Use structured validation, typed contracts and maintainable modules.

---

# 21. DATABASE DESIGN

Reuse or extend existing tables and relationships.

Important entities:

- Users
- Businesses
- Business Memberships
- Products
- Product Variants
- Customers
- Invoices
- Invoice Items
- Payments
- Payment Allocations
- Inventory Movements
- Product Images
- Sale Attachments
- Returns
- Refunds
- Audit Logs

Every business-owned record must be associated with the correct tenant.

One customer can have multiple invoices.

One invoice can have multiple items.

One invoice can have multiple payment records.

Maintain appropriate indexes and transactional constraints.

Protect historical invoice records against unintended modification.

Use secure object storage for uploaded images.

---

# 22. SECURITY AND CORRECTNESS

Implement:

- Authentication
- Role-based permissions
- Business tenant isolation
- Backend validation
- Precise amount calculations
- Reliable inventory transactions
- Duplicate submission protection
- Concurrent stock handling
- Secure file upload validation
- Audit history
- Safe error responses
- Protected customer information

Do not collect unnecessary personal information.

Do not expose customer purchase records to unrelated businesses.

Do not store banking PINs or payment credentials.

Use server-generated or otherwise securely validated invoice identifiers.

---

# 23. COMPLETE DEMONSTRATION MODE

Provide an isolated, resettable demo environment.

### Demo Business

Sharma Fashion Store

### Starting Inventory

Blue Casual Shirt — 4 pieces — ₹899

Black T-Shirt — 8 pieces — ₹499

Denim Jeans — 6 pieces — ₹1,299

### Demo Customer

Rahul Sharma

### Required Demonstration

1. Open DukaanSet.
2. Select Sharma Fashion Store.
3. View existing inventory.
4. Confirm Blue Shirt has 4 pieces.
5. Open New Sale.
6. Select Blue Shirt.
7. Enter quantity 2.
8. Optionally attach a shirt photograph.
9. Select Rahul Sharma.
10. Record ₹1,000 cash.
11. Record ₹500 online.
12. Show ₹298 pending.
13. Save Sale.
14. View the generated invoice.
15. Open inventory and verify 2 shirts remain.
16. Open Rahul Sharma's customer profile.
17. Show the saved purchase.
18. Show its photo and transaction date.
19. Show payment history.
20. Show ₹298 outstanding.
21. Return to the dashboard.
22. Verify updated sales and collections.
23. Switch to Hindi and Hinglish.
24. Verify the same business information remains correct.

All demonstration data must use the same real business logic as the application.

Provide a Reset Demo Data action.

Do not hardcode changes just to make the demonstration appear functional.

---

# 24. COMPLETE QA REQUIREMENTS

Write and execute appropriate automated tests.

Test:

- Existing product selection
- Product variants
- Multiple invoice items
- Quantity validation
- Insufficient stock
- Optional photo upload
- Customer selection
- Quick customer creation
- Cash payments
- Online payment recording
- Credit sales
- Split payments
- Invoice generation
- Stock deduction
- Concurrent sales
- Duplicate Save actions
- Customer purchase history
- Customer outstanding balances
- Old-dues collection
- Dashboard calculations
- Returns and refunds
- Business access permissions
- Mobile responsive layouts
- Language switching
- Demo reset
- Network failures

The following conditions must hold:

- One sale deducts stock only once.
- Customer history shows the correct transaction.
- Financial totals remain accurate.
- Failed transactions do not create partial updates.
- One business cannot access another business's private data.
- The UI remains usable on common smartphone sizes.

Report real test results, failures and limitations.

Do not claim that the application is bug-free without evidence.

---

# 25. IMPLEMENTATION ORDER

## Phase 1 — Fully Working Core

- New Sale mobile UI
- Inventory product selection
- Quantity controls
- Optional image upload
- Customer selection
- Payment recording
- Automatic stock deduction
- Invoice creation
- Customer purchase history
- Dashboard updates

## Phase 2 — Enhanced Business Experience

- Customer 360°
- Split payments
- Outstanding collection
- Sales history
- Invoice sharing
- Returns
- Refunds
- Additional business-specific fields

## Phase 3 — Advanced Improvements

- Barcode-assisted selection
- Voice-assisted sales entry
- Enhanced customer statements
- Advanced analytics
- Optional customer self-service portal

Keep the architecture ready for future features without complicating today's core experience.

---

# 26. REQUIRED DELIVERABLES

Provide:

1. Redesigned and fully functional Sales module.
2. Premium mobile-first New Sale interface.
3. Connected inventory product selector.
4. Quantity and variant management.
5. Optional camera and gallery upload.
6. Quick customer selection and creation.
7. Cash, online, credit and split payments.
8. Automatic inventory deduction.
9. Invoice creation and download.
10. Customer 360° profile.
11. Automatic customer purchase history.
12. Accurate customer outstanding ledger.
13. Sales history.
14. Connected dashboard figures.
15. Multilingual support.
16. Business-specific sales configuration.
17. Demo data and reset functionality.
18. Secure backend integration.
19. Database migrations where necessary.
20. Automated test results.
21. Setup and deployment documentation.
22. Clear report of completed, partial and future functionality.

---

# FINAL EXECUTION INSTRUCTIONS

Do not stop at planning, UI mockups or theoretical code.

Inspect the existing DukaanSet repository.

Implement the actual connected sales workflow.

Preserve existing working modules.

Enhance the user interface throughout the affected screens.

Ensure all business operations use the same authoritative database records.

Test the complete demonstration scenario.

Do not add AI image matching or unnecessary verification.

The final result must allow a shopkeeper to:

**Select Product → Enter Quantity → Optional Photo → Select Customer → Add Payment → Save Sale.**

After saving:

**Invoice Generated → Stock Deducted → Payment Recorded → Udhaar Updated → Customer History Updated → Dashboard Updated.**

The application must feel simple to use, visually premium, technically reliable and fully optimised for mobile devices.

### FINAL PRODUCT PROMISE

**DukaanSet — Ek Sale Karo, Saara Hisaab Apne Aap Update Ho.**

BEGIN IMPLEMENTATION IN THE EXISTING DUKAANSET PROJECT.
