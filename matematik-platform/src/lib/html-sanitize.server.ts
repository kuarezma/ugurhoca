import 'server-only';

import DOMPurify, { type WindowLike } from 'dompurify';
import { JSDOM } from 'jsdom';
import {
  RICH_TEXT_ALLOWED_ATTR,
  RICH_TEXT_ALLOWED_TAGS,
} from '@/lib/html-sanitize-config';

/**
 * DOMPurify penceresiz ortamda (Node) çağrıldığında kendisini bir factory
 * olarak döner (`isSupported: false`, `.sanitize` tanımsız) — gerçek bir
 * pencere ile yeniden çağrılmadıkça işlevsizdir. jsdom, DOMPurify'ın
 * ihtiyaç duyduğu minimal DOM'u sağlar. Tek bir jsdom penceresi process
 * ömrü boyunca yeniden kullanılır; her çağrıda yeni pencere kurmak gereksiz
 * maliyetlidir ve DOMPurify zaten her `sanitize()` çağrısında iç durumunu
 * sıfırlar.
 */
const serverPurify = DOMPurify(new JSDOM('').window as unknown as WindowLike);

if (typeof serverPurify.addHook === 'function') {
  serverPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A' && node.getAttribute('target')) {
      node.setAttribute('rel', 'noopener noreferrer');
    }
  });
}

/**
 * `@/lib/html-sanitize`'ın sunucu tarafında (Route Handler, Server
 * Component, Server Action) çalışan eşdeğeri. Aynı izin listesini
 * paylaşır — politika istemci/sunucu arasında sapmaz.
 */
export function sanitizeRichTextHtml(html: string) {
  return serverPurify.sanitize(html, {
    ALLOWED_ATTR: RICH_TEXT_ALLOWED_ATTR,
    ALLOWED_TAGS: RICH_TEXT_ALLOWED_TAGS,
  });
}
