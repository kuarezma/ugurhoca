'use client';

import Link from 'next/link';
import { Bell, ChevronRight } from 'lucide-react';
import type { ContentDocument } from '@/types';

type HomeWritingsSectionProps = {
  isLight: boolean;
  writings: ContentDocument[];
};

export function HomeWritingsSection({
  isLight,
  writings,
}: HomeWritingsSectionProps) {
  if (writings.length === 0) {
    return null;
  }

  return (
    <section className="px-4 py-3 sm:py-6">
      <div
        className={`max-w-6xl mx-auto ${isLight ? 'light-section p-5 sm:p-6' : ''}`}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2
              className={`text-lg sm:text-2xl font-bold ${
                isLight ? 'light-text-strong' : 'text-white'
              }`}
            >
              Yazılar
            </h2>
            <p
              className={`text-sm ${
                isLight ? 'light-text-muted' : 'text-slate-400'
              }`}
            >
              Kısa yazılar ve paylaşımlar.
            </p>
          </div>
          <Link
            href="/icerikler?type=writing"
            className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-1"
          >
            Tümünü Gör <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-2 xl:grid-cols-4 md:overflow-visible md:pb-0">
          {writings.map((writing, index) => (
            <button
              key={writing.id}
              className={`animate-fade-up text-left rounded-2xl overflow-hidden transition-all min-w-[82vw] sm:min-w-[46vw] md:min-w-0 md:w-full ${
                isLight
                  ? 'light-card hover:-translate-y-0.5'
                  : 'glass hover:scale-[1.01]'
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="p-4 sm:p-5">
                <div
                  className={`flex items-center gap-2 mb-2 text-xs ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  <Bell className="w-4 h-4 text-purple-400" />
                  {writing.created_at
                    ? new Date(writing.created_at).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'short',
                      })
                    : '-'}
                </div>
                <h3
                  className={`text-sm sm:text-base font-bold line-clamp-2 mb-2 ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {writing.title}
                </h3>
                <p
                  className={`text-xs sm:text-sm line-clamp-4 whitespace-pre-wrap ${
                    isLight ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  {writing.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
