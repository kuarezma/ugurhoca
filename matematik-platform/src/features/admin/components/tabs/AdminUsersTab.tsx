'use client';

import {
  Download,
  Edit3,
  Eye,
  RefreshCw,
  Send,
  Users,
} from 'lucide-react';
import type { AdminUser } from '@/features/admin/types';

type AdminUsersTabProps = {
  formatDate: (dateString?: string | null) => string;
  onDownloadPdf: () => Promise<void> | void;
  onEditUser: (user: AdminUser) => void;
  onRefresh: () => Promise<void> | void;
  onSendMessage: (user: AdminUser) => void;
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
  onViewProfile,
  pdfStudentsLoading,
  students,
}: AdminUsersTabProps) {
  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex justify-between items-center">
        <p className="text-slate-400">{students.length} öğrenci</p>
        <div className="flex items-center gap-2">
          <button
            onClick={onDownloadPdf}
            disabled={pdfStudentsLoading}
            className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-sm flex items-center gap-2 disabled:opacity-50"
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
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-300 hover:text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-sm flex items-center gap-2"
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
        <div id="admin-student-list-pdf" className="space-y-4">
          {students.map((user, index) => (
            <div
              key={user.id}
              className="glass rounded-2xl p-5 card-hover animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-xl font-bold text-white">
                    {user.name?.[0] || '?'}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {user.name || 'İsimsiz'}
                    </h3>
                    <p className="text-slate-400 text-sm">{user.email}</p>
                    <p className="text-slate-500 text-xs mt-1">
                      Sınıf: {user.grade || 'Belirtilmemiş'} • Kayıt:{' '}
                      {user.created_at
                        ? formatDate(user.created_at)
                        : 'Bilinmiyor'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <button
                    onClick={() => onViewProfile(user)}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 rounded-lg hover:from-cyan-500/40 hover:to-blue-500/40 transition-all font-semibold flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Profili Gör
                  </button>
                  <button
                    onClick={() => onEditUser(user)}
                    className="px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 rounded-lg hover:from-green-500/40 hover:to-emerald-500/40 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] font-semibold flex items-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    Düzenle
                  </button>
                  <button
                    onClick={() => onSendMessage(user)}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 rounded-lg hover:from-purple-500/40 hover:to-pink-500/40 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] font-semibold flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Mesaj Yaz
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
