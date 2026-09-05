'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Search,
  BookOpen,
  AlertTriangle,
  HelpCircle,
  Calculator,
} from 'lucide-react';
import MathText from '@/components/MathText';
import { MATH_GLOSSARY_CONCEPTS } from '../data/mathGlossaryData';

interface MathGlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLight?: boolean;
  initialSearch?: string;
}

const CATEGORIES = ['Tümü', 'Sayılar', 'Cebir', 'Geometri', 'Olasılık', 'İleri Matematik'] as const;
type CategoryFilter = typeof CATEGORIES[number];

const LEVELS = ['Tümü', 'LGS', 'YKS'] as const;
type LevelFilter = typeof LEVELS[number];

export const MathGlossaryModal: React.FC<MathGlossaryModalProps> = ({
  isOpen,
  onClose,
  isLight = false,
  initialSearch = '',
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('Tümü');
  const [selectedLevel, setSelectedLevel] = useState<LevelFilter>('Tümü');

  useEffect(() => {
    if (initialSearch) {
      setSearchQuery(initialSearch);
    }
  }, [initialSearch]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredConcepts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return MATH_GLOSSARY_CONCEPTS.filter((item) => {
      // Category filter
      if (selectedCategory !== 'Tümü' && item.category !== selectedCategory) {
        return false;
      }
      // Level filter
      if (selectedLevel !== 'Tümü' && item.level !== 'Genel' && item.level !== selectedLevel) {
        return false;
      }
      // Search query
      if (query) {
        const matchesTerm = item.term.toLowerCase().includes(query);
        const matchesDef = item.definition.toLowerCase().includes(query);
        const matchesTopic = item.relatedTopic?.toLowerCase().includes(query);
        const matchesTrap = item.trapAlert.toLowerCase().includes(query);
        return matchesTerm || matchesDef || matchesTopic || matchesTrap;
      }
      return true;
    });
  }, [searchQuery, selectedCategory, selectedLevel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-5">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="math-glossary-title"
        className={`relative z-10 w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900'
            : 'bg-slate-900 border-white/10 text-white'
        }`}
      >
        {/* Header */}
        <div
          className={`border-b px-5 sm:px-6 py-4 flex flex-col gap-3 ${
            isLight
              ? 'bg-gradient-to-r from-indigo-50/80 via-purple-50/80 to-white border-slate-200'
              : 'bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900 border-white/10'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400">
                <BookOpen className="h-5 w-5 text-indigo-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-indigo-500 text-white">
                    SÖZLÜK
                  </span>
                  <h2 id="math-glossary-title" className="text-lg font-bold tracking-tight">
                    Matematik Kavramlar & Terimler Rehberi
                  </h2>
                </div>
                <p
                  className={`text-xs mt-0.5 ${
                    isLight ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  LGS ve YKS için sade tanımlar, KaTeX formülleri ve tuzak uyarıları.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Kapat"
              className="rounded-xl p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search
              className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${
                isLight ? 'text-slate-400' : 'text-slate-500'
              }`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Kavram veya terim ara (örn: Asal sayı, Eğim, Pisagor, Parabol)..."
              className={`w-full pl-10 pr-9 py-2.5 rounded-2xl text-xs sm:text-sm border transition focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${
                isLight
                  ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
                  : 'bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:bg-white/10'
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label="Aramayı temizle"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span
              className={`text-[11px] font-semibold mr-1 ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              Kategori:
            </span>
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition ${
                    active
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : isLight
                        ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              );
            })}

            <div className="h-4 w-px bg-slate-300 dark:bg-white/10 mx-1 hidden sm:block" />

            <span
              className={`text-[11px] font-semibold mr-1 hidden sm:inline ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              Seviye:
            </span>
            {LEVELS.map((lvl) => {
              const active = selectedLevel === lvl;
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition ${
                    active
                      ? 'bg-purple-600 text-white shadow-sm'
                      : isLight
                        ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content list */}
        <div className="overflow-y-auto p-4 sm:p-6 flex-1 space-y-4">
          {filteredConcepts.length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle className="w-10 h-10 mx-auto text-slate-400 mb-3 opacity-60" />
              <p className="font-semibold text-sm">Aradığınız kriterlere uygun kavram bulunamadı.</p>
              <p
                className={`text-xs mt-1 ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Arama terimini değiştirerek veya filtreleri temizleyerek tekrar deneyebilirsiniz.
              </p>
            </div>
          ) : (
            filteredConcepts.map((item) => (
              <div
                key={item.id}
                className={`rounded-2xl border p-4 sm:p-5 transition-all ${
                  isLight
                    ? 'bg-slate-50/70 border-slate-200 hover:border-indigo-300'
                    : 'bg-white/5 border-white/10 hover:border-indigo-500/40'
                }`}
              >
                {/* Concept Header */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-indigo-600 dark:text-indigo-400">
                      {item.term}
                    </h3>
                    {item.relatedTopic && (
                      <span
                        className={`text-[11px] font-medium ${
                          isLight ? 'text-slate-500' : 'text-slate-400'
                        }`}
                      >
                        Konu: {item.relatedTopic}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                        isLight
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-indigo-500/20 text-indigo-300'
                      }`}
                    >
                      {item.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                        item.level === 'LGS'
                          ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                          : item.level === 'YKS'
                            ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                            : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                      }`}
                    >
                      {item.level}
                    </span>
                  </div>
                </div>

                {/* Definition */}
                <p
                  className={`text-xs sm:text-sm font-medium leading-relaxed mb-3 ${
                    isLight ? 'text-slate-700' : 'text-slate-200'
                  }`}
                >
                  {item.definition}
                </p>

                {/* Formula Box (if available) */}
                {item.formula && (
                  <div
                    className={`rounded-xl p-3 mb-3 border text-xs sm:text-sm overflow-x-auto ${
                      isLight
                        ? 'bg-indigo-50/50 border-indigo-100 text-indigo-950'
                        : 'bg-indigo-950/30 border-indigo-500/20 text-indigo-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1 text-[11px] font-bold uppercase tracking-wider text-indigo-500">
                      <Calculator className="w-3.5 h-3.5" />
                      <span>Matematiksel Model / Formül</span>
                    </div>
                    <MathText as="div" className="font-mono text-center py-1">
                      {`$$${item.formula}$$`}
                    </MathText>
                  </div>
                )}

                {/* Example Box */}
                <div
                  className={`rounded-xl p-2.5 sm:p-3 mb-3 text-xs leading-relaxed ${
                    isLight ? 'bg-white border border-slate-200 text-slate-600' : 'bg-white/5 text-slate-300'
                  }`}
                >
                  <strong className="text-slate-900 dark:text-white font-semibold">Örnek: </strong>
                  {item.example}
                </div>

                {/* Trap Alert (Misconception) */}
                <div
                  className={`rounded-xl p-2.5 sm:p-3 text-xs flex items-start gap-2.5 border ${
                    isLight
                      ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">⚠️ Sık Yapılan Hata & Tuzak: </span>
                    <span>{item.trapAlert}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div
          className={`border-t px-6 py-3.5 flex items-center justify-between text-xs ${
            isLight
              ? 'bg-slate-50 border-slate-200 text-slate-500'
              : 'bg-slate-950/80 border-white/10 text-slate-400'
          }`}
        >
          <span>Toplam {filteredConcepts.length} kavram listeleniyor</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors"
          >
            Tamam
          </button>
        </div>
      </div>
    </div>
  );
};
