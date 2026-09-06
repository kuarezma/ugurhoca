'use client';

import Link from 'next/link';
import {
  Compass,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Triangle,
  Layers,
  GraduationCap,
  School,
  Shield,
} from 'lucide-react';
import { SITE_URL } from '@/lib/site-metadata';

export const PUBLIC_TOOLS = [
  {
    id: 'lgs',
    title: '2026/2027 MEB LGS Puan & Yüzdelik Dilim Robotu',
    description:
      '3 yanlış 1 doğru kuralına göre güncel standart sapma ve katsayılarla anlık LGS puanı ve tahmini yüzdelik dilimini hesapla.',
    href: '/araclar/lgs-puan-hesaplama',
    icon: School,
    gradient: 'from-cyan-500 via-blue-600 to-indigo-600',
    tag: 'LGS 2026/2027',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  },
  {
    id: 'yks',
    title: '2026/2027 ÖSYM YKS (TYT-AYT) Puan & Sıralama Hesaplayıcı',
    description:
      'TYT, Sayısal, Eşit Ağırlık ve Sözel puanlarını OBP diploma notuyla birlikte hesapla, tahmini başarı sıranı öğren.',
    href: '/araclar/yks-puan-hesaplama',
    icon: GraduationCap,
    gradient: 'from-violet-500 via-purple-600 to-pink-600',
    tag: 'YKS (TYT / AYT)',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  },
  {
    id: 'ebob-ekok',
    title: 'Adım Adım EBOB - EKOK & Asal Çarpan Hesaplayıcı',
    description:
      'İki veya üç sayının bölen listesi algoritmasını adım adım gör. Ortak bölenler, en küçük ortak kat ve aralarında asallık analizi.',
    href: '/araclar/ebob-ekok-hesaplayici',
    icon: Layers,
    gradient: 'from-emerald-500 via-teal-600 to-cyan-600',
    tag: '8. Sınıf & TYT',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
  {
    id: 'pisagor',
    title: 'Dik Üçgen Pisagor Bağıntısı & Hipotenüs Hesaplayıcı',
    description:
      'Dik kenarları gir, hipotenüsü ve kareler toplamı adımlarını anında gör. 3-4-5, 5-12-13 gibi özel üçgen dedektörü.',
    href: '/araclar/pisagor-hesaplayici',
    icon: Triangle,
    gradient: 'from-amber-500 via-orange-600 to-rose-600',
    tag: 'Geometri',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
];

export function ToolsHubContainer() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Uğur Hoca Matematik ve Sınav Araçları',
    description: 'Ücretsiz LGS, YKS ve matematik hesaplama araçları koleksiyonu',
    url: `${SITE_URL}/araclar`,
    numberOfItems: PUBLIC_TOOLS.length,
    itemListElement: PUBLIC_TOOLS.map((tool, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: tool.title,
      url: `${SITE_URL}${tool.href}`,
    })),
  };

  return (
    <main className="min-h-screen gradient-bg px-4 pb-16 pt-20 sm:px-6 sm:pt-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-5xl">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-bold text-indigo-300 shadow-sm mb-4">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>%100 Ücretsiz · Reklamsız · Kayıt Gerektirmez</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-display">
            İnteraktif Matematik & Sınav Araçları
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
            LGS ve YKS hazırlığında ihtiyacın olan en güncel puan hesaplayıcılar,
            adım adım matematik çözücüleri ve görsel simülatörler tek çatı altında.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-emerald-400" />
              <span>Verileriniz Kaydedilmez</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-sky-400" />
              <span>2026/2027 MEB & ÖSYM Katsayıları</span>
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PUBLIC_TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.id}
                href={tool.href}
                className="group relative flex flex-col justify-between rounded-3xl border border-white/10 bg-slate-900/80 p-6 sm:p-8 shadow-xl backdrop-blur-md transition-all duration-300 hover:border-indigo-500/50 hover:bg-slate-900/95 hover:shadow-2xl hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${tool.gradient} text-white shadow-lg group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-bold ${tool.badgeColor}`}
                    >
                      {tool.tag}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {tool.title}
                  </h2>

                  <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                    {tool.description}
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-2 text-sm font-bold text-indigo-400 group-hover:text-indigo-300">
                  <span>Hesaplamaya Başla</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom Platform Invitation Banner */}
        <div className="mt-12 rounded-3xl border border-white/10 bg-gradient-to-r from-indigo-950/60 via-purple-950/60 to-slate-900/80 p-6 sm:p-8 text-center backdrop-blur-md">
          <div className="flex justify-center mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400">
              <Compass className="h-5 w-5" />
            </div>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white">
            Matematik netlerini artırmak için eksiklerini keşfet
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Uğur Hoca Matematik Platformu'nda binlerce ücretsiz yaprak test,
            aralıklı tekrar formül kartları ve canlı dersler seni bekliyor.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/testler"
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg transition hover:bg-indigo-500"
            >
              Ücretsiz Test Çöz
            </Link>
            <Link
              href="/programlar"
              className="rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 text-xs sm:text-sm font-bold text-white transition hover:bg-white/10"
            >
              LGS & YKS Tercih Sihirbazı
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
export default ToolsHubContainer;
