import DOMPurify from 'dompurify';

const RICH_TEXT_ALLOWED_TAGS = [
  'a',
  'b',
  'br',
  'div',
  'em',
  'h1',
  'h2',
  'h3',
  'i',
  'li',
  'ol',
  'p',
  'span',
  'strong',
  'u',
  'ul',
];

const RICH_TEXT_ALLOWED_ATTR = ['href', 'rel', 'target'];

// target taşıyan bağlantılarda reverse-tabnabbing'i engelle. Sunucu SSR'ında
// DOMPurify işlevsel değilse (window yok) addHook atlanır; sanitize zaten no-op'tur.
if (typeof DOMPurify.addHook === 'function') {
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A' && node.getAttribute('target')) {
      node.setAttribute('rel', 'noopener noreferrer');
    }
  });
}

export function sanitizeRichTextHtml(html: string) {
  return DOMPurify.sanitize(html, {
    ALLOWED_ATTR: RICH_TEXT_ALLOWED_ATTR,
    ALLOWED_TAGS: RICH_TEXT_ALLOWED_TAGS,
  });
}
