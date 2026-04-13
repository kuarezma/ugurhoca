'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Bell, ChevronRight, X } from 'lucide-react';
import type { SharedDocumentAssignment } from '@/types';
import { HomeAssignmentsList } from '@/features/home/components/assignments/HomeAssignmentsList';

type HomeAssignmentsSectionProps = {
  assignments: SharedDocumentAssignment[];
  isLight: boolean;
  onDismissAll: () => void;
  onDismissAssignment: (assignment: SharedDocumentAssignment) => void;
};

export function HomeAssignmentsSection({
  assignments,
  isLight,
  onDismissAll,
  onDismissAssignment,
}: HomeAssignmentsSectionProps) {
  if (assignments.length === 0) {
    return null;
  }

  return (
    <section className="px-4 py-6 sm:py-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden"
        >
          <div
            className={`absolute inset-0 rounded-3xl ${
              isLight
                ? 'bg-gradient-to-r from-amber-100/70 via-rose-100/60 to-pink-100/60'
                : 'bg-gradient-to-r from-orange-500/20 via-red-500/20 to-pink-500/20'
            }`}
          />
          <div
            className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl ${
              isLight
                ? 'bg-gradient-to-br from-amber-300/45 to-rose-300/35'
                : 'bg-gradient-to-br from-orange-500/30 to-red-500/30'
            }`}
          />

          <div
            className={`relative backdrop-blur-xl border rounded-3xl p-6 sm:p-8 ${
              isLight
                ? 'bg-white/90 border-amber-200 shadow-[0_20px_44px_rgba(251,146,60,0.18)]'
                : 'bg-slate-900/80 border-orange-500/30'
            }`}
          >
            <button
              onClick={onDismissAll}
              className={`absolute top-4 right-4 p-2 rounded-lg transition-colors ${
                isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
              title="Tümünü gizle"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4 pr-8">
              <div className="relative flex-shrink-0">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
                  <Bell className="w-7 h-7 text-white" />
                </div>
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                  {assignments.length}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <h2
                  className={`text-xl sm:text-2xl font-bold mb-1 ${
                    isLight ? 'light-text-strong' : 'text-white'
                  }`}
                >
                  Sana Gönderilen Ödevler
                </h2>
                <p
                  className={`text-sm mb-4 ${
                    isLight ? 'light-text-muted' : 'text-slate-400'
                  }`}
                >
                  Uğur Hoca sana {assignments.length} tane ödev/materyal
                  gönderdi!
                </p>

                <div className="space-y-3">
                  <HomeAssignmentsList
                    assignments={assignments}
                    isLight={isLight}
                    onDismissAssignment={onDismissAssignment}
                  />
                </div>

                {assignments.length > 3 && (
                  <Link
                    href="/odevler"
                    className="inline-flex items-center gap-2 mt-4 text-orange-400 hover:text-orange-300 text-sm font-medium transition-colors"
                  >
                    Tüm ödevleri gör ({assignments.length})
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
