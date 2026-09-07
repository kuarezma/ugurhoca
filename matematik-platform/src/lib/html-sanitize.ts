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
 * Yalnızca tarayıcıda çalışır — DOMPurify istemci tarafında zengin metinleri
 * temizlemek ve XSS açıklarını engellemek için kullanılır.
 */
export function sanitizeRichTextHtml(html: string) {
  if (typeof window === 'undefined') {
    throw new Error(
      'sanitizeRichTextHtml yalnızca tarayıcı ortamında çalışır (DOMPurify penceresiz ortamda işlevsizdir).',
    );
  }

  return DOMPurify.sanitize(html, {
    ALLOWED_ATTR: RICH_TEXT_ALLOWED_ATTR,
    ALLOWED_TAGS: RICH_TEXT_ALLOWED_TAGS,
  });
}
