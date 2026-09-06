/* eslint-disable @typescript-eslint/no-require-imports -- Next config CJS bundle analyzer */
/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: process.env.ANALYZE_OPEN === 'true',
});

const isProd = process.env.NODE_ENV === 'production';
// Kademeli sertleştirme: 'unsafe-eval' kaldırıldı, frame-src daraltıldı ve ihlal
// raporlaması eklendi. Politika hâlâ Report-Only — Vercel loglarındaki ihlaller
// temiz çıkınca zorlamaya (Content-Security-Policy) geçilecek.
const cspReportOnly = [
  "base-uri 'self'",
  "default-src 'self'",
  "font-src 'self' data:",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "frame-src 'self' https://www.youtube.com https://drive.google.com",
  "img-src 'self' data: blob: https:",
  "media-src 'self' data: blob: https:",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline'",
  "worker-src 'self' blob:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.livekit.cloud wss://*.livekit.cloud https://vitals.vercel-insights.com https://*.ingest.sentry.io https://*.ingest.us.sentry.io https://*.ingest.de.sentry.io",
  'report-uri /api/csp-report',
  'report-to csp-endpoint',
].join('; ');

const globalSecurityHeaders = [
  { key: 'Content-Security-Policy', value: cspReportOnly },
  { key: 'Reporting-Endpoints', value: 'csp-endpoint="/api/csp-report"' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(self), microphone=(self), display-capture=(self), geolocation=()',
  },
];

if (isProd) {
  globalSecurityHeaders.push({
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  });
}

const nextConfig = {
  reactStrictMode: true,
  compress: true,
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@supabase/supabase-js',
      'recharts',
      'katex',
      'dompurify',
      'clsx',
      'tailwind-merge',
      'zod',
      'exceljs',
      'canvas-confetti',
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: globalSecurityHeaders,
      },
      {
        source: '/:path*.(png|jpg|jpeg|webp|avif|svg|ico|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [54, 75],
    localPatterns: [
      { pathname: '/**', search: '' },
      { pathname: '/api/image-proxy' },
    ],
    remotePatterns: [
      { protocol: 'https', hostname: 'drive.google.com' },
      { protocol: 'https', hostname: '**.googleusercontent.com' },
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'i.ibb.co' },
      { protocol: 'https', hostname: 'ibb.co' },
      { protocol: 'https', hostname: 'imgur.com' },
      { protocol: 'https', hostname: 'i.imgur.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
};

const { withSentryConfig } = require('@sentry/nextjs/config');

module.exports = withSentryConfig(withBundleAnalyzer(nextConfig), {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  widenClientFileUpload: true,
  tunnelRoute: '/monitoring',
  hideSourceMaps: true,
});
