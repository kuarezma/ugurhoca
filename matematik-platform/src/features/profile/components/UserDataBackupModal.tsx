'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  Database,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import {
  downloadUserDataBackupFile,
  importUserDataBackup,
} from '@/lib/userDataBackup';

interface UserDataBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLight?: boolean;
}

export function UserDataBackupModal({
  isOpen,
  onClose,
  isLight = false,
}: UserDataBackupModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
    stats?: { dailyStreak: number; mistakesCount: number; topicsCount: number };
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    try {
      downloadUserDataBackupFile();
      setFeedback({
        type: 'success',
        message: 'Yedekleme dosyanız başarıyla indirildi (.json).',
      });
    } catch {
      setFeedback({
        type: 'error',
        message: 'Yedek dosyası indirilirken bir hata oluştu.',
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setFeedback(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = importUserDataBackup(content);
      setIsProcessing(false);

      if (result.success) {
        setFeedback({
          type: 'success',
          message: result.message,
          stats: result.stats,
        });
      } else {
        setFeedback({
          type: 'error',
          message: result.message,
        });
      }
    };

    reader.onerror = () => {
      setIsProcessing(false);
      setFeedback({
        type: 'error',
        message: 'Dosya okunurken bir hata oluştu.',
      });
    };

    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Veri Yedekleme ve Cihaz Aktarımı"
      className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-fade-in"
    >
      <div
        className={`w-full max-w-lg rounded-3xl border shadow-2xl p-6 transition-all ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900'
            : 'bg-slate-900 border-white/15 text-white'
        }`}
      >
        {/* Başlık */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg">Veri Yedekleme & Aktarım</h3>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Cihazlar arası çalışma verilerini güvenle taşı veya yedekle.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Pencereyi kapat"
            className="rounded-xl p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Bilgi Kutusu */}
        <div
          className={`flex items-start gap-2.5 p-3.5 rounded-2xl text-xs mb-5 ${
            isLight
              ? 'bg-indigo-50 border border-indigo-100 text-indigo-900'
              : 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-300'
          }`}
        >
          <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
          <span>
            Yedekleme dosyası; <strong>çözülen sorularını</strong>, <strong>günlük seri (streak)</strong> geçmişini,
            <strong>hata defteri bankanı</strong> ve <strong>konu takip listeni</strong> içerir. Verileriniz tamamen sizin cihazınızda kalır.
          </span>
        </div>

        {/* Geri Bildirim Bildirimi */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl mb-5 flex items-start gap-3 text-xs ${
              feedback.type === 'success'
                ? isLight
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                  : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                : isLight
                ? 'bg-rose-50 border border-rose-200 text-rose-900'
                : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
            )}
            <div className="flex-1">
              <p className="font-semibold">{feedback.message}</p>
              {feedback.stats && (
                <div className="mt-2 space-y-1 text-[11px] opacity-90">
                  <div>🔥 Günlük Seri: <strong>{feedback.stats.dailyStreak} gün</strong></div>
                  <div>📓 Hata Defteri: <strong>{feedback.stats.mistakesCount} soru</strong></div>
                  <div>✅ Tamamlanan Konu: <strong>{feedback.stats.topicsCount} kazanım</strong></div>
                </div>
              )}
              {feedback.type === 'success' && feedback.stats && (
                <button
                  type="button"
                  onClick={handleReload}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition shadow"
                >
                  <RefreshCw className="h-3 w-3" />
                  Sayfayı Yenile
                </button>
              )}
            </div>
          </div>
        )}

        {/* Eylem Kartları */}
        <div className="grid sm:grid-cols-2 gap-3.5">
          {/* Dışa Aktar */}
          <div
            className={`p-4 rounded-2xl border flex flex-col justify-between ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'
            }`}
          >
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Download className="h-4 w-4 text-purple-400" />
                <h4 className="font-bold text-sm">Verileri İndir</h4>
              </div>
              <p className={`text-xs mb-4 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Tüm ilerlemeni içeren <code>.json</code> dosyasını bilgisayarına veya telefonuna kaydet.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExport}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-500 text-white transition flex items-center justify-center gap-2 shadow"
            >
              <Download className="h-3.5 w-3.5" />
              Yedeği İndir (.json)
            </button>
          </div>

          {/* İçe Aktar */}
          <div
            className={`p-4 rounded-2xl border flex flex-col justify-between ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'
            }`}
          >
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Upload className="h-4 w-4 text-indigo-400" />
                <h4 className="font-bold text-sm">Yedekten Yükle</h4>
              </div>
              <p className={`text-xs mb-4 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Daha önce indirdiğin <code>.json</code> dosyasını seçerek verilerini bu cihaza aktar.
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileChange}
            />

            <button
              type="button"
              disabled={isProcessing}
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition flex items-center justify-center gap-2 shadow"
            >
              <Upload className="h-3.5 w-3.5" />
              {isProcessing ? 'İşleniyor...' : 'Dosya Seç & Yükle'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDataBackupModal;
