import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Cookie } from 'lucide-react';
import { createPageMetadata } from '@/lib/site-metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Çerez politikası',
  description:
    'Uğur Hoca Matematik platformunda kullanılan oturum ve işlevsellik çerezleri hakkında şeffaf bilgilendirme.',
  path: '/cerez',
});

export default function CerezPage() {
  return (
    <main className="page-surface relative z-10 min-h-screen px-4 py-16 text-primary dark:bg-surface-0">
      <article className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-tone-info-border bg-tone-info-bg px-3 py-1 text-xs font-semibold uppercase tracking-wider text-tone-info-fg">
            <Cookie className="h-3.5 w-3.5" aria-hidden="true" />
            Şeffaf Bilgilendirme
          </div>
          <h1 className="font-display text-3xl font-bold text-primary sm:text-4xl">
            Çerez politikası
          </h1>
          <p className="text-sm text-tertiary">Son güncelleme: 10 Kasım 2026</p>
        </header>

        <section className="space-y-4 text-sm leading-relaxed text-secondary sm:text-base">
          <p>
            Uğur Hoca Matematik platformu (“Platform”), öğrencilere hızlı,
            güvenli ve kesintisiz bir öğrenme deneyimi sunmak amacıyla sınırlı
            sayıda teknik ve işlevsel çerez kullanmaktadır.
          </p>

          <h2 className="font-display text-xl font-bold text-primary">
            Çerez nedir?
          </h2>
          <p>
            Çerezler, bir web sitesini ziyaret ettiğinizde tarayıcınız
            aracılığıyla cihazınıza kaydedilen küçük metin dosyalarıdır.
            Platform’da yalnızca hizmetin temel işleyişini sağlamak için gerekli
            olan çerezler kullanılır.
          </p>

          <h2 className="font-display text-xl font-bold text-primary">
            Kullandığımız çerez türleri
          </h2>

          <div className="space-y-3">
            <div className="rounded-2xl border border-default bg-surface-2/60 p-4">
              <h3 className="font-bold text-primary">
                1. Zorunlu Oturum Çerezleri
              </h3>
              <p className="mt-1 text-sm text-secondary">
                Öğrenci ve öğretmen hesaplarının güvenle oturum açmasını
                sağlayan Supabase Auth oturum belirteçleridir. Bu çerezler
                olmadan platforma güvenli giriş yapılamaz.
              </p>
            </div>

            <div className="rounded-2xl border border-default bg-surface-2/60 p-4">
              <h3 className="font-bold text-primary">
                2. UX Önbellek ve Oturum Çerezleri (ugurhoca_auth_snapshot /
                ugurhoca_access_token)
              </h3>
              <p className="mt-1 text-sm text-secondary">
                Sayfa geçişlerinde öğrencinin kullanıcı adını ve sınıfını
                hızlıca arayüze yansıtarak gecikmesiz bir deneyim sunmak için
                kullanılan hafif öğrenci profil önbellek çerezidir.
              </p>
            </div>

            <div className="rounded-2xl border border-default bg-surface-2/60 p-4">
              <h3 className="font-bold text-primary">
                3. İşlevsel Tercih Kayıtları
              </h3>
              <p className="mt-1 text-sm text-secondary">
                Açık/koyu tema tercihleriniz ve arayüz kişiselleştirmeleriniz
                tarayıcınızın yerel saklama alanında (localStorage) veya
                işlevsel çerezlerde saklanır.
              </p>
            </div>
          </div>

          <h2 className="font-display text-xl font-bold text-primary">
            Reklam ve Üçüncü Taraf Takip Çerezleri
          </h2>
          <p>
            Platformumuzda hiçbir koşulda reklam veya üçüncü taraf takip çerezi
            kullanılmaz. Öğrenci verileri hiçbir reklam ağına, veri
            komisyoncusuna veya ticari şirkete aktarılmaz.
          </p>

          <h2 className="font-display text-xl font-bold text-primary">
            Çerezleri nasıl yönetebilirsiniz?
          </h2>
          <p>
            Tarayıcınızın ayarlarından çerezleri dilediğiniz zaman silebilir
            veya engelleyebilirsiniz. Ancak zorunlu oturum çerezlerini
            engellemeniz durumunda platforma giriş yapamayabilirsiniz.
          </p>

          <h2 className="font-display text-xl font-bold text-primary">
            Gizlilik ve Haklarınız
          </h2>
          <p>
            Kişisel verilerinizin nasıl korunduğuna ilişkin daha fazla bilgi
            edinmek için{' '}
            <Link
              href="/gizlilik"
              className="text-accent-fg underline underline-offset-4 hover:text-primary transition-colors"
            >
              Gizlilik politikası
            </Link>{' '}
            ve{' '}
            <Link
              href="/kvkk"
              className="text-accent-fg underline underline-offset-4 hover:text-primary transition-colors"
            >
              KVKK aydınlatma metni
            </Link>{' '}
            sayfalarımızı inceleyebilirsiniz.
          </p>
        </section>

        <div className="rounded-2xl border border-tone-info-border bg-tone-info-bg p-5 text-sm text-tone-info-fg">
          Çerez uygulamalarımız hakkında sorularınız varsa platform içi destek
          sohbeti üzerinden iletişime geçebilirsiniz.
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
