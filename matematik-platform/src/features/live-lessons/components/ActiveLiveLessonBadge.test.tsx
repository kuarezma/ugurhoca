import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ActiveLiveLessonBadge } from './ActiveLiveLessonBadge';

vi.mock('@/components/SafeLink', () => ({
  SafeLink: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props} />
  ),
}));

describe('ActiveLiveLessonBadge', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
  });
  afterEach(() => vi.unstubAllGlobals());

  it('anonim kullanıcı için sorgu veya rozet oluşturmaz', () => {
    const { container } = render(<ActiveLiveLessonBadge />);
    expect(container).toBeEmptyDOMElement();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('kişisel rozeti önbelleksiz yükler ve çıkışta kaldırır', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ lesson: { room_id: 'room-1', title: 'Matematik' } }),
    });
    const { rerender } = render(<ActiveLiveLessonBadge userId="student-1" />);
    const badge = await screen.findByRole('link', {
      name: 'Matematik canlı dersine katıl',
    });
    expect(badge).toHaveAttribute('href', '/canli-ders/d/room-1');
    expect(badge).toHaveClass('fixed');
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/live-lessons/active',
      expect.objectContaining({
        cache: 'no-store',
        credentials: 'same-origin',
      }),
    );
    rerender(<ActiveLiveLessonBadge />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('eski kullanıcının geç yanıtını yeni kullanıcıya göstermez', async () => {
    let resolveOld!: (value: unknown) => void;
    fetchMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveOld = resolve;
        }),
    );
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ lesson: null }),
    });
    const { rerender } = render(<ActiveLiveLessonBadge userId="student-1" />);
    const signal = fetchMock.mock.calls[0][1].signal as AbortSignal;
    rerender(<ActiveLiveLessonBadge userId="student-2" />);
    expect(signal.aborted).toBe(true);
    await act(async () => {
      resolveOld({
        ok: true,
        json: async () => ({ lesson: { room_id: 'old', title: 'Eski' } }),
      });
    });
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it.each(['http', 'network'])('hata durumunda boş kalır: %s', async (kind) => {
    if (kind === 'http') fetchMock.mockResolvedValue({ ok: false });
    else fetchMock.mockRejectedValue(new Error('offline'));
    const { container } = render(<ActiveLiveLessonBadge userId="student-1" />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(container).toBeEmptyDOMElement();
  });
});
