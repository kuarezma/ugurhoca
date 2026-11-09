import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import IletisimPage from './page';

describe('IletisimPage (/iletisim)', () => {
  it('renders contact title and teacher credentials correctly', () => {
    render(<IletisimPage />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('İletişim');
    expect(screen.getByText('Uğur YAŞAYAN')).toBeInTheDocument();
    expect(screen.getByText('Matematik Öğretmeni')).toBeInTheDocument();
  });

  it('explains in-platform support chat for questions and submissions', () => {
    render(<IletisimPage />);

    expect(screen.getAllByText(/destek sohbeti/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/doğrudan soru, görsel ve mesaj/i)).toBeInTheDocument();
  });

  it('does not contain prohibited terms like okul müdürü or özel ders', () => {
    const { container } = render(<IletisimPage />);
    const text = container.textContent || '';

    expect(text).not.toMatch(/okul müdürü/i);
    expect(text).not.toMatch(/özel ders/i);
    expect(text).not.toMatch(/ücretli/i);
    expect(text).not.toMatch(/mustafa özkan/i);
    expect(text).not.toMatch(/ali rıza hacıoğlu/i);
  });
});
