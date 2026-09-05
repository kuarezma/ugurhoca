'use client';

import { useState, useId, useMemo } from 'react';
import {
  X,
  Printer,
  Calendar,
  Sparkles,
  RotateCcw,
  CheckSquare,
  Flame,
} from 'lucide-react';
import { useAccessibleModal } from '@/hooks/useAccessibleModal';

export type DaySchedule = {
  dayName: string;
  shortDay: string;
  focusTopics: string;
  targetQuestions: number;
  pomodoroCount: number;
  note: string;
};

export const DEFAULT_WEEKLY_SCHEDULE: DaySchedule[] = [
  {
    dayName: 'Pazartesi',
    shortDay: 'Pzt',
    focusTopics: 'Çarpanlar & Katlar, Üslü Sayılar',
    targetQuestions: 60,
    pomodoroCount: 3,
    note: 'Formül kartlarını 10 dk tekrar et',
  },
  {
    dayName: 'Salı',
    shortDay: 'Sal',
    focusTopics: 'Kareköklü İfadeler, Veri Analizi',
    targetQuestions: 60,
    pomodoroCount: 3,
    note: 'Yaklaşık değer sorularına odaklan',
  },
  {
    dayName: 'Çarşamba',
    shortDay: 'Çar',
    focusTopics: 'Cebirsel İfadeler & Özdeşlikler',
    targetQuestions: 75,
    pomodoroCount: 4,
    note: 'İki kare farkı modelleme soruları',
  },
  {
    dayName: 'Perşembe',
    shortDay: 'Per',
    focusTopics: 'Doğrusal Denklemler & Eğim',
    targetQuestions: 75,
    pomodoroCount: 4,
    note: 'Koordinat sistemi grafik çizimleri',
  },
  {
    dayName: 'Cuma',
    shortDay: 'Cum',
    focusTopics: 'Üçgenler, Pisagor & Benzerlik',
    targetQuestions: 60,
    pomodoroCount: 3,
    note: 'Özel üçgenleri (3-4-5, 5-12-13) pekiştir',
  },
  {
    dayName: 'Cumartesi',
    shortDay: 'Cmt',
    focusTopics: 'Genel Branş Denemesi & Hata Defteri',
    targetQuestions: 90,
    pomodoroCount: 4,
    note: 'Yanlış yaptığın soruları telafi et',
  },
  {
    dayName: 'Pazar',
    shortDay: 'Paz',
    focusTopics: 'Haftalık Eksik Tamamlama & Hafif Tekrar',
    targetQuestions: 40,
    pomodoroCount: 2,
    note: 'Gelecek haftanın planını gözden geçir',
  },
];

type PrintableWeeklyPlannerModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function PrintableWeeklyPlannerModal({
  isOpen,
  onClose,
}: PrintableWeeklyPlannerModalProps) {
  const titleId = useId();
  const modalRef = useAccessibleModal<HTMLDivElement>(isOpen, onClose);
  const [schedule, setSchedule] = useState<DaySchedule[]>(DEFAULT_WEEKLY_SCHEDULE);
  const [studentName, setStudentName] = useState('');
  const [examGoal, setExamGoal] = useState('LGS Hedef: 18+ Net / TYT Hedef: 30+ Net');

  const totalWeeklyQuestions = useMemo(() => {
    return schedule.reduce((sum, d) => sum + (Number(d.targetQuestions) || 0), 0);
  }, [schedule]);

  const totalPomodoros = useMemo(() => {
    return schedule.reduce((sum, d) => sum + (Number(d.pomodoroCount) || 0), 0);
  }, [schedule]);

  const handleDayChange = (index: number, field: keyof DaySchedule, value: string | number) => {
    setSchedule((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleReset = () => {
    setSchedule(DEFAULT_WEEKLY_SCHEDULE);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-2 sm:p-5">
      <button
        type="button"
        aria-label="Pencereyi kapat"
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md print:hidden"
        onClick={onClose}
      />
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 shadow-2xl transition-all print:fixed print:inset-0 print:m-0 print:h-auto print:max-h-none print:w-full print:max-w-none print:rounded-none print:border-none print:bg-white print:p-0 print:shadow-none print:text-black"
      >
        {/* Başlık ve Butonlar (Ekranda görünür, baskıda gizlenir) */}
        <div className="flex flex-col gap-3 border-b border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-slate-950/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h2 id={titleId} className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                A4 Masabaşı Haftalık Çalışma Çizelgesi 🗓️
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kişiselleştirilebilir gün gün soru hedefleri, Pomodoro takip kutucukları ve mürekkep dostu baskı
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              title="Varsayılan programa dön"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-sm transition hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Sıfırla</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md transition hover:scale-[1.02] active:scale-[0.98]"
            >
              <Printer className="h-4 w-4" />
              <span>Yazdır / PDF Olarak Kaydet</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Kapat"
              className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Canlı Düzenleme / Ayar Şeridi (Baskıda gizlenir) */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/70 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] px-5 py-2.5 text-xs print:hidden">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-600 dark:text-slate-300">Öğrenci Adı:</span>
              <input
                type="text"
                placeholder="Adın Soyadın"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-36 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-600 dark:text-slate-300">Sınav Hedefi:</span>
              <input
                type="text"
                value={examGoal}
                onChange={(e) => setExamGoal(e.target.value)}
                className="w-56 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 font-semibold text-[11px] text-slate-600 dark:text-slate-300">
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <Flame className="h-3.5 w-3.5" />
              Haftalık Hedef: <strong className="text-slate-900 dark:text-white">{totalWeeklyQuestions} Soru</strong>
            </span>
            <span>•</span>
            <span>{totalPomodoros} Pomodoro Seansı</span>
          </div>
        </div>

        {/* Yazdırılabilir Belge Alanı (Ekran ve A4 Baskı Uyumlu) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 print:p-4 print:overflow-visible text-slate-900 dark:text-slate-100 print:text-black [scrollbar-width:thin]">
          {/* Yazdırma Başlığı (A4'te en üstte çıkar) */}
          <div className="mb-4 border-b-2 border-slate-800 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display text-xl sm:text-2xl font-black tracking-tight text-slate-900 print:text-black">
                  UĞUR HOCA MATEMATİK • HAFTALIK ÇALIŞMA PLANI
                </h1>
                <p className="text-xs text-slate-600 print:text-slate-600 mt-0.5">
                  &quot;Büyük başarılar, her gün atılan küçük ve istikrarlı adımlarla gelir.&quot;
                </p>
              </div>
              <div className="text-right text-xs font-semibold text-slate-700 print:text-black">
                <p>İsim: <span className="font-bold underline">{studentName || '...........................................'}</span></p>
                <p className="mt-1">Hafta: Tarih: _____ / _____ / 2026</p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between rounded-xl bg-slate-100 print:bg-slate-50 p-2.5 text-xs font-medium">
              <span>🎯 <strong>Hedef:</strong> {examGoal || 'LGS & YKS Matematik Başarısı'}</span>
              <span>📊 <strong>Haftalık Toplam Hedef:</strong> {totalWeeklyQuestions} Soru / {totalPomodoros} Pomodoro</span>
            </div>
          </div>

          {/* Haftalık Çizelge Tablosu */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-slate-300 dark:border-slate-700 print:border-black text-left text-xs">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/80 print:bg-slate-100 text-slate-800 dark:text-slate-200 print:text-black font-bold">
                  <th className="border border-slate-300 dark:border-slate-700 print:border-black px-3 py-2 w-28 text-center">
                    Gün
                  </th>
                  <th className="border border-slate-300 dark:border-slate-700 print:border-black px-3 py-2">
                    Odak Konuları & Kazanımlar
                  </th>
                  <th className="border border-slate-300 dark:border-slate-700 print:border-black px-3 py-2 w-28 text-center">
                    Soru Hedefi
                  </th>
                  <th className="border border-slate-300 dark:border-slate-700 print:border-black px-3 py-2 w-32 text-center">
                    Pomodoro (25 Dk)
                  </th>
                  <th className="border border-slate-300 dark:border-slate-700 print:border-black px-3 py-2 w-24 text-center">
                    Çözülen
                  </th>
                  <th className="border border-slate-300 dark:border-slate-700 print:border-black px-3 py-2 w-36">
                    Öğrenci Notu / Telafi
                  </th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((day, idx) => (
                  <tr
                    key={day.dayName}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 print:hover:bg-transparent"
                  >
                    {/* Gün Adı */}
                    <td className="border border-slate-300 dark:border-slate-700 print:border-black px-3 py-3 font-bold text-center bg-slate-50/60 dark:bg-slate-800/40 print:bg-transparent">
                      <div>{day.dayName}</div>
                      <span className="text-[10px] font-normal text-slate-400 print:text-slate-500">
                        {idx + 1}. Gün
                      </span>
                    </td>

                    {/* Odak Konuları (Ekranda düzenlenebilir, baskıda temiz metin) */}
                    <td className="border border-slate-300 dark:border-slate-700 print:border-black px-3 py-2">
                      <div className="print:hidden">
                        <input
                          type="text"
                          value={day.focusTopics}
                          onChange={(e) => handleDayChange(idx, 'focusTopics', e.target.value)}
                          className="w-full rounded border border-transparent hover:border-slate-200 dark:hover:border-white/10 bg-transparent px-1.5 py-1 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none"
                        />
                        <input
                          type="text"
                          value={day.note}
                          onChange={(e) => handleDayChange(idx, 'note', e.target.value)}
                          className="w-full text-[11px] text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 bg-transparent px-1.5 py-0.5 rounded border border-transparent hover:border-slate-200 dark:hover:border-white/10 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none"
                        />
                      </div>
                      <div className="hidden print:block">
                        <p className="font-bold text-black">{day.focusTopics}</p>
                        {day.note && <p className="text-[10px] text-slate-600 mt-0.5 italic">{day.note}</p>}
                      </div>
                    </td>

                    {/* Soru Hedefi */}
                    <td className="border border-slate-300 dark:border-slate-700 print:border-black px-3 py-2 text-center">
                      <div className="print:hidden flex items-center justify-center gap-1">
                        <input
                          type="number"
                          min="0"
                          max="300"
                          value={day.targetQuestions}
                          onChange={(e) => handleDayChange(idx, 'targetQuestions', Number(e.target.value) || 0)}
                          className="w-14 rounded border border-slate-200 dark:border-white/10 bg-transparent px-1 py-1 text-center text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        <span className="text-[11px] text-slate-400">soru</span>
                      </div>
                      <div className="hidden print:block font-bold text-black">
                        {day.targetQuestions} soru
                      </div>
                    </td>

                    {/* Pomodoro Çemberleri (Kalemle işaretlenebilir kutucuklar) */}
                    <td className="border border-slate-300 dark:border-slate-700 print:border-black px-3 py-2 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {Array.from({ length: Math.max(2, Math.min(6, day.pomodoroCount)) }).map((_, pIdx) => (
                          <span
                            key={pIdx}
                            className="inline-block h-4 w-4 rounded-full border-2 border-slate-400 print:border-black bg-transparent"
                            title="Tamamlayınca kalemle içini karala"
                          />
                        ))}
                      </div>
                    </td>

                    {/* Çözülen Soru (Boş doldurma kutusu) */}
                    <td className="border border-slate-300 dark:border-slate-700 print:border-black px-3 py-2 text-center">
                      <div className="h-6 w-full rounded border border-dashed border-slate-300 dark:border-slate-600 print:border-black flex items-center justify-center text-[10px] text-slate-300 print:text-slate-400">
                        [ _____ ]
                      </div>
                    </td>

                    {/* Öğrenci Notu / İmzası */}
                    <td className="border border-slate-300 dark:border-slate-700 print:border-black px-3 py-2">
                      <div className="h-6 w-full border-b border-dotted border-slate-300 dark:border-slate-700 print:border-black" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Hafta Sonu Değerlendirme & Hata Analizi Kutusu (A4 alt alan) */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-300 dark:border-slate-700 print:border-black p-3 text-xs">
              <h4 className="font-bold text-slate-900 print:text-black flex items-center gap-1.5">
                <CheckSquare className="h-4 w-4 text-emerald-600 print:text-black" />
                Haftalık Netice & Kazanım Değerlendirmesi:
              </h4>
              <p className="mt-2 text-[11px] text-slate-500 print:text-slate-600 leading-relaxed">
                Toplam Çözülen: [ _______ ] Soru • Hedefe Ulaşma Oranı: % [ _______ ]<br />
                En Çok Gelişim Gösterdiğim Konu: _____________________________________<br />
                Gelecek Hafta Tekrar Edilecek Konu: __________________________________
              </p>
            </div>

            <div className="rounded-xl border border-slate-300 dark:border-slate-700 print:border-black p-3 text-xs">
              <h4 className="font-bold text-slate-900 print:text-black flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-500 print:text-black" />
                Uğur Hoca Masabaşı Çalışma Hatırlatması:
              </h4>
              <ul className="mt-1.5 list-disc list-inside space-y-1 text-[11px] text-slate-600 print:text-slate-700 leading-relaxed">
                <li>Her gün masaya oturmadan önce 1 bardak su al, telefon bildirimlerini kapat.</li>
                <li>Hata yaptığın soruları kesip masana yapıştır veya Hata Defterine ekle.</li>
                <li>Yapamadığın soruyu hemen geçme; 2 dakika boyunca ipuçlarını kurcala.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
