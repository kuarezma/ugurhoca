'use client';

import { useState, useEffect, useId } from 'react';
import {
  X,
  Compass,
  CheckCircle2,
  ListChecks,
  Award,
  Lightbulb,
} from 'lucide-react';
import { useAccessibleModal } from '@/hooks/useAccessibleModal';
import {
  MATH_PROJECTS,
  getProjectProgress,
  toggleProjectStep,
  type MathProject,
  type ProjectProgressRecord,
} from '../lib/mathProjectData';

type MathProjectWorkshopModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function MathProjectWorkshopModal({
  isOpen,
  onClose,
}: MathProjectWorkshopModalProps) {
  const titleId = useId();
  const modalRef = useAccessibleModal<HTMLDivElement>(isOpen, onClose);
  const [selectedProject, setSelectedProject] = useState<MathProject>(MATH_PROJECTS[0]);
  const [progress, setProgress] = useState<ProjectProgressRecord>({
    projectId: MATH_PROJECTS[0].id,
    completedSteps: [],
    lastUpdated: new Date().toISOString(),
  });

  useEffect(() => {
    if (isOpen) {
      setProgress(getProjectProgress(selectedProject.id));
    }
  }, [isOpen, selectedProject.id]);

  const handleToggleStep = (stepNumber: number) => {
    const updated = toggleProjectStep(selectedProject.id, stepNumber);
    setProgress(updated);
  };

  if (!isOpen) return null;

  const completedCount = progress.completedSteps.length;
  const totalCount = selectedProject.milestones.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <div
      className="fixed inset-0 z-[160] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        ref={modalRef}
        className="relative flex flex-col w-full max-w-4xl max-h-[92vh] rounded-3xl border border-white/10 bg-slate-900 text-white shadow-2xl overflow-hidden"
      >
        {/* Başlık */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-rose-600 text-white shadow-md shadow-amber-500/25">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id={titleId} className="text-base font-bold tracking-tight text-white">
                  Matematik Proje Atölyesi
                </h2>
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                  Gerçek Hayat & Araştırma
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Formülleri ezberlemek yerine somut dünyayı modelleyin, aşama aşama proje üretin.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-white/10 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* İçerik: Sol Proje Menüsü & Sağ Detay Paneli */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
          {/* Sol Kolon: Proje Seçici */}
          <div className="p-4 space-y-2.5 bg-slate-950/40">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Aktif Proje Konuları ({MATH_PROJECTS.length})
            </h3>

            {MATH_PROJECTS.map((proj) => {
              const isSelected = selectedProject.id === proj.id;
              const projProg = getProjectProgress(proj.id);
              const pCount = projProg.completedSteps.length;

              return (
                <button
                  key={proj.id}
                  type="button"
                  onClick={() => setSelectedProject(proj)}
                  className={`w-full text-left p-3 rounded-2xl border transition ${
                    isSelected
                      ? 'border-amber-500/60 bg-amber-500/10 shadow-lg'
                      : 'border-white/5 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="font-bold text-amber-400">{proj.grade}. Sınıf</span>
                    <span className="px-1.5 py-0.5 rounded bg-white/5">{proj.difficulty}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white leading-snug line-clamp-2">{proj.title}</h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-white/5">
                    <span>{proj.durationWeeks} Hafta</span>
                    <span className="text-emerald-400 font-semibold">{pCount}/{proj.milestones.length} Aşama</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Sağ Alan: Seçilen Projenin Detayları & Aşamaları (2 Kolon) */}
          <div className="md:col-span-2 p-5 sm:p-6 space-y-5 overflow-y-auto">
            {/* Proje Başlık & İlerleme */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                  {selectedProject.difficulty} Düzey • {selectedProject.durationWeeks} Haftalık Proje
                </span>

                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <span>İlerleme: %{progressPercent}</span>
                  <div className="w-24 h-2 rounded-full bg-slate-800 overflow-hidden border border-white/10">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white">{selectedProject.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{selectedProject.summary}</p>
            </div>

            {/* Gerçek Hayat Senaryosu */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
              <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4" /> Gerçek Hayat Rolü & Senaryo
              </h4>
              <p className="text-xs text-amber-100/90 leading-relaxed">
                {selectedProject.realWorldScenario}
              </p>
            </div>

            {/* Aşamalar (Milestones) */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <ListChecks className="w-4 h-4 text-emerald-400" /> Proje Adımları & Teslim Takvimi
              </h4>

              <div className="space-y-2">
                {selectedProject.milestones.map((ms) => {
                  const isDone = progress.completedSteps.includes(ms.step);

                  return (
                    <button
                      key={ms.step}
                      type="button"
                      onClick={() => handleToggleStep(ms.step)}
                      className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition ${
                        isDone
                          ? 'border-emerald-500/40 bg-emerald-500/10'
                          : 'border-white/5 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition ${
                          isDone
                            ? 'border-emerald-400 bg-emerald-500 text-white'
                            : 'border-slate-600 bg-slate-800 text-transparent'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{ms.step}. Aşama: {ms.title}</span>
                          {isDone && (
                            <span className="text-[10px] font-bold text-emerald-400">Tamamlandı</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{ms.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Değerlendirme Rubriği */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-purple-400" /> Değerlendirme Rubriği (100 Puan)
              </h4>

              <div className="rounded-2xl border border-white/10 overflow-hidden text-xs">
                <div className="grid grid-cols-12 bg-white/5 p-2.5 font-bold text-slate-300 border-b border-white/10">
                  <span className="col-span-4">Ölçüt</span>
                  <span className="col-span-2 text-center">Puan</span>
                  <span className="col-span-6">Beklenti</span>
                </div>
                {selectedProject.rubric.map((r, i) => (
                  <div
                    key={r.criterion}
                    className={`grid grid-cols-12 p-2.5 items-center ${
                      i !== selectedProject.rubric.length - 1 ? 'border-b border-white/5' : ''
                    }`}
                  >
                    <span className="col-span-4 font-semibold text-white">{r.criterion}</span>
                    <span className="col-span-2 text-center font-bold text-amber-400">{r.maxPoints} P</span>
                    <span className="col-span-6 text-slate-400 text-[11px]">{r.description}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Teslim Edilecek Materyaller */}
            <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-indigo-300">Beklenen Teslim Çıktıları:</span>
                <p className="text-slate-400 text-[11px]">
                  {selectedProject.sampleDeliverables.join(' • ')}
                </p>
              </div>

              <span className="rounded-xl bg-indigo-600/30 border border-indigo-500/40 px-3 py-1.5 text-xs font-bold text-indigo-200">
                Ödevler Sayfasından Yüklenebilir
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MathProjectWorkshopModal;
