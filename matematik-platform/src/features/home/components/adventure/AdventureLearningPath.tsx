'use client';

import { useState } from 'react';
import {
  Star,
  CheckCircle2,
  Play,
  BookOpen,
  FileCheck2,
  Gamepad2,
  Sparkles,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { SafeLink } from '@/components/SafeLink';
import { type AdventureTopicNode } from './AdventureCurriculumData';
import { useAccessibleModal } from '@/hooks/useAccessibleModal';
import type { calculateAdventureTopics } from './adventure-progress';

type ProgressTopic = ReturnType<
  typeof calculateAdventureTopics<AdventureTopicNode>
>[number];
interface AdventureLearningPathProps {
  selectedGrade: string;
  onGradeChange: (grade: string) => void;
  topics: ProgressTopic[];
  showProgress: boolean;
  onOpenFlashcards?: (subject?: string) => void;
}

export function AdventureLearningPath({
  selectedGrade,
  onGradeChange,
  topics,
  showProgress,
  onOpenFlashcards,
}: AdventureLearningPathProps) {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const activeNodeDetail =
    topics.find((topic) => topic.id === activeNodeId) || null;
  const modalRef = useAccessibleModal<HTMLDivElement>(
    Boolean(activeNodeDetail),
    () => setActiveNodeId(null),
  );

  return (
    <div className="card-playful relative overflow-hidden rounded-3xl p-5 sm:p-8 transition-all duration-300">
      {/* Başlık ve Sınıf Seçici */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-default">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider bg-[#ddf4ff] text-[#0c6999] dark:bg-sky-950/40 dark:text-sky-300 border border-[#1899d6]/30 mb-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[#1cb0f6]" />
            <span>Matematik Seviye Haritası</span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-black text-primary">
            Konu Adalarını Fethet!
          </h2>
          <p className="text-xs sm:text-sm text-secondary mt-0.5">
            Konuları çalış, testleri çöz ve ilerlemeni yıldızlarla takip et. Tüm
            konular açık!
          </p>
        </div>

        {/* Sınıf Çipleri (3D Butonlar) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full [scrollbar-width:none]">
          {[
            { label: '5. Sınıf', id: '5' },
            { label: '6. Sınıf', id: '6' },
            { label: '7. Sınıf', id: '7' },
            { label: '8. Sınıf (LGS)', id: '8' },
            { label: '9. Sınıf', id: '9' },
            { label: '10. Sınıf', id: '10' },
            { label: '11. Sınıf', id: '11' },
            { label: '12. Sınıf / Mezun', id: '12' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                onGradeChange(tab.id);
                setActiveNodeId(null);
              }}
              className={`btn-3d btn-sm ${
                selectedGrade === tab.id ? 'btn-green' : 'btn-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dikey / Kıvrımlı Patika Alanı */}
      <div className="relative max-w-xl mx-auto py-8 sm:py-14">
        {/* Kıvrımlı Arka Plan Çizgisi ve Enerji Yolu */}
        <div
          aria-hidden="true"
          className="absolute inset-y-10 left-1/2 -translate-x-1/2 w-1 border-r-2 border-dashed border-indigo-500/30 pointer-events-none"
        />

        <div className="relative space-y-12 sm:space-y-16">
          {topics.map((topic, index) => {
            // Zigzag ofset hesaplama (Sol - Orta - Sağ)
            const alignment =
              index % 3 === 0
                ? 'justify-center sm:-translate-x-14'
                : index % 3 === 1
                  ? 'justify-center sm:translate-x-14'
                  : 'justify-center';

            const isCompleted = showProgress && topic.status === 'completed';
            const isActive = topic.status === 'active';

            return (
              <div
                key={topic.id}
                className={`flex ${alignment} relative group`}
              >
                <div className="flex flex-col items-center">
                  {/* Aktif Düğümde "BURADAN BAŞLA" Çizgi Film Rozeti */}
                  {isActive && (
                    <div className="mb-3 animate-bounce flex items-center gap-1.5 rounded-full bg-[#58cc02] px-3.5 py-1 text-xs font-black uppercase tracking-wider text-white dark:text-white shadow-[0_3px_0_#46a302]">
                      <Play className="h-3 w-3 fill-current" />
                      <span>Buradasın!</span>
                    </div>
                  )}

                  {/* 3D TACTILE GAME BUTTON (Duolingo Tarzı) */}
                  <div className="relative">
                    {/* Aktif Düğüm Dış Halo Işıması */}
                    {isActive && (
                      <div
                        aria-hidden="true"
                        className="absolute -inset-2.5 rounded-3xl bg-[#58cc02]/30 opacity-50 blur-lg animate-pulse pointer-events-none"
                      />
                    )}

                    <button
                      type="button"
                      onClick={() => setActiveNodeId(topic.id)}
                      aria-label={`${topic.unitNumber}. Ünite: ${topic.title}`}
                      className={`relative flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-3xl font-black transition-all duration-150 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500 cursor-pointer select-none ${
                        isActive
                          ? 'bg-[#58cc02] text-white dark:text-white shadow-[0_8px_0_#46a302] hover:bg-[#61e002] active:translate-y-2 active:shadow-[0_1px_0_#46a302] scale-105'
                          : isCompleted
                            ? 'bg-[#1cb0f6] text-white dark:text-white shadow-[0_8px_0_#1899d6] hover:bg-[#33beff] active:translate-y-2 active:shadow-[0_1px_0_#1899d6] hover:scale-105'
                            : 'bg-surface-2 text-tertiary border-2 border-default shadow-[0_6px_0_var(--border-default)] opacity-80 hover:opacity-100 hover:bg-surface-3 active:translate-y-1.5 active:shadow-none'
                      }`}
                    >
                      {/* Düğüm İçi İkon */}
                      {isCompleted ? (
                        <CheckCircle2 className="h-9 w-9 text-white dark:text-white drop-shadow-xs" />
                      ) : isActive ? (
                        <Play className="h-9 w-9 fill-white text-white dark:text-white drop-shadow-xs" />
                      ) : (
                        <BookOpen className="h-7 w-7 text-secondary/60" />
                      )}

                      {/* Düğüm Üzerinde Yıldızlar (Eğer tamamlandıysa) */}
                      {showProgress && (
                        <div
                          aria-label={`${topic.stars} yıldız`}
                          className="absolute -bottom-2.5 flex items-center gap-0.5 rounded-full bg-surface-3 px-2.5 py-0.5 border border-default shadow-xs"
                        >
                          {Array.from({ length: 3 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < topic.stars
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-tertiary opacity-40'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </button>
                  </div>

                  {/* Düğüm Altı Başlık Kapsülü */}
                  <div className="mt-3.5 text-center max-w-[200px] rounded-2xl px-3 py-1.5 bg-surface-2/80 backdrop-blur-xs border border-default/70 shadow-xs">
                    <span className="block text-[10px] font-black uppercase tracking-wider text-secondary">
                      {`${topic.unitNumber}. Ünite`} ·{' '}
                      {isCompleted ? 'Tamamlandı' : isActive ? 'Aktif' : 'Açık'}
                    </span>
                    <h3 className="font-display text-xs sm:text-sm font-bold text-primary truncate mt-0.5">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="adventure-topic-title"
            tabIndex={-1}
            className="card-playful relative w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider bg-[#ddf4ff] text-[#0c6999] dark:bg-sky-950/40 dark:text-sky-300 border border-[#1899d6]/30">
                  {`${activeNodeDetail.unitNumber}. Bölüm`}
                </span>
                <h3
                  id="adventure-topic-title"
                  className="font-display text-xl font-bold text-primary mt-1.5"
                >
                  {activeNodeDetail.title}
                </h3>
                <p className="text-xs text-secondary mt-1">
                  {showProgress
                    ? `Konu ilerlemen: %${activeNodeDetail.mastery}`
                    : 'Ders notları ve yaprak testlerle çalışabilirsin.'}
                </p>
              </div>

              <button
                type="button"
                aria-label="Konu penceresini kapat"
                onClick={() => setActiveNodeId(null)}
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
                    <h4 className="text-sm font-bold text-primary">
                      Ders Notunu İncele
                    </h4>
                    <p className="text-xs text-secondary">
                      Kazanım özetleri ve formül föyü
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-secondary group-hover:translate-x-0.5 transition-transform" />
              </SafeLink>

              <SafeLink
                href={activeNodeDetail.testsHref}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-purple-500/30 transition-all hover:scale-[1.01] group bg-brand-primary hover:bg-brand-primary-soft text-slate-950 dark:text-slate-950 shadow-btn-3d-green active:translate-y-1 active:shadow-none"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300">
                    <FileCheck2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-primary">
                      Yaprak Testi Çöz
                    </h4>
                    <p className="text-xs text-secondary">
                      Bu konunun kazanımlarına çalış
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-secondary group-hover:translate-x-0.5 transition-transform" />
              </SafeLink>

              {activeNodeDetail.gameHref && (
                <SafeLink
                  href={activeNodeDetail.gameHref}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-default bg-surface-2 hover:bg-surface-3 transition-all hover:scale-[1.01] group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400">
                      <Gamepad2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-primary">
                        Oyunla Pratik Yap
                      </h4>
                      <p className="text-xs text-secondary">
                        Hızlı hesaplama ve eğlenceli düello
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-secondary group-hover:translate-x-0.5 transition-transform" />
                </SafeLink>
              )}
              {activeNodeDetail.flashcardSubject && onOpenFlashcards && (
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-2xl border border-default bg-surface-2 p-3.5 text-sm font-bold text-primary hover:bg-surface-3"
                  onClick={() => {
                    onOpenFlashcards(activeNodeDetail.flashcardSubject);
                    setActiveNodeId(null);
                  }}
                >
                  <Layers className="h-5 w-5" /> Konunun Formül Kartları
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdventureLearningPath;
