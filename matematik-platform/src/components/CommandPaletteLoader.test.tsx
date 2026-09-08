import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/dynamic', () => ({
  default:
    () =>
    ({ initiallyOpen }: { initiallyOpen?: boolean }) => (
      <div data-testid="command-palette">
        {initiallyOpen ? 'Açık' : 'Kapalı'}
      </div>
    ),
}));

import { CommandPaletteLoader } from './CommandPaletteLoader';

describe('CommandPaletteLoader', () => {
  it('does not load the palette before user intent', () => {
    render(<CommandPaletteLoader />);

    expect(screen.queryByTestId('command-palette')).not.toBeInTheDocument();
  });

  it('loads the palette open after Cmd+K', () => {
    render(<CommandPaletteLoader />);

    fireEvent.keyDown(window, { key: 'k', metaKey: true });

    expect(screen.getByTestId('command-palette')).toHaveTextContent('Açık');
  });

  it('does not capture slash while the user is typing', () => {
    render(
      <>
        <input aria-label="Arama" />
        <CommandPaletteLoader />
      </>,
    );

    fireEvent.keyDown(screen.getByLabelText('Arama'), { key: '/' });

    expect(screen.queryByTestId('command-palette')).not.toBeInTheDocument();
  });
});
