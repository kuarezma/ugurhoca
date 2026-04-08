'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Loader2 } from 'lucide-react';
import { CHAT_USER_STORAGE_KEY } from '@/lib/chat-constants';

export type ChatSessionUser = {
  full_name: string;
  grade: number;
  school_number: string;
  display_name: string;
};

type Props = {
  onSuccess: (user: ChatSessionUser) => void;
};

export function ChatLogin({ onSuccess }: Props) {
  const [fullName, setFullName] = useState('');
  const [grade, setGrade] = useState('');
  const [schoolNumber, setSchoolNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGradeChange = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 2);
    setGrade(digits);
  };

  const handleSchoolNumberChange = (v: string) => {
    setSchoolNumber(v);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!grade || parseInt(grade) < 1 || parseInt(grade) > 12) {
      setError('Sınıf 1-12 arasında olmalıdır.');
      return;
    }
    const name = fullName.trim();
    if (!name) {
      setError('İsim soyisim girin.');
      return;
    }
    if (!schoolNumber.trim()) {
      setError('Okul numarası girin.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/chat-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          full_name: name, 
          grade: parseInt(grade), 
          school_number: schoolNumber.trim() 
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        user?: ChatSessionUser;
      };

      if (!res.ok) {
        setError(data.error || `Sunucu hatası (${res.status}).`);
        return;
      }

      if (!data.user) {
        setError('Beklenmeyen yanıt.');
        return;
      }

      const user = data.user;
      sessionStorage.setItem(CHAT_USER_STORAGE_KEY, JSON.stringify(user));
      onSuccess(user);
    } catch (err) {
      console.error(err);
      const msg =
        err &&
        typeof err === 'object' &&
        'message' in err &&
        typeof (err as { message: unknown }).message === 'string'
          ? (err as { message: string }).message
          : 'Giriş sırasında beklenmeyen bir hata oluştu.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4 p-4"
    >
      <p className="text-sm text-[var(--text-muted)]">
        Sohbete katılmak için bilgilerinizi girin.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">
            Sınıf
          </label>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            maxLength={2}
            value={grade}
            onChange={(e) => handleGradeChange(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] px-3 py-2.5 text-sm text-[var(--text)] outline-none ring-violet-500/30 placeholder:text-[var(--text-soft)] focus:ring-2"
            placeholder="1-12"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">
            Okul Numarası
          </label>
          <input
            type="text"
            value={schoolNumber}
            onChange={(e) => handleSchoolNumberChange(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] px-3 py-2.5 text-sm text-[var(--text)] outline-none ring-violet-500/30 placeholder:text-[var(--text-soft)] focus:ring-2"
            placeholder="Okul numaranız"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">
            İsim soyisim
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] px-3 py-2.5 text-sm text-[var(--text)] outline-none ring-violet-500/30 placeholder:text-[var(--text-soft)] focus:ring-2"
            placeholder="Ad Soyad"
          />
        </div>
        {error && (
          <p className="text-sm text-rose-500" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:opacity-95 disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <LogIn className="h-4 w-4" aria-hidden />
          )}
          Giriş
        </button>
      </form>
    </motion.div>
  );
}
