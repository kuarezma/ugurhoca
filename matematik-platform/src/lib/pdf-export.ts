import { createLogger } from '@/lib/logger';
import { formatIstanbulDate } from '@/lib/date-format';

const log = createLogger('pdf-export');

export interface PDFOptions {
  background?: string;
  scale?: number;
  orientation?: 'portrait' | 'landscape';
}

const WARM_PAPER_BG = '#FAF8F5';

/**
 * Hedef piksel yüksekliği civarında metin/formül satırını ortadan kesmeyen,
 * arka plan rengine en yakın (boşluk) yatay satırı bulur.
 */
function findSafeSliceRow(
  ctx: CanvasRenderingContext2D,
  width: number,
  idealEndRow: number,
  minRow: number,
  maxRow: number,
): number {
  const clampedIdeal = Math.min(
    Math.max(Math.floor(idealEndRow), minRow),
    maxRow,
  );
  const searchWindow = Math.min(
    120,
    Math.floor((clampedIdeal - minRow) * 0.25),
  );
  if (searchWindow <= 4) return clampedIdeal;

  const startY = Math.max(minRow, clampedIdeal - searchWindow);
  const height = clampedIdeal - startY + 1;
  try {
    const sampleStepX = Math.max(1, Math.floor(width / 80));
    const imageData = ctx.getImageData(0, startY, width, height).data;

    let bestRow = clampedIdeal;
    let lowestVariance = Number.POSITIVE_INFINITY;

    // İdeal kesim noktasına en yakın boş satırı alttan yukarıya doğru ara
    for (let dy = height - 1; dy >= 0; dy--) {
      const rowOffset = dy * width * 4;
      const baseR = imageData[rowOffset];
      const baseG = imageData[rowOffset + 1];
      const baseB = imageData[rowOffset + 2];
      let diffSum = 0;

      for (let x = 0; x < width; x += sampleStepX) {
        const idx = rowOffset + x * 4;
        diffSum +=
          Math.abs(imageData[idx] - baseR) +
          Math.abs(imageData[idx + 1] - baseG) +
          Math.abs(imageData[idx + 2] - baseB);
      }

      if (diffSum === 0) {
        return startY + dy;
      }
      if (diffSum < lowestVariance) {
        lowestVariance = diffSum;
        bestRow = startY + dy;
      }
    }

    return bestRow;
  } catch {
    return clampedIdeal;
  }
}

/**
 * jsPDF dahili Helvetica fontu Türkçe karakterleri (ğ, ş, ı, İ, •) bozduğu için
 * alt bilgi şeridini tarayıcının UTF-8 Canvas motoruyla yüksek çözünürlüklü PNG olarak üretir.
 */
function renderTurkishFooterImage(
  leftText: string,
  rightText: string | null,
): string | null {
  if (typeof document === 'undefined') return null;
  const footerCanvas = document.createElement('canvas');
  footerCanvas.width = 1600;
  footerCanvas.height = 44;
  const fCtx = footerCanvas.getContext('2d');
  if (!fCtx) return null;

  fCtx.clearRect(0, 0, footerCanvas.width, footerCanvas.height);
  fCtx.font = '600 20px Outfit, system-ui, -apple-system, sans-serif';
  fCtx.fillStyle = '#475569';
  fCtx.textBaseline = 'middle';
  fCtx.fillText(leftText, 0, 22);

  if (rightText) {
    fCtx.textAlign = 'right';
    fCtx.fillText(rightText, footerCanvas.width, 22);
  }

  return footerCanvas.toDataURL('image/png');
}

/**
 * Verilen HTML element ID'sini Sıcak Kağıt (Warm Paper) açık temada,
 * satır kesilmesiz ve Türkçe karakter uyumlu PDF'e dönüştürerek indirir.
 */
export async function generatePDF(
  elementId: string,
  filename: string,
  options: PDFOptions = {},
): Promise<void> {
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);

  const {
    background = WARM_PAPER_BG,
    scale = 2,
    orientation = 'portrait',
  } = options;

  const el = document.getElementById(elementId);
  if (!el) {
    log.error('PDF export elementi bulunamadı', undefined, { elementId });
    return;
  }

  const originalOverflow = el.style.overflow;
  const originalMaxHeight = el.style.maxHeight;
  el.style.overflow = 'visible';
  el.style.maxHeight = 'none';

  try {
    const canvas = await html2canvas(el, {
      scale,
      useCORS: true,
      backgroundColor: background,
      logging: false,
      windowWidth: el.scrollWidth,
      windowHeight: el.scrollHeight,
    });

    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = orientation === 'portrait' ? 210 : 297;
    const pageHeight = orientation === 'portrait' ? 297 : 210;
    const margin = 8;
    const footerReserve = 7;
    const contentWidth = pageWidth - margin * 2;
    const maxSliceHeightMM = pageHeight - margin * 2 - footerReserve;
    const pxPerMM = canvas.width / contentWidth;
    const maxSlicePx = Math.floor(maxSliceHeightMM * pxPerMM);

    if (canvas.height <= maxSlicePx) {
      const imgData = canvas.toDataURL('image/png');
      const heightMM = canvas.height / pxPerMM;
      pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, heightMM);
    } else {
      const sourceCtx = canvas.getContext('2d');
      let currentPxY = 0;
      let isFirstPage = true;

      while (currentPxY < canvas.height) {
        if (!isFirstPage) {
          pdf.addPage();
        }
        isFirstPage = false;

        const remainingPx = canvas.height - currentPxY;
        const nextEndPx =
          remainingPx <= maxSlicePx
            ? canvas.height
            : sourceCtx
              ? findSafeSliceRow(
                  sourceCtx,
                  canvas.width,
                  currentPxY + maxSlicePx,
                  currentPxY + Math.floor(maxSlicePx * 0.6),
                  canvas.height,
                )
              : currentPxY + maxSlicePx;

        const sliceHeightPx = Math.max(1, nextEndPx - currentPxY);
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = sliceHeightPx;
        const sliceCtx = sliceCanvas.getContext('2d');
        if (sliceCtx) {
          sliceCtx.fillStyle = background;
          sliceCtx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
          sliceCtx.drawImage(
            canvas,
            0,
            currentPxY,
            canvas.width,
            sliceHeightPx,
            0,
            0,
            sliceCanvas.width,
            sliceHeightPx,
          );
        }

        const sliceData = sliceCanvas.toDataURL('image/png');
        const sliceHeightMM = sliceHeightPx / pxPerMM;
        pdf.addImage(
          sliceData,
          'PNG',
          margin,
          margin,
          contentWidth,
          sliceHeightMM,
        );

        currentPxY = nextEndPx;
      }
    }

    const totalPages = pdf.getNumberOfPages();
    const dateLabel = formatIstanbulDate(new Date());
    const brandFooterLeft = `Uğur Hoca Matematik Platformu  •  www.ugurhoca.com  •  ${dateLabel}`;

    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      const pageLabel = totalPages > 1 ? `${i} / ${totalPages}` : null;
      const footerPng = renderTurkishFooterImage(brandFooterLeft, pageLabel);
      if (footerPng) {
        pdf.addImage(
          footerPng,
          'PNG',
          margin,
          pageHeight - 8.5,
          contentWidth,
          4.5,
        );
      }
    }

    pdf.save(filename);
  } finally {
    el.style.overflow = originalOverflow;
    el.style.maxHeight = originalMaxHeight;
  }
}

/** Test sonucunu PDF olarak indir (Sıcak Kağıt açık tema uyumlu) */
export function downloadQuizPDF(quizTitle: string) {
  return generatePDF(
    'quiz-result-pdf',
    `ugur-hoca-test-${quizTitle.replace(/\s+/g, '-').toLowerCase()}.pdf`,
    { background: WARM_PAPER_BG },
  );
}

/** İlerleme raporunu PDF olarak indir (Sıcak Kağıt açık tema uyumlu) */
export function downloadProgressPDF() {
  return generatePDF(
    'ilerleme-pdf-content',
    `ugur-hoca-gelisim-raporu-${formatIstanbulDate(new Date()).replace(/\./g, '-')}.pdf`,
    { background: WARM_PAPER_BG },
  );
}

/** Admin — öğrenci listesini PDF olarak indir (Sıcak Kağıt açık tema uyumlu) */
export function downloadStudentListPDF() {
  return generatePDF(
    'admin-student-list-pdf',
    `ugur-hoca-ogrenci-listesi-${formatIstanbulDate(new Date()).replace(/\./g, '-')}.pdf`,
    { background: WARM_PAPER_BG, orientation: 'landscape' },
  );
}
