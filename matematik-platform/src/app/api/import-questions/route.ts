import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const MAX_QUESTIONS = 30;

interface ImportQuestion {
  question: string;
  options: string[];
  correct_index: number;
  explanation?: string;
}

interface QuizMeta {
  title: string;
  grade: number;
  difficulty: string;
  time_limit: number;
  description?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { meta, questions } = body as { meta: QuizMeta; questions: ImportQuestion[] };

    // ── Temel doğrulama ───────────────────────────────────────────────────
    if (!meta || !meta.title) {
      return NextResponse.json({ error: 'Test bilgileri eksik.' }, { status: 400 });
    }
    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: 'En az 1 geçerli soru gereklidir.' }, { status: 400 });
    }
    if (questions.length > MAX_QUESTIONS) {
      return NextResponse.json(
        { error: `Maksimum ${MAX_QUESTIONS} soru yüklenebilir.` },
        { status: 400 }
      );
    }

    // Soru detay doğrulaması
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question?.trim()) {
        return NextResponse.json({ error: `Soru ${i + 1}: Soru metni boş.` }, { status: 400 });
      }
      if (!Array.isArray(q.options) || q.options.length !== 4) {
        return NextResponse.json({ error: `Soru ${i + 1}: 4 şık gerekli.` }, { status: 400 });
      }
      if (q.correct_index < 0 || q.correct_index > 3) {
        return NextResponse.json(
          { error: `Soru ${i + 1}: Doğru cevap 0-3 arasında olmalı.` },
          { status: 400 }
        );
      }
    }

    // ── Supabase service role client ──────────────────────────────────────
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // ── 1. Yeni test oluştur ──────────────────────────────────────────────
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert([{
        title: meta.title.trim(),
        grade: meta.grade,
        difficulty: meta.difficulty,
        time_limit: meta.time_limit,
        description: meta.description || null,
        is_active: true,
      }])
      .select()
      .single();

    if (quizError || !quiz) {
      console.error('Quiz insert error:', quizError);
      return NextResponse.json({ error: 'Test oluşturulamadı: ' + quizError?.message }, { status: 500 });
    }

    // ── 2. Soruları toplu ekle ────────────────────────────────────────────
    const questionRows = questions.map((q, index) => ({
      quiz_id: quiz.id,
      question: q.question.trim(),
      options: q.options.map((o: string) => o.trim()),
      correct_index: q.correct_index,
      explanation: q.explanation?.trim() || null,
      question_order: index,
    }));

    const { error: questionsError } = await supabase
      .from('quiz_questions')
      .insert(questionRows);

    if (questionsError) {
      // Test oluşturuldu ama sorular eklenemedi — test'i geri al
      await supabase.from('quizzes').delete().eq('id', quiz.id);
      console.error('Questions insert error:', questionsError);
      return NextResponse.json(
        { error: 'Sorular eklenemedi: ' + questionsError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      quiz_id: quiz.id,
      quiz_title: quiz.title,
      inserted: questions.length,
    });
  } catch (err: any) {
    console.error('Import error:', err);
    return NextResponse.json({ error: 'Sunucu hatası: ' + err.message }, { status: 500 });
  }
}
