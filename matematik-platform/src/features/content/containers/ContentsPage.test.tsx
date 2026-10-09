import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ContentsPage from './ContentsPage';
import {
  loadContentDocuments,
  loadWorksheetDocumentsByGrade,
  resolveContentUser,
  seedContentDocumentCache,
  updateDocumentMetric,
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
  loadWorksheetDocumentsByGrade: vi.fn(),
  seedContentDocumentCache: vi.fn(),
  updateDocumentMetric: vi.fn(),
}));
vi.mock('@/features/analytics/trackActivity', () => ({
  trackStudentActivityEvent: vi.fn(),
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
    vi.mocked(loadWorksheetDocumentsByGrade).mockResolvedValue([]);
    vi.mocked(loadContentDocuments).mockResolvedValue({
      count: 0,
      documents: [],
    });
  });

  it('applies a note topic q from the URL to the editable search and query', async () => {
    navigation.params = new URLSearchParams({ type: 'ders-notlari', grade: '8', q: 'Kareköklü İfadeler' });
    window.history.replaceState({}, '', `/icerikler?${navigation.params}`);
    render(<ContentsPage />);
    await waitFor(() => expect(screen.getByPlaceholderText('İçerik ara...')).toHaveValue('Kareköklü İfadeler'));
    await waitFor(() => expect(loadContentDocuments).toHaveBeenCalledWith(1, 5, 8, 'ders-notlari', expect.objectContaining({ searchTerm: 'Kareköklü İfadeler' })));
  });

  it('uses topic metadata for worksheet q and keeps matching tests visible inside outcomes', async () => {
    navigation.params = new URLSearchParams({ type: 'yaprak-test', grade: '8', q: 'Kareköklü İfadeler' });
    window.history.replaceState({}, '', `/icerikler?${navigation.params}`);
    vi.mocked(loadWorksheetDocumentsByGrade).mockResolvedValue([
      { id: 'root', title: 'Test - 1', type: 'yaprak-test', grade: [8], description: '__WS_META__{"outcome":"Kareköklü İfadeler","order":1}\nAlıştırmalar' },
      { id: 'other', title: 'Test - 2', type: 'yaprak-test', grade: [8], description: 'Üslü İfadeler' },
    ]);
    render(<ContentsPage />);
    const outcome = await screen.findByRole(
      'button',
      { name: /Kareköklü İfadeler/ },
      { timeout: 10000 },
    );
    expect(screen.queryByRole('button', { name: /Üslü İfadeler/ })).not.toBeInTheDocument();
    fireEvent.click(outcome);
    expect(await screen.findByText('Test - 1')).toBeInTheDocument();
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

  it('beğeniyi geri almak sayaç rotasına ikinci bir +1 göndermez', async () => {
    vi.mocked(updateDocumentMetric).mockResolvedValue(undefined);
    render(
      <ContentsPage
        initialDocuments={[
          { id: 'doc-1', title: 'Beğenilen içerik', type: 'kitaplar', grade: [7], likes: 2 },
        ]}
        initialTotalCount={1}
      />,
    );

    const likeButton = await screen.findByTitle('Beğen');
    fireEvent.click(likeButton);
    await waitFor(() => expect(likeButton).toHaveTextContent('3'));
    fireEvent.click(likeButton);
    await waitFor(() => expect(likeButton).toHaveTextContent('2'));

    expect(updateDocumentMetric).toHaveBeenCalledTimes(1);
    expect(updateDocumentMetric).toHaveBeenCalledWith('doc-1', { likes: 3 });
  });

  it('SSR sorgusu başarısızsa boş seed kullanmadan içerikleri yeniden çeker', async () => {
    vi.mocked(loadContentDocuments).mockResolvedValue({
      count: 1,
      documents: [
        {
          id: 'recovered',
          title: 'Yeniden yüklenen içerik',
          type: 'kitaplar',
          grade: [7],
        },
      ],
    });
    render(<ContentsPage initialLoadSucceeded={false} />);
    expect(
      await screen.findByText('Yeniden yüklenen içerik'),
    ).toBeInTheDocument();
    expect(seedContentDocumentCache).not.toHaveBeenCalled();
    expect(loadContentDocuments).toHaveBeenCalledWith(
      1,
      5,
      'all',
      'all',
      expect.any(Object),
    );
  });

  it('kaynak hatasında beklemeyi bitirir ve yeniden deneme sunar', async () => {
    vi.mocked(loadContentDocuments)
      .mockRejectedValueOnce(new Error('Timeout'))
      .mockResolvedValueOnce({
        count: 1,
        documents: [
          {
            id: 'retried',
            title: 'Tekrar yüklenen içerik',
            type: 'kitaplar',
            grade: [7],
          },
        ],
      });
    render(<ContentsPage initialLoadSucceeded={false} />);
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'İçerikler yüklenemedi',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Yeniden dene' }));
    expect(
      await screen.findByText('Tekrar yüklenen içerik'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
