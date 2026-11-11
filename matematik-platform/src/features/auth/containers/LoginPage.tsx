'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff, ShieldCheck, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import {
  clearUserProfileCache,
  getClientSession,
  syncCurrentUserSnapshotCookie,
  writeAccessTokenCookie,
} from '@/lib/auth-client';
import { normalizeFullNameForMatch } from '@/lib/student-identity';
import { safeRedirectPath } from '@/lib/safe-redirect-path';
import { loginSchema } from '@/lib/validation/auth';
import { toUserMessage } from '@/lib/auth-user-message';
import { createLogger } from '@/lib/logger';
import { Mascot } from '@/components/Mascot';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const log = createLogger('login-page');

const SESSION_START_ERROR =
  'Oturum başlatılamadı, lütfen birkaç saniye sonra tekrar deneyin.';

const getTargetRedirect = () => {
  if (typeof window === 'undefined') return '/profil';
  const searchParams = new URLSearchParams(window.location.search);
  if (!searchParams.has('redirect')) return '/profil';
  const target = safeRedirectPath(searchParams.get('redirect'));
  return target.startsWith('/giris') ? '/profil' : target;
};

export default function LoginPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    password?: string;
  }>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTrialBanner, setShowTrialBanner] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const redirect = searchParams.get('redirect');
      if (redirect === '/testler' || redirect === '/oyunlar') {
        setShowTrialBanner(true);
      }
    }
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      const session = await getClientSession();
      if (session) {
        // Proxy korumalı rotada HttpOnly çerezi arar; yönlendirmeden önce yazılsın.
        // Yazılamazsa yönlendirme proxy'den /giris'e geri döner (ör. 429'da döngü).
        if (
          session.access_token &&
          !(await writeAccessTokenCookie(session.access_token))
        ) {
          setError(SESSION_START_ERROR);
          return;
        }
        router.push(getTargetRedirect());
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
      const { data: rpcMatches, error: rpcError } = await supabase.rpc(
        'find_login_email',
        {
          p_name_normalized: nameNormalized,
          p_display_name: displayName,
        },
      );

      if (rpcError) throw rpcError;

      const profileMatches = (rpcMatches ?? []) as Array<{ email: string }>;

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

      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: profileMatches[0].email,
          password: parsed.data.password,
        });

      if (signInError) throw signInError;

      clearUserProfileCache();
      if (
        signInData?.session?.access_token &&
        !(await writeAccessTokenCookie(signInData.session.access_token))
      ) {
        setError(SESSION_START_ERROR);
        return;
      }
      await syncCurrentUserSnapshotCookie();

      router.push(getTargetRedirect());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      log.warn('Login failure', { message: msg });
      setError(toUserMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-surface giris-page relative min-h-screen overflow-hidden">
      <div
        className="absolute inset-0 -z-10 bg-transparent"
        aria-hidden="true"
      />

      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-stretch gap-8 sm:gap-10 px-4 sm:px-6 py-8 sm:py-10 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(2.5rem,env(safe-area-inset-bottom))] lg:flex-row lg:items-center">
        <aside className="relative hidden flex-1 items-center justify-center overflow-hidden rounded-[2rem] border border-slate-200 dark:border-slate-800/80 p-10 text-slate-900 dark:text-white shadow-2xl lg:flex bg-surface-1 dark:bg-surface-1">
          <div
            aria-hidden="true"
            className="absolute -left-16 -top-16 h-72 w-72 rounded-full bg-brand-primary/20 dark:bg-brand-primary/30 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-brand-pink/20 dark:bg-brand-pink/30 blur-3xl"
          />
          <div className="relative max-w-sm text-center">
            <Mascot
              pose="waving"
              size={200}
              className="mx-auto animate-float-y"
            />
            <p className="mt-6 font-display text-2xl font-bold text-slate-900 dark:text-white">
              Hoş geldin! Seni tekrar görmek güzel.
            </p>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-200">
              Kaldığın yerden devam et, rozetlerini topla ve seviyeni yükselt.
            </p>
          </div>
        </aside>

        <div className="relative z-10 w-full max-w-md flex-1 self-center">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Ana sayfa
          </Link>

          <div className="glass rounded-3xl border border-default bg-surface-1 p-5 sm:p-8 shadow-brand-glow backdrop-blur-xl">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-brand-glow bg-brand-primary text-slate-950 dark:text-slate-950">
                <Sparkles className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-primary">
                  Giriş yap
                </h1>
                <p className="text-sm text-secondary">Hesabına eriş</p>
              </div>
            </div>

            {showTrialBanner && (
              <div
                role="note"
                className="mb-5 p-3.5 rounded-2xl bg-surface-2 border border-border-default text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs"
              >
                <div className="flex items-center gap-2 text-primary font-medium">
                  <Sparkles className="w-4 h-4 text-accent-fg shrink-0" />
                  <span>Hesap açmadan önce platformu denemek ister misin?</span>
                </div>
                <Link
                  href="/deneme-salonu"
                  className="font-bold text-accent-fg underline underline-offset-4 hover:opacity-80 shrink-0"
                >
                  Deneme Salonunu Keşfet →
                </Link>
              </div>
            )}

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
                    aria-label={
                      showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'
                    }
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-secondary hover:bg-surface-2 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-fg"
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
                  className="animate-fade-in rounded-xl border border-red-500/40 bg-red-500/15 px-4 py-3 text-sm font-medium text-red-700 dark:text-red-300"
                >
                  {error}
                </div>
              )}

              <Button type="submit" size="lg" fullWidth loading={loading}>
                Giriş yap
              </Button>
            </form>

            <nav
              aria-label="Gizlilik ve veri kullanımı"
              className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-center text-xs text-secondary"
            >
              <Link
                href="/gizlilik"
                className="underline underline-offset-4 hover:text-primary"
              >
                Gizlilik Politikası
              </Link>
              <Link
                href="/kvkk"
                className="underline underline-offset-4 hover:text-primary"
              >
                KVKK Aydınlatma Metni
              </Link>
              <Link
                href="/cerez"
                className="underline underline-offset-4 hover:text-primary"
              >
                Çerez Politikası
              </Link>
            </nav>

            <div className="mt-4 rounded-xl border border-default bg-surface-2 p-3 text-center text-xs text-secondary">
              <span className="font-medium text-primary">
                🔑 Şifreni mi unuttun?
              </span>{' '}
              <Link
                href="/sifremi-unuttum"
                className="font-semibold text-accent-fg underline underline-offset-2 transition-colors hover:text-primary"
              >
                Şifre sıfırlama talebi oluştur
              </Link>
            </div>

            <p className="mt-6 text-center text-sm text-secondary">
              Hesabın yok mu?{' '}
              <Link
                href="/kayit"
                className="font-semibold text-accent-fg hover:text-primary"
              >
                Hemen kayıt ol
              </Link>
            </p>
            <p className="mt-4 flex items-start gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-xs leading-relaxed text-emerald-900 dark:text-emerald-200">
              <ShieldCheck
                className="mt-0.5 h-4 w-4 shrink-0"
                aria-hidden="true"
              />
              Öğrenci verileri gizlidir. Başka öğrenciler profilini,
              mesajlarını, ödevlerini, test sonuçlarını veya çalışma
              hareketlerini göremez.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
