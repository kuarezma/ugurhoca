'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Send, Users, X, AlertCircle, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/components/Toast';
import type { AdminUser } from '@/features/admin/types';

interface AdminBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: AdminUser[];
}

const GRADE_OPTIONS = [
  { label: 'Tüm Sınıflar (Genel Duyuru)', value: 'all' },
  { label: '5. Sınıf', value: '5' },
  { label: '6. Sınıf', value: '6' },
  { label: '7. Sınıf', value: '7' },
  { label: '8. Sınıf (LGS Grubu)', value: '8' },
  { label: 'Mezun Grubu', value: 'Mezun' },
];

export const AdminBroadcastModal: React.FC<AdminBroadcastModalProps> = ({
  isOpen,
  onClose,
  students,
}) => {
  const { showToast } = useToast();
  const [targetGrade, setTargetGrade] = useState<string>('all');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const recipientCount = useMemo(() => {
    if (!students || students.length === 0) return 0;
    if (targetGrade === 'all') return students.length;
    return students.filter(
      (s) => String(s.grade).trim().toLowerCase() === targetGrade.toLowerCase(),
    ).length;
  }, [students, targetGrade]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedTitle = title.trim();
    const trimmedMessage = message.trim();

    if (!trimmedTitle) {
      setErrorMsg('Lütfen bildirim başlığı girin.');
      return;
    }

    if (!trimmedMessage) {
      setErrorMsg('Lütfen bildirim mesajı girin.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin-broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target_grade: targetGrade,
          title: trimmedTitle,
          message: trimmedMessage,
          link_url: linkUrl.trim() || undefined,
          image_url: imageUrl.trim() || undefined,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        const message = result?.error?.message || result?.message || 'Toplu bildirim gönderilemedi.';
        throw new Error(message);
      }

      const count = result?.data?.recipient_count ?? recipientCount;
      showToast('success', `${count} öğrenciye toplu bildirim başarıyla iletildi.`);
      setTitle('');
      setMessage('');
      setLinkUrl('');
      setImageUrl('');
      setTargetGrade('all');
      onClose();
    } catch (err: unknown) {
      const errorText = err instanceof Error ? err.message : 'Toplu bildirim gönderilirken bir hata oluştu.';
      setErrorMsg(errorText);
      showToast('error', errorText);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="broadcast-modal-title"
        className="relative z-10 w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 id="broadcast-modal-title" className="text-lg font-bold text-white">
                Sınıfa Özel Toplu Bildirim
              </h3>
              <p className="text-xs text-slate-400">
                Seçtiğiniz kademedeki tüm öğrencilere anlık bildirim gönderin
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Grade Selector & Recipient Badge */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="broadcast-target-grade" className="text-xs font-semibold text-slate-300">
                Hedef Kitle / Sınıf
              </label>
              <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                <Users className="w-3.5 h-3.5" />
                <span>
                  <strong>{recipientCount}</strong> Öğrenciye Ulaşacak
                </span>
              </div>
            </div>
            <select
              id="broadcast-target-grade"
              value={targetGrade}
              onChange={(e) => setTargetGrade(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              {GRADE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label htmlFor="broadcast-title" className="text-xs font-semibold text-slate-300">
              Bildirim Başlığı <span className="text-rose-400">*</span>
            </label>
            <input
              id="broadcast-title"
              type="text"
              required
              maxLength={120}
              placeholder="Örn: 8. Sınıf Haftalık Deneme Sınavı Yayında!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Message Content */}
          <div className="space-y-1.5">
            <label htmlFor="broadcast-message" className="text-xs font-semibold text-slate-300">
              Bildirim Metni <span className="text-rose-400">*</span>
            </label>
            <textarea
              id="broadcast-message"
              required
              rows={4}
              maxLength={1000}
              placeholder="Öğrencilerin bildirim kutusunda göreceği mesaj metni..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Optional Links / Image */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label htmlFor="broadcast-link" className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                <LinkIcon className="w-3.5 h-3.5" />
                Yönlendirme Linki (İsteğe Bağlı)
              </label>
              <input
                id="broadcast-link"
                type="text"
                placeholder="/testler veya https://..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="broadcast-image" className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                <ImageIcon className="w-3.5 h-3.5" />
                Görsel Linki (İsteğe Bağlı)
              </label>
              <input
                id="broadcast-image"
                type="text"
                placeholder="https://... görsel URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !message.trim()}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-98 rounded-xl transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Gönderiliyor...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Bildirimi Gönder</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
