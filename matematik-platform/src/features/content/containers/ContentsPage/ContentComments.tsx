import type { AppUser, Comment } from '@/types';
import type { Dispatch, SetStateAction } from 'react';
import { AnimatePresence } from 'framer-motion';

import { ContentCommentsModal } from './lazy';

type ContentCommentsProps = {
  showComments: string | null;
  comments: Comment[];
  newComment: string;
  handleCloseComments: () => void;
  setNewComment: Dispatch<SetStateAction<string>>;
  handleCommentSubmit: (
    event: React.FormEvent<HTMLFormElement>,
  ) => Promise<void>;
  user: AppUser | null;
};

export function ContentComments({
  showComments,
  comments,
  newComment,
  handleCloseComments,
  setNewComment,
  handleCommentSubmit,
  user,
}: ContentCommentsProps) {
  return (
    <AnimatePresence>
      {showComments && (
        <ContentCommentsModal
          comments={comments}
          newComment={newComment}
          onClose={handleCloseComments}
          onNewCommentChange={setNewComment}
          onSubmit={handleCommentSubmit}
          user={user}
        />
      )}
    </AnimatePresence>
  );
}
