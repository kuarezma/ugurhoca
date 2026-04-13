export interface Note {
  id: string;
  user_id: string;
  title: string | null;
  content: string;
  category: string | null;
  tags: string[];
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface NoteCategory {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export * from './domain';
