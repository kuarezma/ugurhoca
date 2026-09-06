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
import { useTheme } from '@/components/ThemeProvider';
import { FormulaFlashcardsModal } from '@/features/programs/components/FormulaFlashcardsModal';
import { ExamScoreCalculatorModal } from '@/components/ExamScoreCalculatorModal';
import { TopicChecklistModal } from '@/features/programs/components/TopicChecklistModal';
import { GeometryMathLabModal } from '@/features/programs/components/GeometryMathLabModal';
import { CurriculumCoverageMatrixModal } from '@/features/programs/components/CurriculumCoverageMatrixModal';
import { MathGlossaryModal } from '@/features/programs/components/MathGlossaryModal';
import { PenTool, Mic } from 'lucide-react';

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
  const { theme } = useTheme();
  const isLight = theme === 'light';
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
      gradient: 'from-cyan-500 via-blue-500 to-indigo-500',
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
      gradient: 'from-violet-500 via-fuchsia-500 to-orange-400',
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
      gradient: 'from-amber-500 via-orange-500 to-rose-500',
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
      gradient: 'from-indigo-500 via-purple-500 to-pink-500',
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
      gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
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
      gradient: 'from-teal-600 via-emerald-600 to-green-500',
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
      gradient: 'from-indigo-600 via-purple-600 to-pink-500',
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
      gradient: 'from-amber-500 via-rose-500 to-purple-600',
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
      gradient: 'from-cyan-500 via-blue-500 to-indigo-600',
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
      gradient: 'from-indigo-500 via-purple-500 to-pink-500',
      bullets: [
        'Kendi matematik sorunu yazma ve çeldirici analizi',
        'Öğretmen onayıyla genel soru havuzuna katılım',
        'Genç Yazar rozeti ve pedagojik geri bildirimler',
      ],
      ctaLabel: 'Atölyeye Katıl',
    },
    {
      id: 'feynman-voice',
      title: '60 Saniyede Feynman Anlatımı',
      subtitle: '«Bir konuyu basitçe anlatabiliyorsan anlamışsındır» sesli anlatım vitrini',
      onClick: () => setIsFeynmanOpen(true),
      icon: Mic,
      gradient: 'from-rose-500 via-pink-500 to-orange-400',
      bullets: [
        '60 saniyelik sesli mikrofon kaydı ve kavram özeti',
        'Akranların anlatımlarını dinleme ve beğenme vitrini',
        'Feynman Ustası rozeti ve öğretmen takdir notları',
      ],
      ctaLabel: 'Anlatımı Başlat',
    },
  ];

  return (
    <main className="programlar-page min-h-screen gradient-bg px-4 pb-12 pt-16 sm:px-6 sm:pt-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className={`inline-flex items-center gap-2 text-sm font-semibold transition-colors ${
              isLight
                ? 'text-slate-700 hover:text-slate-950'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
            Ana Sayfa
          </Link>

          <button
            type="button"
            onClick={() => setIsFlashcardsOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-lg transition hover:scale-[1.02] active:scale-[0.98]"
          >
            <BookOpen className="h-4 w-4" />
            Formül & Bilgi Kartları
          </button>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-3xl border p-6 sm:p-8 ${
            isLight ? 'light-section' : 'glass border-white/10'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white">
                <Sparkles className="h-3.5 w-3.5" />
                Programlar Merkezi
              </div>
              <h1
                className={`text-2xl font-black sm:text-4xl ${isLight ? 'light-text-strong' : 'text-white'}`}
              >
                Hedefine Göre Akıllı Puan ve Tercih Sihirbazları
              </h1>
              <p
                className={`mt-3 text-sm sm:text-base ${isLight ? 'light-text-muted' : 'text-slate-300'}`}
              >
                LGS ve YKS için puanını hesapla, sonra hedef listeni oluştur.
                Sonuçlar kaydedilmez; tamamen anlık hesaplama ve rehberlik
                sunar.
              </p>
            </div>

            <div
              className={`hidden rounded-2xl border p-3 sm:block ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/10 border-white/10'}`}
            >
              <Calculator
                className={`h-8 w-8 ${isLight ? 'text-indigo-600' : 'text-indigo-300'}`}
              />
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {tools.map((tool, index) => (
              <motion.article
                key={tool.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.08 }}
                whileHover={{ y: -4 }}
                className={`tilt-on-hover group relative overflow-hidden rounded-3xl border p-5 sm:p-6 ${
                  isLight ? 'light-card' : 'bg-slate-900/70 border-white/10'
                }`}
              >
                <div
                  className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${tool.gradient}`}
                />
                <div
                  className={`absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${tool.gradient} opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-40`}
                />

                <div className="relative">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div
                      className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${tool.gradient} shadow-lg`}
                    >
                      <tool.icon className="h-6 w-6 text-white" />
                    </div>
                    <Target
                      className={`h-5 w-5 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}
                    />
                  </div>

                  <h2
                    className={`text-lg font-black sm:text-xl ${isLight ? 'text-slate-900' : 'text-white'}`}
                  >
                    {tool.title}
                  </h2>
                  <p
                    className={`mt-2 text-sm ${isLight ? 'text-slate-600' : 'text-slate-300'}`}
                  >
                    {tool.subtitle}
                  </p>

                  <ul className="mt-4 space-y-2">
                    {tool.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className={`flex items-center gap-2 text-sm ${isLight ? 'text-slate-700' : 'text-slate-200'}`}
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
                      className={`mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r ${tool.gradient} px-4 py-2 text-sm font-bold text-white shadow-lg transition hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900`}
                      aria-label={`${tool.title} aracını aç`}
                    >
                      {tool.ctaLabel || 'Aracı Aç'}
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <Link
                      href={tool.href || '#'}
                      className={`mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r ${tool.gradient} px-4 py-2 text-sm font-bold text-white shadow-lg transition hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900`}
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
