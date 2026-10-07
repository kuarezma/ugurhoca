import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'postcss';
import { describe, expect, it } from 'vitest';
import tailwindConfig from '../../tailwind.config';
import { contrastRatio, type RGBColor } from './color-contrast';

const stylesheet = parse(
  readFileSync(resolve(process.cwd(), 'src/app/globals.css'), 'utf8'),
);

// Gerçek CSS değerlerini okur; token değişirse test eski bir kopyayı ölçmez.
function themeTokens(
  theme: 'light' | 'dark',
  palette?: 'emerald',
): Map<string, string> {
  const tokens = new Map<string, string>();
  const selectors = [':root'];
  if (theme === 'light') selectors.push("html[data-theme='light']");
  if (palette) {
    selectors.push(`html[data-palette='${palette}']`);
    selectors.push(`html[data-theme='${theme}'][data-palette='${palette}']`);
  }
  for (const selector of selectors) {
    stylesheet.walkRules(selector, (rule) => {
      rule.walkDecls((declaration) => {
        tokens.set(declaration.prop, declaration.value);
      });
    });
  }
  return tokens;
}

function tokenColor(tokens: Map<string, string>, token: string): RGBColor {
  function resolveValue(value: string): string {
    return value.replace(/var\((--[\w-]+)\)/g, (_, name: string) => {
      const nested = tokens.get(name);
      if (!nested) throw new Error(`Eksik tema tokenı: ${name}`);
      return resolveValue(nested);
    });
  }
  const value = resolveValue(tokens.get(token) ?? token);
  if (/^#[\da-f]{6}$/i.test(value)) {
    return [
      Number.parseInt(value.slice(1, 3), 16),
      Number.parseInt(value.slice(3, 5), 16),
      Number.parseInt(value.slice(5, 7), 16),
    ];
  }
  const match = /^rgb\((\d+) (\d+) (\d+)\)$/.exec(value);
  if (!match) throw new Error(`Desteklenmeyen test rengi: ${value}`);
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function blend(
  foreground: RGBColor,
  background: RGBColor,
  alpha: number,
): RGBColor {
  const channel = (index: number) =>
    foreground[index] * alpha + background[index] * (1 - alpha);
  return [channel(0), channel(1), channel(2)];
}

describe('WCAG kontrast hesabı', () => {
  it('siyah/beyaz, aynı renk ve bilinen yeşil çiftini hesaplar', () => {
    expect(contrastRatio([0, 0, 0], [255, 255, 255])).toBe(21);
    expect(contrastRatio([43, 122, 0], [43, 122, 0])).toBe(1);
    expect(contrastRatio([43, 122, 0], [255, 255, 255])).toBeCloseTo(5.4, 2);
    expect(contrastRatio([255, 255, 255], [43, 122, 0])).toBeCloseTo(5.4, 2);
  });

  it('Tailwind metin yardımcılarını RGB tokenlarına bağlar', () => {
    expect(tailwindConfig.theme?.extend?.colors).toMatchObject({
      'green-ink': 'rgb(var(--green-ink-rgb) / <alpha-value>)',
      brand: { ink: 'rgb(var(--brand-primary-ink-rgb) / <alpha-value>)' },
    });
  });

  for (const theme of ['light', 'dark'] as const) {
    for (const palette of [undefined, 'emerald'] as const) {
      const tokens = themeTokens(theme, palette);
      const label = `${theme}/${palette ?? 'classic'}`;

      it(`${label}: küçük yeşil metin tüm tema yüzeylerinde AA sağlar`, () => {
        for (const foreground of [
          '--brand-primary-ink',
          '--accent-fg',
          '--accent-success-ink',
          'rgb(var(--green-ink-rgb))',
        ]) {
          for (const background of [
            '--surface-0',
            '--surface-1',
            '--surface-2',
            '--surface-3',
            '--surface-4',
          ]) {
            expect(
              contrastRatio(
                tokenColor(tokens, foreground),
                tokenColor(tokens, background),
              ),
              `${foreground}/${background}`,
            ).toBeGreaterThanOrEqual(4.5);
          }
        }
      });

      it(`${label}: yeşil zemin üzerinde metin AA ve ikonlar 3:1 sağlar`, () => {
        for (const background of [
          '--brand-primary',
          '--brand-primary-soft',
          '#58cc02',
          '#61e002',
          '#46a302',
          '#22c55e',
          '#16a34a',
          '#10b981',
          '#0d9488',
        ]) {
          for (const foreground of ['#0f172a', '#020617']) {
            const ratio = contrastRatio(
              tokenColor(tokens, foreground),
              tokenColor(tokens, background),
            );
            expect(ratio, `${foreground}/${background}`).toBeGreaterThanOrEqual(
              4.5,
            );
          }
        }
      });

      it(`${label}: karartılmış yeşil chip metni AA sağlar`, () => {
        expect(
          contrastRatio(
            tokenColor(tokens, '--primary-shade-fg'),
            blend([0, 0, 0], tokenColor(tokens, '--brand-primary'), 0.25),
          ),
        ).toBeGreaterThanOrEqual(4.5);
        // Canlı ders soru sayacı koyu temada %40 siyah katman kullanır.
        if (theme === 'dark') {
          expect(
            contrastRatio(
              [255, 255, 255],
              blend([0, 0, 0], tokenColor(tokens, '--brand-primary'), 0.4),
            ),
          ).toBeGreaterThanOrEqual(4.5);
        }
      });
    }

    it(`${theme}: saydam yeşil rozetlerin metni AA sağlar`, () => {
      const tokens = themeTokens(theme);
      for (const surface of ['--surface-1', '--surface-2', '--surface-3']) {
        const background = tokenColor(tokens, surface);
        for (const [foreground, tint] of [
          ['--tone-success-fg', '#58cc02'],
          ['--accent-success-ink', '#10b981'],
        ] as const) {
          for (const alpha of [0.1, 0.15, 0.2]) {
            expect(
              contrastRatio(
                tokenColor(tokens, foreground),
                blend(tokenColor(tokens, tint), background, alpha),
              ),
              `${foreground}/${surface}/${alpha}`,
            ).toBeGreaterThanOrEqual(4.5);
          }
        }
      }
    });
  }

  it('kasıtlı koyu oyun/tuval yüzeylerindeki parlak başarı metni AA sağlar', () => {
    for (const background of ['#020617', '#0f172a', '#1e293b']) {
      expect(
        contrastRatio([52, 211, 153], tokenColor(new Map(), background)),
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('oyun puanları yarı saydam siyah rozetlerde iki temada da AA sağlar', () => {
    for (const theme of ['light', 'dark'] as const) {
      const tokens = themeTokens(theme);
      const foreground: RGBColor =
        theme === 'light' ? [2, 6, 23] : [74, 222, 128];
      for (const surface of [
        '--surface-0',
        '--surface-1',
        '--surface-2',
        '--surface-3',
      ]) {
        expect(
          contrastRatio(
            foreground,
            blend([0, 0, 0], tokenColor(tokens, surface), 0.5),
          ),
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it('koyu yeşil hover zemininde beyaz metin AA sağlar', () => {
    expect(contrastRatio([255, 255, 255], [4, 120, 87])).toBeGreaterThanOrEqual(
      4.5,
    );
  });
});
