import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import AdminDocumentsTab from './AdminDocumentsTab';

const { range } = vi.hoisted(() => ({ range: vi.fn() }));
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        order: () => ({
          order: () => ({ range }),
        }),
      }),
    }),
  },
}));

beforeEach(() => {
  range.mockReset();
  range.mockImplementation(async (from: number) => ({
    count: 41,
    data: [{ id: String(from), title: `Belge ${from + 1}`, type: 'pdf', description: '' }],
    error: null,
  }));
});

it('içerikleri veritabanından sayfalar ve gerçek toplamı gösterir', async () => {
  render(
    <AdminDocumentsTab
      documents={[]}
      formatDate={() => ''}
      onDelete={vi.fn()}
      onEdit={vi.fn()}
      onMigrateWorksheets={vi.fn()}
      onRefreshCategories={vi.fn()}
    />,
  );

  await screen.findByText('Belge 1');
  expect(screen.getByText('Tüm İçerikler (41)')).toBeInTheDocument();
  expect(range).toHaveBeenCalledWith(0, 39);

  fireEvent.click(screen.getByRole('button', { name: 'Sonraki' }));
  await screen.findByText('Belge 41');
  await waitFor(() => expect(range).toHaveBeenCalledWith(40, 79));
});
