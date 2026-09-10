import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Varsayılan sosyal önizleme görseli (1200x630). Sayfa meta verilerinde özel
// görsel tanımlı olmayan tüm public sayfalar bunu kullanır (bkz.
// src/lib/site-metadata.ts defaultOgImage). Satori ile render edilir:
// harici font yok, yalnızca sistem fontları + inline stil.
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px',
        background:
          'linear-gradient(135deg, #090d16 0%, #1e1b4b 55%, #312e81 100%)',
        color: '#ffffff',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '72px',
            height: '72px',
            borderRadius: '20px',
            background: '#4f46e5',
            fontSize: '40px',
            fontWeight: 700,
          }}
        >
          π
        </div>
        <div style={{ fontSize: '30px', fontWeight: 600, color: '#c7d2fe' }}>
          Uğur Hoca
        </div>
      </div>
      <div style={{ fontSize: '84px', fontWeight: 800, lineHeight: 1.05 }}>
        Matematik
      </div>
      <div style={{ fontSize: '34px', color: '#a5b4fc', marginTop: '16px' }}>
        LGS • YKS • Canlı Ders • Oyunlar
      </div>
    </div>,
    { ...size },
  );
}
