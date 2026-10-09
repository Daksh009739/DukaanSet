import { test, expect, type Page, type TestInfo } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import type { BusinessState, Session } from '../../src/lib/contracts';

function preserveArtifact(path: string, name: string) {
  const directory = join(process.cwd(), '.local', 'visual-qa', 'v2-sales'); mkdirSync(directory, { recursive: true }); copyFileSync(path, join(directory, name));
}
async function screenshot(page: Page, testInfo: TestInfo, name: string) {
  await expect(page.locator('.toast')).toBeHidden();
  await page.evaluate(() => { if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); window.scrollTo(0, 0); });
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  const viewportName = name.replace('.png', '-viewport.png'); const viewportPath = testInfo.outputPath(viewportName); await page.screenshot({ path: viewportPath }); preserveArtifact(viewportPath, viewportName);
  const path = testInfo.outputPath(name); await page.screenshot({ path, fullPage: true }); preserveArtifact(path, name);
}

async function fashionDemo(page: Page, baseURL: string) {
  const response = await page.request.post('/api/auth/demo', { data: {}, headers: { Origin: new URL(baseURL).origin } });
  expect(response.ok()).toBeTruthy();
  await page.goto('/app');
  await page.getByRole('combobox', { name: /Language|Bhasha|भाषा/ }).selectOption('en');
  const session = await (await page.request.get('/api/session')).json() as Session;
  const business = session.businesses.find(item => item.name === 'Sharma Fashion Store');
  expect(business).toBeTruthy();
  await page.locator('#business-select').selectOption(business!.id);
  await expect(page.locator('.greeting h1')).toBeVisible();
  const state = await businessState(page, business!.id);
  return { business: business!, state, shirt: state.products.find(item => item.name === 'Blue Casual Shirt')!, customer: state.customers.find(item => item.name === 'Rahul Sharma')! };
}

async function businessState(page: Page, businessId: string) {
  const response = await page.request.get(`/api/businesses/${businessId}/state`);
  expect(response.ok()).toBeTruthy();
  return await response.json() as BusinessState;
}

async function photoFixture(page: Page) {
  const encoded = await page.evaluate(() => {
    const canvas = document.createElement('canvas'); canvas.width = 160; canvas.height = 180;
    const context = canvas.getContext('2d')!; context.fillStyle = '#f7faf8'; context.fillRect(0, 0, 160, 180);
    context.fillStyle = '#286f9f'; context.beginPath(); context.moveTo(45, 30); context.lineTo(20, 65); context.lineTo(40, 82); context.lineTo(50, 67); context.lineTo(50, 155); context.lineTo(110, 155); context.lineTo(110, 67); context.lineTo(120, 82); context.lineTo(140, 65); context.lineTo(115, 30); context.closePath(); context.fill();
    context.fillStyle = '#f7faf8'; context.font = '12px sans-serif'; context.fillText('QA sample', 51, 112);
    return canvas.toDataURL('image/png').split(',')[1];
  });
  return { name: 'fictional-shirt-qa.png', mimeType: 'image/png', buffer: Buffer.from(encoded, 'base64') };
}

async function selectShirt(page: Page, productId: string) {
  await page.goto(`/app/sales/new?product=${productId}`);
  const item = page.locator('.sale-selected-item').filter({ hasText: 'Blue Casual Shirt' });
  await expect(item.locator('.sale-quantity-control input')).toHaveValue('1');
  await item.locator('.sale-quantity-control input').fill('2');
  return item;
}

async function splitPayment(page: Page, customerId: string) {
  await page.getByRole('combobox', { name: 'Customer', exact: true }).selectOption(customerId);
  await page.getByRole('button', { name: 'Split payment', exact: true }).click();
  await page.getByLabel('Cash received (₹)', { exact: true }).fill('1000');
  await page.getByLabel('Online / UPI recorded (₹)', { exact: true }).fill('500');
  await expect(page.locator('.sale-pending dd')).toHaveText('₹298');
}

async function noOverflow(page: Page) {
  const overflow = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth, elements: [...document.querySelectorAll('.sale-editor h1,.sale-editor h2,.sale-editor h3,.sale-editor p,.sale-editor button,.sale-editor strong,.sale-editor dd')].filter(element => element.getBoundingClientRect().width && element.getBoundingClientRect().height && element.scrollWidth > element.clientWidth + 3).map(element => ({ text: element.textContent?.slice(0, 90), className: element.className })) }));
  expect(overflow.scroll).toBeLessThanOrEqual(overflow.width);
  expect(overflow.elements).toEqual([]);
}

test('Fashion mobile sale records two shirts, photo, split payments and exactly one stock deduction', async ({ page, baseURL }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const { business, state: before, shirt, customer } = await fashionDemo(page, baseURL!);
  expect(shirt.quantityMilli).toBe(4000); expect(shirt.pricePaise).toBe(89900); expect(customer.balancePaise).toBe(129900);
  const item = await selectShirt(page, shirt.id);
  await item.locator('summary').click();
  await item.getByLabel('Upload From Gallery Blue Casual Shirt', { exact: true }).setInputFiles(await photoFixture(page));
  await expect(item.getByText('Photo attached', { exact: true })).toBeVisible();
  await splitPayment(page, customer.id);
  await expect(page.locator('.sale-total dd')).toHaveText('₹1,798');
  let writes = 0; let posted: unknown;
  await page.route(`**/api/businesses/${business.id}/invoices`, async route => {
    writes++; posted = route.request().postDataJSON();
    await new Promise(resolve => setTimeout(resolve, 250)); await route.continue();
  });
  const save = page.getByRole('button', { name: 'Save Sale', exact: true });
  await save.evaluate(button => { (button as HTMLButtonElement).click(); (button as HTMLButtonElement).click(); });
  await expect(page.getByRole('heading', { name: 'Sale saved successfully', exact: true })).toBeVisible();
  expect(writes).toBe(1);
  const after = await businessState(page, business.id);
  const invoice = after.invoices.find(record => !before.invoices.some(existing => existing.id === record.id))!;
  expect(invoice.totalPaise).toBe(179800); expect(invoice.paidPaise).toBe(150000); expect(invoice.balancePaise).toBe(29800); expect(invoice.status).toBe('partial');
  expect(after.products.find(product => product.id === shirt.id)?.quantityMilli).toBe(2000);
  expect(after.customers.find(record => record.id === customer.id)?.balancePaise).toBe(customer.balancePaise+29800);
  expect(invoice.payments.filter(payment => payment.kind === 'sale').map(payment => [payment.method, payment.amountPaise]).sort()).toEqual([['cash', 100000], ['upi', 50000]]);
  expect(after.movements.filter(movement => movement.referenceId === invoice.id && movement.productId === shirt.id)).toHaveLength(1);
  expect(invoice.items[0].attachments).toHaveLength(1); expect(invoice.items[0].variation).toBe(shirt.variation);
  expect(after.metrics.salesTodayPaise).toBe(before.metrics.salesTodayPaise + 179800); expect(after.metrics.collectedTodayPaise).toBe(before.metrics.collectedTodayPaise + 150000); expect(after.metrics.outstandingPaise).toBe(before.metrics.outstandingPaise + 29800);
  await page.unroute(`**/api/businesses/${business.id}/invoices`);
  const replay = await page.request.post(`/api/businesses/${business.id}/invoices`, { data: posted, headers: { Origin: new URL(baseURL!).origin } });
  expect(replay.ok()).toBeTruthy(); expect((await replay.json()).id).toBe(invoice.id);
  expect((await businessState(page, business.id)).products.find(product => product.id === shirt.id)?.quantityMilli).toBe(2000);
  await page.getByRole('link', { name: 'View Invoice', exact: true }).click();
  await expect(page.locator('[data-invoice-document]')).toBeVisible();
  await expect(page.locator('.sale-invoice-photos img')).toBeVisible();
  await expect(page.locator('.sale-invoice-payments')).toContainText('₹1,000'); await expect(page.locator('.sale-invoice-payments')).toContainText('₹500');
  const axe = await new AxeBuilder({ page }).include('.workspace').withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze(); expect(axe.violations).toEqual([]);
  const downloadPromise = page.waitForEvent('download'); await page.getByRole('button', { name: 'Download PDF', exact: true }).click();
  const download = await downloadPromise; expect(download.suggestedFilename()).toMatch(/\.pdf$/);
  const pdfPath = testInfo.outputPath('fashion-sale.pdf'); await download.saveAs(pdfPath); expect(readFileSync(pdfPath).subarray(0, 5).toString()).toBe('%PDF-'); preserveArtifact(pdfPath, 'fashion-sale.pdf');
  await screenshot(page, testInfo, 'fashion-invoice-mobile.png');
  await page.getByRole('link', { name: 'Open Customer', exact: true }).click();
  await expect(page.locator('main')).toContainText('Rahul Sharma'); await expect(page.locator('main')).toContainText(invoice.number); await expect(page.locator('main')).toContainText('₹298');
  await page.goto(`/app/sales?customer=${customer.id}`); await page.getByLabel('Payment status', { exact: true }).selectOption('partial'); await page.getByLabel('From date', { exact: true }).fill(invoice.date.slice(0, 10));
  await expect(page.locator('.sale-history-card').filter({ hasText: invoice.number })).toBeVisible();
});

test('quick customer, stock validation and all three languages preserve the same sale draft', async ({ page, baseURL }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  const { business, shirt } = await fashionDemo(page, baseURL!);
  const item = await selectShirt(page, shirt.id);
  await item.locator('.sale-quantity-control input').fill('6'); await expect(item).toContainText(`Only 4 ${shirt.unit} are available.`); await expect(page.getByRole('button', { name: 'Save Sale', exact: true })).toBeDisabled();
  await item.locator('.sale-quantity-control input').fill('2');
  await page.getByRole('button', { name: 'Split payment', exact: true }).click(); await page.getByLabel('Cash received (₹)', { exact: true }).fill('1000'); await page.getByLabel('Online / UPI recorded (₹)', { exact: true }).fill('500');
  await page.getByRole('button', { name: 'Add a new customer', exact: true }).click();
  const dialog = page.getByRole('dialog'); await dialog.getByLabel('Name', { exact: true }).fill('Asha Sales Test'); await dialog.getByLabel('Phone (optional)', { exact: true }).fill('9001234567'); await dialog.getByRole('button', { name: 'Save customer', exact: true }).click(); await expect(dialog).toBeHidden();
  const customer = (await businessState(page, business.id)).customers.find(record => record.name === 'Asha Sales Test')!;
  await expect(page.getByRole('combobox', { name: 'Customer', exact: true })).toHaveValue(customer.id); await expect(item.locator('.sale-quantity-control input')).toHaveValue('2');
  await expect(page.getByLabel('Cash received (₹)', { exact: true })).toHaveValue('1000'); await expect(page.getByLabel('Online / UPI recorded (₹)', { exact: true })).toHaveValue('500');
  await page.getByRole('combobox', { name: /Language|Bhasha|भाषा/ }).selectOption('hi'); await expect(page.getByRole('heading', { name: 'नई बिक्री', exact: true })).toBeVisible(); await expect(page.getByLabel('मिला नकद (₹)', { exact: true })).toHaveValue('1000');
  await page.reload(); await expect(page.locator('.sale-quantity-control input')).toHaveValue('2'); await expect(page.getByRole('combobox', { name: 'ग्राहक', exact: true })).toHaveValue(customer.id);
  await page.getByRole('combobox', { name: /Language|Bhasha|भाषा/ }).selectOption('hinglish'); await expect(page.getByRole('heading', { name: 'Nayi Bikri', exact: true })).toBeVisible(); await expect(page.getByLabel('Cash Mila (₹)', { exact: true })).toHaveValue('1000'); await expect(page.getByLabel('Online / UPI Darj (₹)', { exact: true })).toHaveValue('500');
  await noOverflow(page);
  expect((await businessState(page, business.id)).products.find(product => product.id === shirt.id)?.quantityMilli).toBe(4000);
});

test('photo upload failure keeps quantities and payments, retry links photo, and removal deletes pending image', async ({ page, baseURL }) => {
  const { business, shirt, customer } = await fashionDemo(page, baseURL!);
  const item = await selectShirt(page, shirt.id); await splitPayment(page, customer.id);
  let attempts = 0;
  await page.route(`**/api/businesses/${business.id}/attachments`, async route => {
    if (route.request().method() !== 'POST') return route.continue();
    attempts++;
    if (attempts === 1) await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: { code: 'UPLOAD_TEST_FAILURE', message: 'Test upload unavailable.' } }) });
    else await route.continue();
  });
  await item.locator('summary').click(); await item.getByLabel('Upload From Gallery Blue Casual Shirt', { exact: true }).setInputFiles(await photoFixture(page));
  await expect(item).toContainText('Photo upload failed. Your sale is still here.'); await expect(item.locator('.sale-quantity-control input')).toHaveValue('2'); await expect(page.getByLabel('Cash received (₹)', { exact: true })).toHaveValue('1000');
  await item.getByRole('button', { name: 'Retry upload', exact: true }).click(); await expect(item.getByText('Photo attached', { exact: true })).toBeVisible();
  const url = await item.locator('.sale-photo-preview img').getAttribute('src'); expect(url).toMatch(/\/attachments\//);
  await page.reload(); await expect(page.locator('.sale-photo-preview img')).toHaveAttribute('src', url!); await expect(page.locator('.sale-quantity-control input')).toHaveValue('2'); await expect(page.getByLabel('Cash received (₹)', { exact: true })).toHaveValue('1000');
  await page.getByRole('button', { name: 'Remove Photo Blue Casual Shirt', exact: true }).click(); await expect(page.locator('.sale-photo-preview img')).toHaveCount(0);
  expect((await page.request.get(url!)).status()).toBe(404); expect((await businessState(page, business.id)).products.find(product => product.id === shirt.id)?.quantityMilli).toBe(4000);
});

test('single sale screen has no overflow or Axe violations across phone, tablet and desktop widths', async ({ page, baseURL }, testInfo) => {
  const { shirt, customer } = await fashionDemo(page, baseURL!);
  await selectShirt(page, shirt.id); await splitPayment(page, customer.id);
  for (const width of [320, 360, 375, 390, 412, 430, 768, 1440]) {
    await page.setViewportSize({ width, height: width === 320 ? 568 : 900 }); await noOverflow(page);
    const axe = await new AxeBuilder({ page }).include('.workspace').withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze(); expect(axe.violations, `Axe at ${width}px`).toEqual([]);
    if ([320, 390, 1440].includes(width)) await screenshot(page, testInfo, `new-sale-${width}.png`);
  }
});

test('multi-item credit sale and paid walk-in UPI sale validate money without manual stock entry', async ({ page, baseURL }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const { business, shirt, customer, state: before } = await fashionDemo(page, baseURL!);
  const tee = before.products.find(product => product.name === 'Black T-Shirt')!;
  await page.goto('/app/sales/new');
  await page.locator('.pick-product').filter({ hasText: shirt.name }).click(); await page.locator('.pick-product').filter({ hasText: tee.name }).click();
  await expect(page.locator('.sale-total dd')).toHaveText('₹1,398');
  await page.getByRole('button', { name: 'Online / UPI', exact: true }).click();
  await page.getByLabel('Received (₹)', { exact: true }).fill('1400'); await expect(page.getByText('Received money cannot exceed the sale total.', { exact: true })).toBeVisible(); await expect(page.getByRole('button', { name: 'Save Sale', exact: true })).toBeDisabled();
  await page.getByLabel('Received (₹)', { exact: true }).fill('1398'); await expect(page.getByRole('button', { name: 'Save Sale', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Udhaar', exact: true }).click(); await expect(page.getByRole('button', { name: 'Save Sale', exact: true })).toBeDisabled();
  await page.getByRole('combobox', { name: 'Customer', exact: true }).selectOption(customer.id); await page.getByRole('button', { name: 'Save Sale', exact: true }).click(); await expect(page.getByRole('heading', { name: 'Sale saved successfully', exact: true })).toBeVisible();
  const creditState = await businessState(page, business.id); const credit = creditState.invoices.find(invoice => !before.invoices.some(old => old.id === invoice.id))!;
  expect(credit.items).toHaveLength(2); expect(credit.totalPaise).toBe(139800); expect(credit.paidPaise).toBe(0); expect(credit.status).toBe('unpaid'); expect(credit.payments).toHaveLength(0);
  expect(creditState.products.find(product => product.id === shirt.id)?.quantityMilli).toBe(3000); expect(creditState.products.find(product => product.id === tee.id)?.quantityMilli).toBe(7000);
  await page.getByRole('button', { name: 'New Sale', exact: true }).click(); await page.locator('.pick-product').filter({ hasText: tee.name }).click(); await page.getByRole('button', { name: 'Online / UPI', exact: true }).click();
  await expect(page.getByRole('combobox', { name: 'Customer', exact: true })).toHaveValue(''); await page.getByRole('button', { name: 'Save Sale', exact: true }).click(); await expect(page.getByRole('heading', { name: 'Sale saved successfully', exact: true })).toBeVisible();
  const paidState = await businessState(page, business.id); const paid = paidState.invoices.find(invoice => !creditState.invoices.some(old => old.id === invoice.id))!;
  expect(paid.customerId).toBeNull(); expect(paid.totalPaise).toBe(49900); expect(paid.paidPaise).toBe(49900); expect(paid.status).toBe('paid'); expect(paid.payments[0].method).toBe('upi');
  expect(paidState.products.find(product => product.id === tee.id)?.quantityMilli).toBe(6000);
});

test('a committed sale with a lost response stays locked across reload and replays its exact request despite lower stock', async ({ page, baseURL }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const { business, shirt, state: before } = await fashionDemo(page, baseURL!);
  const item = await selectShirt(page, shirt.id); await item.locator('.sale-quantity-control input').fill('3');
  await item.locator('summary').click(); await item.getByLabel('Upload From Gallery Blue Casual Shirt', { exact: true }).setInputFiles(await photoFixture(page)); await expect(item.getByText('Photo attached', { exact: true })).toBeVisible();
  let original: unknown; let replayed: unknown; let attempts = 0;
  await page.route(`**/api/businesses/${business.id}/invoices`, async route => {
    attempts++;
    if (attempts === 1) { original = route.request().postDataJSON(); const committed = await route.fetch(); expect(committed.ok()).toBeTruthy(); await route.abort('failed'); }
    else { replayed = route.request().postDataJSON(); await route.continue(); }
  });
  await page.getByRole('button', { name: 'Save Sale', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Sale result not confirmed', exact: true })).toBeVisible(); await expect(page.getByRole('button', { name: 'Retry same sale', exact: true })).toBeEnabled();
  await expect(item.locator('.sale-quantity-control input')).toBeDisabled(); await expect(page.getByRole('button', { name: 'Clear draft', exact: true })).toBeDisabled(); await expect(page.getByRole('button', { name: 'Remove Photo Blue Casual Shirt', exact: true })).toBeDisabled();
  const committed = await businessState(page, business.id); const invoice = committed.invoices.find(record => !before.invoices.some(old => old.id === record.id))!;
  expect(committed.products.find(product => product.id === shirt.id)?.quantityMilli).toBe(1000); expect(invoice.totalPaise).toBe(269700); expect(invoice.items[0].attachments).toHaveLength(1);
  await page.reload(); await expect(page.locator('.sale-quantity-control input')).toHaveValue('3'); await expect(page.locator('.sale-quantity-control input')).toBeDisabled(); await expect(page.getByRole('button', { name: 'Retry same sale', exact: true })).toBeEnabled();
  await expect(page.locator('.sale-total dd')).toHaveText('₹2,697');
  await page.getByRole('combobox', { name: /Language|Bhasha|भाषा/ }).selectOption('hi'); await expect(page.getByRole('heading', { name: 'बिक्री का नतीजा अभी स्पष्ट नहीं है', exact: true })).toBeVisible(); await expect(page.locator('.sale-quantity-control input')).toBeDisabled();
  await page.getByRole('combobox', { name: /Language|Bhasha|भाषा/ }).selectOption('en'); await noOverflow(page);
  const axe = await new AxeBuilder({ page }).include('.workspace').withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze(); expect(axe.violations).toEqual([]);
  await screenshot(page, testInfo, 'lost-response-recovery-mobile.png');
  const session = await (await page.request.get('/api/session')).json() as Session; const draftKey = `ds-draft-${session.user.id}-${business.id}`; const frozenRaw = await page.evaluate(key => sessionStorage.getItem(key), draftKey);
  await page.evaluate(() => sessionStorage.setItem('v2-sales-unrelated-logout-key', 'discard this'));
  // Mock only the logout acknowledgement to test local cleanup; the isolated demo cookie stays valid for replay.
  await page.route('**/api/auth/logout', route => route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  await page.locator('.bottom-nav').getByRole('button').click(); await page.getByRole('dialog').getByRole('button', { name: /Log out|Logout|Sign out/, exact: true }).click(); await expect(page).toHaveURL(/\/login$/);
  expect(await page.evaluate(key => sessionStorage.getItem(key), draftKey)).toBe(frozenRaw); expect(await page.evaluate(() => sessionStorage.getItem('v2-sales-unrelated-logout-key'))).toBeNull();
  await page.goto(`/app/sales/new?product=${shirt.id}`); await page.locator('#business-select').selectOption(business.id); await expect(page.getByRole('button', { name: 'Retry same sale', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Retry same sale', exact: true }).click(); await expect(page.getByRole('heading', { name: 'Sale saved successfully', exact: true })).toBeVisible(); expect(replayed).toEqual(original); expect(attempts).toBe(2);
  const after = await businessState(page, business.id); expect(after.invoices.filter(record => !before.invoices.some(old => old.id === record.id))).toHaveLength(1); expect(after.products.find(product => product.id === shirt.id)?.quantityMilli).toBe(1000); expect(after.movements.filter(movement => movement.referenceId === invoice.id)).toHaveLength(1); expect(after.payments.filter(payment => payment.invoiceId === invoice.id)).toHaveLength(1);
});

test('corrupt restored attachment metadata never loads external or cross-business URLs and never crashes the sale', async ({ page, baseURL }) => {
  const { business, shirt, state } = await fashionDemo(page, baseURL!); const tee = state.products.find(product => product.name === 'Black T-Shirt')!; const denim = state.products.find(product => product.name === 'Denim Jeans')!;
  const session = await (await page.request.get('/api/session')).json() as Session; const key = `ds-draft-${session.user.id}-${business.id}`; const foreignRequests: string[] = []; const pageErrors: string[] = [];
  page.on('request', request => { if (request.url().includes('draft-image.invalid')) foreignRequests.push(request.url()); }); page.on('pageerror', error => pageErrors.push(error.message));
  const photoId = randomUUID(); const draft = { version: 2, key: randomUUID(), items: { [shirt.id]: '2', [tee.id]: '1', [denim.id]: '1' }, customerId: '', discount: '0', received: '', cash: '', upi: '', mode: 'cash', dueDate: '', savedInvoiceId: '', attachments: {
    [shirt.id]: { id: photoId, url: 'https://draft-image.invalid/secret.png' },
    [tee.id]: [null, 9, { id: photoId, productId: tee.id, url: 'https://draft-image.invalid/tracker.png', mime: 'image/png', size: 10, date: new Date().toISOString() }],
    [denim.id]: [{ id: photoId, productId: denim.id, url: `/api/businesses/${randomUUID()}/attachments/${photoId}`, mime: 'image/png', size: 10, date: new Date().toISOString() }],
  } };
  await page.evaluate(({ key, draft }) => sessionStorage.setItem(key, JSON.stringify(draft)), { key, draft }); await page.goto('/app/sales/new'); await expect(page.locator('.sale-selected-item')).toHaveCount(3); await expect(page.locator('.sale-photo-preview img')).toHaveCount(0);
  await page.getByRole('button', { name: 'Clear draft', exact: true }).click(); await expect(page.locator('.sale-selected-item')).toHaveCount(0); expect(foreignRequests).toEqual([]); expect(pageErrors).toEqual([]); expect((await businessState(page, business.id)).products.find(product => product.id === shirt.id)?.quantityMilli).toBe(4000);
  await page.evaluate(key => sessionStorage.setItem(key, '{"pendingSale":'), key); await page.reload(); await expect(page.getByText('The saved request could not be restored safely. Check Sales History before recording another sale.', { exact: true })).toBeVisible(); await expect(page.getByRole('button', { name: 'Clear draft', exact: true })).toBeDisabled(); await expect(page.getByRole('button', { name: 'Save Sale', exact: true }).first()).toBeDisabled(); expect(pageErrors).toEqual([]);
});

test('blocked device storage prevents an unprotected sale request', async ({ page, baseURL }) => {
  const { business, shirt, state: before } = await fashionDemo(page, baseURL!); await selectShirt(page, shirt.id); let writes = 0; let customerWrites = 0;
  await page.route(`**/api/businesses/${business.id}/invoices`, async route => { writes++; await route.continue(); });
  await page.route(`**/api/businesses/${business.id}/customers`, async route => { customerWrites++; await route.continue(); });
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new DOMException('Storage blocked for QA', 'QuotaExceededError'); }; });
  await page.getByRole('button', { name: 'Add a new customer', exact: true }).click(); const dialog = page.getByRole('dialog'); await dialog.getByLabel('Name', { exact: true }).fill('Blocked Storage Customer'); await dialog.getByRole('button', { name: 'Save customer', exact: true }).click(); await expect(dialog.getByText('This device could not preserve the customer request. No customer was sent. Allow device storage, then try again.', { exact: true })).toBeVisible(); expect(customerWrites).toBe(0); await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.getByRole('button', { name: 'Save Sale', exact: true }).first().click(); await expect(page.getByText('This device could not preserve the recovery request. No sale was sent. Allow device storage, then try again.', { exact: true })).toBeVisible(); expect(writes).toBe(0);
  const after = await businessState(page, business.id); expect(after.invoices).toHaveLength(before.invoices.length); expect(after.customers).toHaveLength(before.customers.length); expect(after.products.find(product => product.id === shirt.id)?.quantityMilli).toBe(4000);
});

test('quick customer lost response preserves its exact request across reload and selects one recovered profile', async ({ page, baseURL }) => {
  await page.setViewportSize({ width: 390, height: 844 }); const { business, shirt, state: before } = await fashionDemo(page, baseURL!); await selectShirt(page, shirt.id);
  await page.getByRole('button', { name: 'Split payment', exact: true }).click(); await page.getByLabel('Cash received (₹)', { exact: true }).fill('1000'); await page.getByLabel('Online / UPI recorded (₹)', { exact: true }).fill('500');
  let original: unknown; let replayed: unknown; let attempts = 0;
  await page.route(`**/api/businesses/${business.id}/customers`, async route => {
    attempts++;
    if (attempts === 1) { original = route.request().postDataJSON(); const committed = await route.fetch(); expect(committed.ok()).toBeTruthy(); await route.abort('failed'); }
    else { replayed = route.request().postDataJSON(); await route.continue(); }
  });
  await page.getByRole('button', { name: 'Add a new customer', exact: true }).click(); const dialog = page.getByRole('dialog'); await dialog.getByLabel('Name', { exact: true }).fill('Lost Response Customer'); await dialog.getByLabel('Phone (optional)', { exact: true }).fill('9012345678'); await dialog.getByRole('button', { name: 'Save customer', exact: true }).click(); await expect(dialog.getByRole('button', { name: 'Retry same customer', exact: true })).toBeEnabled(); await expect(dialog.getByLabel('Name', { exact: true })).toBeDisabled();
  const committed = await businessState(page, business.id); const customer = committed.customers.find(record => record.name === 'Lost Response Customer')!; expect(customer).toBeTruthy(); expect(committed.customers).toHaveLength(before.customers.length + 1);
  await page.reload(); await expect(page.locator('.sale-quantity-control input')).toHaveValue('2'); await expect(page.getByLabel('Cash received (₹)', { exact: true })).toHaveValue('1000'); await expect(page.getByLabel('Online / UPI recorded (₹)', { exact: true })).toHaveValue('500');
  await page.getByRole('button', { name: 'Retry same customer', exact: true }).click(); await expect(dialog.getByLabel('Name', { exact: true })).toHaveValue('Lost Response Customer'); await expect(dialog.getByLabel('Name', { exact: true })).toBeDisabled(); await dialog.getByRole('button', { name: 'Retry same customer', exact: true }).click(); await expect(dialog).toBeHidden(); expect(replayed).toEqual(original); expect(attempts).toBe(2); await expect(page.getByRole('combobox', { name: 'Customer', exact: true })).toHaveValue(customer.id);
  const after = await businessState(page, business.id); expect(after.customers).toHaveLength(before.customers.length + 1); expect(after.products.find(product => product.id === shirt.id)?.quantityMilli).toBe(4000); await expect(page.locator('.sale-total dd')).toHaveText('₹1,798'); await expect(page.locator('.sale-pending dd')).toHaveText('₹298');
});
