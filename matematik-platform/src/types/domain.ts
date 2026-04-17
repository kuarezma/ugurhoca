export type NumericGrade = number;
export type GradeValue = NumericGrade | 'Mezun';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  grade: GradeValue;
  isAdmin?: boolean;
  avatar_id?: string | null;
  created_at?: string | null;
  current_streak?: number | null;
  is_private_student?: boolean | null;
  name_normalized?: string | null;
  [key: string]: unknown;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
  image_url?: string | null;
  image_urls?: string[] | null;
  link_url?: string | null;
  [key: string]: unknown;
}

export interface ContentDocument {
  id: string;
  title: string;
  type: string;
  grade: GradeValue[];
  created_at?: string;
  description?: string | null;
  downloads?: number | null;
  views?: number | null;
  likes?: number | null;
  comments_count?: number | null;
  rating?: number | null;
  file_url?: string | null;
  video_url?: string | null;
  solution_url?: string | null;
  answer_key_text?: string | null;
  isNew?: boolean;
  author?: string | null;
  owner_name?: string | null;
  subject?: string | null;
  learning_outcome?: string | null;
  worksheet_order?: number | null;
  [key: string]: unknown;
}

export interface Comment {
  id: string;
  document_id: string;
  created_at?: string;
  user_id?: string | null;
  user_name?: string | null;
  content?: string | null;
  text?: string | null;
  [key: string]: unknown;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read?: boolean;
  created_at: string;
  [key: string]: unknown;
}

export interface SharedDocumentAssignment {
  id: string;
  document_id?: string | null;
  student_id: string;
  student_name?: string | null;
  student_email?: string | null;
  document_title?: string | null;
  document_type?: string | null;
  file_url?: string | null;
  is_read?: boolean;
  created_at: string;
  source?: 'shared' | 'notification';
  [key: string]: unknown;
}

export interface Assignment {
  id: string;
  title: string;
  created_at?: string;
  description?: string | null;
  due_date?: string | null;
  grade?: GradeValue | null;
  student_id?: string | null;
  attachments?: AssignmentAttachment[] | null;
  [key: string]: unknown;
}

export interface AssignmentAttachment {
  name: string;
  url: string;
  type?: string | null;
  [key: string]: unknown;
}

export interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  student_name?: string | null;
  submitted_at?: string | null;
  status?: string | null;
  feedback?: string | null;
  grade?: number | null;
  score?: number | null;
  comment?: string | null;
  file_url?: string | null;
  attachments?: AssignmentAttachment[] | null;
  [key: string]: unknown;
}

export interface Quiz {
  id: string;
  title: string;
  grade: number;
  difficulty: string;
  time_limit: number;
  description?: string | null;
  is_active?: boolean;
  created_at?: string;
  [key: string]: unknown;
}

export interface QuizQuestion {
  id: string;
  quiz_id?: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation?: string | null;
  question_order?: number;
  [key: string]: unknown;
}

export interface QuizResult {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  total_questions: number;
  time_spent?: number;
  completed_at?: string;
  answers?: Record<string, number>;
  [key: string]: unknown;
}

export interface ChatRoom {
  id: string;
  name?: string | null;
  user_id?: string | null;
  sender_id?: string | null;
  sender_name?: string | null;
  sender_email?: string | null;
  created_at?: string;
  updated_at?: string | null;
  [key: string]: unknown;
}

export interface ChatMessage {
  id: string;
  display_name?: string | null;
  room_id?: string | null;
  sender_id?: string | null;
  sender_tc?: string | null;
  sender_name?: string | null;
  text?: string | null;
  message?: string | null;
  created_at?: string;
  ts?: string | number | null;
  attachments?: SupportAttachment[] | null;
  metadata?: Record<string, unknown> | null;
  [key: string]: unknown;
}

export interface SupportAttachment {
  name: string;
  url: string;
  kind: 'image' | 'file';
}

export interface ChatUser {
  full_name: string;
  grade: number;
  school_number: string;
  display_name: string;
}
