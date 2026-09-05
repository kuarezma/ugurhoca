import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MathText from './MathText';

describe('MathText', () => {
  it('renders plain text directly without math wrapper', () => {
    const { container } = render(<MathText>Merhaba dünya!</MathText>);
    expect(container.textContent).toBe('Merhaba dünya!');
    expect(container.querySelector('.katex')).toBeNull();
  });

  it('renders inline math with KaTeX and MathML accessible structure', () => {
    const { container } = render(<MathText>Kenar uzunluğu $a^2 + b^2 = c^2$ formülüdür.</MathText>);

    // Check that KaTeX root container exists
    const katexEl = container.querySelector('.katex');
    expect(katexEl).not.toBeNull();

    // Check that MathML accessible node exists for screen readers
    const mathmlEl = container.querySelector('.katex-mathml');
    expect(mathmlEl).not.toBeNull();
    expect(mathmlEl?.querySelector('math')).not.toBeNull();
  });

  it('renders display block math with KaTeX and MathML', () => {
    const { container } = render(<MathText>{'$$\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$'}</MathText>);

    const displaySpan = container.querySelector('.block');
    expect(displaySpan).not.toBeNull();

    const mathmlEl = container.querySelector('.katex-mathml math');
    expect(mathmlEl).not.toBeNull();
  });

  it('renders custom HTML tags using the "as" prop', () => {
    render(<MathText as="h3">Başlık Metni</MathText>);
    const heading = screen.getByText('Başlık Metni');
    expect(heading.tagName.toLowerCase()).toBe('h3');
  });
});
