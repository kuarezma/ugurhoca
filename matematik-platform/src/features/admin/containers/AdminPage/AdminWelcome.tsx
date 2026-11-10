import type { AppUser, ContentDocument } from '@/types';
import type { Dispatch, SetStateAction } from 'react';
import { SafeLink as Link } from '@/components/SafeLink';
import {
  ArrowLeft,
  Plus,
  Megaphone,
  CheckCircle2,
  ClipboardList,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Send,
} from 'lucide-react';
import { useAdminListActions } from '@/features/admin/hooks/useAdminListActions';
import { useAdminModalState } from '@/features/admin/hooks/useAdminModalState';

import type {
  AdminQuiz as Quiz,
  WorksheetCandidate,
} from '@/features/admin/types';

type AdminWelcomeProps = {
  user: AppUser;
  studentUsers: ReturnType<typeof useAdminListActions>['studentUsers'];
  documents: ContentDocument[];
  quizzes: Quiz[];
  worksheetCandidates: WorksheetCandidate[];
  openModal: ReturnType<typeof useAdminModalState>['openModal'];
  setIsBroadcastOpen: Dispatch<SetStateAction<boolean>>;
};

export function AdminWelcome({
  user,
  studentUsers,
  documents,
  quizzes,
  worksheetCandidates,
  openModal,
  setIsBroadcastOpen,
}: AdminWelcomeProps) {
  return (
    <div className="bg-surface-1 rounded-3xl p-5 sm:p-7 mb-8 border border-border-default dark:border-border-default shadow-lg dark:shadow-2xl relative overflow-hidden animate-fade-up bg-surface-1/80 dark:bg-surface-0/60">
      <div className="absolute -right-16 -top-16 w-64 h-64 bg-tone-info-bg rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-tone-info-bg rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <Link
              href="/profil"
              className="inline-flex items-center gap-1.5 text-xs text-secondary dark:text-tertiary hover:text-primary dark:hover:text-primary transition-colors mr-2 group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              Profil'e Dön
            </Link>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-tone-info-bg dark:bg-tone-info-bg text-tone-info-fg dark:text-tone-info-fg border border-tone-info-border dark:border-tone-info-border">
              <ShieldCheck className="w-3.5 h-3.5" />
              Yönetici Portalı
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-tone-success-bg dark:bg-tone-success-bg text-tone-success-fg dark:text-tone-success-fg border border-tone-success-border dark:border-tone-success-border">
              <span className="w-1.5 h-1.5 rounded-full bg-tone-success-bg dark:bg-tone-success-bg animate-pulse" />
              Sistem Aktif
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-primary dark:text-primary tracking-tight">
            Hoş Geldiniz, {user.name || 'Uğur Hoca'} 👋
          </h1>
          <p className="text-secondary dark:text-tertiary text-sm sm:text-base mt-1.5 max-w-xl leading-relaxed">
            Öğrenci takibi, çalışma kağıtları, sınavlar ve canlı derslerinizi
            tek merkezden uyumla yönetin.
          </p>
        </div>

        {/* Quick KPI Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
          <div className="bg-surface-1 rounded-2xl p-3 sm:p-4 text-center border border-border-default dark:border-border-default hover:border-tone-info-border transition-colors bg-surface-1/80 dark:bg-surface-1/5">
            <div className="text-xl sm:text-2xl font-black text-primary dark:text-primary">
              {studentUsers.length}
            </div>
            <div className="text-xs text-secondary dark:text-tertiary font-medium mt-0.5">
              Öğrenci
            </div>
          </div>
          <div className="bg-surface-1 rounded-2xl p-3 sm:p-4 text-center border border-border-default dark:border-border-default hover:border-tone-info-border transition-colors bg-surface-1/80 dark:bg-surface-1/5">
            <div className="text-xl sm:text-2xl font-black text-primary dark:text-primary">
              {documents.length}
            </div>
            <div className="text-xs text-secondary dark:text-tertiary font-medium mt-0.5">
              İçerik & Belge
            </div>
          </div>
          <div className="bg-surface-1 rounded-2xl p-3 sm:p-4 text-center border border-border-default dark:border-border-default hover:border-tone-info-border transition-colors bg-surface-1/80 dark:bg-surface-1/5">
            <div className="text-xl sm:text-2xl font-black text-primary dark:text-primary">
              {quizzes.length}
            </div>
            <div className="text-xs text-secondary dark:text-tertiary font-medium mt-0.5">
              Test / Sınav
            </div>
          </div>
          <div className="bg-surface-1 rounded-2xl p-3 sm:p-4 text-center border border-border-default dark:border-border-default hover:border-tone-warn-border transition-colors bg-surface-1/80 dark:bg-surface-1/5">
            <div className="text-xl sm:text-2xl font-black text-tone-warn-fg dark:text-tone-warn-fg">
              {worksheetCandidates.filter((c) => c.status === 'pending').length}
            </div>
            <div className="text-xs text-secondary dark:text-tertiary font-medium mt-0.5">
              Aday Test
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons Strip */}
      <div className="relative z-10 mt-6 pt-4 border-t border-border-default dark:border-border-default flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-secondary dark:text-tertiary mr-1 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-tone-info-fg dark:text-tone-info-fg" />
          Hızlı Eylemler:
        </span>
        <button
          onClick={() => openModal('document')}
          className="btn-primary text-xs py-2 px-3 sm:px-4 rounded-xl"
        >
          <Plus className="w-3.5 h-3.5" />
          Yeni Belge Ekle
        </button>
        <button
          onClick={() => openModal('announcement')}
          className="btn-secondary text-xs py-2 px-3 sm:px-4 rounded-xl"
        >
          <Megaphone className="w-3.5 h-3.5 text-tone-info-fg dark:text-tone-info-fg" />
          Yeni Duyuru
        </button>
        <button
          onClick={() => setIsBroadcastOpen(true)}
          className="btn-secondary text-xs py-2 px-3 sm:px-4 rounded-xl"
        >
          <Send className="w-3.5 h-3.5 text-tone-info-fg dark:text-tone-info-fg" />
          Toplu Bildirim
        </button>
        <button
          onClick={() => openModal('quiz')}
          className="btn-secondary text-xs py-2 px-3 sm:px-4 rounded-xl"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-tone-info-fg dark:text-tone-info-fg" />
          Yeni Test
        </button>
        <button
          onClick={() => openModal('assignment')}
          className="btn-secondary text-xs py-2 px-3 sm:px-4 rounded-xl"
        >
          <ClipboardList className="w-3.5 h-3.5 text-tone-danger-fg dark:text-tone-danger-fg" />
          Ödev Ver
        </button>
        <Link
          href="/"
          target="_blank"
          className="btn-secondary text-xs py-2 px-3 sm:px-4 rounded-xl ml-auto"
          title="Platformun ön yüzünü yeni sekmede aç"
        >
          <ExternalLink className="w-3.5 h-3.5 text-tone-info-fg dark:text-tone-info-fg" />
          <span>Siteyi Aç</span>
        </Link>
      </div>
    </div>
  );
}
