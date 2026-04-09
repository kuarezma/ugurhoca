import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface PDFOptions {
  background?: string;
  scale?: number;
  orientation?: 'portrait' | 'landscape';
}

/**
 * Verilen HTML element ID'sini PDF'e dönüştürerek indirir.
 * @param elementId - PDF'e alınacak DOM elementinin ID'si
 * @param filename - İndirilecek dosyanın adı (.pdf uzantısı dahil)
 * @param options - Opsiyonel PDF ayarları
 */
export async function generatePDF(
  elementId: string,
  filename: string,
  options: PDFOptions = {}
): Promise<void> {
  const {
    background = '#0f172a',
    scale = 2,
    orientation = 'portrait',
  } = options;

  const el = document.getElementById(elementId);
  if (!el) {
    console.error(`PDF export: #${elementId} elementi bulunamadı.`);
    return;
  }

  // Geçici olarak overflow/scroll kısıtlarını kaldır
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

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = orientation === 'portrait' ? 210 : 297;
    const pageHeight = orientation === 'portrait' ? 297 : 210;
    const margin = 8;
    const contentWidth = pageWidth - margin * 2;
    const imgRatio = canvas.height / canvas.width;
    const contentHeight = contentWidth * imgRatio;

    // Birden fazla sayfaya sığdır
    if (contentHeight <= pageHeight - margin * 2) {
      pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, contentHeight);
    } else {
      let remainingHeight = contentHeight;
      let yOffset = 0;
      const sliceHeight = pageHeight - margin * 2;

      while (remainingHeight > 0) {
        const sliceCanvas = document.createElement('canvas');
        const sliceCtx = sliceCanvas.getContext('2d')!;
        const pixelSlice = (sliceHeight / contentHeight) * canvas.height;

        sliceCanvas.width = canvas.width;
        sliceCanvas.height = Math.min(pixelSlice, canvas.height - yOffset * (canvas.height / contentHeight));

        sliceCtx.fillStyle = background;
        sliceCtx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
        sliceCtx.drawImage(
          canvas, 0, yOffset * (canvas.height / contentHeight),
          canvas.width, sliceCanvas.height,
          0, 0, sliceCanvas.width, sliceCanvas.height
        );

        const sliceData = sliceCanvas.toDataURL('image/png');
        const sliceHeightMM = (sliceCanvas.height / canvas.height) * contentHeight;
        pdf.addImage(sliceData, 'PNG', margin, margin, contentWidth, sliceHeightMM);

        remainingHeight -= sliceHeight;
        yOffset += sliceHeight;

        if (remainingHeight > 0) pdf.addPage();
      }
    }

    // Footer: Uğur Hoca marka
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(120, 120, 140);
      pdf.text(
        `Uğur Hoca Matematik Platformu  •  ugurhoca.com  •  ${new Date().toLocaleDateString('tr-TR')}`,
        margin,
        pageHeight - 4
      );
      if (totalPages > 1) {
        pdf.text(`${i} / ${totalPages}`, pageWidth - margin, pageHeight - 4, { align: 'right' });
      }
    }

    pdf.save(filename);
  } finally {
    el.style.overflow = originalOverflow;
    el.style.maxHeight = originalMaxHeight;
  }
}

/** Test sonucunu PDF olarak indir */
export function downloadQuizPDF(quizTitle: string) {
  return generatePDF(
    'quiz-result-pdf',
    `ugur-hoca-test-${quizTitle.replace(/\s+/g, '-').toLowerCase()}.pdf`,
    { background: '#0f172a' }
  );
}

/** İlerleme raporunu PDF olarak indir */
export function downloadProgressPDF() {
  return generatePDF(
    'ilerleme-pdf-content',
    `ugur-hoca-gelisim-raporu-${new Date().toLocaleDateString('tr-TR').replace(/\./g, '-')}.pdf`,
    { background: '#0f172a' }
  );
}

/** Admin — öğrenci listesini PDF olarak indir */
export function downloadStudentListPDF() {
  return generatePDF(
    'admin-student-list-pdf',
    `ugur-hoca-ogrenci-listesi-${new Date().toLocaleDateString('tr-TR').replace(/\./g, '-')}.pdf`,
    { background: '#0f172a', orientation: 'landscape' }
  );
}
