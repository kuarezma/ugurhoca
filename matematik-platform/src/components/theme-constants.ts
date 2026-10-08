export const THEME_STORAGE_KEY = 'ugurhoca-theme';
export const PALETTE_STORAGE_KEY = 'ugurhoca-palette';
export const DESIGN_MODE_STORAGE_KEY = 'ugurhoca-design-mode';

export type DesignMode = 'classic' | 'adventure';
export const DEFAULT_DESIGN_MODE: DesignMode = 'classic';

export type ThemePalette = 'classic' | 'ocean' | 'emerald' | 'sunset' | 'midnight';
export const DEFAULT_PALETTE: ThemePalette = 'classic';

export interface ThemePaletteInfo {
  id: ThemePalette;
  name: string;
  description: string;
  previewColor: string;
  previewSecondary: string;
}

export const THEME_PALETTES: ThemePaletteInfo[] = [
  {
    id: 'classic',
    name: 'Klasik Mor (Nebula)',
    description: 'Uğur Hoca orijinal tema: Mor ve fuchsia aksanları.',
    previewColor: '#7c3aed',
    previewSecondary: '#06b6d4',
  },
  {
    id: 'ocean',
    name: 'Okyanus (Derin Mavi)',
    description: 'Mavi ve turkuaz tonları: Dikkat toplayan, dinlendirici odak.',
    previewColor: '#2563eb',
    previewSecondary: '#06b6d4',
  },
  {
    id: 'emerald',
    name: 'Zümrüt (Doğa Yeşili)',
    description: 'Zümrüt ve nane tonları: Sınav stresini azaltan taze hava.',
    previewColor: '#059669',
    previewSecondary: '#14b8a6',
  },
  {
    id: 'sunset',
    name: 'Gün Batımı (Kehribar)',
    description: 'Sıcak turuncu ve mercan tonları: Yüksek enerji ve dinamizm.',
    previewColor: '#d97706',
    previewSecondary: '#f43f5e',
  },
  {
    id: 'midnight',
    name: 'AMOLED Gece (Saf Siyah)',
    description: 'Koyu siyah zeminler ve neon indigo: Maksimum netlik ve kontrast.',
    previewColor: '#6366f1',
    previewSecondary: '#a855f7',
  },
];
