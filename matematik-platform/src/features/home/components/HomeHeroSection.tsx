'use client';

import {
  ArrowRight,
  BookOpen,
  Calculator,
  Compass,
  FileSignature,
  Flame,
  Gamepad2,
  GraduationCap,
  Layers,
  LineChart,
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
}: HomeHeroSectionProps) {
  const firstName = user?.name?.split(' ')[0];
  const greeting = firstName ? `Merhaba ${firstName}!` : 'Matematiğe Hoş Geldin!';

  return (
    <section className="relative px-4 pb-12 pt-4 sm:pt-8">
      <div className="mx-auto max-w-6xl space-y-8 sm:space-y-10">

        {/* 1. Üst Başlık & Sıcak Karşılama */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 dark:bg-sky-900/50 px-3 py-1 text-xs font-black text-sky-800 dark:text-sky-200 uppercase tracking-wider mb-2">
              <Sparkles className="h-3.5 w-3.5 text-sky-600 dark:text-sky-300" />
              <span>Ortaokul Matematik Platformu</span>
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-black text-primary tracking-tight">
              {greeting}
            </h1>
            <p className="mt-1 text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium max-w-2xl">
              5, 6, 7 ve 8. sınıf MEB müfredatına tam uyumlu yaprak testler, soru föyleri ve zihin açan matematik oyunları tek adreste.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-700 px-3.5 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              %100 Ücretsiz & Reklamsız
            </span>
          </div>
        </div>

        {/* 2. En Tepede İki Büyük Süper Eylem Kapısı (Yaprak Testler & Oyunlar) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">

          {/* YAPRAK TESTLER KARTI */}
          <SafeLink
            href="/icerikler?type=yaprak-test"
            aria-label="Yaprak Testler ve Ders İçerikleri"
            className="group relative flex flex-col justify-between overflow-hidden rounded-3xl p-6 sm:p-8 transition-all duration-200 hover:-translate-y-1 bg-gradient-to-br from-sky-50 to-blue-100/70 dark:from-sky-950 dark:to-slate-900 border-2 border-sky-200 dark:border-sky-800 shadow-sm hover:shadow-md hover:border-sky-300 dark:hover:border-sky-600"
          >
            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-md shadow-sky-600/30 group-hover:scale-105 transition-transform">
                  <FileSignature className="h-7 w-7" />
                </div>
                <span className="rounded-full bg-sky-700 text-white text-[11px] font-black uppercase tracking-wider px-3 py-1">
                  Müfredat 2026-2027
                </span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-50 mb-2">
                Yaprak Testler & İçerikler
              </h2>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 font-medium leading-relaxed mb-6">
                5, 6, 7 ve 8. sınıf kazanım yaprak testleri, yeni nesil soru föyleri, çalışma kağıtları ve ders içeriklerine anında ulaşın.
              </p>
            </div>

            <div className="pt-4 border-t border-sky-200/80 dark:border-sky-800 flex items-center justify-between text-sm sm:text-base font-bold text-sky-800 dark:text-sky-200">
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />
                Yaprak Test İçeriklerini Aç
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-300 shadow-sm group-hover:translate-x-1 transition-transform">
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </SafeLink>

          {/* MATEMATİK OYUNLARI KARTI */}
          <SafeLink
            href="/oyunlar"
            aria-label="Matematik Oyunları Dünyası"
            className="group relative flex flex-col justify-between overflow-hidden rounded-3xl p-6 sm:p-8 transition-all duration-200 hover:-translate-y-1 bg-gradient-to-br from-emerald-50 to-teal-100/70 dark:from-emerald-950 dark:to-slate-900 border-2 border-emerald-200 dark:border-emerald-800 shadow-sm hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-600"
          >
            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30 group-hover:scale-105 transition-transform">
                  <Gamepad2 className="h-7 w-7" />
                </div>
                <span className="rounded-full bg-emerald-700 text-white text-[11px] font-black uppercase tracking-wider px-3 py-1">
                  19 Eğlenceli Oyun
                </span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-50 mb-2">
                Matematik Oyunları Dünyası
              </h2>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 font-medium leading-relaxed mb-6">
                Çarpım tablosu yarışı, kesir pizzacısı, aritmetik düellosu ve zihin açıcı bulmacalarla matematiği eğlenerek öğrenin.
              </p>
            </div>

            <div className="pt-4 border-t border-emerald-200/80 dark:border-emerald-800 flex items-center justify-between text-sm sm:text-base font-bold text-emerald-800 dark:text-emerald-200">
              <span className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                Oyun Alanına Giriş Yap
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-sm group-hover:translate-x-1 transition-transform">
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </SafeLink>

        </div>

        {/* 3. Sınıflara Göre Matematik (DersMatematik Yapısı) */}
        <div>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-display text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-sky-600 dark:text-sky-300" />
              Sınıfını Seç ve İçeriğe Ulaş
            </h2>
            <SafeLink href="/icerikler" className="text-xs sm:text-sm font-bold text-sky-800 dark:text-sky-300 hover:text-sky-950 dark:hover:text-sky-200">
              Tüm Sınıflar & Müfredat →
            </SafeLink>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 5. Sınıf */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-xs hover:border-sky-400 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 dark:bg-sky-900/50 text-sky-800 dark:text-sky-200 font-display text-lg font-black mb-3">
                  5.
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-slate-50 mb-2">5. Sınıf Matematik</h3>
                <ul className="space-y-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 mb-4">
                  <li>• Doğal Sayılarla İşlemler</li>
                  <li>• Kesirler & Ondalık Gösterim</li>
                  <li>• Süreç İzleme Testleri</li>
                </ul>
              </div>
              <SafeLink
                href="/icerikler?grade=5"
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-2 text-center text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-sky-600 hover:text-white hover:border-sky-600 transition-colors"
              >
                5. Sınıf Sayfasına Git
              </SafeLink>
            </div>

            {/* 6. Sınıf */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-xs hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 font-display text-lg font-black mb-3">
                  6.
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-slate-50 mb-2">6. Sınıf Matematik</h3>
                <ul className="space-y-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 mb-4">
                  <li>• Çarpanlar ve Katlar</li>
                  <li>• Kümeler & Tam Sayılar</li>
                  <li>• Süreç İzleme Testleri</li>
                </ul>
              </div>
              <SafeLink
                href="/icerikler?grade=6"
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-2 text-center text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-amber-600 hover:text-white hover:border-amber-600 transition-colors"
              >
                6. Sınıf Sayfasına Git
              </SafeLink>
            </div>

            {/* 7. Sınıf */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-xs hover:border-purple-400 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 font-display text-lg font-black mb-3">
                  7.
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-slate-50 mb-2">7. Sınıf Matematik</h3>
                <ul className="space-y-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 mb-4">
                  <li>• Rasyonel Sayılarla İşlemler</li>
                  <li>• Cebirsel İfadeler & Eşitlik</li>
                  <li>• Süreç İzleme Testleri</li>
                </ul>
              </div>
              <SafeLink
                href="/icerikler?grade=7"
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-2 text-center text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-colors"
              >
                7. Sınıf Sayfasına Git
              </SafeLink>
            </div>

            {/* 8. Sınıf LGS */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-xs hover:border-rose-400 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200 font-display text-lg font-black mb-3">
                  8.
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-slate-50 mb-2">8. Sınıf (LGS)</h3>
                <ul className="space-y-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 mb-4">
                  <li>• Çarpanlar, Üslü & Karekök</li>
                  <li>• Yeni Nesil Yaprak Testler</li>
                  <li>• LGS Branş Denemeleri</li>
                </ul>
              </div>
              <SafeLink
                href="/icerikler?grade=8"
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-2 text-center text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-colors"
              >
                8. Sınıf (LGS) Sayfasına Git
              </SafeLink>
            </div>
          </div>
        </div>

        {/* 4. Sevilen Matematik Oyunları Vitrini */}
        <div>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-display text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <Gamepad2 className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
              Popüler Matematik Oyunları
            </h2>
            <SafeLink href="/oyunlar" className="text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-300 hover:text-emerald-950 dark:hover:text-emerald-200">
              Tüm Oyunları Gör (19 Oyun) →
            </SafeLink>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <SafeLink
              href="/oyunlar"
              className="group rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-center hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-md transition-all"
            >
              <div className="text-3xl sm:text-4xl mb-2 group-hover:scale-110 transition-transform">🏎️</div>
              <h4 className="font-display text-sm sm:text-base font-bold text-slate-900 dark:text-slate-50">Çarpım Yarışı</h4>
              <span className="inline-block mt-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/40 px-2 py-0.5 rounded-md">
                Refleks & Hız
              </span>
            </SafeLink>

            <SafeLink
              href="/oyunlar"
              className="group rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-center hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-md transition-all"
            >
              <div className="text-3xl sm:text-4xl mb-2 group-hover:scale-110 transition-transform">🍕</div>
              <h4 className="font-display text-sm sm:text-base font-bold text-slate-900 dark:text-slate-50">Kesir Pizzacısı</h4>
              <span className="inline-block mt-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/40 px-2 py-0.5 rounded-md">
                Görsel Kesirler
              </span>
            </SafeLink>

            <SafeLink
              href="/oyunlar"
              className="group rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-center hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-md transition-all"
            >
              <div className="text-3xl sm:text-4xl mb-2 group-hover:scale-110 transition-transform">⚔️</div>
              <h4 className="font-display text-sm sm:text-base font-bold text-slate-900 dark:text-slate-50">Matematik Düellosu</h4>
              <span className="inline-block mt-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/40 px-2 py-0.5 rounded-md">
                Canlı Yarışma
              </span>
            </SafeLink>

            <SafeLink
              href="/oyunlar"
              className="group rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-center hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-md transition-all"
            >
              <div className="text-3xl sm:text-4xl mb-2 group-hover:scale-110 transition-transform">🎈</div>
              <h4 className="font-display text-sm sm:text-base font-bold text-slate-900 dark:text-slate-50">Balon Patlatma</h4>
              <span className="inline-block mt-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/40 px-2 py-0.5 rounded-md">
                Hızlı Dört İşlem
              </span>
            </SafeLink>
          </div>
        </div>

        {/* 5. Pratik Matematik Araçları (Modallar & Hızlı Çözümler) */}
        <div>
          <h2 className="font-display text-lg sm:text-xl font-black text-slate-900 dark:text-slate-50 mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500 dark:text-amber-300" />
            Pratik Araçlar
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => onOpenCalculator?.('lgs')}
              className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-left hover:border-sky-400 hover:bg-sky-50/50 dark:hover:bg-sky-950/40 transition-colors"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-200">
                <Calculator className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-50">LGS Puan & Net Hesaplama</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">MEB güncel katsayılarıyla anında hesapla</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onOpenPomodoro?.()}
              className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-left hover:border-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-950/40 transition-colors"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-200">
                <Timer className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-50">Odak Pomodoro Sayacı</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">25 dk odaklı matematik çalışma döngüsü</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onOpenScratchpad?.()}
              className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-left hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40 transition-colors"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-200">
                <PenTool className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-50">Karalama & İşlem Tahtası</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Serbest karalama ve şekil çizim tahtası</p>
              </div>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
