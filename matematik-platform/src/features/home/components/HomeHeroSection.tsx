'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Zap,
  ArrowRight,
  ChevronDown,
  Calculator,
  GraduationCap,
  Timer,
  PenTool,
  Layers,
  BookMarked,
  LineChart,
  Compass,
  BookOpen,
  Target,
  Calendar,
  Gamepad2,
  MonitorPlay,
  ClipboardList,
  Video,
  Presentation,
  AppWindow,
} from 'lucide-react';
import { Mascot } from '@/components/Mascot';
import { SafeLink } from '@/components/SafeLink';
import type { AppUser } from '@/types';

type HomeHeroSectionProps = {
  isLight: boolean;
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
  isLight,
  user,
  onOpenFlashcards,
  onOpenScratchpad,
  onOpenCalculator,
  onOpenPomodoro,
  onOpenGraph,
  onOpenProofs,
  onOpenCheatSheet,
  onOpenGlossary,
  onOpenTopicWeights,
  onOpenWeeklyPlanner,
}: HomeHeroSectionProps) {
  const [isLessonsOpen, setIsLessonsOpen] = useState(true);
  const [isToolsOpen, setIsToolsOpen] = useState(true);
  const firstName = user?.name?.split(' ')[0];
  const greeting = firstName ? `Merhaba ${firstName}!` : 'Matematiğe hoş geldin!';

  const lessonCategories = [
    {
      id: 'kitaplar',
      title: 'Kitaplar',
      subtitle: 'MEB ders kitapları ve soru föyleri',
      href: '/icerikler?type=kitaplar',
      icon: BookOpen,
      color: 'from-indigo-500 to-violet-500',
    },
    {
      id: 'yaprak-test',
      title: 'Kazanımlar',
      subtitle: 'Müfredat kazanım testleri ve özetler',
      href: '/icerikler?type=yaprak-test',
      icon: ClipboardList,
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 'ders-videolari',
      title: 'Ders Videoları',
      subtitle: 'Konu anlatım ve soru çözüm kayıtları',
      href: '/icerikler?type=ders-videolari',
      icon: Video,
      color: 'from-red-500 to-orange-500',
    },
    {
      id: 'deneme-sinav',
      title: 'Deneme-Sınav',
      subtitle: 'LGS ve YKS formatında deneme sınavları',
      href: '/icerikler?type=deneme-sinav',
      icon: ClipboardList,
      color: 'from-teal-500 to-cyan-500',
    },
    {
      id: 'cikis-bileti',
      title: 'Çıkış Bileti',
      subtitle: 'Ders sonu hızlı anlama kontrolü',
      href: '/cikis-bileti',
      icon: Presentation,
      color: 'from-violet-500 to-purple-500',
    },
    {
      id: 'programlar',
      title: 'Programlar',
      subtitle: 'LGS & YKS yıllık çalışma programları',
      href: '/programlar',
      icon: AppWindow,
      color: 'from-pink-500 to-rose-500',
    },
  ];

  const quickTools = [
    {
      id: 'lgs-calc',
      title: 'LGS Puan & Net Hesaplama',
      description:
        'MEB güncel katsayıları ve standart sapma projeksiyonuyla anında LGS puanını hesapla.',
      icon: Calculator,
      gradient: 'from-blue-600 to-indigo-600',
      action: () => onOpenCalculator?.('lgs'),
    },
    {
      id: 'yks-calc',
      title: 'YKS (TYT-AYT) Puan Hesaplama',
      description:
        'ÖSYM standart katsayıları, OBP katkısı ve başarı sırası tahminiyle TYT/AYT puanını öğren.',
      icon: GraduationCap,
      gradient: 'from-indigo-600 to-violet-600',
      action: () => onOpenCalculator?.('yks'),
    },
    {
      id: 'pomodoro',
      title: 'Odak Pomodoro Sayacı',
      description:
        '25 dk odaklı matematik çalışması, 5 dk mola döngüleriyle verimini katla.',
      icon: Timer,
      gradient: 'from-rose-500 to-pink-600',
      action: () => onOpenPomodoro?.(),
    },
    {
      id: 'scratchpad',
      title: 'Karalama & İşlem Tahtası',
      description:
        'Geometri şekilleri, serbest karalama ve formül türetmeleri için sonsuz çalışma tahtası.',
      icon: PenTool,
      gradient: 'from-amber-500 to-orange-600',
      action: () => onOpenScratchpad?.(),
    },
    {
      id: 'flashcards',
      title: 'Formül & Bilgi Kartları',
      description:
        'LGS ve YKS müfredatındaki tüm formülleri akıllı tekrar kartlarıyla pekiştir.',
      icon: Layers,
      gradient: 'from-emerald-500 to-teal-600',
      action: () => onOpenFlashcards?.(),
    },
    {
      id: 'cheat-sheet',
      title: 'Pratik Formül & Kural Tablosu',
      description:
        'Cebir, özdeşlikler, üçgenler ve kuralları tek ekranda özetleyen pratik föy.',
      icon: BookMarked,
      gradient: 'from-cyan-500 to-blue-600',
      action: () => onOpenCheatSheet?.(),
    },
    {
      id: 'graph',
      title: 'Fonksiyon & Grafik Çizici',
      description:
        'Denklem, parabol ve eğrilerin koordinat sistemindeki grafiklerini çiz ve incele.',
      icon: LineChart,
      gradient: 'from-purple-600 to-fuchsia-600',
      action: () => onOpenGraph?.(),
    },
    {
      id: 'proofs',
      title: 'Görsel Matematik İspatları',
      description:
        'Pisagor, tam kare ve geometrik teoremlerin animasyonlu görsel ispatları.',
      icon: Sparkles,
      gradient: 'from-pink-500 to-rose-600',
      action: () => onOpenProofs?.(),
    },
    {
      id: 'tactics',
      title: 'LGS Matematik Taktik Köşesi',
      description:
        'Yeni nesil uzun sorularda şık eleme, turlama ve süre kazandıran taktikler.',
      icon: Compass,
      gradient: 'from-sky-500 to-blue-600',
      action: () => {
        const el = document.getElementById('lgs-tactics-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      },
    },
    {
      id: 'glossary',
      title: 'Matematik Kavramlar Sözlüğü',
      description:
        'Tüm matematiksel terimlerin, tanımların ve teorem kurallarının açıklamalı rehberi.',
      icon: BookOpen,
      gradient: 'from-teal-500 to-emerald-600',
      action: () => onOpenGlossary?.(),
    },
    {
      id: 'weights',
      title: 'Konu Soru Dağılım Matrisi',
      description:
        'Son 6 yılda LGS ve YKS sınavlarında hangi konudan kaç soru geldiğini analiz et.',
      icon: Target,
      gradient: 'from-orange-500 to-amber-600',
      action: () => onOpenTopicWeights?.(),
    },
    {
      id: 'planner',
      title: 'Haftalık Çalışma & Hedef Planı',
      description:
        'Haftalık ders, soru ve deneme hedeflerini organize edebileceğin planlayıcı.',
      icon: Calendar,
      gradient: 'from-violet-600 to-indigo-600',
      action: () => onOpenWeeklyPlanner?.(),
    },
  ];

  return (
    <section className="relative px-4 pb-12 pt-6 sm:pt-10">
      <div className="relative mx-auto max-w-6xl">
        <div
          className={`relative overflow-hidden rounded-3xl border px-4 py-7 sm:px-10 sm:py-12 transition-all duration-300 ${
            isLight
              ? 'border-slate-200/90 bg-gradient-to-br from-white via-slate-50/60 to-indigo-50/40 shadow-bento'
              : 'border-white/10 bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-slate-950 shadow-2xl backdrop-blur-xl'
          }`}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-12 -left-12 h-72 w-72 rounded-full bg-pink-500/10 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-12 top-6 text-5xl font-black text-indigo-500/10 sm:text-7xl select-none"
          >
            π
          </div>

          <div className="relative grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center min-w-0 w-full">
            <div className="space-y-5 min-w-0 w-full">
              <div className="flex flex-wrap items-center gap-2">
                <div
                  className={`inline-flex max-w-full items-center gap-1.5 sm:gap-2 rounded-full px-3 py-1 text-[11px] sm:text-xs font-bold uppercase tracking-wider ${
                    isLight
                      ? 'bg-amber-50 text-amber-800 border border-amber-200/80 shadow-sm'
                      : 'bg-amber-400/10 text-amber-300 border border-amber-400/20'
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-500 animate-pulse" aria-hidden="true" />
                  <span className="truncate">🎉 2026-2027 Yeni Eğitim Öğretim Yılı</span>
                </div>

                <div
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] sm:text-xs font-semibold ${
                    isLight
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                      : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20'
                  }`}
                >
                  {user ? 'Hedefe Tam Odaklan!' : 'Ücretsiz & Tam Kapsamlı'}
                </div>
              </div>

              <h1
                className={`font-display text-2xl xs:text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-[3.25rem] ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
                  {greeting}
                </span>{' '}
                <span className={isLight ? 'text-slate-800' : 'text-slate-100'}>
                  Bu Yıl Matematikte Zirveye!
                </span>
              </h1>

              <p
                className={`w-full max-w-lg text-sm sm:text-lg leading-relaxed ${
                  isLight ? 'text-slate-600' : 'text-slate-300'
                }`}
              >
                LGS ve YKS için müfredatla birebir ders notları, yaprak testler, formül kartları,
                karalama tahtası ve canlı dersler seni bekliyor.
              </p>

              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                <SafeLink
                  href="/icerikler"
                  className="group inline-flex h-11 sm:h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-5 sm:px-6 text-sm font-bold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                >
                  <Zap className="h-4 w-4" aria-hidden="true" />
                  Çalışmaya başla
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </SafeLink>
                <SafeLink
                  href="/oyunlar"
                  className={`inline-flex h-11 sm:h-12 items-center justify-center gap-2 rounded-2xl border px-5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
                    isLight
                      ? 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50 shadow-sm'
                      : 'border-white/10 bg-white/5 text-white hover:bg-white/10'
                  }`}
                >
                  Oyunla öğren
                </SafeLink>
              </div>

              {/* Hızlı Sınıf Başlangıç Çipleri */}
              <div className="pt-2 w-full min-w-0">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Sınıfını Seç ve Hemen Başla:
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full [scrollbar-width:none]">
                  {[
                    { label: '5. Sınıf', href: '/icerikler?grade=5' },
                    { label: '6. Sınıf', href: '/icerikler?grade=6' },
                    { label: '7. Sınıf', href: '/icerikler?grade=7' },
                    { label: '8. Sınıf (LGS)', href: '/icerikler?grade=8', highlight: true },
                    { label: '9. Sınıf', href: '/icerikler?grade=9' },
                    { label: '10. Sınıf', href: '/icerikler?grade=10' },
                    { label: '11. Sınıf', href: '/icerikler?grade=11' },
                    { label: '12. Sınıf (YKS)', href: '/icerikler?grade=12', highlight: true },
                    { label: 'Mezun', href: '/icerikler?grade=Mezun' },
                  ].map((item) => (
                    <SafeLink
                      key={item.label}
                      href={item.href}
                      className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                        item.highlight
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm hover:scale-105'
                          : isLight
                          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-slate-200/80'
                          : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10'
                      }`}
                    >
                      {item.label}
                    </SafeLink>
                  ))}
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.92, rotate: -4 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
              className="relative hidden justify-center lg:flex"
            >
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-primary/30 via-brand-pink/20 to-brand-orange/20 blur-3xl"
              />
              <Mascot
                pose={user ? 'celebrate' : 'waving'}
                size={220}
                className="relative animate-float-y"
                ariaLabel={user ? 'Seni tebrik eden maskot Pi' : 'Selamlayan maskot Pi'}
              />
            </motion.div>
          </div>
        </div>

        {/* Karşılama ve Maskotun Hemen Altında: Yaprak Test, Oyunlar & Canlı Ders */}
        <div className="mt-5 sm:mt-7 grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4.5">
          {/* 1. Yaprak Test Kartı (Mobilde üstte tam genişlik, masaüstünde 1. kart) */}
          <SafeLink
            href="/icerikler?type=ders-notlari"
            aria-label="Yaprak Testler"
            className="col-span-2 md:col-span-1 group relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-teal-400/40 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-600/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-teal-600/40 active:scale-[0.99] cursor-pointer"
          >
            {/* Parlak Arka Plan Işık Efekti */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/20 blur-2xl transition-transform duration-500 group-hover:scale-125"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-8 -bottom-8 h-28 w-28 rounded-full bg-cyan-300/20 blur-2xl"
            />

            <div className="relative flex flex-col justify-between h-full space-y-3 sm:space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-10 w-10 sm:h-13 sm:w-13 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-md text-white shadow-inner border border-white/30 group-hover:scale-105 transition-transform duration-300">
                  <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <span className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full bg-black/25 backdrop-blur-md px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-bold text-white border border-white/20 tracking-wide uppercase">
                  <BookMarked className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-cyan-200" />
                  Test & Soru
                </span>
              </div>

              <div>
                <h3 className="font-display text-base sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  Yaprak Test
                </h3>
                <p className="mt-0.5 sm:mt-1 text-[11px] sm:text-sm text-white/90 leading-snug sm:leading-relaxed line-clamp-2">
                  Müfredatla uyumlu konu testleri, yeni nesil soru föyleri ve kazanım özetleri.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-white/20 text-[11px] sm:text-sm font-bold text-white">
                <span className="inline-flex items-center gap-1 opacity-95">
                  Test Çöz
                </span>
                <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-lg sm:rounded-xl bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300 group-hover:translate-x-1">
                  <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
              </div>
            </div>
          </SafeLink>

          {/* 2. Oyunlar Kartı (Mobilde altta solda, masaüstünde 2. kart / ortada) */}
          <SafeLink
            href="/oyunlar"
            aria-label="Matematik Oyunları"
            className="col-span-1 group relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-purple-400/40 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white shadow-lg shadow-purple-600/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-600/40 active:scale-[0.99] cursor-pointer"
          >
            {/* Parlak Arka Plan Işık Efekti */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/20 blur-2xl transition-transform duration-500 group-hover:scale-125"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-8 -bottom-8 h-28 w-28 rounded-full bg-pink-400/20 blur-2xl"
            />

            <div className="relative flex flex-col justify-between h-full space-y-3 sm:space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-10 w-10 sm:h-13 sm:w-13 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-md text-white shadow-inner border border-white/30 group-hover:scale-105 transition-transform duration-300">
                  <Gamepad2 className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <span className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full bg-black/25 backdrop-blur-md px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-bold text-white border border-white/20 tracking-wide uppercase">
                  <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-300" />
                  18 Oyun
                </span>
              </div>

              <div>
                <h3 className="font-display text-base sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  Oyunlar
                </h3>
                <p className="mt-0.5 sm:mt-1 text-[11px] sm:text-sm text-white/90 leading-snug sm:leading-relaxed line-clamp-2">
                  Zihinden işlem, koordinat ve hız oyunlarıyla eğlenerek öğren, reflekslerini geliştir!
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-white/20 text-[11px] sm:text-sm font-bold text-white">
                <span className="inline-flex items-center gap-1 opacity-95">
                  Oyun Alanı
                </span>
                <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-lg sm:rounded-xl bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300 group-hover:translate-x-1">
                  <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
              </div>
            </div>
          </SafeLink>

          {/* 3. Canlı Ders Kartı (Mobilde altta sağda, masaüstünde 3. kart / sağda) */}
          <SafeLink
            href="/canli-ders"
            aria-label="Canlı Dersler"
            className="col-span-1 group relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-red-400/40 bg-gradient-to-br from-red-600 via-rose-600 to-amber-600 text-white shadow-lg shadow-rose-600/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-rose-600/40 active:scale-[0.99] cursor-pointer"
          >
            {/* Parlak Arka Plan Işık Efekti */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/20 blur-2xl transition-transform duration-500 group-hover:scale-125"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-8 -bottom-8 h-28 w-28 rounded-full bg-amber-300/20 blur-2xl"
            />

            <div className="relative flex flex-col justify-between h-full space-y-3 sm:space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-10 w-10 sm:h-13 sm:w-13 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-md text-white shadow-inner border border-white/30 group-hover:scale-105 transition-transform duration-300">
                  <MonitorPlay className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <span className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full bg-black/25 backdrop-blur-md px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-bold text-white border border-white/20 tracking-wide uppercase">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-90" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                  </span>
                  Canlı Yayın
                </span>
              </div>

              <div>
                <h3 className="font-display text-base sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  Canlı Ders
                </h3>
                <p className="mt-0.5 sm:mt-1 text-[11px] sm:text-sm text-white/90 leading-snug sm:leading-relaxed line-clamp-2">
                  Öğretmenle birebir etkileşimli yayınlar, anlık soru masası ve ders kayıtları.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-white/20 text-[11px] sm:text-sm font-bold text-white">
                <span className="inline-flex items-center gap-1 opacity-95">
                  Derse Katıl
                </span>
                <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-lg sm:rounded-xl bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300 group-hover:translate-x-1">
                  <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
              </div>
            </div>
          </SafeLink>
        </div>

        {/* Ders Kategori Kartı (Tıpkı Araçlar Kategori Kartı Tasarımı Gibi) */}
        <div
          className={`mt-4 sm:mt-5 overflow-hidden rounded-2xl sm:rounded-3xl border transition-all duration-300 ${
            isLessonsOpen
              ? 'border-indigo-500/50 bg-indigo-50/20 dark:bg-indigo-950/15 shadow-md'
              : isLight
                ? 'border-slate-200/90 bg-white/90 shadow-bento hover:border-indigo-300/80 hover:shadow-bento-hover'
                : 'border-white/10 bg-slate-900/80 hover:border-white/20'
          }`}
        >
          <button
            type="button"
            onClick={() => setIsLessonsOpen((prev) => !prev)}
            aria-expanded={isLessonsOpen}
            className="flex w-full items-center justify-between p-3.5 sm:p-5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-2xl sm:rounded-3xl cursor-pointer"
          >
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              {/* Sol: İndigo-Mor-Pembe Gradyanlı İkon */}
              <div className="flex h-11 w-11 sm:h-13 sm:w-13 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white shadow-md">
                <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>

              {/* Orta: Başlık, 6 KATEGORİ Rozeti ve Açıklama */}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3
                    className={`font-display text-base sm:text-lg font-bold ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    Ders
                  </h3>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
                      isLight
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    }`}
                  >
                    6 KATEGORİ
                  </span>
                </div>
                <p
                  className={`text-xs sm:text-sm line-clamp-1 mt-0.5 ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  Kitaplar, kazanımlar, ders videoları, denemeler, çıkış bileti...
                </p>
              </div>
            </div>

            {/* Sağ: Dönen Chevron Butonu */}
            <div className="flex items-center gap-2 shrink-0 ml-2">
              <div
                className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl transition-transform duration-300 ${
                  isLessonsOpen
                    ? 'rotate-180 bg-black/10 dark:bg-white/15 text-slate-900 dark:text-white'
                    : isLight
                      ? 'bg-slate-100 text-slate-600'
                      : 'bg-white/10 text-slate-300'
                }`}
              >
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </button>

          {/* Tıklandığında içindeki 7 ders kategorisi sıralanır */}
          <AnimatePresence initial={false}>
            {isLessonsOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="border-t border-slate-200/80 dark:border-white/10 p-3 sm:p-5"
              >
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {lessonCategories.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: index * 0.025 }}
                    >
                      <SafeLink
                        href={item.href}
                        aria-label={`${item.title} kategorisi`}
                        className={`flex items-center gap-3 rounded-xl sm:rounded-2xl border p-3 text-left transition-all hover:-translate-y-0.5 active:scale-[0.99] cursor-pointer ${
                          isLight
                            ? 'border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-indigo-300 hover:shadow-sm'
                            : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} text-white shadow-xs`}
                        >
                          <item.icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4
                            className={`text-xs sm:text-sm font-bold truncate ${
                              isLight ? 'text-slate-900' : 'text-white'
                            }`}
                          >
                            {item.title}
                          </h4>
                          <p
                            className={`text-[11px] sm:text-xs line-clamp-1 mt-0.5 ${
                              isLight ? 'text-slate-500' : 'text-slate-400'
                            }`}
                          >
                            {item.subtitle}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
                      </SafeLink>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

          {/* Kullanıcının gönderdiği resimdeki Araçlar Kategori Kartı */}
          <div
            className={`mt-3.5 sm:mt-4 overflow-hidden rounded-2xl sm:rounded-3xl border transition-all duration-300 ${
              isToolsOpen
                ? 'border-amber-500/50 bg-amber-50/20 dark:bg-amber-950/15 shadow-md'
                : isLight
                  ? 'border-slate-200/90 bg-white/90 shadow-bento hover:border-amber-300/80 hover:shadow-bento-hover'
                  : 'border-white/10 bg-slate-900/80 hover:border-white/20'
            }`}
          >
            <button
              type="button"
              onClick={() => setIsToolsOpen((prev) => !prev)}
              aria-expanded={isToolsOpen}
              className="flex w-full items-center justify-between p-3.5 sm:p-5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-2xl sm:rounded-3xl cursor-pointer"
            >
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                {/* Sol: Turuncu-Pembe Gradyanlı İkon */}
                <div className="flex h-11 w-11 sm:h-13 sm:w-13 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 via-rose-500 to-purple-600 text-white shadow-md">
                  <Zap className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>

                {/* Orta: Başlık, 12 ARAÇ Rozeti ve Açıklama */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3
                      className={`font-display text-base sm:text-lg font-bold ${
                        isLight ? 'text-slate-900' : 'text-white'
                      }`}
                    >
                      Araçlar
                    </h3>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
                        isLight
                          ? 'bg-slate-800 text-slate-200'
                          : 'bg-slate-800 text-slate-300 border border-white/5'
                      }`}
                    >
                      12 ARAÇ
                    </span>
                  </div>
                  <p
                    className={`text-xs sm:text-sm line-clamp-1 mt-0.5 ${
                      isLight ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    Puan/net hesaplayıcı, Pomodoro, tahta, formül kartları...
                  </p>
                </div>
              </div>

              {/* Sağ: Dönen Chevron Butonu */}
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <div
                  className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl transition-transform duration-300 ${
                    isToolsOpen
                      ? 'rotate-180 bg-black/10 dark:bg-white/15 text-slate-900 dark:text-white'
                      : isLight
                        ? 'bg-slate-100 text-slate-600'
                        : 'bg-white/10 text-slate-300'
                  }`}
                >
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
            </button>

            {/* Tıklandığında içindeki 12 araç sırayla aşağıya doğru sıralanır */}
            <AnimatePresence initial={false}>
              {isToolsOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="border-t border-slate-200/80 dark:border-white/10 p-3 sm:p-5"
                >
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {quickTools.map((tool, idx) => (
                      <motion.button
                        key={tool.id}
                        type="button"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: idx * 0.025 }}
                        onClick={tool.action}
                        className={`flex items-center gap-3 rounded-xl sm:rounded-2xl border p-3 text-left transition-all hover:-translate-y-0.5 active:scale-[0.99] cursor-pointer ${
                          isLight
                            ? 'border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-amber-300 hover:shadow-sm'
                            : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${tool.gradient} text-white shadow-xs`}
                        >
                          <tool.icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4
                            className={`text-xs sm:text-sm font-bold truncate ${
                              isLight ? 'text-slate-900' : 'text-white'
                            }`}
                          >
                            {tool.title}
                          </h4>
                          <p
                            className={`text-[11px] sm:text-xs line-clamp-1 mt-0.5 ${
                              isLight ? 'text-slate-500' : 'text-slate-400'
                            }`}
                          >
                            {tool.description}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    );
  }
