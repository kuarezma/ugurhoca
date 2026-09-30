import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Uptime izleyicileri için hafif uç: veritabanına dokunmaz, yalnız fonksiyonun ayakta olduğunu söyler.
export function GET() {
  return NextResponse.json(
    { status: 'ok' },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
