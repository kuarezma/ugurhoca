import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import { AccessibleMathFormula } from './AccessibleMathFormula';

describe('AccessibleMathFormula', () => {
  it('renders speechLabel in aria-label and sr-only container', () => {
    const { container } = render(
      <AccessibleMathFormula speechLabel="a kare artı b kare eşittir c kare">
        <span className="visual-math">a² + b² = c²</span>
      </AccessibleMathFormula>
    );

    const mathWrapper = container.querySelector('[role="math"]');
    expect(mathWrapper).toBeInTheDocument();
    expect(mathWrapper).toHaveAttribute('aria-label', 'a kare artı b kare eşittir c kare');
    expect(screen.getByText('a kare artı b kare eşittir c kare')).toHaveClass('sr-only');
    expect(screen.getByText('a² + b² = c²')).toBeInTheDocument();
  });

  it('renders visual fallback string when children is not provided', () => {
    render(
      <AccessibleMathFormula
        speechLabel="karekök 16 eşittir 4"
        visualFormula="√16 = 4"
      />
    );

    expect(screen.getByText('√16 = 4')).toBeInTheDocument();
  });
});
