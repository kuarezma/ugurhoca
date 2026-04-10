import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import InstallPrompt from "@/components/InstallPrompt";
import { THEME_STORAGE_KEY } from "@/components/theme-constants";
import "./globals.css";

export const metadata: Metadata = {
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
    url: "https://ugurhoca.com",
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
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
            __html: `if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){});});}`,
          }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
        <InstallPrompt />
      </body>
    </html>
  );
}
