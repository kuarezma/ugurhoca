import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import { THEME_STORAGE_KEY } from "@/components/theme-constants";
import "./globals.css";

export const metadata: Metadata = {
  title: "Uğur Hoca Matematik - Matematik Öğrenme Platformu",
  description: "Çalışma kağıtları, testler, oyunlar ve daha fazlasıyla matematik öğrenmeyi keşfet!",
  keywords: ["matematik", "ders", "test", "sorular", "lgs", "yks", "çözüm", "egitim"],
  authors: [{ name: "Uğur Hoca" }],
  openGraph: {
    title: "Uğur Hoca Matematik",
    description: "Çalışma kağıtları, testler, oyunlar ve daha fazlasıyla matematik öğrenmeyi keşfet!",
    type: "website",
    locale: "tr_TR",
    alternateLocale: "en_US",
    siteName: "Uğur Hoca",
  },
  twitter: {
    card: "summary_large_image",
    title: "Uğur Hoca Matematik",
    description: "Çalışma kağıtları, testler, oyunlar ve daha fazlasıyla matematik öğrenmeyi keşfet!",
  },
  robots: {
    index: true,
    follow: true,
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
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
