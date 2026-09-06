import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MathInputToolbar from './MathInputToolbar';

describe('MathInputToolbar Component', () => {
  it('renders quick math symbols', () => {
    const onInsert = vi.fn();
    render(<MathInputToolbar onInsertSymbol={onInsert} />);

    expect(screen.getByText('²')).toBeInTheDocument();
    expect(screen.getByText('√')).toBeInTheDocument();
    expect(screen.getByText('π')).toBeInTheDocument();
  });

  it('calls onInsertSymbol when quick symbol button is clicked', () => {
    const onInsert = vi.fn();
    render(<MathInputToolbar onInsertSymbol={onInsert} />);

    const piBtn = screen.getByText('π');
    fireEvent.click(piBtn);

    expect(onInsert).toHaveBeenCalledWith('π');
  });

  it('expands symbol palette when Tümü button is clicked', () => {
    const onInsert = vi.fn();
    render(<MathInputToolbar onInsertSymbol={onInsert} />);

    const expandBtn = screen.getByRole('button', { name: /Tümü/i });
    fireEvent.click(expandBtn);

    expect(screen.getByText('Temel & Eşitsizlik')).toBeInTheDocument();
    expect(screen.getByText('Üs & Köklü Sayılar')).toBeInTheDocument();
    expect(screen.getByText('Geometri & Açı')).toBeInTheDocument();

    // Click on Geometri group tab
    const geomTab = screen.getByRole('button', { name: /Geometri & Açı/i });
    fireEvent.click(geomTab);

    // Click on degree symbol from palette
    const degBtns = screen.getAllByText('°');
    fireEvent.click(degBtns[degBtns.length - 1]);

    expect(onInsert).toHaveBeenCalledWith('°');
  });
});
