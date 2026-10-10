import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';
import { PDFDocument } from 'pdf-lib';
import type { BusinessState, Session } from '../../src/lib/contracts';
const origin = 'http://127.0.0.1:3001';
async function setup(page: Page) {
  expect((await page.request.post('/api/auth/demo', { headers: { Origin: origin }, data: { language: 'en' } })).status()).toBe(201);
  await page.request.post('/api/account/language', { headers: { Origin: origin }, data: { language: 'en' } });
  const session: Session = await (await page.request.get('/api/session')).json();
  const business = session.businesses.find(b => b.category === 'clothing')!;
  await page.goto('/app'); await page.getByLabel('Your business', { exact: true }).selectOption(business.id); await expect(page.locator('.dashboard-welcome h1')).toBeVisible();
  const state: BusinessState = await (await page.request.get(`/api/businesses/${business.id}/state`)).json();
  return { business, state, session };
}
test('customer360, statement PDF, product aliases and invoice snapshots remain connected', async ({ page }) => {
  const { business, state } = await setup(page); const product = state.products.find(p => p.name === 'Blue Casual Shirt')!; const customer = state.customers.find(c => c.name.startsWith('Rahul'))!;
  const response = await page.request.post(`/api/businesses/${business.id}/invoices`, { headers: { Origin: origin }, data: { idempotencyKey: crypto.randomUUID(), customerId: customer.id, items: [{ productId: product.id, quantityMilli: 2000 }], payments: [{ method: 'cash', amountPaise: 100000 }, { method: 'upi', amountPaise: 50000 }] } });
  expect(response.status()).toBe(201); const invoice = await response.json();
  await page.goto(`/app/customers/${customer.id}`); await expect(page.getByRole('heading', { name: customer.name, exact: true })).toBeVisible();
  await expect(page.locator('.detail-metrics')).toContainText('₹3,097'); await expect(page.locator('.detail-metrics')).toContainText('₹1,500'); await expect(page.locator('.detail-metrics')).toContainText('₹1,597');
  await page.locator('summary').filter({hasText:'More details'}).click();await page.getByRole('button', { name: 'Reminder draft', exact: true }).click(); await expect(page.getByRole('dialog').getByRole('textbox')).toHaveValue(/Rahul.*₹1,597/); await page.getByRole('dialog').getByRole('button', { name: 'Close', exact: true }).click();
  await page.getByRole('tab',{name:'Hisaab',exact:true}).click();await page.locator('.document-centre').getByRole('button',{name:'Generate PDF',exact:true}).click();const studio=page.getByRole('dialog',{name:'Invoice Studio',exact:true});await studio.getByRole('button',{name:'Generate PDF',exact:true}).click();await expect(studio.locator('.pdf-pages canvas')).not.toHaveCount(0);const statementDownload=page.waitForEvent('download');await studio.getByRole('button',{name:'Download PDF',exact:true}).click(); const statement = await statementDownload; await statement.saveAs('test-results/v2-customer-statement.pdf'); const bytes = await readFile((await statement.path())!); expect(bytes.subarray(0, 5).toString()).toBe('%PDF-'); expect((await PDFDocument.load(bytes)).getPageCount()).toBeGreaterThan(0);await studio.getByRole('button',{name:'Close',exact:true}).click();
  await page.goto('/app/stock'); await page.getByRole('button', { name: 'Edit product Blue Casual Shirt', exact: true }).click(); const sheet = page.getByRole('dialog'); await sheet.getByLabel('Selling price (₹)', { exact: true }).fill('999'); await sheet.getByLabel('Voice aliases (comma separated)', { exact: true }).fill('neeli shirt, नीली शर्ट'); await sheet.getByLabel('Variant (optional)', { exact: true }).fill('Blue M'); await sheet.getByRole('button', { name: 'Save', exact: true }).click(); await expect(sheet).toBeHidden();
  await page.getByRole('textbox', { name: 'Search products, SKU…', exact: true }).fill('neeli'); await expect(page.locator('.stock-row')).toHaveCount(1); await expect(page.locator('.stock-row')).toContainText('₹999');
  const csvDownload = page.waitForEvent('download'); await page.getByRole('button', { name: 'Export stock CSV', exact: true }).click(); const csv = await readFile((await (await csvDownload).path())!, 'utf8'); expect(csv).toContain('neeli shirt; नीली शर्ट');
  await page.goto(`/app/sales/${invoice.id}`);await page.locator('summary').filter({hasText:'Financial details & audit'}).click(); await expect(page.locator('[data-invoice-document]')).toContainText('₹899');
  const pdfDownload = page.waitForEvent('download'); await page.getByRole('button', { name: 'Download PDF', exact: true }).click(); const receiptFile = await pdfDownload; await receiptFile.saveAs('test-results/v2-invoice.pdf'); const pdf = await readFile((await receiptFile.path())!); expect(pdf.subarray(0, 5).toString()).toBe('%PDF-'); expect((await PDFDocument.load(pdf)).getPageCount()).toBeGreaterThan(0);
  await page.locator('.language-picker select').selectOption('hi'); const hindiDownload = page.waitForEvent('download'); await page.getByRole('button', {name:'PDF डाउनलोड',exact:true}).click(); await (await hindiDownload).saveAs('test-results/v2-invoice-hindi.pdf');
});
test('customer details and data-backed insights are accessible across phone widths and languages', async ({ page }) => {
  test.setTimeout(120000);
  const { state } = await setup(page); const customer = state.customers.find(c => c.name.startsWith('Rahul'))!;
  for (const path of [`/app/customers/${customer.id}`, '/app/stock', '/app/ai']) {
    await page.goto(path); await expect(page.locator('main h1')).toBeVisible();
    for (const language of ['en', 'hi', 'hinglish']) {
      await page.locator('.language-picker select').selectOption(language);
      for (const width of [320, 390, 768, 1440]) { await page.setViewportSize({ width, height: 900 }); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true); }
      const axe = await new AxeBuilder({ page }).include('.workspace').withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze(); expect(axe.violations).toEqual([]);
    }
  }
  await page.locator('.language-picker select').selectOption('en'); await page.locator('.assistant-questions').getByRole('button', { name: 'Show today’s sales.', exact: true }).click(); await expect(page.getByRole('dialog').locator('.voiceos-answer')).toContainText('₹');
  await page.screenshot({ path: 'test-results/v2-insights.png', fullPage: true });
});
