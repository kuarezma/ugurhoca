'use client';

import { Calendar, Edit3, Trash2 } from 'lucide-react';
import type { AdminDocument } from '@/features/admin/types';

type AdminWritingsTabProps = {
  formatDate: (dateString?: string | null) => string;
  onDelete: (id: string) => void;
  writings: AdminDocument[];
};

export default function AdminWritingsTab({
  formatDate,
  onDelete,
  writings,
}: AdminWritingsTabProps) {
  return (
    <div className="space-y-4 animate-fade-up">
      {writings.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Edit3 className="w-16 h-16 mx-auto mb-4 text-slate-500" />
          <p className="text-slate-400">Henüz yazı yok</p>
        </div>
      ) : (
        writings.map((writing, index) => (
          <div
            key={writing.id}
            className="glass rounded-2xl p-6 card-hover animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full text-white text-xs font-semibold">
                    Yazı
                  </span>
                  <span className="text-slate-400 text-sm flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(writing.created_at)}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {writing.title}
                </h3>
                <p className="text-slate-300 whitespace-pre-wrap">
                  {writing.description}
                </p>
              </div>
              <button
                onClick={() => onDelete(writing.id)}
                className="p-2 text-slate-400 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
