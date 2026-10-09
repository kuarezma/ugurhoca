import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HomeAdventureView } from './HomeAdventureView';
import { loadAdventureProgress } from './adventure-queries';
import { getCurriculumContentHref } from '@/features/content/curriculum-coverage';
import type { AppUser } from '@/types';

vi.mock('./adventure-queries', () => ({ loadAdventureProgress: vi.fn() }));
vi.mock('@/components/Mascot', () => ({ Mascot: () => <span>Pi</span> }));
const user: AppUser = {
  id: 'student',
  name: 'Ayşe',
  email: 'student@example.test',
  grade: 8,
};

describe('HomeAdventureView', () => {
  beforeEach(() => vi.clearAllMocks());
  it('keeps later units accessible and ties daily tasks to the active topic', async () => {
    vi.mocked(loadAdventureProgress).mockResolvedValue({
      currentStreak: 2,
      quizCount: 3,
      badgeCount: 1,
      topics: [{ topic: 'Çarpanlar ve Katlar', mastery_level: 90 }],
    });
    render(<HomeAdventureView user={user} />);
    await waitFor(() =>
      expect(
        screen.getByRole('link', { name: /Günün görevi/ }),
      ).toHaveAttribute(
        'href',
        getCurriculumContentHref(8, 'Üslü İfadeler', 'yaprak-test'),
      ),
    );
    expect(
      screen.getByRole('link', { name: 'Yaprak Teste Git' }),
    ).toHaveAttribute(
      'href',
      getCurriculumContentHref(8, 'Üslü İfadeler', 'yaprak-test'),
    );
    fireEvent.click(
      screen.getByRole('button', { name: '3. Ünite: Kareköklü İfadeler' }),
    );
    expect(
      screen.getByRole('link', { name: /Yaprak Testi Çöz/ }),
    ).toHaveAttribute(
      'href',
      getCurriculumContentHref(8, 'Kareköklü İfadeler', 'yaprak-test'),
    );
    expect(
      screen.queryByRole('link', { name: /Oyunla Pratik/ }),
    ).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: 'Konu penceresini kapat' }),
    );
    fireEvent.click(screen.getByRole('button', { name: '5. Sınıf' }));
    await waitFor(() =>
      expect(
        screen.getByRole('link', { name: 'Yaprak Teste Git' }),
      ).toHaveAttribute(
        'href',
        getCurriculumContentHref(
          5,
          'Temel Geometrik Çizimler ve İnşalar',
          'yaprak-test',
        ),
      ),
    );
  });
  it('opens existing topic flashcards and uses grade 12 for graduates', async () => {
    vi.mocked(loadAdventureProgress).mockResolvedValue({
      currentStreak: 0,
      quizCount: 0,
      badgeCount: 0,
      topics: [],
    });
    const openCards = vi.fn();
    render(
      <HomeAdventureView
        user={{ ...user, grade: 'Mezun' }}
        onOpenFlashcards={openCards}
      />,
    );
    const unitButton = await screen.findByRole('button', {
      name: '2. Ünite: Türev',
    });
    fireEvent.click(unitButton);
    fireEvent.click(
      screen.getByRole('button', { name: 'Konunun Formül Kartları' }),
    );
    expect(openCards).toHaveBeenCalledWith('Türev');
  });
});
