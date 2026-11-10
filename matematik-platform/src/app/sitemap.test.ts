import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import sitemap from '@/app/sitemap';

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}));

describe('sitemap', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('includes only public, indexable routes', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toContain('https://www.ugurhoca.com/');
    expect(urls).toContain('https://www.ugurhoca.com/icerikler');
    expect(urls).toContain('https://www.ugurhoca.com/deneme-salonu');
    expect(urls).toContain('https://www.ugurhoca.com/cikis-bileti');
    expect(urls).toContain('https://www.ugurhoca.com/iletisim');
    expect(urls).toContain('https://www.ugurhoca.com/gizlilik');
    expect(urls).toContain('https://www.ugurhoca.com/kvkk');
    expect(urls).toContain('https://www.ugurhoca.com/cerez');

    expect(urls).not.toContain('https://www.ugurhoca.com/giris');
    expect(urls).not.toContain('https://www.ugurhoca.com/kayit');
    expect(urls).not.toContain('https://www.ugurhoca.com/odevler');
    expect(urls).not.toContain('https://www.ugurhoca.com/ilerleme');
  });

  it('excludes routes that require a session — a sitemap entry must not point at a redirecting URL', async () => {
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).not.toContain('https://www.ugurhoca.com/testler');
    expect(urls).not.toContain('https://www.ugurhoca.com/oyunlar');
    expect(urls).not.toContain('https://www.ugurhoca.com/meydan-okuma');
    expect(urls).not.toContain('https://www.ugurhoca.com/odak-pomodoro');
  });

  it('includes dynamic document urls when supabase credentials exist', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock-key';

    const mockDocs = [
      {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Üslü İfadeler Test',
        grade: [8],
        created_at: '2026-11-10T12:00:00Z',
      },
    ];

    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({ data: mockDocs, error: null }),
        }),
      }),
    });

    vi.mocked(createClient).mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: mockSelect,
      }),
    } as unknown as ReturnType<typeof createClient>);

    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toContain(
      'https://www.ugurhoca.com/icerikler/8-sinif-uslu-ifadeler-test--550e8400-e29b-41d4-a716-446655440000',
    );
  });
});
