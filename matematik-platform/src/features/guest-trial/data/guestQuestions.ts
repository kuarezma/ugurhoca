export type GuestQuestionType =
  | 'multiple_choice'
  | 'short_answer'
  | 'open_ended';

export interface GuestQuestion {
  id: string;
  grade: number;
  question: string;
  options: string[];
  correct_index: number;
  question_type: GuestQuestionType;
  expected_answer?: string;
  rubric?: string[];
  explanation: string;
  outcome: string;
}

export const GUEST_QUESTIONS: Record<number, GuestQuestion[]> = {
  5: [
    {
      id: 'g5-1',
      grade: 5,
      question:
        'Bir çevre kulübü öğrencileri okul bahçesine fidan dikmek için iki fidanlıktan fidan temin etmiştir. Birinci fidanlıktan her birinde 24 fidan bulunan 15 kasa, ikinci fidanlıktan ise her birinde 18 fidan bulunan 20 kasa fidan gelmiştir. Öğrenciler tüm fidanları her sıraya 12 fidan gelecek biçimde diktiklerine göre toplam kaç sıra fidan dikilmiştir?',
      options: ['48', '54', '60', '64'],
      correct_index: 2,
      question_type: 'multiple_choice',
      outcome: 'Doğal Sayılarla Dört İşlem & Zihinden İşlem Stratejileri',
      explanation:
        '1. fidanlık: $24 \\times 15 = 360$ fidan. 2. fidanlık: $18 \\times 20 = 360$ fidan. Toplam: $360 + 360 = 720$ fidan. Sıra sayısı: $720 \\div 12 = 60$ sıra bulunur.',
    },
    {
      id: 'g5-2',
      grade: 5,
      question:
        "Zeynep bir hikâye kitabının pazartesi günü $\\frac{2}{5}$'sini, salı günü ise $\\frac{3}{10}$'ünü okumuştur. Kitabın henüz okunmayan 36 sayfası kaldığına göre bu hikâye kitabı toplam kaç sayfadır?",
      options: ['100', '120', '140', '150'],
      correct_index: 1,
      question_type: 'multiple_choice',
      outcome: 'Kesirlerle Toplama ve Çıkarma İşlemleri',
      explanation:
        "Okunan kısım: $\\frac{2}{5} + \\frac{3}{10} = \\frac{4}{10} + \\frac{3}{10} = \\frac{7}{10}$. Kalan kısım: $1 - \\frac{7}{10} = \\frac{3}{10}$. $\\frac{3}{10}$'ü 36 sayfa ise $\\frac{1}{10}$'i $36 \\div 3 = 12$ sayfadır. Kitabın tamamı $12 \\times 10 = 120$ sayfadır.",
    },
    {
      id: 'g5-3',
      grade: 5,
      question:
        "Bir okul kütüphanesindeki kitapların $\\frac{3}{8}$'i fen bilimleri, $\\frac{1}{4}$'i edebiyat ve geriye kalanı matematik kitabıdır. Kütüphanede 84 adet matematik kitabı bulunduğuna göre kütüphanedeki toplam kitap sayısı kaçtır?",
      options: [],
      correct_index: 0,
      question_type: 'short_answer',
      expected_answer: '224',
      rubric: [
        'Payda eşitleyip fen ve edebiyat kitaplarının oranını 5/8 bulma (30 puan)',
        'Geriye kalan matematik kitaplarının oranını 3/8 olarak belirleme (30 puan)',
        'Birim kesir değerini (84/3 = 28) ve toplam kitap adedini (28 x 8 = 224) bulma (40 puan)',
      ],
      outcome: 'MEB Ortak Yazılı Uyumlu Kesir Problemleri & Açık Çözüm',
      explanation:
        "Fen ve edebiyat toplamı: $\\frac{3}{8} + \\frac{2}{8} = \\frac{5}{8}$. Matematik kitapları: $1 - \\frac{5}{8} = \\frac{3}{8}$. $\\frac{3}{8}$'i 84 ise $84 \\div 3 = 28$ ve toplam $28 \\times 8 = 224$ kitaptır.",
    },
  ],
  6: [
    {
      id: 'g6-1',
      grade: 6,
      question:
        'Kenar uzunlukları $36\\text{ cm}$ ve $48\\text{ cm}$ olan dikdörtgen biçimindeki bir ahşap levha, hiç parça artmayacak biçimde eş kare parçalara ayrılacaktır. Parça sayısının en az olması istendiğine göre elde edilen kare parça sayısı kaçtır?',
      options: ['9', '12', '16', '24'],
      correct_index: 1,
      question_type: 'multiple_choice',
      outcome: 'Ortak Bölenler ve Katlar (EBOB Uygulamaları)',
      explanation:
        'Kare parçanın kenar uzunluğu $\\text{EBOB}(36, 48) = 12\\text{ cm}$ olmalıdır. Yatayda $36 \\div 12 = 3$, düşeyde $48 \\div 12 = 4$ sıra oluşur. Toplam parça sayısı $3 \\times 4 = 12$ tanedir.',
    },
    {
      id: 'g6-2',
      grade: 6,
      question:
        'Bir çıraklık atölyesinde $9,6\\text{ metre}$ uzunluğundaki bir profil çıta, her biri $0,8\\text{ metre}$ uzunluğunda eş parçalara kesilecektir. Usta her bir kesim işlemini 3 saniyede tamamladığına göre tüm kesim işlemi toplam kaç saniye sürer?',
      options: ['33', '36', '39', '42'],
      correct_index: 0,
      question_type: 'multiple_choice',
      outcome: 'Ondalık Gösterimlerle Bölme ve Problem Çözme',
      explanation:
        'Parça sayısı: $9,6 \\div 0,8 = 96 \\div 8 = 12$ parça. Dikkat: 12 parça elde etmek için $12 - 1 = 11$ defa kesim yapılır. Toplam süre $11 \\times 3 = 33$ saniyedir.',
    },
    {
      id: 'g6-3',
      grade: 6,
      question:
        'Uzunlukları $180\\text{ cm}$ ve $216\\text{ cm}$ olan iki çelik tel, hiç parça artmayacak biçimde eşit uzunlukta en büyük parçalara kesilecektir. Kesilen her bir parçanın uzunluğu kaç santimetredir?',
      options: [],
      correct_index: 0,
      question_type: 'short_answer',
      expected_answer: '36|36 cm',
      rubric: [
        'Sayıların bölenlerini listeleme veya asal çarpan algoritmasını uygulama (40 puan)',
        'En büyük ortak bölenin 36 cm olduğunu ve tel parçası uzunluğunu doğru ifade etme (60 puan)',
      ],
      outcome: 'MEB Ortak Yazılı Uyumlu Çarpanlar ve Katlar Açık Uçlu Soru',
      explanation:
        'EBOB(180, 216) hesaplanır: $216 - 180 = 36$. $180 = 36 \\times 5$ ve $216 = 36 \\times 6$ olduğundan her parçanın uzunluğu $36\\text{ cm}$ olur.',
    },
  ],
  7: [
    {
      id: 'g7-1',
      grade: 7,
      question:
        'Hassas bir deney kabının sıcaklığı $-18^\\circ\\text{C}$ iken termostat kontrollü olarak her 4 dakikada bir $6^\\circ\\text{C}$ artmaktadır. Kabın sıcaklığının $+24^\\circ\\text{C}$ seviyesine ulaşması için kaç dakika geçmelidir?',
      options: ['24', '28', '32', '36'],
      correct_index: 1,
      question_type: 'multiple_choice',
      outcome: 'Tam Sayılarla Dört İşlem & Gerçek Hayat Problemleri',
      explanation:
        'Toplam sıcaklık değişimi: $24 - (-18) = 24 + 18 = 42^\\circ\\text{C}$. Artış periyot sayısı: $42 \\div 6 = 7$ periyot. Geçen süre: $7 \\times 4 = 28$ dakikadır.',
    },
    {
      id: 'g7-2',
      grade: 7,
      question:
        "Bir su deposunun içinde bir miktar su vardır. Depoya 45 litre su ilave edildiğinde deponun yarısı dolmaktadır. Depodan 15 litre su alındığında ise deponun $\\frac{1}{4}$'i dolu kalmaktadır. Buna göre bu su deposunun tam kapasitesi kaç litredir?",
      options: ['180', '200', '240', '280'],
      correct_index: 2,
      question_type: 'multiple_choice',
      outcome: 'Birinci Dereceden Bir Bilinmeyenli Denklemler',
      explanation:
        'Depo hacmine $V$, içindeki suya $x$ dersek: $x + 45 = \\frac{V}{2}$ ve $x - 15 = \\frac{V}{4}$. İki denklemi birbirinden çıkarırsak: $60 = \\frac{V}{2} - \\frac{V}{4} = \\frac{V}{4} \\implies V = 240$ litredir.',
    },
    {
      id: 'g7-3',
      grade: 7,
      question:
        "Bir sınıftaki öğrencilerin $\\frac{3}{5}$'ü kız öğrencidir. Sınıftan 4 kız öğrenci ayrılıp sınıfa 2 erkek öğrenci katıldığında kız ve erkek öğrenci sayıları eşitlenmektedir. Buna göre başlangıçta sınıfta kaç öğrenci vardır?",
      options: [],
      correct_index: 0,
      question_type: 'short_answer',
      expected_answer: '30',
      rubric: [
        'Bilinmeyen belirleyip kız ve erkek sayılarını cebirsel yazma: 3x ve 2x (30 puan)',
        'Durum değişimini denklemleştirme: 3x - 4 = 2x + 2 (35 puan)',
        'x = 6 değerini bulup toplam mevcudu 5 * 6 = 30 olarak tamamlama (35 puan)',
      ],
      outcome: 'MEB Ortak Yazılı Uyumlu Rasyonel Sayı & Denklem Problemi',
      explanation:
        'Sınıf mevcudu $5x$ olsun. Kızlar: $3x$, Erkekler: $2x$. Ayrılma ve katılma sonrası: $3x - 4 = 2x + 2 \\implies x = 6$. Başlangıçtaki mevcudiyet $5 \\times 6 = 30$ öğrencidir.',
    },
  ],
  8: [
    {
      id: 'g8-1',
      grade: 8,
      question:
        'Bir kenar uzunluğu santimetre cinsinden bir doğal sayı olan kare şeklindeki bir panonun alanı $150\\text{ cm}^2$ ile $180\\text{ cm}^2$ arasındadır. Bu panonun çevre uzunluğu kaç santimetredir?',
      options: ['48', '52', '56', '60'],
      correct_index: 1,
      question_type: 'multiple_choice',
      outcome: 'LGS Kareköklü İfadeler & Tam Kare Doğal Sayılar',
      explanation:
        "Alanı $a^2$ olan karenin kenarı tam sayı ise $150 < a^2 < 180$ aralığındaki tam kare sayı $169 = 13^2$'dir. Kenar uzunluğu $a = 13\\text{ cm}$, çevre uzunluğu ise $4 \\times 13 = 52\\text{ cm}$ olur.",
    },
    {
      id: 'g8-2',
      grade: 8,
      question:
        'Bir laboratuvar incelemesinde mikroorganizmanın kütlesi $0,0000048\\text{ gram}$ olarak ölçülmüştür. Bu kütlenin kilogram cinsinden bilimsel gösterimi aşağıdakilerden hangisidir? ($1\\text{ kg} = 1000\\text{ g}$)',
      options: [
        '4,8 \\times 10^{-6}',
        '4,8 \\times 10^{-8}',
        '4,8 \\times 10^{-9}',
        '48 \\times 10^{-10}',
      ],
      correct_index: 2,
      question_type: 'multiple_choice',
      outcome: 'LGS Çok Küçük Sayıların Bilimsel Gösterimi',
      explanation:
        "$0,0000048\\text{ g} = 4,8 \\times 10^{-6}\\text{ g}$. Kilograma çevirmek için $1000 = 10^3$'e böleriz: $\\frac{4,8 \\times 10^{-6}}{10^3} = 4,8 \\times 10^{-9}\\text{ kg}$ olur.",
    },
    {
      id: 'g8-3',
      grade: 8,
      question:
        'Alanı $108\\text{ cm}^2$ olan dikdörtgen şeklindeki bir resim çerçevesinin kısa kenar uzunluğu $\\sqrt{12}\\text{ cm}$ olduğuna göre bu çerçevenin çevre uzunluğu kaç santimetredir? ($a\\sqrt{b}$ biçiminde en sade haliyle yazınız)',
      options: [],
      correct_index: 0,
      question_type: 'short_answer',
      expected_answer: '40√3|40\\sqrt{3}|40 kök 3|40 kok 3',
      rubric: [
        'Kısa kenarı kök dışına çıkararak 2√3 cm bulma (25 puan)',
        'Alanı kısa kenara bölüp uzun kenarı 18√3 cm hesaplama (40 puan)',
        'Çevre formülünü (2 * (kısa + uzun)) uygulayıp 40√3 cm olarak tamamlama (35 puan)',
      ],
      outcome:
        'MEB Ortak Yazılı Uyumlu Kareköklü Sayılarda Çarpma/Bölme & Çevre',
      explanation:
        'Kısa kenar: $\\sqrt{12} = 2\\sqrt{3}\\text{ cm}$. Uzun kenar: $108 \\div 2\\sqrt{3} = \\frac{54}{\\sqrt{3}} = 18\\sqrt{3}\\text{ cm}$. Çevre: $2 \\times (2\\sqrt{3} + 18\\sqrt{3}) = 2 \\times 20\\sqrt{3} = 40\\sqrt{3}\\text{ cm}$ olur.',
    },
  ],
};
