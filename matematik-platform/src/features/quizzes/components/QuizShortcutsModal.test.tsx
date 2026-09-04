import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QuizShortcutsModal } from './QuizShortcutsModal';

describe('QuizShortcutsModal', () => {
  it('does not render when isOpen is false', () => {
    render(<QuizShortcutsModal isOpen={false} onClose={() => {}} />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders modal dialog when isOpen is true', () => {
    render(<QuizShortcutsModal isOpen={true} onClose={() => {}} />);
    expect(screen.getByRole('dialog', { name: 'Test Klavye Kısayolları' })).toBeInTheDocument();
    expect(screen.getByText('Test Klavye Kısayolları')).toBeInTheDocument();
    expect(screen.getByText('Fareye dokunmadan hızlıca test çöz.')).toBeInTheDocument();
  });

  it('calls onClose when close icon button is clicked', () => {
    const handleClose = vi.fn();
    render(<QuizShortcutsModal isOpen={true} onClose={handleClose} />);
    const closeBtn = screen.getByRole('button', { name: 'Pencereyi kapat' });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when "Anladım" button is clicked', () => {
    const handleClose = vi.fn();
    render(<QuizShortcutsModal isOpen={true} onClose={handleClose} />);
    const understandBtn = screen.getByRole('button', { name: 'Anladım' });
    fireEvent.click(understandBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
