export type Language = "en" | "hi" | "hinglish";
export type Category = "grocery" | "hardware" | "vegetables" | "mobile" | "clothing" | "general";
export type PaymentMethod = "cash" | "upi";
export interface User { id: string; name: string; email: string; language: Language; demo: boolean; emailVerified: boolean; verificationRequired: boolean }
export interface Business { id: string; name: string; category: Category }
export interface Session { user: User; businesses: Business[] }
export interface Product { displayNames?: Partial<Record<Language,string>>; id: string; name: string; sku: string; unit: string; pricePaise: number; costPaise: number; quantityMilli: number; minStockMilli: number; expiryDate: string | null; aliases: string[]; barcode: string; variation: string; packSize: number | null }
export interface Customer { purchaseCount?:number; lastPurchase?:string|null; lastPayment?:string|null; id: string; name: string; phone: string; balancePaise: number; totalSalesPaise: number; netReceivedPaise: number }
export interface CustomerStatement { customer: Customer; invoices: Invoice[]; payments: Payment[] }
export interface Supplier { id: string; name: string; phone: string; balancePaise: number }
export interface SaleAttachment { id: string; url: string; productId: string; mime: "image/jpeg" | "image/png" | "image/webp"; size: number; date: string }
export interface InvoiceItem { productId: string; name: string; unit: string; quantityMilli: number; pricePaise: number; totalPaise: number; variation?: string; attachmentIds?: string[]; attachments?: SaleAttachment[] }
/** Cancelled bills retain their original total; current received/due amounts are zero. */
export interface Invoice { id: string; number: string; date: string; customerId: string | null; customerName: string; items: InvoiceItem[]; subtotalPaise: number; discountPaise: number; totalPaise: number; paidPaise: number; balancePaise: number; paymentMethod: PaymentMethod | "split"; payments: Payment[]; status: "paid" | "partial" | "unpaid" | "cancelled"; dueDate: string | null }
/** amountPaise is signed: sale/repayment positive, refund negative. */
export interface Payment { id: string; customerId: string | null; invoiceId: string | null; amountPaise: number; method: PaymentMethod; date: string; kind: "sale" | "repayment" | "refund" }
export interface Movement { id: string; productId: string; productName: string; quantityMilli: number; reason: string; date: string; referenceId: string | null }
export interface InventoryEntry { id: string; date: string; source: "voice" | "manual" | "mixed"; items: { productId: string; name: string; unit: string; quantityMilli: number; movementId: string }[] }
export interface StockProductInput { name: string; unit: string; pricePaise: number; costPaise: number; sku: string; variation: string }
export type StockBatchItem = { productId: string; quantityMilli: number } | { newProduct: StockProductInput; quantityMilli: number };
export interface Purchase { id: string; supplierId: string; supplierName: string; date: string; items: { productId: string; name: string; unit: string; quantityMilli: number; costPaise: number; totalPaise: number }[]; totalPaise: number; paidPaise: number; balancePaise: number }
export interface Expense { id: string; description: string; amountPaise: number; method: PaymentMethod; date: string }
export interface Closing { id: string; date: string; businessDay: string; openingCashPaise: number; expectedCashPaise: number; actualCashPaise: number; differencePaise: number }
export interface Metrics { salesTodayPaise: number; collectedTodayPaise: number; outstandingPaise: number; lowStockCount: number; billsToday: number; stockValuePaise: number }
export interface Task { id: string; title: string; detail: string; type: "stock" | "credit" | "expiry" | "demand"; name: string; productId?: string; customerId?: string; quantityMilli?: number; unit?: string; balancePaise?: number; expiryDate?: string }
export interface Activity { id: string; action: string; detail: string; date: string }
export interface BusinessState { business: Business; products: Product[]; customers: Customer[]; suppliers: Supplier[]; invoices: Invoice[]; payments: Payment[]; movements: Movement[]; inventoryEntries: InventoryEntry[]; purchases: Purchase[]; expenses: Expense[]; closings: Closing[]; metrics: Metrics; totals: { salesPaise: number; receivedPaise: number; expensesPaise: number }; daily: { cashPaise: number; upiPaise: number; purchaseCount: number; expensesPaise: number; cashExpensesPaise: number; cashPurchasePaymentsPaise: number; creditSalesPaise: number; olderDuesReceivedPaise: number }; weeklySales: { date: string; label: string; salesPaise: number }[]; tasks: Task[]; activity: Activity[] }
export interface ApiError { error: { code: string; message?: string; details?: {name:string;quantityMilli:number;unit:string} } }
export interface VoiceReport { expectedCashPaise?:number;period:'today'|'week'|'all';salesPaise:number;bills:number;cashPaise:number;upiPaise:number;expensesPaise:number;topProducts:{id:string;name:string;unit:string;quantityMilli:number}[] }
