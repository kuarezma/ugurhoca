import { sanitizeRichTextHtml } from '@/lib/html-sanitize.server';

// html-sanitize.test.ts client (DOMPurify) tarafını doğrular; bu dosya
// sunucu (jsdom destekli) tarafını doğrular. DOMPurify pencere olmadan
// `.sanitize` bile tanımlamayan bir factory'e dönüştüğü için (bkz.
// html-sanitize.ts'teki yorum), bu test regresyonu doğrudan yakalar:
// jsdom penceresi eksik/bozuksa `sanitize` çağrısı TypeError fırlatır.
describe('html-sanitize.server', () => {
  it('sunucuda (window olmadan) da script ve olay işleyicilerini temizler', () => {
    const sanitized = sanitizeRichTextHtml(
      '<script>alert(1)</script><p onclick="evil()">Merhaba <strong>dunya</strong> <a href="https://example.com" target="_blank" rel="noreferrer" data-id="x">link</a></p><img src="x" />',
    );

    expect(sanitized).not.toContain('<script');
    expect(sanitized).not.toContain('onclick=');
    expect(sanitized).not.toContain('<img');
    expect(sanitized).toContain('<strong>dunya</strong>');
    expect(sanitized).toContain('href="https://example.com"');
  });

  it('target="_blank" bağlantılarına rel="noopener noreferrer" ekler (reverse tabnabbing koruması)', () => {
    const sanitized = sanitizeRichTextHtml(
      '<a href="https://example.com" target="_blank">link</a>',
    );

    expect(sanitized).toContain('rel="noopener noreferrer"');
  });
});
