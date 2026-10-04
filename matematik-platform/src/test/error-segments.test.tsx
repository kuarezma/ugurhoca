import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RootError from '@/app/error';
import AdminError from '@/app/admin/error';
import CanliDersError from '@/app/canli-ders/error';
import TestlerError from '@/app/testler/error';
import OdevlerError from '@/app/odevler/error';
import ProfilError from '@/app/profil/error';
import IlerlemeError from '@/app/ilerleme/error';
import IceriklerError from '@/app/icerikler/error';
import OyunlarError from '@/app/oyunlar/error';
import AraclarError from '@/app/araclar/error';
import ProgramlarError from '@/app/programlar/error';
import { RouteErrorFallback } from '@/components/RouteErrorFallback';

describe('Error Boundaries and RouteErrorFallback Render Tests', () => {
  const dummyError = new Error('Test hatası') as Error & { digest?: string };
  dummyError.digest = 'ERR_TEST_123';

  it('RouteErrorFallback başlık, açıklama, hata kodu ve butonları doğru render etmelidir', () => {
    const resetFn = vi.fn();
    render(
      <RouteErrorFallback
        error={dummyError}
        reset={resetFn}
        scope="test"
        title="Özel Başlık"
        description="Özel Hata Açıklaması"
        homeHref="/test-home"
        homeLabel="Test Ana Sayfa"
      />
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Özel Başlık' })).toBeInTheDocument();
    expect(screen.getByText('Özel Hata Açıklaması')).toBeInTheDocument();
    expect(screen.getByText('Hata kodu: ERR_TEST_123')).toBeInTheDocument();

    const retryBtn = screen.getByRole('button', { name: /Tekrar dene/i });
    expect(retryBtn).toBeInTheDocument();
    fireEvent.click(retryBtn);
    expect(resetFn).toHaveBeenCalledTimes(1);

    const homeLink = screen.getByRole('link', { name: /Test Ana Sayfa/i });
    expect(homeLink).toHaveAttribute('href', '/test-home');
  });

  it('Kök error.tsx (RootError) başarıyla render edilmeli ve reset tetiklenebilmelidir', () => {
    const resetFn = vi.fn();
    render(<RootError error={dummyError} reset={resetFn} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Bir şeyler ters gitti' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ana sayfa/i })).toHaveAttribute('href', '/');

    fireEvent.click(screen.getByRole('button', { name: /Tekrar dene/i }));
    expect(resetFn).toHaveBeenCalledTimes(1);
  });

  it('/testler/error.tsx doğru metin ve yönlendirme ile render edilmelidir', () => {
    const resetFn = vi.fn();
    render(<TestlerError error={dummyError} reset={resetFn} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Testler yüklenemedi' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Testlere dön/i })).toHaveAttribute('href', '/testler');
  });

  it('/odevler/error.tsx doğru metin ve yönlendirme ile render edilmelidir', () => {
    const resetFn = vi.fn();
    render(<OdevlerError error={dummyError} reset={resetFn} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Ödevler yüklenemedi' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ödevlere dön/i })).toHaveAttribute('href', '/odevler');
  });

  it('/profil/error.tsx doğru metin ve yönlendirme ile render edilmelidir', () => {
    const resetFn = vi.fn();
    render(<ProfilError error={dummyError} reset={resetFn} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Profil yüklenemedi' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Profile dön/i })).toHaveAttribute('href', '/profil');
  });

  it('/ilerleme/error.tsx doğru metin ve yönlendirme ile render edilmelidir', () => {
    const resetFn = vi.fn();
    render(<IlerlemeError error={dummyError} reset={resetFn} />);

    expect(screen.getByRole('heading', { level: 1, name: 'İlerleme raporu yüklenemedi' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /İlerlemeye dön/i })).toHaveAttribute('href', '/ilerleme');
  });

  it('/icerikler/error.tsx doğru metin ve yönlendirme ile render edilmelidir', () => {
    const resetFn = vi.fn();
    render(<IceriklerError error={dummyError} reset={resetFn} />);

    expect(screen.getByRole('heading', { level: 1, name: 'İçerikler yüklenemedi' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /İçeriklere dön/i })).toHaveAttribute('href', '/icerikler');
  });

  it('/oyunlar/error.tsx doğru metin ve yönlendirme ile render edilmelidir', () => {
    const resetFn = vi.fn();
    render(<OyunlarError error={dummyError} reset={resetFn} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Oyunlar yüklenemedi' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Oyunlara dön/i })).toHaveAttribute('href', '/oyunlar');
  });

  it('/araclar/error.tsx doğru metin ve yönlendirme ile render edilmelidir', () => {
    const resetFn = vi.fn();
    render(<AraclarError error={dummyError} reset={resetFn} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Hesaplama araçları yüklenemedi' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Araçlara dön/i })).toHaveAttribute('href', '/araclar');
  });

  it('/programlar/error.tsx doğru metin ve yönlendirme ile render edilmelidir', () => {
    const resetFn = vi.fn();
    render(<ProgramlarError error={dummyError} reset={resetFn} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Çalışma programları yüklenemedi' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Programlara dön/i })).toHaveAttribute('href', '/programlar');
  });

  it('/admin/error.tsx ve /canli-ders/error.tsx doğru render edilmelidir', () => {
    const resetFn = vi.fn();
    const { unmount } = render(<AdminError error={dummyError} reset={resetFn} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Yönetim paneli yüklenemedi' })).toBeInTheDocument();
    unmount();

    render(<CanliDersError error={dummyError} reset={resetFn} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Canlı ders açılamadı' })).toBeInTheDocument();
  });
});
