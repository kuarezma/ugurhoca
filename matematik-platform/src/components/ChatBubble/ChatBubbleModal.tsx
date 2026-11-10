'use client';

import type { FormEvent, RefObject } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import type { ThreadMessage } from '@/features/messages/types';
import type { ConversationPreview } from './types';
import { ChatBubbleGuestView } from './ChatBubbleGuestView';
import { ChatBubbleAdminInbox } from './ChatBubbleAdminInbox';

// SupportChatPanel dinamik import
const SupportChatPanel = dynamic(
  () =>
    import('@/features/messages/components/SupportChatPanel').then((m) => ({
      default: m.SupportChatPanel,
    })),
  { ssr: false },
);

export type ChatBubbleModalProps = {
  open: boolean;
  panelRef: RefObject<HTMLDivElement | null>;
  isLight: boolean;
  currentUser: {
    id: string;
    email: string;
    name: string;
    isAdmin: boolean;
  } | null;
  selectedStudentId: string | null;
  setSelectedStudentId: (id: string | null) => void;
  adminTotalUnread: number;
  adminConversations: ConversationPreview[];
  loadAdminMessages: (adminId: string) => void;
  adminThreadLoading: boolean;
  adminThreadMessages: ThreadMessage[];
  studentThreadMessages: ThreadMessage[];
  attachmentPreviews: Array<{
    name: string;
    url: string;
    kind: 'image';
    size?: number;
  }>;
  draft: string;
  setDraft: (val: string) => void;
  sendError: string | null;
  setSendError: (val: string | null) => void;
  clearAttachments: () => void;
  handleAttachmentRemove: (index?: number) => void;
  handleAttachmentSelect: (files: FileList | null) => void;
  setOpen: (val: boolean) => void;
  handleSendAdmin: (e: FormEvent<HTMLFormElement>) => void;
  handleSendStudent: (e: FormEvent<HTMLFormElement>) => void;
  handleTriggerTyping: () => void;
  handleVoiceRecordComplete: (audioFile: File) => void;
  selectedPeerName: string;
  peerTyping: boolean;
  sending: boolean;
};

export function ChatBubbleModal({
  open,
  panelRef,
  isLight,
  currentUser,
  selectedStudentId,
  setSelectedStudentId,
  adminTotalUnread,
  adminConversations,
  loadAdminMessages,
  adminThreadLoading,
  adminThreadMessages,
  studentThreadMessages,
  attachmentPreviews,
  draft,
  setDraft,
  sendError,
  setSendError,
  clearAttachments,
  handleAttachmentRemove,
  handleAttachmentSelect,
  setOpen,
  handleSendAdmin,
  handleSendStudent,
  handleTriggerTyping,
  handleVoiceRecordComplete,
  selectedPeerName,
  peerTyping,
  sending,
}: ChatBubbleModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 350, damping: 26 }}
          role="dialog"
          aria-modal="true"
          aria-label="Uğur Hoca ile Sohbet"
          style={{ overscrollBehavior: 'contain' }}
          className={`fixed bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] sm:bottom-24 right-3 sm:right-6 z-40 flex h-[min(600px,calc(100dvh-6rem-env(safe-area-inset-bottom,0px)))] min-h-0 w-[calc(100vw-1.5rem)] sm:w-[420px] flex-col overflow-hidden overscroll-contain rounded-3xl border shadow-2xl backdrop-blur-2xl transition-colors ${
            isLight
              ? 'border-slate-200/90 bg-white/95 text-slate-800 shadow-indigo-950/15'
              : 'border-slate-700/80 bg-slate-900/95 text-slate-100 shadow-black/50'
          }`}
        >
          {/* 1. Senaryo: Giriş Yapmamış Ziyaretçi */}
          {!currentUser ? (
            <ChatBubbleGuestView
              isLight={isLight}
              onClose={() => setOpen(false)}
            />
          ) : currentUser.isAdmin ? (
            /* 2. Senaryo: Admin (Uğur Hoca) Paneli */
            !selectedStudentId ? (
              <ChatBubbleAdminInbox
                isLight={isLight}
                adminTotalUnread={adminTotalUnread}
                conversations={adminConversations}
                onRefresh={() =>
                  currentUser.id && loadAdminMessages(currentUser.id)
                }
                onClose={() => {
                  setOpen(false);
                  setSelectedStudentId(null);
                  setDraft('');
                  setSendError(null);
                  clearAttachments();
                }}
                onSelectStudent={(studentId) => {
                  setSelectedStudentId(studentId);
                  setDraft('');
                  setSendError(null);
                  clearAttachments();
                }}
              />
            ) : adminThreadLoading ? (
              <div className="flex flex-1 items-center justify-center py-16 text-sm text-slate-400">
                Yükleniyor…
              </div>
            ) : (
              <SupportChatPanel
                appearance="admin"
                attachmentPreviews={attachmentPreviews}
                draft={draft}
                error={sendError}
                inputDisabled={false}
                isLight={isLight}
                messages={adminThreadMessages}
                onAttachmentRemove={handleAttachmentRemove}
                onAttachmentSelect={handleAttachmentSelect}
                onBack={() => {
                  setSelectedStudentId(null);
                  setDraft('');
                  setSendError(null);
                  clearAttachments();
                  if (currentUser) void loadAdminMessages(currentUser.id);
                }}
                onClose={() => {
                  setOpen(false);
                  setSelectedStudentId(null);
                  setDraft('');
                  setSendError(null);
                  clearAttachments();
                }}
                onDraftChange={setDraft}
                onSubmit={handleSendAdmin}
                onTyping={handleTriggerTyping}
                onVoiceRecordComplete={handleVoiceRecordComplete}
                peerAvatarSrc={undefined}
                peerDisplayName={selectedPeerName}
                peerSubtitle="Öğrenci"
                peerTyping={peerTyping}
                placeholder="Öğrenciye yanıt yaz..."
                sending={sending}
              />
            )
          ) : (
            /* 3. Senaryo: Öğrenci (SADECE UĞUR HOCA İLE 1-E-1 SOHBET) */
            <SupportChatPanel
              appearance="navbar"
              attachmentPreviews={attachmentPreviews}
              draft={draft}
              error={sendError}
              isLight={isLight}
              messages={studentThreadMessages}
              onAttachmentRemove={handleAttachmentRemove}
              onAttachmentSelect={handleAttachmentSelect}
              onClose={() => setOpen(false)}
              onDraftChange={setDraft}
              onSubmit={handleSendStudent}
              onTyping={handleTriggerTyping}
              onVoiceRecordComplete={handleVoiceRecordComplete}
              peerAvatarSrc="/ugur.jpeg"
              peerDisplayName="Uğur Hoca"
              peerSubtitle="Çevrim içi • Aktif"
              peerTyping={peerTyping}
              placeholder="Uğur Hoca'ya mesaj yaz veya soru sor..."
              sending={sending}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
