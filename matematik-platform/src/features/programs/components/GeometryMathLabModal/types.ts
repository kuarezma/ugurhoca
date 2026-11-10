export type LabTab = 'pythagoras' | 'circle' | 'parabola' | 'slope';

export type GeometryMathLabModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: LabTab;
};
