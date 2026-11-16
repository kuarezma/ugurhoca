import type { FaqItem } from './components/FaqAccordion';

export const LGS_EXAM_SEASON = '2026/2027';
export const LGS_CALCULATOR_TITLE = `${LGS_EXAM_SEASON} MEB LGS Puan & Yüzdelik Dilim Robotu`;

export const LGS_FAQS: FaqItem[] = [
  {
    q: 'LGS puanı nasıl hesaplanır?',
    a: "MEB LGS'de öğrencilerin her derse ait net sayısı (Doğru - Yanlış / 3) hesaplanır. Bu araç ders ağırlıklarına göre yaklaşık puan üretir. Resmî puan, sınavın ortalama ve standart sapmalarına da bağlıdır.",
  },
  {
    q: "LGS'de 3 yanlış 1 doğruyu götürür mü?",
    a: 'Evet. MEB LGS sınavında her ders için yapılan 3 yanlış cevap, o dersteki 1 doğru cevabı eksiltir. Bu nedenle emin olunmayan sorularda rastgele tahmin yapmak yerine boş bırakmak net kaybını önler.',
  },
  {
    q: 'Lise tercihlerinde puan mı yoksa yüzdelik dilim mi önemlidir?',
    a: 'Tercihlerde geçmiş yılların yüzdelik dilimleri yararlı bir karşılaştırma sağlar. Kontenjanlar ve sonuçlar değişebileceğinden güncel MEB tercih kılavuzunu incele.',
  },
  {
    q: 'Tüm soruları doğru yapan öğrenci kaç puan alır?',
    a: "LGS'de toplam 90 soru (50 sözel + 40 sayısal) bulunur. Bu araç tüm doğru için 500 tahmini puan gösterir; resmî sonuç sınav istatistikleriyle hesaplanır.",
  },
];
