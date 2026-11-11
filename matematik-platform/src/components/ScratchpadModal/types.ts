export type ScratchpadQuestionContext = {
  questionText: string;
  options?: string[];
  imageUrl?: string | null;
  questionId?: string;
};

export type ScratchpadDocumentContext = {
  documentId?: string;
  title: string;
  fileUrl?: string | null;
  driveId?: string | null;
  type?: string | null;
  answerKeyText?: string | null;
};

export type ScratchpadModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  questionContext?: ScratchpadQuestionContext;
  documentContext?: ScratchpadDocumentContext;
};

export type ToolType = 'pen' | 'highlighter' | 'line' | 'eraser';

export type BackgroundPattern =
  | 'dark'
  | 'grid'
  | 'dot'
  | 'lined'
  | 'isometric'
  | 'coordinate';

export const PATTERN_NAMES: Record<BackgroundPattern, string> = {
  grid: 'Kareli',
  dot: 'Noktalı (Geoboard)',
  lined: 'Çizgili',
  isometric: 'İzometrik 3D',
  coordinate: 'Koordinat',
  dark: 'Düz Tahta',
};

export const DARK_PALETTE = [
  { id: 'yellow', label: 'Sarı', value: '#facc15' },
  { id: 'white', label: 'Beyaz', value: '#f8fafc' },
  { id: 'cyan', label: 'Turkuaz', value: '#06b6d4' },
  { id: 'pink', label: 'Pembe', value: '#ec4899' },
  { id: 'emerald', label: 'Yeşil', value: '#22c55e' },
  { id: 'purple', label: 'Mor', value: '#a78bfa' },
];

export const LIGHT_PALETTE = [
  { id: 'ink', label: 'Lacivert', value: '#1e3a8a' },
  { id: 'black', label: 'Mürekkep Siyah', value: '#0f172a' },
  { id: 'blue', label: 'Mavi Kalem', value: '#2563eb' },
  { id: 'red', label: 'Kırmızı Kalem', value: '#dc2626' },
  { id: 'emerald', label: 'Zümrüt Yeşili', value: '#16a34a' },
  { id: 'purple', label: 'Mor Kalem', value: '#7c3aed' },
];

export function hexToRgba(hex: string, alpha: number): string {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return hex;
}
