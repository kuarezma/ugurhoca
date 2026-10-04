import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeSelectorDropdown } from './ThemeSelectorDropdown';
import { THEME_PALETTES } from './theme-constants';

const mockSetTheme = vi.fn();
const mockSetPalette = vi.fn();

vi.mock('@/components/ThemeProvider', () => ({
  useTheme: () => ({
    theme: 'dark',
    setTheme: mockSetTheme,
    palette: 'classic',
    setPalette: mockSetPalette,
  }),
}));

describe('ThemeSelectorDropdown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders trigger button with current palette name and icon', () => {
    render(<ThemeSelectorDropdown />);
    const trigger = screen.getByRole('button', { name: /tema ve renk paleti seçimi/i });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveTextContent(/klasik/i);
  });

  it('opens popup menu when trigger is clicked', () => {
    render(<ThemeSelectorDropdown />);
    const trigger = screen.getByRole('button', { name: /tema ve renk paleti seçimi/i });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Check all 5 palettes are listed inside dialog
    const dialog = screen.getByRole('dialog');
    THEME_PALETTES.forEach((palette) => {
      expect(dialog).toHaveTextContent(palette.name);
    });
  });

  it('calls setPalette when a palette option is selected', () => {
    render(<ThemeSelectorDropdown />);
    const trigger = screen.getByRole('button', { name: /tema ve renk paleti seçimi/i });
    fireEvent.click(trigger);

    const oceanButton = screen.getByRole('radio', { name: /okyanus/i });
    fireEvent.click(oceanButton);

    expect(mockSetPalette).toHaveBeenCalledWith('ocean');
  });

  it('calls setTheme when mode buttons are clicked', () => {
    render(<ThemeSelectorDropdown />);
    const trigger = screen.getByRole('button', { name: /tema ve renk paleti seçimi/i });
    fireEvent.click(trigger);

    const lightButton = screen.getByRole('button', { name: /açık mod/i });
    fireEvent.click(lightButton);
    expect(mockSetTheme).toHaveBeenCalledWith('light');

    const darkButton = screen.getByRole('button', { name: /koyu mod/i });
    fireEvent.click(darkButton);
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('closes dropdown when Escape key is pressed', () => {
    render(<ThemeSelectorDropdown />);
    const trigger = screen.getByRole('button', { name: /tema ve renk paleti seçimi/i });
    fireEvent.click(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
