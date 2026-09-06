'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { SafeLink } from '@/components/SafeLink';
import {
  BookOpen,
  PenTool,
  Target,
  Gamepad2,
  ChevronRight,
  Sparkles,
  Activity,
  Compass,
  BookMarked,
  TrendingUp,
  Calendar,
  Zap,
} from 'lucide-react';

type ToolCategory = 'all' | 'exam' | 'formulas' | 'plan' | 'practice';

type HomeQuickToolsGridProps = {
  isLight: boolean;
  excludeGames?: boolean;
  hideHeader?: boolean;
  onOpenFlashcards: () => void;
  onOpenScratchpad: () => void;
  onOpenCalculator?: () => void;
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

export function HomeQuickToolsGrid({
  isLight,
  excludeGames = false,
  hideHeader = false,
  onOpenFlashcards,
  onOpenScratchpad,
  onOpenCalculator,
  onOpenPomodoro,
  onOpenChecklist,
  onOpenGraph,
  onOpenProofs,
  onOpenCheatSheet,
  onOpenGlossary,
  onOpenTopicWeights,
  onOpenWeeklyPlanner,
  onOpenSpeedDrill,
}: HomeQuickToolsGridProps) {
  const [selectedFilter, setSelectedFilter] = useState<ToolCategory>('all');
  const tools = [
    {
      id: 'cheatSheet',
      title: 'Hızlı Formül Cep Notu (LGS & YKS)',
      description:
        'Sınav öncesi 1 dakikalık son tekrar, tüm kritik MEB & ÖSYM formülleri ve yazdırılabilir A4 özeti.',
      icon: BookMarked,
      gradient: 'from-amber-500 via-orange-500 to-red-500',
      actionType: onOpenCheatSheet ? 'modal' : 'link',
      action: onOpenCheatSheet,
      href: '#',
      buttonLabel: 'Notu Aç',
      badge: 'Cep Notu 📌',
    },
    {
      id: 'visualProofs',
      title: 'İnteraktif Görsel Formül İspatları',
      description:
        'Pisagor, iki kare farkı, sin²θ+cos²θ=1 ve Pascal üçgenini gözlerinle keşfet.',
      icon: Compass,
      gradient: 'from-fuchsia-600 via-purple-600 to-indigo-600',
      actionType: onOpenProofs ? 'modal' : 'link',
      action: onOpenProofs,
      href: '#',
      buttonLabel: 'İspatı İncele',
      badge: 'İspat 🔬',
    },
    {
      id: 'graphVisualizer',
      title: 'Fonksiyon & Grafik Laboratuvarı',
      description:
        'Doğrusal fonksiyon, parabol ve birim çemberi anlık canlı grafik ve slider ile keşfet.',
      icon: Activity,
      gradient: 'from-blue-600 via-indigo-600 to-purple-600',
      actionType: onOpenGraph ? 'modal' : 'link',
      action: onOpenGraph,
      href: '#',
      buttonLabel: 'Grafiği İncele',
      badge: 'Grafik 📈',
    },
    {
      id: 'flashcards',
      title: 'Formül & Bilgi Kartları',
      description:
        'LGS ve YKS için 3D çevrilebilir KaTeX formül kartlarıyla anında pratik yap.',
      icon: BookOpen,
      gradient: 'from-indigo-500 via-purple-500 to-pink-500',
      actionType: 'modal',
      action: onOpenFlashcards,
      buttonLabel: 'Kartları Aç',
      badge: 'Formül',
    },
    {
      id: 'speedDrill',
      title: '60 Saniye Formül Eşleştirme',
      description:
        'Zamana karşı kural ve KaTeX formüllerini aktif hatırlamayla eşleştir, serilik kazan.',
      icon: Zap,
      gradient: 'from-amber-400 via-yellow-500 to-orange-500',
      actionType: onOpenSpeedDrill ? 'modal' : 'link',
      action: onOpenSpeedDrill,
      href: '#',
      buttonLabel: 'Hız Antrenmanı',
      badge: '60s Hız ⚡',
    },
    {
      id: 'scratchpad',
      title: 'Karalama & İşlem Tahtası',
      description:
        'Serbest çizim ve hesaplama yapabileceğin dijital beyaz tahta.',
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
      description:
        '25/50 dk odaklanma zamanlayıcısı ile soru çözerken dikkatini en üst seviyede tut.',
      icon: Sparkles,
      gradient: 'from-rose-500 via-pink-500 to-amber-500',
      actionType: onOpenPomodoro ? 'modal' : 'link',
      action: onOpenPomodoro,
      href: '#',
      buttonLabel: 'Odak Sayacı',
      badge: 'Odak ⏱️',
    },
    {
      id: 'glossary',
      title: 'Matematik Kavram Sözlüğü',
      description:
        'Asal sayılardan türeve tüm LGS & YKS terimleri, KaTeX formülleri ve kritik tuzak uyarıları.',
      icon: BookOpen,
      gradient: 'from-blue-500 via-indigo-600 to-violet-600',
      actionType: onOpenGlossary ? 'modal' : 'link',
      action: onOpenGlossary,
      href: '#',
      buttonLabel: 'Sözlüğü Aç',
      badge: 'Sözlük 📖',
    },
    {
      id: 'topicWeights',
      title: 'LGS & YKS Çıkmış Soru Dağılım Matrisi',
      description:
        'Son 5 yılın MEB & ÖSYM soru adetleri, konu ağırlıkları ve yüksek getirili kritik kazanımlar.',
      icon: TrendingUp,
      gradient: 'from-amber-500 via-rose-500 to-indigo-600',
      actionType: onOpenTopicWeights ? 'modal' : 'link',
      action: onOpenTopicWeights,
      href: '#',
      buttonLabel: 'Matrisi İncele',
      badge: 'Soru Matrisi 📊',
    },
    {
      id: 'weeklyPlanner',
      title: 'A4 Masabaşı Haftalık Çalışma Çizelgesi',
      description:
        'Kişiselleştirilebilir gün gün soru hedefi, Pomodoro blokları ve mürekkep tasarruflu A4 çıktısı.',
      icon: Calendar,
      gradient: 'from-emerald-500 via-teal-600 to-sky-600',
      actionType: onOpenWeeklyPlanner ? 'modal' : 'link',
      action: onOpenWeeklyPlanner,
      href: '#',
      buttonLabel: 'Çizelgeyi Aç',
      badge: 'Haftalık Plan 🗓️',
    },
    {
      id: 'checklist',
      title: 'MEB Konu Takip Çizelgesi',
      description:
        "5. sınıftan YKS'ye tüm matematik kazanımlarını checklist ile adım adım takip et.",
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
      description:
        'Doğru ve yanlışlarını gir, MEB/ÖSYM formülüyle anında net ve puanını öğren.',
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
      description:
        'Hızlı işlem, aritmetik yarışlar ve refleks geliştirici mini oyunlar.',
      icon: Gamepad2,
      gradient: 'from-teal-400 via-emerald-500 to-cyan-500',
      actionType: 'link',
      href: '/oyunlar',
      buttonLabel: 'Oyunları Oyna',
      badge: 'Eğlenceli',
    },
  ];

  const baseTools = excludeGames
    ? tools.filter((t) => t.id !== 'games')
    : tools;

  const visibleTools =
    selectedFilter === 'all'
      ? baseTools
      : baseTools.filter((t) => {
          if (selectedFilter === 'exam') {
            return t.id === 'calculators' || t.id === 'topicWeights';
          }
          if (selectedFilter === 'formulas') {
            return (
              t.id === 'cheatSheet' ||
              t.id === 'visualProofs' ||
              t.id === 'flashcards' ||
              t.id === 'glossary'
            );
          }
          if (selectedFilter === 'plan') {
            return (
              t.id === 'pomodoro' ||
              t.id === 'weeklyPlanner' ||
              t.id === 'checklist'
            );
          }
          if (selectedFilter === 'practice') {
            return (
              t.id === 'scratchpad' ||
              t.id === 'graphVisualizer' ||
              t.id === 'speedDrill' ||
              t.id === 'games'
            );
          }
          return true;
        });

  return (
    <section className="relative px-3.5 py-6 sm:px-4 sm:py-10">
      <div className="relative mx-auto max-w-6xl">
        {!hideHeader && (
          <div className="mb-5 sm:mb-6 flex flex-wrap items-center justify-between gap-3">
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
              Formül ezberinden karalama tahtasına, tercih sihirbazlarından
              oyunlara kadar ihtiyacın olan her şey elinin altında.
            </p>
          </div>
        )}

        {/* Mobil & Masaüstü Hızlı Kategori Filtre Çipleri */}
        <div className="mb-4 sm:mb-6 flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
          {[
            { id: 'all', label: `Tümü (${baseTools.length})` },
            { id: 'exam', label: '🎯 Sınav & Net' },
            { id: 'formulas', label: '📖 Formül & İspat' },
            { id: 'plan', label: '⏱️ Plan & Odak' },
            { id: 'practice', label: '✏️ Tahta & Pratik' },
          ].map((chip) => {
            const isSelected = selectedFilter === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => setSelectedFilter(chip.id as ToolCategory)}
                className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm scale-105'
                    : isLight
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/80'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {visibleTools.map((tool, idx) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              whileHover={{ y: -4 }}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl border p-4 sm:p-6 transition-all duration-300 ${
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
                <div className="mb-3 sm:mb-4 flex items-center justify-between">
                  <div
                    className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br ${tool.gradient} text-white shadow-md transition-transform duration-300 group-hover:scale-105`}
                  >
                    <tool.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold ${
                      isLight
                        ? 'bg-slate-100 text-slate-700'
                        : 'bg-white/10 text-slate-300'
                    }`}
                  >
                    {tool.badge}
                  </span>
                </div>

                <h3
                  className={`font-display text-sm sm:text-base font-bold mb-1.5 ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {tool.title}
                </h3>
                <p
                  className={`text-xs leading-relaxed line-clamp-2 sm:line-clamp-none ${
                    isLight ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  {tool.description}
                </p>
              </div>

              <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-100 dark:border-white/10">
                {tool.actionType === 'modal' ? (
                  <button
                    type="button"
                    onClick={tool.action}
                    className={`inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r ${tool.gradient} px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all duration-200 hover:shadow-lg active:scale-[0.98]`}
                  >
                    <span>{tool.buttonLabel}</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <SafeLink
                    href={tool.href || '/'}
                    className={`inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r ${tool.gradient} px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all duration-200 hover:shadow-lg active:scale-[0.98]`}
                  >
                    <span>{tool.buttonLabel}</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </SafeLink>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
