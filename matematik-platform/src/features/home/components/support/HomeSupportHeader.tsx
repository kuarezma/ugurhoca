'use client';

import { MessageSquareText, Paperclip } from 'lucide-react';
import type { AppUser } from '@/types';

type HomeSupportHeaderProps = {
  isLight: boolean;
  user: AppUser | null;
};

export function HomeSupportHeader({ isLight, user }: HomeSupportHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-6">
      <div className="max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 text-xs font-semibold mb-3">
          <MessageSquareText className="w-4 h-4" />
          Uğur Hoca'ya Yaz
        </div>
        <h2
          className={`text-2xl sm:text-3xl font-bold mb-2 ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}
        >
          Sorunu yaz, belge veya resim ekle
        </h2>
        <p
          className={`text-sm sm:text-base ${
            isLight ? 'text-slate-600' : 'text-slate-400'
          }`}
        >
          Mesajın ve eklerin doğrudan bana bildirim olarak gelir.
        </p>
      </div>
      {user && !user.isAdmin && (
        <div
          className={`flex items-center gap-2 text-xs ${
            isLight ? 'text-slate-600' : 'text-slate-400'
          }`}
        >
          <Paperclip className="w-4 h-4" />
          PDF, resim ve kısa not gönderebilirsin
        </div>
      )}
    </div>
  );
}
