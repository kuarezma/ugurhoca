import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, fireEvent } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import {
  ExamCountdownCard,
  getMotivationMotto,
  getTimeRemaining,
} from './ExamCountdownCard';

describe('ExamCountdownCard', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });
  it('shows an active countdown for upcoming 2027 LGS', () => {
    render(<ExamCountdownCard userGrade={8} isLight={false} />);

    expect(screen.getByText("LGS'ye Kalan Süre")).toBeInTheDocument();
    expect(screen.getByText('MEB')).toBeInTheDocument();
    expect(screen.getByText(/13 Haziran 2027/i)).toBeInTheDocument();
    expect(screen.getByText(/Hedef: 18 Net/i)).toBeInTheDocument();
  });

  it('shows an active countdown when YKS tab is selected', () => {
    render(<ExamCountdownCard userGrade={8} isLight={false} />);

    const yksBtn = screen.getByRole('button', { name: 'YKS' });
    fireEvent.click(yksBtn);

    expect(screen.getByText("YKS'ye Kalan Süre")).toBeInTheDocument();
    expect(screen.getByText('ÖSYM')).toBeInTheDocument();
    expect(screen.getByText(/19 Haziran 2027/i)).toBeInTheDocument();
  });

  it('marks elapsed exams as completed and uses the completed-exam message', () => {
    expect(
      getTimeRemaining(
        '2027-06-13T09:30:00+03:00',
        Date.parse('2027-09-07T12:00:00+03:00'),
      ),
    ).toEqual({ days: 0, hours: 0, isCompleted: true, minutes: 0 });
    expect(getMotivationMotto(0, 'LGS', true)).toContain('tamamlandı');
  });
});

describe('ExamCountdownCard hydration', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('keeps SSR independent of clock and saved targets, then updates after hydration', async () => {
    const now = vi
      .spyOn(Date, 'now')
      .mockReturnValue(Date.parse('2026-06-12T00:00:00Z'));
    const storage = vi.spyOn(localStorage, 'getItem');
    const element = <ExamCountdownCard userGrade={8} />;
    const html = renderToString(element);
    expect(now).not.toHaveBeenCalled();
    expect(storage).not.toHaveBeenCalled();

    now.mockReturnValue(Date.parse('2027-10-04T00:00:00Z'));
    localStorage.setItem('ugurhoca_exam_target_lgs-2027', '23');
    expect(renderToString(element)).toBe(html);
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);
    const onRecoverableError = vi.fn();
    let root: ReturnType<typeof hydrateRoot>;
    await act(async () => {
      root = hydrateRoot(container, element, { onRecoverableError });
    });
    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(container.textContent).toContain('LGS tamamlandı');
    expect(container.textContent).toContain('Hedef: 23 Net');
    act(() => root.unmount());
    container.remove();
  });

  it('uses the default target if local storage is unavailable', () => {
    vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
      throw new Error('disabled');
    });
    render(<ExamCountdownCard userGrade={8} />);
    expect(screen.getByText(/Hedef: 18 Net/i)).toBeInTheDocument();
  });
});
