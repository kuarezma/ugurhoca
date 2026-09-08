import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { SmartBoardPresentationMode } from './SmartBoardPresentationMode';

describe('SmartBoardPresentationMode', () => {
  beforeEach(() => {
    // Mock requestFullscreen and exitFullscreen
    Object.defineProperty(document.documentElement, 'requestFullscreen', {
      value: vi.fn().mockResolvedValue(undefined),
      configurable: true,
      writable: true,
    });
    Object.defineProperty(document, 'exitFullscreen', {
      value: vi.fn().mockResolvedValue(undefined),
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.className = '';
  });

  it('renders smart board toolbar and buttons properly', () => {
    render(<SmartBoardPresentationMode />);

    expect(screen.getByText('Ders Modu')).toBeInTheDocument();
    expect(screen.getByText('Yazı: 1.0x')).toBeInTheDocument();
    expect(screen.getByText('Kalem')).toBeInTheDocument();
    expect(screen.getByText('Vurgu')).toBeInTheDocument();
    expect(screen.getByText('Silgi')).toBeInTheDocument();
    expect(screen.getByText('Temizle')).toBeInTheDocument();
  });

  it('cycles font scale when font button is clicked', () => {
    render(<SmartBoardPresentationMode />);
    const fontBtn = screen.getByText('Yazı: 1.0x');

    fireEvent.click(fontBtn);
    expect(screen.getByText('Yazı: 1.25x')).toBeInTheDocument();
    expect(document.body.classList.contains('board-mode-large')).toBe(true);

    fireEvent.click(screen.getByText('Yazı: 1.25x'));
    expect(screen.getByText('Yazı: 1.5x')).toBeInTheDocument();
    expect(document.body.classList.contains('board-mode-xlarge')).toBe(true);

    fireEvent.click(screen.getByText('Yazı: 1.5x'));
    expect(screen.getByText('Yazı: 1.0x')).toBeInTheDocument();
    expect(document.body.classList.contains('board-mode-large')).toBe(false);
    expect(document.body.classList.contains('board-mode-xlarge')).toBe(false);
  });

  it('toggles drawing tools on click', () => {
    render(<SmartBoardPresentationMode />);
    const penBtn = screen.getByText('Kalem');

    fireEvent.click(penBtn);
    expect(penBtn).toHaveClass('bg-red-600');

    // Clicking again deactivates
    fireEvent.click(penBtn);
    expect(penBtn).not.toHaveClass('bg-red-600');
  });
});
