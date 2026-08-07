import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// CSP ihlal raporlarını toplar (Report-Only aşaması). Tarayıcı bu ucu kimlik
// doğrulaması olmadan POST eder; hafif tut ve Vercel loglarına yaz. Zorlamaya
// (Content-Security-Policy) geçmeden önce ihlaller buradan izlenir. Logger prod'da
// sessiz olduğu için doğrudan console.warn kullanılır.
const MAX_LOGGED_CHARS = 2000;

export async function POST(request: Request) {
  try {
    const report = await request.json();
    console.warn('[csp-report]', JSON.stringify(report).slice(0, MAX_LOGGED_CHARS));
  } catch {
    // Rapor uçları hataya dayanıklı olmalı; gövde ayrıştırılamazsa yut.
  }

  return new NextResponse(null, { status: 204 });
}
