import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/components/AuthCookieSync', () => ({
  default: () => null,
}));

vi.mock('@/components/ThemeToggle', () => ({
  FloatingThemeToggle: () => null,
}));

vi.mock('next/dynamic', () => ({
  default: () => () => null,
}));

import { Providers } from './Providers';

describe('Providers Component', () => {
  it('children içeriğini ve MotionConfig sarmalayıcısını sorunsuz render eder', () => {
    render(
      <Providers>
        <div data-testid="test-child">İçerik Yüklendi</div>
      </Providers>,
    );

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('İçerik Yüklendi')).toBeInTheDocument();
  });
});
