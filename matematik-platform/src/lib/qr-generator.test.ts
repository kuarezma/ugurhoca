import { describe, it, expect } from 'vitest';
import { encodeQRCode, generateQRCodeSVG } from './qr-generator';

describe('qr-generator', () => {
  it('encodes a simple URL to a boolean matrix', () => {
    const url = 'https://www.ugurhoca.com/testler?quizId=test-123';
    const matrix = encodeQRCode(url);
    expect(matrix).toBeDefined();
    expect(matrix.length).toBeGreaterThanOrEqual(21);
    expect(matrix[0].length).toBe(matrix.length);
    // Finder pattern (top-left 7x7 corner check)
    expect(matrix[0][0]).toBe(true);
    expect(matrix[0][6]).toBe(true);
    expect(matrix[6][0]).toBe(true);
    expect(matrix[6][6]).toBe(true);
  });

  it('generates an SVG string with valid dimensions and paths', () => {
    const text = 'https://www.ugurhoca.com/testler?quizId=42';
    const svg = generateQRCodeSVG(text, { size: 100 });
    expect(svg).toContain('<svg');
    expect(svg).toContain('width="100"');
    expect(svg).toContain('height="100"');
    expect(svg).toContain('<rect');
    expect(svg).toContain('<path');
  });
});
