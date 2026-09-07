/**
 * Zengin metin izin verilen HTML etiket ve öznitelik sabitleri.
 * DOMPurify süzgeci bu güvenli beyaz listeyi (allowlist) esas alır.
 */
export const RICH_TEXT_ALLOWED_TAGS = [
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

export const RICH_TEXT_ALLOWED_ATTR = ['href', 'rel', 'target'];
