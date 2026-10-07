'use client';

import { useState } from 'react';
import {
  Star,
  Lock,
  CheckCircle2,
  Play,
  Crown,
  BookOpen,
  FileCheck2,
  Gamepad2,
  Sparkles,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { SafeLink } from '@/components/SafeLink';
import {
  ADVENTURE_CURRICULUM,
  type AdventureTopicNode,
} from './AdventureCurriculumData';

interface AdventureLearningPathProps {
  initialGrade?: string;
  onOpenFlashcards?: () => void;
  onOpenCalculator?: () => void;
}

export function AdventureLearningPath({
  initialGrade = '8',
  onOpenFlashcards,
  onOpenCalculator,
}: AdventureLearningPathProps) {
  const [selectedGrade, setSelectedGrade] = useState<string>(initialGrade);
  const [activeNodeDetail, setActiveNodeDetail] = useState<AdventureTopicNode | null>(null);

  const topics = ADVENTURE_CURRICULUM[selectedGrade] || ADVENTURE_CURRICULUM['8'];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-default bg-surface-1 shadow-2xl p-4 sm:p-8 transition-all duration-300">
      {/* Başlık ve Sınıf Seçici */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-default">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider bg-purple-500/15 text-purple-300 border border-purple-400/30 mb-1">
            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
            <span>Matematik Patikası</span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-black text-primary">
            Öğrenme Haritası & Seviyeler
          </h2>
          <p className="text-xs sm:text-sm text-secondary mt-0.5">
            Düğümleri tamamla, yıldızları ve XP ödüllerini toplayarak seviye atla!
          </p>
        </div>

        {/* Sınıf Çipleri */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full [scrollbar-width:none]">
          {[
            { label: '5. Sınıf', id: '5' },
            { label: '6. Sınıf', id: '6' },
            { label: '7. Sınıf', id: '7' },
            { label: '8. Sınıf (LGS)', id: '8', highlight: true },
            { label: 'YKS / Lise', id: 'YKS' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedGrade(tab.id)}
              className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all duration-200 cursor-pointer ${
                selectedGrade === tab.id
                  ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white shadow-md shadow-purple-500/20 scale-105'
                  : 'bg-surface-2 text-secondary hover:text-primary hover:bg-surface-3 border border-default'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dikey / Kıvrımlı Patika Alanı */}
      <div className="relative max-w-xl mx-auto py-8 sm:py-12">
        {/* Kıvrımlı Arka Plan Çizgisi (SVG Yolu) */}
        <div className="absolute inset-y-8 left-1/2 -translate-x-1/2 w-1 border-r-2 border-dashed border-indigo-500/25 pointer-events-none" />

        <div className="relative space-y-10 sm:space-y-14">
          {topics.map((topic, index) => {
            // Zigzag ofset hesaplama (Sol - Orta - Sağ)
            const alignment =
              index % 3 === 0
                ? 'justify-center sm:-translate-x-12'
                : index % 3 === 1
                ? 'justify-center sm:translate-x-12'
                : 'justify-center';

            const isCompleted = topic.status === 'completed';
            const isActive = topic.status === 'active';
            const isLocked = topic.status === 'locked';

            return (
              <div key={topic.id} className={`flex ${alignment} relative group`}>
                <div className="flex flex-col items-center">
                  {/* Aktif Düğümde "BURADASIN" Rozeti */}
                  {isActive && (
                    <div className="mb-2 animate-bounce flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 via-pink-500 to-indigo-500 px-3 py-1 text-[11px] font-black uppercase text-white shadow-lg shadow-pink-500/30">
                      <Play className="h-3 w-3 fill-white" />
                      <span>Buradan Başla!</span>
                    </div>
                  )}

                  {/* Düğüm Butonu */}
                  <button
                    type="button"
                    onClick={() => setActiveNodeDetail(topic)}
                    aria-label={`${topic.unitNumber}. Ünite: ${topic.title}`}
                    className={`relative flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-3xl transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500 cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 text-white shadow-xl shadow-purple-600/40 scale-110 ring-4 ring-purple-400/50 hover:scale-115'
                        : isCompleted
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-lg shadow-emerald-500/25 hover:scale-105 hover:shadow-xl'
                        : topic.boss
                        ? 'bg-gradient-to-br from-amber-500 via-orange-600 to-rose-700 text-white shadow-xl shadow-amber-600/30 hover:scale-105'
                        : 'bg-surface-2 text-tertiary border-2 border-default opacity-80 hover:opacity-100 hover:bg-surface-3'
                    }`}
                  >
                    {/* Düğüm İçi İkon */}
                    {topic.boss ? (
                      <Crown className="h-9 w-9 text-amber-200 animate-pulse" />
                    ) : isCompleted ? (
                      <CheckCircle2 className="h-9 w-9 text-white" />
                    ) : isActive ? (
                      <Play className="h-9 w-9 fill-white text-white animate-pulse" />
                    ) : (
                      <Lock className="h-7 w-7 text-secondary/60" />
                    )}

                    {/* Düğüm Üzerinde Yıldızlar (Eğer tamamlandıysa) */}
                    {isCompleted && (
                      <div className="absolute -bottom-2 flex items-center gap-0.5 rounded-full bg-slate-950/80 px-2 py-0.5 border border-emerald-400/40 shadow">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < topic.stars
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-600'
                            }`}
                          />
                        ))}
                      </div>
                    )}

                    {/* XP Ödül Rozeti */}
                    <div className="absolute -top-2 -right-2 flex items-center gap-0.5 rounded-full bg-indigo-950 px-2 py-0.5 text-[10px] font-bold text-indigo-300 border border-indigo-500/30 shadow">
                      <Zap className="h-2.5 w-2.5 fill-indigo-400 text-indigo-400" />
                      +{topic.xpReward}
                    </div>
                  </button>

                  {/* Düğüm Altı Başlık */}
                  <div className="mt-3 text-center max-w-[180px]">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-secondary">
                      {topic.boss ? 'Bölüm Sonu Sınavı' : `${topic.unitNumber}. Ünite`}
                    </span>
                    <h3 className="font-display text-xs sm:text-sm font-bold text-primary truncate">
                      {topic.title}
                    </h3>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Düğüme Tıklandığında Açılan Detay Kartı (Modal / Drawer) */}
      {activeNodeDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-default bg-surface-1 p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-400/30">
                  {activeNodeDetail.boss ? '👑 Boss Fight' : `${activeNodeDetail.unitNumber}. Ünite`}
                </span>
                <h3 className="font-display text-xl font-bold text-primary mt-1.5">
                  {activeNodeDetail.title}
                </h3>
                <p className="text-xs text-secondary mt-1">
                  {activeNodeDetail.subtitle}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveNodeDetail(null)}
                className="rounded-xl p-1.5 text-secondary hover:bg-surface-2 hover:text-primary transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Aksiyon Butonları */}
            <div className="space-y-2.5 pt-2">
              <SafeLink
                href={activeNodeDetail.notesHref}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-default bg-surface-2 hover:bg-surface-3 transition-all hover:scale-[1.01] group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-primary">Ders Notunu İncele</h4>
                    <p className="text-xs text-secondary">Kazanım özetleri ve formül föyü</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-secondary group-hover:translate-x-0.5 transition-transform" />
              </SafeLink>

              <SafeLink
                href={activeNodeDetail.testsHref}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-500/15 to-pink-500/15 hover:from-purple-500/25 hover:to-pink-500/25 transition-all hover:scale-[1.01] group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300">
                    <FileCheck2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-primary">Yaprak Testi Çöz</h4>
                    <p className="text-xs text-secondary">+{activeNodeDetail.xpReward} XP Kazan</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-secondary group-hover:translate-x-0.5 transition-transform" />
              </SafeLink>

              <SafeLink
                href={activeNodeDetail.gameHref}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-default bg-surface-2 hover:bg-surface-3 transition-all hover:scale-[1.01] group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/15 text-pink-400">
                    <Gamepad2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-primary">Oyunla Pratik Yap</h4>
                    <p className="text-xs text-secondary">Hızlı hesaplama ve eğlenceli düello</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-secondary group-hover:translate-x-0.5 transition-transform" />
              </SafeLink>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdventureLearningPath;
