import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HomeCategoryHub } from './HomeCategoryHub';

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
  motion: {
    div: ({
      children,
      layoutId: _layoutId,
      whileHover: _whileHover,
      ...props
    }: ComponentPropsWithoutRef<'div'> & {
      layoutId?: string;
      whileHover?: unknown;
    }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: ComponentPropsWithoutRef<'button'>) => (
      <button {...props}>{children}</button>
    ),
  },
}));

describe('HomeCategoryHub', () => {
  const defaultProps = {
    isLight: false,
    documents: [],
    visibleAssignments: [],
    onDismissAllAssignments: vi.fn(),
    onDismissAssignment: vi.fn(),
    onOpenFlashcards: vi.fn(),
    onOpenScratchpad: vi.fn(),
    onOpenCalculator: vi.fn(),
    onOpenPomodoro: vi.fn(),
    onOpenChecklist: vi.fn(),
    onOpenGraph: vi.fn(),
    onOpenProofs: vi.fn(),
    onOpenCheatSheet: vi.fn(),
    onOpenGlossary: vi.fn(),
    onOpenTopicWeights: vi.fn(),
    onOpenWeeklyPlanner: vi.fn(),
    onOpenSpeedDrill: vi.fn(),
  };

  it('renders 3 main category tabs', () => {
    render(<HomeCategoryHub {...defaultProps} />);

    expect(
      screen.getAllByRole('tab', { name: /Dersler/i })[0],
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole('tab', { name: /Oyun/i })[0],
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole('tab', { name: /Araçlar/i })[0],
    ).toBeInTheDocument();
  });

  it('renders lessons tab by default with quick access items excluding games', () => {
    render(<HomeCategoryHub {...defaultProps} />);

    expect(
      screen.getByText('Hızlı Erişim & Ders Materyalleri'),
    ).toBeInTheDocument();
    expect(screen.getByText('Yaprak Test')).toBeInTheDocument();
    expect(screen.getByText('Kitaplar')).toBeInTheDocument();
    expect(screen.getByText('Ders Videoları')).toBeInTheDocument();
  });

  it('switches to games tab and shows games content and speed drill trigger', () => {
    render(<HomeCategoryHub {...defaultProps} />);

    const gamesTab = screen.getAllByRole('tab', { name: /Oyun/i })[0];
    fireEvent.click(gamesTab);

    expect(
      screen.getByText('Matematik Oyunları & Hızlı Egzersizler'),
    ).toBeInTheDocument();
    expect(screen.getByText('60 Saniye Formül Eşleştirme')).toBeInTheDocument();

    const speedDrillBtn = screen.getByRole('button', {
      name: /Hız Antrenmanını Başlat/i,
    });
    fireEvent.click(speedDrillBtn);
    expect(defaultProps.onOpenSpeedDrill).toHaveBeenCalled();
  });

  it('switches to tools tab and shows tools grid excluding games', () => {
    render(<HomeCategoryHub {...defaultProps} />);

    const toolsTab = screen.getAllByRole('tab', { name: /Araçlar/i })[0];
    fireEvent.click(toolsTab);

    expect(
      screen.getByText('Matematikte Seni Zirveye Taşıyacak Araçlar'),
    ).toBeInTheDocument();
    expect(screen.getByText('Formül & Bilgi Kartları')).toBeInTheDocument();
    expect(screen.getByText('Karalama & İşlem Tahtası')).toBeInTheDocument();
    expect(
      screen.getByText(/LGS Matematik Taktik Köşesi/i),
    ).toBeInTheDocument();
  });
});
