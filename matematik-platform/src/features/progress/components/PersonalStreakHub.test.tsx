import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PersonalStreakHub } from './PersonalStreakHub';

describe('PersonalStreakHub', () => {
  it('renders streak hub with metrics, habit heatmap and privacy notice', () => {
    render(<PersonalStreakHub isLight={false} />);

    expect(screen.getByText('Bireysel Çalışma Disiplini & Seri')).toBeInTheDocument();
    expect(screen.getByText(/Sadece Sana Özel \(Sıralama Yok\)/i)).toBeInTheDocument();
    expect(screen.getByText('Günlük Seri')).toBeInTheDocument();
    expect(screen.getByText('Bugünkü Soru Hedefin')).toBeInTheDocument();
    expect(screen.getByText('Hedef Sınav Sayacı')).toBeInTheDocument();
    expect(screen.getByText(/Alışkanlık Isı Haritası/i)).toBeInTheDocument();

    // Timeframe switcher buttons
    expect(screen.getByText('14 Gün')).toBeInTheDocument();
    expect(screen.getByText('30 Gün')).toBeInTheDocument();
    expect(screen.getByText('60 Gün')).toBeInTheDocument();
    expect(screen.getByText('90 Gün')).toBeInTheDocument();

    fireEvent.click(screen.getByText('60 Gün'));
    expect(screen.getByText(/Son 60 günlük/i)).toBeInTheDocument();

    // Toggle target settings
    const settingsBtn = screen.getByTitle('Günlük soru hedefini değiştir');
    fireEvent.click(settingsBtn);
    expect(screen.getByText('Yeni Günlük Soru Hedefi:')).toBeInTheDocument();

    // Select target
    const target30Btn = screen.getByText('30 Soru');
    fireEvent.click(target30Btn);

    const saveBtn = screen.getByText('Kaydet');
    fireEvent.click(saveBtn);
  });
});
