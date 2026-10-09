'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BookOpen,
  Calculator,
  ChevronRight,
  GraduationCap,
  ListChecks,
  School,
  Sparkles,
  Target,
  Compass,
  Layers,
  type LucideIcon,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { PenTool, Mic } from 'lucide-react';

const FormulaFlashcardsModal = dynamic(
  () =>
    import('@/features/programs/components/FormulaFlashcardsModal').then(
      (m) => ({ default: m.FormulaFlashcardsModal }),
    ),
  { ssr: false },
);
const ExamScoreCalculatorModal = dynamic(
  () =>
    import('@/components/ExamScoreCalculatorModal').then((m) => ({
      default: m.ExamScoreCalculatorModal,
    })),
  { ssr: false },
);
const TopicChecklistModal = dynamic(
  () =>
    import('@/features/programs/components/TopicChecklistModal').then((m) => ({
      default: m.TopicChecklistModal,
    })),
  { ssr: false },
);
const GeometryMathLabModal = dynamic(
  () =>
    import('@/features/programs/components/GeometryMathLabModal').then((m) => ({
      default: m.GeometryMathLabModal,
    })),
  { ssr: false },
);
const CurriculumCoverageMatrixModal = dynamic(
  () =>
    import(
      '@/features/programs/components/CurriculumCoverageMatrixModal'
    ).then((m) => ({ default: m.CurriculumCoverageMatrixModal })),
  { ssr: false },
);
const MathGlossaryModal = dynamic(
  () =>
    import('@/features/programs/components/MathGlossaryModal').then((m) => ({
      default: m.MathGlossaryModal,
    })),
  { ssr: false },
);

const MathProjectWorkshopModal = dynamic(
  () => import('@/features/projects/components/MathProjectWorkshopModal'),
  { ssr: false },
);
const VisualMathProofsModal = dynamic(
  () => import('@/features/proofs/components/VisualMathProofsModal').then(m => ({ default: m.VisualMathProofsModal })),
  { ssr: false },
);
const StudentQuestionAuthoringModal = dynamic(
  () => import('@/features/authoring/components/StudentQuestionAuthoringModal').then(m => ({ default: m.StudentQuestionAuthoringModal })),
  { ssr: false },
);
const FeynmanVoiceExplanationModal = dynamic(
  () => import('@/features/feynman/components/FeynmanVoiceExplanationModal').then(m => ({ default: m.FeynmanVoiceExplanationModal })),
  { ssr: false },
);

type ProgramTool = {
  id: string;
  title: string;
  subtitle: string;
  href?: string;
  onClick?: () => void;
  icon: LucideIcon;
  gradient: string;
  bullets: string[];
  ctaLabel?: string;
};

export default function ProgramsHubPage() {
  const [isFlashcardsOpen, setIsFlashcardsOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [isGeometryLabOpen, setIsGeometryLabOpen] = useState(false);
  const [isCoverageMatrixOpen, setIsCoverageMatrixOpen] = useState(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [isProjectWorkshopOpen, setIsProjectWorkshopOpen] = useState(false);
  const [isProofsOpen, setIsProofsOpen] = useState(false);
  const [isAuthoringOpen, setIsAuthoringOpen] = useState(false);
  const [isFeynmanOpen, setIsFeynmanOpen] = useState(false);

  const tools: ProgramTool[] = [
    {
      id: 'lgs',
      title: 'LGS Puan ve Lise Tercih Sihirbazı',
      subtitle: 'Ortaokul seviyesi için puan hesaplama ve hedef belirleme',
      href: '/programlar/lgs',
      icon: School,
      gradient: 'from-brand-secondary to-brand-secondary',
      bullets: [
        'Net tabanlı tahmini puan',
        'Lise hedef seviyesi',
        'Gerçek veritabanından okul önerileri',
      ],
      ctaLabel: 'Sihirbazı Aç',
    },
    {
      id: 'yks',
      title: 'YKS Puan ve Üniversite Tercih Sihirbazı',
      subtitle: 'Lise grubu için puan hesaplama ve üniversite tercih yardımı',
      href: '/programlar/yks',
      icon: GraduationCap,
      gradient: 'from-brand-pink to-brand-pink',
      bullets: [
        'TYT / SAY / EA / SOZ puan tahmini',
        'Başarı sırası odaklı filtreleme',
        'Gerçek veritabanından program önerileri',
      ],
      ctaLabel: 'Sihirbazı Aç',
    },
    {
      id: 'geometry-lab',
      title: 'Etkileşimli Matematik & Geometri Laboratuvarı',
      subtitle: 'Pisagor, birim çember, trigonometri, parabol ve eğim canlı görselleştiricisi',
      onClick: () => setIsGeometryLabOpen(true),
      icon: Compass,
      gradient: 'from-brand-accent to-brand-accent',
      bullets: [
        'Pisagor teoremi ve özel dik üçgenler',
        'Birim çember, sinüs, kosinüs ve tanjant',
        'Parabol tepe noktası ve diskriminant (Δ)',
      ],
      ctaLabel: 'Laboratuvarı Aç',
    },
    {
      id: 'calculator',
      title: 'İnteraktif Sınav Puanı & Net Hesaplayıcı',
      subtitle: 'LGS ve YKS için güncel katsayılarla anlık net ve puan hesabı',
      onClick: () => setIsCalculatorOpen(true),
      icon: Calculator,
      gradient: 'from-brand-secondary to-brand-secondary',
      bullets: [
        '3 yanlış 1 doğru kuralı (LGS)',
        'Diploma notu (OBP) ve sıralama bandı',
        'Sayısal, Eşit Ağırlık ve Sözel',
      ],
      ctaLabel: 'Hesaplayıcıyı Aç',
    },
    {
      id: 'checklist',
      title: 'MEB Matematik Konu Takip Çizelgesi',
      subtitle: '5-12. sınıf müfredat kazanım takip listesi ve A4 duvara asılabilir çıktı',
      onClick: () => setIsChecklistOpen(true),
      icon: ListChecks,
      gradient: 'from-brand-primary to-brand-primary',
      bullets: [
        'Konu anlatımı, 50+ soru ve tekrar adımları',
        'Dinamik yüzde tamamlama göstergesi',
        'A4 Yazdır / Duvar Çalışma Planı',
      ],
      ctaLabel: 'Çizelgeyi Aç',
    },
    {
      id: 'coverage-matrix',
      title: 'Kazanım Kapsam & İçerik Haritası',
      subtitle: 'Anlatım, örnek, test ve çalışma kâğıdı eksiklerini tek tabloda tespit et',
      onClick: () => setIsCoverageMatrixOpen(true),
      icon: Layers,
      gradient: 'from-brand-primary to-brand-primary',
      bullets: [
        '5-12. sınıf konu bazlı 4 içerik kanalı',
        'Eksikli konuları anlık filtreleme',
        'Öğretmen için kapsam tamamlama yönetimi',
      ],
      ctaLabel: 'Kapsam Haritasını Aç',
    },
    {
      id: 'math-glossary',
      title: 'Matematik Terimler & Kişisel Sözlük',
      subtitle: 'Kritik kavramlar, sık yapılan tuzaklar ve kendi açıklamalarını ekleme',
      onClick: () => setIsGlossaryOpen(true),
      icon: BookOpen,
      gradient: 'from-brand-secondary to-brand-secondary',
      bullets: [
        'Kavram tanımları ve KaTeX matematik modelleri',
        'Sık yapılan kavram yanılgıları ve tuzak uyarıları',
        'Kişisel terimlerini ve özel notlarını kaydetme',
      ],
      ctaLabel: 'Sözlüğü Aç',
    },
    {
      id: 'project-workshop',
      title: 'Matematik Proje Atölyesi & Araştırma Görevleri',
      subtitle: 'Gerçek hayat senaryoları, aşamalı teslim adımları ve 100 puanlık değerlendirme rubriği',
      onClick: () => setIsProjectWorkshopOpen(true),
      icon: Compass,
      gradient: 'from-brand-accent to-brand-accent',
      bullets: [
        'Evimizin enerji verimliliği ve doğrusal modelleme',
        'Altın oran, mimari plan ve Fibonacci analizi',
        'Fraktallar ve doğadaki geometrik örüntüler',
      ],
      ctaLabel: 'Atölyeyi Aç',
    },
    {
      id: 'math-proofs',
      title: '«Neden Doğru?» Matematiksel İspat Koleksiyonu',
      subtitle: 'Pisagor, iki kare farkı, üçgen açıları ve Gauss toplamının görsel mantıksal ispatları',
      onClick: () => setIsProofsOpen(true),
      icon: Compass,
      gradient: 'from-brand-secondary to-brand-secondary',
      bullets: [
        'Ezber yerine mantık: Pisagor, iki kare farkı, Gauss toplamı',
        'Adım adım geometrik ve cebirsel kanıt kartları',
        'İspat ustası rozetleri ve tarihsel arka plan',
      ],
      ctaLabel: 'İspatları İncele',
    },
    {
      id: 'authoring-workshop',
      title: 'Öğrenci Soru Yazarlık Atölyesi',
      subtitle: 'Bloom yaratma basamağı: Kendi sorunu yaz, çeldiricilerini kurgula ve havuza katıl',
      onClick: () => setIsAuthoringOpen(true),
      icon: PenTool,
      gradient: 'from-brand-secondary to-brand-secondary',
      bullets: [
        'Özgün soru, 4 çeldirici ve adım adım çözüm kurgusu',
        'KaTeX matematik formül editörü ve ipucu sistemi',
        'Öğretmen onayından geçip soru havuzunda yayınlanma',
      ],
      ctaLabel: 'Atölyeye Katıl',
    },
    {
      id: 'feynman-voice',
      title: '60 Saniyede Feynman Anlatımı',
      subtitle: '«Bir konuyu basitçe anlatabiliyorsan anlamışsındır» sesli anlatım vitrini',
      onClick: () => setIsFeynmanOpen(true),
      icon: Mic,
      gradient: 'from-brand-danger to-brand-danger',
      bullets: [
        '60 saniyelik sesli mikrofon kaydı ve kavram özeti',
        'Akranların anlatımlarını dinleme ve beğenme vitrini',
        'Feynman Ustası rozeti ve öğretmen takdir notları',
      ],
      ctaLabel: 'Anlatımı Başlat',
    },
  ];

  return (
    <main className="page-surface programlar-page min-h-screen gradient-bg px-4 pb-[max(3rem,calc(env(safe-area-inset-bottom)+1.5rem))] pt-[calc(4.5rem+env(safe-area-inset-top))] sm:px-6 sm:pt-20 relative">
      {/* Ambient Glow Mesh */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl" />
        <div className="absolute top-48 -right-32 h-96 w-96 rounded-full bg-purple-500/10 dark:bg-purple-500/5 blur-3xl" />
        <div className="absolute bottom-10 left-1/3 h-96 w-96 rounded-full bg-cyan-500/10 dark:bg-cyan-500/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold transition-colors text-secondary hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Ana Sayfa
          </Link>

          <button
            type="button"
            onClick={() => setIsFlashcardsOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition hover:scale-[1.02] active:scale-[0.98] bg-emerald-500 hover:bg-emerald-600 text-white dark:bg-emerald-400 dark:hover:bg-emerald-300 dark:text-slate-950 shadow-md shadow-emerald-500/20 active:translate-y-0.5"
          >
            <BookOpen className="h-4 w-4" />
            Formül & Bilgi Kartları
          </button>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-slate-900/90 p-6 sm:p-8 shadow-xl backdrop-blur-xl relative overflow-hidden"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-50/80 dark:bg-indigo-950/40 px-3.5 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300 backdrop-blur-md shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Akıllı Rehberlik & Tercih Laboratuvarı</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-primary font-display mb-2">
                Hedefine Göre Akıllı Puan & Tercih Sihirbazları
              </h1>
              <p className="mt-3 text-sm sm:text-base text-secondary max-w-2xl leading-relaxed">
                LGS ve YKS için puanını hesapla, sonra hedef listeni oluştur.
                Sonuçlar kaydedilmez; tamamen anlık hesaplama ve rehberlik
                sunar.
              </p>
            </div>

            <div className="hidden rounded-2xl border border-slate-200/90 dark:border-white/10 bg-surface-2 p-3 sm:block shadow-xs">
              <Calculator className="h-8 w-8 text-accent-fg" />
            </div>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {tools.map((tool, index) => (
              <motion.article
                key={tool.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.08 }}
                whileHover={{ y: -4 }}
                className="tilt-on-hover group relative overflow-hidden rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-slate-900/80 p-5 sm:p-7 shadow-lg hover:shadow-2xl hover:border-indigo-500/40 backdrop-blur-md transition-all duration-300"
              >
                <div
                  className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tool.gradient}`}
                />
                <div
                  className={`absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${tool.gradient} opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-40`}
                />

                <div className="relative">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div
                      className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${tool.gradient} shadow-lg text-white group-hover:scale-105 transition-transform`}
                    >
                      <tool.icon className="h-6 w-6 text-white dark:text-white" />
                    </div>
                    <Target className="h-5 w-5 text-secondary" />
                  </div>

                  <h2 className="text-lg font-bold sm:text-xl text-primary group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {tool.title}
                  </h2>
                  <p className="mt-2 text-sm text-secondary">
                    {tool.subtitle}
                  </p>

                  <ul className="mt-4 space-y-2">
                    {tool.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex items-center gap-2 text-sm text-secondary"
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full bg-gradient-to-r ${tool.gradient}`}
                        />
                        {bullet}
                      </li>
                    ))}
                  </ul>

                  {tool.onClick ? (
                    <button
                      type="button"
                      onClick={tool.onClick}
                      className="mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition hover:scale-[1.02] bg-emerald-500 hover:bg-emerald-600 text-white dark:bg-emerald-400 dark:hover:bg-emerald-300 dark:text-slate-950 shadow-md shadow-emerald-500/20 active:translate-y-0.5"
                      aria-label={`${tool.title} aracını aç`}
                    >
                      {tool.ctaLabel || 'Aracı Aç'}
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <Link
                      href={tool.href || '#'}
                      className="mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition hover:scale-[1.02] bg-emerald-500 hover:bg-emerald-600 text-white dark:bg-emerald-400 dark:hover:bg-emerald-300 dark:text-slate-950 shadow-md shadow-emerald-500/20 active:translate-y-0.5"
                      aria-label={`${tool.title} sihirbazını aç`}
                    >
                      {tool.ctaLabel || 'Sihirbazı Aç'}
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        </motion.section>
      </div>

      <FormulaFlashcardsModal
        isOpen={isFlashcardsOpen}
        onClose={() => setIsFlashcardsOpen(false)}
      />
      <ExamScoreCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />
      <TopicChecklistModal
        isOpen={isChecklistOpen}
        onClose={() => setIsChecklistOpen(false)}
      />
      <GeometryMathLabModal
        isOpen={isGeometryLabOpen}
        onClose={() => setIsGeometryLabOpen(false)}
      />
      <CurriculumCoverageMatrixModal
        isOpen={isCoverageMatrixOpen}
        onClose={() => setIsCoverageMatrixOpen(false)}
      />
      <MathGlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
      />
      <MathProjectWorkshopModal
        isOpen={isProjectWorkshopOpen}
        onClose={() => setIsProjectWorkshopOpen(false)}
      />
      <VisualMathProofsModal
        isOpen={isProofsOpen}
        onClose={() => setIsProofsOpen(false)}
      />
      <StudentQuestionAuthoringModal
        isOpen={isAuthoringOpen}
        onClose={() => setIsAuthoringOpen(false)}
      />
      <FeynmanVoiceExplanationModal
        isOpen={isFeynmanOpen}
        onClose={() => setIsFeynmanOpen(false)}
      />
    </main>
  );
}
