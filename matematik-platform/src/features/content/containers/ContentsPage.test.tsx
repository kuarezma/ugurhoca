import { act, render, screen, waitFor } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ContentsPage from './ContentsPage';
import {
  loadContentDocuments,
  resolveContentUser,
} from '@/features/content/queries';

const navigation = vi.hoisted(() => ({
  params: new URLSearchParams(),
  suspend: false,
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/icerikler',
  useSearchParams: () => {
    if (navigation.suspend) throw new Promise(() => {});
    return navigation.params;
  },
}));
vi.mock('@/components/Toast', () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));
vi.mock('@/features/content/queries', () => ({
  resolveContentUser: vi.fn(),
  loadContentDocuments: vi.fn(),
  seedContentDocumentCache: vi.fn(),
}));
vi.mock('@/features/content/hooks/useCloudFavorites', () => ({
  useCloudFavorites: () => ({
    isFavorite: () => false,
    toggleFavorite: vi.fn(),
  }),
}));
vi.mock('@/features/content/hooks/useContentCompletion', () => ({
  useContentCompletion: () => ({
    isCompleted: () => false,
    toggleCompleted: vi.fn(),
  }),
}));

describe('ContentsPage static feed and client filters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState({}, '', '/icerikler');
    navigation.params = new URLSearchParams();
    navigation.suspend = false;
    vi.mocked(resolveContentUser).mockResolvedValue(null);
    vi.mocked(loadContentDocuments).mockResolvedValue({
      count: 0,
      documents: [],
    });
  });

  it('URL okuması askıya alınsa bile anonim içerikleri HTML içinde tutar', () => {
    navigation.suspend = true;
    const html = renderToString(
      <ContentsPage
        initialDocuments={[
          {
            id: 'doc-1',
            title: 'Anonim içerik',
            type: 'kitaplar',
            grade: [7],
          },
        ]}
        initialTotalCount={1}
      />,
    );
    expect(html).toContain('Anonim içerik');
    expect(html).toContain('Tüm sınıflar için içerikler');
  });

  it.each([
    [null, 'Tüm sınıflar için içerikler', 'all'],
    [
      { id: 'student', grade: 7, isAdmin: false },
      '7. sınıf için tüm içerikler',
      7,
    ],
    [
      { id: 'admin', grade: 7, isAdmin: true },
      'Tüm sınıflar için içerikler',
      'all',
    ],
  ] as const)(
    'kullanıcının varsayılan sınıfını istemcide uygular: %j',
    async (user, text, grade) => {
      vi.mocked(resolveContentUser).mockResolvedValue(user as never);
      render(<ContentsPage />);
      expect(await screen.findByText(text)).toBeInTheDocument();
      await waitFor(() => expect(resolveContentUser).toHaveBeenCalledOnce());
      if (grade === 'all') expect(loadContentDocuments).not.toHaveBeenCalled();
      else
        expect(loadContentDocuments).toHaveBeenCalledWith(
          1,
          expect.any(Number),
          grade,
          'all',
          expect.any(Object),
        );
    },
  );

  it('açık URL sınıfı ve kategorisini öğrenci varsayılanıyla ezmez', async () => {
    window.history.replaceState({}, '', '/icerikler?grade=8&type=kitaplar');
    navigation.params = new URLSearchParams('grade=8&type=kitaplar');
    vi.mocked(resolveContentUser).mockResolvedValue({
      id: 'student',
      grade: 7,
      isAdmin: false,
    } as never);
    render(<ContentsPage />);
    await waitFor(() =>
      expect(loadContentDocuments).toHaveBeenCalledWith(
        1,
        expect.any(Number),
        8,
        'kitaplar',
        expect.any(Object),
      ),
    );
    expect(
      screen.queryByText('7. sınıf için tüm içerikler'),
    ).not.toBeInTheDocument();
  });

  it.each([0, 1])(
    'aynı sınıf ve kategori için geçerli SSR seedini tekrar çekmez (count=%i)',
    async (count) => {
      window.history.replaceState({}, '', '/icerikler?type=kitaplar');
      navigation.params = new URLSearchParams('type=kitaplar');
      vi.mocked(resolveContentUser).mockResolvedValue({
        id: 'student',
        grade: 7,
        isAdmin: false,
      } as never);
      render(
        <ContentsPage
          initialGrade={7}
          initialType="kitaplar"
          initialTotalCount={count}
          initialDocuments={
            count
              ? [
                  {
                    id: 'seed',
                    title: 'SSR kitap',
                    grade: [7],
                    type: 'kitaplar',
                  },
                ]
              : []
          }
        />,
      );
      await act(async () => {
        await Promise.resolve();
      });
      expect(
        screen.getByText('Seçili kategorideki içerikler'),
      ).toBeInTheDocument();
      await waitFor(() => expect(resolveContentUser).toHaveBeenCalledOnce());
      expect(loadContentDocuments).not.toHaveBeenCalled();
    },
  );
});
