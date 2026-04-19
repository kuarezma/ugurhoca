import type { Metadata, Viewport } from "next";
import { Poppins, Baloo_2 } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import CookieBanner from "@/components/CookieBanner";
import InstallPrompt from "@/components/InstallPrompt";
import { Providers } from "@/components/Providers";
import { THEME_STORAGE_KEY } from "@/components/theme-constants";
import { SITE_URL, SITE_NAME } from "@/lib/site-metadata";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

const displayFont = Baloo_2({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700", "800"],
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
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Uğur Hoca",
  },
  formatDetection: {
    address: false,
    date: false,
    email: false,
    telephone: false,
  },
  openGraph: {
    title: SITE_NAME,
    description:
      "Çalışma kağıtları, testler, oyunlar ve daha fazlasıyla matematik öğrenmeyi keşfet!",
    type: "website",
    locale: "tr_TR",
    siteName: SITE_NAME,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description:
      "Çalışma kağıtları, testler, oyunlar ve daha fazlasıyla matematik öğrenmeyi keşfet!",
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
};

const serviceWorkerBootstrap = `if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.getRegistrations().then(function(registrations){return Promise.all(registrations.map(function(registration){return registration.unregister();}));}).catch(function(){});if('caches' in window){caches.keys().then(function(cacheNames){return Promise.all(cacheNames.filter(function(name){return name.indexOf('ugur-hoca-v')===0;}).map(function(name){return caches.delete(name);}));}).catch(function(){});}navigator.serviceWorker.addEventListener('message',function(event){if(event&&event.data&&event.data.type==='UGUR_HOCA_SW_DISABLED'){window.location.reload();}});});}`;

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
        {/* PWA */}
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <script
          dangerouslySetInnerHTML={{
            __html: serviceWorkerBootstrap,
          }}
        />
      </head>
      <body>
        <a href="#ana-icerik" className="skip-link">
          Ana içeriğe geç
        </a>
        <Providers>
          <div id="ana-icerik" tabIndex={-1}>
            {children}
          </div>
        </Providers>
        <InstallPrompt />
        <CookieBanner />
        <SpeedInsights />
      </body>
    </html>
  );
}
