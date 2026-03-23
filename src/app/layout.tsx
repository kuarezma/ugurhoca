import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Uğur Hoca Matematik - Matematik Öğrenme Platformu",
  description: "Çalışma kağıtları, testler, oyunlar ve daha fazlasıyla matematik öğrenmeyi keşfet!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
