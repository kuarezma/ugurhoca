/**
 * `html-sanitize.ts` (istemci) ve `html-sanitize.server.ts` (sunucu) aynı
 * politikayı paylaşmalı — aksi halde bir tarafta izin verilen bir etiket
 * diğer tarafta süzülür ve render sonucu ortama göre değişir. Bu dosya salt
 * sabit içerir, DOM/jsdom bağımlılığı taşımaz; her iki paket için de güvenli.
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
