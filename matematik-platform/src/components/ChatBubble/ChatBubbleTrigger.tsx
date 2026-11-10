'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

export type ChatBubbleTriggerProps = {
  open: boolean;
  onToggle: () => void;
  isAdmin: boolean;
  unreadCount: number;
};

export function ChatBubbleTrigger({
  open,
  onToggle,
  isAdmin,
  unreadCount,
}: ChatBubbleTriggerProps) {
  return (
    <motion.button
      type="button"
      initial={false}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      onClick={onToggle}
      className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:bottom-6 right-4 sm:right-6 z-40 flex h-14 w-14 sm:h-[60px] sm:w-[60px] items-center justify-center rounded-full focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-400 bg-brand-primary hover:bg-brand-primary-soft text-slate-950 dark:text-slate-950 shadow-btn-3d-green active:translate-y-1 active:shadow-none"
      aria-label={isAdmin ? 'Öğrenci mesajları' : "Uğur Hoca'ya mesaj yaz"}
      aria-haspopup="dialog"
      aria-expanded={open}
    >
      <div className="relative flex h-full w-full items-center justify-center">
        <Image
          src="/ugur.jpeg"
          alt="Uğur Hoca"
          width={48}
          height={48}
          className="h-11 w-11 sm:h-12 sm:w-12 rounded-full object-cover border-2 border-[#58cc02] shadow-sm ring-2 ring-[#d7ffb8]"
        />
        <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-slate-900 bg-emerald-500" />
      </div>

      {unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] animate-pulse items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold shadow-md text-slate-950 dark:text-slate-950">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </motion.button>
  );
}
