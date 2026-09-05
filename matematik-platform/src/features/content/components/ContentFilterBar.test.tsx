import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ContentFilterBar from './ContentFilterBar';

describe('ContentFilterBar', () => {
  it('renders search input, sort options, quick filters, and view mode buttons', () => {
    const onSearchChange = vi.fn();
    const onClearSearch = vi.fn();
    const onSortChange = vi.fn();
    const onQuickFilterChange = vi.fn();
    const onViewModeChange = vi.fn();

    render(
      <ContentFilterBar
        isWorksheetBrowser={false}
        onClearSearch={onClearSearch}
        onQuickFilterChange={onQuickFilterChange}
        onSearchChange={onSearchChange}
        onSortChange={onSortChange}
        onViewModeChange={onViewModeChange}
        quickFilter="all"
        searchTerm="üslü"
        sortBy="newest"
        totalResults={42}
        viewMode="grid"
      />,
    );

    // Search input
    const searchInput = screen.getByPlaceholderText('İçerik ara...');
    expect(searchInput).toHaveValue('üslü');

    // Clear search button
    const clearBtn = screen.getByTitle('Aramayı Temizle');
    fireEvent.click(clearBtn);
    expect(onClearSearch).toHaveBeenCalledTimes(1);

    // Quick filter chips
    const favBtn = screen.getByText('Favorilerim');
    fireEvent.click(favBtn);
    expect(onQuickFilterChange).toHaveBeenCalledWith('favorites');

    const solvedBtn = screen.getByText('Çözülenler');
    fireEvent.click(solvedBtn);
    expect(onQuickFilterChange).toHaveBeenCalledWith('completed');

    // View modes
    const listBtn = screen.getByTitle('Liste Görünümü');
    fireEvent.click(listBtn);
    expect(onViewModeChange).toHaveBeenCalledWith('list');

    const packsBtn = screen.getByTitle('Konu Paketleri');
    fireEvent.click(packsBtn);
    expect(onViewModeChange).toHaveBeenCalledWith('packs');

    // Total results label
    expect(screen.getByText('42 içerik bulundu')).toBeInTheDocument();
  });
});
