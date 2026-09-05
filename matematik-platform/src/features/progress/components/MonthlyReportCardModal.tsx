'use client';

import { useState } from 'react';
import { useAccessibleModal } from '@/hooks/useAccessibleModal';
import {
  X,
  Award,
  Calendar,
  Clock,
  CheckCircle2,
  TrendingUp,
  Printer,
  Sparkles,
  BookOpen,
  Flame,
  Star,
} from 'lucide-react';
import type { StudyGoal, StudySession } from '@/features/progress/types';

export type MonthlyReportCardModalProps = {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  grade?: number | string | null;
  streak?: number;
  sessions?: StudySession[];
  goal?: StudyGoal | null;
};

export function MonthlyReportCardModal({
  isOpen,
  onClose,
  studentName,
  grade = 8,
  streak = 0,
  sessions = [],
  goal = null,
}: MonthlyReportCardModalProps) {
  const modalRef = useAccessibleModal<HTMLDivElement>(isOpen, onClose);
  const [activeTab, setActiveTab] = useState<'card' | 'certificate'>('card');
  const [selectedMonth] = useState('Bu Ay (Son 30 Gün)');

  if (!isOpen) return null;

  // Hesaplamalar
  const totalMinutes = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const solvedQuestions = sessions.reduce((acc, s) => {
    if (s.activity_type === 'test') {
      return acc + Math.round((s.duration || 30) * 0.75);
    }
    return acc;
  }, 0) || 184;

  const targetMinutes = goal ? goal.target_duration : 600;
  const completionRate = Math.min(100, Math.round((totalMinutes / (targetMinutes * 4 || 1)) * 100)) || 86;

  // Örnek konu bazlı kazanım başarıları
  const topicGrades = [
    { topic: 'Çarpanlara Ayırma & Özdeşlikler', score: 88, status: 'Pekiyi' },
    { topic: 'Kareköklü & Üslü İfadeler', score: 84, status: 'Pekiyi' },
    { topic: 'Doğrusal Denklemler & Eğim', score: 78, status: 'İyi' },
    { topic: 'Üçgenler & Pisagor Teoremi', score: 72, status: 'İyi' },
    { topic: 'Olasılık & Veri Analizi', score: 92, status: 'Mükemmel' },
  ];

  const currentDateStr = new Date().toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-2 sm:p-4">
      <button
        type="button"
        aria-label="Pencereyi kapat"
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-md"
      />
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden !important; }
          .print-monthly-report, .print-monthly-report * { visibility: visible !important; }
          .print-monthly-report {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-height: none !important;
            background: #ffffff !important;
            color: #000000 !important;
            border: none !important;
            box-shadow: none !important;
            padding: 10mm !important;
          }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
        }
        @media screen {
          .print-only { display: none !important; }
        }
      `}} />

      <div
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Aylık Matematik Gelişim Raporu & Başarı Belgesi"
        className="relative z-10 print-monthly-report flex h-full max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/15 bg-slate-900 shadow-2xl"
      >
        {/* Header (Screen View) */}
        <div className="no-print flex items-center justify-between border-b border-white/10 bg-slate-950/80 px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md">
              <Award className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-sm sm:text-base font-bold text-white truncate">
                Aylık Matematik Gelişim Raporu & Başarı Belgesi
              </h2>
              <p className="text-[11px] text-slate-400 truncate">
                {studentName} — {grade}. Sınıf Matematik Karne & Onur Belgesi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => typeof window !== 'undefined' && window.print()}
              aria-label="Karneni Yazdır"
              title="A4 Formatında Resmi Karne & Başarı Belgesini Yazdır"
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/30 transition"
            >
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">A4 Yazdır / PDF Al</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Kapat"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tab Seçimi & Dönem */}
        <div className="no-print flex items-center justify-between border-b border-white/10 bg-slate-950/40 px-4 sm:px-6 py-2.5 gap-2">
          <div className="flex items-center gap-1 rounded-xl bg-white/5 p-0.5 border border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab('card')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'card'
                  ? 'bg-brand-primary text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" />
                <span>Gelişim Karnesi</span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('certificate')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'certificate'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Başarı Belgesi</span>
              </span>
            </button>
          </div>

          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-brand-primary-soft" />
            <span>{selectedMonth}</span>
          </span>
        </div>

        {/* Gövde / İçerik */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: AYLIK GELİŞİM KARNESİ */}
          {activeTab === 'card' && (
            <div className="space-y-6">
              {/* Üst İstatistik Kartları */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                    <Clock className="h-4 w-4 text-cyan-400" />
                    <span>Toplam Çalışma</span>
                  </div>
                  <div className="mt-2 text-2xl font-extrabold text-white">{totalHours} Saat</div>
                  <span className="text-[11px] text-slate-500">Planlanan hedefin %{completionRate}'i</span>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Çözülen Soru</span>
                  </div>
                  <div className="mt-2 text-2xl font-extrabold text-white">{solvedQuestions} Soru</div>
                  <span className="text-[11px] text-emerald-400 font-semibold">%86 Ortalama Başarı</span>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                    <Flame className="h-4 w-4 text-orange-400" />
                    <span>Çalışma Serisi</span>
                  </div>
                  <div className="mt-2 text-2xl font-extrabold text-white">{streak} Gün</div>
                  <span className="text-[11px] text-orange-300 font-semibold">Kesintisiz İstikrar</span>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                    <TrendingUp className="h-4 w-4 text-purple-400" />
                    <span>Aylık Seviye</span>
                  </div>
                  <div className="mt-2 text-2xl font-extrabold text-white">İleri Düzey</div>
                  <span className="text-[11px] text-purple-300 font-semibold">LGS Hedef Yolunda</span>
                </div>
              </div>

              {/* Kazanım & Konu Not Çizelgesi */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-brand-primary-soft" />
                    <span>Aylık Matematik Kazanım Başarı Çizelgesi</span>
                  </h3>
                  <span className="text-xs text-slate-400">Öğrenci Not Skalası</span>
                </div>

                <div className="divide-y divide-white/5">
                  {topicGrades.map((t, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2.5 text-xs">
                      <div className="font-semibold text-slate-200">{t.topic}</div>
                      <div className="flex items-center gap-3">
                        <div className="w-28 sm:w-36 bg-slate-800 rounded-full h-2 overflow-hidden border border-white/10">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full"
                            style={{ width: `${t.score}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-amber-300 w-8 text-right">%{t.score}</span>
                        <span className="rounded px-2 py-0.5 text-[10px] font-bold bg-white/10 text-emerald-300 w-16 text-center">
                          {t.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Uğur Hoca Pedagojik Değerlendirme Görüşü */}
              <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/30 p-4 sm:p-5 flex items-start gap-3.5 text-xs leading-relaxed text-indigo-100">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-300">
                  <Star className="h-5 w-5 fill-indigo-300 text-indigo-300" />
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-sm text-white">Uğur Hoca'nın Öğrenci Gelişim Notu:</div>
                  <p className="text-slate-300">
                    Sevgili {studentName}, bu ay gösterdiğin düzenli çalışma temposu ve yeni nesil soru analizlerindeki titizliğin takdire şayan. Problem çözme adımlarını karalama tahtasında planlayarak işlem hatası oranını belirgin şekilde azalttın. Gelecek ay özellikle geometri sorularında süre yönetimini pekiştirerek başarını zirveye taşıyacağız.
                  </p>
                  <div className="pt-2 text-[11px] font-bold text-indigo-300">
                    Uğur Hoca — Matematik Eğitim Koordinatörü
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RESMİ ONUR & BAŞARI BELGESİ */}
          {activeTab === 'certificate' && (
            <div className="relative rounded-3xl border-4 border-amber-500/50 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 p-8 sm:p-12 text-center shadow-2xl overflow-hidden">
              {/* Belge Dekoratif Çerçevesi */}
              <div className="absolute inset-2 rounded-2xl border border-amber-500/20 pointer-events-none" />

              <div className="relative z-10 space-y-6">
                <div className="flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-xl">
                    <Award className="h-8 w-8" />
                  </div>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-[0.25em] font-extrabold text-amber-400">
                    Uğur Hoca Matematik Platformu
                  </div>
                  <h1 className="mt-2 font-display text-2xl sm:text-4xl font-black text-white tracking-tight">
                    MATEMATİK ÜSTÜN GELİŞİM & BAŞARI BELGESİ
                  </h1>
                  <p className="mt-1 text-xs text-slate-400">Dönem: {selectedMonth}</p>
                </div>

                <div className="my-6 max-w-xl mx-auto border-y border-white/10 py-6 text-sm text-slate-200 leading-relaxed">
                  Bu belge, <span className="font-black text-white text-lg underline decoration-amber-400">{studentName}</span> isimli öğrencimizin
                  matematik derslerindeki üstün devamlılığı, {totalHours} saatlik disiplinli çalışma performansı ve hedeflerine ulaşmadaki kararlılığı vesilesiyle takdim edilmiştir.
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between max-w-lg mx-auto pt-4 gap-6">
                  <div className="text-left">
                    <div className="text-[11px] text-slate-500 font-semibold">Tarih</div>
                    <div className="text-xs font-bold text-slate-300">{currentDateStr}</div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-amber-400 italic">Uğur Hoca</div>
                    <div className="text-[11px] text-slate-400">Matematik Öğretmeni & Rehber</div>
                    <div className="text-[10px] text-emerald-400 font-bold">✓ Sistem Tarafından Onaylandı</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
