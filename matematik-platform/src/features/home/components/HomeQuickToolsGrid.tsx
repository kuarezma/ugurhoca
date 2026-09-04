'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  BookOpen,
  PenTool,
  Target,
  Gamepad2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

type HomeQuickToolsGridProps = {
  isLight: boolean;
  onOpenFlashcards: () => void;
  onOpenScratchpad: () => void;
  onOpenCalculator?: () => void;
  onOpenPomodoro?: () => void;
  onOpenChecklist?: () => void;
};

export function HomeQuickToolsGrid({
  isLight,
  onOpenFlashcards,
  onOpenScratchpad,
  onOpenCalculator,
  onOpenPomodoro,
  onOpenChecklist,
}: HomeQuickToolsGridProps) {
  const tools = [
    {
      id: 'flashcards',
      title: 'Formül & Bilgi Kartları',
      description: 'LGS ve YKS için 3D çevrilebilir KaTeX formül kartlarıyla anında pratik yap.',
      icon: BookOpen,
      gradient: 'from-indigo-500 via-purple-500 to-pink-500',
      actionType: 'modal',
      action: onOpenFlashcards,
      buttonLabel: 'Kartları Aç',
      badge: 'Formül',
    },
    {
      id: 'scratchpad',
      title: 'Karalama & İşlem Tahtası',
      description: 'Serbest çizim ve hesaplama yapabileceğin dijital beyaz tahta.',
      icon: PenTool,
      gradient: 'from-amber-400 via-orange-500 to-rose-500',
      actionType: 'modal',
      action: onOpenScratchpad,
      buttonLabel: 'Tahtayı Başlat',
      badge: 'Çizim',
    },
    {
      id: 'pomodoro',
      title: 'Matematik Odak & Pomodoro',
      description: '25/50 dk odaklanma zamanlayıcısı ile soru çözerken dikkatini en üst seviyede tut.',
      icon: Sparkles,
      gradient: 'from-rose-500 via-pink-500 to-amber-500',
      actionType: onOpenPomodoro ? 'modal' : 'link',
      action: onOpenPomodoro,
      href: '#',
      buttonLabel: 'Odak Sayacı',
      badge: 'Odak ⏱️',
    },
    {
      id: 'checklist',
      title: 'MEB Konu Takip Çizelgesi',
      description: '5. sınıftan YKS\'ye tüm matematik kazanımlarını checklist ile adım adım takip et.',
      icon: Target,
      gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
      actionType: onOpenChecklist ? 'modal' : 'link',
      action: onOpenChecklist,
      href: '/programlar',
      buttonLabel: 'Çizelgeyi Aç',
      badge: 'Kazanım 📋',
    },
    {
      id: 'calculators',
      title: 'LGS & YKS Puan/Net Hesaplayıcı',
      description: 'Doğru ve yanlışlarını gir, MEB/ÖSYM formülüyle anında net ve puanını öğren.',
      icon: Target,
      gradient: 'from-cyan-500 via-blue-500 to-indigo-500',
      actionType: onOpenCalculator ? 'modal' : 'link',
      action: onOpenCalculator,
      href: '/programlar',
      buttonLabel: 'Net Hesapla',
      badge: 'Puan 🎯',
    },
    {
      id: 'games',
      title: 'Matematik Oyunları',
      description: 'Hızlı işlem, aritmetik yarışlar ve refleks geliştirici mini oyunlar.',
      icon: Gamepad2,
      gradient: 'from-teal-400 via-emerald-500 to-cyan-500',
      actionType: 'link',
      href: '/oyunlar',
      buttonLabel: 'Oyunları Oyna',
      badge: 'Eğlenceli',
    },
  ];

  return (
    <section className="relative px-4 py-8 sm:py-10">
      <div className="relative mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-100 dark:border-indigo-500/20 px-3 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
              Süper Güçler & Hızlı Araçlar
            </div>
            <h2
              className={`font-display text-2xl font-bold sm:text-3xl ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              Matematikte Seni Zirveye Taşıyacak Araçlar
            </h2>
          </div>
          <p
            className={`max-w-md text-xs sm:text-sm ${
              isLight ? 'text-slate-600' : 'text-slate-400'
            }`}
          >
            Formül ezberinden karalama tahtasına, tercih sihirbazlarından oyunlara kadar ihtiyacın olan her şey elinin altında.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool, idx) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              whileHover={{ y: -4 }}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border p-5 sm:p-6 transition-all duration-300 ${
                isLight
                  ? 'border-slate-200/90 bg-white/95 shadow-bento hover:shadow-bento-hover hover:border-indigo-300'
                  : 'border-white/10 bg-slate-900/80 shadow-xl backdrop-blur-xl hover:border-white/20 hover:shadow-2xl'
              }`}
            >
              {/* Üst Gradyan Şerit */}
              <div
                className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tool.gradient}`}
              />

              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${tool.gradient} text-white shadow-md transition-transform duration-300 group-hover:scale-105`}
                  >
                    <tool.icon className="h-6 w-6" />
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      isLight
                        ? 'bg-slate-100 text-slate-700 border border-slate-200/60'
                        : 'bg-white/10 text-slate-300 border border-white/10'
                    }`}
                  >
                    {tool.badge}
                  </span>
                </div>

                <h3
                  className={`font-display text-base font-bold sm:text-lg mb-2 ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {tool.title}
                </h3>
                <p
                  className={`text-xs leading-relaxed ${
                    isLight ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  {tool.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/10">
                {tool.actionType === 'modal' ? (
                  <button
                    type="button"
                    onClick={tool.action}
                    className={`inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r ${tool.gradient} px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all duration-200 hover:shadow-lg active:scale-[0.98]`}>
                    <span>{tool.buttonLabel}</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <Link
                    href={tool.href || '/'}
                    className={`inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r ${tool.gradient} px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all duration-200 hover:shadow-lg active:scale-[0.98]`}>
                    <span>{tool.buttonLabel}</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
