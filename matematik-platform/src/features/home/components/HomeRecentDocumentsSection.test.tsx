import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { fetchHomeDocuments } from '@/features/home/queries';
import { HOME_DOCUMENTS_UPDATED_EVENT } from '@/features/home/home-documents-events';
import type { AppUser, ContentDocument } from '@/types';
import {
  HomeRecentDocumentsSection,
  HomeUserContext,
  parseHomeDocumentMeta,
} from './HomeRecentDocumentsSection';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/',
}));

vi.mock('@/features/home/queries', () => ({
  fetchHomeDocuments: vi.fn().mockResolvedValue([]),
  isNewContent: vi.fn(() => false),
}));

beforeEach(() => {
  vi.mocked(fetchHomeDocuments).mockReset().mockResolvedValue([]);
});

const mockDocs: ContentDocument[] = [
  {
    id: 'doc-5',
    title: '5. Sınıf Doğal Sayılarla İşlemler Yaprak Test',
    grade: [5],
    type: 'yaprak-test',
    created_at: '2026-10-24T10:00:00.000Z',
    file_url: 'https://example.com/5-ogrenci.pdf',
    solution_url: null,
    description: 'Doğal sayılar temel pekiştirme föyü',
    is_admin_only: false,
  } as ContentDocument,
  {
    id: 'doc-6',
    title: '6. Sınıf Kesirlerle Çarpma Yaprak Test',
    grade: [6],
    type: 'yaprak-test',
    created_at: '2026-10-23T10:00:00.000Z',
    file_url: 'https://example.com/6-ogrenci.pdf',
    solution_url: 'https://example.com/6-cozum.pdf',
    description: 'Kesirlerle modelleme test föyü',
    is_admin_only: false,
  } as ContentDocument,
  {
    id: 'doc-7',
    title: '7. Sınıf Rasyonel Sayılar El Yazısı Çözümlü Test',
    grade: [7],
    type: 'yaprak-test',
    created_at: '2026-10-22T10:00:00.000Z',
    file_url: 'https://example.com/7-ogrenci.pdf',
    solution_url: 'https://example.com/7-cozum.pdf',
    description:
      '__WS_META__{"outcome":"M.7.1.1.1 Tam Sayılarla Toplama ve Çıkarma"}\nÖğretmen el yazısı çözümlü yaprak test föyü.',
    is_admin_only: false,
  } as ContentDocument,
  {
    id: 'doc-8',
    title: '8. Sınıf LGS Çarpanlar ve Katlar Çözümlü Föy',
    grade: [8],
    type: 'yaprak-test',
    created_at: '2026-10-21T10:00:00.000Z',
    file_url: 'https://example.com/8-ogrenci.pdf',
    solution_url: 'https://example.com/8-cozum.pdf',
    description:
      '__WS_META__{"outcome":"M.8.1.1.1 Pozitif tam sayıların çarpanlarını bulur."}\nÖğretmen kırmızı kalem el yazısı çözümlü föy.',
    is_admin_only: false,
  } as ContentDocument,
];

describe('HomeRecentDocumentsSection', () => {
  it('boş documents listesinde null render eder (hiçbir DOM elemanı basmaz)', () => {
    const { container } = render(<HomeRecentDocumentsSection documents={[]} />);

    expect(container).toBeEmptyDOMElement();
    expect(
      screen.queryByTestId('home-recent-documents-section'),
    ).not.toBeInTheDocument();
  });

  it('5, 6, 7 ve 8. sınıf içeriklerini doğru başlık, kazanım etiketi, el yazısı çözümlü rozeti ve PDF linkleriyle render eder (__WS_META__ gizlenir)', () => {
    const { container } = render(
      <HomeRecentDocumentsSection documents={mockDocs} />,
    );

    // Section ana taşıyıcısı mevcut
    expect(
      screen.getByTestId('home-recent-documents-section'),
    ).toBeInTheDocument();

    // Bölüm başlık ve tanıtım metinleri
    expect(
      screen.getByText('Son Eklenen Yaprak Testler ve Çalışma Kağıtları'),
    ).toBeInTheDocument();

    // 5, 6, 7 ve 8. sınıf başlıkları gridde yer alır
    expect(
      screen.getByText('5. Sınıf Doğal Sayılarla İşlemler Yaprak Test'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('6. Sınıf Kesirlerle Çarpma Yaprak Test'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('7. Sınıf Rasyonel Sayılar El Yazısı Çözümlü Test'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('8. Sınıf LGS Çarpanlar ve Katlar Çözümlü Föy'),
    ).toBeInTheDocument();

    // Kazanım etiketleri: 7 ve 8. sınıf için '🎯 Kazanım:' görünmeli
    const kazanims = screen.getAllByText('🎯 Kazanım:');
    expect(kazanims.length).toBeGreaterThanOrEqual(2);
    expect(
      screen.getByText('M.7.1.1.1 Tam Sayılarla Toplama ve Çıkarma'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('M.8.1.1.1 Pozitif tam sayıların çarpanlarını bulur.'),
    ).toBeInTheDocument();

    // Temizlenmiş açıklamalar render edilirken ham __WS_META__ asla render edilmemelidir
    expect(
      screen.getByText('Öğretmen el yazısı çözümlü yaprak test föyü.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Öğretmen kırmızı kalem el yazısı çözümlü föy.'),
    ).toBeInTheDocument();
    expect(container.textContent).not.toContain('__WS_META__');

    // 'El Yazısı Çözümlü' rozetleri (7 ve 8. sınıf için)
    const handwrittenBadges = screen.getAllByText('El Yazısı Çözümlü');
    expect(handwrittenBadges.length).toBe(2);

    // Öğrenci PDF ve Çözüm PDF buton bağlantıları
    const studentPdfLinks = screen.getAllByRole('link', {
      name: /Öğrenci PDF/i,
    });
    expect(studentPdfLinks).toHaveLength(4);
    expect(studentPdfLinks[0]).toHaveAttribute(
      'href',
      'https://example.com/5-ogrenci.pdf',
    );
    expect(studentPdfLinks[2]).toHaveAttribute(
      'href',
      'https://example.com/7-ogrenci.pdf',
    );

    const solutionPdfLinks = screen.getAllByRole('link', {
      name: /Çözüm PDF/i,
    });
    expect(solutionPdfLinks).toHaveLength(3); // 6, 7 ve 8. sınıfta var
    expect(solutionPdfLinks[1]).toHaveAttribute(
      'href',
      'https://example.com/7-cozum.pdf',
    );
    expect(solutionPdfLinks[2]).toHaveAttribute(
      'href',
      'https://example.com/8-cozum.pdf',
    );
  });

  it('sınıf filtre sekmelerine tıklandığında içerikleri doğru filtreler ve Tümü sekmesine dönünce hepsini gösterir', () => {
    render(<HomeRecentDocumentsSection documents={mockDocs} />);

    // Başlangıçta 'Tümü' seçilidir ve tüm dokümanlar görünür
    const allTab = screen.getByRole('tab', { name: 'Tümü' });
    expect(allTab).toHaveAttribute('aria-selected', 'true');
    expect(
      screen.getByText('5. Sınıf Doğal Sayılarla İşlemler Yaprak Test'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('6. Sınıf Kesirlerle Çarpma Yaprak Test'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('7. Sınıf Rasyonel Sayılar El Yazısı Çözümlü Test'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('8. Sınıf LGS Çarpanlar ve Katlar Çözümlü Föy'),
    ).toBeInTheDocument();

    // 5. Sınıf sekmesine tıkla
    fireEvent.click(screen.getByRole('tab', { name: '5. Sınıf' }));
    expect(
      screen.getByText('5. Sınıf Doğal Sayılarla İşlemler Yaprak Test'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('6. Sınıf Kesirlerle Çarpma Yaprak Test'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('7. Sınıf Rasyonel Sayılar El Yazısı Çözümlü Test'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('8. Sınıf LGS Çarpanlar ve Katlar Çözümlü Föy'),
    ).not.toBeInTheDocument();

    // 6. Sınıf sekmesine tıkla
    fireEvent.click(screen.getByRole('tab', { name: '6. Sınıf' }));
    expect(
      screen.queryByText('5. Sınıf Doğal Sayılarla İşlemler Yaprak Test'),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText('6. Sınıf Kesirlerle Çarpma Yaprak Test'),
    ).toBeInTheDocument();

    // 7. Sınıf sekmesine tıkla
    fireEvent.click(screen.getByRole('tab', { name: '7. Sınıf' }));
    expect(
      screen.queryByText('6. Sınıf Kesirlerle Çarpma Yaprak Test'),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText('7. Sınıf Rasyonel Sayılar El Yazısı Çözümlü Test'),
    ).toBeInTheDocument();

    // 8. Sınıf sekmesine tıkla
    fireEvent.click(screen.getByRole('tab', { name: '8. Sınıf (LGS)' }));
    expect(
      screen.queryByText('7. Sınıf Rasyonel Sayılar El Yazısı Çözümlü Test'),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText('8. Sınıf LGS Çarpanlar ve Katlar Çözümlü Föy'),
    ).toBeInTheDocument();

    // Tekrar 'Tümü' sekmesine tıkla
    fireEvent.click(allTab);
    expect(allTab).toHaveAttribute('aria-selected', 'true');
    expect(
      screen.getByText('5. Sınıf Doğal Sayılarla İşlemler Yaprak Test'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('6. Sınıf Kesirlerle Çarpma Yaprak Test'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('7. Sınıf Rasyonel Sayılar El Yazısı Çözümlü Test'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('8. Sınıf LGS Çarpanlar ve Katlar Çözümlü Föy'),
    ).toBeInTheDocument();
  });

  it('seçili sınıfta doküman yoksa boş durum mesajını ve kütüphane bağlantısını gösterir', async () => {
    const onlyGrade5Docs: ContentDocument[] = [mockDocs[0]];
    render(<HomeRecentDocumentsSection documents={onlyGrade5Docs} />);

    // 8. Sınıf sekmesine tıkla
    fireEvent.click(screen.getByRole('tab', { name: '8. Sınıf (LGS)' }));

    expect(
      await screen.findByText(
        'Bu sınıf düzeyi için son eklenenler listesinde içerik bulunamadı.',
      ),
    ).toBeInTheDocument();
    const libraryLink = screen.getByRole('link', {
      name: /Tüm Kütüphaneyi Aç/i,
    });
    expect(libraryLink).toHaveAttribute(
      'href',
      '/icerikler?type=yaprak-test&grade=8',
    );
  });

  it('userGrade={7} verildiğinde otomatik olarak 7. Sınıf sekmesine odaklanır ve Sınıfın rozetini gösterir', () => {
    render(<HomeRecentDocumentsSection documents={mockDocs} userGrade={7} />);

    const tab7 = screen.getByRole('tab', { name: /7\. Sınıf/i });
    expect(tab7).toHaveAttribute('aria-selected', 'true');
    expect(within(tab7).getByText('Sınıfın')).toBeInTheDocument();

    // Yalnızca 7. sınıf dokümanı listelenmelidir
    expect(
      screen.getByText('7. Sınıf Rasyonel Sayılar El Yazısı Çözümlü Test'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('5. Sınıf Doğal Sayılarla İşlemler Yaprak Test'),
    ).not.toBeInTheDocument();
  });

  it('HomeUserContext.Provider ile kullanıcı sağlandığında da kullanıcının sınıfına otomatik odaklanır', () => {
    const user: AppUser = {
      id: 'student-6',
      email: 'ogrenci@okul.com',
      name: 'Zeynep',
      grade: 6,
    } as AppUser;

    render(
      <HomeUserContext.Provider value={user}>
        <HomeRecentDocumentsSection documents={mockDocs} />
      </HomeUserContext.Provider>,
    );

    const tab6 = screen.getByRole('tab', { name: /6\. Sınıf/i });
    expect(tab6).toHaveAttribute('aria-selected', 'true');
    expect(within(tab6).getByText('Sınıfın')).toBeInTheDocument();
    expect(
      screen.getByText('6. Sınıf Kesirlerle Çarpma Yaprak Test'),
    ).toBeInTheDocument();
  });

  it('parseHomeDocumentMeta yardımcı fonksiyonu kenar durumları hatasız ayrıştırır', () => {
    expect(parseHomeDocumentMeta(null)).toEqual({
      cleanDescription: '',
      outcome: null,
    });
    expect(parseHomeDocumentMeta(undefined)).toEqual({
      cleanDescription: '',
      outcome: null,
    });
    expect(parseHomeDocumentMeta('Sıradan açıklama')).toEqual({
      cleanDescription: 'Sıradan açıklama',
      outcome: null,
    });
    expect(
      parseHomeDocumentMeta(
        '__WS_META__{"outcome":"M.5.1.1.1"}\nTemel doğal sayılar föyü',
      ),
    ).toEqual({
      cleanDescription: 'Temel doğal sayılar föyü',
      outcome: 'M.5.1.1.1',
    });
    expect(
      parseHomeDocumentMeta('__WS_META__{gecersiz_json}\nAçıklama metni'),
    ).toEqual({
      cleanDescription: 'Açıklama metni',
      outcome: null,
    });
  });

  it('6 adetten fazla yeni içerik geldiğinde en fazla 6 içerik kartı gösterir', () => {
    const eightDocs: ContentDocument[] = Array.from(
      { length: 8 },
      (_, idx) => ({
        ...mockDocs[idx % mockDocs.length],
        id: `doc-limit-${idx + 1}`,
        title: `Yeni İçerik Kartı #${idx + 1}`,
      }),
    );

    render(<HomeRecentDocumentsSection documents={eightDocs} />);

    for (let i = 1; i <= 6; i += 1) {
      expect(screen.getByText(`Yeni İçerik Kartı #${i}`)).toBeInTheDocument();
    }
    expect(screen.queryByText('Yeni İçerik Kartı #7')).not.toBeInTheDocument();
    expect(screen.queryByText('Yeni İçerik Kartı #8')).not.toBeInTheDocument();
  });
});

describe('sınıfa özel içerik yükleme', () => {
  it('kullanıcı sınıfı ilk listede olmasa da otomatik seçer ve getirir', async () => {
    vi.mocked(fetchHomeDocuments).mockResolvedValue([mockDocs[0]]);
    render(
      <HomeRecentDocumentsSection documents={[mockDocs[3]]} userGrade={5} />,
    );
    expect(screen.getByRole('tab', { name: /5\. Sınıf/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(await screen.findByText(mockDocs[0].title)).toBeInTheDocument();
    expect(fetchHomeDocuments).toHaveBeenCalledWith(6, 5);
  });

  it('başarılı sınıf sonucunu sekmeye dönünce tekrar sorgulamadan gösterir', async () => {
    vi.mocked(fetchHomeDocuments).mockResolvedValue([mockDocs[0]]);
    render(<HomeRecentDocumentsSection documents={[mockDocs[3]]} />);
    fireEvent.click(screen.getByRole('tab', { name: '5. Sınıf' }));
    await screen.findByText(mockDocs[0].title);
    fireEvent.click(screen.getByRole('tab', { name: 'Tümü' }));
    fireEvent.click(screen.getByRole('tab', { name: '5. Sınıf' }));
    expect(screen.getByText(mockDocs[0].title)).toBeInTheDocument();
    expect(fetchHomeDocuments).toHaveBeenCalledTimes(1);
  });

  it('hata sonrasında tekrar deneyince içerikleri gösterir', async () => {
    vi.mocked(fetchHomeDocuments)
      .mockRejectedValueOnce(new Error('Hata'))
      .mockResolvedValueOnce([mockDocs[0]]);
    render(<HomeRecentDocumentsSection documents={[mockDocs[3]]} />);
    fireEvent.click(screen.getByRole('tab', { name: '5. Sınıf' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Tekrar dene' }));
    expect(await screen.findByText(mockDocs[0].title)).toBeInTheDocument();
    expect(fetchHomeDocuments).toHaveBeenCalledTimes(2);
  });

  it('genel listede bulunmayan eski sınıf içeriğini getirir', async () => {
    vi.mocked(fetchHomeDocuments).mockResolvedValueOnce([mockDocs[0]]);
    render(<HomeRecentDocumentsSection documents={[mockDocs[3]]} />);
    fireEvent.click(screen.getByRole('tab', { name: '5. Sınıf' }));
    expect(await screen.findByText(mockDocs[0].title)).toBeInTheDocument();
    expect(fetchHomeDocuments).toHaveBeenCalledWith(6, 5);
  });

  it('geç gelen önceki sekme sonucunu seçili sekmede göstermez', async () => {
    let resolveFive!: (docs: ContentDocument[]) => void;
    vi.mocked(fetchHomeDocuments)
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFive = resolve;
          }),
      )
      .mockResolvedValueOnce([mockDocs[1]]);
    render(<HomeRecentDocumentsSection documents={mockDocs} />);
    fireEvent.click(screen.getByRole('tab', { name: '5. Sınıf' }));
    fireEvent.click(screen.getByRole('tab', { name: '6. Sınıf' }));
    await screen.findByText(mockDocs[1].title);
    await act(async () => resolveFive([mockDocs[0]]));
    expect(screen.queryByText(mockDocs[0].title)).not.toBeInTheDocument();
  });

  it('güncellemede boş sonuç dönerse silinmiş kartı kaldırır', async () => {
    vi.mocked(fetchHomeDocuments)
      .mockResolvedValueOnce([mockDocs[0]])
      .mockResolvedValue([]);
    render(<HomeRecentDocumentsSection documents={mockDocs} />);
    fireEvent.click(screen.getByRole('tab', { name: '5. Sınıf' }));
    await screen.findByText(mockDocs[0].title);
    await waitFor(() => expect(fetchHomeDocuments).toHaveBeenCalledTimes(1));
    await act(async () =>
      window.dispatchEvent(new Event(HOME_DOCUMENTS_UPDATED_EVENT)),
    );
    await waitFor(() =>
      expect(screen.queryByText(mockDocs[0].title)).not.toBeInTheDocument(),
    );
    expect(fetchHomeDocuments).toHaveBeenCalledWith(16);
    expect(
      vi.mocked(fetchHomeDocuments).mock.calls.filter((args) => args[1] === 5),
    ).toHaveLength(2);
  });
});
