import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HomeSuccessRoadmap } from './HomeSuccessRoadmap';

describe('HomeSuccessRoadmap', () => {
  it('renders all 4 roadmap steps and triggers flashcards modal', () => {
    const onOpenFlashcards = vi.fn();

    render(
      <HomeSuccessRoadmap isLight={false} onOpenFlashcards={onOpenFlashcards} />,
    );

    expect(screen.getByText('2026-2027 Başarı Yol Haritası')).toBeInTheDocument();
    expect(screen.getByText('4 Adımda Matematik Başarını Zirveye Taşı')).toBeInTheDocument();
    expect(screen.getByText('Konuyu Keşfet')).toBeInTheDocument();
    expect(screen.getByText('Soru ve Test Çöz')).toBeInTheDocument();
    expect(screen.getByText('Formülleri Pekiştir')).toBeInTheDocument();
    expect(screen.getByText('Canlı Ders & Destek')).toBeInTheDocument();

    const flashcardsBtn = screen.getByRole('button', { name: /Formül Kartları/i });
    fireEvent.click(flashcardsBtn);
    expect(onOpenFlashcards).toHaveBeenCalled();
  });
});
