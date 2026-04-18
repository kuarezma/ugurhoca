import type { Metadata } from 'next';
import Link from 'next/link';
import { createPageMetadata } from '@/lib/site-metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Gizlilik politikası',
  description:
    'Uğur Hoca Matematik platformunda kişisel verilerin korunması ve gizlilik ilkeleri hakkında bilgilendirme.',
  path: '/gizlilik',
});

export default function GizlilikPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 px-4 py-16 text-slate-100">
      <article className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          Gizlilik politikası
        </h1>
        <p className="text-sm leading-relaxed text-slate-400">
          Son güncelleme: Nisan 2026
        </p>
        <section className="space-y-3 text-sm leading-relaxed text-slate-300">
          <p>
            Bu sayfa, Uğur Hoca Matematik web sitesini ve bağlı hizmetleri
            kullanan ziyaretçileri kişisel veri işleme konularında genel olarak
            bilgilendirmek amacıyla hazırlanmıştır.
          </p>
          <p>
            Oturum açma, ödev ve içerik erişimi gibi özellikler için hesap
            oluşturduğunuzda veya destek talebi gönderdiğinizde ilettiğiniz
            bilgiler; hizmetin sunulması, iletişim ve yasal yükümlülüklerin
            yerine getirilmesi kapsamında işlenebilir.
          </p>
          <p>
            Veri güvenliği için makul teknik ve idari tedbirler uygulanır;
            üçüncü taraf hizmet sağlayıcılar (örneğin barındırma veya e-posta)
            kullanıldığında bunlar da yalnızca hizmetin gerektirdiği ölçüde ve
            sözleşmesel güvencelerle sınırlıdır.
          </p>
          <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-100/90">
            Bu metin genel bilgilendirme amaçlıdır ve hukuki danışmanlık yerine
            geçmez. Kesin metin ve kapsam için hukuk uzmanı görüşü önerilir.
          </p>
        </section>
        <p>
          <Link
            href="/"
            className="font-semibold text-indigo-400 underline-offset-4 hover:text-indigo-300 hover:underline"
          >
            Ana sayfaya dön
          </Link>
        </p>
      </article>
    </main>
  );
}
