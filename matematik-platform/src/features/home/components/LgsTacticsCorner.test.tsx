import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LgsTacticsCorner, LGS_TACTICS } from './LgsTacticsCorner';

describe('LgsTacticsCorner Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders tactics corner title, countdown, and tactic details', () => {
    render(<LgsTacticsCorner isLight={false} />);

    expect(screen.getByText('LGS Matematik Taktik Köşesi')).toBeInTheDocument();
    expect(screen.getByText(/LGS'ye Son/i)).toBeInTheDocument();
    expect(screen.getByText(/Yeni nesil sorularda hız ve net/i)).toBeInTheDocument();
  });

  it('allows cycling between tactics using previous and next buttons', () => {
    render(<LgsTacticsCorner isLight={false} />);

    const nextBtn = screen.getByRole('button', { name: /Sonraki Taktik/i });
    const prevBtn = screen.getByRole('button', { name: /Önceki Taktik/i });

    expect(nextBtn).toBeInTheDocument();
    expect(prevBtn).toBeInTheDocument();

    // Click next
    fireEvent.click(nextBtn);
    expect(screen.getByText(new RegExp(`Taktik \\d+ / ${LGS_TACTICS.length}`, 'i'))).toBeInTheDocument();
  });

  it('allows toggling tactic as applied / noted down', () => {
    render(<LgsTacticsCorner isLight={false} />);

    const noteBtn = screen.getByRole('button', { name: /Bu Taktiği Not Al/i });
    fireEvent.click(noteBtn);

    expect(screen.getByRole('button', { name: /Uygulandı & Not Alındı/i })).toBeInTheDocument();
    expect(screen.getByText(/1 taktik hafızaya eklendi/i)).toBeInTheDocument();
  });
});
