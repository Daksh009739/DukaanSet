# Voice product creation and Stock entry fix

9 October 2026. Follow-up to V3 commit `95400a6` and the reported screenshot of unresolved spoken products on `/app/stock/voice`.

The previous voice review could receive stock only for existing catalogue products. Its unresolved-row link went to Stock without opening a product form or linking a new product back to the draft. Stock's voice entry appeared below the catalogue, and `adrak`/`अदरक` did not match an existing Ginger product.

## Changed behavior

- Stock now starts with a highlighted **Add products & stock by voice** card before the heading, actions, metrics and catalogue. Voice/history links respect inventory permission and the module setting.
- Unmatched/ambiguous rows offer **Add as new product** inside the voice review. Spoken name/unit are prefilled for review; selling price requires merchant input. Cost is optional; SKU/variant are in an optional disclosure. No price is invented and editing saves nothing.
- **Confirm & add stock** creates reviewed products and receives selected stock in one atomic stock-batch transaction. Existing products use their IDs. New products start at zero stock and receive one linked stock movement, without also adding opening stock. No sale/payment is created.
- Repeated identical new-product rows share one product and aggregate quantity. Existing name/variant/unit, conflicting SKUs/details, invalid quantities or foreign references are refused. Any failed line rolls back product, stock, movement, audit and retry writes together.
- The exact submission/key is stored before sending. Unknown acknowledgement locks edits/clear and offers safe retry after reload. Replay cannot duplicate products/stock; success clears the original submitted rows even when products are already visible after a reload.
- `adrak`/`अदरक` match Ginger and `lehsun`/`लहसुन` match Garlic. Restored unresolved drafts revisit exact single matches; explicit choices, reviewed creation plans, fuzzy/ambiguous matches and pending submissions are preserved.

The existing `POST /api/businesses/:id/stockbatch` accepts either `productId` or `newProduct` with reviewed name/unit/price/cost/optional SKU/variant and `quantityMilli`. Both/neither product choices or extra fields are rejected. Existing callers stay compatible. Permission/module, cookie/Origin, quantity, payload and retry guards remain. No schema migration is needed; the Store runtime revision was bumped so development hot reload uses the new implementation.

## Verification

Final TypeScript, production build and **92 unit/API/client/voice tests** passed. All six existing voice browser workflows passed. The three new browser scenarios passed again against the final source: new products plus stock, acknowledgement-loss replay after reload, and highlighted entry/new-product layouts. No unrelated full browser-suite rerun is claimed for this patch.

Assertions check saved catalogue counts, quantities/prices/costs, unchanged sales totals, existing Ginger selection from fresh speech and a restored legacy draft, atomic rollback, aggregation and changed-payload rejection. The Stock banner fits English/Hindi/Hinglish at 320/390/768/1440px. The review fits those widths; automated WCAG axe checks found no violations in the tested voice page. Rendered screens were inspected.

Fictional test screenshots: [Stock phone](qa/voice-products/stock-phone.png), [new product review](qa/voice-products/new-product-phone.png), [desktop voice review](qa/voice-products/voice-desktop.png). Tests use isolated storage and controlled/typed speech input; physical microphone accuracy is not asserted. Existing merchant data was not reset or seeded. Browser speech still requires explicit review/confirmation. See [V3 operating limits](v3-implementation.md).
