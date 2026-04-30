'use client';

import {
  ClipboardCheck,
  GraduationCap,
  MessageSquareText,
  PenLine,
  UserRoundPlus,
} from 'lucide-react';

type HomeHowItWorksSectionProps = {
  isLight: boolean;
};

const steps = [
  {
    description: 'Ad soyad ve sınıf bilgisiyle kısa kayıt formunu tamamla.',
    icon: UserRoundPlus,
    title: 'Kayıt ol',
  },
  {
    description: 'Ders notları, yaprak testler ve hedef içeriklerle çalış.',
    icon: GraduationCap,
    title: 'Çalış',
  },
  {
    description: 'Seviyene uygun testleri çözerek konularını pekiştir.',
    icon: PenLine,
    title: 'Test çöz',
  },
  {
    description: 'Ödevlerini, teslimlerini ve haftalık planını kendi panelinden izle.',
    icon: ClipboardCheck,
    title: 'Ödevlerini takip et',
  },
  {
    description: 'Sorularını mesajla ilet, Uğur Hoca’dan geri bildirim al.',
    icon: MessageSquareText,
    title: 'Geri bildirim al',
  },
];

export function HomeHowItWorksSection({ isLight }: HomeHowItWorksSectionProps) {
  return (
    <section className="defer-section px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p
              className={`text-sm font-bold uppercase tracking-[0.16em] ${
                isLight ? 'text-indigo-600' : 'text-indigo-300'
              }`}
            >
              Nasıl çalışır?
            </p>
            <h2
              className={`mt-2 text-2xl font-black sm:text-3xl ${
                isLight ? 'text-slate-950' : 'text-white'
              }`}
            >
              Çalışma akışı tek panelde ilerler
            </h2>
          </div>
          <p
            className={`max-w-xl text-sm leading-relaxed ${
              isLight ? 'text-slate-600' : 'text-slate-400'
            }`}
          >
            Her öğrenci yalnızca kendi profilini, planını, ödevlerini,
            mesajlarını ve ilerleme verilerini görür.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <article
                key={step.title}
                className={`rounded-2xl border p-4 ${
                  isLight
                    ? 'border-slate-200 bg-white shadow-sm shadow-slate-200/70'
                    : 'border-white/10 bg-white/5'
                }`}
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-white">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <span
                    className={`text-xs font-black ${
                      isLight ? 'text-slate-300' : 'text-slate-600'
                    }`}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3
                  className={`text-base font-bold ${
                    isLight ? 'text-slate-950' : 'text-white'
                  }`}
                >
                  {step.title}
                </h3>
                <p
                  className={`mt-2 text-sm leading-relaxed ${
                    isLight ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  {step.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
