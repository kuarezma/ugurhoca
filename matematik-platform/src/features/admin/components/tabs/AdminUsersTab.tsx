'use client';

import { useMemo, useState } from 'react';
import {
  Download,
  Edit3,
  Eye,
  RefreshCw,
  Search,
  Send,
  Star,
  Users,
} from 'lucide-react';
import type { AdminUser } from '@/features/admin/types';

type AdminUsersTabProps = {
  formatDate: (dateString?: string | null) => string;
  onDownloadPdf: () => Promise<void> | void;
  onEditUser: (user: AdminUser) => void;
  onRefresh: () => Promise<void> | void;
  onSendMessage: (user: AdminUser) => void;
  onToggleFavorite: (user: AdminUser) => Promise<void> | void;
  onViewProfile: (user: AdminUser) => Promise<void> | void;
  pdfStudentsLoading: boolean;
  students: AdminUser[];
};

type StudentFilter = 'all' | 'favorites';
type StudentSort = 'name' | 'created_at';

const normalizeSearchText = (value: string) =>
  value.trim().toLocaleLowerCase('tr-TR');

const gradeLabel = (grade: AdminUser['grade']) =>
  grade === 'Mezun' ? 'Mezun' : `${grade}. Sınıf`;

export default function AdminUsersTab({
  formatDate,
  onDownloadPdf,
  onEditUser,
  onRefresh,
  onSendMessage,
  onToggleFavorite,
  onViewProfile,
  pdfStudentsLoading,
  students,
}: AdminUsersTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [studentFilter, setStudentFilter] = useState<StudentFilter>('all');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [studentSort, setStudentSort] = useState<StudentSort>('name');

  const gradeOptions = useMemo(() => {
    const grades = new Set(students.map((student) => String(student.grade)));

    return Array.from(grades).sort((left, right) => {
      if (left === 'Mezun') return 1;
      if (right === 'Mezun') return -1;

      return Number(left) - Number(right);
    });
  }, [students]);

  const visibleStudents = useMemo(() => {
    const normalizedQuery = normalizeSearchText(searchQuery);

    return students
      .filter((student) => {
        const matchesSearch =
          normalizedQuery.length === 0 ||
          normalizeSearchText(student.name || '').includes(normalizedQuery);
        const matchesFavorite =
          studentFilter === 'all' || Boolean(student.is_favorite);
        const matchesGrade =
          gradeFilter === 'all' || String(student.grade) === gradeFilter;

        return matchesSearch && matchesFavorite && matchesGrade;
      })
      .sort((left, right) => {
        if (studentSort === 'created_at') {
          return (
            new Date(right.created_at || 0).getTime() -
            new Date(left.created_at || 0).getTime()
          );
        }

        return (left.name || '').localeCompare(right.name || '', 'tr');
      });
  }, [gradeFilter, searchQuery, studentFilter, studentSort, students]);

  const favoriteStudents = visibleStudents.filter(
    (student) => student.is_favorite,
  );
  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    studentFilter !== 'all' ||
    gradeFilter !== 'all';

  const resetFilters = () => {
    setSearchQuery('');
    setStudentFilter('all');
    setGradeFilter('all');
  };

  const emptyMessage = hasActiveFilters
    ? 'Arama veya filtrelere uygun öğrenci bulunamadı'
    : 'Henüz kullanıcı yok';

  const resultSummary = hasActiveFilters
    ? `${visibleStudents.length} sonuç • ${students.length} öğrenci`
    : `${students.length} öğrenci`;

  if (students.length === 0) {
    return (
      <div className="space-y-4 animate-fade-up">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-slate-400">0 öğrenci • 0 favori</p>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
            <button
              onClick={onDownloadPdf}
              disabled={pdfStudentsLoading}
              className="min-w-0 justify-center px-3 py-2 sm:px-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-xs sm:text-sm flex items-center gap-2 disabled:opacity-50"
            >
              {pdfStudentsLoading ? (
                <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {pdfStudentsLoading ? 'PDF Hazırlanıyor...' : 'PDF İndir'}
            </button>
            <button
              onClick={onRefresh}
              className="justify-center px-3 py-2 sm:px-4 bg-white/5 border border-white/10 rounded-lg text-slate-300 hover:text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-xs sm:text-sm flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Yenile
            </button>
          </div>
        </div>

        <div className="glass rounded-2xl p-12 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-slate-500" />
          <p className="text-slate-400">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  const renderControls = () => (
    <div className="glass rounded-2xl p-4 border border-white/10 shadow-lg">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto]">
        <label className="relative block">
          <span className="sr-only">Öğrenci ismine göre ara</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Öğrenci ismi ara..."
            className="w-full rounded-xl border border-white/10 bg-slate-900/60 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/25"
          />
        </label>

        <label>
          <span className="sr-only">Favori filtresi</span>
          <select
            value={studentFilter}
            onChange={(event) =>
              setStudentFilter(event.target.value as StudentFilter)
            }
            className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2.5 text-sm text-white outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/25 lg:w-44"
          >
            <option value="all">Tüm öğrenciler</option>
            <option value="favorites">Sadece favoriler</option>
          </select>
        </label>

        <label>
          <span className="sr-only">Sınıf filtresi</span>
          <select
            value={gradeFilter}
            onChange={(event) => setGradeFilter(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2.5 text-sm text-white outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/25 lg:w-36"
          >
            <option value="all">Tüm sınıflar</option>
            {gradeOptions.map((grade) => (
              <option key={grade} value={grade}>
                {gradeLabel(grade as AdminUser['grade'])}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="sr-only">Sıralama</span>
          <select
            value={studentSort}
            onChange={(event) =>
              setStudentSort(event.target.value as StudentSort)
            }
            className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2.5 text-sm text-white outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/25 lg:w-52"
          >
            <option value="name">Alfabetik sırala</option>
            <option value="created_at">Son kayıt tarihine göre</option>
          </select>
        </label>
      </div>

      <div className="mt-3 flex flex-col gap-2 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <p>
          {resultSummary} • {favoriteStudents.length} favori
        </p>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="self-start rounded-lg px-2.5 py-1 text-xs font-semibold text-violet-300 transition-colors hover:bg-violet-500/10 hover:text-violet-200"
          >
            Filtreleri temizle
          </button>
        )}
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <div className="glass rounded-2xl p-12 text-center border border-white/10">
      <Users className="w-16 h-16 mx-auto mb-4 text-slate-500" />
      <p className="text-slate-400">{emptyMessage}</p>
      {hasActiveFilters && (
        <button
          onClick={resetFilters}
          className="mt-4 rounded-xl bg-brand-primary/20 px-4 py-2 text-sm font-semibold text-brand-primary-soft transition-colors hover:bg-brand-primary/30"
        >
          Filtreleri temizle
        </button>
      )}
    </div>
  );

  const renderStudentCard = (user: AdminUser, index: number) => {
    const gradeText = user.grade ? gradeLabel(user.grade) : 'Belirtilmemiş';

    return (
      <div
        key={user.id}
        className="glass rounded-2xl p-4 sm:p-5 card-hover animate-slide-up overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-tr from-brand-primary via-indigo-600 to-brand-secondary rounded-2xl flex shrink-0 items-center justify-center text-lg sm:text-xl font-bold text-white shadow-md shadow-violet-500/20">
              {user.name?.[0] || '?'}
            </div>
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <h3 className="truncate text-base sm:text-lg font-bold text-white">
                  {user.name || 'İsimsiz'}
                </h3>
                {user.is_favorite && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                    <Star className="h-3 w-3 fill-current" />
                    Favori
                  </span>
                )}
              </div>
              <p className="break-all text-slate-400 text-sm">{user.email}</p>
              <p className="text-slate-500 text-xs mt-1 break-words">
                Sınıf: {gradeText} • Kayıt:{' '}
                {user.created_at ? formatDate(user.created_at) : 'Bilinmiyor'}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-end">
            <button
              onClick={() => onToggleFavorite(user)}
              className={`justify-center px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] border ${
                user.is_favorite
                  ? 'bg-amber-400/20 text-amber-300 border-amber-400/30 hover:bg-amber-400/30'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-amber-300 border-white/10'
              }`}
              aria-pressed={Boolean(user.is_favorite)}
            >
              <Star
                className={`w-4 h-4 ${user.is_favorite ? 'fill-current' : ''}`}
              />
              {user.is_favorite ? 'Favoride' : 'Favori'}
            </button>
            <button
              onClick={() => onViewProfile(user)}
              className="justify-center px-3.5 py-2 bg-cyan-500/15 border border-cyan-500/25 text-cyan-300 rounded-xl hover:bg-cyan-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-xs sm:text-sm font-semibold flex items-center gap-1.5"
            >
              <Eye className="w-4 h-4" />
              Profili Gör
            </button>
            <button
              onClick={() => onEditUser(user)}
              className="justify-center px-3.5 py-2 bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 rounded-xl hover:bg-emerald-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-xs sm:text-sm font-semibold flex items-center gap-1.5"
            >
              <Edit3 className="w-4 h-4" />
              Düzenle
            </button>
            <button
              onClick={() => onSendMessage(user)}
              className="justify-center px-3.5 py-2 bg-brand-primary/20 border border-brand-primary/30 text-violet-200 rounded-xl hover:bg-brand-primary/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-md shadow-violet-500/10"
            >
              <Send className="w-4 h-4" />
              Mesaj Yaz
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-slate-400">
          {resultSummary} • {favoriteStudents.length} favori
        </p>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
          <button
            onClick={onDownloadPdf}
            disabled={pdfStudentsLoading}
            className="min-w-0 justify-center px-3 py-2 sm:px-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-xs sm:text-sm flex items-center gap-2 disabled:opacity-50"
          >
            {pdfStudentsLoading ? (
              <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {pdfStudentsLoading ? 'PDF Hazırlanıyor...' : 'PDF İndir'}
          </button>
          <button
            onClick={onRefresh}
            className="justify-center px-3 py-2 sm:px-4 bg-white/5 border border-white/10 rounded-lg text-slate-300 hover:text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-xs sm:text-sm flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Yenile
          </button>
        </div>
      </div>

      {renderControls()}

      {visibleStudents.length === 0 ? (
        renderEmptyState()
      ) : (
        <div id="admin-student-list-pdf" className="space-y-5">
          {favoriteStudents.length > 0 && studentFilter !== 'favorites' && (
            <section className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
              <div className="mb-3 flex items-center gap-2 text-amber-200">
                <Star className="h-4 w-4 fill-current" />
                <h3 className="text-sm font-bold">Favori Öğrenciler</h3>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {favoriteStudents.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => onViewProfile(student)}
                    className="min-w-0 rounded-xl border border-amber-400/20 bg-slate-950/40 px-3 py-2 text-left transition-colors hover:bg-slate-900/70"
                  >
                    <p className="truncate text-sm font-semibold text-white">
                      {student.name || 'İsimsiz'}
                    </p>
                    <p className="truncate text-xs text-amber-100/70">
                      {student.grade
                        ? gradeLabel(student.grade)
                        : 'Belirtilmemiş'}
                    </p>
                  </button>
                ))}
              </div>
            </section>
          )}

          <div className="space-y-4">
            {visibleStudents.map((user, index) =>
              renderStudentCard(user, index),
            )}
          </div>
        </div>
      )}
    </div>
  );
}
