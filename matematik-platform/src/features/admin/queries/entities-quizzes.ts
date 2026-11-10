import { decodeQuizMediaExplanation } from '@/lib/quiz-media';
import { supabase } from '@/lib/supabase/client';
import type { AdminQuiz, AdminQuizQuestion } from '@/features/admin/types';

export const createAdminQuiz = async (quiz: {
  description?: string | null;
  difficulty?: string | null;
  grade?: number | null;
  is_active?: boolean;
  time_limit?: number | null;
  title?: string | null;
}) => {
  const { data, error } = await supabase
    .from('quizzes')
    .insert([
      {
        ...quiz,
        is_active: quiz.is_active ?? true,
      },
    ])
    .select()
    .single();

  return { data: (data as AdminQuiz | null) ?? null, error };
};

export const updateAdminQuiz = async (
  quizId: string,
  updates: {
    description?: string | null;
    difficulty?: string | null;
    grade?: number;
    is_active?: boolean;
    time_limit?: number | null;
    title?: string | null;
  },
) => {
  return supabase.from('quizzes').update(updates).eq('id', quizId);
};

export const createAdminQuizQuestion = async (question: {
  correct_index?: number;
  explanation?: string | null;
  options?: string[];
  question?: string | null;
  question_order: number;
  quiz_id: string;
}) => {
  const { data, error } = await supabase
    .from('quiz_questions')
    .insert([question])
    .select()
    .single();

  return { data: (data as AdminQuizQuestion | null) ?? null, error };
};

export const loadAdminQuizQuestions = async (quizId: string) => {
  const { data } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('quiz_id', quizId)
    .order('question_order', { ascending: true });

  return ((data || []) as AdminQuizQuestion[]).map((question) => {
    const media = decodeQuizMediaExplanation(question.explanation);
    return {
      ...question,
      explanation: media.explanation,
      option_image_urls: question.option_image_urls || media.option_image_urls,
      question_image_url:
        question.question_image_url || media.question_image_url,
    };
  });
};
