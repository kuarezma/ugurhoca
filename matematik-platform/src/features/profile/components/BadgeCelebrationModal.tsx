'use client';

import { useEffect, useId, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Download, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { fireConfetti } from '@/components/ConfettiBurst';
import { gameAudio } from '@/features/games/utils/gameAudio';
import { useAccessibleModal } from '@/hooks/useAccessibleModal';

export type CelebrationBadge = {
  id: string;
  name: string;
  description: string;
  requirement: string;
  gradient: string;
};

type BadgeCelebrationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  badge: CelebrationBadge | null;
  studentName?: string;
};

export function BadgeCelebrationModal({
  isOpen,
  onClose,
  badge,
  studentName = 'Öğrenci',
}: BadgeCelebrationModalProps) {
  const titleId = useId();
  const modalRef = useAccessibleModal<HTMLDivElement>(isOpen, onClose);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (isOpen && badge) {
      fireConfetti({ particleCount: 150, spread: 90 });
      gameAudio.playFanfare();
    }
  }, [isOpen, badge]);

  if (!isOpen || !badge) return null;

  const handleDownloadCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1200;
    canvas.height = 800;

    // Arka plan gradyanı
    const bgGradient = ctx.createLinearGradient(0, 0, 1200, 800);
    bgGradient.addColorStop(0, '#0f172a');
    bgGradient.addColorStop(0.5, '#1e1b4b');
    bgGradient.addColorStop(1, '#020617');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 1200, 800);

    // Çerçeve deseni
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = 6;
    ctx.strokeRect(30, 30, 1140, 740);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    ctx.strokeRect(45, 45, 1110, 710);

    // Üst Başlık
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('UĞUR HOCA MATEMATİK PLATFORMU', 600, 100);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '18px sans-serif';
    ctx.fillText('RESMİ MATEMATİK BAŞARI BELGESİ', 600, 135);

    // Rozet Alanı (Merkez Rozet Kutusu)
    const cardGrad = ctx.createLinearGradient(400, 170, 800, 370);
    cardGrad.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
    cardGrad.addColorStop(1, 'rgba(245, 158, 11, 0.15)');
    ctx.fillStyle = cardGrad;
    ctx.beginPath();
    ctx.roundRect(420, 170, 360, 200, [24]);
    ctx.fill();
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Rozet İkonu / Emoji
    ctx.font = '64px sans-serif';
    ctx.fillText('🏆', 600, 255);

    // Rozet İsmi
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 34px sans-serif';
    ctx.fillText(badge.name, 600, 320);

    // Tebrik ve Öğrenci Adı
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '22px sans-serif';
    ctx.fillText('Bu başarı rozeti,', 600, 430);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 38px sans-serif';
    ctx.fillText(studentName, 600, 480);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '20px sans-serif';
    ctx.fillText(badge.description, 600, 535);

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(`Kazanım Şartı: ${badge.requirement}`, 600, 580);

    // Alt Bilgi Şeridi
    const dateStr = new Date().toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    ctx.fillStyle = '#64748b';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Tarih: ${dateStr}`, 80, 710);

    ctx.textAlign = 'right';
    ctx.fillText('ugurhoca.com • Dijital Başarı Belgesi', 1120, 710);

    // PNG İndirme Tetikleme
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `matematik_rozet_${badge.id}.png`;
    link.href = url;
    link.click();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-md"
          aria-hidden="true"
        />

        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.85, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 24 }}
          role="dialog"
          aria-labelledby={titleId}
          aria-modal="true"
          className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-amber-500/40 bg-slate-900/95 p-6 sm:p-8 text-center text-white shadow-2xl shadow-amber-500/10 backdrop-blur-2xl z-10 my-auto"
        >
          {/* Arka plan ışıması */}
          <div className="absolute -top-20 -left-20 h-48 w-48 rounded-full bg-amber-500/20 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-48 w-48 rounded-full bg-rose-500/20 blur-3xl" />

          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
            aria-label="Kapat"
          >
            <X className="h-5 w-5" />
          </button>

          {/* İkon / Rozet Vitrini */}
          <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-600 shadow-xl shadow-amber-500/30">
            <Award className="h-12 w-12 text-white" />
            <span className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md border-2 border-slate-900">
              <CheckCircle2 className="h-5 w-5" />
            </span>
          </div>

          <div className="mt-5">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Yeni Rozet Açıldı!</span>
            </div>

            <h2 id={titleId} className="font-display text-2xl font-black text-white mt-3">
              {badge.name}
            </h2>

            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              {badge.description}
            </p>

            <div className="mt-4 inline-block rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-amber-300">
              🎯 Şart: {badge.requirement}
            </div>
          </div>

          {/* Gizli Canvas (Kart Üretimi için) */}
          <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

          {/* Eylem Düğmeleri */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleDownloadCard}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-amber-500/20 transition hover:scale-[1.02] active:scale-[0.98]"
            >
              <Download className="h-4 w-4" />
              <span>Başarı Kartını İndir (PNG)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto rounded-xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-xs font-bold text-slate-300 transition hover:bg-slate-700 active:scale-[0.98]"
            >
              Kapat
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
