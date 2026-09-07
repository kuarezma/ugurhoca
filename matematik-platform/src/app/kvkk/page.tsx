import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { createPageMetadata } from '@/lib/site-metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'KVKK aydınlatma metni',
  description:
    '6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında veri sorumlusu sıfatıyla bilgilendirme.',
  path: '/kvkk',
});

export default function KvkkPage() {
  return (
    <main className="page-surface relative z-10 min-h-screen dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 px-4 py-16 text-primary">
      <article className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-tone-info-border bg-tone-info-bg px-3 py-1 text-xs font-semibold uppercase tracking-wider text-tone-info-fg">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Yasal bilgi
          </div>
          <h1 className="font-display text-3xl font-bold text-primary sm:text-4xl">
            KVKK aydınlatma metni
          </h1>
          <p className="text-sm text-tertiary">Son güncelleme: 19 Nisan 2026</p>
        </header>

        <section className="space-y-4 text-sm leading-relaxed text-secondary sm:text-base">
          <h2 className="font-display text-xl font-bold text-primary">1. Veri sorumlusu</h2>
          <p>
            6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca, Uğur
            Hoca Matematik platformunu işleten Uğur Hoca (“Veri Sorumlusu”), öğrenci
            kişisel verilerini aşağıdaki esaslar çerçevesinde işler.
            Veri sorumlusu ile iletişime geçmek için platformdaki destek formunu
            kullanabilirsiniz.
          </p>

          <h2 className="font-display text-xl font-bold text-primary">
            2. İşlenen kişisel veri kategorileri
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Kimlik: ad, soyad, sınıf/seviye, okul bilgisi (beyan)</li>
            <li>İletişim: e-posta adresi</li>
            <li>Öğrenci işlem: çözülen testler, ödev teslim kayıtları, puanlar</li>
            <li>Teknik: oturum kimliği, giriş/çıkış zaman damgaları</li>
            <li>Destek: destek formu mesajları ve ekleri</li>
          </ul>

          <h2 className="font-display text-xl font-bold text-primary">3. İşleme amaçları</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Öğrenci hesabının oluşturulması ve yürütülmesi</li>
            <li>Eğitim içeriği, ödev ve sınav hizmetlerinin sunulması</li>
            <li>Bildirim, duyuru ve destek taleplerinin yönetilmesi</li>
            <li>Yasal yükümlülüklerin yerine getirilmesi ve istatistiksel analiz</li>
            <li>
              Hizmet kalitesinin ölçülmesi (ör. performans metrikleri ve hata
              günlükleri)
            </li>
          </ul>

          <h2 className="font-display text-xl font-bold text-primary">4. Hukuki sebepler</h2>
          <p>
            Kişisel verileriniz; KVKK 5/2 (c) sözleşmenin kurulması/ifası, (ç) veri
            sorumlusunun hukuki yükümlülüğü, (f) meşru menfaat ve 5/1 açık rıza
            kapsamında işlenir. Reklam/pazarlama amaçlı işlemeler için ayrıca
            açık rıza talep edilir.
          </p>

          <h2 className="font-display text-xl font-bold text-primary">
            5. Aktarım
          </h2>
          <p>
            Veriler, hizmet sürekliliği için Supabase (veritabanı/depolama) ve
            Vercel (uygulama barındırma) gibi yurt dışı altyapı sağlayıcılarına
            gerekli güvenlik önlemleri alınarak aktarılabilir. Bu sağlayıcılar;
            verileri yalnızca hizmet sunumu amacıyla işlemekle yükümlüdür.
          </p>

          <h2 className="font-display text-xl font-bold text-primary">
            6. Saklama süreleri
          </h2>
          <p>
            Hesap verileri, kullanıcı hesabı aktif olduğu sürece; ödev ve sınav
            kayıtları akademik yıl + 2 yıl; destek mesajları 12 ay süreyle
            saklanır. Bu süreler dolduğunda veriler anonimleştirilir veya silinir.
          </p>

          <h2 className="font-display text-xl font-bold text-primary">
            7. KVKK 11. madde kapsamında haklarınız
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Kişisel veri işlenip işlenmediğini öğrenme</li>
            <li>İşlenmişse bilgi talep etme, aktarıldığı üçüncü kişileri bilme</li>
            <li>Eksik/yanlış işlenen verilerin düzeltilmesini isteme</li>
            <li>KVKK 7. madde çerçevesinde silme veya yok etme talep etme</li>
            <li>İşleme itiraz etme ve zararın giderilmesini talep etme</li>
          </ul>
          <p>
            Haklarınızı kullanmak için destek formu üzerinden kimliğinizi
            doğrulayacak şekilde başvurabilirsiniz. Talepleriniz yasal süre içinde
            sonuçlandırılır.
          </p>
        </section>

        <div className="rounded-2xl border border-tone-warn-border bg-tone-warn-bg p-5 text-sm text-tone-warn-fg">
          Bu metin genel bilgilendirme amacıyla hazırlanmıştır; kurumsal başvurular
          için hukuki danışmanlık alınarak detaylandırılmalıdır.
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
