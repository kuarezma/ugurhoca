import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { WeeklyPlanCard } from './WeeklyPlanCard';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    prefetch: vi.fn(),
    push: vi.fn(),
  }),
}));

describe('WeeklyPlanCard', () => {
  it('renders completion toggles with aria-pressed, kind badges, and safe internal Aç links', () => {
    const onToggleItem = vi.fn();

    render(
      <WeeklyPlanCard
        onToggleItem={onToggleItem}
        plan={{
          id: 'plan-1',
          status: 'active',
          student_id: 'student-1',
          target_minutes: 600,
          title: 'Haftalık Çalışma Planı',
          week_start: '2026-04-27',
          student_weekly_plan_items: [
            {
              completed_at: null,
              href: '/testler?quizId=q-1',
              id: 'i-quiz',
              kind: 'quiz',
              plan_id: 'plan-1',
              title: 'Üslü Testi Çöz',
            },
            {
              completed_at: '2026-04-28T10:00:00Z',
              href: '/odevler',
              id: 'i-assn',
              kind: 'assignment',
              plan_id: 'plan-1',
              title: 'Kareköklü Ödevi',
            },
            {
              completed_at: null,
              href: '/icerikler?id=doc-1',
              id: 'i-doc',
              kind: 'content',
              plan_id: 'plan-1',
              title: 'Örnek Sorular Föyü',
            },
            {
              completed_at: null,
              href: 'javascript:alert(1)',
              id: 'i-unsafe-js',
              kind: 'custom',
              plan_id: 'plan-1',
              title: 'JS Bağlantılı Görev',
            },
            {
              completed_at: null,
              href: '//evil.test/steal',
              id: 'i-unsafe-proto',
              kind: 'custom',
              plan_id: 'plan-1',
              title: 'Protokol Bağlantılı Görev',
            },
            {
              completed_at: null,
              href: 'https://external.example/phish',
              id: 'i-unsafe-ext',
              kind: 'custom',
              plan_id: 'plan-1',
              title: 'Dış Linkli Görev',
            },
          ],
        }}
      />,
    );

    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByText('Ödev')).toBeInTheDocument();
    expect(screen.getByText('İçerik')).toBeInTheDocument();
    expect(screen.getByText('1/6')).toBeInTheDocument();

    const quizToggle = screen.getByRole('button', {
      name: /Üslü Testi Çöz/i,
    });
    expect(quizToggle).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(quizToggle);
    expect(onToggleItem).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'i-quiz' }),
    );

    const assnToggle = screen.getByRole('button', {
      name: /Kareköklü Ödevi/i,
    });
    expect(assnToggle).toHaveAttribute('aria-pressed', 'true');

    // Yalnız 3 güvenli dahili bağlantı için "Aç" bağlantısı oluşturulur
    const openLinks = screen.getAllByRole('link', {
      name: /bağlantısını aç$/i,
    });
    expect(openLinks).toHaveLength(3);
    expect(
      screen.getByRole('link', { name: 'Üslü Testi Çöz bağlantısını aç' }),
    ).toHaveAttribute('href', '/testler?quizId=q-1');
    expect(
      screen.getByRole('link', { name: 'Kareköklü Ödevi bağlantısını aç' }),
    ).toHaveAttribute('href', '/odevler');
    expect(
      screen.getByRole('link', { name: 'Örnek Sorular Föyü bağlantısını aç' }),
    ).toHaveAttribute('href', '/icerikler?id=doc-1');

    expect(
      screen.queryByRole('link', {
        name: 'JS Bağlantılı Görev bağlantısını aç',
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', {
        name: 'Protokol Bağlantılı Görev bağlantısını aç',
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', {
        name: 'Dış Linkli Görev bağlantısını aç',
      }),
    ).not.toBeInTheDocument();
  });
});
