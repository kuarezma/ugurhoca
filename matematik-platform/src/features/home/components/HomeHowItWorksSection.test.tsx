import { render, screen, within } from '@testing-library/react';
import { HomeHowItWorksSection } from './HomeHowItWorksSection';

it('öğrenci akışını dört sıralı adımda anlatır', () => {
  render(<HomeHowItWorksSection />);
  const section = within(screen.getByRole('region', { name: 'Nasıl çalışır' }));
  expect(section.getAllByRole('listitem')).toHaveLength(4);
  for (const title of [
    'Konuyu öğren',
    'Testlerle pekiştir',
    'Çalışmanı takip et',
    'Canlı derse katıl',
  ]) {
    expect(section.getByRole('heading', { name: title })).toBeInTheDocument();
  }
  expect(
    section.getByText(
      /5–8. sınıf düzeyinde ücretsiz ders notları ve yaprak testler/,
    ),
  ).toBeInTheDocument();
  expect(section.getByText(/İnteraktif testleri/)).toBeInTheDocument();
  expect(section.getByText(/ödevlerini, haftalık planını/)).toBeInTheDocument();
  expect(section.getByText(/Canlı ders akışını/)).toBeInTheDocument();
});
