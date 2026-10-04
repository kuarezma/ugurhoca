import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AdminStatistics from './AdminStatistics';

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: (table: string) => ({
      select: vi.fn().mockResolvedValue({
        data:
          table === 'profiles'
            ? [
                { email: 'a@example.com', grade: 0 },
                { email: 'b@example.com', grade: 'Mezun' },
                { email: 'c@example.com', grade: 8 },
                { email: 'admin@ugurhoca.com', grade: 0 },
              ]
            : [],
        count: 0,
      }),
    }),
  },
}));

describe('AdminStatistics sınıf sayımı', () => {
  it('0 ve Mezun öğrencilerini aynı grupta sayar, admini dışlar', async () => {
    render(<AdminStatistics />);
    const graduateLabels = await screen.findAllByText('Mezun');
    const card = graduateLabels[0].parentElement!;
    expect(within(card).getByText('2')).toBeInTheDocument();
    expect(screen.queryByText('0. Sınıf')).not.toBeInTheDocument();
  });
});
