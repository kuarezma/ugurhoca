import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteAccountModal } from './DeleteAccountModal';

describe('DeleteAccountModal', () => {
  const onCloseMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('açık olmadığında hiçbir şey render etmez', () => {
    const { container } = render(
      <DeleteAccountModal isOpen={false} onClose={onCloseMock} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('doğru onay metni yazılana kadar sil butonunu devre dışı tutar', () => {
    render(<DeleteAccountModal isOpen={true} onClose={onCloseMock} userEmail="test@ogrenci.com" />);

    expect(screen.getByText('Hesabımı Kalıcı Olarak Sil')).toBeInTheDocument();
    const deleteBtn = screen.getByRole('button', { name: /Hesabı Kalıcı Sil/i });
    expect(deleteBtn).toBeDisabled();

    const input = screen.getByPlaceholderText('HESABIMI SİL');
    fireEvent.change(input, { target: { value: 'yanlış metin' } });
    expect(deleteBtn).toBeDisabled();

    fireEvent.change(input, { target: { value: 'HESABIMI SİL' } });
    expect(deleteBtn).not.toBeDisabled();
  });
});
