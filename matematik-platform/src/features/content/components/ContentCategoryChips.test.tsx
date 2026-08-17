import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ContentCategoryChips } from './ContentCategoryChips';

describe('ContentCategoryChips', () => {
  it('renders grade and type chips and handles selection', () => {
    const onSelectGrade = vi.fn();
    const onSelectType = vi.fn();

    render(
      <ContentCategoryChips
        selectedGrade="8"
        selectedType="yaprak-test"
        onSelectGrade={onSelectGrade}
        onSelectType={onSelectType}
      />,
    );

    expect(screen.getByText('Sınıf Seviyesi')).toBeInTheDocument();
    expect(screen.getByText('İçerik Türü')).toBeInTheDocument();

    const gradeChip = screen.getByRole('button', { name: '8. Sınıf (LGS)' });
    expect(gradeChip).toBeInTheDocument();

    const typeChip = screen.getByRole('button', { name: 'Ders Notları' });
    fireEvent.click(typeChip);
    expect(onSelectType).toHaveBeenCalledWith('ders-notu');

    const grade12Chip = screen.getByRole('button', { name: '12. Sınıf (YKS)' });
    fireEvent.click(grade12Chip);
    expect(onSelectGrade).toHaveBeenCalledWith('12');
  });
});
