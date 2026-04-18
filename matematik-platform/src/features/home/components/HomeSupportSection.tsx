'use client';

import { type FormEvent } from 'react';
import type { AppUser, SupportAttachment } from '@/types';
import { HomeSupportForm } from '@/features/home/components/support/HomeSupportForm';
import { HomeSupportHeader } from '@/features/home/components/support/HomeSupportHeader';
import { HomeSupportLockedState } from '@/features/home/components/support/HomeSupportLockedState';

type HomeSupportSectionProps = {
  isLight: boolean;
  onRemoveSupportAttachment: (index: number) => void;
  onSubmit: (event: FormEvent) => void;
  onSupportMessageChange: (message: string) => void;
  onUploadSupportAttachments: (files: FileList | null) => Promise<void>;
  supportAttachments: SupportAttachment[];
  supportMessage: string;
  supportSending: boolean;
  supportSent: boolean;
  user: AppUser | null;
};

export function HomeSupportSection({
  isLight,
  onRemoveSupportAttachment,
  onSubmit,
  onSupportMessageChange,
  onUploadSupportAttachments,
  supportAttachments,
  supportMessage,
  supportSending,
  supportSent,
  user,
}: HomeSupportSectionProps) {
  return (
    <section className="defer-section px-4 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto">
        <div
          className={`relative overflow-hidden rounded-3xl border backdrop-blur-xl ${
            isLight
              ? 'light-section'
              : 'border-indigo-500/20 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-800/90'
          }`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(236,72,153,0.14),transparent_30%)]" />
          <div className="relative p-6 sm:p-8">
            <HomeSupportHeader isLight={isLight} user={user} />

            {user && !user.isAdmin ? (
              <HomeSupportForm
                isLight={isLight}
                onRemoveSupportAttachment={onRemoveSupportAttachment}
                onSubmit={onSubmit}
                onSupportMessageChange={onSupportMessageChange}
                onUploadSupportAttachments={onUploadSupportAttachments}
                supportAttachments={supportAttachments}
                supportMessage={supportMessage}
                supportSending={supportSending}
                supportSent={supportSent}
              />
            ) : (
              <HomeSupportLockedState isLight={isLight} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
