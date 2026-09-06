'use client';

import { useState, useEffect, useId } from 'react';
import {
  X,
  PenTool,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  Lightbulb,
  Plus,
} from 'lucide-react';
import { useAccessibleModal } from '@/hooks/useAccessibleModal';
import {
  getStudentAuthoredQuestions,
  saveStudentAuthoredQuestion,
  type StudentAuthoredQuestion,
} from '../lib/studentAuthoringStorage';

interface StudentQuestionAuthoringModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId?: string;
  studentName?: string;
  grade?: string;
}

const TOPICS = [
  'Çarpanlar ve Katlar',
  'Üslü İfadeler',
  'Kareköklü İfadeler',
  'Veri Analizi',
  'Basit Olayların Olasılığı',
  'Cebirsel İfadeler ve Özdeşlikler',
  'Doğrusal Denklemler',
  'Eşitsizlikler',
  'Üçgenler',
  'Dönüşüm Geometrisi',
  'Geometrik Cisimler',
];

export function StudentQuestionAuthoringModal({
  isOpen,
  onClose,
  studentId = 'current-student',
  studentName = 'Öğrenci',
  grade = '8',
}: StudentQuestionAuthoringModalProps) {
  const titleId = useId();
  const modalRef = useAccessibleModal<HTMLDivElement>(isOpen, onClose);

  const [questions, setQuestions] = useState<StudentAuthoredQuestion[]>([]);
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [topic, setTopic] = useState(TOPICS[0]);
  const [difficulty, setDifficulty] = useState<'Kolay' | 'Orta' | 'Zor'>('Orta');
  const [questionText, setQuestionText] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctIndex, setCorrectIndex] = useState<number>(0);
  const [distractorA, setDistractorA] = useState('');
  const [distractorB, setDistractorB] = useState('');
  const [distractorC, setDistractorC] = useState('');
  const [distractorD, setDistractorD] = useState('');
  const [solutionExplanation, setSolutionExplanation] = useState('');

  useEffect(() => {
    if (isOpen) {
      setQuestions(getStudentAuthoredQuestions());
      setSuccessMessage(null);
    }
  }, [isOpen]);

  const resetForm = () => {
    setQuestionText('');
    setOptionA('');
    setOptionB('');
    setOptionC('');
    setOptionD('');
    setCorrectIndex(0);
    setDistractorA('');
    setDistractorB('');
    setDistractorC('');
    setDistractorD('');
    setSolutionExplanation('');
  };

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim() || !optionA.trim() || !optionB.trim() || !solutionExplanation.trim()) {
      return;
    }

    const options = [optionA.trim(), optionB.trim(), optionC.trim(), optionD.trim()].filter(Boolean);
    const distractors: Record<number, string> = {};
    const rawDistractors = [distractorA, distractorB, distractorC, distractorD];

    rawDistractors.forEach((text, idx) => {
      if (idx !== correctIndex && text.trim()) {
        distractors[idx] = text.trim();
      }
    });

    const newQuestion: StudentAuthoredQuestion = {
      id: `auth-q-${Date.now()}`,
      studentId,
      studentName,
      grade,
      topic,
      questionText: questionText.trim(),
      options,
      correctIndex,
      distractorExplanations: distractors,
      solutionExplanation: solutionExplanation.trim(),
      difficulty,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const ok = saveStudentAuthoredQuestion(newQuestion);
    if (ok) {
      setQuestions(getStudentAuthoredQuestions());
      resetForm();
      setActiveTab('list');
      setSuccessMessage('Sorun başarıyla kaydedildi ve öğretmen incelemesine gönderildi!');
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  if (!isOpen) return null;

  const approvedCount = questions.filter((q) => q.status === 'approved').length;

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
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h2 id={titleId} className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Öğrenci Soru Yazarlık Atölyesi
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50 font-medium">
                  Bloom: Yaratma
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kendi matematik sorunu yaz, çeldiricilerini kurgula ve soru havuzunda yazar olarak yerini al.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab & Stats Bar */}
        <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'list'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Yazılan Sorular ({questions.length})
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'create'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Plus className="w-4 h-4" />
              Yeni Soru Yaz
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              {approvedCount} Onaylı Soru
            </span>
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
              <Sparkles className="w-4 h-4" />
              Genç Yazar Rozeti
            </span>
          </div>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {successMessage}
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'list' ? (
            <div className="space-y-4">
              {questions.length === 0 ? (
                <div className="text-center py-12">
                  <Lightbulb className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Henüz soru yazmadın.
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    İlk sorunu yazarak arkadaşlarına meydan oku ve öğretmeninden geri bildirim al!
                  </p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Hemen Soru Yazmaya Başla
                  </button>
                </div>
              ) : (
                questions.map((q) => (
                  <div
                    key={q.id}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
                            {q.topic}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            Zorluk: {q.difficulty}
                          </span>
                          <span className="text-xs text-slate-400">
                            • Yazar: {q.studentName} ({q.grade}. Sınıf)
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white mt-2 leading-relaxed">
                          {q.questionText}
                        </p>
                      </div>

                      <div>
                        {q.status === 'approved' ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Onaylandı (Havuza Alındı)
                          </span>
                        ) : q.status === 'rejected' ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50 inline-flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Revize Gerekli
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50 inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Öğretmen İncelemesinde
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                      {q.options.map((opt, optIdx) => {
                        const isCorrect = optIdx === q.correctIndex;
                        const distractorNote = q.distractorExplanations?.[optIdx];
                        return (
                          <div
                            key={optIdx}
                            className={`p-2.5 rounded-xl border text-xs ${
                              isCorrect
                                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-200 font-medium'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>
                                <strong className="mr-1.5">{String.fromCharCode(65 + optIdx)})</strong> {opt}
                              </span>
                              {isCorrect && (
                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                  Doğru Cevap
                                </span>
                              )}
                            </div>
                            {!isCorrect && distractorNote && (
                              <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400/90 italic">
                                Çeldirici tuzağı: {distractorNote}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Solution Explanation */}
                    <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 rounded-xl text-xs text-blue-900 dark:text-blue-200">
                      <strong className="block mb-0.5 text-blue-700 dark:text-blue-300">
                        Çözüm Adımları:
                      </strong>
                      {q.solutionExplanation}
                    </div>

                    {/* Teacher Feedback */}
                    {q.teacherFeedback && (
                      <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 rounded-xl text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-semibold">Uğur Hoca&apos;nın Yorumu:</strong>
                          {q.teacherFeedback}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            <form onSubmit={handleCreateQuestion} className="space-y-5">
              <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs text-indigo-950 dark:text-indigo-200 space-y-1">
                  <p className="font-bold">Bir soruyu iyi yapan şey sadece doğru cevap değil, çeldiricilerdir!</p>
                  <p>
                    Öğrenci arkadaşlarının düşebileceği kavram yanılgılarını düşün. Örneğin: işlem önceliğini unutanlar hangi şıkkı işaretlerdi?
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="author-topic" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Matematik Konusu
                  </label>
                  <select
                    id="author-topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {TOPICS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="author-difficulty" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Zorluk Derecesi
                  </label>
                  <select
                    id="author-difficulty"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as 'Kolay' | 'Orta' | 'Zor')}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Kolay">Kolay (Kazanım Düzeyi)</option>
                    <option value="Orta">Orta (Uygulama & Muhakeme)</option>
                    <option value="Zor">Zor (Yeni Nesil & Beceri Temelli)</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="author-question-text" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Soru Metni
                </label>
                <textarea
                  id="author-question-text"
                  rows={3}
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Soru kökünü ve verilenleri açıkça yazın..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* Options & Distractors */}
              <div className="space-y-3">
                <div className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Seçenekler ve Çeldirici Kurgusu
                  <span className="text-slate-400 font-normal ml-1">
                    (Doğru cevabın yanındaki kutuyu işaretleyin, diğerlerine çeldirici açıklaması yazın)
                  </span>
                </div>

                {[
                  { label: 'A', val: optionA, setVal: setOptionA, dist: distractorA, setDist: setDistractorA, idx: 0 },
                  { label: 'B', val: optionB, setVal: setOptionB, dist: distractorB, setDist: setDistractorB, idx: 1 },
                  { label: 'C', val: optionC, setVal: setOptionC, dist: distractorC, setDist: setDistractorC, idx: 2 },
                  { label: 'D', val: optionD, setVal: setOptionD, dist: distractorD, setDist: setDistractorD, idx: 3 },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`p-3 rounded-xl border transition-colors ${
                      correctIndex === item.idx
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                        : 'bg-slate-50/40 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id={`correct-${item.label}`}
                        name="correctIndex"
                        checked={correctIndex === item.idx}
                        onChange={() => setCorrectIndex(item.idx)}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                      />
                      <label
                        htmlFor={`correct-${item.label}`}
                        className="text-xs font-bold text-slate-700 dark:text-slate-200"
                      >
                        {item.label}) Seçeneği
                        {correctIndex === item.idx && (
                          <span className="ml-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                            (Doğru Cevap)
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        value={item.val}
                        onChange={(e) => item.setVal(e.target.value)}
                        placeholder={`Seçenek ${item.label} değeri...`}
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        required={item.idx < 2}
                      />
                    </div>

                    {correctIndex !== item.idx && (
                      <div className="mt-2 pl-6">
                        <input
                          type="text"
                          value={item.dist}
                          onChange={(e) => item.setDist(e.target.value)}
                          placeholder="Çeldirici analizi: Öğrenci hangi hatayı yaparsa bu şıkkı seçer?"
                          className="w-full px-3 py-1.5 text-[11px] rounded-lg border border-dashed border-amber-200 dark:border-amber-800/50 bg-amber-50/30 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200 placeholder-amber-500/70"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <label htmlFor="author-solution-text" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Çözüm ve Mantıksal Açıklama
                </label>
                <textarea
                  id="author-solution-text"
                  rows={2}
                  value={solutionExplanation}
                  onChange={(e) => setSolutionExplanation(e.target.value)}
                  placeholder="Sorunun adım adım doğru çözüm yolunu açıklayın..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Soruyu İncelemeye Gönder
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
