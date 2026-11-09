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
      className="mx-auto max-w-6xl px-4 py-10"
    >
      <div className="rounded-3xl border border-subtle bg-surface-2 p-5 sm:p-8">
        <h2
          id="how-it-works-title"
          className="font-display text-2xl font-bold text-primary"
        >
          Nasıl çalışır
        </h2>
        <p className="mt-2 text-sm text-secondary">
          Kendi hızında öğren, düzenli çalış ve gelişimini gör.
        </p>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="rounded-2xl border border-subtle bg-surface-1 p-5"
            >
              <span
                aria-hidden="true"
                className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 font-bold text-primary"
              >
                {index + 1}
              </span>
              <h3 className="font-bold text-primary">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-secondary">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
