'use client';

import { useState, useEffect, useId } from 'react';
import {
  X,
  Award,
  FolderKanban,
  Printer,
  Plus,
  Trash2,
  BookOpen,
  Calendar,
  Star,
} from 'lucide-react';
import { useAccessibleModal } from '@/hooks/useAccessibleModal';
import {
  getPortfolioItems,
  savePortfolioItem,
  removePortfolioItem,
  type PortfolioItem,
  type PortfolioCategory,
} from '../lib/portfolioStorage';

type StudentPortfolioModalProps = {
  isOpen: boolean;
  onClose: () => void;
  studentName?: string;
  grade?: string;
};

export function StudentPortfolioModal({
  isOpen,
  onClose,
  studentName = 'Öğrenci',
  grade = '8',
}: StudentPortfolioModalProps) {
  const titleId = useId();
  const modalRef = useAccessibleModal<HTMLDivElement>(isOpen, onClose);
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newCategory, setNewCategory] = useState<PortfolioCategory>('solution');
  const [newReflection, setNewReflection] = useState('');
  const [newTags, setNewTags] = useState('');

  useEffect(() => {
    if (isOpen) {
      setItems(getPortfolioItems());
    }
  }, [isOpen]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newReflection.trim()) return;

    const tagsArr = newTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const newItem: PortfolioItem = {
      id: `port-${Date.now()}`,
      title: newTitle.trim(),
      topic: newTopic.trim() || 'Matematik Çalışması',
      category: newCategory,
      grade,
      studentReflection: newReflection.trim(),
      teacherFeedback: 'Henüz incelenmedi. Öğretmenin kontrol ettiğinde buraya not düşecektir.',
      date: new Date().toISOString().split('T')[0],
      tags: tagsArr.length > 0 ? tagsArr : ['Gelişim'],
    };

    savePortfolioItem(newItem);
    setItems(getPortfolioItems());
    setIsAddingNew(false);
    setNewTitle('');
    setNewTopic('');
    setNewReflection('');
    setNewTags('');
  };

  const handleDeleteItem = (id: string) => {
    removePortfolioItem(id);
    setItems(getPortfolioItems());
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  const filteredItems = items.filter((item) => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  return (
    <div
      className="fixed inset-0 z-[160] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in print:p-0 print:bg-white"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        ref={modalRef}
        className="relative flex flex-col w-full max-w-3xl max-h-[90vh] rounded-3xl border border-white/10 bg-slate-900 text-white shadow-2xl overflow-hidden print:border-none print:shadow-none print:max-h-none print:w-full print:bg-white print:text-black"
      >
        {/* Başlık */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 bg-slate-900/90 print:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/25">
              <FolderKanban className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id={titleId} className="text-base font-bold tracking-tight text-white">
                  Matematik Gelişim Portfolyosu
                </h2>
                <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300">
                  {studentName} • {grade}. Sınıf
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Gurur duyduğun çözümleri, projelerini ve öz-yansımalarını biriktirdiğin kişisel gelişim arşivi.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold transition"
              title="A4 Rapor Olarak Yazdır / PDF İndir"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Yazdır / PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Kapat"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-white/10 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Yazdırma Başlığı (Print View Only) */}
        <div className="hidden print:block p-6 border-b border-slate-300">
          <h1 className="text-2xl font-bold text-slate-900">Uğur Hoca Matematik Platformu</h1>
          <h2 className="text-lg font-semibold text-slate-700">Öğrenci Gelişim Portfolyosu & Dosyası</h2>
          <p className="text-sm text-slate-600 mt-1">Öğrenci: {studentName} • {grade}. Sınıf • Tarih: {new Date().toLocaleDateString('tr-TR')}</p>
        </div>

        {/* Araç Çubuğu: Kategori Filtresi & Yeni Ekle */}
        <div className="p-4 border-b border-white/10 bg-slate-950/40 flex items-center justify-between gap-2 print:hidden">
          <div className="flex items-center gap-1 overflow-x-auto">
            {[
              { id: 'all', label: 'Tümü' },
              { id: 'solution', label: '💡 Çözümler' },
              { id: 'project', label: '📐 Projeler' },
              { id: 'reflection', label: '📝 Öz-Yansımalar' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  activeCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsAddingNew((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-sm shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAddingNew ? 'İptal' : 'Yeni Çalışma Ekle'}</span>
          </button>
        </div>

        {/* Yeni Çalışma Ekleme Formu */}
        {isAddingNew && (
          <form onSubmit={handleAddItem} className="p-4 border-b border-white/10 bg-indigo-950/30 space-y-3 print:hidden">
            <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Portfolyoma Yeni Başarı / Çözüm Ekle
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Çalışma Başlığı (Örn: Pisagor Katlama İspatı)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                className="w-full px-3 py-1.5 rounded-xl border border-white/10 bg-slate-800 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 sm:col-span-2"
              />
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as PortfolioCategory)}
                className="w-full px-3 py-1.5 rounded-xl border border-white/10 bg-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="solution">💡 Çözüm</option>
                <option value="project">📐 Proje</option>
                <option value="reflection">📝 Öz-Yansıma</option>
                <option value="exam">🎯 Sınav</option>
              </select>
            </div>
            <input
              type="text"
              placeholder="İlgili Matematik Konusu (Örn: Üçgenler)"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-white/10 bg-slate-800 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />

            <textarea
              rows={2}
              placeholder="Öz-Yansıma Notun (Bu problemi çözerken ne öğrendin, hangi yöntemi keşfettin?)..."
              value={newReflection}
              onChange={(e) => setNewReflection(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-white/10 bg-slate-800 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />

            <div className="flex items-center justify-between gap-2 pt-1">
              <input
                type="text"
                placeholder="Etiketler (Virgülle ayırın: LGS, İspat, Pisagor)"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                className="w-2/3 px-3 py-1.5 rounded-xl border border-white/10 bg-slate-800 text-xs text-white placeholder-slate-400"
              />
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm"
              >
                Portfolyoma Kaydet
              </button>
            </div>
          </form>
        )}

        {/* Çalışma Listesi */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 print:p-6 print:space-y-6">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-dashed border-white/10">
              <BookOpen className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">Bu kategoride henüz bir portfolyo çalışması yok</p>
              <p className="text-xs text-slate-500 mt-1">
                Yukarıdaki &quot;Yeni Çalışma Ekle&quot; butonuna basarak ilk matematik çalışmanızı kaydedebilirsiniz.
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 print:bg-slate-50 print:border-slate-300 print:text-black"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 print:border print:border-indigo-300">
                        {item.topic}
                      </span>
                      {item.score !== undefined && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 flex items-center gap-1">
                          <Star className="w-3 h-3 text-emerald-400 fill-emerald-400" /> {item.score} Puan
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white print:text-black">{item.title}</h3>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" /> {item.date}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition print:hidden"
                    title="Portfolyodan sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Öğrenci Yansıması */}
                <div className="p-3 rounded-xl bg-slate-950/40 border border-white/5 space-y-1 print:bg-white print:border-slate-200">
                  <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1">
                    <BookOpen className="w-3 h-3" /> Öğrenci Öz-Değerlendirmesi
                  </p>
                  <p className="text-xs text-slate-300 italic print:text-slate-800 leading-relaxed">
                    &quot;{item.studentReflection}&quot;
                  </p>
                </div>

                {/* Öğretmen Geri Bildirimi */}
                {item.teacherFeedback && (
                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 space-y-1 print:bg-emerald-50 print:border-emerald-200">
                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                      <Award className="w-3 h-3" /> Uğur Hoca&apos;nın Pedagojik Değerlendirmesi
                    </p>
                    <p className="text-xs text-emerald-200 print:text-emerald-900 leading-relaxed">
                      {item.teacherFeedback}
                    </p>
                  </div>
                )}

                {/* Etiketler */}
                {item.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 pt-1">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/5 text-[10px] text-slate-400 print:text-slate-600 print:border-slate-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentPortfolioModal;
