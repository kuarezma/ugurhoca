'use client';

import {
  Download,
  Edit3,
  Eye,
  RefreshCw,
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
  const favoriteStudents = students.filter((student) => student.is_favorite);
  const visibleStudents = [...students].sort((left, right) => {
    if (Boolean(left.is_favorite) !== Boolean(right.is_favorite)) {
      return left.is_favorite ? -1 : 1;
    }

    return (left.name || '').localeCompare(right.name || '', 'tr');
  });

  const renderStudentCard = (user: AdminUser, index: number) => (
    <div
      key={user.id}
      className="glass rounded-2xl p-4 sm:p-5 card-hover animate-slide-up overflow-hidden"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex shrink-0 items-center justify-center text-lg sm:text-xl font-bold text-white">
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
              Sınıf: {user.grade || 'Belirtilmemiş'} • Kayıt:{' '}
              {user.created_at ? formatDate(user.created_at) : 'Bilinmiyor'}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-end">
          <button
            onClick={() => onToggleFavorite(user)}
            className={`justify-center px-4 py-2 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] font-semibold flex items-center gap-2 ${
              user.is_favorite
                ? 'bg-amber-400/20 text-amber-300 hover:bg-amber-400/30'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-amber-300'
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
            className="justify-center px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 rounded-lg hover:from-cyan-500/40 hover:to-blue-500/40 transition-all font-semibold flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Profili Gör
          </button>
          <button
            onClick={() => onEditUser(user)}
            className="justify-center px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 rounded-lg hover:from-green-500/40 hover:to-emerald-500/40 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] font-semibold flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            Düzenle
          </button>
          <button
            onClick={() => onSendMessage(user)}
            className="justify-center px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 rounded-lg hover:from-purple-500/40 hover:to-pink-500/40 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] font-semibold flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Mesaj Yaz
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-slate-400">
          {students.length} öğrenci • {favoriteStudents.length} favori
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

      {students.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-slate-500" />
          <p className="text-slate-400">Henüz kullanıcı yok</p>
        </div>
      ) : (
        <div id="admin-student-list-pdf" className="space-y-5">
          {favoriteStudents.length > 0 && (
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
                      {student.grade || 'Belirtilmemiş'}. Sınıf
                    </p>
                  </button>
                ))}
              </div>
            </section>
          )}

          <div className="space-y-4">
            {visibleStudents.map((user, index) => renderStudentCard(user, index))}
          </div>
        </div>
      )}
    </div>
  );
}
