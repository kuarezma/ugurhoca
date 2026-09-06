'use client';

import React, { useState, useMemo, useEffect, useId } from 'react';
import {
  X,
  Search,
  BookOpen,
  AlertTriangle,
  HelpCircle,
  Calculator,
  Plus,
  Bookmark,
  Trash2,
  Edit3,
  Check,
  Star,
} from 'lucide-react';
import MathText from '@/components/MathText';
import { useAccessibleModal } from '@/hooks/useAccessibleModal';
import { MATH_GLOSSARY_CONCEPTS, type MathGlossaryConcept } from '../data/mathGlossaryData';

interface MathGlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLight?: boolean;
  initialSearch?: string;
}

export interface CustomGlossaryConcept extends MathGlossaryConcept {
  isCustom?: boolean;
  userNote?: string;
  createdAt?: string;
}

const CATEGORIES = ['Tümü', 'Sayılar', 'Cebir', 'Geometri', 'Olasılık', 'İleri Matematik', 'Kişisel Sözlüğüm'] as const;
type CategoryFilter = typeof CATEGORIES[number];

const LEVELS = ['Tümü', 'LGS', 'YKS'] as const;
type LevelFilter = typeof LEVELS[number];

const STORAGE_CUSTOM_TERMS_KEY = 'ugurhoca_custom_glossary_terms_v1';
const STORAGE_USER_NOTES_KEY = 'ugurhoca_glossary_user_notes_v1';

export const MathGlossaryModal: React.FC<MathGlossaryModalProps> = ({
  isOpen,
  onClose,
  isLight = false,
  initialSearch = '',
}) => {
  const titleId = useId();
  const modalRef = useAccessibleModal<HTMLDivElement>(isOpen, onClose);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('Tümü');
  const [selectedLevel, setSelectedLevel] = useState<LevelFilter>('Tümü');

  // Kişisel terimler ve notlar state'i
  const [customTerms, setCustomTerms] = useState<CustomGlossaryConcept[]>([]);
  const [userNotes, setUserNotes] = useState<Record<string, string>>({});

  // Yeni terim ekleme formu durumu
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newTerm, setNewTerm] = useState('');
  const [newCategory, setNewCategory] = useState<'Sayılar' | 'Cebir' | 'Geometri' | 'Olasılık' | 'İleri Matematik'>('Cebir');
  const [newLevel, setNewLevel] = useState<'LGS' | 'YKS' | 'Genel'>('LGS');
  const [newDefinition, setNewDefinition] = useState('');
  const [newExample, setNewExample] = useState('');
  const [newTrapAlert, setNewTrapAlert] = useState('');

  // Not düzenleme durumu
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');

  // LocalStorage'dan yükle
  useEffect(() => {
    try {
      const savedTerms = localStorage.getItem(STORAGE_CUSTOM_TERMS_KEY);
      if (savedTerms) {
        setCustomTerms(JSON.parse(savedTerms));
      }
      const savedNotes = localStorage.getItem(STORAGE_USER_NOTES_KEY);
      if (savedNotes) {
        setUserNotes(JSON.parse(savedNotes));
      }
    } catch {
      // sessizce geç
    }
  }, []);

  useEffect(() => {
    if (initialSearch) {
      setSearchQuery(initialSearch);
    }
  }, [initialSearch]);

  const saveCustomTerms = (terms: CustomGlossaryConcept[]) => {
    setCustomTerms(terms);
    try {
      localStorage.setItem(STORAGE_CUSTOM_TERMS_KEY, JSON.stringify(terms));
    } catch {
      // sessizce geç
    }
  };

  const saveUserNotes = (notes: Record<string, string>) => {
    setUserNotes(notes);
    try {
      localStorage.setItem(STORAGE_USER_NOTES_KEY, JSON.stringify(notes));
    } catch {
      // sessizce geç
    }
  };

  const handleCreateTerm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTerm.trim() || !newDefinition.trim()) return;

    const newConcept: CustomGlossaryConcept = {
      id: `custom-${Date.now()}`,
      term: newTerm.trim(),
      category: newCategory,
      level: newLevel,
      definition: newDefinition.trim(),
      example: newExample.trim() || 'Örnek eklenmedi.',
      trapAlert: newTrapAlert.trim() || 'Kişisel notlarına dikkat et!',
      isCustom: true,
      createdAt: new Date().toISOString(),
    };

    const updated = [newConcept, ...customTerms];
    saveCustomTerms(updated);

    // Formu sıfırla
    setNewTerm('');
    setNewDefinition('');
    setNewExample('');
    setNewTrapAlert('');
    setIsAddingNew(false);
    setSelectedCategory('Kişisel Sözlüğüm');
  };

  const handleDeleteCustomTerm = (id: string) => {
    const updated = customTerms.filter((t) => t.id !== id);
    saveCustomTerms(updated);
  };

  const handleSaveNote = (conceptId: string) => {
    const updated = { ...userNotes, [conceptId]: noteDraft.trim() };
    if (!noteDraft.trim()) {
      delete updated[conceptId];
    }
    saveUserNotes(updated);
    setEditingNoteId(null);
    setNoteDraft('');
  };

  const allConcepts = useMemo(() => {
    return [...customTerms, ...MATH_GLOSSARY_CONCEPTS];
  }, [customTerms]);

  const filteredConcepts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return allConcepts.filter((item) => {
      // Kişisel Sözlüğüm Filtresi
      if (selectedCategory === 'Kişisel Sözlüğüm') {
        const hasNote = Boolean(userNotes[item.id]);
        if (!item.isCustom && !hasNote) return false;
      } else if (selectedCategory !== 'Tümü' && item.category !== selectedCategory) {
        return false;
      }

      // Level filter
      if (selectedLevel !== 'Tümü' && item.level !== selectedLevel && item.level !== 'Genel') {
        return false;
      }

      // Search query filter
      if (query) {
        const inTerm = item.term.toLowerCase().includes(query);
        const inDef = item.definition.toLowerCase().includes(query);
        const inTopic = item.relatedTopic ? item.relatedTopic.toLowerCase().includes(query) : false;
        const inTrap = item.trapAlert.toLowerCase().includes(query);
        const inNote = userNotes[item.id] ? userNotes[item.id].toLowerCase().includes(query) : false;
        return inTerm || inDef || inTopic || inTrap || inNote;
      }

      return true;
    });
  }, [allConcepts, searchQuery, selectedCategory, selectedLevel, userNotes]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-in fade-in duration-200">
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`relative z-10 w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          isLight
            ? 'bg-white border-slate-200 text-slate-800'
            : 'bg-slate-900 border-white/10 text-white'
        }`}
      >
        {/* Header */}
        <div
          className={`border-b p-4 sm:p-6 flex flex-col gap-3.5 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-white/10'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 id={titleId} className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Matematik Kavramlar & Terimler Rehberi
                </h2>
                <p
                  className={`text-xs ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  LGS & YKS kritik kavramlar, sık yapılan tuzaklar ve kişisel sözlüğün
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAddingNew((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm ${
                  isAddingNew
                    ? 'bg-amber-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isAddingNew ? 'Formu Kapat' : 'Kendi Terimini Ekle'}</span>
                <span className="sm:hidden">{isAddingNew ? 'Kapat' : 'Ekle'}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                aria-label="Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Yeni Terim Ekleme Paneli */}
          {isAddingNew && (
            <form
              onSubmit={handleCreateTerm}
              className={`rounded-2xl p-4 border space-y-3 animate-in slide-in-from-top-2 duration-200 ${
                isLight ? 'bg-indigo-50/50 border-indigo-200' : 'bg-indigo-950/30 border-indigo-500/30'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                <Star className="w-4 h-4 fill-current" />
                <span>Kişisel Matematik Sözlüğüne Yeni Terim Ekle</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label htmlFor="custom-term-name" className="block text-[11px] font-semibold mb-1 text-slate-600 dark:text-slate-300">
                    Kavram Adı *
                  </label>
                  <input
                    id="custom-term-name"
                    type="text"
                    required
                    placeholder="Örn: Katsayı, Özdeşlik, Eğim..."
                    value={newTerm}
                    onChange={(e) => setNewTerm(e.target.value)}
                    className="w-full text-xs rounded-xl px-3 py-2 border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="custom-term-category" className="block text-[11px] font-semibold mb-1 text-slate-600 dark:text-slate-300">
                    Kategori
                  </label>
                  <select
                    id="custom-term-category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as 'Sayılar' | 'Cebir' | 'Geometri' | 'Olasılık' | 'İleri Matematik')}
                    className="w-full text-xs rounded-xl px-3 py-2 border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Sayılar">Sayılar</option>
                    <option value="Cebir">Cebir</option>
                    <option value="Geometri">Geometri</option>
                    <option value="Olasılık">Olasılık</option>
                    <option value="İleri Matematik">İleri Matematik</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="custom-term-level" className="block text-[11px] font-semibold mb-1 text-slate-600 dark:text-slate-300">
                    Hedef Düzey
                  </label>
                  <select
                    id="custom-term-level"
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value as 'LGS' | 'YKS' | 'Genel')}
                    className="w-full text-xs rounded-xl px-3 py-2 border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="LGS">LGS (8. Sınıf)</option>
                    <option value="YKS">YKS (TYT/AYT)</option>
                    <option value="Genel">Genel Matematik</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label htmlFor="custom-term-def" className="block text-[11px] font-semibold mb-1 text-slate-600 dark:text-slate-300">
                    Kendi Cümlelerinle Tanımı *
                  </label>
                  <textarea
                    id="custom-term-def"
                    required
                    rows={2}
                    placeholder="Bu kavram ne anlama geliyor?"
                    value={newDefinition}
                    onChange={(e) => setNewDefinition(e.target.value)}
                    className="w-full text-xs rounded-xl px-3 py-1.5 border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="custom-term-example" className="block text-[11px] font-semibold mb-1 text-slate-600 dark:text-slate-300">
                    Kendi Örneğin ve Dikkat Edilecek Tuzak
                  </label>
                  <textarea
                    id="custom-term-example"
                    rows={2}
                    placeholder="Örnek işlem veya aklında tutacağın ipucu..."
                    value={newExample}
                    onChange={(e) => setNewExample(e.target.value)}
                    className="w-full text-xs rounded-xl px-3 py-1.5 border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 shadow"
                >
                  Sözlüğüme Kaydet
                </button>
              </div>
            </form>
          )}

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Kavram, terim, açıklama veya kendi notlarında ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-8 py-2 rounded-xl text-xs sm:text-sm border focus:outline-none transition ${
                isLight
                  ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500'
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
              const isSpecial = cat === 'Kişisel Sözlüğüm';
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition inline-flex items-center gap-1 ${
                    active
                      ? isSpecial
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-indigo-600 text-white shadow-sm'
                      : isLight
                        ? isSpecial
                          ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        : isSpecial
                          ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20'
                          : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {isSpecial && <Star className="w-3 h-3 fill-current text-amber-400" />}
                  <span>{cat}</span>
                  {isSpecial && (customTerms.length > 0 || Object.keys(userNotes).length > 0) && (
                    <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[9px] bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold">
                      {customTerms.length + Object.keys(userNotes).length}
                    </span>
                  )}
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
              <HelpCircle className="w-10 h-10 mx-auto text-slate-400 mb-2 opacity-60" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                Aradığınız kriterlere uygun kavram bulunamadı.
              </p>
              <p
                className={`text-xs mt-1 ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Arama terimini değiştirebilir veya sağ üstteki "Kendi Terimini Ekle" butonuna basarak ekleyebilirsiniz.
              </p>
            </div>
          ) : (
            filteredConcepts.map((item) => {
              const userNote = userNotes[item.id];
              const isEditingThisNote = editingNoteId === item.id;

              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border p-4 sm:p-5 transition-all ${
                    item.isCustom
                      ? isLight
                        ? 'bg-amber-50/40 border-amber-200 hover:border-amber-300'
                        : 'bg-amber-950/20 border-amber-500/30 hover:border-amber-500/50'
                      : isLight
                        ? 'bg-slate-50/70 border-slate-200 hover:border-indigo-300'
                        : 'bg-white/5 border-white/10 hover:border-indigo-500/40'
                  }`}
                >
                  {/* Concept Header */}
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-bold text-indigo-600 dark:text-indigo-400">
                          {item.term}
                        </h3>
                        {item.isCustom && (
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                            ⭐ Kişisel Terimim
                          </span>
                        )}
                      </div>
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
                      {item.isCustom && (
                        <button
                          type="button"
                          onClick={() => handleDeleteCustomTerm(item.id)}
                          title="Bu terimi sözlüğümden sil"
                          className="p-1 text-slate-400 hover:text-rose-500 transition-colors ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
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
                    className={`rounded-xl p-2.5 sm:p-3 text-xs flex items-start gap-2.5 border mb-3 ${
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

                  {/* Kişisel Öğrenci Notu Alanı */}
                  <div className="pt-2 border-t border-slate-200/60 dark:border-white/10">
                    {isEditingThisNote ? (
                      <div className="space-y-2">
                        <label htmlFor={`note-${item.id}`} className="block text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                          📝 Bu terim için kendi hatırlatma notun:
                        </label>
                        <textarea
                          id={`note-${item.id}`}
                          rows={2}
                          value={noteDraft}
                          onChange={(e) => setNoteDraft(e.target.value)}
                          placeholder="Bu kavramı aklında tutmak için kendi yöntemin, formül kodlaman veya uyarın..."
                          className="w-full text-xs rounded-xl p-2.5 border border-indigo-300 dark:border-indigo-500/40 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingNoteId(null);
                              setNoteDraft('');
                            }}
                            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
                          >
                            İptal
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveNote(item.id)}
                            className="inline-flex items-center gap-1 px-3 py-1 text-[11px] font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 shadow"
                          >
                            <Check className="w-3 h-3" />
                            <span>Kaydet</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          {userNote ? (
                            <div className="flex items-start gap-2 text-xs bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-2.5 text-indigo-900 dark:text-indigo-200">
                              <Bookmark className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold text-[11px] block text-indigo-700 dark:text-indigo-300">
                                  Kişisel Notun:
                                </span>
                                <span>{userNote}</span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              Henüz kişisel bir not eklenmedi.
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setEditingNoteId(item.id);
                            setNoteDraft(userNote || '');
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition shrink-0"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>{userNote ? 'Notu Düzenle' : 'Kendi Notunu Ekle'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
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
