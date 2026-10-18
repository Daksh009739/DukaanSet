import type { NextConfig } from 'next';

const config: NextConfig = {
  output: process.env.DUKAANSET_HOSTINGER_STAGING === '1' ? 'standalone' : undefined,
  distDir: process.env.DUKAANSET_BUILD_DIR || '.next',
  turbopack: { root: process.cwd() },
  // Repeated isolated test servers must not reload a previous server's task graph.
  experimental: { turbopackFileSystemCacheForDev: process.env.DUKAANSET_E2E !== '1' },
  poweredByHeader: false,
  logging:{incomingRequests:{ignore:[/\/verify-email/,/\/reset-password/,/\/accept-invite/]}},
  serverExternalPackages: ['node:sqlite','pdfkit','qrcode'],
  outputFileTracingIncludes: { '/api/**/*': ['./public/fonts/pdf/*.ttf', './public/brand/storefront-logo.png', './public/brand/invoice-logo.png'] },
  async headers() {
    return [{ source: '/:path*', headers: [
      ...(process.env.DUKAANSET_ENV === 'staging' ? [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }] : []),
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'no-referrer' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Permissions-Policy', value: 'camera=(self), microphone=(self), geolocation=()' },
      { key: 'Content-Security-Policy', value: `default-src 'self'; script-src 'self' 'unsafe-inline'${process.env.NODE_ENV==='development'?" 'unsafe-eval'":''}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob:; font-src 'self' blob:; worker-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'` },
    ] }];
  },
};
export default config;
