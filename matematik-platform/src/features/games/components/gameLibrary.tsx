'use client';

import {
  Calculator,
  CircleDot,
  Grid3x3,
  Link2,
  Palette,
  Percent,
  Puzzle,
  Rocket,
  Scale,
  Swords,
  Variable,
  WholeWord,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { Boxes, Car, ChefHat, Compass, Hammer } from 'lucide-react';
import { FloatingParticles } from './FloatingParticles';
import { GameCard } from './GameCard';
import type { GameDefinition } from '../types';

const BalloonPop = dynamic(() => import('./games/BalloonPop').then(m => ({ default: m.BalloonPop })), { ssr: false });
const ColorMath = dynamic(() => import('./games/ColorMath').then(m => ({ default: m.ColorMath })), { ssr: false });
const Hangman = dynamic(() => import('./games/Hangman').then(m => ({ default: m.Hangman })), { ssr: false });
const MatMatik = dynamic(() => import('./games/MatMatik').then(m => ({ default: m.MatMatik })), { ssr: false });
const MathNinja = dynamic(() => import('./games/MathNinja').then(m => ({ default: m.MathNinja })), { ssr: false });
const MathPuzzle = dynamic(() => import('./games/MathPuzzle').then(m => ({ default: m.MathPuzzle })), { ssr: false });
const MemoryGame = dynamic(() => import('./games/MemoryGame').then(m => ({ default: m.MemoryGame })), { ssr: false });
const MoleWhack = dynamic(() => import('./games/MoleWhack').then(m => ({ default: m.MoleWhack })), { ssr: false });
const MultiplicationRace = dynamic(() => import('./games/MultiplicationRace').then(m => ({ default: m.MultiplicationRace })), { ssr: false });
const EquationHunter = dynamic(() => import('./games/EquationHunter').then(m => ({ default: m.EquationHunter })), { ssr: false });
const FractionDuel = dynamic(() => import('./games/FractionDuel').then(m => ({ default: m.FractionDuel })), { ssr: false });
const NumberPuzzle = dynamic(() => import('./games/NumberPuzzle').then(m => ({ default: m.NumberPuzzle })), { ssr: false });
const PercentStorm = dynamic(() => import('./games/PercentStorm').then(m => ({ default: m.PercentStorm })), { ssr: false });
const PizzaChef = dynamic(() => import('./games/PizzaChef').then(m => ({ default: m.PizzaChef })), { ssr: false });
const SpaceRocket = dynamic(() => import('./games/SpaceRocket').then(m => ({ default: m.SpaceRocket })), { ssr: false });
const SpeedRacer = dynamic(() => import('./games/SpeedRacer').then(m => ({ default: m.SpeedRacer })), { ssr: false });
const TowerBlock = dynamic(() => import('./games/TowerBlock').then(m => ({ default: m.TowerBlock })), { ssr: false });
const TreasurePirate = dynamic(() => import('./games/TreasurePirate').then(m => ({ default: m.TreasurePirate })), { ssr: false });
const MathDuel = dynamic(() => import('./games/MathDuel').then(m => ({ default: m.MathDuel })), { ssr: false });

export { FloatingParticles, GameCard };
export type {
  GameComponentProps,
  GameDefinition,
  LeaderboardRow,
} from '../types';

export const games: GameDefinition[] = [
  {
    id: 1,
    title: 'Çarpım Tablosu',
    description: 'Çarpım tablosunu hızlıca öğren!',
    grade: '5-8',
    rating: 4.9,
    difficulty: 'Kolay',
    color: 'from-pink-500 to-purple-500',
    icon: Grid3x3,
    component: MultiplicationRace,
  },
  {
    id: 2,
    title: 'Matematik Zihin Jimnastiği',
    description: 'Zor problemleri çöz, seviye atla!',
    grade: '5-8',
    rating: 4.8,
    difficulty: 'Orta',
    color: 'from-purple-500 to-pink-500',
    icon: Puzzle,
    component: MathPuzzle,
  },
  {
    id: 3,
    title: 'Renkli Matematik',
    description: 'Renkleri oku, doğruyu bul!',
    grade: '5-8',
    rating: 4.7,
    difficulty: 'Zor',
    color: 'from-cyan-500 to-blue-500',
    icon: Palette,
    component: ColorMath,
  },
  {
    id: 4,
    title: 'Matematik Adam Asmaca',
    description: 'Matematik terimlerini tahmin et!',
    grade: '5-8',
    rating: 4.8,
    difficulty: 'Orta',
    color: 'from-indigo-500 to-purple-500',
    icon: WholeWord,
    component: Hangman,
  },
  {
    id: 5,
    title: 'Sayı Bulmaca',
    description: 'Eksik sayıyı bul, puan topla!',
    grade: '5-8',
    rating: 4.6,
    difficulty: 'Orta',
    color: 'from-amber-500 to-orange-500',
    icon: Calculator,
    component: NumberPuzzle,
  },
  {
    id: 6,
    title: 'Matematik Memory',
    description: 'Eşleşen sembolleri bul!',
    grade: '5-8',
    rating: 4.9,
    difficulty: 'Kolay',
    color: 'from-emerald-500 to-teal-500',
    icon: Link2,
    component: MemoryGame,
  },
  {
    id: 7,
    title: 'Kesir Düellosu',
    description: 'İki kesri karşılaştır — hangisi büyük?',
    grade: '6-8',
    rating: 4.5,
    difficulty: 'Zor',
    color: 'from-rose-500 to-red-600',
    icon: Scale,
    component: FractionDuel,
  },
  {
    id: 8,
    title: 'Denklem Avcısı',
    description: "x'i bul: parantez ve birleşik terimler.",
    grade: '6-8',
    rating: 4.4,
    difficulty: 'Zor',
    color: 'from-violet-600 to-indigo-700',
    icon: Variable,
    component: EquationHunter,
  },
  {
    id: 9,
    title: 'Yüzde Fırtınası',
    description: 'Oran, artış ve yüzde hesapları.',
    grade: '6-8',
    rating: 4.3,
    difficulty: 'Zor',
    color: 'from-sky-500 to-cyan-600',
    icon: Percent,
    component: PercentStorm,
  },
  {
    id: 10,
    title: 'MatMatik',
    description: 'Çarpımları işaretle, dört hücrelik diziyi tamamla.',
    grade: '5-8',
    rating: 4.8,
    difficulty: 'Orta',
    color: 'from-emerald-500 to-cyan-500',
    icon: Grid3x3,
    component: MatMatik,
  },
  {
    id: 11,
    title: 'Balon Patlatma',
    description: 'Doğru cevabın balonunu patlat!',
    grade: '5-8',
    rating: 4.9,
    difficulty: 'Kolay',
    color: 'from-pink-500 to-cyan-500',
    icon: CircleDot,
    component: BalloonPop,
  },
  {
    id: 12,
    title: 'Uzay Roketi',
    description: 'Roketi doğru cevap kapısına uçur!',
    grade: '6-8',
    rating: 4.9,
    difficulty: 'Orta',
    color: 'from-indigo-500 to-amber-500',
    icon: Rocket,
    component: SpaceRocket,
  },
  {
    id: 13,
    title: 'Pizza Ustası',
    description: 'Pizzanın istenen kesrini hazırla, fırına ver!',
    grade: '5-7',
    rating: 4.9,
    difficulty: 'Kolay',
    color: 'from-amber-500 to-red-500',
    icon: ChefHat,
    component: PizzaChef,
  },
  {
    id: 14,
    title: 'Matematik Ninja',
    description: 'Kurala uyan meyveleri dilimle, kombo patlat!',
    grade: '5-8',
    rating: 4.9,
    difficulty: 'Orta',
    color: 'from-rose-500 to-amber-500',
    icon: Swords,
    component: MathNinja,
  },
  {
    id: 15,
    title: 'Köstebek Avı',
    description: 'Doğru işlemin köstebeğine hızla çekiçle vur!',
    grade: '5-6',
    rating: 4.8,
    difficulty: 'Kolay',
    color: 'from-emerald-500 to-teal-600',
    icon: Hammer,
    component: MoleWhack,
  },
  {
    id: 16,
    title: 'Hızlı Şoför',
    description: 'İşlemi çöz, doğru şeride girip nitro kazan!',
    grade: '5-8',
    rating: 4.9,
    difficulty: 'Orta',
    color: 'from-cyan-500 to-blue-600',
    icon: Car,
    component: SpeedRacer,
  },
  {
    id: 17,
    title: 'Koordinat Korsanı',
    description: 'Pusulayı ayarla, koordinattaki hazineyi kaz!',
    grade: '6-8',
    rating: 4.8,
    difficulty: 'Orta',
    color: 'from-amber-600 to-yellow-500',
    icon: Compass,
    component: TreasurePirate,
  },
  {
    id: 18,
    title: 'Sayı Kulesi',
    description: 'Sayı örüntüsünü çöz, kuleyi bulutlara yükselt!',
    grade: '5-8',
    rating: 4.8,
    difficulty: 'Orta',
    color: 'from-indigo-500 to-purple-600',
    icon: Boxes,
    component: TowerBlock,
  },
  {
    id: 19,
    title: 'Matematik Düellosu',
    description: '1v1 hızlı işlem düellosu: süreyle yarış, kombo yap ve zirveye çık!',
    grade: '5-8',
    rating: 4.9,
    difficulty: 'Orta',
    color: 'from-amber-500 to-rose-500',
    icon: Swords,
    component: MathDuel,
  },
];
