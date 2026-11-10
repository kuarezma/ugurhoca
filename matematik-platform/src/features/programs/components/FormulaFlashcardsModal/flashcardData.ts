import type { Flashcard } from './types';

export const FLASHCARDS_DATA: Flashcard[] = [
  // LGS
  {
    id: 'lgs-1',
    category: 'lgs',
    subject: 'Çarpanlara Ayırma',
    title: 'Tam Kare Özdeşlikleri',
    frontText: '(a + b)² ve (a - b)² açılımları nasıldır?',
    formula: '$$(a + b)^2 = a^2 + 2ab + b^2$$\n$$(a - b)^2 = a^2 - 2ab + b^2$$',
    tip: 'Birincinin karesi, birinciyle ikincinin çarpımının iki katı, ikincinin karesi!',
    example: '$(x + 3)^2 = x^2 + 6x + 9$',
  },
  {
    id: 'lgs-2',
    category: 'lgs',
    subject: 'Çarpanlara Ayırma',
    title: 'İki Kare Farkı Özdeşliği',
    frontText: 'a² - b² ifadesi nasıl çarpanlarına ayrılır?',
    formula: '$$a^2 - b^2 = (a - b)(a + b)$$',
    tip: 'İki terimin farkı ile toplamının çarpımıdır.',
    example: '$x^2 - 16 = (x - 4)(x + 4)$',
  },
  {
    id: 'lgs-3',
    category: 'lgs',
    subject: 'Geometri / Üçgenler',
    title: 'Pisagor Bağıntısı',
    frontText: 'Dik üçgende hipotenüs ve dik kenarlar arasındaki ilişki nedir?',
    formula: '$$a^2 + b^2 = c^2$$',
    tip: 'c hipotenüstür (90° nin karşısı). Popüler özel üçgenler: 3-4-5, 5-12-13, 8-15-17, 7-24-25.',
  },
  {
    id: 'lgs-4',
    category: 'lgs',
    subject: 'Üslü İfadeler',
    title: 'Üslerin Kuvveti ve Çarpımı',
    frontText: 'Tabanları aynı üslü sayılar çarpılırken üsler ne yapılır?',
    formula:
      '$$a^x \\cdot a^y = a^{x+y}, \\quad \\frac{a^x}{a^y} = a^{x-y}, \\quad (a^x)^y = a^{x \\cdot y}$$',
    tip: 'Çarpmada üsler toplanır, bölmede çıkarılır, üssün üssünde çarpılır.',
  },
  {
    id: 'lgs-5',
    category: 'lgs',
    subject: 'Kareköklü İfadeler',
    title: 'Karekökte Çarpma ve Bölme',
    frontText: 'Kareköklü sayılarda çarpma ve bölme kuralları nasıldır?',
    formula:
      '$$\\sqrt{a} \\cdot \\sqrt{b} = \\sqrt{a \\cdot b}, \\quad \\frac{\\sqrt{a}}{\\sqrt{b}} = \\sqrt{\\frac{a}{b}}$$',
    tip: 'Toplama ve çıkarma yaparken kök içlerinin birebir aynı olması gerekir ($a\\sqrt{x} + b\\sqrt{x} = (a+b)\\sqrt{x}$).',
  },
  {
    id: 'lgs-6',
    category: 'lgs',
    subject: 'Çarpanlar ve Katlar',
    title: 'EBOB - EKOK Çarpım Kuralı',
    frontText:
      'İki pozitif tam sayının çarpımı ile EBOB ve EKOK çarpımı arasındaki bağıntı nedir?',
    formula: '$$\\text{EBOB}(a, b) \\cdot \\text{EKOK}(a, b) = a \\cdot b$$',
    tip: 'Yalnızca iki sayı için geçerlidir. Aralarında asal sayılarda EBOB = 1 ve EKOK = a · b olur.',
  },
  {
    id: 'lgs-7',
    category: 'lgs',
    subject: 'Doğrusal Denklemler',
    title: 'İki Noktadan Geçen Doğrunun Eğimi',
    frontText:
      'A(x₁, y₁) ve B(x₂, y₂) noktalarından geçen doğrunun eğimi nasıl bulunur?',
    formula:
      '$$m = \\frac{y_2 - y_1}{x_2 - x_1} = \\frac{\\Delta y}{\\Delta x}$$',
    tip: 'Eğim dikey değişimin yatay değişime oranıdır. Sağa yatık doğruların eğimi pozitif, sola yatıkların negatiftir.',
  },
  {
    id: 'lgs-8',
    category: 'lgs',
    subject: 'Daire ve Geometri',
    title: 'Daire Diliminin Alanı',
    frontText:
      'Merkez açısı α olan r yarıçaplı daire diliminin alanı nasıl hesaplanır?',
    formula: '$$\\text{Alan} = \\frac{\\alpha}{360^\\circ} \\cdot \\pi r^2$$',
    tip: 'Tüm daire alanını açının 360° ye oranıyla çarparız.',
  },
  {
    id: 'lgs-9',
    category: 'lgs',
    subject: 'Geometri / Benzerlik',
    title: 'Benzerlik ve Alan Oranı',
    frontText:
      'Benzer iki şeklin çevreleri ve alanları oranı benzerlik oranı (k) ile nasıl ilişkilidir?',
    formula: '$$\\text{Çevre Oranı} = k, \\quad \\text{Alan Oranı} = k^2$$',
    tip: 'Benzerlik oranı k ise alanların oranı k² dir. Hacimlerin oranı ise k³ olur.',
  },
  {
    id: 'lgs-10',
    category: 'lgs',
    subject: 'Olasılık',
    title: 'Basit Olayların Olasılığı',
    frontText: 'Bir olayın olma olasılığı nasıl formüle edilir?',
    formula:
      '$$P(A) = \\frac{\\text{İstenen Olası Durum Sayısı}}{\\text{Tüm Olası Durumların Sayısı}}$$',
    tip: 'İmkânsız olayın olasılığı 0, kesin olayın olasılığı 1 dir. Daima 0 ≤ P(A) ≤ 1.',
  },
  // YKS
  {
    id: 'yks-1',
    category: 'yks',
    subject: 'Trigonometri',
    title: 'Temel Trigonometrik Özdeşlik',
    frontText: 'sin²x ve cos²x toplamı neye eşittir?',
    formula:
      '$$\\sin^2(x) + \\cos^2(x) = 1, \\quad \\tan(x) = \\frac{\\sin(x)}{\\cos(x)}, \\quad 1 + \\tan^2(x) = \\sec^2(x)$$',
    tip: 'Birim çember üzerindeki her nokta $(x, y) = (\\cos\\theta, \\sin\\theta)$ dir.',
  },
  {
    id: 'yks-2',
    category: 'yks',
    subject: 'Trigonometri',
    title: 'Yarım Açı Formülleri',
    frontText: 'sin(2x) ve cos(2x) açılımları nelerdir?',
    formula:
      '$$\\sin(2x) = 2\\sin(x)\\cos(x)$$\n$$\\cos(2x) = \\cos^2(x) - \\sin^2(x) = 2\\cos^2(x) - 1 = 1 - 2\\sin^2(x)$$',
    tip: 'İntegral ve türev sorularında dereceden kurtulmak için cos(2x) formülleri hayat kurtarır!',
  },
  {
    id: 'yks-3',
    category: 'yks',
    subject: 'Logaritma',
    title: 'Logaritma Temel Özellikleri',
    frontText:
      'Logaritmada çarpım, bölüm ve üs taban değiştirme kuralları nasıldır?',
    formula:
      '$$\\log_a(x \\cdot y) = \\log_a(x) + \\log_a(y)$$\n$$\\log_a\\left(\\frac{x}{y}\\right) = \\log_a(x) - \\log_a(y)$$\n$$\\log_{a^n}(x^m) = \\frac{m}{n}\\log_a(x), \\quad \\log_a(b) = \\frac{\\ln(b)}{\\ln(a)}$$',
    tip: 'Tanım aralığı: $a > 0, a \\neq 1$ ve $x > 0$ olmalıdır.',
  },
  {
    id: 'yks-4',
    category: 'yks',
    subject: 'Türev',
    title: 'Çarpım ve Bölümün Türevi',
    frontText: "(f · g)' ve (f / g)' türevleri nasıl alınır?",
    formula:
      "$$(f \\cdot g)' = f' \\cdot g + f \\cdot g'$$\n$$\\left(\\frac{f}{g}\\right)' = \\frac{f' \\cdot g - f \\cdot g'}{g^2}$$",
    tip: 'Bölümün türevinde paydada $g^2$ olduğunu ve aradaki işaretin eksi olduğunu unutma.',
  },
  {
    id: 'yks-5',
    category: 'yks',
    subject: 'İntegral',
    title: 'Belirli İntegral & Alan Hesabı',
    frontText: 'Eğri altında kalan alan integralle nasıl hesaplanır?',
    formula:
      '$$\\text{Alan} = \\int_{a}^{b} [f(x) - g(x)] \\, dx$$\n$$\\int x^n \\, dx = \\frac{x^{n+1}}{n+1} + C \\quad (n \\neq -1)$$',
    tip: 'Üstteki fonksiyondan alttaki fonksiyon çıkarılarak integral alınır.',
  },
  {
    id: 'yks-6',
    category: 'yks',
    subject: 'İkinci Dereceden Denklemler',
    title: 'Diskriminant (Δ) ve Kökler Formülü',
    frontText:
      'ax² + bx + c = 0 denkleminin kökleri diskriminant ile nasıl bulunur?',
    formula:
      '$$\\Delta = b^2 - 4ac, \\quad x_{1,2} = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}$$',
    tip: 'Δ > 0 ise iki farklı gerçek kök, Δ = 0 ise çakışık çift kök, Δ < 0 ise gerçek kök yoktur.',
  },
  {
    id: 'yks-7',
    category: 'yks',
    subject: 'İkinci Dereceden Denklemler',
    title: 'Kökler Toplamı ve Çarpımı',
    frontText:
      'ax² + bx + c = 0 denkleminde kökler toplamı ve çarpımı katsayılarla nasıl ifade edilir?',
    formula:
      '$$x_1 + x_2 = -\\frac{b}{a}, \\quad x_1 \\cdot x_2 = \\frac{c}{a}$$',
    tip: 'Kökleri tek tek bulmadan toplam veya çarpım sorularını anında çözmeni sağlar.',
  },
  {
    id: 'yks-8',
    category: 'yks',
    subject: 'Kombinatorik',
    title: 'Kombinasyon ve Permütasyon Formülleri',
    frontText:
      'n elemanın r li sıralanışı (P) ve seçimi (C) formülleri nelerdir?',
    formula:
      '$$P(n, r) = \\frac{n!}{(n-r)!}, \\quad C(n, r) = \\binom{n}{r} = \\frac{n!}{r!(n-r)!}$$',
    tip: 'Permütasyonda sıra önemlidir (sıralama), kombinasyonda sıra önemsizdir (grup seçimi).',
  },
  {
    id: 'yks-9',
    category: 'yks',
    subject: 'Diziler',
    title: 'Aritmetik Dizi Genel Terimi ve Toplamı',
    frontText:
      'Ortak farkı d olan aritmetik dizinin n. terimi ve ilk n terim toplamı nasıldır?',
    formula: '$$a_n = a_1 + (n-1)d, \\quad S_n = \\frac{n}{2}(a_1 + a_n)$$',
    tip: 'Her ardışık terim arasındaki fark sabittir. İlk ve son terim ortalamasının terim sayısıyla çarpımıdır.',
  },
  {
    id: 'yks-10',
    category: 'yks',
    subject: 'Diziler',
    title: 'Geometrik Dizi Genel Terimi',
    frontText:
      'Ortak çarpanı r olan geometrik dizinin n. terimi ve ilk n terim toplamı nasıldır?',
    formula:
      '$$a_n = a_1 \\cdot r^{n-1}, \\quad S_n = a_1 \\frac{1 - r^n}{1 - r} \\quad (r \\neq 1)$$',
    tip: 'Her terim bir önceki terimin sabit r katıdır.',
  },
];
