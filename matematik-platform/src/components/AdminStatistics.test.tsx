import { render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AdminStatistics from './AdminStatistics';

vi.mock('@/lib/auth-client', () => ({
  getClientSession: vi.fn().mockResolvedValue({ access_token: 'test-token' }),
}));

afterEach(() => vi.unstubAllGlobals());

describe('AdminStatistics', () => {
  it('sunucudan gelen sınıf sayılarını gösterir', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          totalUsers: 3,
          totalDocuments: 0,
          totalNotes: 0,
          totalAssignments: 0,
          totalDownloads: 0,
          totalViews: 0,
          usersByGrade: [
            { grade: '8. Sınıf', count: 1 },
            { grade: 'Mezun', count: 2 },
          ],
          recentSignups: 3,
          mostActiveDay: '-',
        },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<AdminStatistics />);

    const graduateLabels = await screen.findAllByText('Mezun');
    const card = graduateLabels[0].parentElement!;
    expect(within(card).getByText('2')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith('/api/admin/site-statistics?range=all', {
      credentials: 'same-origin',
      headers: { Authorization: 'Bearer test-token' },
    });
  });
});
