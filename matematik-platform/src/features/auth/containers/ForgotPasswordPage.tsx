'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, KeyRound, CheckCircle2, ShieldCheck, Send } from 'lucide-react';
import { Mascot } from '@/components/Mascot';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const trimmed = identifier.trim();
    if (!trimmed || trimmed.length < 2) {
      setError('Lütfen geçerli bir ad soyad veya e-posta adresi girin.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: trimmed }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'İşlem sırasında bir hata oluştu.');
      }

      setSuccessMessage(data.message || 'Talebiniz başarıyla alındı.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
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
            <Mascot pose="waving" size={200} className="mx-auto animate-float-y" />
            <p className="mt-6 font-display text-2xl font-bold">
              Endişelenme, hesabın güvende!
            </p>
            <p className="mt-3 text-sm text-slate-300">
              Adını ve soyadını yazarak şifre sıfırlama talebini anında oluşturabilirsin.
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
                <KeyRound className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-white">
                  Şifremi Unuttum
                </h1>
                <p className="text-sm text-slate-400">Hesap kurtarma</p>
              </div>
            </div>

            {successMessage ? (
              <div className="space-y-5 animate-fade-in">
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-emerald-200">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-sm text-white mb-1">
                        Talebiniz Alındı
                      </h3>
                      <p className="text-xs leading-relaxed text-emerald-200/90">
                        {successMessage}
                      </p>
                    </div>
                  </div>
                </div>

                <Link
                  href="/giris"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 hover:brightness-110 transition"
                >
                  <span>Giriş Sayfasına Dön</span>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Kayıt olurken kullandığın <strong>Ad ve Soyadı</strong> veya yöneticiysen <strong>e-posta adresini</strong> girerek şifreni kurtarabilirsin.
                </p>

                <Input
                  label="Ad ve Soyad veya E-posta"
                  type="text"
                  autoComplete="name"
                  placeholder="Örn: Ahmet Yılmaz"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  hint="Kayıtlı adın ve soyadın ile birebir aynı olmalıdır."
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
                  <Send className="h-4 w-4 mr-1.5" />
                  <span>Şifre Sıfırlama Talebi Gönder</span>
                </Button>
              </form>
            )}

            <p className="mt-6 flex items-start gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-xs leading-relaxed text-emerald-100/90">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              Hesap kurtarma güvenliği: Öğrenci hesapları için şifre sıfırlama talepleri doğrudan sistem öğretmenine iletilir ve yetkisiz erişimler engellenir.
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
