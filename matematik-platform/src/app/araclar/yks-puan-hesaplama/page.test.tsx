import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import YksCalculatorRoute from './page';

describe('YksCalculatorRoute structured data', () => {
  it('emits a single FAQPage whose questions are visible on the page', () => {
    const { container } = render(<YksCalculatorRoute />);

    const faqPages = Array.from(
      container.querySelectorAll('script[type="application/ld+json"]'),
      (script) => JSON.parse(script.textContent ?? '{}'),
    ).filter((data) => data['@type'] === 'FAQPage');

    expect(faqPages).toHaveLength(1);
    for (const question of faqPages[0].mainEntity) {
      expect(container.textContent).toContain(question.name);
    }
  });
});
