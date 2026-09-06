import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import FloatingShapes from './FloatingShapes';

describe('FloatingShapes Component', () => {
  it('motion-reduce:hidden sınıfını içeren container ile render edilir', () => {
    const { container } = render(<FloatingShapes count={6} showSymbols={true} />);
    const wrapper = container.querySelector('.motion-reduce\\:hidden');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveAttribute('aria-hidden', 'true');
  });
});
