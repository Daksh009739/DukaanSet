# DukaanSet storefront identity

The application uses the two logo images supplied by the owner on 11 October 2026. The untouched originals are saved in sources/. The square artwork is the compact app identity and favicon; the horizontal artwork is the full logo.

- storefront-logo.webp / .png: transparent horizontal logo for light surfaces.
- storefront-logo-dark.webp / .png: the same geometry with a white Dukaan wordmark for dark surfaces; the storefront and mint Set stay coloured.
- storefront-symbol.png: transparent square icon for compact navigation and loading states.
- icon-16.png, icon-32.png, icon-48.png: browser favicon sizes; src/app/favicon.ico contains all three sizes.
- apple-touch-icon.png: opaque 180px Apple home-screen icon.
- icon-192.png, icon-512.png, maskable-512.png: installed-app icons. The maskable icon keeps the artwork within the central safe zone.
- logo.svg, logo-dark.svg, symbol.svg, /icon.svg: self-contained compatibility wrappers for the new raster identity.
- logo-mono.svg, invoice-logo.svg / .png: monochrome platform assets. Merchant documents continue to use the merchant's own saved identity.

Runtime branding is centralised in src/components/brand.tsx; sizing lives in src/components/storefront-brand.css. Preserve the aspect ratio and the sidebar collapse control's separate space. See [usage and preparation](USAGE.md).
