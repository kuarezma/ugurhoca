import { motion } from 'framer-motion';
import { Download, Eye, FileText, Key, X } from 'lucide-react';
import { getDriveId, getYouTubeId } from '@/features/content/utils';
import { getWorksheetVisibleDescription } from '@/features/content/worksheet';
import type { ContentDocument } from '@/types';

type ContentPreviewModalProps = {
  onClose: () => void;
  onDownload: (content: ContentDocument) => void | Promise<void>;
  onToggleAnswerKey: () => void;
  previewDoc: ContentDocument;
  showAnswerKey: boolean;
};

export default function ContentPreviewModal({
  onClose,
  onDownload,
  onToggleAnswerKey,
  previewDoc,
  showAnswerKey,
}: ContentPreviewModalProps) {
  const visibleDescription = getWorksheetVisibleDescription(previewDoc);
  const previewVideoId = previewDoc.video_url
    ? getYouTubeId(previewDoc.video_url)
    : null;
  const driveId = previewDoc.file_url ? getDriveId(previewDoc.file_url) : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(event) => event.stopPropagation()}
        className="glass flex max-h-[92vh] w-full max-w-5xl flex-col rounded-3xl p-4 sm:max-h-[90vh] sm:p-6"
      >
        <div className="mb-3 flex items-start justify-between gap-3 sm:mb-4 sm:items-center">
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-white sm:text-xl">
              {previewDoc.title}
            </h3>
            <p className="line-clamp-2 text-xs text-slate-400 sm:text-sm">
              {visibleDescription}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        <div className="min-h-[48vh] flex-1 overflow-hidden rounded-xl bg-slate-900 sm:min-h-[60vh]">
          {previewDoc.type === 'ders-videolari' && previewVideoId ? (
            <iframe
              src={`https://www.youtube.com/embed/${previewVideoId}`}
              className="h-full min-h-[48vh] w-full sm:min-h-[60vh]"
              title={previewDoc.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : typeof previewDoc.file_url === 'string' &&
            previewDoc.file_url.endsWith('.pdf') ? (
            <iframe
              src={previewDoc.file_url}
              className="h-full min-h-[48vh] w-full sm:min-h-[60vh]"
              title={previewDoc.title}
            />
          ) : driveId ? (
            <iframe
              src={`https://drive.google.com/file/d/${driveId}/preview`}
              className="h-full min-h-[48vh] w-full sm:min-h-[60vh]"
              title={previewDoc.title}
              allow="autoplay"
            />
          ) : previewDoc.video_url ? (
            <iframe
              src={`https://www.youtube.com/embed/${getYouTubeId(previewDoc.video_url)}`}
              className="h-full min-h-[48vh] w-full sm:min-h-[60vh]"
              title={previewDoc.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : previewDoc.file_url ? (
            <div className="flex h-full min-h-[48vh] flex-col items-center justify-center p-6 text-center sm:min-h-[60vh] sm:p-8">
              <FileText className="mb-4 h-20 w-20 text-slate-500 sm:h-24 sm:w-24" />
              <p className="mb-2 text-base font-semibold text-white sm:text-lg">
                Dosya Önizlemesi
              </p>
              <p className="mb-6 text-sm text-slate-400 sm:text-base">
                Bu dosya türü önizlenemiyor
              </p>
              <button
                onClick={() => onDownload(previewDoc)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3 text-sm font-semibold text-white transition-all hover:from-purple-600 hover:to-pink-600 sm:w-auto sm:px-6 sm:text-base"
              >
                <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                İndir ve Görüntüle
              </button>
            </div>
          ) : (
            <div className="flex h-full min-h-[48vh] flex-col items-center justify-center p-6 text-center sm:min-h-[60vh] sm:p-8">
              <p className="text-slate-400">Dosya bulunamadı</p>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-slate-700 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid w-full grid-cols-2 gap-2 text-[11px] text-slate-300 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:gap-3 sm:text-sm">
            <span className="flex min-w-0 items-center gap-1.5 rounded-xl bg-slate-800/60 px-3 py-2">
              <Eye className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
              {previewDoc.views || 0} görüntülenme
            </span>
            <span className="flex min-w-0 items-center gap-1.5 rounded-xl bg-slate-800/60 px-3 py-2">
              <Download className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
              {previewDoc.downloads || 0} indirme
            </span>
            {previewDoc.answer_key_text && (
              <span className="col-span-2 rounded-xl bg-green-500/20 px-3 py-2 text-center text-[11px] font-medium text-green-300 sm:col-auto sm:text-xs">
                Cevap Anahtarı Var
              </span>
            )}
          </div>
          <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:justify-end sm:gap-3">
            {previewDoc.answer_key_text && (
              <button
                onClick={onToggleAnswerKey}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-green-500/30 bg-green-500/20 px-3 py-2.5 text-xs font-medium text-green-300 transition-colors hover:bg-green-500/30 sm:w-auto sm:px-4 sm:text-sm"
              >
                <Key className="h-4 w-4" />
                Cevap Anahtarı
              </button>
            )}
            {previewDoc.solution_url && (
              <a
                href={previewDoc.solution_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 px-3 py-2.5 text-xs font-medium text-white transition-colors hover:bg-green-600 sm:w-auto sm:px-4 sm:text-sm"
              >
                <FileText className="h-4 w-4" />
                Çözüm PDF
              </a>
            )}
            <button
              onClick={() => onDownload(previewDoc)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-500 px-3 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-purple-600 sm:w-auto sm:px-4 sm:text-sm"
            >
              <Download className="h-4 w-4" />
              İndir
            </button>
          </div>
        </div>

        {showAnswerKey && previewDoc.answer_key_text && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl"
          >
            <h4 className="text-green-300 font-semibold mb-2 flex items-center gap-2">
              <Key className="w-4 h-4" />
              Cevap Anahtarı
            </h4>
            <pre className="text-slate-300 text-sm whitespace-pre-wrap font-mono">
              {previewDoc.answer_key_text}
            </pre>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
