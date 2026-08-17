import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HomeQuickToolsGrid } from './HomeQuickToolsGrid';

describe('HomeQuickToolsGrid', () => {
  it('renders all tools and handles modal triggers', () => {
    const onOpenFlashcards = vi.fn();
    const onOpenScratchpad = vi.fn();

    render(
      <HomeQuickToolsGrid
        isLight={false}
        onOpenFlashcards={onOpenFlashcards}
        onOpenScratchpad={onOpenScratchpad}
      />,
    );

    expect(screen.getByText('Matematikte Seni Zirveye Taşıyacak Araçlar')).toBeInTheDocument();
    expect(screen.getByText('Formül & Bilgi Kartları')).toBeInTheDocument();
    expect(screen.getByText('Karalama & İşlem Tahtası')).toBeInTheDocument();

    const flashcardsBtn = screen.getByRole('button', { name: /Kartları Aç/i });
    fireEvent.click(flashcardsBtn);
    expect(onOpenFlashcards).toHaveBeenCalled();

    const scratchpadBtn = screen.getByRole('button', { name: /Tahtayı Başlat/i });
    fireEvent.click(scratchpadBtn);
    expect(onOpenScratchpad).toHaveBeenCalled();
  });
});
