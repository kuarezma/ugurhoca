export type Difficulty = 'Kolay' | 'Orta' | 'Zor';

export interface Quiz {
  id: string;
  title: string;
  grade: number;
  time_limit: number; // dakika
  difficulty: Difficulty;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question: string;
  options: string[];
  correct_index: number;
  question_order: number;
  explanation: string | null;
  created_at: string;
}

export interface QuizResult {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  total_questions: number;
  answers: { [key: string]: number }; // question_id: selected_index
  time_spent: number; // saniye
  completed_at: string;
}
