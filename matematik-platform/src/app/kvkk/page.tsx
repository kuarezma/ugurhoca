import type { Metadata } from 'next';
import Link from 'next/link';
import { createPageMetadata } from '@/lib/site-metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'KVKK aydınlatma metni',
  description:
    '6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında veri sorumlusu sıfatıyla bilgilendirme.',
  path: '/kvkk',
});

export default function KvkkPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 px-4 py-16 text-slate-100">
      <article className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          KVKK aydınlatma metni
        </h1>
        <p className="text-sm leading-relaxed text-slate-400">
          Son güncelleme: Nisan 2026
        </p>
        <section className="space-y-3 text-sm leading-relaxed text-slate-300">
          <p>
            6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;)
            uyarınca, kişisel verileriniz; Uğur Hoca Matematik platformu
            kapsamında sunulan eğitim ve iletişim hizmetleriyle sınırlı olarak
            işlenebilir.
          </p>
          <p>
            İşleme amaçları örneğin: kullanıcı hesabının oluşturulması ve
            yönetimi, ödev ve içerik paylaşımı, duyuru ve bildirimlerin
            iletilmesi, destek taleplerinin yanıtlanması ve meşru menfaat veya
            açık rıza kapsamında analizdir.
          </p>
          <p>
            KVKK&apos;nın 11. maddesi uyarınca haklarınız (bilgi talep etme,
            düzeltme, silme, itiraz vb.) için veri sorumlusuna
            başvurabilirsiniz. Başvuru yöntemi ve süreleri için resmi
            prosedürler uygulanır.
          </p>
          <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-100/90">
            Bu metin özet bilgilendirme amaçlıdır; şirket/şahıs unvanı, veri
            sorumlusu iletişim bilgisi ve detaylı hukuki metinler için hukuk
            danışmanlığı ile netleştirilmelidir.
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
