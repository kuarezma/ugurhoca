import type { Metadata, Viewport } from "next";
import { Poppins, Space_Grotesk } from "next/font/google";
import InstallPrompt from "@/components/InstallPrompt";
import { Providers } from "@/components/Providers";
import { THEME_STORAGE_KEY } from "@/components/theme-constants";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const siteUrl = "https://ugurhoca.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Uğur Hoca Matematik - Matematik Öğrenme Platformu",
    template: "%s | Uğur Hoca Matematik",
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
    "egitim",
    "uğur hoca",
  ],
  authors: [{ name: "Uğur Hoca" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Uğur Hoca",
  },
  openGraph: {
    title: "Uğur Hoca Matematik",
    description:
      "Çalışma kağıtları, testler, oyunlar ve daha fazlasıyla matematik öğrenmeyi keşfet!",
    type: "website",
    locale: "tr_TR",
    siteName: "Uğur Hoca Matematik",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Uğur Hoca Matematik",
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
  maximumScale: 1,
  userScalable: false,
};

const serviceWorkerBootstrap =
  process.env.NODE_ENV === "production"
    ? `if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){});});}`
    : `if('serviceWorker' in navigator){window.addEventListener('load',async function(){try{var marker='__ugurhoca_sw_reset__';var hasReset=sessionStorage.getItem(marker)==='1';var registrations=await navigator.serviceWorker.getRegistrations();await Promise.all(registrations.map(function(registration){return registration.unregister();}));if('caches' in window){var cacheNames=await caches.keys();await Promise.all(cacheNames.filter(function(name){return name.indexOf('ugur-hoca-v')===0;}).map(function(name){return caches.delete(name);}));}if(!hasReset){sessionStorage.setItem(marker,'1');window.location.reload();}}catch(e){}});}`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="tr"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${poppins.variable} ${spaceGrotesk.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              name: "Uğur Hoca Matematik",
              url: siteUrl,
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
        {/* PWA */}
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="theme-color" content="#f97316" />
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
      </body>
    </html>
  );
}
