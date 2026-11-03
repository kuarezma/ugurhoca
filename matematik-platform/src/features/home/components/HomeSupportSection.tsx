'use client';

import { useState, type FormEvent } from 'react';
import { useToast } from '@/components/Toast';
import { requireClientSession } from '@/lib/auth-client';
import { getErrorMessage } from '@/lib/error-utils';
import { createLogger } from '@/lib/logger';

const log = createLogger('support-section');
import type { AppUser, SupportAttachment } from '@/types';
import { HomeSupportForm } from '@/features/home/components/support/HomeSupportForm';
import { HomeSupportHeader } from '@/features/home/components/support/HomeSupportHeader';
import { HomeSupportLockedState } from '@/features/home/components/support/HomeSupportLockedState';
import {
  sendSupportMessage,
  uploadSupportFiles,
} from '@/features/home/queries';

type HomeSupportSectionProps = {
  user: AppUser | null;
};

export function HomeSupportSection({
  user
}: HomeSupportSectionProps) {
  const { showToast } = useToast();
  const [supportMessage, setSupportMessage] = useState('');
  const [supportAttachments, setSupportAttachments] = useState<
    SupportAttachment[]
  >([]);
  const [supportSending, setSupportSending] = useState(false);
  const [supportSent, setSupportSent] = useState(false);

  const uploadSupportAttachments = async (files: FileList | null) => {
    if (!files?.length) {
      return;
    }

    const uploads = await uploadSupportFiles(files, { imagesOnly: true });
    setSupportAttachments((currentAttachments) => [
      ...currentAttachments,
      ...uploads,
    ]);
  };

  const removeSupportAttachment = (index: number) => {
    setSupportAttachments((currentAttachments) =>
      currentAttachments.filter(
        (_, attachmentIndex) => attachmentIndex !== index,
      ),
    );
  };

  const handleSupportSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!user || user.isAdmin) {
      return;
    }

    if (!supportMessage.trim() && supportAttachments.length === 0) {
      return;
    }

    if (!user.id) {
      showToast('warning', 'Oturum bilgisi bulunamadı. Lütfen tekrar giriş yap.');
      return;
    }

    setSupportSending(true);

    try {
      const session = await requireClientSession({ redirectToLogin: false });

      if (!session?.user?.id) {
        showToast('warning', 'Oturum süresi dolmuş. Lütfen tekrar giriş yap.');
        setSupportSending(false);
        return;
      }

      await sendSupportMessage(
        {
          attachments: supportAttachments,
          sender_email: user.email || session.user.email || '',
          sender_id: session.user.id,
          sender_name: user.name || 'Öğrenci',
          text: supportMessage.trim(),
        },
        session.access_token,
      );

      setSupportMessage('');
      setSupportAttachments([]);
      setSupportSent(true);
      window.setTimeout(() => setSupportSent(false), 3000);
    } catch (error) {
      log.error('Support message error', error);
      showToast(
        'error',
        getErrorMessage(error, 'Mesaj gönderilemedi. Lütfen tekrar dene.'),
      );
    } finally {
      setSupportSending(false);
    }
  };

  return (
    <section className="defer-section px-4 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto">
        <div
          className="rounded-2xl border border-subtle bg-surface-1 shadow-sm font-sans"
        >
          <div className="relative p-6 sm:p-8">
            <HomeSupportHeader user={user} />

            {user && !user.isAdmin ? (
              <HomeSupportForm
                onRemoveSupportAttachment={removeSupportAttachment}
                onSubmit={handleSupportSubmit}
                onSupportMessageChange={setSupportMessage}
                onUploadSupportAttachments={uploadSupportAttachments}
                supportAttachments={supportAttachments}
                supportMessage={supportMessage}
                supportSending={supportSending}
                supportSent={supportSent}
              />
            ) : (
              <HomeSupportLockedState />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
