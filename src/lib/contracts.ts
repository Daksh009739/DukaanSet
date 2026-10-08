export type Language = "en" | "hi" | "hinglish";
export type Category = "grocery" | "hardware" | "vegetables" | "mobile" | "clothing" | "general";
export type PaymentMethod = "cash" | "upi";
export interface User { id: string; name: string; email: string; language: Language; demo: boolean }
export interface Business { id: string; name: string; category: Category }
export interface Session { user: User; businesses: Business[] }
export interface Product { id: string; name: string; sku: string; unit: string; pricePaise: number; costPaise: number; quantityMilli: number; minStockMilli: number; expiryDate: string | null }
export interface Customer { id: string; name: string; phone: string; balancePaise: number }
export interface Supplier { id: string; name: string; phone: string; balancePaise: number }
export interface InvoiceItem { productId: string; name: string; unit: string; quantityMilli: number; pricePaise: number; totalPaise: number }
/** Cancelled bills retain their original total; current received/due amounts are zero. */
export interface Invoice { id: string; number: string; date: string; customerId: string | null; customerName: string; items: InvoiceItem[]; subtotalPaise: number; discountPaise: number; totalPaise: number; paidPaise: number; balancePaise: number; paymentMethod: PaymentMethod; status: "paid" | "partial" | "unpaid" | "cancelled"; dueDate: string | null }
/** amountPaise is signed: sale/repayment positive, refund negative. */
export interface Payment { id: string; customerId: string | null; invoiceId: string | null; amountPaise: number; method: PaymentMethod; date: string; kind: "sale" | "repayment" | "refund" }
export interface Movement { id: string; productId: string; productName: string; quantityMilli: number; reason: string; date: string; referenceId: string | null }
export interface Purchase { id: string; supplierId: string; supplierName: string; date: string; items: { productId: string; name: string; unit: string; quantityMilli: number; costPaise: number; totalPaise: number }[]; totalPaise: number; paidPaise: number; balancePaise: number }
export interface Expense { id: string; description: string; amountPaise: number; method: PaymentMethod; date: string }
export interface Closing { id: string; date: string; businessDay: string; openingCashPaise: number; expectedCashPaise: number; actualCashPaise: number; differencePaise: number }
export interface Metrics { salesTodayPaise: number; collectedTodayPaise: number; outstandingPaise: number; lowStockCount: number; billsToday: number; stockValuePaise: number }
export interface Task { id: string; title: string; detail: string; type: "stock" | "credit" | "expiry"; name: string; productId?: string; customerId?: string; quantityMilli?: number; unit?: string; balancePaise?: number; expiryDate?: string }
export interface Activity { id: string; action: string; detail: string; date: string }
export interface BusinessState { business: Business; products: Product[]; customers: Customer[]; suppliers: Supplier[]; invoices: Invoice[]; payments: Payment[]; movements: Movement[]; purchases: Purchase[]; expenses: Expense[]; closings: Closing[]; metrics: Metrics; weeklySales: { date: string; label: string; salesPaise: number }[]; tasks: Task[]; activity: Activity[] }
export interface ApiError { error: { code: string; message: string } }
