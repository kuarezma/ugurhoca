import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MathAhaMomentsModal } from './MathAhaMomentsModal';

describe('MathAhaMomentsModal', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('açık olduğunda başlığı ve varsayılan keşifleri gösterir', () => {
    render(<MathAhaMomentsModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText(/Aha!.*Anları & Matematik Keşif Günlüğü/i)).toBeInTheDocument();
    expect(screen.getByText(/Tüm Keşifler/i)).toBeInTheDocument();
  });

  it('yeni keşif ekle formunu açıp kapatır', () => {
    render(<MathAhaMomentsModal isOpen={true} onClose={vi.fn()} />);

    const addBtn = screen.getByRole('button', { name: /Yeni Keşif Ekle/i });
    fireEvent.click(addBtn);

    expect(screen.getByText(/Bugün Matematikte Neyi Fark Ettin\?/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Keşfi Kaydet/i })).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: /Formu Kapat/i });
    fireEvent.click(cancelBtn);

    expect(screen.queryByText(/Bugün Matematikte Neyi Fark Ettin\?/i)).not.toBeInTheDocument();
  });

  it('kapalıyken hiçbir şey render etmez', () => {
    const { container } = render(<MathAhaMomentsModal isOpen={false} onClose={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });
});
