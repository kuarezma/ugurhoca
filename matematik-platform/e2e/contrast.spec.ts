import { expect, test, type Browser, type Page } from '@playwright/test';
import {
  createBrowserContrastCollectorScript,
  defaultContrastReportPath,
  formatContrastValidation,
  summarizeContrastReport,
  validateContrastReport,
  writeContrastReport,
} from '../scripts/contrast-report.mjs';

type Theme = 'light' | 'dark';
type MeasurementStatus = 'measured' | 'skipped' | 'failed';

type RouteDefinition = {
  path: string;
  authRedirectAllowed?: boolean;
};

type ContrastMeasurement = {
  text: {
    checked: number;
    violations: unknown[];
    indeterminate: unknown[];
  };
  borders: {
    checked: number;
    violations: unknown[];
    indeterminate: unknown[];
  };
};

type ContrastEntry = {
  route: string;
  theme: Theme;
  status: MeasurementStatus;
  reason?: string;
  skipAllowed?: boolean;
  requestedUrl: string;
  finalUrl?: string;
  navigationStatus?: number;
  measurement?: ContrastMeasurement;
};

type ContrastReport = {
  schemaVersion: number;
  generatedAt: string;
  baseURL: string;
  expectedMeasurements: number;
  routes: string[];
  themes: Theme[];
  entries: ContrastEntry[];
  summary?: ReturnType<typeof summarizeContrastReport>;
};

const THEMES: Theme[] = ['light', 'dark'];
const THEME_STORAGE_KEY = 'ugurhoca-theme';
const ROUTES: RouteDefinition[] = [
  { path: '/' },
  { path: '/admin', authRedirectAllowed: true },
  { path: '/araclar' },
  { path: '/araclar/lgs-puan-hesaplama' },
  { path: '/araclar/yks-puan-hesaplama' },
  { path: '/araclar/ebob-ekok-hesaplayici' },
  { path: '/araclar/pisagor-hesaplayici' },
  { path: '/canli-ders', authRedirectAllowed: true },
  { path: '/canli-ders/d/contrast-gate', authRedirectAllowed: true },
  { path: '/cikis-bileti' },
  { path: '/giris' },
  { path: '/gizlilik' },
  { path: '/icerikler' },
  { path: '/ilerleme', authRedirectAllowed: true },
  { path: '/kayit' },
  { path: '/kvkk' },
  { path: '/meydan-okuma', authRedirectAllowed: true },
  { path: '/odak-pomodoro', authRedirectAllowed: true },
  { path: '/odevler', authRedirectAllowed: true },
  { path: '/oyunlar', authRedirectAllowed: true },
  { path: '/profil', authRedirectAllowed: true },
  { path: '/programlar' },
  { path: '/programlar/lgs' },
  { path: '/programlar/yks' },
  { path: '/sifre-sifirla' },
  { path: '/sifremi-unuttum' },
  { path: '/testler', authRedirectAllowed: true },
];

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function isAllowedAuthenticationRedirect(
  route: RouteDefinition,
  finalUrl: string,
) {
  return route.authRedirectAllowed && new URL(finalUrl).pathname === '/giris';
}

async function waitForVisualStability(page: Page) {
  await page.evaluate(async () => {
    await document.fonts?.ready;
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve());
      });
    });
  });
}

async function measureRoute(
  page: Page,
  route: RouteDefinition,
  theme: Theme,
  baseURL: string,
): Promise<ContrastEntry> {
  const requestedUrl = new URL(route.path, baseURL).toString();
  const pageErrors: string[] = [];
  const capturePageError = (error: Error) => {
    const msg = error.message || '';
    if (
      msg.includes('Minified React error #418') ||
      msg.includes('Minified React error #423') ||
      msg.includes('Minified React error #425') ||
      msg.includes('Hydration failed')
    ) {
      return;
    }
    pageErrors.push(msg);
  };
  page.on('pageerror', capturePageError);

  try {
    const response = await page.goto(requestedUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });
    const finalUrl = page.url();
    const navigationStatus = response?.status();

    if (!response) {
      return {
        route: route.path,
        theme,
        status: 'failed',
        reason: 'Gezinme yanıtı alınamadı.',
        requestedUrl,
        finalUrl,
      };
    }

    if (navigationStatus && navigationStatus >= 400) {
      return {
        route: route.path,
        theme,
        status: 'failed',
        reason: `HTTP ${navigationStatus} yanıtı alındı.`,
        requestedUrl,
        finalUrl,
        navigationStatus,
      };
    }

    await waitForVisualStability(page);
    const pageState = await page.evaluate(() => ({
      appliedTheme: document.documentElement.dataset.theme,
      hasVisibleContent: Boolean(
        document.body &&
        (document.body.innerText.trim() ||
          document.body.querySelector(
            'main, [role="main"], button, input, textarea, select, canvas',
          )),
      ),
    }));

    if (pageErrors.length > 0) {
      return {
        route: route.path,
        theme,
        status: 'failed',
        reason: `Tarayıcı çalışma hatası: ${pageErrors.join(' | ')}`,
        requestedUrl,
        finalUrl,
        navigationStatus,
      };
    }

    if (pageState.appliedTheme !== theme) {
      return {
        route: route.path,
        theme,
        status: 'failed',
        reason: `Tema uygulanmadı: ${pageState.appliedTheme ?? 'tanımsız'}.`,
        requestedUrl,
        finalUrl,
        navigationStatus,
      };
    }

    if (!pageState.hasVisibleContent) {
      return {
        route: route.path,
        theme,
        status: 'failed',
        reason: 'Görünür sayfa içeriği bulunamadı.',
        requestedUrl,
        finalUrl,
        navigationStatus,
      };
    }

    if (isAllowedAuthenticationRedirect(route, finalUrl)) {
      return {
        route: route.path,
        theme,
        status: 'skipped',
        reason: 'Kimlik doğrulama gerekli; rota /giris sayfasına yönlendirdi.',
        skipAllowed: true,
        requestedUrl,
        finalUrl,
        navigationStatus,
      };
    }

    if (new URL(finalUrl).pathname !== route.path) {
      return {
        route: route.path,
        theme,
        status: 'failed',
        reason: `Beklenmeyen yönlendirme: ${new URL(finalUrl).pathname}`,
        requestedUrl,
        finalUrl,
        navigationStatus,
      };
    }

    const measurement = (await page.evaluate(() => {
      const collector = (
        globalThis as typeof globalThis & {
          __ugurhocaCollectComputedContrast?: () => ContrastMeasurement;
        }
      ).__ugurhocaCollectComputedContrast;
      if (!collector)
        throw new Error('Kontrast toplayıcısı tarayıcıya yüklenemedi.');
      return collector();
    })) as ContrastMeasurement;
    return {
      route: route.path,
      theme,
      status: 'measured',
      requestedUrl,
      finalUrl,
      navigationStatus,
      measurement,
    };
  } catch (error) {
    return {
      route: route.path,
      theme,
      status: 'failed',
      reason: `Gezinme veya ölçüm hatası: ${errorMessage(error)}`,
      requestedUrl,
      finalUrl: page.url(),
    };
  } finally {
    page.off('pageerror', capturePageError);
  }
}

async function measureTheme(browser: Browser, theme: Theme, baseURL: string) {
  const context = await browser.newContext();
  try {
    const parsedBase = new URL(baseURL);
    await context.addCookies([
      {
        name: 'ugurhoca_access_token',
        value: 'contrast-gate-token',
        domain: parsedBase.hostname,
        path: '/',
      },
      {
        name: 'ugurhoca_auth_snapshot',
        value: encodeURIComponent(
          JSON.stringify({
            email: 'denetim@ugurhoca.test',
            grade: 8,
            id: 'contrast-gate-admin-user',
            isAdmin: true,
            name: 'Denetim Kullanıcısı',
          }),
        ),
        domain: parsedBase.hostname,
        path: '/',
      },
    ]);
  } catch {}
  await context.addInitScript({
    content: createBrowserContrastCollectorScript(),
  });
  await context.addInitScript(
    ({ storageKey, nextTheme }) => {
      try {
        window.localStorage.setItem(storageKey, nextTheme);
      } catch {}
      const applyTheme = () => {
        if (document.documentElement) {
          document.documentElement.dataset.theme = nextTheme;
          document.documentElement.classList.remove('light', 'dark');
          document.documentElement.classList.add(nextTheme);
        }
      };
      if (document.documentElement) {
        applyTheme();
      } else {
        document.addEventListener('DOMContentLoaded', applyTheme, { once: true });
      }
    },
    { storageKey: THEME_STORAGE_KEY, nextTheme: theme },
  );

  const page = await context.newPage();
  try {
    const entries: ContrastEntry[] = [];
    for (const route of ROUTES) {
      entries.push(await measureRoute(page, route, theme, baseURL));
    }
    return entries;
  } finally {
    await context.close();
  }
}

test.describe('Açık/koyu tema kontrast kapısı', () => {
  test('27 rota × iki tema için WCAG kontrast raporu üretir', async ({
    browser,
    baseURL,
  }) => {
    test.setTimeout(12 * 60 * 1000);

    const resolvedBaseURL = baseURL ?? 'http://localhost:3000';
    const report: ContrastReport = {
      schemaVersion: 1,
      generatedAt: new Date().toISOString(),
      baseURL: resolvedBaseURL,
      expectedMeasurements: ROUTES.length * THEMES.length,
      routes: ROUTES.map((route) => route.path),
      themes: THEMES,
      entries: [] as ContrastEntry[],
    };

    let validation: ReturnType<typeof validateContrastReport> | undefined;
    try {
      for (const theme of THEMES) {
        report.entries.push(
          ...(await measureTheme(browser, theme, resolvedBaseURL)),
        );
      }
      report.summary = summarizeContrastReport(report);
      validation = validateContrastReport(report);
    } finally {
      report.summary = summarizeContrastReport(report);
      await writeContrastReport(
        report,
        process.env.CONTRAST_REPORT_PATH ?? defaultContrastReportPath(),
      );
    }

    expect(validation, 'Kontrast raporu doğrulanamadı.').toBeDefined();
    expect(
      validation?.ok,
      validation ? formatContrastValidation(validation) : '',
    ).toBe(true);
  });
});
