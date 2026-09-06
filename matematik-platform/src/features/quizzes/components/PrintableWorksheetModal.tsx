'use client';

import { useState, useId, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccessibleModal } from '@/hooks/useAccessibleModal';
import {
  X,
  Printer,
  FileDown,
  Eye,
  EyeOff,
  Maximize2,
  QrCode,
  Lock,
} from 'lucide-react';
import MathText from '@/components/MathText';
import type { Quiz, QuizQuestion } from '@/types/quiz';
import { generateQRCodeSVG } from '@/lib/qr-generator';

export type WorkspaceMode = 'compact' | 'standard' | 'large' | 'grid';

type PrintableWorksheetModalProps = {
  isOpen: boolean;
  onClose: () => void;
  quiz: Quiz | null;
  questions: QuizQuestion[];
  isLight?: boolean;
};

export function PrintableWorksheetModal({
  isOpen,
  onClose,
  quiz,
  questions,
  isLight: _isLight = false,
}: PrintableWorksheetModalProps) {
  const titleId = useId();
  const modalRef = useAccessibleModal<HTMLDivElement>(isOpen, onClose);
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>('standard');
  const [showQRCode, setShowQRCode] = useState(true);
  const [unlockSchedule, setUnlockSchedule] = useState<'instant' | 'after_class' | 'next_day' | 'locked'>('instant');

  const qrSvgString = useMemo(() => {
    if (!quiz) return '';
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://www.ugurhoca.com';
    const targetUrl = `${baseUrl}/testler?quizId=${encodeURIComponent(quiz.id)}&qr=1`;
    return generateQRCodeSVG(targetUrl, { size: 68, color: '#0f172a' });
  }, [quiz]);

  const unlockLabel = {
    instant: 'Hemen Açık',
    after_class: 'Ders Bitimi (17:00)',
    next_day: 'Yarın Sabah (09:00)',
    locked: 'Öğretmen Kilitli',
  }[unlockSchedule];

  if (!isOpen || !quiz) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const { generatePDF } = await import('@/lib/pdf-export');
      const filename = `${quiz.title.toLowerCase().replace(/[^a-z0-9]/gi, '_')}_yaprak_test.pdf`;
      await generatePDF('printable-worksheet-content', filename, {
        background: '#ffffff',
        scale: 2,
        orientation: 'portrait',
      });
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[170] flex items-center justify-center p-2 sm:p-5 overflow-y-auto print:p-0 print:m-0 print:static">
        {/* Karartma (Print esnasında gizlenir) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md print:hidden"
          aria-hidden="true"
        />

        {/* Modal Kapsayıcı */}
        <motion.div
          ref={modalRef}
          tabIndex={-1}
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          role="dialog"
          aria-labelledby={titleId}
          aria-modal="true"
          className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 shadow-2xl z-10 my-auto print:border-none print:shadow-none print:w-full print:max-w-none print:rounded-none print:bg-white"
        >
          {/* Üst Eylem Çubuğu (Print esnasında gizlenir) */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-slate-950/80 px-5 py-3.5 print:hidden">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                <Printer className="h-5 w-5" />
              </div>
              <div>
                <h2 id={titleId} className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Yazdırılabilir A4 Yaprak Test Önizleme
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Sınıfta dağıtmak veya kağıt üzerinde çözmek için hazır A4 formatı.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800">
                <Maximize2 className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                <span className="hidden sm:inline text-[11px] text-slate-400">Çözüm Alanı:</span>
                <select
                  value={workspaceMode}
                  onChange={(e) => setWorkspaceMode(e.target.value as WorkspaceMode)}
                  className="bg-transparent border-none text-xs font-semibold focus:outline-none cursor-pointer"
                  title="Soruların altına eklenecek işlem alanı boyutu"
                >
                  <option value="compact">Kompakt (Az Boşluk)</option>
                  <option value="standard">Standart Alan</option>
                  <option value="large">Geniş Alan</option>
                  <option value="grid">Kareli Defter</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => setShowQRCode((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                  showQRCode
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <QrCode className="h-3.5 w-3.5" />
                <span>{showQRCode ? 'QR Kod Açık' : 'QR Kod Gizli'}</span>
              </button>

              <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800">
                <Lock className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                <span className="hidden sm:inline text-[11px] text-slate-400">Çözüm Erişimi:</span>
                <select
                  value={unlockSchedule}
                  onChange={(e) => setUnlockSchedule(e.target.value as 'instant' | 'after_class' | 'next_day' | 'locked')}
                  className="bg-transparent border-none text-xs font-semibold focus:outline-none cursor-pointer"
                  title="Öğrenciler QR kodu okuttuğunda çözümlerin açılma zamanı"
                >
                  <option value="instant">Hemen Açık</option>
                  <option value="after_class">Ders Sonrası (17:00)</option>
                  <option value="next_day">Yarın Sabah (09:00)</option>
                  <option value="locked">Öğretmen Kilitli</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => setShowAnswerKey((prev) => !prev)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition"
              >
                {showAnswerKey ? <EyeOff className="h-3.5 w-3.5 text-amber-500" /> : <Eye className="h-3.5 w-3.5 text-amber-500" />}
                <span>{showAnswerKey ? 'Cevap Anahtarını Gizle' : 'Cevap Anahtarını Ekle'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white px-3.5 py-1.5 text-xs font-bold shadow transition active:scale-95"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Yazdır (A4)</span>
              </button>

              <button
                type="button"
                onClick={handleExportPDF}
                disabled={isExporting}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:brightness-110 text-white px-3.5 py-1.5 text-xs font-bold shadow-md transition active:scale-95 disabled:opacity-50"
              >
                <FileDown className="h-3.5 w-3.5" />
                <span>{isExporting ? 'Oluşturuluyor...' : 'PDF İndir'}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="rounded-xl p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
                aria-label="Kapat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Yazdırılabilir Sayfa İçeriği (Beyaz Zemin, A4 Baskı Uyumlu) */}
          <div className="max-h-[80vh] overflow-y-auto p-4 sm:p-8 bg-slate-100 dark:bg-slate-950/40 print:max-h-none print:p-0 print:bg-white">
            <div
              id="printable-worksheet-content"
              className="mx-auto w-full max-w-[210mm] min-h-[297mm] bg-white text-slate-900 p-8 sm:p-12 shadow-md print:shadow-none print:p-6 print:m-0 font-sans"
            >
              {/* Uğur Hoca Başlığı & Antet */}
              <div className="border-b-2 border-slate-900 pb-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-indigo-700">
                      T.C. MEB MÜFREDATINA UYUMLU
                    </span>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
                      UĞUR HOCA MATEMATİK PLATFORMU
                    </h1>
                    <p className="text-xs font-semibold text-slate-600">
                      {quiz.title} • {questions.length} Soru
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {showQRCode && (
                      <div className="flex items-center gap-2 border border-slate-300 rounded-xl p-1.5 bg-slate-50 print:bg-white">
                        <div
                          className="shrink-0 leading-none"
                          dangerouslySetInnerHTML={{ __html: qrSvgString }}
                          aria-label="Test dijital çözüm QR kodu"
                        />
                        <div className="text-[10px] text-left max-w-[105px] leading-tight">
                          <strong className="block font-bold text-slate-900">📱 Çözüm & İpucu</strong>
                          <span className="text-slate-500 text-[9px] block mt-0.5">Kameranla tara, çözümlere ulaş</span>
                          <div className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded font-semibold text-[8.5px]">
                            <Lock className="w-2.5 h-2.5 shrink-0" />
                            <span>{unlockLabel}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="text-right">
                      <span className="inline-block rounded border border-slate-900 px-2 py-0.5 text-xs font-bold uppercase tracking-wider">
                        YAPRAK TEST
                      </span>
                      <p className="text-[11px] text-slate-500 mt-1 font-mono">ugurhoca.com</p>
                    </div>
                  </div>
                </div>

                {/* Öğrenci Bilgi Alanı */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-dashed border-slate-300 text-xs">
                  <div>
                    <span className="font-bold text-slate-700">Adı Soyadı:</span>{' '}
                    <span className="inline-block border-b border-dotted border-slate-500 w-24"></span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700">Sınıf / No:</span>{' '}
                    <span className="inline-block border-b border-dotted border-slate-500 w-16"></span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700">Tarih:</span>{' '}
                    <span className="inline-block border-b border-dotted border-slate-500 w-16"></span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700">Puan:</span>{' '}
                    <span className="inline-block border-b border-dotted border-slate-500 w-12 font-bold text-slate-900">/ 100</span>
                  </div>
                </div>
              </div>

              {/* Sorular Alanı (2 Sütunlu Sayfa Düzeni) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {questions.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className="flex flex-col justify-between border-b border-dashed border-slate-200 pb-4 text-xs leading-relaxed"
                  >
                    <div>
                      <div className="flex items-start gap-1.5 font-semibold text-slate-900 mb-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white text-[11px] font-bold">
                          {idx + 1}
                        </span>
                        <div className="flex-1 font-medium text-slate-900">
                          <MathText>{q.question}</MathText>
                        </div>
                      </div>

                      {/* Şıklar */}
                      <div className="space-y-1.5 pl-6 mt-2">
                        {q.options.map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2 text-slate-800">
                            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-slate-500 text-[10px] font-bold">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <div className="flex-1">
                              <MathText>{opt}</MathText>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Soru Çözüm Boşluğu */}
                    {workspaceMode === 'compact' && <div className="h-6 mt-2" />}
                    {workspaceMode === 'standard' && (
                      <div className="h-16 mt-2.5 rounded-lg border border-dashed border-slate-300 bg-slate-50/50 p-1 flex items-start">
                        <span className="text-[9px] text-slate-400 font-mono select-none">Çözüm Alanı</span>
                      </div>
                    )}
                    {workspaceMode === 'large' && (
                      <div className="h-28 mt-2.5 rounded-lg border border-dashed border-slate-300 bg-slate-50/50 p-1 flex items-start">
                        <span className="text-[9px] text-slate-400 font-mono select-none">Geniş Çözüm Alanı</span>
                      </div>
                    )}
                    {workspaceMode === 'grid' && (
                      <div className="h-24 mt-2.5 rounded-lg border border-dashed border-slate-300 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:10px_10px] p-1 flex items-start">
                        <span className="text-[9px] text-slate-400 font-mono select-none bg-white px-1 rounded">Kareli İşlem Alanı</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Cevap Anahtarı Şeridi */}
              {showAnswerKey && (
                <div className="mt-8 rounded-xl border border-slate-900 p-4 bg-slate-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      Cevap Anahtarı
                    </span>
                    <span className="text-[10px] text-slate-500">Uğur Hoca Matematik</span>
                  </div>
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 text-xs font-mono text-center">
                    {questions.map((q, idx) => (
                      <div key={idx} className="rounded border border-slate-300 bg-white py-1">
                        <span className="text-slate-500 text-[10px] block">{idx + 1}</span>
                        <strong className="text-indigo-700 font-bold text-sm">
                          {String.fromCharCode(65 + (q.correct_index ?? 0))}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sayfa Altı Notu */}
              <div className="mt-8 pt-3 border-t border-slate-300 text-center text-[10px] text-slate-500 flex justify-between items-center">
                <span>Başarı, sabır ve düzenli tekrarla gelir.</span>
                <span>www.ugurhoca.com</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
