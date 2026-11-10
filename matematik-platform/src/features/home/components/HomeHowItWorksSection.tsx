const steps = [
  {
    title: 'Konuyu öğren',
    description:
      '5–8. sınıf düzeyinde ücretsiz ders notları ve yaprak testlerle konuları adım adım çalış.',
  },
  {
    title: 'Testlerle pekiştir',
    description:
      'İnteraktif testleri çöz, sonuçlarını gör ve eksik kaldığın konulara yeniden dön.',
  },
  {
    title: 'Çalışmanı takip et',
    description:
      'Hesabını oluştur; ödevlerini, haftalık planını ve çalışma hedeflerini kendi ekranından takip et.',
  },
  {
    title: 'Canlı derse katıl',
    description:
      'Canlı ders akışını takip et, derslere katıl ve Uğur Hoca’dan geri bildirim al.',
  },
];

export function HomeHowItWorksSection() {
  return (
    <section
      aria-labelledby="how-it-works-title"
      className="mx-auto max-w-6xl px-4 py-8 sm:py-12"
    >
      <div className="relative overflow-hidden rounded-3xl border border-sky-200/75 dark:border-sky-400/20 bg-surface-1/80 backdrop-blur-2xl p-6 sm:p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_18px_45px_-15px_rgba(14,165,233,0.12)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_20px_50px_-15px_rgba(2,6,23,0.65)]">
        {/* Üst Prizmatik Işık Kırılım Çizgisi */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400" />

        <div className="space-y-1.5">
          <h2
            id="how-it-works-title"
            className="font-display text-2xl font-bold text-primary sm:text-3xl"
          >
            Nasıl çalışır
          </h2>
          <p className="text-sm sm:text-base text-secondary">
            Kendi hızında öğren, düzenli çalış ve gelişimini gör.
          </p>
        </div>

        <ol className="mt-6 sm:mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="relative overflow-hidden rounded-2xl border border-subtle bg-surface-2/65 backdrop-blur-md p-5 sm:p-6 transition-all duration-200 hover:-translate-y-1 hover:border-sky-400/60 dark:hover:border-sky-400/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
            >
              <span
                aria-hidden="true"
                className="mb-3.5 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-700 to-indigo-700 text-[var(--on-brand)] dark:from-sky-400 dark:to-cyan-300 dark:text-slate-950 font-display font-extrabold shadow-sm shadow-sky-500/25"
              >
                {index + 1}
              </span>
              <h3 className="font-display text-base font-bold text-primary">{step.title}</h3>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-secondary font-medium">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
