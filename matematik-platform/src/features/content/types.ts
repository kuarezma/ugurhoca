import type { AppUser, Comment, ContentDocument, GradeValue } from '@/types';

export type ContentGradeFilter = number | 'all' | 'Mezun';
export type ContentSortOrder = 'newest' | 'downloads' | 'views' | 'likes';
export type ContentQuickFilter =
  | 'all'
  | 'favorites'
  | 'completed'
  | 'with_solution'
  | 'with_video';

export type ContentQueryOptions = {
  onlySolution?: boolean;
  onlyVideo?: boolean;
  searchTerm?: string;
  sortBy?: ContentSortOrder;
};

export type ContentDocumentsPayload = {
  count: number;
  documents: ContentDocument[];
};

export type ContentPrefetchPayload = ContentDocumentsPayload & {
  grade: ContentGradeFilter;
  type: string;
};


export type ContentPageUser = AppUser;

export type ContentComment = Comment;

export type ContentFormState = Partial<
  Pick<
    ContentDocument,
    | 'answer_key_text'
    | 'description'
    | 'file_url'
    | 'learning_outcome'
    | 'solution_url'
    | 'title'
    | 'type'
    | 'video_url'
    | 'worksheet_order'
  >
> & {
  file_name?: string;
  grade?: GradeValue[];
};
