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
import { generatePDF } from '@/lib/pdf-export';

export type ParentReportModalProps = {
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

export default function ParentReportModal({
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
}: ParentReportModalProps) {
  const titleId = useId();
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
    '🌟 *Öğretmen Değerlendirmesi:*',
    'Öğrencimiz bu hafta matematik çalışmalarında harika bir disiplin gösterdi. Düzenli soru çözümü ve konu tekrarlarıyla başarısını pekiştiriyor. Tebrikler! 👏',
    '',
    '🔗 https://ugurhoca.com',
  ]
    .filter(Boolean)
    .join('\n');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(whatsappMessage);
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
      await generatePDF(
        'parent-report-card',
        `Ugur-Hoca-Gelisim-Raporu-${studentName.replace(/\s+/g, '-')}.pdf`,
        { background: '#090d16', scale: 2 }
      );
      showToast('success', 'Gelişim karnesi PDF dosyası hazırlandı!');
    } catch {
      showToast('error', 'PDF oluşturulurken bir sorun oluştu.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
          onClick={onClose}
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-slate-950/60">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <h2 id={titleId} className="text-base sm:text-lg font-bold text-white">
                  Haftalık Gelişim Raporu & Karne
                </h2>
                <p className="text-xs text-slate-400">
                  Öğrencinin haftalık başarı karnesini WhatsApp ile paylaş veya PDF indir.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Kapat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {/* Printable Preview Card */}
            <div
              id="parent-report-card"
              className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-8 text-white shadow-xl"
            >
              {/* Report Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 mb-2">
                    <Sparkles className="h-3.5 w-3.5" />
                    Uğur Hoca Matematik
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    Haftalık Gelişim Karnesi
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{todayStr}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-base sm:text-lg font-bold text-white">{studentName}</p>
                  <p className="text-xs font-semibold text-emerald-400">{studentGrade}. Sınıf Öğrencisi</p>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 my-6">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                  <Target className="h-5 w-5 text-emerald-400 mx-auto mb-1.5" />
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Hedef Tamamlama</p>
                  <p className="text-2xl font-black text-emerald-400">%{progressPercent}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                  <Flame className="h-5 w-5 text-amber-400 mx-auto mb-1.5" />
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Çalışma Serisi</p>
                  <p className="text-2xl font-black text-amber-400">{streakCount} Gün</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                  <GraduationCap className="h-5 w-5 text-cyan-400 mx-auto mb-1.5" />
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Çözülen Test</p>
                  <p className="text-2xl font-black text-cyan-400">{totalQuizzesSolved}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                  <Award className="h-5 w-5 text-purple-400 mx-auto mb-1.5" />
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Ortalama Başarı</p>
                  <p className="text-2xl font-black text-purple-400">{averageScore !== null ? `%${averageScore}` : 'Düzenli'}</p>
                </div>
              </div>

              {/* Topic Highlights */}
              {(strongTopic || focusTopic) && (
                <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 mb-5 space-y-2 text-xs">
                  {strongTopic && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">💪 En Başarılı Konu:</span>
                      <span className="font-bold text-emerald-300">{strongTopic}</span>
                    </div>
                  )}
                  {focusTopic && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">🎯 Pekiştirilecek Alan:</span>
                      <span className="font-bold text-amber-300">{focusTopic}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Teacher Note */}
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                <p className="text-xs font-semibold text-emerald-200 leading-relaxed">
                  💬 <strong className="text-white font-bold">Öğretmen Notu:</strong> Öğrencimiz bu hafta gösterdiği istikrarlı çalışma disiplini ve gayreti ile tebrikleri hak ediyor. Başarılarının devamını dilerim!
                </p>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 px-4 py-3 text-sm font-bold text-white transition-all active:scale-95 shadow-lg shadow-emerald-600/20"
              >
                <Share2 className="h-4 w-4" />
                <span>WhatsApp ile İlet</span>
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-3 text-sm font-semibold text-slate-200 transition-all active:scale-95"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? 'Kopyalandı!' : 'Metni Kopyala'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isExportingPdf}
                className="flex items-center justify-center gap-2 rounded-2xl border border-purple-500/30 bg-purple-500/15 hover:bg-purple-500/25 px-4 py-3 text-sm font-semibold text-purple-200 transition-all active:scale-95 disabled:opacity-50"
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

export const StudentReportModal = ParentReportModal;

