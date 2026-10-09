import type { NextConfig } from 'next';

const config: NextConfig = {
  distDir: process.env.DUKAANSET_BUILD_DIR || '.next',
  turbopack: { root: process.cwd() },
  poweredByHeader: false,
  logging:{incomingRequests:{ignore:[/\/verify-email/,/\/reset-password/,/\/accept-invite/]}},
  serverExternalPackages: ['node:sqlite','pdfkit','qrcode'],
  outputFileTracingIncludes: { '/api/**/*': ['./public/fonts/pdf/*.ttf'] },
  async headers() {
    return [{ source: '/:path*', headers: [
      ...(process.env.DUKAANSET_ENV === 'staging' ? [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }] : []),
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'no-referrer' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Permissions-Policy', value: 'camera=(self), microphone=(self), geolocation=()' },
      { key: 'Content-Security-Policy', value: `default-src 'self'; script-src 'self' 'unsafe-inline'${process.env.NODE_ENV==='development'?" 'unsafe-eval'":''}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' blob:; worker-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'` },
    ] }];
  },
};
export default config;
