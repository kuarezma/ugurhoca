export type VisualProofTab =
  | 'pythagoras'
  | 'difference_of_squares'
  | 'trig_identity'
  | 'pascal_binomial'
  | 'circle_sector';

export type VisualMathProofsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  isLight?: boolean;
  initialTab?: VisualProofTab;
  studentName?: string;
};
