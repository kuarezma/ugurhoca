'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  Printer,
  Search,
  BookMarked,
  Sparkles,
  GraduationCap,
  Calculator,
} from 'lucide-react';
import MathText from '@/components/MathText';

interface FormulaItem {
  id: string;
  title: string;
  category: string;
  formula: string;
  note: string;
}

const LGS_FORMULAS: FormulaItem[] = [
  {
    id: 'lgs-1',
    category: 'Çarpanlar & Katlar',
    title: 'EBOB - EKOK Çarpım Kuralı',
    formula: 'a \\cdot b = \\text{EBOB}(a, b) \\cdot \\text{EKOK}(a, b)',
    note: 'Aralarında asal iki sayının EBOB’u 1, EKOK’u sayıların çarpımıdır.',
  },
  {
    id: 'lgs-2',
    category: 'Üslü İfadeler',
    title: 'Üslü Sayılarda Çarpma & Bölme',
    formula: 'a^m \\cdot a^n = a^{m+n}, \\quad \\frac{a^m}{a^n} = a^{m-n}, \\quad (a^m)^n = a^{m \\cdot n}',
    note: 'Tabanlar aynıysa üsler toplanır/çıkarılır; üssün üssü çarpılır.',
  },
  {
    id: 'lgs-3',
    category: 'Köklü İfadeler',
    title: 'Karekök İçi ve Dışı Çarpma',
    formula: '\\sqrt{a^2 \\cdot b} = a\\sqrt{b}, \\quad \\sqrt{a} \\cdot \\sqrt{b} = \\sqrt{a \\cdot b}',
    note: 'Toplama ve çıkarma için kök içlerinin birebir aynı olması şarttır.',
  },
  {
    id: 'lgs-4',
    category: 'Cebirsel İfadeler',
    title: 'İki Kare Farkı Özdeşliği',
    formula: 'a^2 - b^2 = (a - b)(a + b)',
    note: 'Sınavların en çok sorulan ve çarpanlara ayırmada en kritik özdeşliğidir.',
  },
  {
    id: 'lgs-5',
    category: 'Cebirsel İfadeler',
    title: 'Tam Kare Özdeşlikleri',
    formula: '(a + b)^2 = a^2 + 2ab + b^2, \\quad (a - b)^2 = a^2 - 2ab + b^2',
    note: 'Birincinin karesi ± iki katı + ikincinin karesi tekerlemesi.',
  },
  {
    id: 'lgs-6',
    category: 'Doğrusal Denklemler',
    title: 'Doğrunun Eğimi (m)',
    formula: 'm = \\frac{\\Delta y}{\\Delta x} = \\frac{y_2 - y_1}{x_2 - x_1}',
    note: 'y = mx + n denkleminde m eğimdir. Sağa yatık doğruların eğimi pozitif, sola negatif.',
  },
  {
    id: 'lgs-7',
    category: 'Üçgenler & Geometri',
    title: 'Pisagor Bağıntısı ve Özel Üçgenler',
    formula: 'a^2 + b^2 = c^2 \\quad (3-4-5, \\ 5-12-13, \\ 8-15-17, \\ 7-24-25)',
    note: '45-45-90 üçgeninde hipotenüs a√2, 30-60-90 üçgeninde hipotenüs 2a olur.',
  },
  {
    id: 'lgs-8',
    category: 'Daire & Geometri',
    title: 'Dairenin Çevresi ve Alanı',
    formula: 'C = 2\\pi r, \\quad A = \\pi r^2, \\quad A_{\\text{dilim}} = \\frac{\\alpha}{360^\\circ} \\pi r^2',
    note: 'Dilim yay uzunluğu: L = (α / 360) · 2πr formülüyle hesaplanır.',
  },
  {
    id: 'lgs-9',
    category: 'Geometrik Cisimler',
    title: 'Dik Dairesel Silindir Hacmi ve Alanı',
    formula: 'V = \\pi r^2 h, \\quad Y_{\\text{alan}} = 2\\pi r h, \\quad T_{\\text{alan}} = 2\\pi r h + 2\\pi r^2',
    note: 'Koni hacmi ise silindir hacminin üçte biridir: V = (1/3)πr²h.',
  },
  {
    id: 'lgs-10',
    category: 'Basit Olayların Olasılığı',
    title: 'Klasik Olasılık Formülü',
    formula: 'P(A) = \\frac{\\text{İstenen Olası Durum Sayısı}}{\\text{Tüm Olası Durum Sayısı}}, \\quad 0 \\le P(A) \\le 1',
    note: 'İmkansız olay 0, kesin olay 1 olasılık değerine sahiptir.',
  },
];

const YKS_FORMULAS: FormulaItem[] = [
  {
    id: 'yks-1',
    category: 'İkinci Dereceden Denklemler',
    title: 'Diskriminant ve Kök Formülleri',
    formula: '\\Delta = b^2 - 4ac, \\quad x_{1,2} = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}',
    note: 'Δ > 0 ise 2 farklı reel kök, Δ = 0 ise çakışık kök, Δ < 0 ise reel kök yoktur.',
  },
  {
    id: 'yks-2',
    category: 'İkinci Dereceden Denklemler',
    title: 'Kökler Toplamı ve Çarpımı',
    formula: 'x_1 + x_2 = -\\frac{b}{a}, \\quad x_1 \\cdot x_2 = \\frac{c}{a}, \\quad |x_1 - x_2| = \\frac{\\sqrt{\\Delta}}{|a|}',
    note: 'Denklemi kurma formülü: x² - (x₁ + x₂)x + (x₁ · x₂) = 0.',
  },
  {
    id: 'yks-3',
    category: 'Parabol',
    title: 'Parabol Tepe Noktası T(r, k)',
    formula: 'r = -\\frac{b}{2a}, \\quad k = f(r) = \\frac{4ac - b^2}{4a}',
    note: 'Simetri ekseni x = r doğrusudur. En büyük veya en küçük değer k noktasıdır.',
  },
  {
    id: 'yks-4',
    category: 'Trigonometri',
    title: 'Temel Özdeşlikler',
    formula: '\\sin^2 x + \\cos^2 x = 1, \\quad 1 + \\tan^2 x = \\sec^2 x, \\quad \\tan x \\cdot \\cot x = 1',
    note: 'sin(-x) = -sin(x) (tek fonksiyon), cos(-x) = cos(x) (çift fonksiyon).',
  },
  {
    id: 'yks-5',
    category: 'Trigonometri',
    title: 'Yarım Açı Formülleri',
    formula: '\\sin 2x = 2\\sin x \\cos x, \\quad \\cos 2x = \\cos^2 x - \\sin^2 x = 2\\cos^2 x - 1 = 1 - 2\\sin^2 x',
    note: 'tan 2x = 2 tan x / (1 - tan² x) şeklindedir.',
  },
  {
    id: 'yks-6',
    category: 'Logaritma',
    title: 'Logaritma Özellikleri & Taban Değişimi',
    formula: '\\log_a (x \\cdot y) = \\log_a x + \\log_a y, \\quad \\log_a (x^n) = n\\log_a x, \\quad \\log_a b = \\frac{\\ln b}{\\ln a}',
    note: 'a^{\\log_a b} = b ve a^{\\log_b c} = c^{\\log_b a}.',
  },
  {
    id: 'yks-7',
    category: 'Diziler',
    title: 'Aritmetik & Geometrik Dizi Genel Terimi',
    formula: 'a_n = a_1 + (n-1)d, \\quad S_n = \\frac{n}{2}(a_1 + a_n); \\quad g_n = g_1 \\cdot r^{n-1}',
    note: 'Geometrik dizi toplamı: S_n = g_1 (1 - r^n) / (1 - r).',
  },
  {
    id: 'yks-8',
    category: 'Türev',
    title: 'Türev Çarpım, Bölüm ve Zincir Kuralı',
    formula: '(f \\cdot g)\' = f\'g + fg\', \\quad \\left(\\frac{f}{g}\\right)\' = \\frac{f\'g - fg\'}{g^2}, \\quad [f(g(x))]\' = f\'(g(x)) \\cdot g\'(x)',
    note: 'Polinom türevi: (x^n)\' = n · x^(n-1).',
  },
  {
    id: 'yks-9',
    category: 'İntegral',
    title: 'Temel Belirsiz İntegral Kuralları',
    formula: '\\int x^n dx = \\frac{x^{n+1}}{n+1} + C \\ (n \\ne -1), \\quad \\int \\frac{1}{x} dx = \\ln|x| + C',
    note: 'Belirli integral alan hesabı: Alan = ∫ [f(x) - g(x)] dx.',
  },
  {
    id: 'yks-10',
    category: 'Analitik Geometri',
    title: 'Noktanın Doğruya Uzaklığı & İki Nokta Arası',
    formula: 'd = \\frac{|a x_0 + b y_0 + c|}{\\sqrt{a^2 + b^2}}, \\quad |AB| = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}',
    note: 'Paralel iki doğru arası uzaklık: d = |c₁ - c₂| / √(a² + b²).',
  },
];

interface QuickFormulaCheatSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLight?: boolean;
}

export function QuickFormulaCheatSheetModal({
  isOpen,
  onClose,
  isLight = false,
}: QuickFormulaCheatSheetModalProps) {
  const [activeTab, setActiveTab] = useState<'lgs' | 'yks'>('lgs');
  const [searchQuery, setSearchQuery] = useState('');

  const currentFormulas = activeTab === 'lgs' ? LGS_FORMULAS : YKS_FORMULAS;

  const filteredFormulas = useMemo(() => {
    if (!searchQuery.trim()) return currentFormulas;
    const q = searchQuery.toLowerCase().trim();
    return currentFormulas.filter(
      (f) =>
        f.title.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q) ||
        f.note.toLowerCase().includes(q) ||
        f.formula.toLowerCase().includes(q),
    );
  }, [currentFormulas, searchQuery]);

  if (!isOpen) return null;

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Hızlı Formül Cep Notu"
      className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-950/80 p-2 sm:p-4 backdrop-blur-md animate-fade-in"
    >
      <div
        className={`w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          isLight
            ? 'bg-slate-50 border-slate-200 text-slate-900'
            : 'bg-slate-900 border-white/15 text-white'
        }`}
      >
        {/* Üst Başlık Barı */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400">
              <BookMarked className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-base sm:text-lg">
                  Hızlı Formül Cep Notu
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Cheat-Sheet 📌
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Sınav öncesi 1 dakikalık son tekrar & yazdırılabilir kritik özet.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              aria-label="Formül notunu yazdır"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold transition shadow-sm"
              title="Yazıcıdan Çıkart veya PDF Kaydet"
            >
              <Printer className="h-4 w-4 text-emerald-400" />
              <span className="hidden sm:inline">Yazdır / PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Pencereyi kapat"
              className="rounded-xl p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Sekmeler & Arama */}
        <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {/* LGS / YKS Sekmeleri */}
          <div className="flex items-center p-1 rounded-2xl bg-black/20 border border-white/10 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab('lgs')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'lgs'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              LGS (8. Sınıf)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('yks')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'yks'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GraduationCap className="h-3.5 w-3.5" />
              YKS (TYT & AYT)
            </button>
          </div>

          {/* Arama Inputu */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Formül veya konu ara..."
              className={`w-full pl-9 pr-3 py-1.5 rounded-xl text-xs border transition focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                  : 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
              }`}
            />
          </div>
        </div>

        {/* Formül Kartları Listesi */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 print:overflow-visible print:p-0">
          {filteredFormulas.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Aramanızla eşleşen formül bulunamadı.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3.5">
              {filteredFormulas.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border flex flex-col justify-between transition hover:border-amber-500/40 ${
                    isLight
                      ? 'bg-white border-slate-200 shadow-sm'
                      : 'bg-white/5 border-white/10 shadow-sm'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {item.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {item.id.toUpperCase()}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs sm:text-sm text-white mb-2.5">
                      {item.title}
                    </h4>

                    {/* KaTeX Formülü */}
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 text-amber-200 overflow-x-auto text-xs sm:text-sm font-mono mb-2 text-center">
                      <MathText>{`$${item.formula}$`}</MathText>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed italic border-t border-white/5 pt-2 mt-1">
                    💡 {item.note}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alt Bilgi Barı */}
        <div className="p-3.5 border-t border-white/10 bg-black/20 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <Calculator className="h-3.5 w-3.5 text-amber-400" />
            <span>Toplam {filteredFormulas.length} kritik sınav formülü gösteriliyor.</span>
          </div>
          <span className="font-mono text-[10px] text-slate-500 hidden sm:inline">
            Uğur Hoca Matematik Platformu
          </span>
        </div>
      </div>
    </div>
  );
}

export default QuickFormulaCheatSheetModal;
