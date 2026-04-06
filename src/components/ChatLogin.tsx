'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { computeChatDisplayName } from '@/lib/chat-display-name';
import { CHAT_USER_STORAGE_KEY } from '@/lib/chat-constants';

export type ChatSessionUser = {
  tc_number: string;
  full_name: string;
  display_name: string;
};

type Props = {
  onSuccess: (user: ChatSessionUser) => void;
};

export function ChatLogin({ onSuccess }: Props) {
  const [tc, setTc] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTcChange = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 11);
    setTc(digits);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (tc.length !== 11) {
      setError('TC kimlik numarası 11 haneli olmalıdır.');
      return;
    }
    const name = fullName.trim();
    if (!name) {
      setError('İsim soyisim girin.');
      return;
    }

    const display_name = computeChatDisplayName(name);
    setLoading(true);
    try {
      const { error: upsertError } = await supabase.from('chat_users').upsert(
        {
          tc_number: tc,
          full_name: name,
          display_name,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'tc_number' }
      );
      if (upsertError) throw upsertError;

      const user: ChatSessionUser = {
        tc_number: tc,
        full_name: name,
        display_name,
      };
      sessionStorage.setItem(CHAT_USER_STORAGE_KEY, JSON.stringify(user));
      onSuccess(user);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : 'Giriş sırasında bir hata oluştu. Supabase tablosunu kontrol edin.'
      );
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
            TC kimlik no
          </label>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            maxLength={11}
            value={tc}
            onChange={(e) => handleTcChange(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] px-3 py-2.5 text-sm text-[var(--text)] outline-none ring-violet-500/30 placeholder:text-[var(--text-soft)] focus:ring-2"
            placeholder="11 haneli TC"
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
