export type YieldLevel = "critical" | "guaranteed" | "quick_win" | "high";

export interface ExamTopicWeightItem {
  id: string;
  topicName: string;
  years: {
    "2021": number;
    "2022": number;
    "2023": number;
    "2024": number;
    "2025": number;
  };
  avgQuestions: number;
  yieldLevel: YieldLevel;
  tacticalNote: string;
}

export interface ExamDistributionCategory {
  id: "lgs" | "yks_tyt" | "yks_ayt";
  title: string;
  shortTitle: string;
  subtitle: string;
  totalQuestions: number;
  topics: ExamTopicWeightItem[];
}

export const YIELD_LEVEL_META: Record<
  YieldLevel,
  { label: string; badgeClass: string; dotColor: string }
> = {
  critical: {
    label: "Kritik Ağırlıklı (3+ Soru)",
    badgeClass: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
    dotColor: "bg-rose-500",
  },
  guaranteed: {
    label: "Her Yıl Garanti",
    badgeClass: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
    dotColor: "bg-amber-500",
  },
  high: {
    label: "Yüksek Getirili",
    badgeClass: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30",
    dotColor: "bg-purple-500",
  },
  quick_win: {
    label: "Hızlı Net Kazandıran",
    badgeClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    dotColor: "bg-emerald-500",
  },
};

export const EXAM_TOPIC_WEIGHT_DATA: ExamDistributionCategory[] = [
  {
    id: "lgs",
    title: "MEB LGS Matematik Konu Ağırlıkları (20 Soru)",
    shortTitle: "LGS (8. Sınıf)",
    subtitle: "Son 5 yılın resmi MEB LGS sınavlarında çıkan soru adetleri ve stratejik kazanım ağırlıkları",
    totalQuestions: 20,
    topics: [
      {
        id: "lgs_karekok",
        topicName: "Kareköklü İfadeler",
        years: { "2021": 3, "2022": 3, "2023": 5, "2024": 3, "2025": 3 },
        avgQuestions: 3.4,
        yieldLevel: "critical",
        tacticalNote: "LGS'nin en çok soru çıkan konusu. Yaklaşık değer tahmini ve kök içi-dışı dönüşümlerini hatasız yap.",
      },
      {
        id: "lgs_ucgenler",
        topicName: "Üçgenler (Pisagor & Benzerlik)",
        years: { "2021": 3, "2022": 3, "2023": 0, "2024": 3, "2025": 3 },
        avgQuestions: 3.0,
        yieldLevel: "critical",
        tacticalNote: "Geometrinin en belirleyici alanı. Pisagor özel üçgenleri (3-4-5, 5-12-13) ve benzerlik oranı soru çözer.",
      },
      {
        id: "lgs_dogrusal",
        topicName: "Doğrusal Denklemler & Eğim",
        years: { "2021": 2, "2022": 3, "2023": 0, "2024": 3, "2025": 3 },
        avgQuestions: 2.8,
        yieldLevel: "critical",
        tacticalNote: "Koordinat sistemi, eğim (dikey/yatay) ve grafik yorumlama her yıl 3 soru getirir.",
      },
      {
        id: "lgs_cebir",
        topicName: "Cebirsel İfadeler & Özdeşlikler",
        years: { "2021": 2, "2022": 2, "2023": 4, "2024": 2, "2025": 2 },
        avgQuestions: 2.4,
        yieldLevel: "guaranteed",
        tacticalNote: "İki kare farkı ve tam kare açılımları cebirsel modellemelerin kalbidir.",
      },
      {
        id: "lgs_uslu",
        topicName: "Üslü İfadeler",
        years: { "2021": 2, "2022": 2, "2023": 3, "2024": 2, "2025": 2 },
        avgQuestions: 2.2,
        yieldLevel: "guaranteed",
        tacticalNote: "Bilimsel gösterim ve üs taban dönüşümleri garanti net kaynağıdır.",
      },
      {
        id: "lgs_carpanlar",
        topicName: "Çarpanlar ve Katlar (EBOB-EKOK)",
        years: { "2021": 3, "2022": 1, "2023": 4, "2024": 1, "2025": 1 },
        avgQuestions: 2.0,
        yieldLevel: "high",
        tacticalNote: "Parçalama probleminde EBOB, katlanma ve birleşme probleminde EKOK uygulanır.",
      },
      {
        id: "lgs_cisimler",
        topicName: "Geometrik Cisimler",
        years: { "2021": 1, "2022": 2, "2023": 0, "2024": 2, "2025": 2 },
        avgQuestions: 1.8,
        yieldLevel: "high",
        tacticalNote: "Dik dairesel silindir ve piramit açınımlarını zihninde 3 boyutlu canlandırmayı pratik et.",
      },
      {
        id: "lgs_veri",
        topicName: "Veri Analizi",
        years: { "2021": 1, "2022": 1, "2023": 2, "2024": 1, "2025": 1 },
        avgQuestions: 1.2,
        yieldLevel: "quick_win",
        tacticalNote: "Daire grafiğinde 360 derece orantısı kurmak 1 neti 45 saniyede kazandırır.",
      },
      {
        id: "lgs_olasilik",
        topicName: "Basit Olayların Olma Olasılığı",
        years: { "2021": 1, "2022": 1, "2023": 2, "2024": 1, "2025": 1 },
        avgQuestions: 1.2,
        yieldLevel: "quick_win",
        tacticalNote: "İstenen durum / Tüm olası durumlar formülü. Soru kökündeki şartları kaçırma.",
      },
      {
        id: "lgs_esitsizlik",
        topicName: "Eşitsizlikler",
        years: { "2021": 1, "2022": 1, "2023": 0, "2024": 1, "2025": 1 },
        avgQuestions: 1.0,
        yieldLevel: "quick_win",
        tacticalNote: "Negatif sayıyla çarpma/bölmede eşitsizlik yön değiştirir; bu tuzağa düşme.",
      },
      {
        id: "lgs_donusum",
        topicName: "Dönüşüm Geometrisi",
        years: { "2021": 1, "2022": 1, "2023": 0, "2024": 1, "2025": 1 },
        avgQuestions: 1.0,
        yieldLevel: "quick_win",
        tacticalNote: "Öteleme ve yansıma kurallarında işaret değişimlerini koordinat üzerinde adım adım çiz.",
      },
    ],
  },
  {
    id: "yks_tyt",
    title: "ÖSYM YKS TYT Matematik Konu Ağırlıkları (40 Soru)",
    shortTitle: "TYT Matematik",
    subtitle: "Temel Yeterlilik Testi son 5 yıl soru dağılımı ve stratejik çalışma öncelikleri",
    totalQuestions: 40,
    topics: [
      {
        id: "tyt_problemler",
        topicName: "Problemler (Sayı, Kesir, Yaş, Hız, Yüzde)",
        years: { "2021": 12, "2022": 13, "2023": 11, "2024": 12, "2025": 12 },
        avgQuestions: 12.0,
        yieldLevel: "critical",
        tacticalNote: "TYT'nin kalbi! Sınavın %30'u problemlerdir. Her gün aksatmadan 15-20 problem çözmek şarttır.",
      },
      {
        id: "tyt_ucgenler_geo",
        topicName: "Üçgenler & Temel Geometri",
        years: { "2021": 5, "2022": 5, "2023": 5, "2024": 5, "2025": 5 },
        avgQuestions: 5.0,
        yieldLevel: "critical",
        tacticalNote: "Geometrideki 10 sorunun yarısı doğrudan üçgen kuralları ve açılardan gelir.",
      },
      {
        id: "tyt_temel_kavram",
        topicName: "Temel Kavramlar & Sayı Basamakları",
        years: { "2021": 3, "2022": 3, "2023": 3, "2024": 3, "2025": 3 },
        avgQuestions: 3.0,
        yieldLevel: "guaranteed",
        tacticalNote: "Tek-çift sayılar, asal sayılar ve ardışık sayı özellikleri sınavın ilk sayfalarında yer alır.",
      },
      {
        id: "tyt_fonksiyon",
        topicName: "Fonksiyonlar",
        years: { "2021": 2, "2022": 2, "2023": 2, "2024": 2, "2025": 2 },
        avgQuestions: 2.0,
        yieldLevel: "guaranteed",
        tacticalNote: "Hem TYT'de 2 net hem de AYT'nin temeli olan hayati konu. Bileşke ve ters fonksiyonu iyi kavra.",
      },
      {
        id: "tyt_rasyonel",
        topicName: "Rasyonel & Ondalık Sayılar",
        years: { "2021": 2, "2022": 2, "2023": 2, "2024": 2, "2025": 2 },
        avgQuestions: 2.0,
        yieldLevel: "quick_win",
        tacticalNote: "Sınavın en hızlı çözülebilen net kaynağı. Şekilli kesir modellerine dikkat et.",
      },
      {
        id: "tyt_uslu_koklu",
        topicName: "Üslü ve Köklü Sayılar",
        years: { "2021": 2, "2022": 2, "2023": 2, "2024": 2, "2025": 2 },
        avgQuestions: 2.0,
        yieldLevel: "guaranteed",
        tacticalNote: "Her yıl 1 üslü ve 1 köklü yeni nesil modelleme sorusu banko gelir.",
      },
      {
        id: "tyt_mutlak_esitsizlik",
        topicName: "Basit Eşitsizlik & Mutlak Değer",
        years: { "2021": 2, "2022": 2, "2023": 2, "2024": 2, "2025": 2 },
        avgQuestions: 2.0,
        yieldLevel: "guaranteed",
        tacticalNote: "Mutlak değerin geometrik anlamı (uzaklık) son yıllarda sıklıkla test ediliyor.",
      },
      {
        id: "tyt_pkob",
        topicName: "Permütasyon, Kombinasyon & Olasılık",
        years: { "2021": 2, "2022": 2, "2023": 2, "2024": 2, "2025": 2 },
        avgQuestions: 2.0,
        yieldLevel: "high",
        tacticalNote: "Eleme gücü yüksek konular. Seçme (kombinasyon) ile sıralama (permütasyon) farkını iyi ayır.",
      },
      {
        id: "tyt_mantik",
        topicName: "Mantık (Önermeler)",
        years: { "2021": 1, "2022": 1, "2023": 1, "2024": 1, "2025": 1 },
        avgQuestions: 1.0,
        yieldLevel: "quick_win",
        tacticalNote: "Ve, Veya, İse kurallarını bilen öğrenci için en garanti 1 net.",
      },
      {
        id: "tyt_kumeler",
        topicName: "Kümeler & Kartezyen Çarpım",
        years: { "2021": 1, "2022": 1, "2023": 1, "2024": 1, "2025": 1 },
        avgQuestions: 1.0,
        yieldLevel: "quick_win",
        tacticalNote: "Venn şeması tarama ve küme problemleri her yıl 1 net kazandırır.",
      },
      {
        id: "tyt_kati_cisim",
        topicName: "Katı Cisimler (Prizma, Silindir)",
        years: { "2021": 2, "2022": 2, "2023": 2, "2024": 2, "2025": 2 },
        avgQuestions: 2.0,
        yieldLevel: "high",
        tacticalNote: "Hacim ve yüzey alanı formüllerini ezberinde tut, katlama sorularını kaçırma.",
      },
    ],
  },
  {
    id: "yks_ayt",
    title: "ÖSYM YKS AYT Matematik Konu Ağırlıkları (40 Soru)",
    shortTitle: "AYT Matematik",
    subtitle: "Alan Yeterlilik Testi son 5 yıl soru dağılımı ve yüksek katsayılı kritik konular",
    totalQuestions: 40,
    topics: [
      {
        id: "ayt_trigonometri",
        topicName: "Trigonometri",
        years: { "2021": 5, "2022": 4, "2023": 5, "2024": 5, "2025": 5 },
        avgQuestions: 4.8,
        yieldLevel: "critical",
        tacticalNote: "AYT'nin en çok soru getiren yıldızı (4-5 soru!). Toplam-fark ve yarım açı formüllerini adın gibi bil.",
      },
      {
        id: "ayt_turev",
        topicName: "Türev ve Uygulamaları",
        years: { "2021": 3, "2022": 4, "2023": 0, "2024": 4, "2025": 4 },
        avgQuestions: 3.0,
        yieldLevel: "critical",
        tacticalNote: "Geometrik yorum, teğet eğimi ve maksimum-minimum problemleri dereceyi belirler.",
      },
      {
        id: "ayt_integral",
        topicName: "İntegral ve Alan Hesabı",
        years: { "2021": 4, "2022": 4, "2023": 0, "2024": 4, "2025": 4 },
        avgQuestions: 3.2,
        yieldLevel: "critical",
        tacticalNote: "Belirli integral ve eğri altında kalan alan hesabı her yıl 4 kritik net sağlar.",
      },
      {
        id: "ayt_analitik",
        topicName: "Analitik Geometri",
        years: { "2021": 3, "2022": 3, "2023": 3, "2024": 3, "2025": 3 },
        avgQuestions: 3.0,
        yieldLevel: "critical",
        tacticalNote: "Noktanın ve doğrunun analitiği; iki doğru arasındaki açı ve uzaklık kuralları.",
      },
      {
        id: "ayt_polinom",
        topicName: "Polinomlar",
        years: { "2021": 2, "2022": 2, "2023": 2, "2024": 2, "2025": 2 },
        avgQuestions: 2.0,
        yieldLevel: "guaranteed",
        tacticalNote: "Kalan bulma teoremi ve başkatsayı kuralları ile 2 net kazandırır.",
      },
      {
        id: "ayt_logaritma",
        topicName: "Logaritma",
        years: { "2021": 2, "2022": 2, "2023": 2, "2024": 2, "2025": 2 },
        avgQuestions: 2.0,
        yieldLevel: "quick_win",
        tacticalNote: "Taban değiştirme ve özelliklerini kavrayan herkesin kaçırmayacağı garanti 2 soru.",
      },
      {
        id: "ayt_diziler",
        topicName: "Diziler (Aritmetik & Geometrik)",
        years: { "2021": 1, "2022": 1, "2023": 1, "2024": 1, "2025": 1 },
        avgQuestions: 1.0,
        yieldLevel: "quick_win",
        tacticalNote: "Genel terim ve ilk n terim toplamı formülleriyle hızlı net sağlar.",
      },
      {
        id: "ayt_limit",
        topicName: "Limit ve Süreklilik",
        years: { "2021": 2, "2022": 2, "2023": 0, "2024": 2, "2025": 2 },
        avgQuestions: 1.6,
        yieldLevel: "guaranteed",
        tacticalNote: "0/0 belirsizliği sadeleştirmesi ve sağ-sol limit süreklilik koşulları.",
      },
      {
        id: "ayt_parabol",
        topicName: "Parabol & İkinci Dereceden Eşitsizlik",
        years: { "2021": 2, "2022": 2, "2023": 2, "2024": 2, "2025": 2 },
        avgQuestions: 2.0,
        yieldLevel: "guaranteed",
        tacticalNote: "Tepe noktası r, k ve işaret tablosu kurarak çözüm kümesi bulma.",
      },
      {
        id: "ayt_cember_analitik",
        topicName: "Çemberin Analitiği",
        years: { "2021": 1, "2022": 1, "2023": 1, "2024": 1, "2025": 1 },
        avgQuestions: 1.0,
        yieldLevel: "high",
        tacticalNote: "Merkez ve yarıçap standart çember denklemi formülü.",
      },
    ],
  },
];
