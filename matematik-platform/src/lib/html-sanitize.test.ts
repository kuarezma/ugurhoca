import { sanitizeRichTextHtml } from '@/lib/html-sanitize';

describe('html-sanitize', () => {
  it('removes unsafe tags and attributes while keeping supported rich text', () => {
    const sanitized = sanitizeRichTextHtml(
      '<script>alert(1)</script><p onclick="evil()">Merhaba <strong>dunya</strong> <a href="https://example.com" target="_blank" rel="noreferrer" data-id="x">link</a></p><img src="x" />',
    );

    expect(sanitized).not.toContain('<script');
    expect(sanitized).not.toContain('onclick=');
    expect(sanitized).not.toContain('<img');
    expect(sanitized).toContain('<strong>dunya</strong>');
    expect(sanitized).toContain('href="https://example.com"');
  });
});
