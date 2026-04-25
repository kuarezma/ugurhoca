'use client';

import Link from 'next/link';
import { ChevronRight, FileText } from 'lucide-react';
import type { ContentDocument } from '@/types';
import { getContentTypeLabel } from '@/features/content/constants';
import { HOME_CATEGORIES } from '@/features/home/constants';
import { isNewContent } from '@/features/home/queries';

type HomeRecentDocumentsSectionProps = {
  documents: ContentDocument[];
  isLight: boolean;
};

export function HomeRecentDocumentsSection({
  documents,
  isLight,
}: HomeRecentDocumentsSectionProps) {
  if (documents.length === 0) {
    return null;
  }

  return (
    <section className="defer-section px-4 py-8 sm:py-12">
      <div
        className={`max-w-6xl mx-auto ${isLight ? 'light-section p-5 sm:p-6' : ''}`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2
            className={`text-xl sm:text-2xl font-bold ${
              isLight ? 'light-text-strong' : 'text-white'
            }`}
          >
            Son Eklenenler
          </h2>
          <Link
            href="/icerikler"
            className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center gap-1"
          >
            Tümünü Gör <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="space-y-3">
          {documents.map((document, index) => {
            const matchingCategory = HOME_CATEGORIES.find(
              (category) => category.id === document.type,
            );
            const Icon = matchingCategory?.icon || FileText;
            const contentTypeLabel = getContentTypeLabel(document.type);

            return (
              <a
                key={document.id}
                href={document.file_url || document.video_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div
                  className={`animate-fade-up relative cursor-pointer rounded-xl p-4 transition-all ${
                    isLight
                      ? 'light-card hover:border-slate-300'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {isNewContent(document.created_at) && (
                    <span className="absolute top-3 right-3 px-2 py-1 rounded-full bg-indigo-500 text-white text-[10px] font-bold">
                      Yeni
                    </span>
                  )}
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-lg bg-gradient-to-br ${
                        matchingCategory?.color || 'from-slate-500 to-slate-600'
                      } flex items-center justify-center flex-shrink-0`}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`font-medium truncate ${
                          isLight ? 'text-slate-900' : 'text-white'
                        }`}
                      >
                        {document.title}
                      </h3>
                      <div
                        className={`flex items-center gap-3 text-xs mt-1 ${
                          isLight ? 'text-slate-600' : 'text-slate-400'
                        }`}
                      >
                        <span>{contentTypeLabel}</span>
                        {document.grade && (
                          <span>{document.grade.join(', ')}. Sınıf</span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
