'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import {
  formatSignupError,
  normalizeFullNameForMatch,
  studentLoginEmail,
} from '@/lib/student-identity';
import { createLogger } from '@/lib/logger';
import { passwordStrength } from '@/lib/validation/auth';
import DeferredFloatingShapes from '@/components/DeferredFloatingShapes';
import { Mascot } from '@/components/Mascot';
import { fireConfetti } from '@/components/ConfettiBurst';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const log = createLogger('register-page');

type FormState = {
  name: string;
  password: string;
  confirmPassword: string;
  grade: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

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

export default function RegisterPage() {
  const [formData, setFormData] = useState<FormState>({
    name: '',
    password: '',
    confirmPassword: '',
    grade: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const strength = useMemo(
    () => passwordStrength(formData.password),
    [formData.password],
  );

  const validate = (): FieldErrors => {
    const errs: FieldErrors = {};
    const name = formData.name.trim();
    if (!name) errs.name = 'Ad ve soyad gerekli.';
    else if (name.split(/\s+/).filter(Boolean).length < 2)
      errs.name = 'Lütfen ad ve soyadı birlikte girin.';
    if (!formData.grade) errs.grade = 'Sınıf seçimi gerekli.';
    if (!formData.password) errs.password = 'Şifre gerekli.';
    else if (formData.password.length < 6)
      errs.password = 'Şifre en az 6 karakter olmalı.';
    if (formData.password !== formData.confirmPassword)
      errs.confirmPassword = 'Şifreler eşleşmiyor.';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});

    setLoading(true);
    try {
      const displayName = formData.name.trim();
      const nameNormalized = normalizeFullNameForMatch(displayName);
      let fakeEmail: string;
      try {
        fakeEmail = studentLoginEmail(displayName);
      } catch {
        setError('Ad soyadı geçerli değil.');
        return;
      }

      const userGrade =
        formData.grade === 'Mezun' ? 0 : Number.parseInt(formData.grade, 10);
      const gradeValue = Number.isNaN(userGrade) ? 0 : userGrade;

      const { data: existsReason, error: existsErr } = await supabase.rpc(
        'profile_exists_for_register',
        {
          p_email: fakeEmail,
          p_name_normalized: nameNormalized,
        },
      );

      if (existsErr) throw existsErr;

      if (existsReason) {
        setError('Bu ad soyad ile zaten hesap var. Giriş sayfasından deneyin.');
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: fakeEmail,
        password: formData.password,
        options: {
          data: {
            name: displayName,
            grade: gradeValue,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        const { error: profileErr } = await supabase.from('profiles').upsert({
          id: data.user.id,
          name: displayName,
          name_normalized: nameNormalized,
          email: fakeEmail,
          grade: gradeValue,
          created_at: new Date().toISOString(),
        });
        if (profileErr) throw profileErr;
      }

      setSuccess(true);
      void fireConfetti({ particleCount: 180, spread: 120, origin: { y: 0.5 } });
      setTimeout(() => {
        router.push('/profil');
      }, 1800);
    } catch (err: unknown) {
      log.warn('Register failure', { message: err instanceof Error ? err.message : String(err) });
      setError(formatSignupError(err));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden p-6">
        <DeferredFloatingShapes count={15} />
        <div className="glass animate-fade-up relative z-10 w-full max-w-md rounded-3xl p-10 text-center">
          <Mascot pose="celebrate" size={160} className="mx-auto" />
          <div className="mx-auto mt-4 inline-flex h-16 w-16 animate-pop items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500">
            <CheckCircle2 className="h-8 w-8 text-white" aria-hidden="true" />
          </div>
          <h2 className="mt-4 font-display text-3xl font-bold text-white">Harika!</h2>
          <p className="mt-2 text-slate-300">
            Hesabın oluşturuldu. Profilin hazırlanıyor, bir saniye...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="kayit-page relative min-h-screen overflow-hidden">
      <DeferredFloatingShapes count={12} />
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-primary/20 via-brand-pink/10 to-brand-orange/10"
        aria-hidden="true"
      />

      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-stretch gap-10 px-6 py-10 lg:flex-row lg:items-center">
        <aside className="relative hidden flex-1 items-center justify-center overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-brand-secondary/20 via-brand-primary/15 to-brand-pink/20 p-10 text-white lg:flex">
          <div aria-hidden="true" className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-brand-secondary/30 blur-3xl" />
          <div aria-hidden="true" className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-brand-primary/30 blur-3xl" />
          <div className="relative max-w-sm text-center">
            <Mascot pose="study" size={200} className="mx-auto animate-float-y" />
            <p className="mt-6 font-display text-2xl font-bold">
              Birlikte matematiği parçalayacağız!
            </p>
            <ul className="mx-auto mt-5 space-y-2 text-left text-sm text-slate-200">
              <li className="flex items-start gap-2"><span>✨</span> Seviyene özel içerikler</li>
              <li className="flex items-start gap-2"><span>🏆</span> Rozetler ve XP ile motivasyon</li>
              <li className="flex items-start gap-2"><span>📊</span> İlerlemen gerçek zamanlı grafiklerde</li>
              <li className="flex items-start gap-2"><span>🎮</span> Eğlenceli matematik oyunları</li>
            </ul>
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
                  Hemen kayıt ol
                </h1>
                <p className="text-sm text-slate-400">30 saniyede hesap oluştur</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <Input
                label="Ad ve soyad"
                autoComplete="name"
                placeholder="Örn: Ahmet Yılmaz"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={fieldErrors.name}
                hint="Büyük/küçük harf fark etmez. Giriş için aynı ad soyadı kullanacaksın."
                required
              />

              <Select
                label="Sınıf düzeyi"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                error={fieldErrors.grade}
                leadingIcon={<GraduationCap className="h-4 w-4" aria-hidden="true" />}
                required
              >
                <option value="" disabled>
                  Seçiniz
                </option>
                {[5, 6, 7, 8, 9, 10, 11, 12].map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}. Sınıf
                  </option>
                ))}
                <option value="Mezun">Mezun</option>
              </Select>

              <div className="space-y-1">
                <Input
                  label="Şifre"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="En az 6 karakter"
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
                {formData.password.length > 0 ? (
                  <div className="space-y-1" aria-live="polite">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className={`h-full transition-all ${STRENGTH_TO_TONE[strength.score].width} ${STRENGTH_TO_TONE[strength.score].color}`}
                      />
                    </div>
                    <p className="text-xs text-slate-400">
                      Şifre gücü: <span className="font-semibold">{strength.label}</span>
                    </p>
                  </div>
                ) : null}
              </div>

              <Input
                label="Şifre (tekrar)"
                type="password"
                autoComplete="new-password"
                placeholder="Şifreni tekrar yaz"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                error={fieldErrors.confirmPassword}
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
                Hesap oluştur
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-400">
              Zaten hesabın var mı?{' '}
              <Link
                href="/giris"
                className="font-semibold text-brand-primary-soft hover:text-white"
              >
                Giriş yap
              </Link>
            </p>
            <p className="mt-4 text-center text-xs text-slate-400">
              Devam ederek{' '}
              <Link href="/gizlilik" className="underline-offset-4 hover:underline">
                Gizlilik Politikası
              </Link>{' '}
              ve{' '}
              <Link href="/kvkk" className="underline-offset-4 hover:underline">
                KVKK
              </Link>{' '}
              metinlerini kabul etmiş olursun.
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
