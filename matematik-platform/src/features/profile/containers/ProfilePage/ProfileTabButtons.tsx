'use client';

import {
  Clock,
  FileSpreadsheet,
  FolderKanban,
  LayoutDashboard,
  Lightbulb,
  Mic,
  PenTool,
  Sliders,
  StickyNote,
} from 'lucide-react';

export type ProfileTab = 'overview' | 'notes' | 'settings';

export const PROFILE_TABS: Array<{
  id: ProfileTab;
  label: string;
  icon: typeof LayoutDashboard;
}> = [
  { id: 'overview', label: 'Genel Bakış', icon: LayoutDashboard },
  { id: 'notes', label: 'Notlar', icon: StickyNote },
  { id: 'settings', label: 'Ayarlar', icon: Sliders },
];

export type ProfileTabButtonsProps = {
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
  onOpenParentReport: () => void;
  onOpenPortfolio: () => void;
  onOpenAhaModal: () => void;
  onOpenTimeCapsule: () => void;
  onOpenAuthoringModal: () => void;
  onOpenFeynmanModal: () => void;
};

export function ProfileTabButtons({
  activeTab,
  onTabChange,
  onOpenParentReport,
  onOpenPortfolio,
  onOpenAhaModal,
  onOpenTimeCapsule,
  onOpenAuthoringModal,
  onOpenFeynmanModal,
}: ProfileTabButtonsProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div
        role="tablist"
        aria-label="Profil bölümleri"
        className="flex flex-1 gap-2 overflow-x-auto rounded-2xl border border-default bg-surface-1 p-1.5 backdrop-blur"
      >
        {PROFILE_TABS.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              id={`profile-tab-${tab.id}`}
              aria-controls={`profile-panel-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                isActive
                  ? 'shadow-lg bg-brand-primary text-slate-950 dark:text-slate-950'
                  : 'text-secondary hover:bg-overlay-2 hover:text-primary'
              }`}
            >
              <TabIcon className="h-4 w-4" />
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={onOpenParentReport}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-default bg-surface-2 px-4 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-overlay-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        title="WhatsApp gelişim özeti ve karne PDF'i oluştur"
      >
        <FileSpreadsheet className="h-4 w-4 text-accent-success-ink" />
        <span className="whitespace-nowrap">Gelişim Raporu</span>
      </button>
      <button
        type="button"
        onClick={onOpenPortfolio}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-default bg-surface-2 px-4 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-overlay-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        title="Öğrenci matematik gelişim dosyası ve portfolyosu"
      >
        <FolderKanban className="h-4 w-4 text-accent-brand-ink" />
        <span className="whitespace-nowrap">Gelişim Portfolyosu</span>
      </button>
      <button
        type="button"
        onClick={onOpenAhaModal}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-default bg-surface-2 px-4 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-overlay-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        title="Aha! Anları ve Matematik Keşif Günlüğü"
      >
        <Lightbulb className="h-4 w-4 text-accent-warning-ink" />
        <span className="whitespace-nowrap">Aha! Keşif Günlüğü</span>
      </button>
      <button
        type="button"
        onClick={onOpenTimeCapsule}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-default bg-surface-2 px-4 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-overlay-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        title="Sene başı - sene sonu hedef zaman kapsülü"
      >
        <Clock className="h-4 w-4 text-accent-info-ink" />
        <span className="whitespace-nowrap">Hedef Zaman Kapsülü</span>
      </button>
      <button
        type="button"
        onClick={onOpenAuthoringModal}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-default bg-surface-2 px-4 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-overlay-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        title="Kendi matematik sorularını yaz ve çeldiricilerini kurgula"
      >
        <PenTool className="h-4 w-4 text-accent-brand-ink" />
        <span className="whitespace-nowrap">Soru Yazarlık</span>
      </button>
      <button
        type="button"
        onClick={onOpenFeynmanModal}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-default bg-surface-2 px-4 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-overlay-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        title="60 saniyede sesli Feynman anlatımı"
      >
        <Mic className="h-4 w-4 text-accent-danger-ink" />
        <span className="whitespace-nowrap">Feynman Anlatımı</span>
      </button>
    </div>
  );
}
