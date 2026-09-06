export type FlawedSolutionStep = {
  stepNumber: number;
  content: string;
};

export type FlawedSolutionItem = {
  id: string;
  title: string;
  topic: string;
  grade: '8' | 'LGS' | 'TYT' | '9' | '10' | '11' | '12';
  difficulty: 'Kolay' | 'Orta' | 'Zor';
  problemStatement: string;
  steps: FlawedSolutionStep[];
  flawedStepNumber: number;
  flawExplanation: string;
  conceptMisconception: string;
  correctStepContent: string;
  correctFinalResult: string;
};

export const FLAWED_SOLUTIONS_DATA: FlawedSolutionItem[] = [
  {
    id: 'flaw-1',
    title: 'Denklemde Parantez Dağılımı ve Eksi İşareti',
    topic: 'Birinci Dereceden Denklemler',
    grade: '8',
    difficulty: 'Kolay',
    problemStatement: '3(x - 4) - 2(x - 5) = 11 denklemini sağlayan x değerini bulunuz.',
    steps: [
      { stepNumber: 1, content: '3x - 12 - 2x - 10 = 11' },
      { stepNumber: 2, content: 'x - 22 = 11' },
      { stepNumber: 3, content: 'x = 11 + 22' },
      { stepNumber: 4, content: 'x = 33' },
    ],
    flawedStepNumber: 1,
    conceptMisconception: 'Negatif katsayı paranteze dağıtılırken işaret kuralının unutulması.',
    flawExplanation:
      '1. Adımda -2 sayısı (x - 5) ile çarpılırken (-2) · (-5) = +10 olmalıydı. Çözümde -10 yazılmıştır.',
    correctStepContent: '3x - 12 - 2x + 10 = 11',
    correctFinalResult: 'x = 13',
  },
  {
    id: 'flaw-2',
    title: 'Eşitsizlikte Negatif Sayıyla Bölme',
    topic: 'Birinci Dereceden Eşitsizlikler',
    grade: '8',
    difficulty: 'Orta',
    problemStatement: '-3x + 7 ≥ 19 eşitsizliğinin çözüm kümesini bulunuz.',
    steps: [
      { stepNumber: 1, content: '-3x ≥ 19 - 7' },
      { stepNumber: 2, content: '-3x ≥ 12' },
      { stepNumber: 3, content: 'x ≥ 12 / (-3)' },
      { stepNumber: 4, content: 'x ≥ -4' },
    ],
    flawedStepNumber: 3,
    conceptMisconception: 'Eşitsizliğin her iki tarafı negatif bir sayıya bölündüğünde yön değiştirmesi gerektiğinin unutulması.',
    flawExplanation:
      '3. Adımda eşitsizlik her iki taraftan negatif bir sayıya (-3) bölündüğü için ≥ işareti ≤ yönüne dönmeliydi.',
    correctStepContent: 'x ≤ 12 / (-3)',
    correctFinalResult: 'x ≤ -4',
  },
  {
    id: 'flaw-3',
    title: 'Kareköklü Sayılarda Toplama Yanılgısı',
    topic: 'Kareköklü İfadeler',
    grade: '8',
    difficulty: 'Kolay',
    problemStatement: '√(64 + 36) ifadesinin değerini hesaplayınız.',
    steps: [
      { stepNumber: 1, content: '√(64 + 36) = √64 + √36' },
      { stepNumber: 2, content: '√64 = 8 ve √36 = 6' },
      { stepNumber: 3, content: '8 + 6 = 14' },
    ],
    flawedStepNumber: 1,
    conceptMisconception: 'Karekök işleminin toplama işlemi üzerine dağılma özelliği olduğu yanılgısı.',
    flawExplanation:
      '1. Adımda karekök içindeki toplama ayrıştırılamaz. Önce kök içi toplanmalıdır: 64 + 36 = 100, ardından √100 = 10 bulunur.',
    correctStepContent: '√(64 + 36) = √100',
    correctFinalResult: '10',
  },
  {
    id: 'flaw-4',
    title: 'Tam Kare Özdeşliği Açılımı',
    topic: 'Cebirsel İfadeler ve Özdeşlikler',
    grade: '8',
    difficulty: 'Orta',
    problemStatement: '(2x - 3)² ifadesinin özdeşini yazınız.',
    steps: [
      { stepNumber: 1, content: '(2x)² - (3)²' },
      { stepNumber: 2, content: '4x² - 9' },
    ],
    flawedStepNumber: 1,
    conceptMisconception: 'Tam kare açılımında ((a-b)² = a² - 2ab + b²) ortadaki çarpımlarının 2 katı teriminin unutulması.',
    flawExplanation:
      '1. Adımda iki terimin farkının karesi alınırken birinci ile ikincinin çarpımının 2 katı (2 · 2x · 3 = 12x) ve son terimin karesi (+9) ihmal edilmiştir.',
    correctStepContent: '(2x)² - 2 · (2x) · 3 + 3²',
    correctFinalResult: '4x² - 12x + 9',
  },
  {
    id: 'flaw-5',
    title: 'Üslü İfadelerde Çarpma Kuralı',
    topic: 'Üslü İfadeler',
    grade: '8',
    difficulty: 'Kolay',
    problemStatement: '3⁴ · 3⁵ çarpımının sonucunu üslü olarak ifade ediniz.',
    steps: [
      { stepNumber: 1, content: 'Tabanlar aynı olduğu için üsler çarpılır: 4 · 5 = 20' },
      { stepNumber: 2, content: '3⁴ · 3⁵ = 3²⁰' },
    ],
    flawedStepNumber: 1,
    conceptMisconception: 'Tabanları aynı üslü sayılar çarpılırken üslerin toplanması yerine çarpılması yanılgısı.',
    flawExplanation:
      '1. Adımda tabanlar aynı olduğunda üsler çarpılmaz, toplanır: aᵐ · aⁿ = aᵐ⁺ⁿ.',
    correctStepContent: 'Tabanlar aynı olduğu için üsler toplanır: 4 + 5 = 9',
    correctFinalResult: '3⁹',
  },
  {
    id: 'flaw-6',
    title: 'Rasyonel İfadelerde Sadeleştirme Hatası',
    topic: 'Rasyonel Sayılar ve Cebir',
    grade: 'TYT',
    difficulty: 'Orta',
    problemStatement: '(x² + 6) / x kesrini sadeleştiriniz (x ≠ 0).',
    steps: [
      { stepNumber: 1, content: 'Paydaki x² ile paydadaki x sadeleştirilir.' },
      { stepNumber: 2, content: 'Geriye x + 6 kalır.' },
    ],
    flawedStepNumber: 1,
    conceptMisconception: 'Toplama durumundaki terimlerden sadece birinin payda ile sadeleştirilebileceği yanılgısı.',
    flawExplanation:
      '1. Adımda payda toplama işlemine dağıtılmalıdır: (x² + 6)/x = x²/x + 6/x = x + 6/x. Sadece ilk terim sadeleştirilip 6 öylece bırakılamaz.',
    correctStepContent: '(x² + 6) / x = x²/x + 6/x',
    correctFinalResult: 'x + 6/x',
  },
  {
    id: 'flaw-7',
    title: 'Pisagor Bağıntısında Kenarları Karıştırma',
    topic: 'Üçgenler ve Pisagor',
    grade: '8',
    difficulty: 'Orta',
    problemStatement: 'Hipotenüs uzunluğu 10 cm ve bir dik kenarı 6 cm olan dik üçgenin diğer dik kenarını bulunuz.',
    steps: [
      { stepNumber: 1, content: 'Pisagor bağıntısı: a² + b² = c²' },
      { stepNumber: 2, content: 'x² = 10² + 6²' },
      { stepNumber: 3, content: 'x² = 100 + 36 = 136' },
      { stepNumber: 4, content: 'x = √136 = 2√34 cm' },
    ],
    flawedStepNumber: 2,
    conceptMisconception: 'Bilinmeyen kenarın daima hipotenüs olduğu varsayımıyla hipotenüs karesini toplama hatası.',
    flawExplanation:
      '2. Adımda hipotenüs 10 cm olarak verilmiştir. Dolayısıyla denklem x² + 6² = 10² olmalıydı (x² = 100 - 36 = 64).',
    correctStepContent: 'x² + 6² = 10²',
    correctFinalResult: 'x = 8 cm',
  },
  {
    id: 'flaw-8',
    title: 'Üçgende Dış Açı Özelliği',
    topic: 'Üçgende Açılar',
    grade: '8',
    difficulty: 'Orta',
    problemStatement: 'Bir üçgende iki iç açı 45° ve 65° ise, üçüncü köşeye ait dış açının ölçüsünü bulunuz.',
    steps: [
      { stepNumber: 1, content: 'İç açılar toplamı: 45° + 65° = 110°' },
      { stepNumber: 2, content: 'Üçüncü iç açı: 180° - 110° = 70°' },
      { stepNumber: 3, content: 'Dış açı: 180° - 70° = 110°' },
      { stepNumber: 4, content: 'Komşu açıyı da ekleriz: 110° + 70° = 180°' },
    ],
    flawedStepNumber: 4,
    conceptMisconception: 'Dış açıyı bulduktan sonra gereksiz yere doğru açı ilişkisini sonuca katma hatası.',
    flawExplanation:
      '4. Adım gereksiz ve hatalıdır; aranan dış açı 3. Adımda 110° olarak (kendisine komşu olmayan iki iç açının toplamı) zaten bulunmuştur.',
    correctStepContent: 'Dış açı = 45° + 65° = 110°',
    correctFinalResult: '110°',
  },
  {
    id: 'flaw-9',
    title: 'Mutlak Değerli Denklem Çözümü',
    topic: 'Mutlak Değer',
    grade: 'TYT',
    difficulty: 'Zor',
    problemStatement: '|2x - 6| = 3 - x denkleminin çözüm kümesini bulunuz.',
    steps: [
      { stepNumber: 1, content: '2x - 6 = 3 - x veya 2x - 6 = -(3 - x)' },
      { stepNumber: 2, content: '3x = 9 → x = 3' },
      { stepNumber: 3, content: '2x - 6 = -3 + x → x = 3' },
      { stepNumber: 4, content: 'Çözüm kümesi: {3}' },
    ],
    flawedStepNumber: 1,
    conceptMisconception: 'Mutlak değer eşitliğinde sağ tarafın negatif olamayacağı (3 - x ≥ 0 → x ≤ 3) ön koşulunun kontrol edilmemesi.',
    flawExplanation:
      '1. Adımda mutlak değer tanımı gereği sağ tarafın 3 - x ≥ 0 koşulu baştan yazılmalıdır (gerçi x=3 sağlar ama metodolojik olarak zorunludur).',
    correctStepContent: '3 - x ≥ 0 koşuluyla: 2x - 6 = 3 - x veya 2x - 6 = -(3 - x)',
    correctFinalResult: 'x = 3',
  },
  {
    id: 'flaw-10',
    title: 'Basit Olasılıkta Örnek Uzay Belirleme',
    topic: 'Basit Olayların Olma Olasılığı',
    grade: '8',
    difficulty: 'Kolay',
    problemStatement: 'İki madeni para aynı anda atıldığında en az birinin tura gelme olasılığı kaçtır?',
    steps: [
      { stepNumber: 1, content: 'Olası durumlar: 2 yazı, 1 yazı 1 tura, 2 tura. Toplam 3 durum vardır.' },
      { stepNumber: 2, content: 'İstenen durumlar: 1 yazı 1 tura veya 2 tura. Toplam 2 durum.' },
      { stepNumber: 3, content: 'Olasılık: 2/3' },
    ],
    flawedStepNumber: 1,
    conceptMisconception: 'Eş olasılıklı olmayan durumları tek durum gibi sayma hatası (YT ve TY iki ayrı durumdur).',
    flawExplanation:
      '1. Adımda örnek uzay hatalı sayılmıştır. Paralar ayırt edilebilir olduğu için olası durumlar {YY, YT, TY, TT} olmak üzere 4 tanedir. İstenenler {YT, TY, TT} yani 3 tanedir.',
    correctStepContent: 'Tüm olası durumlar: {YY, YT, TY, TT} olmak üzere 4 durum vardır.',
    correctFinalResult: '3/4',
  },
];
