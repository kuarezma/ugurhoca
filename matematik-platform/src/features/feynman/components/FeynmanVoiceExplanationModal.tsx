'use client';

import { useState, useEffect, useId, useRef } from 'react';
import {
  X,
  Mic,
  MicOff,
  Play,
  Square,
  Sparkles,
  Heart,
  Award,
  Clock,
  Lightbulb,
  Plus,
  MessageSquare,
} from 'lucide-react';
import { useAccessibleModal } from '@/hooks/useAccessibleModal';
import {
  getFeynmanRecordings,
  saveFeynmanRecording,
  toggleLikeFeynmanRecording,
  type FeynmanRecording,
} from '../lib/feynmanStorage';

interface FeynmanVoiceExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId?: string;
  studentName?: string;
  grade?: string;
}

const COMMON_CONCEPTS = [
  'Pisagor Bağıntısı Neden a² + b² = c² dir?',
  'Üslü Sayılarda Negatif Üs Ne İşe Yarar?',
  'EBOB ile EKOK Arasındaki Temel Fark',
  'İki Kare Farkı Formülü Nereden Gelir?',
  'Olasılık Neden 0 ile 1 Arasındadır?',
  'Üçgende Açı-Kenar İlişkisi Mantığı',
  'Doğrunun Eğimi Günlük Hayatta Ne Anlama Gelir?',
];

export function FeynmanVoiceExplanationModal({
  isOpen,
  onClose,
  studentId = 'current-student',
  studentName = 'Öğrenci',
  grade = '8',
}: FeynmanVoiceExplanationModalProps) {
  const titleId = useId();
  const modalRef = useAccessibleModal<HTMLDivElement>(isOpen, onClose);

  const [recordings, setRecordings] = useState<FeynmanRecording[]>([]);
  const [activeTab, setActiveTab] = useState<'showcase' | 'record'>('showcase');
  const [playingId, setPlayingId] = useState<string | null>(null);

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState(COMMON_CONCEPTS[0]);
  const [customTopic, setCustomTopic] = useState('');
  const [conceptSummary, setConceptSummary] = useState('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      setRecordings(getFeynmanRecordings());
      setPlayingId(null);
      setIsRecording(false);
      setRecordSeconds(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordSeconds((prev) => {
          if (prev >= 60) {
            clearInterval(timerRef.current!);
            setIsRecording(false);
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const handleStartRecord = () => {
    setRecordSeconds(0);
    setIsRecording(true);
  };

  const handleStopRecord = () => {
    setIsRecording(false);
  };

  const handleSaveRecording = (e: React.FormEvent) => {
    e.preventDefault();
    if (!conceptSummary.trim() || recordSeconds < 3) return;

    const topicTitle = customTopic.trim() || selectedTopic;

    const newRec: FeynmanRecording = {
      id: `feyn-${Date.now()}`,
      studentId,
      studentName,
      grade,
      topic: topicTitle,
      conceptSummary: conceptSummary.trim(),
      durationSeconds: recordSeconds,
      createdAt: new Date().toISOString(),
      likesCount: 1,
      badge: recordSeconds <= 45 ? 'Feynman Ustası' : 'Yalın Anlatıcı',
    };

    const ok = saveFeynmanRecording(newRec);
    if (ok) {
      setRecordings(getFeynmanRecordings());
      setConceptSummary('');
      setCustomTopic('');
      setRecordSeconds(0);
      setActiveTab('showcase');
    }
  };

  const handleToggleLike = (id: string) => {
    toggleLikeFeynmanRecording(id);
    setRecordings(getFeynmanRecordings());
  };

  const handlePlayToggle = (id: string) => {
    if (playingId === id) {
      setPlayingId(null);
    } else {
      setPlayingId(id);
      // 3 saniye sonra otomatik durdur
      setTimeout(() => {
        setPlayingId((curr) => (curr === id ? null : curr));
      }, 3000);
    }
  };

  if (!isOpen) return null;

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
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h2 id={titleId} className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                60 Saniyede Feynman Anlatımı
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 font-medium">
                  Metakognitif Pedagoji
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                &ldquo;Bir konuyu 12 yaşındaki birine en basit haliyle anlatabiliyorsan, gerçekten anlamışsındır.&rdquo; — Richard Feynman
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

        {/* Tab Selection */}
        <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('showcase')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'showcase'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Anlatım Vitrini ({recordings.length})
            </button>
            <button
              onClick={() => setActiveTab('record')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'record'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Plus className="w-4 h-4" />
              Kendi Anlatımını Kaydet
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400 font-medium">
            <Clock className="w-4 h-4" />
            Azami 60 Saniye Sınırı
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'showcase' ? (
            <div className="space-y-4">
              {recordings.map((rec) => {
                const isPlaying = playingId === rec.id;
                return (
                  <div
                    key={rec.id}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-3 transition-all hover:border-rose-300 dark:hover:border-rose-900/60"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300">
                            {rec.badge}
                          </span>
                          <span className="text-xs text-slate-400">
                            Anlatan: {rec.studentName} ({rec.grade}. Sınıf)
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5">
                          {rec.topic}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleLike(rec.id)}
                          className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-1 hover:scale-105 transition-transform"
                        >
                          <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                          {rec.likesCount}
                        </button>
                      </div>
                    </div>

                    {/* Simple Concept Summary */}
                    <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 italic flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <strong className="not-italic text-slate-900 dark:text-slate-100 mr-1">
                          Yalın Özeti:
                        </strong>
                        &ldquo;{rec.conceptSummary}&rdquo;
                      </div>
                    </div>

                    {/* Audio Player Bar */}
                    <div className="p-3 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-xl flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handlePlayToggle(rec.id)}
                          className="w-9 h-9 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md hover:bg-rose-700 transition-colors"
                          aria-label={isPlaying ? 'Durdur' : 'Sesli Dinle'}
                        >
                          {isPlaying ? <Square className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                        </button>
                        <div>
                          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            <span>{isPlaying ? 'Oynatılıyor...' : 'Ses Kaydı Dinle'}</span>
                            <span className="text-[11px] text-slate-400">({rec.durationSeconds} sn)</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            {[40, 70, 90, 60, 30, 80, 100, 50, 75, 40, 85, 30].map((h, i) => (
                              <div
                                key={i}
                                className={`w-1 rounded-full transition-all ${
                                  isPlaying
                                    ? 'bg-rose-500 animate-pulse'
                                    : 'bg-slate-300 dark:bg-slate-700'
                                }`}
                                style={{ height: `${h * 0.16}px` }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(rec.createdAt).toLocaleDateString('tr-TR')}
                      </div>
                    </div>

                    {/* Teacher's Note */}
                    {rec.teacherNote && (
                      <div className="p-2.5 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span>
                          <strong>Uğur Hoca Rozet Notu:</strong> {rec.teacherNote}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <form onSubmit={handleSaveRecording} className="space-y-5">
              <div className="p-4 bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 rounded-2xl flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div className="text-xs text-rose-950 dark:text-rose-200 space-y-1">
                  <p className="font-bold">Feynman Kuralı: Karmaşık formüller yerine gündelik benzetmeler kullan!</p>
                  <p>
                    Örneğin; negatif sayılarla çarpmayı &ldquo;düşmanımın düşmanı dostumdur&rdquo; gibi, karekökü ise bir karenin kenarını arayan bir dedektif gibi anlatabilirsin.
                  </p>
                </div>
              </div>

              <div>
                <label htmlFor="feynman-topic-select" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Anlatacağın Kavram veya Soru
                </label>
                <select
                  id="feynman-topic-select"
                  value={selectedTopic}
                  onChange={(e) => {
                    setSelectedTopic(e.target.value);
                    setCustomTopic('');
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white mb-2"
                >
                  {COMMON_CONCEPTS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="Veya kendi başlığını yaz (örn. Çarpan Ağacı Yöntemi)..."
                  aria-label="Özel Anlatım Başlığı"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 text-slate-900 dark:text-white"
                />
              </div>

              {/* 60s Voice Recording Interface */}
              <div className="p-6 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                  <button
                    type="button"
                    onClick={isRecording ? handleStopRecord : handleStartRecord}
                    className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 ${
                      isRecording
                        ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-300 dark:ring-rose-900/60'
                        : 'bg-rose-500 text-white hover:bg-rose-600'
                    }`}
                  >
                    {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                  </button>
                  {isRecording && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 animate-ping" />
                  )}
                </div>

                <div className="text-center">
                  <div className="text-2xl font-mono font-bold text-slate-900 dark:text-white">
                    00:{recordSeconds < 10 ? `0${recordSeconds}` : recordSeconds} / 01:00
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {isRecording
                      ? 'Mikrofon aktif, anlatımını yapıyorsun. Bitince durdur düğmesine bas.'
                      : recordSeconds > 0
                      ? `Kayıt tamamlandı (${recordSeconds} saniye). Beğenmediysen tekrar tıkla.`
                      : 'Kırmızı mikrofona dokunarak 60 saniyelik ses kaydını başlat.'}
                  </p>
                </div>
              </div>

              <div>
                <label htmlFor="feynman-concept-summary" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  1 Cümlelik Yalın Benzetme / Özet Notu
                </label>
                <textarea
                  id="feynman-concept-summary"
                  rows={2}
                  value={conceptSummary}
                  onChange={(e) => setConceptSummary(e.target.value)}
                  placeholder="Kardeşine anlatırken kullandığın en can alıcı cümleyi buraya yaz..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('showcase')}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={recordSeconds < 3 || !conceptSummary.trim()}
                  className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Feynman Vitrininde Yayınla
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
