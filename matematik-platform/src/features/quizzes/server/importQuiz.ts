import type { SupabaseClient } from '@supabase/supabase-js';
import type { z } from 'zod';
import type { ParsedQuizBundle } from '@/lib/question-import';
import { encodeQuizMediaExplanation } from '@/lib/quiz-media';
import { quizImportSchema } from '@/lib/route-schemas';

export type QuizImportInput = z.infer<typeof quizImportSchema>;
export const QUIZ_IMAGE_BUCKET = 'quiz-images';

export const createQuizRecord = async (
  supabase: SupabaseClient,
  meta: QuizImportInput['meta'],
) => {
  const { data: quiz, error } = await supabase
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

  if (error || !quiz) {
    throw error ?? new Error('Test oluşturulamadı.');
  }

  return quiz;
};

export const insertQuizQuestions = async (
  supabase: SupabaseClient,
  quizId: string,
  questions: QuizImportInput['questions'],
) => {
  const questionRows = questions.map((question, index) => ({
    correct_index: question.correct_index,
    explanation: question.explanation?.trim() || null,
    option_image_urls:
      question.option_image_urls?.map((item) => item.trim()) || null,
    options: question.options.map((option) => option.trim()),
    question: question.question.trim(),
    question_image_url: question.question_image_url?.trim() || null,
    question_order: index,
    quiz_id: quizId,
  }));

  const { error } = await supabase.from('quiz_questions').insert(questionRows);

  if (error && isMissingQuizMediaColumnsError(error)) {
    const legacyRows = questions.map((question, index) => ({
      correct_index: question.correct_index,
      explanation: encodeQuizMediaExplanation(question.explanation, {
        option_image_urls: question.option_image_urls,
        question_image_url: question.question_image_url,
      }),
      options: question.options.map((option) => option.trim()),
      question: question.question.trim(),
      question_order: index,
      quiz_id: quizId,
    }));

    const { error: legacyError } = await supabase
      .from('quiz_questions')
      .insert(legacyRows);

    if (legacyError) {
      throw legacyError;
    }
    return;
  }

  if (error) {
    throw error;
  }
};

export const insertQuizWithQuestions = async (
  supabase: SupabaseClient,
  payload: QuizImportInput,
) => {
  const { meta, questions } = payload;
  const quiz = await createQuizRecord(supabase, meta);

  try {
    await insertQuizQuestions(supabase, quiz.id, questions);
  } catch (questionsError) {
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

export const insertQuizBundleWithImages = async (
  supabase: SupabaseClient,
  bundle: ParsedQuizBundle,
) => {
  const { importResult, assetFiles } = bundle;

  if (importResult.valid.length === 0) {
    throw new Error('İçe aktarılabilir soru bulunamadı.');
  }

  const quiz = await createQuizRecord(supabase, importResult.meta);
  const uploadedPaths: string[] = [];

  try {
    await ensureQuizImageBucket(supabase);

    const questions = await Promise.all(
      importResult.valid.map(async (question, index) => {
        const questionImageUrl = question.question_image_files?.[0]
          ? await uploadAssetAndGetPublicUrl(
              supabase,
              assetFiles,
              question.question_image_files[0],
              quiz.id,
              index,
              'question',
              uploadedPaths,
            )
          : undefined;

        const optionImageUrls = await Promise.all(
          (question.option_image_files || [[], [], [], []]).map(
            async (files, optionIndex) => {
              const firstFile = files?.[0];
              if (!firstFile) {
                return '';
              }

              return uploadAssetAndGetPublicUrl(
                supabase,
                assetFiles,
                firstFile,
                quiz.id,
                index,
                `option-${optionIndex}`,
                uploadedPaths,
              );
            },
          ),
        );

        return {
          correct_index: question.correct_index,
          explanation: question.explanation,
          options: question.options,
          option_image_urls: optionImageUrls,
          question: question.question,
          question_image_url: questionImageUrl,
        };
      }),
    );

    const parsedPayload = quizImportSchema.parse({
      meta: importResult.meta,
      questions,
    });

    await insertQuizQuestions(supabase, quiz.id, parsedPayload.questions);

    return {
      inserted: parsedPayload.questions.length,
      quiz_id: quiz.id,
      quiz_title: quiz.title,
      success: true,
      uploaded_images: uploadedPaths.length,
    };
  } catch (error) {
    if (uploadedPaths.length > 0) {
      await supabase.storage.from(QUIZ_IMAGE_BUCKET).remove(uploadedPaths);
    }
    await supabase.from('quizzes').delete().eq('id', quiz.id);
    throw error;
  }
};

const ensureQuizImageBucket = async (supabase: SupabaseClient) => {
  const { data: buckets, error } = await supabase.storage.listBuckets();

  if (error) {
    throw error;
  }

  if (buckets.some((bucket) => bucket.name === QUIZ_IMAGE_BUCKET)) {
    return;
  }

  const { error: createError } = await supabase.storage.createBucket(
    QUIZ_IMAGE_BUCKET,
    {
      public: true,
    },
  );

  if (createError && createError.message !== 'The resource already exists') {
    throw createError;
  }
};

const isMissingQuizMediaColumnsError = (error: { code?: string; message?: string }) =>
  error.code === 'PGRST204' &&
  (error.message?.includes('question_image_url') ||
    error.message?.includes('option_image_urls'));

const uploadAssetAndGetPublicUrl = async (
  supabase: SupabaseClient,
  assetFiles: ParsedQuizBundle['assetFiles'],
  fileName: string,
  quizId: string,
  questionOrder: number,
  slot: string,
  uploadedPaths: string[],
) => {
  const asset =
    assetFiles.get(fileName) || assetFiles.get(`images/${fileName}`);

  if (!asset) {
    throw new Error(`Görsel bulunamadı: ${fileName}`);
  }

  const sanitizedName = asset.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `quizzes/${quizId}/${questionOrder}/${slot}-${sanitizedName}`;
  const { error } = await supabase.storage
    .from(QUIZ_IMAGE_BUCKET)
    .upload(storagePath, asset.bytes, {
      contentType: asset.contentType,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  uploadedPaths.push(storagePath);
  const { data } = supabase.storage
    .from(QUIZ_IMAGE_BUCKET)
    .getPublicUrl(storagePath);
  return data.publicUrl;
};
