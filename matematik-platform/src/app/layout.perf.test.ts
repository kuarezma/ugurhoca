import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const read = (relativePath: string) =>
  readFileSync(path.join(process.cwd(), relativePath), 'utf8');

describe('kök layout kritik yol', () => {
  it('ağır stil sayfalarını global CSS olarak import etmez', () => {
    // Regresyon: kök layout'tan import edilen her stil sayfası TÜM rotalarda
    // render'ı bloke eden CSS'e girer. KaTeX (23 KB) yalnızca matematik render
    // eden bileşenlerde, LiveKit stilleri yalnızca canlı ders odasında gerekli.
    const layout = read('src/app/layout.tsx');

    expect(layout).not.toMatch(/import\s+["']katex\/dist\/katex\.min\.css["']/);
    expect(layout).not.toMatch(/import\s+["']@livekit\/components-styles["']/);
  });

  it('KaTeX stilleri onu gerçekten kullanan modülle birlikte yüklenir', () => {
    expect(read('src/components/MathText.tsx')).toMatch(
      /import\s+["']katex\/dist\/katex\.min\.css["']/,
    );
  });

  it('LiveKit stilleri canlı ders odası chunk’ına bağlıdır', () => {
    expect(
      read('src/features/live-lessons/components/room/RoomExperience.tsx'),
    ).toMatch(/import\s+["']@livekit\/components-styles["']/);
  });

  it('SupportChatPanel her sayfada yüklenen chunk’lara statik girmez', () => {
    // ChatBubble kök layout üzerinden her sayfada yükleniyor. SupportChatPanel
    // (1300+ satır) MathText üzerinden KaTeX'i de beraberinde getirdiği için
    // statik import edilirse panel hiç açılmasa bile bu ağırlık ödenir.
    for (const file of [
      'src/components/ChatBubble.tsx',
      'src/features/home/components/HomeNavbarMessagesButton.tsx',
    ]) {
      const source = read(file);

      expect(source).not.toMatch(
        /^import \{[^}]*SupportChatPanel[^}]*\} from/m,
      );
      expect(source).toMatch(
        /import\(\s*['"]@\/features\/messages\/components\/SupportChatPanel['"]\s*\)/,
      );
    }
  });

  it('global-error Sentry SDK’sini statik import etmez', () => {
    // Statik import edilirse SDK çekirdeği her sayfa paketine girer.
    const globalError = read('src/app/global-error.tsx');

    expect(globalError).not.toMatch(/^import .*@sentry\/nextjs/m);
    expect(globalError).toMatch(/import\(['"]@sentry\/nextjs['"]\)/);
  });
});

describe('istemci router önbelleği', () => {
  it('staleTimes.dynamic sıfırdan büyük ayarlanmıştır', () => {
    // Next varsayılanı 0: dinamik rotalarda sekmeye her dönüşte tam RSC isteği
    // yapılır. Pozitif bir değer, sekmeler arası gidiş-gelişi sunucuya
    // uğramadan anında yapar.
    const config = read('next.config.js');
    const match = config.match(/staleTimes:\s*\{[^}]*dynamic:\s*(\d+)/);

    expect(match).not.toBeNull();
    expect(Number(match?.[1])).toBeGreaterThan(0);
  });
});
