import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HomeDailyChallenge } from './HomeDailyChallenge';

describe('HomeDailyChallenge', () => {
  it('renders daily challenge title and question options', () => {
    render(<HomeDailyChallenge isLight={false} />);

    expect(screen.getByText('Günün Matematik Meydan Okuması')).toBeInTheDocument();
    expect(screen.getByText('Mantık & Cebir')).toBeInTheDocument();
    expect(screen.getByText(/Bir sayının 3 katının 5 fazlası/i)).toBeInTheDocument();

    const optionButtons = screen.getAllByRole('button');
    expect(optionButtons.length).toBeGreaterThan(3);
  });

  it('selects an option and displays explanation', () => {
    render(<HomeDailyChallenge isLight={false} />);

    const correctOptionBtn = screen.getByText('6');
    fireEvent.click(correctOptionBtn);

    expect(screen.getByText(/Tebrikler! Doğru Cevap/i)).toBeInTheDocument();
    expect(screen.getByText(/Ayrıntılı Çözüm:/i)).toBeInTheDocument();
  });
});
