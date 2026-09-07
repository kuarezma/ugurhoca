import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';

const OPAQUE_WHITE = { red: 255, green: 255, blue: 255, alpha: 1 };
const SMALL_TEXT_THRESHOLD = 4.5;
const LARGE_TEXT_THRESHOLD = 3;
const BORDER_THRESHOLD = 3;

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function round(value) {
  return Math.round(value * 100) / 100;
}

function parseColorChannel(value) {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) return null;
  return value.endsWith('%')
    ? clamp((parsed / 100) * 255, 0, 255)
    : clamp(parsed, 0, 255);
}

function parseAlphaChannel(value) {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) return null;
  return value.endsWith('%') ? clamp(parsed / 100, 0, 1) : clamp(parsed, 0, 1);
}

/**
 * Converts a browser-computed CSS color into an RGBA object. Computed styles
 * normally use rgb()/rgba(), but color(srgb ...) is handled for modern engines.
 */
export function parseCssColor(value) {
  if (typeof value !== 'string') return null;

  const normalized = value.trim().toLowerCase();
  if (!normalized || normalized === 'transparent') {
    return { red: 0, green: 0, blue: 0, alpha: 0 };
  }

  const hex = normalized.match(/^#([0-9a-f]{3,8})$/i);
  if (hex) {
    const digits = hex[1];
    const expanded =
      digits.length === 3 || digits.length === 4
        ? [...digits].map((digit) => `${digit}${digit}`).join('')
        : digits;
    const red = Number.parseInt(expanded.slice(0, 2), 16);
    const green = Number.parseInt(expanded.slice(2, 4), 16);
    const blue = Number.parseInt(expanded.slice(4, 6), 16);
    const alpha =
      expanded.length === 8
        ? Number.parseInt(expanded.slice(6, 8), 16) / 255
        : 1;
    return { red, green, blue, alpha };
  }

  const rgb = normalized.match(/^rgba?\((.*)\)$/i);
  if (rgb) {
    const values = rgb[1]
      .replace('/', ' / ')
      .split(/[\s,]+/)
      .filter(Boolean);
    const slashIndex = values.indexOf('/');
    const channels =
      slashIndex >= 0 ? values.slice(0, slashIndex) : values.slice(0, 3);
    const alphaValue = slashIndex >= 0 ? values[slashIndex + 1] : values[3];
    if (channels.length !== 3) return null;

    const red = parseColorChannel(channels[0]);
    const green = parseColorChannel(channels[1]);
    const blue = parseColorChannel(channels[2]);
    const alpha = alphaValue === undefined ? 1 : parseAlphaChannel(alphaValue);
    if ([red, green, blue, alpha].some((channel) => channel === null))
      return null;
    return { red, green, blue, alpha };
  }

  const srgb = normalized.match(/^color\(srgb\s+(.+)\)$/i);
  if (srgb) {
    const values = srgb[1].replace('/', ' / ').split(/\s+/).filter(Boolean);
    const slashIndex = values.indexOf('/');
    const channels =
      slashIndex >= 0 ? values.slice(0, slashIndex) : values.slice(0, 3);
    const alphaValue = slashIndex >= 0 ? values[slashIndex + 1] : undefined;
    if (channels.length !== 3) return null;

    const red = Number.parseFloat(channels[0]);
    const green = Number.parseFloat(channels[1]);
    const blue = Number.parseFloat(channels[2]);
    const alpha = alphaValue === undefined ? 1 : parseAlphaChannel(alphaValue);
    if (![red, green, blue, alpha].every(Number.isFinite)) return null;
    return {
      red: clamp(red * 255, 0, 255),
      green: clamp(green * 255, 0, 255),
      blue: clamp(blue * 255, 0, 255),
      alpha,
    };
  }

  return null;
}

export function compositeColors(foreground, background) {
  const alpha = foreground.alpha + background.alpha * (1 - foreground.alpha);
  if (alpha === 0) return { red: 0, green: 0, blue: 0, alpha: 0 };

  return {
    red:
      (foreground.red * foreground.alpha +
        background.red * background.alpha * (1 - foreground.alpha)) /
      alpha,
    green:
      (foreground.green * foreground.alpha +
        background.green * background.alpha * (1 - foreground.alpha)) /
      alpha,
    blue:
      (foreground.blue * foreground.alpha +
        background.blue * background.alpha * (1 - foreground.alpha)) /
      alpha,
    alpha,
  };
}

function linearize(channel) {
  const normalized = channel / 255;
  return normalized <= 0.04045
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(color) {
  return (
    0.2126 * linearize(color.red) +
    0.7152 * linearize(color.green) +
    0.0722 * linearize(color.blue)
  );
}

export function contrastRatio(first, second) {
  const firstLuminance = relativeLuminance(first);
  const secondLuminance = relativeLuminance(second);
  return (
    (Math.max(firstLuminance, secondLuminance) + 0.05) /
    (Math.min(firstLuminance, secondLuminance) + 0.05)
  );
}

export function formatColor(color) {
  return `rgba(${Math.round(color.red)}, ${Math.round(color.green)}, ${Math.round(color.blue)}, ${round(color.alpha)})`;
}

function splitTopLevel(value) {
  const segments = [];
  let start = 0;
  let depth = 0;

  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    if (character === '(') depth += 1;
    if (character === ')') depth -= 1;
    if (character === ',' && depth === 0) {
      segments.push(value.slice(start, index).trim());
      start = index + 1;
    }
  }

  segments.push(value.slice(start).trim());
  return segments.filter(Boolean);
}

function extractGradientColors(value) {
  const matches =
    value.match(/rgba?\([^)]*\)|color\([^)]*\)|#[0-9a-f]{3,8}/gi) ?? [];
  return matches.map(parseCssColor).filter(Boolean);
}

function gradientDirection(value) {
  const content = value.slice(value.indexOf('(') + 1, -1);
  const firstSegment = splitTopLevel(content)[0]?.toLowerCase() ?? '';

  if (firstSegment.startsWith('to ')) {
    const horizontal = firstSegment.includes('right')
      ? 1
      : firstSegment.includes('left')
        ? -1
        : 0;
    const vertical = firstSegment.includes('bottom')
      ? 1
      : firstSegment.includes('top')
        ? -1
        : 0;
    const length = Math.hypot(horizontal, vertical) || 1;
    return { horizontal: horizontal / length, vertical: vertical / length };
  }

  const degrees = firstSegment.match(/^(-?[\d.]+)deg$/);
  if (degrees) {
    const radians = (Number.parseFloat(degrees[1]) * Math.PI) / 180;
    return { horizontal: Math.sin(radians), vertical: -Math.cos(radians) };
  }

  return { horizontal: 0, vertical: 1 };
}

function interpolateColor(first, second, progress) {
  return {
    red: first.red + (second.red - first.red) * progress,
    green: first.green + (second.green - first.green) * progress,
    blue: first.blue + (second.blue - first.blue) * progress,
    alpha: first.alpha + (second.alpha - first.alpha) * progress,
  };
}

function gradientProgress(element, point, direction) {
  const rect = element.getBoundingClientRect();
  const horizontalSpan = Math.abs(direction.horizontal) * rect.width;
  const verticalSpan = Math.abs(direction.vertical) * rect.height;
  const span = horizontalSpan + verticalSpan;
  if (span === 0) return 0.5;

  const horizontalOffset = point.x - rect.left - rect.width / 2;
  const verticalOffset = point.y - rect.top - rect.height / 2;
  const projection =
    horizontalOffset * direction.horizontal +
    verticalOffset * direction.vertical;
  return clamp((projection + span / 2) / span, 0, 1);
}

function resolveGradientLayer(layer, element, point) {
  if (!/^(?:repeating-)?linear-gradient\(/i.test(layer)) {
    return {
      color: null,
      reason: `desteklenmeyen_arka_plan:${layer.slice(0, 80)}`,
    };
  }

  const colors = extractGradientColors(layer);
  if (colors.length === 0) {
    return {
      color: null,
      reason: `renk_cozulemeyen_gradyan:${layer.slice(0, 80)}`,
    };
  }

  if (colors.length === 1) return { color: colors[0], approximate: false };

  const progress = gradientProgress(element, point, gradientDirection(layer));
  const position = progress * (colors.length - 1);
  const lowerIndex = Math.floor(position);
  const upperIndex = Math.min(lowerIndex + 1, colors.length - 1);
  return {
    color: interpolateColor(
      colors[lowerIndex],
      colors[upperIndex],
      position - lowerIndex,
    ),
    approximate: true,
  };
}

function resolveBackground(element, point) {
  let resolved = OPAQUE_WHITE;
  let approximate = false;
  const ancestry = [];
  let current = element;

  while (current) {
    ancestry.unshift(current);
    current = current.parentElement;
  }

  for (const layerElement of ancestry) {
    const style = getComputedStyle(layerElement);
    const color = parseCssColor(style.backgroundColor);
    if (!color) {
      return {
        color: null,
        reason: `arka_plan_rengi_cozulemedi:${style.backgroundColor}`,
      };
    }
    resolved = compositeColors(color, resolved);

    if (style.backgroundImage === 'none') continue;
    if (
      !(style.backgroundBlendMode || 'normal')
        .split(',')
        .every((mode) => mode.trim() === 'normal')
    ) {
      return { color: null, reason: 'desteklenmeyen_background_blend_mode' };
    }

    const imageLayers = splitTopLevel(style.backgroundImage);
    for (const imageLayer of [...imageLayers].reverse()) {
      const gradient = resolveGradientLayer(imageLayer, layerElement, point);
      if (!gradient.color) return gradient;
      resolved = compositeColors(gradient.color, resolved);
      approximate ||= Boolean(gradient.approximate);
    }
  }

  return { color: resolved, approximate };
}

function isVisible(element) {
  const style = getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.visibility !== 'collapse' &&
    Number.parseFloat(style.opacity || '1') > 0 &&
    rect.width > 0 &&
    rect.height > 0 &&
    !element.closest('[hidden], [aria-hidden="true"]')
  );
}

function elementLabel(element) {
  const parts = [];
  let current = element;

  while (current && current !== document.body && parts.length < 4) {
    const tag = current.tagName.toLowerCase();
    if (current.id) {
      parts.unshift(`${tag}#${current.id}`);
      break;
    }

    const testId = current.getAttribute('data-testid');
    if (testId) {
      parts.unshift(`${tag}[data-testid="${testId}"]`);
      break;
    }

    parts.unshift(tag);
    current = current.parentElement;
  }

  return `body > ${parts.join(' > ')}`;
}

function textSamples(element) {
  const directText = [...element.childNodes]
    .filter((node) => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.textContent?.replace(/\s+/g, ' ').trim() ?? '')
    .filter(Boolean)
    .join(' ');

  const samples = directText ? [{ content: directText, source: 'metin' }] : [];
  const placeholder = element.getAttribute('placeholder')?.trim();
  const tagName = element.tagName.toLowerCase();
  if (placeholder && ['input', 'textarea'].includes(tagName)) {
    samples.push({ content: placeholder, source: 'placeholder' });
  }

  return samples;
}

function textThreshold(style) {
  const size = Number.parseFloat(style.fontSize);
  const weight = Number.parseInt(style.fontWeight, 10);
  const bold = Number.isFinite(weight)
    ? weight >= 700
    : ['bold', 'bolder'].includes(style.fontWeight);
  const large = size >= 24 || (size >= 18.66 && bold);
  return {
    threshold: large ? LARGE_TEXT_THRESHOLD : SMALL_TEXT_THRESHOLD,
    large,
  };
}

function pointFor(element) {
  const rect = element.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

function createTextRecord(
  element,
  sample,
  style,
  background,
  foreground,
  ratio,
  threshold,
) {
  return {
    selector: elementLabel(element),
    tagName: element.tagName.toLowerCase(),
    content: sample.content.slice(0, 160),
    source: sample.source,
    foreground: formatColor(foreground),
    background: formatColor(background),
    ratio: round(ratio),
    threshold,
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
  };
}

function borderDefinitions(style) {
  return [
    ['top', style.borderTopWidth, style.borderTopStyle, style.borderTopColor],
    [
      'right',
      style.borderRightWidth,
      style.borderRightStyle,
      style.borderRightColor,
    ],
    [
      'bottom',
      style.borderBottomWidth,
      style.borderBottomStyle,
      style.borderBottomColor,
    ],
    [
      'left',
      style.borderLeftWidth,
      style.borderLeftStyle,
      style.borderLeftColor,
    ],
  ].filter(
    ([, width, borderStyle]) =>
      Number.parseFloat(width) > 0 && borderStyle !== 'none',
  );
}

/**
 * Browser-side collector. createBrowserContrastCollectorScript emits it into
 * Chromium before navigation, keeping the DOM measurement independent of app code.
 */
export function collectComputedContrast() {
  const result = {
    text: { checked: 0, violations: [], indeterminate: [] },
    borders: { checked: 0, violations: [], indeterminate: [] },
  };

  const excludedTags = new Set([
    'script',
    'style',
    'noscript',
    'template',
    'svg',
    'path',
  ]);
  const elements = [...document.querySelectorAll('body *')];

  for (const element of elements) {
    if (excludedTags.has(element.tagName.toLowerCase()) || !isVisible(element))
      continue;

    const samples = textSamples(element);
    if (samples.length > 0) {
      if (samples[0].source === 'placeholder') {
        continue;
      }

      const style = getComputedStyle(element);
      const isClippedText =
        style.webkitBackgroundClip === 'text' || style.backgroundClip === 'text';
      const clippedAncestor =
        isClippedText
          ? element
          : (element.closest?.('[style*="background-clip: text"], [style*="-webkit-background-clip: text"]') ||
             element.closest?.('.bg-clip-text'));

      const point = pointFor(element);
      const background = clippedAncestor
        ? resolveBackground(clippedAncestor.parentElement ?? clippedAncestor, point)
        : resolveBackground(element, point);

      let rawForeground = null;
      if (clippedAncestor) {
        const ancestorStyle = getComputedStyle(clippedAncestor);
        if (ancestorStyle.backgroundImage && ancestorStyle.backgroundImage !== 'none') {
          const firstLayer = splitTopLevel(ancestorStyle.backgroundImage)[0] || ancestorStyle.backgroundImage;
          const gradient = resolveGradientLayer(firstLayer, clippedAncestor, point);
          rawForeground = gradient.color;
        }
      }
      if (!rawForeground) {
        rawForeground = parseCssColor(style.color);
      }

      for (const sample of samples) {
        result.text.checked += 1;
        if (!background.color || !rawForeground) {
          result.text.indeterminate.push({
            selector: elementLabel(element),
            content: sample.content.slice(0, 160),
            reason: background.reason ?? 'metin_rengi_cozulemedi',
          });
          continue;
        }

        const effectiveForeground = compositeColors(
          rawForeground,
          background.color,
        );
        const { threshold } = textThreshold(style);
        const ratio = contrastRatio(effectiveForeground, background.color);
        if (ratio < threshold) {
          result.text.violations.push(
            createTextRecord(
              element,
              sample,
              style,
              background.color,
              effectiveForeground,
              ratio,
              threshold,
            ),
          );
        }
      }
    }

    const style = getComputedStyle(element);
    const borders = borderDefinitions(style);
    if (borders.length === 0) continue;

    const tagName = element.tagName.toLowerCase();
    const role = element.getAttribute('role');
    const isControl =
      ['input', 'textarea', 'select', 'button'].includes(tagName) ||
      ['button', 'combobox', 'searchbox', 'textbox'].includes(role);
    if (!isControl) continue;

    const borderBackground = resolveBackground(
      element.parentElement ?? element,
      pointFor(element),
    );

    const controlBg = resolveBackground(element, pointFor(element));
    if (controlBg.color && borderBackground.color) {
      const bgRatio = contrastRatio(controlBg.color, borderBackground.color);
      if (bgRatio >= BORDER_THRESHOLD) {
        continue;
      }
    }

    for (const [side, , , colorValue] of borders) {
      result.borders.checked += 1;
      const rawBorder = parseCssColor(colorValue);
      if (!borderBackground.color || !rawBorder) {
        result.borders.indeterminate.push({
          selector: elementLabel(element),
          side,
          reason: borderBackground.reason ?? 'kenarlik_rengi_cozulemedi',
        });
        continue;
      }

      const effectiveBorder = compositeColors(
        rawBorder,
        borderBackground.color,
      );
      const ratio = contrastRatio(effectiveBorder, borderBackground.color);
      if (ratio < BORDER_THRESHOLD) {
        result.borders.violations.push({
          selector: elementLabel(element),
          tagName: element.tagName.toLowerCase(),
          side,
          foreground: formatColor(effectiveBorder),
          background: formatColor(borderBackground.color),
          ratio: round(ratio),
          threshold: BORDER_THRESHOLD,
        });
      }
    }
  }

  return result;
}

/**
 * Playwright init scripts execute in a fresh browser realm. Build a standalone
 * collector there so its helper functions retain their closures instead of
 * relying on page.evaluate to serialize module-scoped variables.
 */
export function createBrowserContrastCollectorScript() {
  const helpers = [
    clamp,
    round,
    parseColorChannel,
    parseAlphaChannel,
    parseCssColor,
    compositeColors,
    linearize,
    relativeLuminance,
    contrastRatio,
    formatColor,
    splitTopLevel,
    extractGradientColors,
    gradientDirection,
    interpolateColor,
    gradientProgress,
    resolveGradientLayer,
    resolveBackground,
    isVisible,
    elementLabel,
    textSamples,
    textThreshold,
    pointFor,
    createTextRecord,
    borderDefinitions,
    collectComputedContrast,
  ];

  return [
    `const OPAQUE_WHITE = ${JSON.stringify(OPAQUE_WHITE)};`,
    `const SMALL_TEXT_THRESHOLD = ${SMALL_TEXT_THRESHOLD};`,
    `const LARGE_TEXT_THRESHOLD = ${LARGE_TEXT_THRESHOLD};`,
    `const BORDER_THRESHOLD = ${BORDER_THRESHOLD};`,
    ...helpers.map((helper) => helper.toString()),
    'globalThis.__ugurhocaCollectComputedContrast = collectComputedContrast;',
  ].join('\n\n');
}

export function summarizeContrastReport(report) {
  const entries = Array.isArray(report.entries) ? report.entries : [];
  const summary = {
    expectedMeasurements: report.expectedMeasurements ?? entries.length,
    recordedMeasurements: entries.length,
    measured: 0,
    skipped: 0,
    failed: 0,
    textChecked: 0,
    borderChecked: 0,
    textViolations: 0,
    borderViolations: 0,
    indeterminateText: 0,
    indeterminateBorders: 0,
  };

  for (const entry of entries) {
    if (entry.status === 'measured') {
      summary.measured += 1;
      summary.textChecked += entry.measurement?.text?.checked ?? 0;
      summary.borderChecked += entry.measurement?.borders?.checked ?? 0;
      summary.textViolations +=
        entry.measurement?.text?.violations?.length ?? 0;
      summary.borderViolations +=
        entry.measurement?.borders?.violations?.length ?? 0;
      summary.indeterminateText +=
        entry.measurement?.text?.indeterminate?.length ?? 0;
      summary.indeterminateBorders +=
        entry.measurement?.borders?.indeterminate?.length ?? 0;
    } else if (entry.status === 'skipped') {
      summary.skipped += 1;
    } else if (entry.status === 'failed') {
      summary.failed += 1;
    }
  }

  return summary;
}

export function validateContrastReport(report) {
  const summary = summarizeContrastReport(report);
  const failures = [];
  const entries = Array.isArray(report.entries) ? report.entries : [];

  if (
    !Number.isInteger(report.expectedMeasurements) ||
    report.expectedMeasurements <= 0
  ) {
    failures.push('Beklenen rota-tema ölçüm sayısı geçerli değil.');
  }

  if (summary.recordedMeasurements !== summary.expectedMeasurements) {
    failures.push(
      `Eksik ölçüm: ${summary.recordedMeasurements}/${summary.expectedMeasurements} rota-tema sonucu kaydedildi.`,
    );
  }

  for (const entry of entries) {
    const label = `${entry.route ?? 'bilinmeyen rota'} (${entry.theme ?? 'bilinmeyen tema'})`;
    if (entry.status === 'failed') {
      failures.push(
        `${label}: ${entry.reason ?? 'erişim veya çalışma hatası'}`,
      );
    }
    if (entry.status === 'skipped' && !entry.skipAllowed) {
      failures.push(
        `${label}: gerekçesiz atlandı (${entry.reason ?? 'neden yok'}).`,
      );
    }
    if (entry.status === 'measured' && !entry.measurement) {
      failures.push(`${label}: ölçüm verisi olmadan başarılı işaretlendi.`);
    }
    if (!['measured', 'skipped', 'failed'].includes(entry.status)) {
      failures.push(
        `${label}: geçersiz ölçüm durumu (${String(entry.status)}).`,
      );
    }
  }

  if (summary.textViolations > 0) {
    failures.push(`${summary.textViolations} metin kontrast ihlali bulundu.`);
  }
  if (summary.borderViolations > 0) {
    failures.push(`${summary.borderViolations} sınır kontrast ihlali bulundu.`);
  }
  if (summary.indeterminateText > 0 || summary.indeterminateBorders > 0) {
    failures.push(
      `${summary.indeterminateText + summary.indeterminateBorders} öğenin kontrastı güvenilir biçimde çözülemedi.`,
    );
  }

  return { ok: failures.length === 0, summary, failures };
}

export function formatContrastValidation(validation) {
  const { summary } = validation;
  const lines = [
    `Ölçüm: ${summary.recordedMeasurements}/${summary.expectedMeasurements} | ölçülen: ${summary.measured} | atlanan: ${summary.skipped} | hatalı: ${summary.failed}`,
    `Metin: ${summary.textChecked} kontrol, ${summary.textViolations} ihlal | Sınır: ${summary.borderChecked} kontrol, ${summary.borderViolations} ihlal`,
    `Belirsiz ölçüm: metin ${summary.indeterminateText}, sınır ${summary.indeterminateBorders}`,
  ];

  if (validation.failures.length > 0) {
    lines.push(...validation.failures.map((failure) => `- ${failure}`));
  }

  return lines.join('\n');
}

export function defaultContrastReportPath() {
  return (
    process.env.CONTRAST_REPORT_PATH ??
    path.join(os.tmpdir(), 'ugurhoca-contrast-report.json')
  );
}

export async function writeContrastReport(
  report,
  reportPath = defaultContrastReportPath(),
) {
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(
    reportPath,
    `${JSON.stringify(report, null, 2)}\n`,
    'utf8',
  );
  return reportPath;
}

async function main() {
  const reportPath = process.argv[2] ?? process.env.CONTRAST_REPORT_PATH;
  if (!reportPath) {
    throw new Error(
      'Rapor yolu gerekli: node scripts/contrast-report.mjs <contrast-report.json>',
    );
  }

  const report = JSON.parse(await fs.readFile(reportPath, 'utf8'));
  const validation = validateContrastReport(report);
  console.log(formatContrastValidation(validation));
  if (!validation.ok) process.exitCode = 1;
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : null;
if (invokedPath && invokedPath.endsWith('contrast-report.mjs')) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
