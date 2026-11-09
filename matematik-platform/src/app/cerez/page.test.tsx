import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CerezPage from './page';

describe('CerezPage (/cerez)', () => {
  it('renders cookie policy title and required cookies explanation', () => {
    render(<CerezPage />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/çerez politikası/i);
    expect(screen.getAllByText(/zorunlu oturum çerezleri/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/uh_user_snapshot/i)).toBeInTheDocument();
    expect(screen.getByText(/reklam veya üçüncü taraf takip çerezi/i)).toBeInTheDocument();
  });

  it('contains links to privacy policy and kvkk', () => {
    render(<CerezPage />);

    const privacyLink = screen.getByRole('link', { name: /gizlilik politikası/i });
    expect(privacyLink).toHaveAttribute('href', '/gizlilik');

    const kvkkLink = screen.getByRole('link', { name: /kvkk aydınlatma metni/i });
    expect(kvkkLink).toHaveAttribute('href', '/kvkk');
  });
});
