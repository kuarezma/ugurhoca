'use client';

import React, { useState } from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';
import { useAccessibleModal } from '@/hooks/useAccessibleModal';
import { supabase } from '@/lib/supabase/client';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
}

export function DeleteAccountModal({
  isOpen,
  onClose,
  userEmail,
}: DeleteAccountModalProps) {
  const containerRef = useAccessibleModal<HTMLDivElement>(isOpen, onClose);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isConfirmed = confirmText.trim().toUpperCase() === 'HESABIMI SİL';

  const handleDelete = async () => {
    if (!isConfirmed || isDeleting) return;

    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const token = session?.access_token;
      if (!token) {
        throw new Error('Oturum bulunamadı. Lütfen tekrar giriş yapın.');
      }

      const res = await fetch('/api/user/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Hesap silinirken bir sorun oluştu.');
      }

      // Yerel oturum ve verileri temizle
      await supabase.auth.signOut();
      try {
        localStorage.clear();
      } catch {
        // ignore
      }

      window.location.href = '/?deleted=true';
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Bir hata oluştu.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-fade-in">
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        aria-labelledby="delete-account-title"
        className="w-full max-w-md rounded-3xl border border-rose-500/30 bg-slate-900 p-6 text-white shadow-2xl outline-none"
      >
        {/* Başlık */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 id="delete-account-title" className="font-display font-bold text-lg text-white">
                Hesabımı Kalıcı Olarak Sil
              </h3>
              <p className="text-xs text-rose-300">Bu işlem geri alınamaz (KVKK)</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            aria-label="Pencereyi kapat"
            className="rounded-xl p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Uyarı Açıklaması */}
        <div className="text-xs text-slate-300 space-y-2 mb-5 leading-relaxed bg-rose-500/10 p-3.5 rounded-2xl border border-rose-500/20">
          <p>
            Hesabınızı sildiğinizde <strong>tüm sınav geçmişiniz, çözülen testler, hata defteri, rozetler ve çalışma verileriniz</strong> geri getirilemeyecek şekilde kalıcı olarak silinecektir.
          </p>
          {userEmail && (
            <p className="text-[11px] text-slate-400">
              İlişkili hesap: <span className="text-white font-mono">{userEmail}</span>
            </p>
          )}
        </div>

        {/* Güvenlik Doğrulaması */}
        <div className="mb-5">
          <label htmlFor="confirm-delete-input" className="block text-xs font-bold text-slate-300 mb-2">
            Onaylamak için aşağıdaki kutuya <span className="text-rose-400 font-mono">HESABIMI SİL</span> yazın:
          </label>
          <input
            id="confirm-delete-input"
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            disabled={isDeleting}
            placeholder="HESABIMI SİL"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-rose-500 transition placeholder:text-slate-600"
          />
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-medium">
            {errorMessage}
          </div>
        )}

        {/* Eylemler */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-2.5 px-4 rounded-xl border border-white/10 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={!isConfirmed || isDeleting}
            className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-rose-600/20"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Siliniyor...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Hesabı Kalıcı Sil</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
