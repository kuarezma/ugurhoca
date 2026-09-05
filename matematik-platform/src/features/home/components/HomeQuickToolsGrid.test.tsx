import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HomeQuickToolsGrid } from './HomeQuickToolsGrid';

describe('HomeQuickToolsGrid', () => {
  it('renders all tools and handles modal triggers', () => {
    const onOpenFlashcards = vi.fn();
    const onOpenScratchpad = vi.fn();
    const onOpenGraph = vi.fn();
    const onOpenProofs = vi.fn();
    const onOpenGlossary = vi.fn();

    render(
      <HomeQuickToolsGrid
        isLight={false}
        onOpenFlashcards={onOpenFlashcards}
        onOpenScratchpad={onOpenScratchpad}
        onOpenGraph={onOpenGraph}
        onOpenProofs={onOpenProofs}
        onOpenGlossary={onOpenGlossary}
      />,
    );

    expect(screen.getByText('Matematikte Seni Zirveye Taşıyacak Araçlar')).toBeInTheDocument();
    expect(screen.getByText('İnteraktif Görsel Formül İspatları')).toBeInTheDocument();
    expect(screen.getByText('Fonksiyon & Grafik Laboratuvarı')).toBeInTheDocument();
    expect(screen.getByText('Formül & Bilgi Kartları')).toBeInTheDocument();
    expect(screen.getByText('Karalama & İşlem Tahtası')).toBeInTheDocument();
    expect(screen.getByText('Matematik Kavram Sözlüğü')).toBeInTheDocument();

    const glossaryBtn = screen.getByRole('button', { name: /Sözlüğü Aç/i });
    fireEvent.click(glossaryBtn);
    expect(onOpenGlossary).toHaveBeenCalled();

    const proofsBtn = screen.getByRole('button', { name: /İspatı İncele/i });
    fireEvent.click(proofsBtn);
    expect(onOpenProofs).toHaveBeenCalled();

    const graphBtn = screen.getByRole('button', { name: /Grafiği İncele/i });
    fireEvent.click(graphBtn);
    expect(onOpenGraph).toHaveBeenCalled();

    const flashcardsBtn = screen.getByRole('button', { name: /Kartları Aç/i });
    fireEvent.click(flashcardsBtn);
    expect(onOpenFlashcards).toHaveBeenCalled();

    const scratchpadBtn = screen.getByRole('button', { name: /Tahtayı Başlat/i });
    fireEvent.click(scratchpadBtn);
    expect(onOpenScratchpad).toHaveBeenCalled();

    // Check link type tool
    const calcLink = screen.getByRole('link', { name: /Net Hesapla/i });
    expect(calcLink).toHaveAttribute('href', '/programlar');
  });
});
