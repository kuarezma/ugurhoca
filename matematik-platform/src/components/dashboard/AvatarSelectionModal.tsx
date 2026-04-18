'use client';

import Image from 'next/image';
import { useRef, useState, type ChangeEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ImagePlus, LoaderCircle, Upload, X } from 'lucide-react';
import { useToast } from '@/components/Toast';
import {
  isAvatarImage,
  PROFILE_AVATAR_ACCEPT,
  PROFILE_AVATAR_MAX_LABEL,
} from '@/features/profile/utils/avatar-upload';
import { useAccessibleModal } from '@/hooks/useAccessibleModal';

const AVATAR_LIST = [
  '🦊',
  '🦁',
  '🐼',
  '🐶',
  '🦄',
  '🐰',
  '🐱',
  '🐯',
  '🚀',
  '🌟',
  '💡',
  '🎨',
  '🎮',
  '⚽️',
  '🎸',
  '🏆',
];

interface AvatarSelectionModalProps {
  currentAvatar?: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (avatar: string) => Promise<void> | void;
  onUpload: (file: File) => Promise<void>;
}

export default function AvatarSelectionModal({
  currentAvatar,
  isOpen,
  onClose,
  onSelect,
  onUpload,
}: AvatarSelectionModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();
  const hasImageAvatar = isAvatarImage(currentAvatar);
  const modalRef = useAccessibleModal<HTMLDivElement>(isOpen, onClose);

  const handleEmojiSelect = async (avatar: string) => {
    try {
      await onSelect(avatar);
      onClose();
      showToast('success', 'Profil simgesi güncellendi.');
    } catch (error) {
      showToast(
        'error',
        error instanceof Error
          ? error.message
          : 'Profil simgesi güncellenemedi.',
      );
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setUploading(true);

    try {
      await onUpload(file);
      showToast(
        'success',
        `Profil fotoğrafı ${PROFILE_AVATAR_MAX_LABEL} altına sıkıştırılıp kaydedildi.`,
      );
      onClose();
    } catch (error) {
      showToast(
        'error',
        error instanceof Error
          ? error.message
          : 'Profil fotoğrafı yüklenemedi.',
      );
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

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
          onClick={(event) => event.stopPropagation()}
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-label="Profil simgesi seç"
          tabIndex={-1}
          className="w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900 shadow-2xl"
        >
            <div className="flex items-center justify-between border-b border-white/5 bg-white/5 p-5">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Profil Simgesi Seç
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Emoji seçebilir ya da fotoğraf yükleyebilirsin.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Kapat"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-slate-300 transition-colors hover:bg-white/20 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-6 p-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">
                    <ImagePlus className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-300">
                      Fotoğraf Yükle
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Dosya ne kadar büyük olursa olsun{' '}
                      {PROFILE_AVATAR_MAX_LABEL} altına sıkıştırılır.
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-3xl border border-dashed border-white/10 bg-black/20 p-5 text-center">
                  <div className="relative mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/15 to-white/5 text-5xl text-white">
                    {hasImageAvatar ? (
                      <Image
                        src={currentAvatar || ''}
                        alt="Mevcut profil fotoğrafı"
                        fill
                        sizes="112px"
                        className="h-full w-full object-cover"
                      />
                    ) : currentAvatar ? (
                      <span>{currentAvatar}</span>
                    ) : (
                      <span>🙂</span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-900 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {uploading ? (
                      <>
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        Yükleniyor...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Fotoğraf Seç
                      </>
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={PROFILE_AVATAR_ACCEPT}
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              <div>
                <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-slate-300">
                  Emoji Seç
                </p>
                <div className="grid grid-cols-4 gap-3">
                  {AVATAR_LIST.map((avatar) => (
                    <button
                      key={avatar}
                      type="button"
                      onClick={() => {
                        void handleEmojiSelect(avatar);
                      }}
                      className={`flex aspect-square items-center justify-center rounded-2xl text-4xl transition-all hover:scale-110 ${
                        currentAvatar === avatar
                          ? 'border-2 border-emerald-500/50 bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                          : 'border border-white/5 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
