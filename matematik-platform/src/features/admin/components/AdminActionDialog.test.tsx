import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import {
  AdminActionDialogHost,
  confirmAdminAction,
  promptAdminAction,
} from './AdminActionDialog';

describe('AdminActionDialog', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('Fallback davranışı (Host mount edilmemişken)', () => {
    it('Host yoksa window.confirm çağırır', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      const result = await confirmAdminAction(
        'Bu öğrenciyi silmek istediğinize emin misiniz?',
      );
      expect(confirmSpy).toHaveBeenCalledWith(
        'Bu öğrenciyi silmek istediğinize emin misiniz?',
      );
      expect(result).toBe(true);
    });

    it('Host yoksa window.prompt çağırır', async () => {
      const promptSpy = vi.spyOn(window, 'prompt').mockReturnValue('Yeni Ad');
      const result = await promptAdminAction(
        'Öğrenci adını giriniz:',
        'Mevcut Ad',
      );
      expect(promptSpy).toHaveBeenCalledWith(
        'Öğrenci adını giriniz:',
        'Mevcut Ad',
      );
      expect(result).toBe('Yeni Ad');
    });
  });

  describe('Host mount edildiğindeki modal davranışı', () => {
    it('confirmAdminAction modalı açar ve Onayla tıklandığında true döner', async () => {
      render(<AdminActionDialogHost />);

      let promise: Promise<boolean>;
      act(() => {
        promise = confirmAdminAction('Kayıt silinsin mi?', {
          title: 'Öğrenci Sil',
          confirmLabel: 'Evet, Sil',
          tone: 'danger',
        });
      });

      expect(await screen.findByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
      expect(screen.getByText('Öğrenci Sil')).toBeInTheDocument();
      expect(screen.getByText('Kayıt silinsin mi?')).toBeInTheDocument();

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Evet, Sil' }));
      });

      const result = await promise!;
      expect(result).toBe(true);
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('confirmAdminAction İptal tıklandığında false döner', async () => {
      render(<AdminActionDialogHost />);

      let promise: Promise<boolean>;
      act(() => {
        promise = confirmAdminAction('Devam edilsin mi?');
      });
      expect(await screen.findByRole('dialog')).toBeInTheDocument();

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'İptal' }));
      });

      const result = await promise!;
      expect(result).toBe(false);
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('promptAdminAction modalı açar, metin girilip onaylandığında girilen değeri döner', async () => {
      render(<AdminActionDialogHost />);

      let promise: Promise<string | null>;
      act(() => {
        promise = promptAdminAction('Yeni başlık:', 'Eski Başlık', {
          title: 'Başlık Düzenle',
          placeholder: 'Başlık yazın',
        });
      });

      expect(await screen.findByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Başlık Düzenle')).toBeInTheDocument();

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('Eski Başlık');

      await act(async () => {
        fireEvent.change(input, { target: { value: 'Güncel Başlık' } });
        fireEvent.click(screen.getByRole('button', { name: 'Tamam' }));
      });

      const result = await promise!;
      expect(result).toBe('Güncel Başlık');
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('promptAdminAction kapatma butonu tıklandığında null döner', async () => {
      render(<AdminActionDialogHost />);

      let promise: Promise<string | null>;
      act(() => {
        promise = promptAdminAction('Girdi:');
      });
      expect(await screen.findByRole('dialog')).toBeInTheDocument();

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Kapat' }));
      });

      const result = await promise!;
      expect(result).toBeNull();
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });
});
