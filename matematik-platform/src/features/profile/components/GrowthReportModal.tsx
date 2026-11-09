'use client';

import { useState, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Share2,
  Copy,
  Check,
  Download,
  Award,
  Flame,
  Target,
  FileSpreadsheet,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { useToast } from '@/components/Toast';
import { useAccessibleModal } from '@/hooks/useAccessibleModal';

export type GrowthReportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  studentGrade: string | number;
  streakCount: number;
  progressPercent: number;
  totalQuizzesSolved?: number;
  averageScore?: number | null;
  strongTopic?: string | null;
  focusTopic?: string | null;
};

export function GrowthReportModal({
  isOpen,
  onClose,
  studentName,
  studentGrade,
  streakCount,
  progressPercent,
  totalQuizzesSolved = 0,
  averageScore = null,
  strongTopic = null,
  focusTopic = null,
}: GrowthReportModalProps) {
  const titleId = useId();
  const modalRef = useAccessibleModal<HTMLDivElement>(isOpen, onClose);
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  if (!isOpen) return null;

  const todayStr = new Date().toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const whatsappMessage = [
    '📚 *UĞUR HOCA MATEMATİK PLATFORMU — HAFTALIK GELİŞİM RAPORU*',
    '',
    `👤 *Öğrenci:* ${studentName} (${studentGrade}. Sınıf)`,
    `📅 *Tarih:* ${todayStr}`,
    '',
    `🎯 *Haftalık Hedef Tamamlama:* %${progressPercent}`,
    `🔥 *Kesintisiz Çalışma Serisi:* ${streakCount} Gün`,
    totalQuizzesSolved > 0 ? `📝 *Çözülen Test:* ${totalQuizzesSolved} Adet` : '',
    averageScore !== null ? `⭐ *Ortalama Başarı:* %${averageScore}` : '',
    strongTopic ? `💪 *En Güçlü Konu:* ${strongTopic}` : '',
    focusTopic ? `🎯 *Gelişim Alanı:* ${focusTopic}` : '',
    '',
    '🔗 https://ugurhoca.com',
  ]
    .filter(Boolean)
    .join('\n');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(whatsappMessage);
      setCopied(false);
      setCopied(true);
      showToast('success', 'Gelişim raporu metni kopyalandı!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast('error', 'Metin kopyalanamadı.');
    }
  };

  const handleOpenWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadPdf = async () => {
    setIsExportingPdf(true);
    try {
      const { generatePDF } = await import('@/lib/pdf-export');
      await generatePDF(
        'pdf-report-container',
        `${studentName.replace(/\s+/g, '_')}_Gelisim_Raporu_${new Date().toISOString().split('T')[0]}.pdf`,
      );
      showToast('success', 'PDF başarıyla indirildi!');
    } catch {
      showToast('error', 'PDF oluşturulurken bir hata oluştu.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-2xl z-10"
        >
          {/* Header Banner */}
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-6 text-white dark:text-white">
            <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 blur-xl pointer-events-none" />
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md border border-white/20">
                  <FileSpreadsheet className="h-5 w-5 text-indigo-200" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">
                    Öğrenci Karnesi
                  </span>
                  <h3 id={titleId} className="text-lg font-black tracking-tight flex items-center gap-1.5">
                    Haftalık Gelişim Raporu
                    <Sparkles className="h-4 w-4 text-amber-300 fill-amber-300" />
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
                aria-label="Kapat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Student ID Badge */}
            <div className="mt-4 flex items-center gap-3 bg-white/10 rounded-2xl p-3 border border-white/10">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-700 font-black text-sm shadow-sm">
                {studentName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm truncate">{studentName}</h4>
                <p className="text-xs text-indigo-100 flex items-center gap-1">
                  <span>{studentGrade}. Sınıf Öğrencisi</span>
                  <span>•</span>
                  <span>{todayStr}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6">
            <div id="pdf-report-container" className="mb-6">
              {/* Core Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4 text-center">
                  <Target className="h-5 w-5 text-accent-success-ink dark:text-emerald-400 mx-auto mb-1.5" />
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Hedef Tamamlama</p>
                  <p className="text-2xl font-black text-accent-success-ink dark:text-emerald-400">%{progressPercent}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4 text-center">
                  <Flame className="h-5 w-5 text-amber-600 dark:text-amber-400 mx-auto mb-1.5" />
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Çalışma Serisi</p>
                  <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{streakCount} Gün</p>
                </div>
                <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4 text-center">
                  <GraduationCap className="h-5 w-5 text-cyan-600 dark:text-cyan-400 mx-auto mb-1.5" />
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Çözülen Test</p>
                  <p className="text-2xl font-black text-cyan-600 dark:text-cyan-400">{totalQuizzesSolved}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4 text-center">
                  <Award className="h-5 w-5 text-purple-600 dark:text-purple-400 mx-auto mb-1.5" />
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Ortalama Başarı</p>
                  <p className="text-2xl font-black text-purple-600 dark:text-purple-400">{averageScore !== null ? `%${averageScore}` : 'Düzenli'}</p>
                </div>
              </div>

              {/* Topic Highlights */}
              {(strongTopic || focusTopic) && (
                <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50/70 dark:bg-white/[0.03] p-4 space-y-2 text-xs">
                  {strongTopic && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">💪 En Başarılı Konu:</span>
                      <span className="font-bold text-accent-success-ink dark:text-emerald-300">{strongTopic}</span>
                    </div>
                  )}
                  {focusTopic && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">🎯 Pekiştirilecek Alan:</span>
                      <span className="font-bold text-amber-600 dark:text-amber-300">{focusTopic}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Actions Panel */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition-all active:scale-95 bg-brand-primary hover:bg-brand-primary-soft text-slate-950 dark:text-slate-950 shadow-btn-3d-green active:translate-y-1 active:shadow-none"
              >
                <Share2 className="h-4 w-4" />
                <span>WhatsApp ile İlet</span>
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 transition-all active:scale-95"
              >
                {copied ? <Check className="h-4 w-4 text-accent-success-ink dark:text-emerald-400" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? 'Kopyalandı!' : 'Metni Kopyala'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isExportingPdf}
                className="flex items-center justify-center gap-2 rounded-2xl border border-purple-500/30 bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:hover:bg-purple-500/25 dark:text-purple-200 px-4 py-3 text-sm font-semibold transition-all active:scale-95 disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                <span>{isExportingPdf ? 'Hazırlanıyor...' : 'A4 PDF İndir'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default GrowthReportModal;
