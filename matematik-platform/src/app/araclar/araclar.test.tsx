import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ToolsHubPage from './page';
import LgsCalculatorPage from './lgs-puan-hesaplama/page';
import EbobEkokCalculatorPage from './ebob-ekok-hesaplayici/page';
import PisagorCalculatorPage from './pisagor-hesaplayici/page';
import YksCalculatorPage from './yks-puan-hesaplama/page';

describe('Public /araclar pages', () => {
  it('renders ToolsHubPage with all tool cards', () => {
    render(<ToolsHubPage />);
    expect(screen.getByText('İnteraktif Matematik & Sınav Araçları')).toBeInTheDocument();
    expect(screen.getByText(/2026\/2027 MEB LGS Puan & Yüzdelik Dilim Robotu/i)).toBeInTheDocument();
    expect(screen.getByText(/Adım Adım EBOB - EKOK & Asal Çarpan Hesaplayıcı/i)).toBeInTheDocument();
    expect(screen.getByText(/Dik Üçgen Pisagor Bağıntısı & Hipotenüs Hesaplayıcı/i)).toBeInTheDocument();
  });

  it('renders LgsCalculatorPage and updates scores upon input', () => {
    render(<LgsCalculatorPage />);
    expect(screen.getByText(/2026\/2027 MEB LGS Puan & Yüzdelik Dilim Robotu/i)).toBeInTheDocument();

    const turkceCorrect = screen.getByLabelText(/Turkce doğru/i);
    fireEvent.change(turkceCorrect, { target: { value: '18' } });

    expect(screen.getByText(/Tahmini LGS Puanı/i)).toBeInTheDocument();
  });

  it('renders EbobEkokCalculatorPage and computes EBOB and EKOK for default 36 and 48', () => {
    render(<EbobEkokCalculatorPage />);
    expect(screen.getByText(/Adım Adım EBOB - EKOK Hesaplayıcı/i)).toBeInTheDocument();
    // For 36 and 48: EBOB is 12, EKOK is 144
    expect(screen.getAllByText('12').length).toBeGreaterThan(0);
    expect(screen.getAllByText('144').length).toBeGreaterThan(0);
  });

  it('renders PisagorCalculatorPage and computes hypotenuse for 3 and 4', () => {
    render(<PisagorCalculatorPage />);
    expect(screen.getByText(/Pisagor Bağıntısı & Hipotenüs Hesaplayıcı/i)).toBeInTheDocument();
    expect(screen.getByText(/3 - 4 - 5 Özel Üçgeni/i)).toBeInTheDocument();
    expect(screen.getAllByText(/≈ 5.00/i).length).toBeGreaterThan(0);
  });

  it('renders YksCalculatorPage with TYT and AYT tabs', () => {
    render(<YksCalculatorPage />);
    expect(screen.getByText(/2026\/2027 ÖSYM YKS \(TYT-AYT\) Puan & Sıralama Hesaplayıcı/i)).toBeInTheDocument();
    expect(screen.getByText(/TYT Testleri \(120 Soru\)/i)).toBeInTheDocument();
    expect(screen.getByText(/AYT Testleri \(160 Soru\)/i)).toBeInTheDocument();
  });
});
