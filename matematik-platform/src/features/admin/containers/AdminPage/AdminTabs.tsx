import type { ContentDocument } from '@/types';
import type { Dispatch, SetStateAction } from 'react';
import {
  FileText,
  Megaphone,
  CheckCircle2,
  Users,
  RefreshCw,
  Search,
  ClipboardList,
  BarChart3,
  Activity,
  CalendarDays,
  Video,
  GraduationCap,
} from 'lucide-react';
import { useAdminListActions } from '@/features/admin/hooks/useAdminListActions';

import type {
  AdminActiveTab,
  AdminAnnouncement as Announcement,
  AdminAssignment as Assignment,
  AdminQuiz as Quiz,
  AnnualPlanItem,
  WorksheetCandidate,
} from '@/features/admin/types';
import type { LiveLessonDashboardData } from '@/features/live-lessons/types';

type AdminTabsProps = {
  setTabCategory: Dispatch<
    SetStateAction<'all' | 'curriculum' | 'general' | 'education'>
  >;
  tabCategory: 'all' | 'curriculum' | 'general' | 'education';
  studentUsers: ReturnType<typeof useAdminListActions>['studentUsers'];
  documents: ContentDocument[];
  quizzes: Quiz[];
  assignments: Assignment[];
  liveLessons: LiveLessonDashboardData;
  annualPlanItems: AnnualPlanItem[];
  worksheetCandidates: WorksheetCandidate[];
  announcements: Announcement[];
  setActiveTab: Dispatch<SetStateAction<AdminActiveTab>>;
  activeTab: AdminActiveTab;
};

export function AdminTabs({
  setTabCategory,
  tabCategory,
  studentUsers,
  documents,
  quizzes,
  assignments,
  liveLessons,
  annualPlanItems,
  worksheetCandidates,
  announcements,
  setActiveTab,
  activeTab,
}: AdminTabsProps) {
  return (
    <div className="sticky top-14 sm:top-16 z-40 -mx-4 sm:mx-0 mb-6 sm:mb-8 px-4 sm:px-0 py-3 backdrop-blur-md bg-surface-1/80 dark:bg-surface-0/40 rounded-2xl border border-border-default dark:border-border-default shadow-sm">
      {/* Category Segment Filter */}
      <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {[
          { id: 'all', label: 'Tümü', count: 12 },
          { id: 'general', label: '📊 Genel & Takip', count: 4 },
          { id: 'education', label: '📚 Eğitim & İçerik', count: 4 },
          { id: 'curriculum', label: '⚙️ Plan & Otomasyon', count: 4 },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setTabCategory(cat.id as typeof tabCategory)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              tabCategory === cat.id
                ? 'bg-accent-bg text-primary dark:text-primary shadow-btn-3d-green'
                : 'bg-surface-1 dark:bg-surface-1/5 text-secondary dark:text-tertiary hover:text-primary dark:hover:text-primary hover:bg-surface-2/70 dark:hover:bg-surface-1/10'
            }`}
          >
            {cat.label}
            <span className="ml-1.5 opacity-60 text-[10px]">({cat.count})</span>
          </button>
        ))}
      </div>

      {/* Individual Tab Buttons */}
      <div className="flex flex-nowrap gap-1.5 sm:gap-2.5 overflow-x-auto pb-1 sm:pb-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {[
          {
            id: 'statistics',
            label: 'İstatistikler',
            shortLabel: 'İstat.',
            icon: BarChart3,
            color: 'from-tone-success-bg to-tone-success-bg',
            category: 'general',
            badge: null,
          },
          {
            id: 'tracking',
            label: 'Takip Merkezi',
            shortLabel: 'Takip',
            icon: Activity,
            color: 'from-tone-info-bg to-tone-info-bg',
            category: 'general',
            badge: null,
          },
          {
            id: 'classroom',
            label: 'Sınıfım & Şube Masası',
            shortLabel: 'Sınıfım',
            icon: GraduationCap,
            color: 'from-accent-bg to-accent-bg',
            category: 'general',
            badge: studentUsers.length > 0 ? studentUsers.length : null,
          },
          {
            id: 'users',
            label: 'Kullanıcılar',
            shortLabel: 'Kullanıcılar',
            icon: Users,
            color: 'from-tone-info-bg to-tone-info-bg',
            category: 'general',
            badge: studentUsers.length,
          },
          {
            id: 'documents',
            label: 'Belgeler',
            shortLabel: 'Belgeler',
            icon: FileText,
            color: 'from-tone-info-bg to-tone-info-bg',
            category: 'education',
            badge: documents.length,
          },
          {
            id: 'quizzes',
            label: 'Testler',
            shortLabel: 'Testler',
            icon: CheckCircle2,
            color: 'from-tone-info-bg to-tone-info-bg',
            category: 'education',
            badge: quizzes.length,
          },
          {
            id: 'assignments',
            label: 'Ödevlendirme',
            shortLabel: 'Ödevler',
            icon: ClipboardList,
            color: 'from-tone-danger-bg to-tone-info-bg',
            category: 'education',
            badge: assignments.length,
          },
          {
            id: 'liveLessons',
            label: 'Canlı Dersler',
            shortLabel: 'Canlı Ders',
            icon: Video,
            color: 'from-tone-info-bg to-tone-info-bg',
            category: 'education',
            badge:
              liveLessons.lessons.length > 0
                ? liveLessons.lessons.length
                : null,
          },
          {
            id: 'contentCoverage',
            label: 'İçerik Kapsamı',
            shortLabel: 'Kapsam',
            icon: FileText,
            color: 'from-tone-info-bg to-tone-info-bg',
            category: 'curriculum',
            badge: null,
          },
          {
            id: 'annualPlan',
            label: 'Yıllık Plan',
            shortLabel: 'Plan',
            icon: CalendarDays,
            color: 'from-tone-success-bg to-tone-success-bg',
            category: 'curriculum',
            badge: annualPlanItems.length > 0 ? annualPlanItems.length : null,
          },
          {
            id: 'worksheetCandidates',
            label: 'Test Adayları',
            shortLabel: 'Adaylar',
            icon: Search,
            color: 'from-tone-warn-bg to-tone-warn-bg',
            category: 'curriculum',
            badge:
              worksheetCandidates.filter((c) => c.status === 'pending')
                .length || null,
            badgeAlert:
              worksheetCandidates.filter((c) => c.status === 'pending').length >
              0,
          },
          {
            id: 'gradeUpdate',
            label: 'Sınıf Güncelle',
            shortLabel: 'Sınıf',
            icon: RefreshCw,
            color: 'from-tone-success-bg to-tone-info-bg',
            category: 'curriculum',
            badge: null,
          },
          {
            id: 'announcements',
            label: 'Duyurular',
            shortLabel: 'Duyurular',
            icon: Megaphone,
            color: 'from-tone-info-bg to-tone-danger-bg',
            category: 'curriculum',
            badge: announcements.length,
          },
        ]
          .filter(
            (tab) => tabCategory === 'all' || tab.category === tabCategory,
          )
          .map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminActiveTab)}
              className={`relative overflow-hidden px-3 py-2 sm:px-4 sm:py-3 rounded-xl flex items-center gap-1.5 sm:gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap shrink-0 border ${
                activeTab === tab.id
                  ? 'bg-accent-bg text-primary dark:text-primary border-accent-fg shadow-btn-3d-green ring-1 ring-border-strong'
                  : `bg-surface-1 dark:bg-surface-0/80 border-border-default dark:border-border-default text-primary dark:text-tertiary hover:text-primary dark:hover:text-primary hover:border-border-default dark:hover:border-border-default hover:bg-surface-1 dark:hover:bg-surface-3/80 shadow-sm dark:shadow-md`
              }`}
            >
              {activeTab === tab.id && (
                <span className="absolute inset-0 bg-surface-1/10 pointer-events-none" />
              )}
              <tab.icon className="w-4 h-4 sm:w-4.5 sm:h-4.5 flex-shrink-0" />
              <span className="relative font-semibold text-xs sm:text-sm">
                {tab.label}
              </span>
              {tab.badge !== null && (
                <span
                  className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                    tab.badgeAlert
                      ? 'bg-tone-warn-bg text-primary animate-pulse'
                      : activeTab === tab.id
                        ? 'bg-surface-1/25 text-primary dark:text-primary'
                        : 'bg-surface-1 dark:bg-surface-1/10 text-secondary dark:text-tertiary'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
      </div>
    </div>
  );
}
