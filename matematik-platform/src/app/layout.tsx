import type { Metadata, Viewport } from "next";
import { Poppins, Baloo_2 } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Providers } from "@/components/Providers";
import { SiteBackground } from "@/components/SiteBackground";
import { PerformanceRuntimeProvider } from "@/components/PerformanceRuntimeProvider";
import { THEME_STORAGE_KEY } from "@/components/theme-constants";
import { SITE_URL, SITE_NAME } from "@/lib/site-metadata";
// Not: `@livekit/components-styles` ve `katex/dist/katex.min.css` buradan
// kaldirildi. Kok layout'tan import edilen her stil sayfasi TUM rotalarda
// render'i bloke eden CSS'e giriyordu; oysa LiveKit stilleri yalnizca canli
// ders odasinda, KaTeX stilleri yalnizca matematik render eden bilesenlerde
// gerekli. Artik ilgili chunk'lariyla birlikte yukleniyorlar.
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const displayFont = Baloo_2({
  subsets: ["latin", "latin-ext"],
  weight: "variable",
  variable: "--font-display",
  display: "swap",
});

function getSupabasePreconnectOrigin(): string | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) {
    return null;
  }
  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - Matematik Öğrenme Platformu`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Çalışma kağıtları, testler, oyunlar ve daha fazlasıyla matematik öğrenmeyi keşfet!",
  keywords: [
    "matematik",
    "ders",
    "test",
    "sorular",
    "lgs",
    "yks",
    "çözüm",
    "eğitim",
    "uğur hoca",
  ],
  authors: [{ name: "Uğur Hoca" }],
  formatDetection: {
    address: false,
    date: false,
    email: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    title: SITE_NAME,
    description:
      "Çalışma kağıtları, testler, oyunlar ve daha fazlasıyla matematik öğrenmeyi keşfet!",
    type: "website",
    locale: "tr_TR",
    siteName: SITE_NAME,
    url: SITE_URL,
    images: [
      {
        url: `${SITE_URL}/icon-512.png`,
        width: 512,
        height: 512,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description:
      "Çalışma kağıtları, testler, oyunlar ve daha fazlasıyla matematik öğrenmeyi keşfet!",
    images: [`${SITE_URL}/icon-512.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

// Mobil klavye açılmalarında CLS'yi engelleyen interactive-widget ve dynamic viewport ayarları
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  interactiveWidget: "resizes-visual",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
};

// Speculation Rules: Masaüstü hover (moderate) ve Mobil touch/click (conservative) kuralları ayrılmış
const speculationRulesConfig = {
  prerender: [
    {
      source: "document",
      where: {
        and: [
          { href_matches: "/*" },
          {
            not: {
              href_matches: [
                "/api/*",
                "/admin/*",
                "/giris*",
                "/kayit*",
                "/cikis*",
                "/canli-ders/*",
                "/*\\?*logout*",
                "/*\\?*auth*",
              ],
            },
          },
          {
            not: {
              selector_matches:
                "[rel~=nofollow], [data-no-prerender], [target=_blank]",
            },
          },
        ],
      },
      eagerness: "moderate",
    },
  ],
  prefetch: [
    {
      source: "document",
      where: {
        and: [
          { href_matches: "/*" },
          {
            not: {
              href_matches: [
                "/api/*",
                "/admin/*",
                "/cikis*",
                "/canli-ders/*",
              ],
            },
          },
          {
            not: {
              selector_matches:
                "[rel~=nofollow], [data-no-prefetch], [target=_blank]",
            },
          },
        ],
      },
      eagerness: "conservative",
    },
  ],
};

// Eski PWA kaldırıldı: daha önce service worker kaydetmiş istemcilerde kalan
// kayıtları ve ugur-hoca-v* önbelleklerini tek seferlik temizler.
const legacyServiceWorkerCleanup = `if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.getRegistrations().then(function(registrations){return Promise.all(registrations.map(function(registration){return registration.unregister();}));}).catch(function(){});if('caches' in window){caches.keys().then(function(cacheNames){return Promise.all(cacheNames.filter(function(name){return name.indexOf('ugur-hoca-v')===0;}).map(function(name){return caches.delete(name);}));}).catch(function(){});}});}`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabaseOrigin = getSupabasePreconnectOrigin();

  return (
    <html
      lang="tr"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${poppins.variable} ${displayFont.variable}`}
    >
      <head>
        {/* Güvenlik & Referrer Politikaları */}
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />

        {/* Speculation Rules API (Chrome 109+, Edge 109+) */}
        <script
          type="speculationrules"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(speculationRulesConfig),
          }}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              name: SITE_NAME,
              url: SITE_URL,
              description:
                "Çalışma kağıtları, testler, oyunlar ve daha fazlasıyla matematik öğrenme platformu.",
              inLanguage: "tr-TR",
            }),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var theme=localStorage.getItem('${THEME_STORAGE_KEY}');var nextTheme=theme==='light'?'light':'dark';document.documentElement.dataset.theme=nextTheme;document.documentElement.classList.add(nextTheme);}catch(e){document.documentElement.dataset.theme='dark';document.documentElement.classList.add('dark');}})();`,
          }}
        />
        {supabaseOrigin ? (
          <>
            <link rel="dns-prefetch" href={supabaseOrigin} />
            <link rel="preconnect" href={supabaseOrigin} crossOrigin="anonymous" />
          </>
        ) : null}
        <link rel="dns-prefetch" href="https://vitals.vercel-insights.com" />
        <link rel="preconnect" href="https://vitals.vercel-insights.com" crossOrigin="anonymous" />
      </head>
      <body>
        <a href="#ana-icerik" className="skip-link">
          Ana içeriğe geç
        </a>
        <Providers>
          <PerformanceRuntimeProvider />
          <SiteBackground />
          <div id="ana-icerik" tabIndex={-1} className="relative z-10 w-full max-w-full overflow-x-clip">
            {children}
          </div>
          <MobileBottomNav />
        </Providers>
        <SpeedInsights />
        {/* Eski service worker temizliği (PWA kaldırıldı - ilk boyamayı bloke etmez) */}
        <script
          dangerouslySetInnerHTML={{
            __html: legacyServiceWorkerCleanup,
          }}
        />
      </body>
    </html>
  );
}
