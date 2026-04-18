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

export function sanitizeRichTextHtml(html: string) {
  return DOMPurify.sanitize(html, {
    ALLOWED_ATTR: RICH_TEXT_ALLOWED_ATTR,
    ALLOWED_TAGS: RICH_TEXT_ALLOWED_TAGS,
  });
}
