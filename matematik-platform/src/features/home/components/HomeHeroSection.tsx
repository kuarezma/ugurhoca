'use client';

import {
  ArrowRight,
  BookOpen,
  Calculator,
  Compass,
  FileSignature,
  Gamepad2,
  GraduationCap,
  Lightbulb,
  PenTool,
  Sparkles,
  Timer,
  Zap,
} from 'lucide-react';
import { SafeLink } from '@/components/SafeLink';
import type { AppUser } from '@/types';

type HomeHeroSectionProps = {
  user?: AppUser | null;
  onOpenFlashcards?: () => void;
  onOpenScratchpad?: () => void;
  onOpenCalculator?: (tab?: 'lgs' | 'yks') => void;
  onOpenPomodoro?: () => void;
  onOpenChecklist?: () => void;
  onOpenGraph?: () => void;
  onOpenProofs?: () => void;
  onOpenCheatSheet?: () => void;
  onOpenGlossary?: () => void;
  onOpenTopicWeights?: () => void;
  onOpenWeeklyPlanner?: () => void;
  onOpenSpeedDrill?: () => void;
};

export function HomeHeroSection({
  user,
  onOpenFlashcards,
  onOpenScratchpad,
  onOpenCalculator,
  onOpenPomodoro,
  onOpenCheatSheet,
  onOpenProofs,
  onOpenGlossary,
}: HomeHeroSectionProps) {
  const firstName = user?.name?.split(' ')[0];
  const greeting = firstName ? `Merhaba ${firstName}!` : 'Matematiğe Hoş Geldin!';

  return (
    <section className="relative px-4 pb-10 sm:pb-16 pt-2 sm:pt-10">
      {/* 1. Lüks Arka Plan Parıltısı (Ambient Glow Mesh) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-80 w-full max-w-6xl -translate-x-1/2 rounded-full bg-gradient-to-r from-sky-400/15 via-indigo-500/10 to-emerald-400/15 blur-3xl dark:from-sky-500/10 dark:via-indigo-500/5 dark:to-emerald-500/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-0 -z-10 h-72 w-72 rounded-full bg-purple-400/10 blur-3xl dark:bg-purple-600/5"
      />

      <div className="mx-auto max-w-6xl space-y-6 sm:space-y-16">

        {/* 2. Hero Başlık Vitrini & Canlı Göstergeler */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 sm:gap-6 border-b border-slate-200/80 dark:border-white/10 pb-5 sm:pb-8">
          <div className="max-w-2xl space-y-2.5 sm:space-y-4">
            
            {/* Lüks Rozet */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-white/90 dark:bg-slate-900/90 border border-sky-300/80 dark:border-sky-500/40 px-3 py-1 sm:px-4 sm:py-1.5 text-[11px] sm:text-xs font-black text-sky-900 dark:text-sky-200 uppercase tracking-wider shadow-xs backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-sky-600 dark:text-sky-400 animate-pulse" />
              <span>Ortaokul Matematik Platformu · MEB 2026-2027</span>
            </div>

            {/* H1 Başlık (CLAUDE.md Kuralı: text-primary) */}
            <h1 className="font-display text-2xl sm:text-5xl lg:text-6xl font-black text-primary tracking-tight leading-[1.15] sm:leading-[1.12]">
              {greeting}
            </h1>

            <p className="text-xs sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-2xl">
              5, 6, 7 ve 8. sınıf MEB müfredatına tam uyumlu yaprak testler, yeni nesil soru föyleri ve zihin açan matematik oyunları tek adreste.
            </p>

            {/* Hızlı Sınıf Atlama Butonları (Quick Jump Pills) */}
            <div className="pt-1 sm:pt-2 flex flex-wrap items-center gap-1.5 sm:gap-2.5">
              <SafeLink
                href="/icerikler?grade=5"
                className="group inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-sky-800 dark:text-sky-200 hover:bg-sky-50 dark:hover:bg-sky-950/60 hover:border-sky-400 transition-all shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-95"
              >
                <span className="h-2 w-2 rounded-full bg-sky-500" />
                <span>5. Sınıf</span>
              </SafeLink>
              <SafeLink
                href="/icerikler?grade=6"
                className="group inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-amber-800 dark:text-amber-200 hover:bg-amber-50 dark:hover:bg-amber-950/60 hover:border-amber-400 transition-all shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-95"
              >
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span>6. Sınıf</span>
              </SafeLink>
              <SafeLink
                href="/icerikler?grade=7"
                className="group inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-purple-800 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-950/60 hover:border-purple-400 transition-all shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-95"
              >
                <span className="h-2 w-2 rounded-full bg-purple-500" />
                <span>7. Sınıf</span>
              </SafeLink>
              <SafeLink
                href="/icerikler?grade=8"
                className="group inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-rose-800 dark:text-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/60 hover:border-rose-400 transition-all shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-95"
              >
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                <span className="font-black">8. Sınıf (LGS)</span>
              </SafeLink>
            </div>
          </div>

          {/* İstatistik & Güven Bento Kutuları (Masaüstünde gösterilir, mobilde dikey alanı tıkamaması için gizlenir) */}
          <div className="hidden sm:flex shrink-0 sm:flex-nowrap lg:flex-col gap-3">
            <div className="flex items-center gap-3 rounded-2xl bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 p-3.5 shadow-sm backdrop-blur-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 shadow-xs">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div>
                <div className="text-xs font-black text-slate-900 dark:text-white">%100 Ücretsiz & Reklamsız</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Tüm içerikler öğrencilere açık</div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 p-3.5 shadow-sm backdrop-blur-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-black text-xs shadow-xs">
                PDF
              </div>
              <div>
                <div className="text-xs font-black text-slate-900 dark:text-white">100+ Yaprak Test & Föy</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Cevap anahtarlı ve çözümlü</div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. İki Büyük Süper Eylem Kapısı (The Grand Portals) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
          
          {/* YAPRAK TESTLER KARTI */}
          <SafeLink
            href="/icerikler?type=yaprak-test"
            aria-label="Yaprak Testler ve Ders İçerikleri"
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-9 transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-sky-50/90 via-white to-blue-50/70 dark:from-sky-950/50 dark:via-slate-900/95 dark:to-blue-950/40 border-2 border-sky-200/90 dark:border-sky-500/30 shadow-md sm:shadow-lg shadow-sky-500/5 hover:shadow-2xl hover:shadow-sky-500/15 hover:border-sky-400 dark:hover:border-sky-400/60"
          >
            {/* Kart İçi Dekoratif Radyal Işık */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-sky-400/10 blur-2xl group-hover:bg-sky-400/20 transition-all duration-300"
            />

            <div className="relative">
              <div className="flex items-center justify-between gap-3 mb-3 sm:mb-6">
                <div className="flex h-12 w-12 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-sky-500 via-sky-600 to-blue-700 text-white dark:text-white shadow-lg sm:shadow-xl shadow-sky-500/30 ring-2 sm:ring-4 ring-sky-500/10 group-hover:scale-105 group-hover:rotate-1 transition-all duration-300">
                  <FileSignature className="h-6 w-6 sm:h-8 sm:w-8" />
                </div>
                <span className="rounded-full bg-sky-800 dark:bg-sky-900 text-white dark:text-sky-100 text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-2.5 py-1 sm:px-3.5 sm:py-1.5 shadow-xs">
                  Müfredat 2026-2027
                </span>
              </div>

              <h2 className="font-display text-xl sm:text-3xl font-black text-slate-900 dark:text-white mb-1.5 sm:mb-2 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                Yaprak Testler & İçerikler
              </h2>

              <p className="text-xs sm:text-base text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-3 sm:mb-6 line-clamp-2 sm:line-clamp-none">
                5, 6, 7 ve 8. sınıf kazanım yaprak testleri, yeni nesil soru föyleri, çalışma kağıtları ve ders içeriklerine anında ulaşın.
              </p>

              {/* Önizleme Konu Etiketleri (Mobilde gizlenerek kart yüksekliği optimize edilir, masaüstünde tam gösterilir) */}
              <div className="hidden sm:flex flex-wrap gap-2 mb-8">
                <span className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-800/90 text-sky-800 dark:text-sky-200 border border-sky-200/90 dark:border-sky-800/60 shadow-2xs">
                  Üslü & Köklü Sayılar
                </span>
                <span className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-800/90 text-sky-800 dark:text-sky-200 border border-sky-200/90 dark:border-sky-800/60 shadow-2xs">
                  Çarpanlar ve Katlar
                </span>
                <span className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-800/90 text-sky-800 dark:text-sky-200 border border-sky-200/90 dark:border-sky-800/60 shadow-2xs">
                  Kesirler & Cebir
                </span>
                <span className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-800/90 text-sky-800 dark:text-sky-200 border border-sky-200/90 dark:border-sky-800/60 shadow-2xs">
                  LGS Branş Denemeleri
                </span>
              </div>
            </div>

            <div className="relative pt-3 sm:pt-4 border-t border-sky-200/80 dark:border-white/10 flex items-center justify-between text-xs sm:text-base font-bold text-sky-800 dark:text-sky-300">
              <span className="flex items-center gap-1.5 sm:gap-2">
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-sky-600 dark:text-sky-400" />
                Yaprak Test İçeriklerini Aç
              </span>
              <div className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-lg sm:rounded-xl bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-300 shadow-xs sm:shadow-sm border border-slate-200/80 dark:border-slate-700 group-hover:bg-sky-600 group-hover:text-white group-hover:border-sky-600 group-hover:translate-x-1.5 sm:group-hover:translate-x-2 transition-all duration-300">
                <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
            </div>
          </SafeLink>

          {/* MATEMATİK OYUNLARI KARTI */}
          <SafeLink
            href="/oyunlar"
            aria-label="Matematik Oyunları Dünyası"
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-9 transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/70 dark:from-emerald-950/50 dark:via-slate-900/95 dark:to-teal-950/40 border-2 border-emerald-200/90 dark:border-emerald-500/30 shadow-md sm:shadow-lg shadow-emerald-500/5 hover:shadow-2xl hover:shadow-emerald-500/15 hover:border-emerald-400 dark:hover:border-emerald-400/60"
          >
            {/* Kart İçi Dekoratif Radyal Işık */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-400/10 blur-2xl group-hover:bg-emerald-400/20 transition-all duration-300"
            />

            <div className="relative">
              <div className="flex items-center justify-between gap-3 mb-3 sm:mb-6">
                <div className="flex h-12 w-12 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white dark:text-white shadow-lg sm:shadow-xl shadow-emerald-500/30 ring-2 sm:ring-4 ring-emerald-500/10 group-hover:scale-105 group-hover:rotate-1 transition-all duration-300">
                  <Gamepad2 className="h-6 w-6 sm:h-8 sm:w-8" />
                </div>
                <span className="rounded-full bg-emerald-800 dark:bg-emerald-900 text-white dark:text-emerald-100 text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-2.5 py-1 sm:px-3.5 sm:py-1.5 shadow-xs">
                  19 Eğlenceli Oyun
                </span>
              </div>

              <h2 className="font-display text-xl sm:text-3xl font-black text-slate-900 dark:text-white mb-1.5 sm:mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Matematik Oyunları Dünyası
              </h2>

              <p className="text-xs sm:text-base text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-3 sm:mb-6 line-clamp-2 sm:line-clamp-none">
                Çarpım tablosu yarışı, kesir pizzacısı, aritmetik düellosu ve zihin açıcı bulmacalarla matematiği eğlenerek öğrenin.
              </p>

              {/* Önizleme Oyun Avatarları (Mobilde gizlenerek kart yüksekliği optimize edilir, masaüstünde tam gösterilir) */}
              <div className="hidden sm:flex flex-wrap gap-2 mb-8">
                <span className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-800/90 text-emerald-800 dark:text-emerald-200 border border-emerald-200/90 dark:border-emerald-800/60 shadow-2xs">
                  🏎️ Çarpım Yarışı
                </span>
                <span className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-800/90 text-emerald-800 dark:text-emerald-200 border border-emerald-200/90 dark:border-emerald-800/60 shadow-2xs">
                  🍕 Kesir Pizzası
                </span>
                <span className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-800/90 text-emerald-800 dark:text-emerald-200 border border-emerald-200/90 dark:border-emerald-800/60 shadow-2xs">
                  ⚔️ Sayı Düellosu
                </span>
                <span className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-800/90 text-emerald-800 dark:text-emerald-200 border border-emerald-200/90 dark:border-emerald-800/60 shadow-2xs">
                  🎈 Balon Patlatma
                </span>
              </div>
            </div>

            <div className="relative pt-3 sm:pt-4 border-t border-emerald-200/80 dark:border-white/10 flex items-center justify-between text-xs sm:text-base font-bold text-emerald-800 dark:text-emerald-300">
              <span className="flex items-center gap-1.5 sm:gap-2">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400" />
                Oyun Alanına Giriş Yap
              </span>
              <div className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-lg sm:rounded-xl bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 shadow-xs sm:shadow-sm border border-slate-200/80 dark:border-slate-700 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 group-hover:translate-x-1.5 sm:group-hover:translate-x-2 transition-all duration-300">
                <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
            </div>
          </SafeLink>

        </div>

        {/* 4. Sınıflara Göre Matematik (DersMatematik Yapısı) */}
        <div>
          <div className="flex items-baseline justify-between mb-5">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
                <GraduationCap className="h-6 w-6 text-sky-600 dark:text-sky-400" />
                Sınıfını Seç ve İçeriğe Ulaş
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-semibold mt-1">
                MEB müfredatına göre ünitelere ayrılmış kazanım föyleri ve yaprak testler
              </p>
            </div>
            <SafeLink href="/icerikler" className="text-xs sm:text-sm font-bold text-sky-800 dark:text-sky-300 hover:text-sky-950 dark:hover:text-sky-200 transition-colors">
              Tüm Kütüphane →
            </SafeLink>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            {/* 5. Sınıf */}
            <div className="group relative overflow-hidden rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 p-6 shadow-sm hover:border-sky-400 dark:hover:border-sky-500/50 hover:shadow-2xl hover:shadow-sky-500/10 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-400 to-blue-500 opacity-80" />
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white font-display text-xl font-black shadow-md shadow-sky-500/25 group-hover:scale-105 transition-transform">
                    5
                  </div>
                  <span className="text-[11px] font-bold text-sky-800 dark:text-sky-200 bg-sky-50 dark:bg-sky-950/60 px-2.5 py-1 rounded-full border border-sky-200/80 dark:border-sky-800/50">
                    Ortaokul
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white mb-2">5. Sınıf Matematik</h3>
                <ul className="space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-400 mb-6">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                    <span>Doğal Sayılarla İşlemler</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                    <span>Kesirler & Ondalık Gösterim</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                    <span>Süreç İzleme Testleri</span>
                  </li>
                </ul>
              </div>
              <SafeLink
                href="/icerikler?grade=5"
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 py-2.5 text-center text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:bg-sky-600 group-hover:text-white group-hover:border-sky-600 transition-colors shadow-xs"
              >
                5. Sınıf İçeriklerine Git →
              </SafeLink>
            </div>

            {/* 6. Sınıf */}
            <div className="group relative overflow-hidden rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 p-6 shadow-sm hover:border-amber-400 dark:hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500 opacity-80" />
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-600 to-orange-700 text-white font-display text-xl font-black shadow-md shadow-amber-500/25 group-hover:scale-105 transition-transform">
                    6
                  </div>
                  <span className="text-[11px] font-bold text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-200/80 dark:border-amber-800/50">
                    Ortaokul
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white mb-2">6. Sınıf Matematik</h3>
                <ul className="space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-400 mb-6">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    <span>Çarpanlar ve Katlar</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    <span>Kümeler & Tam Sayılar</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    <span>Süreç İzleme Testleri</span>
                  </li>
                </ul>
              </div>
              <SafeLink
                href="/icerikler?grade=6"
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 py-2.5 text-center text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:bg-amber-600 group-hover:text-white group-hover:border-amber-600 transition-colors shadow-xs"
              >
                6. Sınıf İçeriklerine Git →
              </SafeLink>
            </div>

            {/* 7. Sınıf */}
            <div className="group relative overflow-hidden rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 p-6 shadow-sm hover:border-purple-400 dark:hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-400 to-indigo-500 opacity-80" />
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-display text-xl font-black shadow-md shadow-purple-500/25 group-hover:scale-105 transition-transform">
                    7
                  </div>
                  <span className="text-[11px] font-bold text-purple-800 dark:text-purple-200 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1 rounded-full border border-purple-200/80 dark:border-purple-800/50">
                    Ortaokul
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white mb-2">7. Sınıf Matematik</h3>
                <ul className="space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-400 mb-6">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                    <span>Rasyonel Sayılarla İşlemler</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                    <span>Cebirsel İfadeler & Eşitlik</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                    <span>Süreç İzleme Testleri</span>
                  </li>
                </ul>
              </div>
              <SafeLink
                href="/icerikler?grade=7"
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 py-2.5 text-center text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600 transition-colors shadow-xs"
              >
                7. Sınıf İçeriklerine Git →
              </SafeLink>
            </div>

            {/* 8. Sınıf LGS */}
            <div className="group relative overflow-hidden rounded-3xl border-2 border-rose-300 dark:border-rose-500/40 bg-white/95 dark:bg-slate-900/90 p-6 shadow-sm hover:border-rose-500 dark:hover:border-rose-400 hover:shadow-2xl hover:shadow-rose-500/15 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
              <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-rose-500 to-red-600" />
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white font-display text-xl font-black shadow-md shadow-rose-500/30 group-hover:scale-105 transition-transform">
                    8
                  </div>
                  <span className="text-[11px] font-black text-rose-800 dark:text-rose-200 bg-rose-50 dark:bg-rose-950/60 px-3 py-1 rounded-full border border-rose-300 dark:border-rose-800/60">
                    LGS Özel
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white mb-2">8. Sınıf (LGS)</h3>
                <ul className="space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-400 mb-6">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                    <span>Çarpanlar, Üslü & Karekök</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                    <span>Yeni Nesil Yaprak Testler</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                    <span>LGS Branş Denemeleri</span>
                  </li>
                </ul>
              </div>
              <SafeLink
                href="/icerikler?grade=8"
                className="w-full rounded-xl bg-gradient-to-r from-rose-600 to-red-600 text-white border border-rose-600 py-2.5 text-center text-xs font-bold hover:from-rose-700 hover:to-red-700 transition-all shadow-sm"
              >
                8. Sınıf (LGS) Özel Sayfası →
              </SafeLink>
            </div>
          </div>
        </div>

        {/* 5. Sevilen Matematik Oyunları Vitrini */}
        <div>
          <div className="flex items-baseline justify-between mb-5">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
                <Gamepad2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                Popüler Matematik Oyunları
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-semibold mt-1">
                Refleks, strateji ve zihinden işlem becerilerini zirveye taşıyan interaktif oyunlar
              </p>
            </div>
            <SafeLink href="/oyunlar" className="text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-300 hover:text-emerald-950 dark:hover:text-emerald-200 transition-colors">
              Tüm Oyunları Gör (19 Oyun) →
            </SafeLink>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
            
            {/* Oyun 1: Çarpım Yarışı */}
            <SafeLink
              href="/oyunlar"
              className="group rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 p-5 text-center hover:border-emerald-400 dark:hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center justify-between"
            >
              <div>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/70 dark:border-emerald-800/50 text-3xl mb-3.5 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 shadow-2xs">
                  🏎️
                </div>
                <h4 className="font-display text-base font-bold text-slate-900 dark:text-white mb-1">
                  Çarpım Yarışı
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-3.5">
                  Hızlı yanıtla, pistte lider ol
                </p>
              </div>
              <span className="w-full inline-block text-[11px] font-bold text-emerald-800 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/60 py-1.5 rounded-xl border border-emerald-200/70 dark:border-emerald-800/50 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-colors shadow-2xs">
                Hemen Oyna →
              </span>
            </SafeLink>

            {/* Oyun 2: Kesir Pizzacısı */}
            <SafeLink
              href="/oyunlar"
              className="group rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 p-5 text-center hover:border-amber-400 dark:hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center justify-between"
            >
              <div>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/70 dark:border-amber-800/50 text-3xl mb-3.5 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 shadow-2xs">
                  🍕
                </div>
                <h4 className="font-display text-base font-bold text-slate-900 dark:text-white mb-1">
                  Kesir Pizzacısı
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-3.5">
                  Siparişleri kesirlerle hazırla
                </p>
              </div>
              <span className="w-full inline-block text-[11px] font-bold text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/60 py-1.5 rounded-xl border border-amber-200/70 dark:border-amber-800/50 group-hover:bg-amber-600 group-hover:text-white group-hover:border-amber-600 transition-colors shadow-2xs">
                Hemen Oyna →
              </span>
            </SafeLink>

            {/* Oyun 3: Sayı Düellosu */}
            <SafeLink
              href="/oyunlar"
              className="group rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 p-5 text-center hover:border-purple-400 dark:hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center justify-between"
            >
              <div>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200/70 dark:border-purple-800/50 text-3xl mb-3.5 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 shadow-2xs">
                  ⚔️
                </div>
                <h4 className="font-display text-base font-bold text-slate-900 dark:text-white mb-1">
                  Sayı Düellosu
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-3.5">
                  Matematik bilginle rakibini yen
                </p>
              </div>
              <span className="w-full inline-block text-[11px] font-bold text-purple-800 dark:text-purple-200 bg-purple-50 dark:bg-purple-950/60 py-1.5 rounded-xl border border-purple-200/70 dark:border-purple-800/50 group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600 transition-colors shadow-2xs">
                Hemen Oyna →
              </span>
            </SafeLink>

            {/* Oyun 4: Balon Patlatma */}
            <SafeLink
              href="/oyunlar"
              className="group rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 p-5 text-center hover:border-rose-400 dark:hover:border-rose-500/50 hover:shadow-xl hover:shadow-rose-500/10 hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center justify-between"
            >
              <div>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200/70 dark:border-rose-800/50 text-3xl mb-3.5 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 shadow-2xs">
                  🎈
                </div>
                <h4 className="font-display text-base font-bold text-slate-900 dark:text-white mb-1">
                  Balon Patlatma
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-3.5">
                  Doğru işlem balonunu vur
                </p>
              </div>
              <span className="w-full inline-block text-[11px] font-bold text-rose-800 dark:text-rose-200 bg-rose-50 dark:bg-rose-950/60 py-1.5 rounded-xl border border-rose-200/70 dark:border-rose-800/50 group-hover:bg-rose-600 group-hover:text-white group-hover:border-rose-600 transition-colors shadow-2xs">
                Hemen Oyna →
              </span>
            </SafeLink>
          </div>
        </div>

        {/* 6. Matematik Başarı Atölyesi (6'lı Zengin Pratik Araç Kiti) */}
        <div>
          <div className="mb-5">
            <h2 className="font-display text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
              <Zap className="h-6 w-6 text-amber-500" />
              Matematik Başarı Atölyesi
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-semibold mt-1">
              Ders çalışırken, test çözerken ve sınavlara hazırlanırken elinin altında olması gereken akıllı araçlar
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Araç 1: Puan Hesaplama */}
            <button
              type="button"
              onClick={() => onOpenCalculator?.('lgs')}
              className="group relative flex items-start gap-4 rounded-3xl border border-default dark:border-slate-600 bg-white/95 dark:bg-slate-900/90 p-5 text-left hover:border-sky-400 dark:hover:border-sky-500/50 hover:bg-sky-50/30 dark:hover:bg-slate-800/50 hover:shadow-xl hover:shadow-sky-500/5 hover:-translate-y-1 transition-all duration-300 active:scale-[0.99] shadow-xs"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 group-hover:scale-105 transition-transform shadow-xs">
                <Calculator className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                    LGS Puan & Net Hesaplama
                  </h4>
                  <ArrowRight className="h-4 w-4 text-sky-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 line-clamp-2">
                  MEB güncel katsayılarıyla anında yüzdelik dilim ve puan hesapla.
                </p>
              </div>
            </button>

            {/* Araç 2: Pomodoro */}
            <button
              type="button"
              onClick={() => onOpenPomodoro?.()}
              className="group relative flex items-start gap-4 rounded-3xl border border-default dark:border-slate-600 bg-white/95 dark:bg-slate-900/90 p-5 text-left hover:border-rose-400 dark:hover:border-rose-500/50 hover:bg-rose-50/30 dark:hover:bg-slate-800/50 hover:shadow-xl hover:shadow-rose-500/5 hover:-translate-y-1 transition-all duration-300 active:scale-[0.99] shadow-xs"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 group-hover:scale-105 transition-transform shadow-xs">
                <Timer className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                    Odak Pomodoro Sayacı
                  </h4>
                  <ArrowRight className="h-4 w-4 text-rose-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 line-clamp-2">
                  25 dk odaklı matematik çalışması ve dinlendirici mola periyotları.
                </p>
              </div>
            </button>

            {/* Araç 3: Karalama Tahtası */}
            <button
              type="button"
              onClick={() => onOpenScratchpad?.()}
              className="group relative flex items-start gap-4 rounded-3xl border border-default dark:border-slate-600 bg-white/95 dark:bg-slate-900/90 p-5 text-left hover:border-emerald-400 dark:hover:border-emerald-500/50 hover:bg-emerald-50/30 dark:hover:bg-slate-800/50 hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1 transition-all duration-300 active:scale-[0.99] shadow-xs"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 group-hover:scale-105 transition-transform shadow-xs">
                <PenTool className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    Karalama & İşlem Tahtası
                  </h4>
                  <ArrowRight className="h-4 w-4 text-emerald-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 line-clamp-2">
                  Soruları çözerken rahatça işlem yapabileceğin dijital serbest tuval.
                </p>
              </div>
            </button>

            {/* Araç 4: Hızlı Formül Kartları */}
            <button
              type="button"
              onClick={() => onOpenCheatSheet ? onOpenCheatSheet() : onOpenFlashcards?.()}
              className="group relative flex items-start gap-4 rounded-3xl border border-default dark:border-slate-600 bg-white/95 dark:bg-slate-900/90 p-5 text-left hover:border-amber-400 dark:hover:border-amber-500/50 hover:bg-amber-50/30 dark:hover:bg-slate-800/50 hover:shadow-xl hover:shadow-amber-500/5 hover:-translate-y-1 transition-all duration-300 active:scale-[0.99] shadow-xs"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 group-hover:scale-105 transition-transform shadow-xs">
                <Lightbulb className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    Hızlı Formül & Kural Kartları
                  </h4>
                  <ArrowRight className="h-4 w-4 text-amber-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 line-clamp-2">
                  Geometri, üslü sayılar ve cebir formüllerini anında gözden geçir.
                </p>
              </div>
            </button>

            {/* Araç 5: Görsel İspatlar */}
            <button
              type="button"
              onClick={() => onOpenProofs?.()}
              className="group relative flex items-start gap-4 rounded-3xl border border-default dark:border-slate-600 bg-white/95 dark:bg-slate-900/90 p-5 text-left hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:bg-indigo-50/30 dark:hover:bg-slate-800/50 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300 active:scale-[0.99] shadow-xs"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 group-hover:scale-105 transition-transform shadow-xs">
                <Compass className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    Görsel İspatlar & Geometri
                  </h4>
                  <ArrowRight className="h-4 w-4 text-indigo-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 line-clamp-2">
                  Pisagor teoremi ve geometrik ispatları etkileşimli görsel olarak keşfet.
                </p>
              </div>
            </button>

            {/* Araç 6: Kavram Sözlüğü */}
            <button
              type="button"
              onClick={() => onOpenGlossary?.()}
              className="group relative flex items-start gap-4 rounded-3xl border border-default dark:border-slate-600 bg-white/95 dark:bg-slate-900/90 p-5 text-left hover:border-purple-400 dark:hover:border-purple-500/50 hover:bg-purple-50/30 dark:hover:bg-slate-800/50 hover:shadow-xl hover:shadow-purple-500/5 hover:-translate-y-1 transition-all duration-300 active:scale-[0.99] shadow-xs"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 group-hover:scale-105 transition-transform shadow-xs">
                <BookOpen className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    Matematik Terimler Sözlüğü
                  </h4>
                  <ArrowRight className="h-4 w-4 text-purple-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 line-clamp-2">
                  A&apos;dan Z&apos;ye ortaokul matematik kavramları ve açıklamaları.
                </p>
              </div>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
