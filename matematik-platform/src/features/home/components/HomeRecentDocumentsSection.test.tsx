import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
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
    const { container } = render(
      <HomeRecentDocumentsSection documents={[]} />,
    );

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
      screen.getByText(
        'M.8.1.1.1 Pozitif tam sayıların çarpanlarını bulur.',
      ),
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

  it('seçili sınıfta doküman yoksa boş durum mesajını ve kütüphane bağlantısını gösterir', () => {
    const onlyGrade5Docs: ContentDocument[] = [mockDocs[0]];
    render(<HomeRecentDocumentsSection documents={onlyGrade5Docs} />);

    // 8. Sınıf sekmesine tıkla
    fireEvent.click(screen.getByRole('tab', { name: '8. Sınıf (LGS)' }));

    expect(
      screen.getByText(
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
    render(
      <HomeRecentDocumentsSection documents={mockDocs} userGrade={7} />,
    );

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
});
