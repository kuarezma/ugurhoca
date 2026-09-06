import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HomeworkLoadCalendarModal, { calculateEstimatedMinutes } from './HomeworkLoadCalendarModal';
import type { Assignment } from '@/types';

describe('HomeworkLoadCalendarModal Component', () => {
  const d = new Date();
  const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const mockAssignments: Assignment[] = [
    {
      id: 'ass-1',
      title: 'Köklü Sayılar 20 Soru',
      description: 'LGS çalışma yaprağı 20 soru çözülecek.',
      grade: 8,
      due_date: `${todayStr}T20:00:00Z`,
      created_at: '2026-09-01T10:00:00Z',
    },
    {
      id: 'ass-2',
      title: 'Geometri 45 dakika tekrar',
      description: 'Özel üçgenler 45 dakika pratik.',
      grade: 8,
      due_date: `${todayStr}T21:00:00Z`,
      created_at: '2026-09-01T10:00:00Z',
    },
  ];

  it('calculates estimated minutes correctly from description', () => {
    expect(calculateEstimatedMinutes(mockAssignments[0])).toBe(50); // 20 * 2.5 = 50
    expect(calculateEstimatedMinutes(mockAssignments[1])).toBe(45); // 45 dakika
    expect(calculateEstimatedMinutes({ ...mockAssignments[0], description: '' })).toBe(35); // default
  });

  it('renders correctly when open and displays load details', () => {
    const onClose = vi.fn();
    render(
      <HomeworkLoadCalendarModal
        isOpen={true}
        onClose={onClose}
        assignments={mockAssignments}
        submissions={{}}
      />,
    );

    expect(screen.getByText('Ödev Yükü Takvimi & Çakışma Radarı')).toBeInTheDocument();
    expect(screen.getByText('Köklü Sayılar 20 Soru')).toBeInTheDocument();
    expect(screen.getByText('Geometri 45 dakika tekrar')).toBeInTheDocument();
  });

  it('triggers onSelectAssignment when button is clicked', () => {
    const onClose = vi.fn();
    const onSelect = vi.fn();

    render(
      <HomeworkLoadCalendarModal
        isOpen={true}
        onClose={onClose}
        assignments={mockAssignments}
        submissions={{}}
        onSelectAssignment={onSelect}
      />,
    );

    const openBtns = screen.getAllByRole('button', { name: /Ödevi Aç/i });
    expect(openBtns.length).toBeGreaterThan(0);
    fireEvent.click(openBtns[0]);

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
