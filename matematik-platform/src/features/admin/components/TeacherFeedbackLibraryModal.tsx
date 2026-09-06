'use client';

import { useState, useEffect, useId, useCallback } from 'react';
import {
  X,
  Sparkles,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  BookOpen,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  Award,
} from 'lucide-react';
import { useAccessibleModal } from '@/hooks/useAccessibleModal';
import { useToast } from '@/components/Toast';

export type FeedbackCategory =
  | 'all'
  | 'concept'
  | 'calculation'
  | 'step'
  | 'motivation'
  | 'custom';

export type FeedbackTemplateItem = {
  id: string;
  label: string;
  category: 'concept' | 'calculation' | 'step' | 'motivation' | 'custom';
  grade?: number;
  text: string;
  stepPrefix?: string;
  isCustom?: boolean;
};

export const DEFAULT_FEEDBACK_TEMPLATES: FeedbackTemplateItem[] = [
  {
    id: 'tmpl-1',
    label: '🌟 Kusursuz',
    category: 'motivation',
    grade: 100,
    text: 'Tebrikler! İşlem basamakların eksiksiz ve çok temiz.',
  },
  {
    id: 'tmpl-2',
    label: '⚠️ İşlem Hatası',
    category: 'calculation',
    grade: 80,
    text: 'Gidiş yolu doğru ancak adımlarda işlem/işaret hatası var, tekrar kontrol et.',
  },
  {
    id: 'tmpl-3',
    label: '💡 Kuralı İncele',
    category: 'concept',
    grade: 65,
    text: 'Konu kuralını tekrar gözden geçirip soruyu bir kez daha denemeni öneririm.',
  },
  {
    id: 'tmpl-4',
    label: '⏳ Süre & Hız',
    category: 'motivation',
    grade: 90,
    text: 'Eline sağlık! Bir sonraki ödevde süreyi biraz daha optimize edebilirsin.',
  },
  {
    id: 'tmpl-5',
    label: '🎯 İşaret Değişimi',
    category: 'concept',
    grade: 75,
    text: 'Parantez önündeki eksi işaretini dağıtırken işaret değişimine dikkat etmelisin.',
  },
  {
    id: 'tmpl-6',
    label: '🎯 Payda Eşitleme',
    category: 'concept',
    grade: 70,
    text: 'Rasyonel ifadelerde toplama/çıkarma yapmadan önce ortak payda bulmayı unutma.',
  },
  {
    id: 'tmpl-7',
    label: '🎯 Köklü Toplama',
    category: 'concept',
    grade: 70,
    text: 'Kareköklü ifadelerde toplama yaparken kök içi eşit olmadan katsayılar toplanamaz.',
  },
  {
    id: 'tmpl-8',
    label: '🪜 1. Adım Başarılı',
    category: 'step',
    stepPrefix: '1. Adım:',
    text: 'Soruya yaklaşımın ve formül seçimin çok doğru.',
  },
  {
    id: 'tmpl-9',
    label: '🪜 2. Adımı Kontrol Et',
    category: 'step',
    stepPrefix: '2. Adım:',
    text: 'Buradaki sadeleştirme/dönüşüm basamağını tekrar gözden geçir.',
  },
  {
    id: 'tmpl-10',
    label: '🪜 Sağlama Yap',
    category: 'step',
    stepPrefix: 'Sonuç Adımı:',
    text: 'Bulduğun değeri denklemde yerine koyup sağlamasını yapmayı alışkanlık edin.',
  },
  {
    id: 'tmpl-11',
    label: '🚀 Harika Analiz',
    category: 'motivation',
    grade: 95,
    text: 'Farklı ve yaratıcı bir yolla çözmüşsün, analitik yaklaşımın çok başarılı!',
  },
  {
    id: 'tmpl-12',
    label: '💪 Pes Etme',
    category: 'motivation',
    grade: 70,
    text: 'Zor bir soruydu ve gayretin çok kıymetli. Takıldığın noktayı canlı derste birlikte çözelim.',
  },
];

const STORAGE_KEY = 'ugurhoca_teacher_custom_feedback_notes';

export type TeacherFeedbackLibraryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: FeedbackTemplateItem, mode: 'append' | 'replace') => void;
  selectedStepPrefix?: string | null;
};

function useSafeToast() {
  try {
    return useToast();
  } catch {
    return {
      showToast: () => {},
      success: () => {},
      error: () => {},
      info: () => {},
      warning: () => {},
      dismiss: () => {},
    };
  }
}

export function TeacherFeedbackLibraryModal({
  isOpen,
  onClose,
  onSelectTemplate,
  selectedStepPrefix,
}: TeacherFeedbackLibraryModalProps) {
  const titleId = useId();
  const modalRef = useAccessibleModal<HTMLDivElement>(isOpen, onClose);
  const { showToast } = useSafeToast();

  const [activeCategory, setActiveCategory] = useState<FeedbackCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [customTemplates, setCustomTemplates] = useState<FeedbackTemplateItem[]>([]);

  // Yeni not ekleme formu state'i
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newText, setNewText] = useState('');
  const [newCategory, setNewCategory] = useState<'concept' | 'calculation' | 'step' | 'motivation'>('concept');
  const [newGrade, setNewGrade] = useState<number | undefined>(85);

  // Yerel depolamadan özel şablonları yükle
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setCustomTemplates(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Özel şablonları kaydet
  const saveCustomTemplates = useCallback((items: FeedbackTemplateItem[]) => {
    setCustomTemplates(items);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch {
        // ignore
      }
    }
  }, []);

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim() || !newText.trim()) {
      showToast('warning', 'Lütfen başlık ve geri bildirim metnini doldurun.');
      return;
    }

    const newItem: FeedbackTemplateItem = {
      id: `custom-${Date.now()}`,
      label: newLabel.trim(),
      category: newCategory,
      text: newText.trim(),
      grade: newGrade,
      isCustom: true,
    };

    const nextList = [newItem, ...customTemplates];
    saveCustomTemplates(nextList);
    setNewLabel('');
    setNewText('');
    setIsAddingNew(false);
    showToast('success', 'Özel geri bildirim notu kütüphanenize eklendi.');
  };

  const handleDeleteCustom = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextList = customTemplates.filter((item) => item.id !== id);
    saveCustomTemplates(nextList);
    showToast('info', 'Özel not kütüphaneden silindi.');
  };

  if (!isOpen) return null;

  const allItems = [...customTemplates, ...DEFAULT_FEEDBACK_TEMPLATES];

  const filteredItems = allItems.filter((item) => {
    if (activeCategory === 'custom' && !item.isCustom) return false;
    if (activeCategory !== 'all' && activeCategory !== 'custom' && item.category !== activeCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.label.toLowerCase().includes(q) ||
        item.text.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const categories: { id: FeedbackCategory; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'all', label: 'Tümü', icon: BookOpen },
    { id: 'concept', label: 'Kavram Yanılgısı', icon: HelpCircle },
    { id: 'calculation', label: 'İşlem & İşaret', icon: AlertTriangle },
    { id: 'step', label: 'Çözüm Adımı', icon: Lightbulb },
    { id: 'motivation', label: 'Motivasyon', icon: Award },
    { id: 'custom', label: `Özel Notlarım (${customTemplates.length})`, icon: Sparkles },
  ];

  return (
    <div
      className="fixed inset-0 z-[160] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        ref={modalRef}
        className="relative flex flex-col w-full max-w-2xl max-h-[90vh] rounded-3xl border border-white/10 bg-slate-900 text-white shadow-2xl overflow-hidden"
      >
        {/* Başlık */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/25">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id={titleId} className="text-base font-bold tracking-tight text-white">
                  Öğretmen Geri Bildirim Kütüphanesi
                </h2>
                <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300">
                  Pedagojik Geri Bildirim
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Sık kullanılan notları öğrencinin çözümüne tek tıkla iliştirin veya özel notlarınızı kaydedin.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-white/10 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Araç Çubuğu: Kategori Seçici & Arama & Yeni Ekle */}
        <div className="p-4 border-b border-white/10 bg-slate-950/40 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Geri bildirim ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="button"
              onClick={() => setIsAddingNew((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-sm shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAddingNew ? 'İptal' : 'Yeni Not Ekle'}</span>
            </button>
          </div>

          {/* Kategori Butonları */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Adım İliştirme Bilgi Şeridi */}
          {selectedStepPrefix && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
              <Lightbulb className="w-4 h-4 shrink-0" />
              <span>
                Seçtiğiniz not <strong>{selectedStepPrefix}</strong> başlığıyla öğrencinin çözümüne iliştirilecektir.
              </span>
            </div>
          )}
        </div>

        {/* Yeni Not Ekleme Formu */}
        {isAddingNew && (
          <form onSubmit={handleAddCustom} className="p-4 border-b border-white/10 bg-indigo-950/30 space-y-3">
            <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Yeni Özel Geri Bildirim Tanımla
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="Şablon Başlığı (Örn: 🎯 Çapraz Çarpım Kuralı)"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-white/10 bg-slate-800 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as typeof newCategory)}
                  className="w-full px-3 py-1.5 rounded-xl border border-white/10 bg-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="concept">Kavram Yanılgısı</option>
                  <option value="calculation">İşlem & İşaret</option>
                  <option value="step">Çözüm Adımı</option>
                  <option value="motivation">Motivasyon</option>
                </select>
              </div>
            </div>

            <div>
              <textarea
                rows={2}
                placeholder="Geri bildirim metni (Öğrenciye iletilecek detaylı açıklama)..."
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-white/10 bg-slate-800 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Varsayılan Puan:</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newGrade ?? ''}
                  onChange={(e) => setNewGrade(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-16 px-2 py-1 rounded-lg border border-white/10 bg-slate-800 text-xs text-white text-center"
                />
              </div>

              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm"
              >
                Kütüphaneye Kaydet
              </button>
            </div>
          </form>
        )}

        {/* Şablon Listesi */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Bu filtreye uygun geri bildirim şablonu bulunamadı.
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-xs text-white">{item.label}</span>
                    {item.grade !== undefined && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                        {item.grade}P
                      </span>
                    )}
                    {item.isCustom && (
                      <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                        Özel
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                    {selectedStepPrefix ? `${selectedStepPrefix} ` : ''}
                    {item.text}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => onSelectTemplate(item, 'replace')}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white text-xs font-semibold transition"
                    title="Geri bildirim kutusunun içeriğini bu notla değiştir"
                  >
                    Ayarla
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectTemplate(item, 'append')}
                    className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-sm"
                    title="Mevcut geri bildirimin sonuna yeni satır olarak ekle"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>İliştir</span>
                  </button>

                  {item.isCustom && (
                    <button
                      type="button"
                      onClick={(e) => handleDeleteCustom(item.id, e)}
                      className="p-1 text-slate-500 hover:text-rose-400 hover:bg-white/10 rounded-lg transition"
                      title="Özel notu sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default TeacherFeedbackLibraryModal;
