'use client';

import { motion } from 'framer-motion';
import { useId, type DragEvent, type ChangeEvent } from 'react';
import { ClipboardList, FileText, Upload, X } from 'lucide-react';
import type { Assignment, Submission } from '@/types';
import { useAccessibleModal } from '@/hooks/useAccessibleModal';

type AssignmentSubmissionModalProps = {
  assignment: Assignment;
  activeSubmission?: Submission;
  comment: string;
  isDragging: boolean;
  isLight: boolean;
  onClose: () => void;
  onCommentChange: (value: string) => void;
  onDragLeave: (event: DragEvent<HTMLLabelElement>) => void;
  onDragOver: (event: DragEvent<HTMLLabelElement>) => void;
  onDrop: (event: DragEvent<HTMLLabelElement>) => void;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onOverlayClick: () => void;
  uploadProgress: number | null;
  uploading: string | null;
};

export function AssignmentSubmissionModal({
  assignment,
  activeSubmission,
  comment,
  isDragging,
  isLight,
  onClose,
  onCommentChange,
  onDragLeave,
  onDragOver,
  onDrop,
  onFileChange,
  onOverlayClick,
  uploadProgress,
  uploading,
}: AssignmentSubmissionModalProps) {
  const modalRef = useAccessibleModal<HTMLDivElement>(true, onClose);
  const baseId = useId();
  const commentId = `${baseId}-comment`;
  const fileUploadId = `${baseId}-file`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <motion.button
        type="button"
        aria-label="Kapat"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onOverlayClick}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={assignment.title}
        tabIndex={-1}
        className={`relative w-full max-w-lg overflow-hidden rounded-3xl p-6 sm:p-8 ${
          isLight ? 'bg-white' : 'border border-slate-800 bg-slate-900'
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Kapat"
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="mb-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20">
            <ClipboardList className="h-6 w-6 text-indigo-400" />
          </div>
          <h2
            className={`mb-2 text-2xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}
          >
            {assignment.title}
          </h2>
          <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            {assignment.description}
          </p>
        </div>

        {activeSubmission ? (
          <div className="space-y-4">
            <div
              className={`rounded-2xl p-4 ${isLight ? 'border border-slate-200 bg-slate-50' : 'border border-white/5 bg-white/5'}`}
            >
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                Teslimat Detayı
              </p>
              <div className="mb-4 flex items-center justify-between">
                <a
                  href={activeSubmission.file_url ?? '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 font-bold text-indigo-400 hover:text-indigo-300"
                >
                  <FileText className="h-5 w-5" />
                  Dosyayı Görüntüle
                </a>
                <span className="text-xs font-medium text-slate-400">
                  {activeSubmission.submitted_at
                    ? new Date(activeSubmission.submitted_at).toLocaleString(
                        'tr-TR',
                      )
                    : '-'}
                </span>
              </div>
              {activeSubmission.comment ? (
                <p className={`text-sm italic ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  &quot;{activeSubmission.comment}&quot;
                </p>
              ) : (
                <p className="text-sm text-slate-400">Not eklenmemiş.</p>
              )}
            </div>

            {activeSubmission.status === 'reviewed' && (
              <div
                className={`rounded-2xl border p-4 ${isLight ? 'border-emerald-200 bg-emerald-50' : 'border-emerald-500/30 bg-emerald-500/10'}`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-bold text-emerald-500">
                    Uğur Hoca&apos;nın Notu
                  </span>
                  <div className="rounded-lg bg-emerald-500 px-3 py-1 text-xs font-bold text-white">
                    {activeSubmission.grade ?? '-'} / 100
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-emerald-400">
                  {activeSubmission.feedback ||
                    'Harika iş çıkarmışsın! Başarılarının devamını dilerim.'}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-2xl bg-slate-800 py-4 font-bold text-white transition-colors hover:bg-slate-700"
            >
              Kapat
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <label
                htmlFor={commentId}
                className="mb-2 block text-sm font-bold uppercase tracking-wider text-slate-400"
              >
                Hocana Not (Opsiyonel)
              </label>
              <textarea
                id={commentId}
                placeholder="Ödevle ilgili eklemek istediğin bir şey var mı?"
                value={comment}
                onChange={(e) => onCommentChange(e.target.value)}
                className="h-24 w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white transition-colors focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="relative">
              <input
                type="file"
                id={fileUploadId}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={onFileChange}
                disabled={!!uploading}
              />
              {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- label form kontrolüyle ilişkili ve drag&drop desteği için listenerlara ihtiyaç duyar */}
              <label
                htmlFor={fileUploadId}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`relative flex cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-3xl border-2 border-dashed p-8 transition-all duration-300 ${
                  uploading
                    ? 'pointer-events-none border-indigo-500/30 opacity-80'
                    : isDragging
                      ? 'scale-[1.02] border-indigo-500 bg-indigo-500/10'
                      : 'border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800/50'
                }`}
              >
                {uploadProgress !== null && (
                  <div
                    className="absolute bottom-0 left-0 z-0 h-1 bg-indigo-500 transition-all duration-300 ease-out"
                    style={{ width: `${Math.min(uploadProgress, 100)}%` }}
                  />
                )}

                <div
                  className={`z-10 flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 ${
                    isDragging
                      ? 'scale-110 bg-indigo-500 shadow-lg shadow-indigo-500/30'
                      : 'border border-slate-700 bg-slate-800'
                  }`}
                >
                  {uploading ? (
                    <div className="flex items-center gap-1">
                      <div
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400"
                        style={{ animationDelay: '0ms' }}
                      />
                      <div
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400"
                        style={{ animationDelay: '150ms' }}
                      />
                      <div
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400"
                        style={{ animationDelay: '300ms' }}
                      />
                    </div>
                  ) : (
                    <Upload
                      className={`h-6 w-6 ${isDragging ? 'text-white' : 'text-slate-300'}`}
                    />
                  )}
                </div>
                <div className="z-10 text-center">
                  <p
                    className={`mb-1 font-bold ${isDragging ? 'text-base text-indigo-400' : 'text-sm text-white'}`}
                  >
                    {uploading
                      ? `Yükleniyor... ${Math.round(uploadProgress || 0)}%`
                      : isDragging
                        ? 'Buraya Bırak'
                        : 'Dosyayı Sürükle veya Seç'}
                  </p>
                  <p className="text-xs text-slate-400">PDF, JPG veya PNG (Max 5MB)</p>
                </div>
              </label>
            </div>

            <p className="text-center text-[10px] uppercase leading-relaxed tracking-tighter text-slate-400">
              Ödevi teslim ettiğinde Uğur Hoca&apos;ya bildirim gidecektir. Teslim
              tarihinden sonra yüklediğin ödevler &quot;Gecikmiş&quot; olarak
              işaretlenebilir.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
