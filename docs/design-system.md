# DukaanSet design system

The working identity uses an original storefront/check symbol and the promise **Apni Dukaan, Sab Set.** Replace the central [Logo component](../src/components/brand.tsx) and [brand assets](../public/brand/README.md) to evolve the identity without changing every screen.

| Foundation | Current choice |
| --- | --- |
| Primary | Deep teal `#103B36` for navigation and important actions |
| Accent | Mint `#22C99D`; amber for attention |
| Surfaces | White cards on `#F7FAF8`, quiet borders and rounded corners |
| Typography | Locally bundled Manrope and Noto Sans Devanagari variable fonts |
| Numbers | INR amounts, paise internally; quantities in thousandths |
| Icons | Lucide; icons accompany a text label or accessible name |

[Global styles](../src/app/globals.css) hold application tokens, forms, cards, navigation and responsive rules. [Marketing styles](../src/components/marketing.css) share the identity with public pages. [UI primitives](../src/components/ui.tsx) provide buttons, labelled fields, selects, empty states, error text and Radix dialogs. Operation sheets share these primitives across business categories.

Phones use Home/Bills/Stock/More navigation and a two-step bill composer. The bill total and confirmation stay above the bottom navigation; content receives bottom padding so it remains reachable. Desktop uses a sidebar and simultaneous product/review panels. Inputs and main actions have at least 44px target dimensions, focus rings, reduced-motion rules and text error states.

English, Hindi and Hinglish labels come from [organized dictionaries](../src/lib/i18n.ts). Merchant-entered names keep their original script. Category dashboards share components and financial data; category priorities change the displayed metrics and tasks. Charts read persisted invoices, and demo data is explicitly fictional.

Automated accessibility and viewport observations belong in [the QA report](test-report.md). They supplement manual keyboard, screen-reader and merchant review; they do not establish complete accessibility conformance.
