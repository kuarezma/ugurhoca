import { motion } from 'framer-motion';
import type { FormEvent } from 'react';
import { X } from 'lucide-react';
import type {
  ContentComment,
  ContentPageUser,
} from '@/features/content/types';
import { useAccessibleModal } from '@/hooks/useAccessibleModal';

type ContentCommentsModalProps = {
  comments: ContentComment[];
  newComment: string;
  onClose: () => void;
  onNewCommentChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
  user: ContentPageUser | null;
};

export default function ContentCommentsModal({
  comments,
  newComment,
  onClose,
  onNewCommentChange,
  onSubmit,
  user,
}: ContentCommentsModalProps) {
  const modalRef = useAccessibleModal<HTMLDivElement>(true, onClose);

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
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="content-comments-title"
        tabIndex={-1}
        className="glass rounded-3xl p-6 w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 id="content-comments-title" className="text-xl font-bold text-white">
            Yorumlar
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="text-slate-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
          {comments.length === 0 ? (
            <p className="text-slate-400 text-center py-8">
              Henüz yorum yok. İlk yorumu sen yap!
            </p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="bg-slate-800/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-medium text-sm">
                    {comment.user_name || 'Anonim'}
                  </span>
                  <span className="text-slate-400 text-xs">
                    {comment.created_at
                      ? new Date(comment.created_at).toLocaleDateString('tr-TR')
                      : '-'}
                  </span>
                </div>
                <p className="text-slate-300 text-sm">{comment.content}</p>
              </div>
            ))
          )}
        </div>

        {user ? (
          <form onSubmit={onSubmit} className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(event) => onNewCommentChange(event.target.value)}
              placeholder="Yorum yaz..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Gönder
            </button>
          </form>
        ) : (
          <div className="text-center py-3 text-slate-400 text-sm">
            Yorum yapmak için{' '}
            <a
              href="/giris"
              className="text-purple-400 hover:text-purple-300 font-semibold"
            >
              giriş yapın
            </a>
            .
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
