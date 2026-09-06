import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AccessibilitySettingsModal } from './AccessibilitySettingsModal';

describe('AccessibilitySettingsModal', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('does not render when isOpen is false', () => {
    render(<AccessibilitySettingsModal isOpen={false} onClose={() => {}} />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders modal with accessibility options and WCAG compliance badge', () => {
    render(<AccessibilitySettingsModal isOpen={true} onClose={() => {}} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Kişisel Görünüm & Erişilebilirlik')).toBeInTheDocument();
    expect(screen.getByText('WCAG 2.2 Uyumlu')).toBeInTheDocument();
    expect(screen.getByText('Yazı Büyüklüğü (Metin Ölçekleme)')).toBeInTheDocument();
    expect(screen.getByText('Dokunma Alanı Boyutu (W3C Target Size)')).toBeInTheDocument();
  });

  it('updates font size setting when clicked', () => {
    render(<AccessibilitySettingsModal isOpen={true} onClose={() => {}} />);

    const largeBtn = screen.getByRole('button', { name: /^Büyük/i });
    fireEvent.click(largeBtn);

    expect(screen.getByText('Büyük (%115)')).toBeInTheDocument();
  });

  it('toggles reduced motion switch', () => {
    render(<AccessibilitySettingsModal isOpen={true} onClose={() => {}} />);

    const switches = screen.getAllByRole('switch');
    const motionSwitch = switches[0];
    expect(motionSwitch).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(motionSwitch);
    expect(motionSwitch).toHaveAttribute('aria-checked', 'true');
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(<AccessibilitySettingsModal isOpen={true} onClose={handleClose} />);

    const closeBtn = screen.getByRole('button', { name: 'Kapat' });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
