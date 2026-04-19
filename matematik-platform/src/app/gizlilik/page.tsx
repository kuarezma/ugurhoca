import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';
import { createPageMetadata } from '@/lib/site-metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Gizlilik politikası',
  description:
    'Uğur Hoca Matematik platformunda kişisel verilerin korunması ve gizlilik ilkeleri hakkında bilgilendirme.',
  path: '/gizlilik',
});

export default function GizlilikPage() {
  return (
    <main className="relative z-10 min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 px-4 py-16 text-slate-100">
      <article className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-secondary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-300">
            <Lock className="h-3.5 w-3.5" aria-hidden="true" />
            Gizliliğin bizim için önemli
          </div>
          <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Gizlilik politikası
          </h1>
          <p className="text-sm text-slate-400">Son güncelleme: 19 Nisan 2026</p>
        </header>

        <section className="space-y-4 text-sm leading-relaxed text-slate-200 sm:text-base">
          <p>
            Uğur Hoca Matematik platformu (“Platform”), öğrencilerin matematik
            çalışmalarını destekleyen bir eğitim uygulamasıdır. Bu politika;
            Platform’u kullanan ziyaretçi, öğrenci ve veli bilgilerinin nasıl
            toplandığını, işlendiğini ve korunduğunu açıklar.
          </p>

          <h2 className="font-display text-xl font-bold text-white">
            Hangi verileri topluyoruz?
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Hesap bilgileri: ad, soyad, sınıf, e-posta</li>
            <li>
              Kullanım verileri: görüntülenen içerikler, çözülen testler, ödev
              teslimleri, oyunlar
            </li>
            <li>Destek talepleri için paylaşılan mesaj ve dosyalar</li>
            <li>Hata raporları ve performans metrikleri (anonim)</li>
          </ul>

          <h2 className="font-display text-xl font-bold text-white">
            Çerez kullanımı
          </h2>
          <p>
            Platform; giriş oturumunu sürdürmek için zorunlu çerezler, tema ve
            bildirim tercihi için işlevsel çerezler kullanır. Reklam amaçlı
            üçüncü taraf çerez kullanılmaz. Çerezleri tarayıcı ayarlarından
            temizleyebilirsiniz.
          </p>

          <h2 className="font-display text-xl font-bold text-white">
            Verilerin kimlerle paylaşılabileceği
          </h2>
          <p>
            Hizmet sürekliliği için aşağıdaki işleyenlerle sözleşmesel güvenceler
            altında veri paylaşılabilir: Supabase (veritabanı/depolama), Vercel
            (uygulama barındırma), Resend (bilgilendirme e-postaları). Bu
            kuruluşlar veriyi yalnızca sözleşme kapsamında işler.
          </p>

          <h2 className="font-display text-xl font-bold text-white">
            Güvenlik önlemleri
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Tüm trafik için zorunlu HTTPS</li>
            <li>Parolalar yalnızca tek yönlü özet fonksiyonları ile saklanır</li>
            <li>Row-level güvenlik kuralları ile satır bazlı erişim kontrolü</li>
            <li>Erişim günlükleri ve düzenli yedekleme</li>
          </ul>

          <h2 className="font-display text-xl font-bold text-white">
            Çocuk kullanıcılar
          </h2>
          <p>
            Platform, ortaokul ve lise seviyesindeki öğrencilere hitap eder.
            13 yaş altı kullanıcıların hesap oluşturmaları veli onayını
            gerektirir. Üye olan öğrenciler velilerinin bilgisi dahilinde
            kullanılmalıdır.
          </p>

          <h2 className="font-display text-xl font-bold text-white">
            Haklarınız
          </h2>
          <p>
            Verilerinize erişme, düzeltme, silme ve itiraz hakkınızı her zaman
            kullanabilirsiniz. Detaylı bilgi ve başvuru için{' '}
            <Link
              href="/kvkk"
              className="text-brand-primary-soft underline-offset-4 hover:underline"
            >
              KVKK aydınlatma metni
            </Link>{' '}
            sayfasına bakabilirsiniz.
          </p>
        </section>

        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm text-amber-100/90">
          Sorularınız için Platform’daki destek formunu kullanabilirsiniz.
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-primary-soft hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Ana sayfaya dön
        </Link>
      </article>
    </main>
  );
}
