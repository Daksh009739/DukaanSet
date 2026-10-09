# DUKAANSET V6 — SMART INVOICE STUDIO & CUSTOMER HISAAB
## Ultimate Premium PDF, Customer 360°, Digital Billing and Financial Statement Implementation Prompt

**Project:** DukaanSet

**Tagline:** Apni Dukaan, Sab Set.

**Feature:** Smart Invoice Studio & Customer Hisaab

**Design Style:** Premium Modern — Deep Teal, Mint, Clean Typography, Elegant Financial Layouts

**Target Users:** Indian shopkeepers, grocery stores, clothing shops, hardware stores, vegetable sellers, mobile accessory stores and small businesses.

**Core Objective:** Build a beautiful, fully functional document-generation system that lets shopkeepers view a customer's complete purchasing and payment history and generate professional invoices, account statements and payment receipts in seconds.

---

# 1. YOUR ROLE

Act as a complete professional development team:

- Principal SaaS Architect
- Senior Full-Stack Engineer
- Financial Software Engineer
- Senior UI/UX Product Designer
- PDF Generation Specialist
- Database Architect
- Internationalization Engineer
- Security Engineer
- QA Automation Engineer

You are working on the **existing DukaanSet application**.

Your responsibility is to audit, design, implement, integrate, and test the complete Smart Invoice Studio feature.

Do not build an unrelated application.

Do not generate fake financial documents.

Do not create disconnected customer records.

Reuse the existing authentication, business, sales, customers, inventory, payments, udhaar, returns, and multilingual systems.

**This is an actual implementation task, not a request for mockups or theoretical suggestions.**

---

# 2. PRIMARY PRODUCT VISION

Every customer may purchase products multiple times.

Some customers pay immediately.

Some make partial payments.

Some purchase on credit.

Some return products.

Some clear old outstanding amounts later.

DukaanSet must automatically maintain a clear history of these activities.

When the shopkeeper opens a customer profile, they should immediately see:

- All purchases
- Purchase dates
- Invoice details
- Product quantities
- Payments received
- Payment methods
- Returns and refunds
- Outstanding amounts
- Complete transaction timeline

From the same screen, the owner should be able to generate professional PDFs without manually entering the information again.

### Main User Journey

Customers → Select Customer → View Complete History → Generate PDF → Preview → Download, Print or Share.

The PDF must contain accurate information from the existing database.

---

# 3. THREE ESSENTIAL DOCUMENT TYPES

Implement three distinct document types.

## A. Individual Invoice PDF

Generated for one specific sale.

Example:

Customer: Rahul Sharma

Product: Blue Casual Shirt

Quantity: 2

Price: ₹899 each

Total: ₹1,798

Payment Received: ₹1,500

Outstanding at Sale: ₹298

The invoice must retain the original sale's authoritative financial and product details.

Every completed sale must have a unique invoice identifier according to the applicable business and legal requirements.

**Do not combine unrelated historical purchases into a new tax invoice.**

## B. Customer Account Statement PDF

Also called Customer Hisaab PDF.

The shopkeeper selects a date range.

Example:

1 October 2026 to 31 October 2026.

Generate one consolidated account statement containing:

- Opening balance
- All relevant purchases
- Payments received
- Credit adjustments
- Refunds
- Returns
- Running balance
- Closing balance

This is a statement of historical transactions, not a newly issued sale.

## C. Payment Receipt PDF

Generated when a customer makes a payment.

Examples:

- Cash received
- Manually recorded UPI payment
- Payment against old udhaar
- Partial settlement
- Complete settlement

Each receipt must reference an actual recorded payment.

If one payment is allocated to multiple invoices, show the relevant allocation details or an appropriate summary.

Do not treat the receipt as a new sale.

---

# 4. PREMIUM MODERN DESIGN SYSTEM

The default PDF design must be:

**Premium Modern**

Use DukaanSet's established visual identity.

### Colour Palette

Primary Deep Teal: #103B36

Accent Mint: #22C99D

Warm Amber: #F5B942

Off-White: #F7FAF8

Charcoal: #273C38

Soft Gray: #E8EFEC

White: #FFFFFF

Use these colours consistently and ensure sufficient contrast for print and screen viewing.

### Typography

English: Inter or Manrope.

Hindi: Noto Sans Devanagari or another correctly embedded Devanagari-capable font.

Hinglish: Inter or Manrope.

Use strong typography hierarchy.

Emphasise shop name, document title, total amount, payment received, and outstanding balance.

Avoid decorative typography that reduces readability.

### Design Principles

- Premium appearance
- Excellent whitespace
- Clear financial hierarchy
- Elegant section dividers
- Clean tables
- Consistent spacing
- Subtle colour accents
- Professional branding
- Print-friendly colours
- No overcrowded layouts
- No unnecessary gradients
- No excessive illustrations

The document should look credible when shown to customers, shopkeepers, business partners, and accountants.

---

# 5. PREMIUM INVOICE PDF LAYOUT

Build the default individual invoice using the following structure.

## SECTION A — BRANDED HEADER

Use a Deep Teal header area.

Display:

- Shop logo
- Shop name
- Shop tagline, if configured
- Shop address
- Shop contact number
- Optional email
- GSTIN, where applicable

Make the shop name visually prominent.

Display the DukaanSet identity subtly in the footer unless branding settings specify otherwise.

If no merchant logo exists, use a tasteful business initial or neutral storefront placeholder.

Do not invent an official merchant logo.

## SECTION B — DOCUMENT IDENTITY

Display the correct document type:

TAX INVOICE

BILL OF SUPPLY

SALES INVOICE

or another appropriate configured document title.

Include:

- Invoice number
- Issue date
- Applicable supply or service date
- Payment status
- Due date, if relevant

Document classification must follow the merchant's actual tax configuration.

## SECTION C — CUSTOMER INFORMATION

Show appropriate information such as:

- Customer name
- Contact details
- Billing address
- GSTIN, where applicable
- Delivery address, if required

Do not expose unnecessary customer personal information.

## SECTION D — PRODUCT TABLE

Create a professional item table.

Columns should be configurable based on the relevant document type.

Possible columns:

- Item number
- Product description
- Variant
- HSN/SAC, where required
- Quantity
- Unit
- Unit price
- Discount
- Tax rate
- Line total

Support many products without broken page layouts.

For clothing, display selected size and colour.

For hardware, display relevant product specifications.

For grocery, support quantities and units.

For vegetables, support weight-based line items.

Use invoice snapshots rather than current mutable catalogue prices.

## SECTION E — FINANCIAL SUMMARY

Provide:

- Subtotal
- Item or invoice discounts
- Taxable value, where applicable
- Applicable GST breakdown
- Additional charges, if valid
- Rounding adjustment, if configured
- Grand total

Present the final total prominently.

Never fabricate tax percentages or calculate tax from missing information.

## SECTION F — PAYMENT SUMMARY

Display appropriate payment information.

Examples:

Cash Received: ₹1,000

UPI Recorded: ₹500

Total Received: ₹1,500

Balance Due: ₹298

Distinguish payments recorded at invoice issuance from subsequent collections.

An original immutable invoice must not be silently rewritten whenever a later payment occurs.

Where a current payment-status view is provided, clearly label its as-of date and keep it separate from the original invoice's issued financial facts.

## SECTION G — OPTIONAL PAYMENT QR

Support a real, valid payment QR when configured.

Use approved merchant payment information.

A QR code should contain a legitimate payment instruction or authorised payment link.

Do not use a decorative QR code in a real invoice.

Do not mark a payment successful merely because someone scanned a QR code.

Payment confirmation requires valid provider verification or an appropriately labelled manual record.

## SECTION H — FOOTER

Display:

- Thank-you message
- Optional merchant payment terms
- Return policy reference
- Applicable legal declarations
- Authorised signature or signature information where required
- Subtle "Generated with DukaanSet" branding

Do not add fake digital signatures, certifications or verification seals.

---

# 6. SHOP BRANDING CUSTOMIZATION

Create an owner-facing section:

**Settings → Shop Branding & Invoices**

Allow authorised owners to configure:

- Shop logo
- Registered/display business name
- Shop address
- Contact number
- Support email
- Website, if available
- GSTIN and tax details where applicable
- Business tagline
- Brand accent colour within accessible constraints
- Payment details
- Optional terms and conditions
- Return policy
- Invoice footer message

Store settings per business.

If a user owns multiple shops, each shop must have its own branding.

Do not share branding information across unrelated businesses.

### Smart Preview

Show a realistic live invoice preview while the shopkeeper edits branding.

Use fictional preview data, clearly identified as an example.

Provide a Reset to Default Design action.

---

# 7. ADDITIONAL PRINT FORMATS

Keep Premium Modern as the default.

Also support:

## A4 Professional Invoice

Best for:

- Customer emails
- Formal PDF sharing
- Detailed invoices
- Account statements

## Compact Thermal Invoice

Best for:

- Small retail stores
- Counter printing
- Narrow receipt paper

Support appropriate 58mm and 80mm print layouts where compatible with the chosen printer and browser environment.

Do not force the A4 design onto narrow receipt paper.

## Clean Black-and-White Print

Provide a print-safe mode for ordinary monochrome printers.

Keep all required financial details readable.

Do not remove legally required information to make the design visually minimal.

---

# 8. CUSTOMER 360° PROFILE — COMPLETE REDESIGN

Enhance the existing customer profile.

The profile must feel like a modern financial activity dashboard but remain simple enough for nontechnical shopkeepers.

### Profile Header

Show:

- Customer name
- Contact number, where available
- Customer reference
- Optional customer status
- Quick Edit action

### Primary Summary Cards

Display:

- Total Purchase Value
- Total Payments
- Current Outstanding Balance
- Number of Purchases

Clearly define the calculations.

Avoid misleading totals when returns, refunds or opening balances exist.

### Quick Actions

Provide:

- New Sale
- Add Payment
- Generate PDF
- View All Bills
- Prepare Reminder

The Generate PDF action must be prominent.

### Smart Document Menu

When the shopkeeper taps Generate PDF, show a simple bottom sheet:

1. Individual Bill
2. Complete Customer Hisaab
3. Payment Receipt

If Individual Bill is selected, show the customer's existing invoices.

If Complete Customer Hisaab is selected, show a date-range selector.

If Payment Receipt is selected, show recorded payment transactions.

Avoid making the user navigate through multiple unnecessary pages.

---

# 9. COMPLETE CUSTOMER PURCHASE HISTORY

Every customer profile must display an accurate chronological activity timeline.

Activity types:

- Purchase
- Cash Payment
- UPI Payment
- Credit Sale
- Partial Payment
- Return
- Refund
- Adjustment
- Invoice Cancellation, where supported

### Example Timeline

9 October 2026

Blue Casual Shirt × 2

Invoice Total: ₹1,798

Payment Received: ₹1,500

Balance Due at Sale: ₹298

5 October 2026

Old Udhaar Payment

Cash Received: ₹1,000

2 October 2026

Purchase

Total: ₹2,000

Each activity must link to its relevant authoritative record.

Tap a purchase to view its invoice.

Tap a payment to view or generate its payment receipt.

Use compact mobile cards with clear financial labels.

---

# 10. CUSTOMER HISAAB STATEMENT PDF

This is one of the most important features.

Allow the shopkeeper to generate a professional account statement for a selected customer and date range.

### Date Filters

Provide:

- Last 7 Days
- This Month
- Last Month
- Last 3 Months
- This Financial Year
- Custom Date Range

### Statement Header

Display:

- Shop branding
- Document title: Customer Account Statement
- Customer information
- Start date
- End date
- Generated timestamp
- Statement reference, if applicable

Clearly label the document as an Account Statement, not a Tax Invoice.

### Statement Summary

Show:

- Opening Balance
- Purchases / Debits
- Payments / Credits
- Applicable Adjustments
- Closing Balance

### Transaction Table

Include:

- Date
- Reference number
- Transaction description
- Debit
- Credit
- Running balance

### Example

Opening Balance: ₹1,200

New Purchase: ₹1,798

Payment Received: ₹1,500

Closing Balance: ₹1,498

The statement calculation must be based on actual ledger entries.

### Critical Balance Rules

Compute the opening balance using transactions before the selected start date.

Compute the closing balance using all relevant transactions through the selected end date.

Use the business's configured timezone and clearly defined date boundaries.

Include returns, refunds, allocations, credit notes and adjustments according to their correct accounting effects.

Support overpaid or credit-balance customers without mislabelling negative outstanding amounts.

Never calculate a statement by merely summing all invoice totals and ignoring payment allocation or opening balances.

### Statement Detail Options

Offer:

- Summary View
- Detailed Transaction View

The detailed view may include invoice item summaries when relevant.

Avoid unnecessarily making every customer statement dozens of pages long.

---

# 11. PAYMENT RECEIPT PDF

Create an elegant standalone payment receipt.

### Receipt Header

- Merchant logo
- Shop name
- Shop contact
- Document title
- Receipt reference number

### Customer Details

- Customer name
- Relevant account reference

### Payment Details

- Payment date
- Amount received
- Payment method
- Transaction reference, when provided
- Related invoice or allocation details
- Outstanding balance as of the relevant point in time, where shown

### Example

Customer: Rahul Sharma

Payment Received: ₹500

Method: Cash

Purpose: Previous Outstanding Payment

Reference: REC-2026-0042

Receipt Date: 9 October 2026

A receipt must be generated from an existing valid payment record.

Generating or downloading the receipt must never record the payment a second time.

---

# 12. SMART PDF GENERATION WORKFLOW

Keep the process exceptionally simple.

### Individual Invoice

Customer Profile → Select Purchase → Generate Invoice PDF.

### Account Statement

Customer Profile → Generate PDF → Customer Hisaab → Choose Period → Preview → Download.

### Payment Receipt

Customer Profile → Select Payment → Generate Receipt.

### Important UX Rule

Do not require the merchant to re-enter:

- Customer name
- Shop details
- Purchase items
- Payment amounts
- Invoice number
- Transaction dates

All information must come from the existing database.

Only ask for optional presentation settings when needed.

---

# 13. PDF PREVIEW BEFORE DOWNLOAD

Create a professional PDF preview interface.

Features:

- Scrollable preview
- Page count
- Zoom
- Document type
- Current language
- Download PDF
- Print
- Share

The preview must closely match the final generated PDF.

Use the same underlying rendering system or a verified equivalent layout.

Do not show a beautiful HTML preview and then generate a completely different or broken PDF.

Provide appropriate loading and error states.

---

# 14. DOWNLOAD, PRINT AND SHARE

Implement real document actions.

### Download

Generate and download the requested PDF.

Suggested filenames:

- DukaanSet_Invoice_INV-00125.pdf
- DukaanSet_Rahul_Statement_Oct-2026.pdf
- DukaanSet_Payment_Receipt_REC-0042.pdf

Use safe filename handling.

### Print

Use an appropriate print-ready document.

Support A4 and configured receipt formats.

### Share

Integrate with supported mobile sharing capabilities.

When available, allow sharing through the device share sheet.

### WhatsApp

Support a practical user-initiated sharing flow.

Where direct file sharing is unsupported, provide a secure alternative that does not expose private documents through permanent public links.

Do not claim automated WhatsApp PDF delivery without a configured, authorised integration.

Respect customer contact permissions and applicable platform rules.

---

# 15. MULTILINGUAL PDF SUPPORT — NON-NEGOTIABLE

DukaanSet supports three display languages:

1. English
2. Hindi
3. Hinglish

All application-generated PDF labels, headings, payment descriptions, summaries, footer messages and status text must follow the chosen document language.

### English

- Invoice
- Customer
- Date
- Quantity
- Total
- Payment Received
- Balance Due

### Hindi

- बिल
- ग्राहक
- तारीख
- मात्रा
- कुल रकम
- प्राप्त भुगतान
- बकाया रकम

### Hinglish

- Bill
- Customer
- Date
- Quantity
- Total Paise
- Mile Hue Paise
- Baaki Paise

Use the central DukaanSet localization engine.

Do not build another independent translation system inside the PDF module.

### Language Selection

Default the document language to the user's currently selected display language.

Optionally allow a document-specific language override before generating a PDF.

For example, the shopkeeper may use Hinglish personally but generate a customer invoice in English.

A document-specific override must not unexpectedly change the user's global application preference.

### Hindi PDF Rendering

Embed suitable fonts.

Verify:

- Proper Devanagari shaping
- Correct line wrapping
- No missing glyphs
- No broken characters
- Correct table alignment
- Readable page breaks

Preserve original customer names, product records and legal identifiers where appropriate.

Use verified localized product display names when available.

---

# 16. SHOP-SPECIFIC DOCUMENT DETAILS

DukaanSet is a multi-business SaaS application.

The document engine must adapt to different businesses.

### Clothing Store

Show:

- Item
- Size
- Colour
- Quantity
- Price
- Returns or exchange references

### Grocery Store

Show:

- Item
- Pack size
- Quantity
- Unit
- Price
- Applicable tax details

### Hardware Store

Show:

- Item specification
- Pieces, metres, boxes or other configured units
- Quantity
- Unit price
- Applicable tax details

### Vegetable Store

Show:

- Product
- Weight
- Rate per unit
- Total

### Mobile Accessories Store

Show:

- Product name
- Model compatibility
- Variant
- Warranty details where applicable

Use a shared document engine with appropriate business-specific data fields.

Do not duplicate the complete invoice-generation architecture for each shop category.

---

# 17. CORRECT INDIA-SPECIFIC INVOICING SUPPORT

Support appropriate invoice types based on the merchant's actual legal and GST configuration.

Possible document classifications include:

- Tax Invoice
- Bill of Supply
- Appropriate non-GST sales document
- Credit Note
- Debit Note
- Payment Receipt
- Account Statement

### Tax Requirements

Where applicable, support:

- Supplier legal details
- GSTIN
- Invoice numbering
- Issue date
- Recipient details
- HSN/SAC
- Quantity and unit
- Taxable value
- Discounts
- CGST
- SGST
- IGST
- Other applicable tax or cess
- Place of supply
- Additional legally required particulars

Do not automatically apply GST to every merchant.

Do not label an unregistered merchant's ordinary document as a GST tax invoice without a valid basis.

Do not assume every merchant uses the same GST rates or scheme.

### E-Invoicing

For merchants subject to applicable electronic invoicing requirements, implement the relevant compliance integration only when the required government-authorised workflow and credentials are configured.

Generating a PDF alone does not constitute generation of a legally valid GST e-invoice where government reporting is required.

Do not fabricate IRNs, acknowledgement numbers or statutory QR codes.

Keep ordinary payment QR codes separate from legally required e-invoice QR information.

Use the current applicable GST regulations and obtain appropriate tax/accounting review before describing the system as fully tax-compliant.

---

# 18. INVOICE NUMBERING AND HISTORICAL INTEGRITY

Maintain safe invoice numbering.

Use the existing business's authorised invoice-number series.

Ensure uniqueness within the required scope and financial year.

Prevent duplicate numbers caused by concurrent sales.

Do not generate a new invoice number every time a customer downloads an existing invoice.

### Historical Preservation

Issued invoices must preserve:

- Product descriptions
- Quantity
- Unit price
- Tax information
- Discounts
- Totals
- Relevant merchant details at issuance
- Relevant customer details at issuance

If the shop later changes its address or logo, preserve the original document's required historical information according to the document policy.

Do not retroactively alter issued financial facts.

Use credit/debit notes, returns or other traceable adjustments where appropriate.

---

# 19. LIVE CUSTOMER BALANCES VS ORIGINAL INVOICES

This is a critical business rule.

Example:

A customer purchases goods worth ₹2,000.

They initially pay ₹500.

The invoice originally records ₹1,500 outstanding.

One week later, they pay another ₹1,000.

Current outstanding becomes ₹500.

The system must distinguish:

- Original invoice amount
- Payments received when issued
- Subsequent payment activity
- Current outstanding balance

The original issued invoice should not be silently overwritten.

The latest account statement should show the updated customer balance.

The subsequent payment should have its own receipt.

If a current invoice payment-status summary is generated, label it clearly as a current view separate from the original invoice record.

This prevents financial confusion and preserves an audit trail.

---

# 20. CONNECT DIRECTLY WITH EXISTING DUKAANSET MODULES

The Invoice Studio must integrate with:

### Sales

Retrieve actual invoices and invoice items.

### Inventory

Use historical sold quantities and variants, without recalculating past sales from current inventory.

### Customers

Retrieve customer profiles and purchase histories.

### Payments

Retrieve payments and their valid allocations.

### Udhaar Ledger

Calculate balances from authoritative ledger records.

### Returns and Refunds

Include properly linked adjustments.

### Daily Closing

Use the same underlying financial records.

### Reports

Ensure document totals reconcile with business reports.

### VoiceOS

Allow spoken document requests.

### DemandPulse

Link actual recovered-sale invoices where appropriate.

### Business Settings

Retrieve shop branding, document preferences and permitted issuer information.

Do not create separate, inconsistent financial data inside the document module.

---

# 21. VOICEOS INTEGRATION — ADDITIONAL RECOMMENDATION

Integrate with the existing DukaanSet VoiceOS.

Examples:

"Rahul ka is month ka hisaab PDF bana do."

"Rahul ka last purchase bill download karo."

"Kal jo payment Amit ne di thi uski receipt bana do."

"Is customer ke saare bills dikhao."

VoiceOS must:

1. Understand the document request.
2. Identify the authorised customer.
3. Resolve the requested document type.
4. Extract date range where applicable.
5. Ask only for missing or ambiguous information.
6. Open the correct document preview.
7. Allow the user to download or share.

Do not automatically send private customer documents to third parties.

Generating a document is not a new financial transaction.

Do not modify sales or payments simply because the user requested a PDF.

---

# 22. CUSTOMER PROFILE DOCUMENT CENTRE

Add a dedicated section within the Customer 360° profile:

**Documents & Hisaab**

Show:

- Recent Invoices
- Recent Payment Receipts
- Generate Customer Statement
- Previously Generated Documents, where stored

Avoid saving unnecessary duplicate PDF files.

Where practical, generate documents on demand from authoritative records and retain document metadata or immutable document snapshots as required.

Allow authorised users to regenerate presentation copies without recreating the underlying invoice transaction.

---

# 23. SMART DATE FILTERS AND FINANCIAL SUMMARIES

Create a consistent date filter shared between the customer profile and PDF statement generator.

Support:

- This Week
- This Month
- Last Month
- Last 3 Months
- Custom Range
- Financial Year

When filters change:

- Update displayed customer activity.
- Update the selected statement period.
- Preserve the customer's identity.
- Fetch authoritative financial records.
- Recalculate opening and closing balances correctly.

Do not use the selected period's purchases alone as the complete closing balance.

---

# 24. DOCUMENT ACCESS AND PRIVACY

Customer invoices contain potentially private information.

Implement:

- Authenticated document access
- Business-level tenant isolation
- Role-based permissions
- Protected PDF-generation APIs
- Safe file storage
- Expiring access URLs where appropriate
- File access auditing
- Secure customer data handling
- Safe download filenames
- Appropriate retention policies

Never make customer invoice PDFs publicly accessible merely because someone guesses an invoice number.

Shared document links must have a deliberate access policy.

Do not expose one shop's invoices or customer statements to another business.

---

# 25. SECURE PDF GENERATION ARCHITECTURE

Create a reusable, server-controlled document-generation architecture.

Suggested modules:

- InvoiceDocumentService
- CustomerStatementService
- PaymentReceiptService
- DocumentTemplateEngine
- BusinessBrandingService
- LocaleDocumentFormatter
- PDFRenderer
- DocumentAccessService
- DocumentShareService
- DocumentAuditService

### Recommended Pipeline

Authenticated Request

→ Authorisation Check

→ Load Business and Customer Records

→ Load Authoritative Financial Data

→ Validate Document Type

→ Calculate Document Summary

→ Resolve Language

→ Resolve Business Branding

→ Render Premium Template

→ Generate PDF

→ Validate Output

→ Return Secure Preview or Download

Use an established PDF-rendering solution compatible with the actual application architecture.

For Next.js, a compatible HTML-to-PDF rendering service or a suitable React PDF solution may be evaluated.

Choose based on print fidelity, Devanagari support, infrastructure compatibility and performance.

Do not depend on browser-only rendering for authoritative financial calculations.

---

# 26. PDF RENDERING QUALITY RULES

The PDF must be suitable for actual customer use.

Support:

- A4 page size
- Proper margins
- Multi-page item tables
- Repeated table headers when appropriate
- Accurate page numbering
- Footer consistency
- Avoidance of orphaned totals
- Proper text wrapping
- Long product descriptions
- Long merchant names
- Large numbers
- Multiple payment records
- Long customer statements
- Devanagari text shaping
- Print-safe contrast
- Proper font embedding

Avoid:

- Cut-off tables
- Overlapping headings
- Missing rupee symbols
- Broken Hindi text
- Blank pages
- Unreadable thumbnails
- Incorrect totals
- Decorative elements obscuring financial details

Render and visually inspect generated PDF samples before considering the feature finished.

---

# 27. SMART DOCUMENT STATUS

Use clear, accurate labels:

- Paid
- Partially Paid
- Unpaid
- Refunded
- Partially Refunded
- Cancelled, where applicable

Statuses must reflect the relevant authoritative payment and adjustment data.

Separate invoice lifecycle status from current payment status.

If a document reflects current payment information, identify its as-of time.

Do not modify historical invoice issuance just because the payment status changes.

---

# 28. OPTIONAL CUSTOMER COMMUNICATION ENHANCEMENTS

Provide simple communication actions:

- Prepare Payment Reminder
- Share Invoice
- Share Account Statement
- Share Payment Receipt

Use the customer's appropriate contact and language preference when available.

Allow owners to review messages before sending.

Customer communication must follow applicable consent and platform requirements.

Do not automatically send repeated payment reminders without the necessary configuration and permissions.

---

# 29. OPTIONAL PAYMENT QR FEATURE

Allow the merchant to configure payment information.

Potential options:

- UPI ID
- Merchant display name
- Approved payment link
- Provider-supported dynamic QR

### Important

Use valid payment QR formats.

Do not include fake QR codes.

Do not expose sensitive credentials.

Do not automatically mark a transaction as paid after displaying the QR code.

If a payment provider is integrated, use verified provider callbacks and safe backend reconciliation.

If payments are manually recorded, label them as recorded rather than externally verified.

---

# 30. SMART CUSTOMER FINANCIAL INSIGHTS

Inside Customer 360°, show practical summaries such as:

- Total Purchases
- Payments Received
- Money Pending
- Last Purchase Date
- Last Payment Date
- Number of Purchases

Optionally show:

- Monthly purchase trend
- Outstanding payment age
- Unpaid invoice count
- Most frequently purchased products

All summaries must derive from real authorised records.

Do not fabricate customer loyalty scores or financial predictions.

Keep advanced analytics secondary to the core invoice and statement workflow.

---

# 31. MULTI-TENANT BUSINESS SETTINGS

DukaanSet supports multiple independent businesses.

Each business must maintain separate:

- Logos
- Invoice prefixes
- Invoice number sequences
- Merchant details
- Tax configurations
- Payment settings
- Document templates
- Customer accounts
- Document histories
- Access permissions

When the owner switches businesses, Invoice Studio must switch to the corresponding business data and branding.

Never mix invoices from different shops.

---

# 32. PREMIUM MOBILE-FIRST DOCUMENT EXPERIENCE

Most shopkeepers will use Android smartphones.

Optimise the workflow for:

- 320px screens
- 360px screens
- 375px screens
- 390px screens
- 412px screens
- 430px screens

### Mobile UI Requirements

- Easy Generate PDF action
- Compact document selection sheet
- Simple date-range picker
- Quick preview
- Large download button
- Share action
- Clear loading state
- Retry on failure
- Accessible touch targets

Do not force the owner to fill lengthy document configuration forms every time.

Use saved business settings automatically.

---

# 33. PERFORMANCE AND DOCUMENT CACHING

Optimise PDF generation.

Use:

- Efficient database queries
- Appropriate pagination for lengthy histories
- Safe document caching where useful
- Controlled image resolution
- Proper font loading
- Background processing only where infrastructure genuinely supports it

For historical immutable documents, reuse a verified generated copy when appropriate.

For current account statements, ensure cached data cannot become stale or misleading after new payments.

Use clear generation timestamps.

Do not serve one customer's cached document to another customer or business.

---

# 34. REQUIRED DATABASE AND DATA MODEL

Inspect existing tables first.

Reuse authoritative entities:

- Businesses
- BusinessSettings
- Customers
- Products
- ProductVariants
- SalesInvoices
- InvoiceItems
- Payments
- PaymentAllocations
- LedgerEntries
- InventoryMovements
- Returns
- Refunds
- CreditNotes
- AuditLogs

Introduce additional entities only where justified.

Potential additions:

### InvoiceBrandingSettings

Business ID, logo reference, design preferences, footer text, payment information and applicable business details.

### DocumentGenerationEvents

Document type, source record, business, requesting user, generation time, locale and result metadata.

### DocumentSnapshots

Only where needed for legal record preservation, historical consistency or reliable reissue.

### CustomerStatementMetadata

Optional selected-period and generation information without duplicating the financial ledger.

Do not persist duplicate authoritative totals that can drift from the ledger.

Use safe schema migrations.

---

# 35. FINANCIAL ACCURACY REQUIREMENTS

Use precise decimal arithmetic or integer minor units.

Do not use unsafe floating-point calculations for authoritative money values.

Handle:

- Discounts
- Taxes
- Partial payments
- Split payments
- Older outstanding balances
- Refunds
- Returns
- Credit notes
- Payment allocations
- Opening balances
- Closing balances
- Credit balances
- Rounding rules

### Critical Invariants

A receipt must reference an actual payment.

An invoice must reference an actual authorised sale.

A statement must derive from actual ledger activity.

Downloading an invoice must not create another sale.

Regenerating a receipt must not create another payment.

Changing the selected document language must not modify financial values.

Two different rendering templates of the same document must reconcile to the same authoritative amounts.

---

# 36. COMPLETE DEMONSTRATION MODE

Create an isolated demo using fictional data.

### Demo Shop

Sharma Fashion Store

### Sample Customer

Rahul Sharma

### Sample Transaction

Blue Casual Shirt × 2

Price Each: ₹899

Total: ₹1,798

Cash: ₹1,000

UPI Recorded: ₹500

Outstanding: ₹298

### Required Demonstration

1. Open DukaanSet.
2. Login to an authorised demo account.
3. Select Sharma Fashion Store.
4. Open Customers.
5. Select Rahul Sharma.
6. View purchase history.
7. Open the shirt invoice.
8. Generate the Premium Modern Invoice PDF.
9. Preview the branded PDF.
10. Download it.
11. Open Generate PDF.
12. Choose Customer Hisaab.
13. Select a date range.
14. Generate the complete customer statement.
15. Verify opening balance, purchases, payments and closing balance.
16. Select an existing payment.
17. Generate its payment receipt.
18. Switch the display language to Hindi.
19. Generate a Hindi presentation of the statement.
20. Switch to Hinglish.
21. Verify the selected language is reflected consistently.
22. Use VoiceOS to request a customer statement.
23. Verify the correct customer and period.
24. Open the generated preview.
25. Test printing and supported sharing options.

Use the actual document-generation code with seeded data.

Do not fake PDF downloads or successful financial events.

---

# 37. EDGE CASES

Test and handle:

- Customer with no purchases
- Customer with many invoices
- Customer with zero balance
- Customer with a credit balance
- Customer with multiple partial payments
- Customer with split payments
- Customer with refunds
- Customer with returned items
- Cancelled invoice
- Missing merchant logo
- Missing optional customer phone
- Long product names
- Many invoice rows
- Long statements
- Different business categories
- Hindi product names
- Missing localized display aliases
- PDF generation timeout
- Network interruption
- Unauthorized document request
- Expired sharing link
- Duplicate download requests

Do not generate misleading account statements from incomplete data.

If important financial records are missing, return a clear error or appropriately marked incomplete result instead of inventing values.

---

# 38. AUTOMATED TESTING REQUIREMENTS

Write unit, integration and end-to-end tests.

### Invoice Tests

- Correct source invoice
- Correct customer
- Correct shop branding
- Correct line items
- Correct quantities
- Correct prices
- Correct taxes
- Correct payments
- Correct historical values
- Stable invoice identifier

### Statement Tests

- Opening balance
- Purchases
- Payments
- Running balance
- Returns
- Refunds
- Closing balance
- Date boundaries
- Cross-period transactions
- Credit balances

### Receipt Tests

- Payment reference
- Correct amount
- Correct method
- Correct date
- Correct customer
- No duplicate payment creation

### PDF Tests

- English rendering
- Hindi rendering
- Hinglish rendering
- A4 printing
- Thermal printing
- Embedded fonts
- Page breaks
- Long tables
- Logo rendering
- Correct output file

### Security Tests

- Authentication
- Permissions
- Business isolation
- Customer data protection
- Expiring document links

### UX Tests

- Mobile preview
- Download
- Print
- Share
- Language switching
- Date filters
- Empty states
- Error recovery

Provide actual test results.

Do not claim zero defects without verification.

---

# 39. CI/CD AND VERCEL STAGING

Integrate the implementation into DukaanSet's existing Git workflow.

Development branch:

`dev`

Production branch:

`main`

### CI Checks

Include:

- Type checking
- Linting
- Financial calculation tests
- Document-generation tests
- Localization completeness checks
- PDF rendering tests
- Build verification

### Staging

Deploy to the existing configured Vercel staging environment.

Verify generated PDFs through the actual deployment.

Check:

- Authenticated downloads
- Font rendering
- Branding images
- File storage configuration
- Backend PDF generation
- Mobile preview
- HTTPS
- Tenant isolation

If a dedicated PDF service is necessary due to hosting constraints, integrate it securely rather than assuming all rendering processes are compatible with the existing deployment runtime.

Do not claim live deployment without verifying it.

---

# 40. IMPLEMENTATION PRIORITY

## Phase 1 — Core Invoice Studio

- Existing codebase audit
- Premium PDF design
- Shop branding settings
- Individual invoice generation
- Customer profile integration
- PDF preview
- Download
- Print

## Phase 2 — Complete Customer Hisaab

- Date-range selection
- Opening balance
- Transaction history
- Running balance
- Closing balance
- Professional statement PDF
- Payment receipts

## Phase 3 — Premium Customer Experience

- Enhanced Customer 360°
- Document centre
- Mobile sharing
- Payment QR where validly configured
- A4 and thermal templates
- Smart financial summaries

## Phase 4 — Multilingual and AI Integration

- English PDF
- Hindi PDF
- Hinglish PDF
- Verified localized labels
- VoiceOS document requests
- AI-assisted document navigation

## Phase 5 — Advanced Enhancements

- Authorised payment links
- Customer communication integrations
- Advanced branding options
- Secure customer document portal
- Additional business document types

Maintain working core functionality throughout implementation.

---

# 41. FINAL DELIVERABLES

Deliver:

1. Complete Smart Invoice Studio.
2. Premium Modern invoice template.
3. Merchant branding configuration.
4. Shop logo support.
5. Individual Invoice PDF.
6. Customer Account Statement PDF.
7. Payment Receipt PDF.
8. Enhanced Customer 360° Profile.
9. Complete purchase and payment timeline.
10. Statement date filters.
11. Opening and closing balance calculation.
12. Accurate financial summaries.
13. PDF preview.
14. PDF download.
15. Print support.
16. Mobile sharing.
17. Optional valid payment QR.
18. A4 print layout.
19. Compact thermal layout.
20. English localization.
21. Hindi localization.
22. Hinglish localization.
23. VoiceOS integration.
24. Existing database integration.
25. Historical invoice preservation.
26. Secure access controls.
27. Multitenant isolation.
28. Automated tests.
29. Vercel staging verification.
30. Developer documentation.
31. Actual implementation and testing report.

---

# 42. FINAL ACCEPTANCE CRITERIA

Consider Smart Invoice Studio complete only after:

- A customer can have multiple real purchases.
- All purchases appear in the correct customer profile.
- Individual invoices can be generated from existing sales.
- Payment receipts can be generated from existing payments.
- Customer statements calculate opening and closing balances correctly.
- No new sales or payments are created by generating a PDF.
- Original issued invoice data remains historically accurate.
- Merchant branding displays correctly.
- Premium Modern PDF renders correctly.
- Hindi Devanagari text works.
- Hinglish rendering works.
- English rendering works.
- PDF preview matches the downloaded document.
- Printing works on supported formats.
- All documents contain the correct business and customer information.
- Unauthorised users cannot retrieve private documents.
- Cross-business data leakage is prevented.
- Financial totals reconcile with the existing ledger.
- Critical automated tests pass.
- The feature works on common mobile screen sizes.
- The feature is verified on the configured staging environment.

Report unresolved limitations accurately.

---

# FINAL EXECUTION INSTRUCTION

Implement DukaanSet Smart Invoice Studio as a fully integrated part of the existing DukaanSet application.

Do not create beautiful but fake PDFs.

Do not create disconnected billing data.

Do not regenerate completed sales when the user downloads an invoice.

Do not fabricate tax information, transaction identifiers, QR verification details, or financial balances.

Use the authoritative sales, customer and payment records.

Provide a premium, clear and fast mobile workflow.

### MAIN EXPERIENCE

**Customer Open Karo → Complete Hisaab Dekho → PDF Generate Karo → Download, Print Ya Share Karo.**

### FINAL PRODUCT VISION

**DukaanSet Smart Invoice Studio**

Professional Invoices.

Complete Customer Hisaab.

Accurate Payment Receipts.

Premium Shop Branding.

Three Languages.

One Connected Business System.

### FINAL PRODUCT PROMISE

**"Har Customer Ka Poora Hisaab. Har Bill Professional. Sab Kuch DukaanSet Mein."**

**BEGIN IMPLEMENTATION IN THE EXISTING DUKAANSET CODEBASE. DO NOT STOP AT PLANNING OR DESIGN MOCKUPS.**
