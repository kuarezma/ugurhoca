import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuestionHintLadder, deriveQuestionHints } from './QuestionHintLadder';
import type { QuizQuestion } from '@/types/quiz';

const mockQuestion: QuizQuestion = {
  id: 'q1',
  quiz_id: 'test-quiz',
  question: 'Bir üçgenin taban alanı ve yüksekliği verilmiştir. Üçgenin alanı nedir?',
  options: ['12', '24', '36', '48'],
  correct_index: 1,
  question_order: 1,
  explanation: 'Üçgen alanı taban ile yüksekliğin çarpımının yarısıdır.',
  created_at: new Date().toISOString(),
};

describe('QuestionHintLadder', () => {

  it('initially shows the collapsed button and expands levels sequentially', () => {
    render(<QuestionHintLadder question={mockQuestion} questionIndex={0} />);

    const button = screen.getByRole('button', { name: /Kademeli İpucu Sistemi/i });
    expect(button).toBeInTheDocument();

    // Expand
    fireEvent.click(button);
    expect(screen.getByText(/1. Kademe: Temel Kural & Formül/i)).toBeInTheDocument();

    // Unlock Level 2
    const level2Btn = screen.getByRole('button', { name: /2. Kademe İpucunu Aç/i });
    fireEvent.click(level2Btn);
    expect(screen.getByText(/2. Kademe: İlk İşlem Hamlesi/i)).toBeInTheDocument();

    // Unlock Level 3
    const level3Btn = screen.getByRole('button', { name: /3. Kademe İpucunu Aç/i });
    fireEvent.click(level3Btn);
    expect(screen.getByText(/3. Kademe: Çözüm Stratejisi/i)).toBeInTheDocument();
  });

  it('switches to Socratic Assistant mode and displays pedagogical prompts and trap warnings', () => {
    render(<QuestionHintLadder question={mockQuestion} questionIndex={0} />);

    const mainBtn = screen.getByRole('button', { name: /Kademeli İpucu Sistemi/i });
    fireEvent.click(mainBtn);

    const socraticTabBtn = screen.getByRole('button', { name: /Sokratik Asistan \(Rehber\)/i });
    fireEvent.click(socraticTabBtn);

    expect(
      screen.getByText(/Sokratik Soru Analizi \(Ne Verildi, Ne Aranıyor\?\)/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Kritik Eşitlik & Kilit Bağıntı/i)).toBeInTheDocument();
    expect(screen.getByText(/Dikkat: Sık Yapılan Yanılgı & Tuzak!/i)).toBeInTheDocument();
  });

  it('supports controlled isOpen and onToggleOpen triggers', () => {
    const onToggleOpen = vi.fn();
    render(
      <QuestionHintLadder
        question={mockQuestion}
        questionIndex={0}
        isOpen={true}
        onToggleOpen={onToggleOpen}
      />,
    );

    expect(screen.getByText(/1. Kademe: Temel Kural & Formül/i)).toBeInTheDocument();

    const mainBtn = screen.getByRole('button', { name: /Kademeli İpucu Sistemi/i });
    fireEvent.click(mainBtn);
    expect(onToggleOpen).toHaveBeenCalledTimes(1);
  });

  it('allows saving question to Mistake Notebook when level 3 is unlocked', () => {
    localStorage.clear();
    render(<QuestionHintLadder question={mockQuestion} questionIndex={0} isOpen={true} />);

    // Unlock Level 2 then Level 3
    const level2Btn = screen.getByRole('button', { name: /2. Kademe İpucunu Aç/i });
    fireEvent.click(level2Btn);

    const level3Btn = screen.getByRole('button', { name: /3. Kademe İpucunu Aç/i });
    fireEvent.click(level3Btn);

    const saveBtn = screen.getByRole('button', { name: /Hata Defterine Ekle/i });
    expect(saveBtn).toBeInTheDocument();

    fireEvent.click(saveBtn);

    expect(screen.getByRole('button', { name: /Hata Defterinde Kayıtlı/i })).toBeInTheDocument();
  });

  it('allows student to mark "Burayı Anlamadım" on step 1 and shows guidance', () => {
    localStorage.clear();
    render(<QuestionHintLadder question={mockQuestion} questionIndex={0} isOpen={true} />);

    const puzzledBtn = screen.getByRole('button', { name: /Burayı Anlamadım/i });
    expect(puzzledBtn).toBeInTheDocument();

    fireEvent.click(puzzledBtn);

    expect(screen.getByText(/Anlaşılmadı \(İşaretlendi\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Mikro Rehber:/i)).toBeInTheDocument();
    expect(screen.getByText(/Temel kuralı formüle dönüştürmekte zorlandıysan/i)).toBeInTheDocument();
  });
});

describe('deriveQuestionHints heuristics', () => {
  it('correctly classifies trigonometry questions', () => {
    const hints = deriveQuestionHints({
      ...mockQuestion,
      question: 'sinüs ve kosinüs değerleri verilen birim çember açısı nedir?',
    });
    expect(hints.level1).toContain('sin²(x) + cos²(x) = 1');
    expect(hints.socraticAnalysis).toContain('bölgede');
  });

  it('correctly classifies logarithm questions', () => {
    const hints = deriveQuestionHints({
      ...mockQuestion,
      question: 'logaritma taban değiştirme kuralı uygulandığında sonuç kaç olur?',
    });
    expect(hints.level1).toContain('log_a(b)');
    expect(hints.criticalEquation).toContain('\\log_a');
  });

  it('correctly classifies sequence and polynomial questions', () => {
    const seqHints = deriveQuestionHints({
      ...mockQuestion,
      question: 'Bir aritmetik dizinin ilk 5 teriminin toplamı nedir?',
    });
    expect(seqHints.level1).toContain('Aritmetik');

    const polyHints = deriveQuestionHints({
      ...mockQuestion,
      question: 'P(x) polinomunun (x - 2) ile bölümünden kalan teoremi nedir?',
    });
    expect(polyHints.level1).toContain('P(a)');
  });

  it('correctly classifies special triangles and functions', () => {
    const triHints = deriveQuestionHints({
      ...mockQuestion,
      question: 'Dik kenarları verilen dik üçgen hipotenüs uzunluğu pisagor bağıntısı ile nasıl bulunur?',
    });
    expect(triHints.level1).toContain('Özel dik üçgen');

    const funcHints = deriveQuestionHints({
      ...mockQuestion,
      question: 'f(x) fonksiyonunda bileşke işlemi (f o g)(x) için değer nedir?',
    });
    expect(funcHints.level1).toContain('Fonksiyon bağıntısında');
  });
});


