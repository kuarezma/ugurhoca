'use client';

import { useState } from 'react';
import {
  X,
  Send,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';
import type { LiveLesson } from '@/features/live-lessons/types';
import {
  submitStudentQuestion,
  type StudentQuestionDifficulty,
} from '@/features/live-lessons/lib/studentQuestionsStorage';
import { fireConfetti } from '@/components/ConfettiBurst';

type SubmitQuestionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  lessons?: LiveLesson[];
  defaultStudentName?: string;
  isLight?: boolean;
};

export function SubmitQuestionModal({
  isOpen,
  onClose,
  lessons = [],
  defaultStudentName = '',
  isLight = false,
}: SubmitQuestionModalProps) {
  const [studentName, setStudentName] = useState(defaultStudentName || 'Öğrenci');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<StudentQuestionDifficulty>('Orta');
  const [questionText, setQuestionText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) {
      setError('Lütfen çözülmesini istediğin soru metnini yaz.');
      return;
    }
    if (!topic.trim()) {
      setError('Lütfen sorunun ait olduğu konuyu belirt.');
      return;
    }

    submitStudentQuestion({
      student_name: studentName.trim() || 'Öğrenci',
      lesson_id: selectedLessonId || undefined,
      topic: topic.trim(),
      difficulty,
      question_text: questionText.trim(),
      image_url: imageUrl.trim() || undefined,
    });

    void fireConfetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });

    setIsSubmitted(true);
    setError(null);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setQuestionText('');
    setImageUrl('');
    setTopic('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Canlı Derse Soru Gönder"
      className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-950/80 p-3 sm:p-4 backdrop-blur-md overflow-y-auto"
    >
      <div
        className={`relative w-full max-w-lg overflow-hidden rounded-3xl border shadow-2xl transition-all my-auto ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900'
            : 'bg-slate-900 border-white/15 text-slate-100'
        }`}
      >
        {/* Üst Başlık */}
        <div
          className={`flex items-center justify-between border-b px-5 py-4 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-white/10'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500 border border-amber-500/25">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-base sm:text-lg font-bold">
                Canlı Derse Soru Gönder
              </h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Yapamadığın soruyu ilet, Uğur Hoca derste tahtaya yansıtıp çözsün!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Pencereyi kapat"
            className={`rounded-xl p-2 transition ${
              isLight ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-white/10 text-slate-300'
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Gövde */}
        <div className="p-5 sm:p-6">
          {isSubmitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Sorun Canlı Ders Havuzuna Eklendi!</h3>
                <p className={`text-xs mt-1 max-w-sm mx-auto ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Tebrikler! Sorun öğretmen soru masasına başarıyla iletildi. Canlı derse katıldığında Uğur Hoca bu soruyu ekrana yansıtıp tüm sınıfla birlikte çözecek.
                </p>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                    isLight ? 'border-slate-300 hover:bg-slate-100' : 'border-white/10 hover:bg-white/10'
                  }`}
                >
                  Bir Soru Daha Gönder
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition"
                >
                  Tamam, Kapat
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-semibold">
                  {error}
                </div>
              )}

              {/* Öğrenci İsmi & İlgili Ders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="sq-student-name" className="block text-xs font-bold text-slate-400 mb-1">
                    Adın / Rumuzun
                  </label>
                  <div className="relative">
                    <input
                      id="sq-student-name"
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="Örn: Efe K."
                      className={`w-full rounded-xl border px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-white/10 text-white'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="sq-lesson" className="block text-xs font-bold text-slate-400 mb-1">
                    İlgili Canlı Ders (İsteğe Bağlı)
                  </label>
                  <select
                    id="sq-lesson"
                    value={selectedLessonId}
                    onChange={(e) => setSelectedLessonId(e.target.value)}
                    className={`w-full rounded-xl border px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-white/10 text-white'
                    }`}
                  >
                    <option value="">Genel Canlı Ders Havuzu</option>
                    {lessons.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Konu & Zorluk */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="sq-topic" className="block text-xs font-bold text-slate-400 mb-1">
                    Matematik Konusu *
                  </label>
                  <input
                    id="sq-topic"
                    type="text"
                    required
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Örn: Fonksiyon Grafiği, Trigonometri"
                    className={`w-full rounded-xl border px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-white/10 text-white'
                    }`}
                  />
                </div>

                <div>
                  <span className="block text-xs font-bold text-slate-400 mb-1">
                    Zorluk Seviyesi
                  </span>
                  <div className="flex gap-1.5">
                    {(['Kolay', 'Orta', 'Zor'] as StudentQuestionDifficulty[]).map((dif) => (
                      <button
                        key={dif}
                        type="button"
                        onClick={() => setDifficulty(dif)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition border ${
                          difficulty === dif
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow'
                            : isLight
                            ? 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                            : 'bg-slate-800 border-white/10 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {dif}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Soru Metni */}
              <div>
                <label htmlFor="sq-question-text" className="block text-xs font-bold text-slate-400 mb-1">
                  Soru Metni & Açıklamanız *
                </label>
                <textarea
                  id="sq-question-text"
                  required
                  rows={4}
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Sorunun tamamını veya takıldığın yeri buraya yaz..."
                  className={`w-full rounded-xl border p-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-white/10 text-white'
                  }`}
                />
              </div>

              {/* Görsel URL (Opsiyonel) */}
              <div>
                <label htmlFor="sq-image-url" className="block text-xs font-bold text-slate-400 mb-1">
                  Soru Fotoğrafı / Linki (İsteğe Bağlı)
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      id="sq-image-url"
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://... (Fotoğraf linki)"
                      className={`w-full rounded-xl border px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-white/10 text-white'
                      }`}
                    />
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Telefonundan veya bilgisayarından aldığın ekran görüntüsünün linkini ekleyebilirsin.
                </span>
              </div>

              {/* Butonlar */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-white/10'
                  }`}
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-orange-500/20 flex items-center gap-1.5 transition"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Soruyu Derse Gönder</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
export default SubmitQuestionModal;
