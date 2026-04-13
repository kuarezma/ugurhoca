import { motion } from 'framer-motion';
import { Download, Eye, FileText, Key, X } from 'lucide-react';
import { getDriveId, getYouTubeId } from '@/features/content/utils';
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
  const previewVideoId = previewDoc.video_url
    ? getYouTubeId(previewDoc.video_url)
    : null;
  const driveId = previewDoc.file_url ? getDriveId(previewDoc.file_url) : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(event) => event.stopPropagation()}
        className="glass rounded-3xl p-6 w-full max-w-5xl max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white">{previewDoc.title}</h3>
            <p className="text-slate-400 text-sm">{previewDoc.description}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden rounded-xl bg-slate-900 min-h-[60vh]">
          {previewDoc.type === 'ders-videolari' && previewVideoId ? (
            <iframe
              src={`https://www.youtube.com/embed/${previewVideoId}`}
              className="w-full h-full min-h-[60vh]"
              title={previewDoc.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : typeof previewDoc.file_url === 'string' &&
            previewDoc.file_url.endsWith('.pdf') ? (
            <iframe
              src={previewDoc.file_url}
              className="w-full h-full min-h-[60vh]"
              title={previewDoc.title}
            />
          ) : driveId ? (
            <iframe
              src={`https://drive.google.com/file/d/${driveId}/preview`}
              className="w-full h-full min-h-[60vh]"
              title={previewDoc.title}
              allow="autoplay"
            />
          ) : previewDoc.video_url ? (
            <iframe
              src={`https://www.youtube.com/embed/${getYouTubeId(previewDoc.video_url)}`}
              className="w-full h-full min-h-[60vh]"
              title={previewDoc.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : previewDoc.file_url ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center p-8">
              <FileText className="w-24 h-24 text-slate-500 mb-4" />
              <p className="text-white text-lg font-semibold mb-2">
                Dosya Önizlemesi
              </p>
              <p className="text-slate-400 mb-6">Bu dosya türü önizlenemiyor</p>
              <button
                onClick={() => onDownload(previewDoc)}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                İndir ve Görüntüle
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center p-8">
              <p className="text-slate-400">Dosya bulunamadı</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700">
          <div className="flex items-center gap-4 text-slate-400 text-sm">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {previewDoc.views || 0} görüntülenme
            </span>
            <span className="flex items-center gap-1">
              <Download className="w-4 h-4" />
              {previewDoc.downloads || 0} indirme
            </span>
            {previewDoc.answer_key_text && (
              <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded-lg text-xs font-medium">
                Cevap Anahtarı Var
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {previewDoc.answer_key_text && (
              <button
                onClick={onToggleAnswerKey}
                className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30 rounded-lg transition-colors flex items-center gap-2"
              >
                <Key className="w-4 h-4" />
                Cevap Anahtarı
              </button>
            )}
            {previewDoc.solution_url && (
              <a
                href={previewDoc.solution_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Çözüm PDF
              </a>
            )}
            <button
              onClick={() => onDownload(previewDoc)}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
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
