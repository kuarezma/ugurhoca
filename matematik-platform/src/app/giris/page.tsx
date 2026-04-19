'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { getClientSession } from '@/lib/auth-client';
import { normalizeFullNameForMatch } from '@/lib/student-identity';
import { loginSchema } from '@/lib/validation/auth';
import { createLogger } from '@/lib/logger';
import DeferredFloatingShapes from '@/components/DeferredFloatingShapes';
import { Mascot } from '@/components/Mascot';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const log = createLogger('login-page');

export default function LoginPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ fullName?: string; password?: string }>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const session = await getClientSession();
      if (session) {
        router.push('/profil');
      }
    };
    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const parsed = loginSchema.safeParse(formData);
    if (!parsed.success) {
      const errs: { fullName?: string; password?: string } = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as 'fullName' | 'password' | undefined;
        if (key && !errs[key]) errs[key] = issue.message;
      }
      setFieldErrors(errs);
      return;
    }

    const displayName = parsed.data.fullName.trim();
    const nameNormalized = normalizeFullNameForMatch(displayName);

    setLoading(true);
    try {
      const { data: byNorm, error: normError } = await supabase
        .from('profiles')
        .select('email')
        .eq('name_normalized', nameNormalized);

      if (normError) throw normError;

      let profileMatches = byNorm ?? [];

      if (profileMatches.length === 0) {
        const { data: legacy, error: legacyError } = await supabase
          .from('profiles')
          .select('email')
          .ilike('name', displayName);

        if (legacyError) throw legacyError;
        profileMatches = legacy ?? [];
      }

      if (!profileMatches || profileMatches.length === 0) {
        setError('Bu ad soyad ile kayıtlı hesap bulunamadı.');
        return;
      }

      if (profileMatches.length > 1) {
        setError(
          'Bu ad soyad birden fazla hesapta görünüyor. Lütfen yönetici ile iletişime geçin.',
        );
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: profileMatches[0].email,
        password: parsed.data.password,
      });

      if (signInError) throw signInError;

      router.push('/profil');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      log.warn('Login failure', { message: msg });
      if (msg === 'Invalid login credentials') {
        setError('Ad soyad veya şifre hatalı.');
      } else if (msg === 'Email not confirmed') {
        setError('E-posta onayı bekleniyor.');
      } else {
        setError('Giriş başarısız: ' + msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="giris-page relative min-h-screen overflow-hidden">
      <DeferredFloatingShapes count={10} />
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-primary/20 via-brand-pink/10 to-brand-orange/10" aria-hidden="true" />

      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-stretch gap-10 px-6 py-10 lg:flex-row lg:items-center">
        <aside className="relative hidden flex-1 items-center justify-center overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-brand-primary/20 via-brand-pink/10 to-brand-orange/20 p-10 text-white lg:flex">
          <div aria-hidden="true" className="absolute -left-16 -top-16 h-72 w-72 rounded-full bg-brand-primary/30 blur-3xl" />
          <div aria-hidden="true" className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-brand-pink/30 blur-3xl" />
          <div className="relative max-w-sm text-center">
            <Mascot pose="waving" size={200} className="mx-auto animate-float-y" />
            <p className="mt-6 font-display text-2xl font-bold">
              Hoş geldin! Seni tekrar görmek güzel.
            </p>
            <p className="mt-3 text-sm text-slate-200">
              Kaldığın yerden devam et, rozetlerini topla ve seviyeni yükselt.
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
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Ana sayfa
          </Link>

          <div className="glass rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-brand-glow backdrop-blur-xl">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary via-brand-pink to-brand-orange text-white shadow-brand-glow">
                <Sparkles className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-white">
                  Giriş yap
                </h1>
                <p className="text-sm text-slate-400">Hesabına eriş</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Ad ve soyad"
                type="text"
                autoComplete="name"
                placeholder="Örn: Ahmet Yılmaz"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                hint="Kayıttaki ad soyadın ile aynı olmalı. Büyük/küçük harf fark etmez."
                error={fieldErrors.fullName}
                required
              />

              <Input
                label="Şifre"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                error={fieldErrors.password}
                required
                trailingSlot={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                }
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
                Giriş yap
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-400">
              Hesabın yok mu?{' '}
              <Link
                href="/kayit"
                className="font-semibold text-brand-primary-soft hover:text-white"
              >
                Hemen kayıt ol
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
