import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import ContentDetailPage, {
  generateMetadata,
} from '@/app/icerikler/[slug]/page';
import * as serverSupabaseModule from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

vi.mock('@/lib/env.server', () => ({
  hasSupabasePublicEnv: () => true,
  getSupabasePublicEnv: () => ({
    url: 'https://mock.supabase.co',
    anonKey: 'mock-key',
  }),
}));

describe('ContentDetailPage', () => {
  const sampleUuid = '550e8400-e29b-41d4-a716-446655440000';
  const sampleSlug = `8-sinif-uslu-ifadeler-yaprak-test--${sampleUuid}`;

  const sampleDoc = {
    id: sampleUuid,
    title: '8. Sınıf Üslü İfadeler Yaprak Test',
    description:
      '__WS_META__{"outcome":"M.8.1.2.1."}\nTam sayilarin pozitif kuvvetleri',
    grade: [8],
    type: 'yaprak-test',
    file_url: 'https://drive.google.com/file/d/drive-file-id/view',
    solution_url: 'https://example.com/solution.pdf',
    created_at: '2026-11-10T10:00:00Z',
    views: 120,
    downloads: 45,
    likes: 18,
    is_admin_only: false,
    author: 'Uğur YAŞAYAN',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generateMetadata produces dynamic page title, description, and canonical url', async () => {
    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: sampleDoc, error: null }),
      }),
    });

    vi.spyOn(
      serverSupabaseModule,
      'createCachedPublicSupabaseClient',
    ).mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: mockSelect,
      }),
    } as unknown as ReturnType<
      typeof serverSupabaseModule.createCachedPublicSupabaseClient
    >);

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: sampleSlug }),
    });

    expect(metadata.title).toBe('8. Sınıf Üslü İfadeler Yaprak Test');
    expect(metadata.description).toContain('Tam sayilarin pozitif kuvvetleri');
    expect(metadata.alternates?.canonical).toBe(
      `https://www.ugurhoca.com/icerikler/${sampleSlug}`,
    );
  });

  it('generateMetadata returns not-found metadata for unknown slug', async () => {
    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi
          .fn()
          .mockResolvedValue({ data: null, error: new Error('not found') }),
      }),
    });

    vi.spyOn(
      serverSupabaseModule,
      'createCachedPublicSupabaseClient',
    ).mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: mockSelect,
      }),
    } as unknown as ReturnType<
      typeof serverSupabaseModule.createCachedPublicSupabaseClient
    >);

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: 'gecersiz-slug' }),
    });

    expect(metadata.title).toBe('İçerik Bulunamadı');
    expect(metadata.robots).toEqual(
      expect.objectContaining({
        index: false,
        follow: false,
      }),
    );
  });

  it('renders page content with Schema.org JSON-LD, badges, and download link', async () => {
    const mockSelect = vi.fn().mockImplementation((_query: string) => ({
      eq: vi.fn().mockImplementation((column: string, val: unknown) => {
        if (column === 'id' && val === sampleUuid) {
          return {
            single: vi.fn().mockResolvedValue({ data: sampleDoc, error: null }),
          };
        }
        return {
          neq: vi.fn().mockReturnValue({
            contains: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({ data: [], error: null }),
              }),
            }),
          }),
        };
      }),
    }));

    vi.spyOn(
      serverSupabaseModule,
      'createCachedPublicSupabaseClient',
    ).mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: mockSelect,
      }),
    } as unknown as ReturnType<
      typeof serverSupabaseModule.createCachedPublicSupabaseClient
    >);

    const PageJsx = await ContentDetailPage({
      params: Promise.resolve({ slug: sampleSlug }),
    });

    render(PageJsx);

    // Title
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: '8. Sınıf Üslü İfadeler Yaprak Test',
      }),
    ).toBeInTheDocument();

    // Badges & metadata
    expect(screen.getAllByText('8. Sınıf')[0]).toBeInTheDocument();
    expect(screen.getByText('Yaprak Test')).toBeInTheDocument();
    expect(screen.getByText('Çözümlü')).toBeInTheDocument();

    // Clean description without __WS_META__
    expect(
      screen.getByText('Tam sayilarin pozitif kuvvetleri'),
    ).toBeInTheDocument();

    // Download action
    const downloadBtns = screen.getAllByRole('link', {
      name: /Dokümanı İndir \(PDF\)/i,
    });
    expect(downloadBtns.length).toBeGreaterThanOrEqual(1);
    expect(downloadBtns[0]).toHaveAttribute('href', sampleDoc.file_url);

    // Interactive library link
    const libraryBtn = screen.getByRole('link', {
      name: /Kütüphanede Etkileşimli Aç/i,
    });
    expect(libraryBtn).toHaveAttribute('href', `/icerikler?id=${sampleUuid}`);
    fireEvent.click(
      screen.getByRole('button', { name: 'Tam Ekran İşlem Tahtasında Çöz' }),
    );
    expect(
      await screen.findByTitle(`${sampleDoc.title} — PDF önizleme`),
    ).toHaveAttribute(
      'src',
      'https://drive.google.com/file/d/drive-file-id/preview',
    );
  });

  it('triggers notFound when document is admin-only or does not exist', async () => {
    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { ...sampleDoc, is_admin_only: true },
          error: null,
        }),
      }),
    });

    vi.spyOn(
      serverSupabaseModule,
      'createCachedPublicSupabaseClient',
    ).mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: mockSelect,
      }),
    } as unknown as ReturnType<
      typeof serverSupabaseModule.createCachedPublicSupabaseClient
    >);

    await expect(
      ContentDetailPage({
        params: Promise.resolve({ slug: sampleSlug }),
      }),
    ).rejects.toThrow('NEXT_NOT_FOUND');

    expect(notFound).toHaveBeenCalled();
  });
});
