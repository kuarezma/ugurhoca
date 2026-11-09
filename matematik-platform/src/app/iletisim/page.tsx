import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Mail, MessageSquare, Shield, UserCheck } from 'lucide-react';
import { createPageMetadata } from '@/lib/site-metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'İletişim',
  description:
    'Uğur Hoca Matematik platformu iletişim kanalları, destek sohbeti ve öğretmen bilgileri.',
  path: '/iletisim',
});

export default function IletisimPage() {
  return (
    <main className="page-surface relative z-10 min-h-screen px-4 py-16 text-primary dark:bg-surface-0">
      <article className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-tone-info-border bg-tone-info-bg px-3 py-1 text-xs font-semibold uppercase tracking-wider text-tone-info-fg">
            <Mail className="h-3.5 w-3.5" aria-hidden="true" />
            Doğrudan İletişim
          </div>
          <h1 className="font-display text-3xl font-bold text-primary sm:text-4xl">
            İletişim
          </h1>
          <p className="text-sm text-tertiary">Platform Rehberi ve Eğitmen Bilgilendirmesi</p>
        </header>

        {/* Öğretmen Künyesi Kartı */}
        <section className="rounded-3xl border border-default bg-surface-1 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-primary text-slate-950 font-black text-xl shadow-md">
              UY
            </div>
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 mb-1">
                <UserCheck className="w-3.5 h-3.5" /> Platform Yöneticisi & Eğitmen
              </div>
              <h2 className="font-display text-2xl font-black text-primary">
                Uğur YAŞAYAN
              </h2>
              <p className="text-sm font-semibold text-secondary">
                Matematik Öğretmeni
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-6 text-sm leading-relaxed text-secondary sm:text-base">
          <div className="rounded-2xl border border-default bg-surface-2/60 p-5 space-y-2">
            <div className="flex items-center gap-2 font-bold text-primary text-base">
              <MessageSquare className="h-5 w-5 text-brand-ink" />
              <h3>Öğrenciler İçin: Platform İçi Destek Sohbeti</h3>
            </div>
            <p>
              Platforma giriş yapmış tüm öğrencilerimiz, sağ alt köşede yer alan
              canlı <strong>Destek Sohbeti</strong> balonu aracılığıyla Uğur
              Hoca&apos;ya doğrudan soru, görsel ve mesaj gönderebilirler.
              Takıldığınız matematik sorularının fotoğrafını (JPG, PNG veya WebP)
              çekip ekleyebilir ve çözüm adımlarını doğrudan öğrenebilirsiniz.
            </p>
          </div>

          <div className="rounded-2xl border border-default bg-surface-2/60 p-5 space-y-2">
            <div className="flex items-center gap-2 font-bold text-primary text-base">
              <Shield className="h-5 w-5 text-accent-success-ink" />
              <h3>KVKK ve Gizlilik Başvuruları</h3>
            </div>
            <p>
              6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamındaki haklarınız,
              veri silme/düzeltme veya hesap kapatma talepleriniz için platform içi
              destek formu üzerinden kimliğinizi doğrulayarak başvuru yapabilirsiniz.
              Detaylı bilgi için{' '}
              <Link
                href="/kvkk"
                className="text-accent-fg underline underline-offset-4 hover:text-primary transition-colors"
              >
                KVKK aydınlatma metni
              </Link>{' '}
              ve{' '}
              <Link
                href="/gizlilik"
                className="text-accent-fg underline underline-offset-4 hover:text-primary transition-colors"
              >
                Gizlilik politikası
              </Link>{' '}
              sayfalarımızı inceleyebilirsiniz.
            </p>
          </div>
        </section>

        <div className="rounded-2xl border border-tone-info-border bg-tone-info-bg p-5 text-sm text-tone-info-fg">
          Uğur Hoca Matematik Platformu, tamamen açık ve öğrencilerin matematiksel
          gelişimini desteklemek amacıyla tasarlanmış ücretsiz bir dijital eğitim
          arşividir.
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-accent-fg hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Ana sayfaya dön
        </Link>
      </article>
    </main>
  );
}
