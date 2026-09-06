'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, CheckCircle2, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { passwordStrength } from '@/lib/validation/auth';
import { Mascot } from '@/components/Mascot';
import { fireConfetti } from '@/components/ConfettiBurst';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const STRENGTH_TO_TONE: Record<
  0 | 1 | 2 | 3 | 4,
  { color: string; width: string }
> = {
  0: { color: 'bg-rose-500', width: 'w-0' },
  1: { color: 'bg-rose-500', width: 'w-1/4' },
  2: { color: 'bg-amber-500', width: 'w-2/4' },
  3: { color: 'bg-lime-500', width: 'w-3/4' },
  4: { color: 'bg-emerald-500', width: 'w-full' },
};

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const strength = useMemo(
    () => passwordStrength(newPassword),
    [newPassword],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newPassword || newPassword.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Şifreler birbiriyle eşleşmiyor.');
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      fireConfetti();
      setSuccess(true);
      setTimeout(() => {
        router.push('/profil');
      }, 2500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError('Şifre güncellenemedi: ' + msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-pink-500/10"
        aria-hidden="true"
      />

      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-stretch gap-10 px-6 py-10 lg:flex-row lg:items-center">
        <aside className="relative hidden flex-1 items-center justify-center overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-pink-500/20 p-10 text-white lg:flex">
          <div
            aria-hidden="true"
            className="absolute -left-16 -top-16 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl"
          />
          <div className="relative max-w-sm text-center">
            <Mascot pose="celebrate" size={200} className="mx-auto animate-float-y" />
            <p className="mt-6 font-display text-2xl font-bold">
              Yeni şifreni belirle!
            </p>
            <p className="mt-3 text-sm text-slate-300">
              Güçlü bir şifre seçerek öğrenme macerana kaldığın yerden güvenle devam et.
            </p>
          </div>
        </aside>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="relative z-10 w-full max-w-md flex-1 self-center"
        >
          <Link
            href="/giris"
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Giriş sayfasına dön
          </Link>

          <div className="glass rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-indigo-500/30">
                <Lock className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-white">
                  Yeni Şifre Belirle
                </h1>
                <p className="text-sm text-slate-400">Güvenli erişim</p>
              </div>
            </div>

            {success ? (
              <div className="space-y-5 animate-fade-in">
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-emerald-200">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-sm text-white mb-1">
                        Şifreniz Başarıyla Değiştirildi!
                      </h3>
                      <p className="text-xs leading-relaxed text-emerald-200/90">
                        Profilinize yönlendiriliyorsunuz...
                      </p>
                    </div>
                  </div>
                </div>

                <Link
                  href="/profil"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 hover:brightness-110 transition"
                >
                  <span>Profile Git</span>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Input
                    label="Yeni Şifre"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="En az 6 karakter"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    trailingSlot={
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    }
                  />

                  {newPassword && (
                    <div className="mt-2 space-y-1">
                      <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${STRENGTH_TO_TONE[strength.score].color} ${STRENGTH_TO_TONE[strength.score].width}`}
                        />
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Güç: <strong className="text-white">{strength.label}</strong>
                      </p>
                    </div>
                  )}
                </div>

                <Input
                  label="Yeni Şifre (Tekrar)"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Şifrenizi tekrar yazın"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />

                {error && (
                  <div
                    role="alert"
                    className="animate-fade-in rounded-xl border border-red-500/40 bg-red-500/15 px-4 py-3 text-sm font-medium text-red-300"
                  >
                    {error}
                  </div>
                )}

                <Button type="submit" size="lg" fullWidth loading={loading}>
                  Şifreyi Güncelle ve Giriş Yap
                </Button>
              </form>
            )}

            <p className="mt-6 flex items-start gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-xs leading-relaxed text-emerald-100/90">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              Yeni şifreniz Supabase uçtan uca şifreleme altyapısıyla güvenle saklanır.
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
