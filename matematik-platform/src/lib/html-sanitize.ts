import DOMPurify from 'dompurify';
import {
  RICH_TEXT_ALLOWED_ATTR,
  RICH_TEXT_ALLOWED_TAGS,
} from '@/lib/html-sanitize-config';

// target taşıyan bağlantılarda reverse-tabnabbing'i engelle.
if (typeof DOMPurify.addHook === 'function') {
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A' && node.getAttribute('target')) {
      node.setAttribute('rel', 'noopener noreferrer');
    }
  });
}

/**
 * Yalnızca tarayıcıda çalışır — DOMPurify penceresiz ortamda (Node/SSR)
 * gerçek bir DOM'a erişemediği için no-op değil, `.sanitize` bile tanımsız
 * kalan bir factory döner ve çağrıldığında TypeError fırlatır. Sunucuda
 * kullanıcı HTML'i render eden bir yol gerekiyorsa `sanitizeRichTextHtml`'i
 * `@/lib/html-sanitize.server` dosyasından (jsdom destekli) içe aktarın.
 */
export function sanitizeRichTextHtml(html: string) {
  if (typeof window === 'undefined') {
    throw new Error(
      "sanitizeRichTextHtml yalnızca tarayıcıda çalışır (DOMPurify penceresiz ortamda işlevsizdir). " +
        "Sunucu tarafında kullanıcı HTML'i temizlemek için '@/lib/html-sanitize.server' modülündeki " +
        'sanitizeRichTextHtml fonksiyonunu kullanın.',
    );
  }

  return DOMPurify.sanitize(html, {
    ALLOWED_ATTR: RICH_TEXT_ALLOWED_ATTR,
    ALLOWED_TAGS: RICH_TEXT_ALLOWED_TAGS,
  });
}
