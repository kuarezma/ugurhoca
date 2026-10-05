import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import AdminUsersTab from './AdminUsersTab';

vi.mock('@/lib/auth-client', () => ({
  getClientSession: vi.fn().mockResolvedValue({ access_token: 'test-token' }),
}));

afterEach(() => vi.unstubAllGlobals());

it('öğrenci aralığını sunucudan sayfalar ve toplamı gösterir', async () => {
  const fetchMock = vi.fn().mockImplementation(async (url: string) => ({
    ok: true,
    json: async () => ({
      data: {
        items: [{
          id: url.includes('page=1') ? 'student-41' : 'student-1',
          name: url.includes('page=1') ? 'Betül' : 'Ayşe',
          email: 'student@example.com',
          grade: 7,
        }],
        pageSize: 40,
        total: 41,
      },
    }),
  }));
  vi.stubGlobal('fetch', fetchMock);

  render(
    <AdminUsersTab
      formatDate={() => ''}
      onDownloadPdf={vi.fn()}
      onEditUser={vi.fn()}
      onRefresh={vi.fn()}
      onSendMessage={vi.fn()}
      onToggleFavorite={vi.fn()}
      onViewProfile={vi.fn()}
      pdfStudentsLoading={false}
      refreshVersion={1}
      students={[]}
    />,
  );

  await screen.findByText('Ayşe');
  expect(screen.getAllByText(/41 öğrenci/).length).toBeGreaterThan(0);
  fireEvent.click(screen.getByRole('button', { name: 'Sonraki' }));
  await screen.findByText('Betül');
  await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
    expect.stringContaining('page=1'),
    expect.objectContaining({ headers: { Authorization: 'Bearer test-token' } }),
  ));
});
