import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GuestTrialLobby } from './components/GuestTrialLobby';
import { GUEST_QUESTIONS } from './data/guestQuestions';
import { GuestQuestionCard } from './components/GuestQuestionCard';

describe('GuestTrialLobby (/deneme-salonu)', () => {
  it('contains 3 unique MEB-aligned questions per grade (5, 6, 7, 8) including open-ended/short-answer', () => {
    for (const grade of [5, 6, 7, 8]) {
      const items = GUEST_QUESTIONS[grade];
      expect(items).toHaveLength(3);
      expect(items?.some((q) => q.question_type !== 'multiple_choice')).toBe(
        true,
      );
    }
  });

  it('switches grades interactively and renders free registration call to action', () => {
    render(<GuestTrialLobby />);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Uğur Hoca Matematik Dünyasını Keşfet/i,
      }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: /8\. Sınıf Örnekleri/i }),
    );
    expect(
      screen.getByText(/8\. SINIF MEB KAZANIMLI 3 ÖZEL ÖRNEK/i),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('link', { name: /Hemen Ücretsiz Kayıt Ol/i }),
    ).toHaveAttribute('href', '/kayit');
  });

  it('explains an empty short answer instead of silently ignoring it', () => {
    const question = GUEST_QUESTIONS[5]!.find(
      (item) => item.question_type !== 'multiple_choice',
    )!;
    render(<GuestQuestionCard question={question} index={2} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cevabı Kontrol Et' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Önce cevabını yaz.');
    const answer = screen.getByLabelText('Cevabın');
    expect(answer).toHaveAttribute('aria-invalid', 'true');
    fireEvent.change(answer, {
      target: { value: question.expected_answer!.split('|')[0] },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Cevabı Kontrol Et' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Doğru sonuca');
  });

  it('announces the chosen answer and prevents changing it after seeing the solution', () => {
    const question = GUEST_QUESTIONS[5]!.find(
      (item) => item.question_type === 'multiple_choice',
    )!;
    render(<GuestQuestionCard question={question} index={0} />);
    const choices = screen.getAllByRole('button', { pressed: false });
    fireEvent.click(choices[question.correct_index!]!);
    expect(screen.getByRole('status')).toHaveTextContent('Doğru cevap!');
    expect(screen.getByRole('button', { pressed: true })).toBeDisabled();
    expect(choices.every((choice) => choice.hasAttribute('disabled'))).toBe(
      true,
    );
  });
});
