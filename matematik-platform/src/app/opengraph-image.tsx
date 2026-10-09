import fs from 'fs';
import path from 'path';
import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Sosyal medya ve mesajlasma uygulamalari (WhatsApp, Telegram, X, Facebook)
// icin zengin 1200x630 onizleme gorseli.
export default function OpengraphImage() {
  let avatarDataUri = '';
  try {
    const avatarPath = path.join(process.cwd(), 'public/ugur.jpeg');
    if (fs.existsSync(avatarPath)) {
      const avatarBuffer = fs.readFileSync(avatarPath);
      avatarDataUri = `data:image/jpeg;base64,${avatarBuffer.toString('base64')}`;
    }
  } catch {
    // fs hatasi durumunda fallback kullanilir
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#070b14',
          background:
            'linear-gradient(135deg, #060913 0%, #0d1527 45%, #052e1e 100%)',
          padding: '26px 30px',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '100%',
            height: '100%',
            borderRadius: '26px',
            background:
              'linear-gradient(145deg, rgba(22, 32, 54, 0.85) 0%, rgba(10, 16, 30, 0.95) 100%)',
            border: '2px solid rgba(255, 255, 255, 0.14)',
            padding: '34px 40px',
          }}
        >
          {/* Ust Satir: Marka & Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '18px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '92px',
                  height: '92px',
                  borderRadius: '26px',
                  border: '4px solid #22c55e',
                  backgroundColor: '#052e16',
                  boxShadow: '0 8px 28px rgba(34, 197, 94, 0.45)',
                  overflow: 'hidden',
                }}
              >
                {avatarDataUri ? (
                  <img
                    src={avatarDataUri}
                    alt="Uğur Hoca"
                    width={92}
                    height={92}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <span
                    style={{
                      fontSize: '44px',
                      fontWeight: 900,
                      color: '#4ade80',
                    }}
                  >
                    U
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div
                  style={{
                    fontSize: '36px',
                    fontWeight: 900,
                    color: '#ffffff',
                    letterSpacing: '-0.5px',
                    lineHeight: 1.1,
                  }}
                >
                  Uğur Hoca
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: '6px',
                  }}
                >
                  <div
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '5px',
                      backgroundColor: '#22c55e',
                    }}
                  />
                  <span
                    style={{
                      fontSize: '15px',
                      fontWeight: 800,
                      color: '#4ade80',
                      letterSpacing: '1.2px',
                      textTransform: 'uppercase',
                    }}
                  >
                    Matematik Maceraları
                  </span>
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 24px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(34, 197, 94, 0.18)',
                border: '2px solid #22c55e',
                boxShadow: '0 4px 16px rgba(34, 197, 94, 0.25)',
              }}
            >
              <span style={{ fontSize: '20px' }}>⭐</span>
              <span
                style={{
                  fontSize: '18px',
                  fontWeight: 800,
                  color: '#86efac',
                  letterSpacing: '0.4px',
                }}
              >
                %100 ÜCRETSİZ & MEB UYUMLU
              </span>
            </div>
          </div>

          {/* Orta Manset Baslik */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              marginTop: '10px',
            }}
          >
            <div
              style={{
                fontSize: '52px',
                fontWeight: 900,
                color: '#ffffff',
                lineHeight: 1.15,
                letterSpacing: '-0.5px',
              }}
            >
              Matematiği Keşfet, Başarıyı Yakala!
            </div>
            <div
              style={{
                fontSize: '24px',
                fontWeight: 600,
                color: '#e2e8f0',
                marginTop: '8px',
                lineHeight: 1.3,
              }}
            >
              5, 6, 7, 8. Sınıf ve LGS İçin Yeni Nesil Öğrenme Platformu
            </div>
          </div>

          {/* Ozellik Kartlari */}
          <div
            style={{
              display: 'flex',
              gap: '14px',
              marginTop: '16px',
            }}
          >
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                padding: '16px 18px',
                borderRadius: '18px',
                backgroundColor: 'rgba(20, 83, 45, 0.35)',
                border: '2px solid rgba(34, 197, 94, 0.5)',
              }}
            >
              <div
                style={{ fontSize: '21px', fontWeight: 800, color: '#86efac' }}
              >
                📄 Yaprak Testler
              </div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#bbf7d0',
                  marginTop: '4px',
                }}
              >
                Özgün PDF Konu Testleri
              </div>
            </div>

            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                padding: '16px 18px',
                borderRadius: '18px',
                backgroundColor: 'rgba(88, 28, 135, 0.35)',
                border: '2px solid rgba(168, 85, 247, 0.5)',
              }}
            >
              <div
                style={{ fontSize: '21px', fontWeight: 800, color: '#d8b4fe' }}
              >
                🎮 Eğitici Oyunlar
              </div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#e9d5ff',
                  marginTop: '4px',
                }}
              >
                19 Eğlenceli Zeka Oyunu
              </div>
            </div>

            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                padding: '16px 18px',
                borderRadius: '18px',
                backgroundColor: 'rgba(120, 53, 15, 0.35)',
                border: '2px solid rgba(245, 158, 11, 0.5)',
              }}
            >
              <div
                style={{ fontSize: '21px', fontWeight: 800, color: '#fcd34d' }}
              >
                🏆 LGS Hazırlık
              </div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#fef08a',
                  marginTop: '4px',
                }}
              >
                Yeni Nesil Beceri Soruları
              </div>
            </div>

            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                padding: '16px 18px',
                borderRadius: '18px',
                backgroundColor: 'rgba(12, 74, 110, 0.35)',
                border: '2px solid rgba(14, 165, 233, 0.5)',
              }}
            >
              <div
                style={{ fontSize: '21px', fontWeight: 800, color: '#7dd3fc' }}
              >
                ⚡ Başarı Atölyesi
              </div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#bae6fd',
                  marginTop: '4px',
                }}
              >
                Formüller & Sınav Sayacı
              </div>
            </div>
          </div>

          {/* Alt Bilgi */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '16px',
              borderTop: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '16px',
                fontWeight: 600,
                color: '#cbd5e1',
              }}
            >
              <span>✨ Ortaokul Matematik Öğrenmenin En Eğlenceli Yolu</span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '5px',
                  backgroundColor: '#38bdf8',
                }}
              />
              <span
                style={{
                  fontSize: '22px',
                  fontWeight: 900,
                  color: '#38bdf8',
                  letterSpacing: '0.5px',
                }}
              >
                ugurhoca.com
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}

