import type { ExitTicketQuestion } from '../types';

export interface ExitTicketTemplate {
  id: string;
  title: string;
  grade: number;
  subject: string;
  questions: ExitTicketQuestion[];
}

export const EXIT_TICKET_TEMPLATES: ExitTicketTemplate[] = [
  {
    id: 'fractions-misconceptions',
    title: 'Kesirlerde Dört İşlem & Kavram Yanılgıları',
    grade: 6,
    subject: 'Kesirler',
    questions: [
      {
        id: 'frac-q1',
        orderIndex: 0,
        prompt: '$\\frac{1}{2} + \\frac{1}{3}$ işleminin sonucu kaçtır?',
        options: ['$\\frac{2}{5}$', '$\\frac{5}{6}$', '$\\frac{1}{5}$', '$\\frac{2}{6}$'],
        correctIndex: 1,
        explanation: 'Paydalar eşitlenmelidir: $\\frac{3}{6} + \\frac{2}{6} = \\frac{5}{6}$.',
        distractorExplanations: {
          0: '⚠️ Kavram Yanılgısı: Payları ve paydaları doğrudan birbirleriyle topladın! Kesirlerde toplama yaparken paydalar eşitlenmelidir.',
          2: '⚠️ Yanılgı: Payı sabit tutup paydaları topladın. Kesirlerde paydalar ortak paydaya dönüştürülmelidir.',
          3: '⚠️ Yanılgı: Payları topladın ama paydaları çarparak ortak paydaya yazmadın.',
        },
      },
      {
        id: 'frac-q2',
        orderIndex: 1,
        prompt: '$\\frac{2}{3} \\times \\frac{3}{4}$ işleminin en sade sonucu kaçtır?',
        options: ['$\\frac{1}{2}$', '$\\frac{5}{7}$', '$\\frac{8}{9}$', '$\\frac{6}{7}$'],
        correctIndex: 0,
        explanation: 'Paylar çarpımı paya, paydalar çarpımı paydaya yazılır: $\\frac{6}{12} = \\frac{1}{2}$.',
        distractorExplanations: {
          1: '⚠️ Kavram Yanılgısı: Çarpma yaparken payları ve paydaları topladın!',
          2: '⚠️ Yanılgı: Çapraz çarpım yaptın; kesirlerde çarpma karşılıklı yapılır.',
          3: '⚠️ Yanılgı: Payları çarpıp paydaları topladın.',
        },
      },
      {
        id: 'frac-q3',
        orderIndex: 2,
        prompt: '$2 \\frac{1}{3}$ tam sayılı kesrinin bileşik kesir hali hangisidir?',
        options: ['$\\frac{5}{3}$', '$\\frac{7}{3}$', '$\\frac{3}{3}$', '$\\frac{6}{3}$'],
        correctIndex: 1,
        explanation: 'Tam kısım ile payda çarpılır, pay eklenir: $(2 \\times 3) + 1 = 7$, payda aynen kalır $\\frac{7}{3}$.',
        distractorExplanations: {
          0: '⚠️ Kavram Yanılgısı: Tam kısım ile paydayı toplayıp payı çarptın!',
          2: '⚠️ Yanılgı: Tam kısmı göz ardı ettin.',
          3: '⚠️ Yanılgı: Yalnızca tam kısım ile paydayı çarptın, paydaki 1 sayısını eklemeyi unuttun.',
        },
      },
    ],
  },
  {
    id: 'lgs-exponents-roots',
    title: 'Üslü & Kareköklü İfadeler Hızlı Teşhis',
    grade: 8,
    subject: 'LGS Matematik',
    questions: [
      {
        id: 'exp-q1',
        orderIndex: 0,
        prompt: '$-3^2$ ve $(-3)^2$ ifadelerinin değerleri sırasıyla hangisidir?',
        options: ['$-9$ ve $9$', '$9$ ve $9$', '$-9$ ve $-9$', '$9$ ve $-9$'],
        correctIndex: 0,
        explanation: 'Parantez olmadığında üs yalnızca sayıya aittir: $-3^2 = -(3 \\times 3) = -9$. Parantez çift üssü kapsadığında $(-3)^2 = 9$ olur.',
        distractorExplanations: {
          1: '⚠️ Kavram Yanılgısı: Çift üssün her zaman pozitif yapacağını varsaydın; parantez yoksa eksi işareti korunur!',
          2: '⚠️ Yanılgı: Parantez içindeki negatif sayının çift kuvvetinin de negatif kalacağını düşündün.',
          3: '⚠️ Yanılgı: Parantez kurallarını tam tersi olarak uyguladın.',
        },
      },
      {
        id: 'root-q2',
        orderIndex: 1,
        prompt: '$\\sqrt{16 + 9}$ ifadesinin eşiti kaçtır?',
        options: ['$5$', '$7$', '$25$', '$\\sqrt{7}$'],
        correctIndex: 0,
        explanation: 'Kök içindeki toplama işlemi önce yapılır: $\\sqrt{16+9} = \\sqrt{25} = 5$.',
        distractorExplanations: {
          1: '⚠️ Klasik Kavram Yanılgısı: $\\sqrt{a+b} \\neq \\sqrt{a} + \\sqrt{b}$! Kökleri ayrı ayrı çıkarıp $4+3=7$ dedin. Toplama önce kök içinde yapılmalıdır!',
          2: '⚠️ Yanılgı: Kök işaretini hesaba katmadın.',
          3: '⚠️ Yanılgı: Kök içindeki sayıları birbirinden çıkardın.',
        },
      },
      {
        id: 'ebob-q3',
        orderIndex: 2,
        prompt: 'Aralarında asal iki pozitif tam sayının EBOB\'u ile EKOK\'unun çarpımı 60 ise bu iki sayı hangisi olabilir?',
        options: ['$3$ ve $20$', '$6$ ve $10$', '$2$ ve $30$', '$4$ ve $15$'],
        correctIndex: 0,
        explanation: 'Aralarında asal sayıların EBOB\'u 1, EKOK\'u çarpımlarıdır. $a \\times b = 60$. $3$ ve $20$ aralarında asaldır. ($4$ ve $15$ de olabilir ancak seçeneklerde $3$ ve $20$ yer alır).',
        distractorExplanations: {
          1: '⚠️ Kavram Yanılgısı: $6$ ve $10$ sayılarının ikisi de $2$\'ye bölünür, yani aralarında asal DEĞİLDİR!',
          2: '⚠️ Yanılgı: $2$ ve $30$ sayılarının ortak böleni $2$\'dir, aralarında asal değildir.',
        },
      },
    ],
  },
];
