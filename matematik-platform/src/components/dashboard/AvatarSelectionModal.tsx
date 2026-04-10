"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export const AVATAR_LIST = [
  "🦊", "🦁", "🐼", "🐶", "🦄", "🐰", "🐱", "🐯", 
  "🚀", "🌟", "💡", "🎨", "🎮", "⚽️", "🎸", "🏆"
];

interface AvatarSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (avatar: string) => void;
  currentAvatar?: string | null;
}

export default function AvatarSelectionModal({
  isOpen,
  onClose,
  onSelect,
  currentAvatar,
}: AvatarSelectionModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/5 bg-white/5 p-5">
              <h3 className="text-lg font-bold text-white">Profil Simgesi Seç</h3>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-slate-300 transition-colors hover:bg-white/20 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-4 gap-3">
                {AVATAR_LIST.map((avatar) => (
                  <button
                    key={avatar}
                    type="button"
                    onClick={() => {
                      onSelect(avatar);
                      onClose();
                    }}
                    className={`flex aspect-square items-center justify-center rounded-2xl text-4xl transition-all hover:scale-110 ${
                      currentAvatar === avatar
                        ? "bg-emerald-500/20 border-2 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                        : "bg-white/5 border border-white/5 hover:bg-white/10"
                    }`}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
