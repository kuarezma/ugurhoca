import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GuestTrialLobby } from './components/GuestTrialLobby';
import { GUEST_QUESTIONS } from './data/guestQuestions';

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
});
