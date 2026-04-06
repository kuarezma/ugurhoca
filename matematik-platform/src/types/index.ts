export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  grade: number;
  avatar?: string;
  createdAt: Date;
}

export interface Content {
  id: string;
  title: string;
  description: string;
  type: 'worksheet' | 'test' | 'game' | 'app' | 'file';
  grade: number[];
  subject: string;
  url?: string;
  fileUrl?: string;
  thumbnail?: string;
  downloads: number;
  createdAt: Date;
  authorId: string;
  answer_key_text?: string;
  solution_url?: string;
}

export interface Quiz {
  id: string;
  title: string;
  questions: Question[];
  grade: number;
  timeLimit?: number;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export type GradeLevel = 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

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
