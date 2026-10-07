import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AdventureTopHUD } from './AdventureTopHUD';
import { ADVENTURE_CURRICULUM } from './AdventureCurriculumData';
import type { AppUser } from '@/types';

vi.mock('@/components/Mascot', () => ({ Mascot: () => <div>Pi</div> }));
const user: AppUser = {
  id: 'student',
  name: 'Ayşe',
  email: 'student@example.test',
  grade: 8,
};
const topic = ADVENTURE_CURRICULUM['8'][1];
const props = { completedTopics: 2, totalTopics: 11, activeTopic: topic };

describe('AdventureTopHUD', () => {
  it('shows a login call and no counters for an anonymous visitor', () => {
    render(
      <AdventureTopHUD
        {...props}
        user={null}
        progress={{
          currentStreak: 5,
          quizCount: 22,
          badgeCount: 4,
          topics: [],
        }}
      />,
    );
    expect(
      screen.getByRole('link', { name: 'Giriş yap, ilerlemen kaydedilsin' }),
    ).toHaveAttribute('href', '/giris');
    expect(screen.queryByText('Gün Serisi')).not.toBeInTheDocument();
    expect(screen.queryByText('Çözülen Test')).not.toBeInTheDocument();
    expect(screen.queryByText(/XP|Elmas|Seviye 7/)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Günün görevi/ })).toHaveAttribute(
      'href',
      topic.testsHref,
    );
  });
  it('renders actual signed-in counters and the completed topic ratio', () => {
    render(
      <AdventureTopHUD
        {...props}
        user={user}
        progress={{
          currentStreak: 9,
          quizCount: 22,
          badgeCount: 4,
          topics: [],
        }}
      />,
    );
    for (const value of ['9', '22', '4', '2/11', '18%'])
      expect(screen.getByText(value)).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /Giriş yap/ }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/XP|Elmas/)).not.toBeInTheDocument();
  });
  it('does not substitute zero counts during loading or failure and supports retry', () => {
    const retry = vi.fn();
    const { rerender } = render(
      <AdventureTopHUD {...props} user={user} progress={null} loading />,
    );
    expect(screen.getByRole('status')).toHaveTextContent(
      'İlerlemen yükleniyor',
    );
    expect(screen.queryByText('Çözülen Test')).not.toBeInTheDocument();
    rerender(
      <AdventureTopHUD
        {...props}
        user={user}
        progress={null}
        error="İlerlemen yüklenemedi."
        onRetry={retry}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Yeniden dene' }));
    expect(retry).toHaveBeenCalledOnce();
  });
  it('renders real zero values and handles all topics completed', () => {
    render(
      <AdventureTopHUD
        {...props}
        activeTopic={null}
        completedTopics={11}
        user={user}
        progress={{ currentStreak: 0, quizCount: 0, badgeCount: 0, topics: [] }}
      />,
    );
    expect(screen.getAllByText('0')).toHaveLength(3);
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText(/tüm konularını tamamladın/)).toBeInTheDocument();
  });
});
