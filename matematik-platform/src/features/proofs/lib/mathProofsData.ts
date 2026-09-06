export interface MathProofItem {
  id: string;
  title: string;
  formula: string;
  category: 'Geometri' | 'Cebir' | 'Sayılar Teorisi';
  grade: '8' | '7' | 'Tümü';
  difficulty: 'Temel' | 'Orta' | 'İleri';
  intuitiveExplanation: string;
  steps: {
    stepNumber: number;
    title: string;
    description: string;
    visualHint: string;
  }[];
  historyNote: string;
}

export const MATH_PROOFS_COLLECTION: MathProofItem[] = [
  {
    id: 'proof-pythagoras',
    title: 'Pisagor Bağıntısı İspatı',
    formula: 'a² + b² = c²',
    category: 'Geometri',
    grade: '8',
    difficulty: 'Temel',
    intuitiveExplanation: 'Dik üçgenin dik kenarları üzerine kurulan iki karenin alanları toplamı, hipotenüs üzerine kurulan karenin alanına tam olarak eşittir.',
    steps: [
      {
        stepNumber: 1,
        title: 'Büyük Kareyi Oluşturma',
        description: 'Kenar uzunluğu (a + b) olan büyük bir kare çizelim. Bu karenin toplam alanı (a + b)² = a² + 2ab + b² dir.',
        visualHint: 'Kenarı (a+b) olan büyük kare alanı',
      },
      {
        stepNumber: 2,
        title: 'Dört Eş Dik Üçgeni Yerleştirme',
        description: 'Bu büyük karenin köşelerine kenarları a ve b, hipotenüsü c olan 4 adet eş dik üçgen yerleştirelim. 4 üçgenin alanı 4 × (a × b / 2) = 2ab eder.',
        visualHint: 'Köşelerdeki 4 dik üçgen',
      },
      {
        stepNumber: 3,
        title: 'Ortada Kalan Alanı İnceleme',
        description: 'Ortada kenar uzunluğu c olan eğik bir kare kalır. Bu karenin alanı c² dir.',
        visualHint: 'Ortadaki c² alanı',
      },
      {
        stepNumber: 4,
        title: 'Sonuç Eşitliği',
        description: 'Büyük karenin alanı = 4 Üçgenin Alanı + Ortadaki Kare: (a² + 2ab + b²) = 2ab + c² ⇒ Her iki taraftan 2ab çıkarıldığında a² + b² = c² kalır!',
        visualHint: 'Eşitliğin sadeleşmesi',
      },
    ],
    historyNote: 'Pisagor bu ispatı kum havuzunda geometrik şekilleri kaydırarak keşfetmiştir.',
  },
  {
    id: 'proof-two-squares-diff',
    title: 'İki Kare Farkı Özdeşliği',
    formula: 'a² - b² = (a - b)(a + b)',
    category: 'Cebir',
    grade: '8',
    difficulty: 'Temel',
    intuitiveExplanation: 'Büyük bir kareden küçük bir kareyi kesip çıkardığımızda kalan L şeklindeki alanı ortadan ikiye bölüp yan yana getirirsek (a-b) ile (a+b) kenarlarına sahip bir dikdörtgen elde ederiz.',
    steps: [
      {
        stepNumber: 1,
        title: 'Alanı a² Olan Kare',
        description: 'Kenar uzunluğu a olan bir kare hayal edin. Alanı a² dir.',
        visualHint: 'a × a boyutunda kare',
      },
      {
        stepNumber: 2,
        title: 'Köşeden b² Kare Çıkarma',
        description: 'Bu karenin bir köşesinden kenarı b olan küçük bir kareyi kesip atalım. Kalan alan a² - b² olur.',
        visualHint: 'Köşesi oyulmuş L şekli',
      },
      {
        stepNumber: 3,
        title: 'Kalan Parçayı Dikdörtgen Yapma',
        description: 'Kalan L şeklini iki dikdörtgene ayıralım: Biri a × (a - b), diğeri b × (a - b).',
        visualHint: 'İki parçaya ayrılan L şekli',
      },
      {
        stepNumber: 4,
        title: 'Uç Uca Ekleme',
        description: 'Bu iki parçayı yan yana birleştirdiğimizde yüksekliği (a - b), genişliği ise (a + b) olan tek bir dikdörtgen oluşur: Alan = (a - b)(a + b)!',
        visualHint: '(a-b) × (a+b) dikdörtgeni',
      },
    ],
    historyNote: 'Öklid Elementler kitabının II. cildinde bu cebirsel özdeşlikleri tamamen alan geometrisiyle kanıtlamıştır.',
  },
  {
    id: 'proof-triangle-angles',
    title: 'Üçgenin İç Açıları Toplamı 180°',
    formula: 'A + B + C = 180°',
    category: 'Geometri',
    grade: '8',
    difficulty: 'Temel',
    intuitiveExplanation: 'Üçgenin tepe noktasından tabanına paralel bir doğru çizildiğinde, Z kuralı (iç ters açılar) sayesinde üç açının da tepe noktasında yan yana gelip 180 derecelik doğru bir açı oluşturduğu görülür.',
    steps: [
      {
        stepNumber: 1,
        title: 'Paralel Çizgi Çizme',
        description: 'ABC üçgeninin A tepe noktasından, BC taban kenarına paralel bir doğru çizelim.',
        visualHint: 'Tepe noktasından geçen paralel doğru',
      },
      {
        stepNumber: 2,
        title: 'Z Kuralını (İç Ters Açılar) Uygulama',
        description: 'Paralel doğrular arasındaki Z kuralından dolayı sol taraftaki açı B açısına, sağ taraftaki açı C açısına eşit olur.',
        visualHint: 'İç ters açılar eşleşmesi',
      },
      {
        stepNumber: 3,
        title: 'Doğru Açı (180°)',
        description: 'A noktasındaki doğru çizgi üzerinde B, A ve C açıları yan yana dizilmiştir. Bir doğru üzerindeki açı 180° olduğundan B + A + C = 180° dir.',
        visualHint: 'Doğrusal 180° toplamı',
      },
    ],
    historyNote: 'Bu kanıt Öklid geometrisinin 5. aksiyomuna (paralellik aksiyomu) dayanır.',
  },
  {
    id: 'proof-gauss-sum',
    title: 'Gauss Toplam Formülü (1 + 2 + ... + n)',
    formula: '1 + 2 + ... + n = n(n + 1) / 2',
    category: 'Sayılar Teorisi',
    grade: 'Tümü',
    difficulty: 'Orta',
    intuitiveExplanation: 'Merdiven şeklinde dizilmiş 1 den n e kadar kare blokların yanına tıpatıp aynı merdiveni ters çevirip yapıştırırsak, n × (n+1) boyutunda bir dikdörtgen oluşur. Aradığımız toplam bu alanın yarısıdır.',
    steps: [
      {
        stepNumber: 1,
        title: 'Merdiven Modeli',
        description: '1 kare, altına 2 kare, altına 3 kare... en alta n kare koyarak bir üçgensel blok oluşturalım.',
        visualHint: 'Merdiven şeklindeki bloklar',
      },
      {
        stepNumber: 2,
        title: 'İkinci Eş Merdiveni Ters Yapıştırma',
        description: 'Aynı merdivenden bir tane daha alıp 180 derece döndürelim ve ilkine kenetleyelim.',
        visualHint: 'Kenetlenen iki merdiven',
      },
      {
        stepNumber: 3,
        title: 'Dikdörtgenin Boyutları',
        description: 'Oluşan dikdörtgenin bir kenarı n, diğer kenarı (n + 1) bloktur. Toplam alan n × (n + 1) dir.',
        visualHint: 'n × (n+1) dikdörtgen',
      },
      {
        stepNumber: 4,
        title: 'İkiye Bölme',
        description: 'İki adet merdiven birleştirdiğimiz için tek bir merdivenin toplamı n(n + 1) / 2 dir.',
        visualHint: 'Yarısının alınması',
      },
    ],
    historyNote: 'Carl Friedrich Gauss henüz 10 yaşındayken öğretmeninin 1 den 100 e kadar sayıları toplama cezasını bu simetriyi fark ederek saniyeler içinde çözmüştür.',
  },
];

export const MATH_PROOFS_COMPLETED_KEY = 'ugurhoca_math_proofs_completed';

export function getCompletedProofIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(MATH_PROOFS_COMPLETED_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function toggleProofCompleted(proofId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const completed = getCompletedProofIds();
    const exists = completed.includes(proofId);
    const updated = exists ? completed.filter((id) => id !== proofId) : [...completed, proofId];
    localStorage.setItem(MATH_PROOFS_COMPLETED_KEY, JSON.stringify(updated));
    return !exists;
  } catch {
    return false;
  }
}
