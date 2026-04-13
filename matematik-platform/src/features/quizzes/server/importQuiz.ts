import type { SupabaseClient } from '@supabase/supabase-js';
import type { z } from 'zod';
import { quizImportSchema } from '@/lib/route-schemas';

export type QuizImportInput = z.infer<typeof quizImportSchema>;

export const insertQuizWithQuestions = async (
  supabase: SupabaseClient,
  payload: QuizImportInput,
) => {
  const { meta, questions } = payload;

  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .insert([
      {
        description: meta.description || null,
        difficulty: meta.difficulty,
        grade: meta.grade,
        is_active: true,
        time_limit: meta.time_limit,
        title: meta.title.trim(),
      },
    ])
    .select()
    .single();

  if (quizError || !quiz) {
    throw quizError ?? new Error('Test oluşturulamadı.');
  }

  const questionRows = questions.map((question, index) => ({
    correct_index: question.correct_index,
    explanation: question.explanation?.trim() || null,
    options: question.options.map((option) => option.trim()),
    question: question.question.trim(),
    question_order: index,
    quiz_id: quiz.id,
  }));

  const { error: questionsError } = await supabase
    .from('quiz_questions')
    .insert(questionRows);

  if (questionsError) {
    await supabase.from('quizzes').delete().eq('id', quiz.id);
    throw questionsError;
  }

  return {
    inserted: questions.length,
    quiz_id: quiz.id,
    quiz_title: quiz.title,
    success: true,
  };
};
