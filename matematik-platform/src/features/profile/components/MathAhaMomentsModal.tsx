'use client';

import { useState, useEffect, useId } from 'react';
import {
  X,
  Lightbulb,
  Sparkles,
  Plus,
  Trash2,
  Printer,
  Calendar,
} from 'lucide-react';
import { useAccessibleModal } from '@/hooks/useAccessibleModal';
import {
  getAhaMoments,
  saveAhaMoment,
  deleteAhaMoment,
  type AhaMomentItem,
} from '../lib/ahaMomentsStorage';

interface MathAhaMomentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId?: string;
  studentName?: string;
}

const CATEGORIES: Array<AhaMomentItem['category']> = [
  'Cebir',
  'Geometri',
  'Problem Stratejisi',
  'Pratik İşlem',
];

const REACTIONS: Record<
  AhaMomentItem['reaction'],
  { label: string; emoji: string; color: string }
> = {
  mindblown: { label: 'Zihnim Açıldı', emoji: '🤯', color: 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300' },
  lightbulb: { label: 'Ampul Yandı', emoji: '💡', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300' },
  relief: { label: 'Taşlar Oturdu', emoji: '🎯', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' },
  rocket: { label: 'Hız Kazandım', emoji: '🚀', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300' },
};

export function MathAhaMomentsModal({
  isOpen,
  onClose,
  studentId = 'current-student',
  studentName = 'Öğrenci',
}: MathAhaMomentsModalProps) {
  const titleId = useId();
  const modalRef = useAccessibleModal<HTMLDivElement>(isOpen, onClose);

  const [moments, setMoments] = useState<AhaMomentItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form State
  const [category, setCategory] = useState<AhaMomentItem['category']>('Cebir');
  const [topic, setTopic] = useState('');
  const [momentText, setMomentText] = useState('');
  const [reaction, setReaction] = useState<AhaMomentItem['reaction']>('lightbulb');

  useEffect(() => {
    if (isOpen) {
      setMoments(getAhaMoments());
      setIsAddingNew(false);
    }
  }, [isOpen]);

  const handleAddMoment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!momentText.trim() || !topic.trim()) return;

    const d = new Date();
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const newMoment: AhaMomentItem = {
      id: `aha-${Date.now()}`,
      studentId,
      category,
      topic: topic.trim(),
      momentText: momentText.trim(),
      reaction,
      date: dateStr,
      createdAt: new Date().toISOString(),
    };

    const ok = saveAhaMoment(newMoment);
    if (ok) {
      setMoments(getAhaMoments());
      setMomentText('');
      setTopic('');
      setIsAddingNew(false);
    }
  };

  const handleDelete = (id: string) => {
    deleteAhaMoment(id);
    setMoments(getAhaMoments());
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  const filteredMoments =
    selectedCategory === 'all'
      ? moments
      : moments.filter((m) => m.category === selectedCategory);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden focus:outline-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h2 id={titleId} className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                &ldquo;Aha!&rdquo; Anları & Matematik Keşif Günlüğü
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 font-medium">
                  Metakognitif Günce
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Öğrenirken zihninde ampulün yandığı, taşların yerine oturduğu anları tek cümleyle ölümsüzleştir.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Günlüğü Yazdır / PDF İndir"
              aria-label="Yazdır"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action & Filter Bar */}
        <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Tüm Keşifler ({moments.length})
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  selectedCategory === cat
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsAddingNew(!isAddingNew)}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-sm"
          >
            {isAddingNew ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {isAddingNew ? 'Formu Kapat' : 'Yeni Keşif Ekle'}
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isAddingNew && (
            <form
              onSubmit={handleAddMoment}
              className="p-5 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 space-y-4 animate-fade-in"
            >
              <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Bugün Matematikte Neyi Fark Ettin?
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="aha-category-select" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kategori
                  </label>
                  <select
                    id="aha-category-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as AhaMomentItem['category'])}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="aha-topic-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Konu Başlığı
                  </label>
                  <input
                    id="aha-topic-input"
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Örn. EBOB-EKOK, Üçgende Benzerlik..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="aha-moment-text" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Aydınlanma Cümlen (&ldquo;Aha!&rdquo; Anı)
                </label>
                <textarea
                  id="aha-moment-text"
                  rows={2}
                  value={momentText}
                  onChange={(e) => setMomentText(e.target.value)}
                  placeholder="&ldquo;Meğer iki kare farkı bir kareden diğerini kesip yanına yapıştırmakmış!&rdquo;"
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <div className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  O Anki His / Reaksiyon
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(Object.keys(REACTIONS) as Array<AhaMomentItem['reaction']>).map((rk) => {
                    const r = REACTIONS[rk];
                    return (
                      <button
                        key={rk}
                        type="button"
                        onClick={() => setReaction(rk)}
                        className={`p-2 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                          reaction === rk
                            ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-bold'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <span className="text-base">{r.emoji}</span>
                        <span>{r.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  Keşfi Kaydet
                </button>
              </div>
            </form>
          )}

          {filteredMoments.length === 0 ? (
            <div className="text-center py-12">
              <Lightbulb className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Bu kategoride henüz bir keşif kaydetmedin.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Bir soru çözerken aklına gelen pratik bir fikri veya çözümü hemen not al.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredMoments.map((m) => {
                const reactionInfo = REACTIONS[m.reaction] || REACTIONS.lightbulb;
                return (
                  <div
                    key={m.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 hover:border-amber-300 dark:hover:border-amber-900/50 transition-all flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                          {m.category}
                        </span>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {m.topic}
                        </span>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${reactionInfo.color}`}>
                          <span>{reactionInfo.emoji}</span>
                          {reactionInfo.label}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium italic leading-relaxed">
                        &ldquo;{m.momentText}&rdquo;
                      </p>

                      <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                        <Calendar className="w-3 h-3" />
                        <span>{m.date}</span>
                        <span>• {studentName}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(m.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                      title="Keşfi Sil"
                      aria-label="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
