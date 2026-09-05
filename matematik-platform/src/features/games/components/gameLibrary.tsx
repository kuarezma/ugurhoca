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
import { BalloonPop } from './games/BalloonPop';
import { Boxes, Car, ChefHat, Compass, Hammer } from 'lucide-react';
import { FloatingParticles } from './FloatingParticles';
import { GameCard } from './GameCard';
import { ColorMath } from './games/ColorMath';
import { Hangman } from './games/Hangman';
import { MatMatik } from './games/MatMatik';
import { MathNinja } from './games/MathNinja';
import { MathPuzzle } from './games/MathPuzzle';
import { MemoryGame } from './games/MemoryGame';
import { MoleWhack } from './games/MoleWhack';
import { MultiplicationRace } from './games/MultiplicationRace';
import { EquationHunter } from './games/EquationHunter';
import { FractionDuel } from './games/FractionDuel';
import { NumberPuzzle } from './games/NumberPuzzle';
import { PercentStorm } from './games/PercentStorm';
import { PizzaChef } from './games/PizzaChef';
import { SpaceRocket } from './games/SpaceRocket';
import { SpeedRacer } from './games/SpeedRacer';
import { TowerBlock } from './games/TowerBlock';
import { TreasurePirate } from './games/TreasurePirate';
import { MathDuel } from './games/MathDuel';
import type { GameDefinition } from '../types';

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
