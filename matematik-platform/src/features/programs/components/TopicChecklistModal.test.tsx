import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TopicChecklistModal } from './TopicChecklistModal';

describe('TopicChecklistModal', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders topics for 8th grade and allows toggling status', () => {
    const onClose = vi.fn();
    render(
      <TopicChecklistModal isOpen={true} onClose={onClose} initialGrade="8" />,
    );

    expect(
      screen.getByText('MEB Matematik Konu Takip Çizelgesi'),
    ).toBeInTheDocument();
    expect(screen.getByText('Çarpanlar ve Katlar')).toBeInTheDocument();
    expect(screen.getByText('Üslü İfadeler')).toBeInTheDocument();

    // Toggle Konu
    const konuButtons = screen.getAllByRole('button', { name: /Konu/i });
    fireEvent.click(konuButtons[0]);

    // A4 Yazdır butonu
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    const printBtn = screen.getByRole('button', { name: /A4 Yazdır/i });
    fireEvent.click(printBtn);
    expect(printSpy).toHaveBeenCalled();
    printSpy.mockRestore();

    // Kapat butonu
    const closeBtn = screen.getByRole('button', { name: 'Kapat' });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });
});

it('reads legacy checkmarks and persists subsequent edits under the new topic', () => {
  localStorage.setItem(
    'ugurhoca_topic_checklist_v1',
    JSON.stringify({
      '8': { Olasılık: { studied: true, solved: false, reviewed: false } },
    }),
  );
  render(<TopicChecklistModal isOpen onClose={() => {}} initialGrade="8" />);
  const row = screen.getByText('Basit Olayların Olma Olasılığı').parentElement!
    .parentElement!;
  const buttons = row.querySelectorAll('button');
  expect(buttons[0]).toHaveClass('bg-tone-success-bg');
  fireEvent.click(buttons[0]);
  const saved = JSON.parse(
    localStorage.getItem('ugurhoca_topic_checklist_v1')!,
  );
  expect(saved['8']['Basit Olayların Olma Olasılığı'].studied).toBe(false);
  expect(saved['8'].Olasılık.studied).toBe(true);
});
