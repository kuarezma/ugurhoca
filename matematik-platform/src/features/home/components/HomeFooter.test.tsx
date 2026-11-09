import { render, screen } from '@testing-library/react';
import { HomeFooter } from './HomeFooter';

it('kurumsal ve destek sayfalarına güncel bağlantıları sunar', () => {
  render(<HomeFooter />);
  for (const [name, href] of [
    ['Gizlilik Politikası', '/gizlilik'],
    ['KVKK Aydınlatma Metni', '/kvkk'],
    ['Çerez Politikası', '/cerez'],
    ['İletişim', '/iletisim'],
  ]) {
    expect(screen.getByRole('link', { name })).toHaveAttribute('href', href);
  }
  expect(
    screen.queryByRole('link', { name: 'Çerez Tercihleri' }),
  ).not.toBeInTheDocument();
});
