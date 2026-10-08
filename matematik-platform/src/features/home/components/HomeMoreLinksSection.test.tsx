import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HomeMoreLinksSection } from './HomeMoreLinksSection';

describe('HomeMoreLinksSection', () => {
  it('renders the live lesson and challenge links with their accessible labels', () => {
    render(<HomeMoreLinksSection />);

    expect(
      screen.getByRole('heading', { level: 2, name: 'Daha Fazlası' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(2);
    expect(screen.getByRole('link', { name: 'Canlı Dersler' })).toHaveAttribute(
      'href',
      '/canli-ders',
    );
    expect(screen.getByRole('link', { name: 'Meydan Okuma' })).toHaveAttribute(
      'href',
      '/meydan-okuma',
    );
    expect(screen.getByText('Canlı Ders')).toBeInTheDocument();
    expect(screen.getByText('Meydan Okuma')).toBeInTheDocument();
  });
});
