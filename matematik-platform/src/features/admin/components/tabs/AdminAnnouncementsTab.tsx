'use client';

import { Calendar, Edit3, Megaphone, Trash2 } from 'lucide-react';
import { AnnouncementGallery } from '@/features/admin/components/AnnouncementGallery';
import type { AdminAnnouncement, AdminFormState } from '@/features/admin/types';

type AdminAnnouncementsTabProps = {
  announcements: AdminAnnouncement[];
  formatDate: (dateString?: string | null) => string;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onEdit: (
    announcement: AdminAnnouncement,
    nextFormData: AdminFormState,
  ) => void;
};

const getAnnouncementFormState = (
  announcement: AdminAnnouncement,
): AdminFormState => ({
  title: announcement.title,
  description: announcement.content,
  image_urls: (announcement.image_urls?.length
    ? announcement.image_urls
    : announcement.image_url
      ? [announcement.image_url]
      : []
  ).join('\n'),
  image_url: announcement.image_url || '',
  link_url: announcement.link_url || '',
});

export default function AdminAnnouncementsTab({
  announcements,
  formatDate,
  onCreate,
  onDelete,
  onEdit,
}: AdminAnnouncementsTabProps) {
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">
            Duyurular & Bildirim Panosu
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Öğrencilerinize göndereceğiniz haberleri yönetin
          </p>
        </div>
        <button
          onClick={onCreate}
          className="w-full px-5 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 sm:w-auto"
        >
          <Megaphone className="w-5 h-5" />
          Yeni Duyuru Ekle
        </button>
      </div>

      {announcements.length === 0 ? (
        <div className="glass rounded-3xl p-12 sm:p-16 text-center border border-white/5">
          <div className="w-24 h-24 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Megaphone className="w-12 h-12 text-blue-400/50" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            Henüz Duyuru Yok
          </h3>
          <p className="text-slate-400 max-w-md mx-auto">
            Sistemde yayınlanan hiçbir bildirim/duyuru bulunmuyor. Yeni bir
            duyuru ekleyerek öğrencilerinizi bilgilendirebilirsiniz.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {announcements.map((announcement, index) => (
            <div
              key={announcement.id}
              className="glass relative rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 border border-white/5 flex flex-col h-full bg-gradient-to-b from-slate-800/80 to-slate-900/80 animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="absolute top-4 left-4 z-10">
                <span className="px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 backdrop-blur-md rounded-full text-blue-300 text-xs font-bold shadow-lg flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  Yayında
                </span>
              </div>

              <div className="h-48 relative overflow-hidden bg-slate-900">
                {announcement.image_urls?.length || announcement.image_url ? (
                  <div className="absolute inset-0">
                    <AnnouncementGallery
                      images={
                        announcement.image_urls?.length
                          ? announcement.image_urls
                          : [announcement.image_url as string]
                      }
                      title={announcement.title}
                    />
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                    <Megaphone className="w-16 h-16 text-slate-700/50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-3 text-slate-400 text-xs font-medium">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  {formatDate(announcement.created_at)}
                </div>

                <h3 className="text-xl font-bold text-white mb-3 line-clamp-2">
                  {announcement.title}
                </h3>

                <p className="text-slate-400 text-sm line-clamp-3 mb-6 flex-1">
                  {announcement.content}
                </p>

                <div className="flex items-center gap-2 pt-4 border-t border-white/5 mt-auto">
                  <button
                    onClick={() =>
                      onEdit(
                        announcement,
                        getAnnouncementFormState(announcement),
                      )
                    }
                    className="flex-1 py-2.5 bg-slate-800/50 text-blue-400 hover:bg-slate-700 hover:text-blue-300 rounded-xl transition-colors font-medium text-sm flex items-center justify-center gap-2 border border-slate-700"
                  >
                    <Edit3 className="w-4 h-4" />
                    Düzenle
                  </button>
                  <button
                    onClick={() => onDelete(announcement.id)}
                    className="flex-1 py-2.5 bg-slate-800/50 text-red-400 hover:bg-slate-700 hover:text-red-300 rounded-xl transition-colors font-medium text-sm flex items-center justify-center gap-2 border border-slate-700"
                  >
                    <Trash2 className="w-4 h-4" />
                    Kaldır
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
