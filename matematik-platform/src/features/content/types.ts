import type { AppUser, Comment, ContentDocument, GradeValue } from '@/types';

export type ContentGradeFilter = number | 'all' | 'Mezun';

export type ContentPageUser = AppUser;

export type ContentComment = Comment;

export type ContentFormState = Partial<
  Pick<
    ContentDocument,
    | 'answer_key_text'
    | 'description'
    | 'file_url'
    | 'solution_url'
    | 'title'
    | 'type'
    | 'video_url'
  >
> & {
  file_name?: string;
  grade?: GradeValue[];
};
