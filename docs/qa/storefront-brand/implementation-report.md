# Storefront branding update

The owner's new horizontal DukaanSet logo now appears throughout the shared application, public and authentication branding. Its transparent dark variant keeps the name readable on the sidebar. Collapsed navigation and loading states use the supplied square storefront icon.

Browser favicon sizes (16, 32 and 48px), a multi-size ICO, the 180px Apple icon and 192/512px installed-app icons all use the new identity. The maskable icon keeps the artwork in the safe zone. The public offline cache version is bumped to refresh its existing icon assets.

The untouched attachments are preserved in public/brand/sources/. Imagegen prepared transparent cutouts; SVG filtering provides the dark wordmark without changing the selected artwork's geometry. WebP logos are approximately 24–28KB. Existing SVG asset URLs remain compatible with the new branding.

Validation: source lint, TypeScript and production build passed. The compiled browser review passed 16 desktop/mobile layouts (320–1920px), favicon and manifest dimensions, collapsed navigation, sidebar control separation, zero sidebar accessibility violations and zero browser errors. The saved screenshots were visually inspected. See compiled-review.json and the adjacent screenshots.
