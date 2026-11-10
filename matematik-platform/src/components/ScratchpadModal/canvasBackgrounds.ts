import type { BackgroundPattern } from './types';

export function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  pattern: BackgroundPattern,
  lightMode = false,
) {
  ctx.fillStyle = lightMode ? '#ffffff' : '#090d16';
  ctx.fillRect(0, 0, width, height);

  const strokeColor = lightMode
    ? 'rgba(15, 23, 42, 0.08)'
    : 'rgba(255, 255, 255, 0.07)';

  if (pattern === 'grid') {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1;
    const step = 28;
    ctx.beginPath();
    for (let x = step; x < width; x += step) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = step; y < height; y += step) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();
  } else if (pattern === 'dot') {
    ctx.fillStyle = lightMode
      ? 'rgba(15, 23, 42, 0.22)'
      : 'rgba(255, 255, 255, 0.22)';
    const step = 28;
    const dotRadius = 1.5;
    for (let x = step; x < width; x += step) {
      for (let y = step; y < height; y += step) {
        ctx.beginPath();
        ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (pattern === 'lined') {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1;
    const step = 32;
    ctx.beginPath();
    for (let y = step; y < height; y += step) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();
  } else if (pattern === 'isometric') {
    ctx.strokeStyle = lightMode
      ? 'rgba(15, 23, 42, 0.08)'
      : 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    const step = 32;
    const slope = Math.tan(Math.PI / 6); // 30 derece izometrik açı (~0.577)

    ctx.beginPath();
    // 1. Dikey çizgiler (90°)
    for (let x = 0; x <= width; x += step) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    // 2. +30° eğimli çizgiler
    for (let y0 = -width * slope; y0 <= height; y0 += step * 0.866) {
      ctx.moveTo(0, y0);
      ctx.lineTo(width, y0 + width * slope);
    }
    // 3. -30° eğimli çizgiler
    for (let y0 = 0; y0 <= height + width * slope; y0 += step * 0.866) {
      ctx.moveTo(0, y0);
      ctx.lineTo(width, y0 - width * slope);
    }
    ctx.stroke();
  } else if (pattern === 'coordinate') {
    // 1. İnce arka plan ızgarası
    ctx.strokeStyle = lightMode
      ? 'rgba(15, 23, 42, 0.05)'
      : 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    const step = 35;
    const cx = Math.round(width / 2);
    const cy = Math.round(height / 2);

    ctx.beginPath();
    for (let x = cx % step; x < width; x += step) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = cy % step; y < height; y += step) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    // 2. Belirgin Kartezyen X-Y Eksenleri
    ctx.save();
    const axisColor = lightMode ? '#2563eb' : '#38bdf8';
    ctx.strokeStyle = axisColor;
    ctx.fillStyle = axisColor;
    ctx.lineWidth = 1.5;
    ctx.font = '11px ui-monospace, SFMono-Regular, monospace';

    // X Ekseni ve Ok
    ctx.beginPath();
    ctx.moveTo(25, cy);
    ctx.lineTo(width - 25, cy);
    ctx.lineTo(width - 33, cy - 5);
    ctx.moveTo(width - 25, cy);
    ctx.lineTo(width - 33, cy + 5);
    ctx.stroke();
    ctx.fillText('x', width - 20, cy - 8);

    // Y Ekseni ve Ok
    ctx.beginPath();
    ctx.moveTo(cx, height - 25);
    ctx.lineTo(cx, 25);
    ctx.lineTo(cx - 5, 33);
    ctx.moveTo(cx, 25);
    ctx.lineTo(cx + 5, 33);
    ctx.stroke();
    ctx.fillText('y', cx + 10, 25);

    // Eksen Çentikleri ve Sayı Değerleri
    for (let x = cx + step, val = 1; x < width - 40; x += step, val++) {
      ctx.beginPath();
      ctx.moveTo(x, cy - 3);
      ctx.lineTo(x, cy + 3);
      ctx.stroke();
      ctx.fillText(String(val), x - 4, cy + 15);
    }
    for (let x = cx - step, val = -1; x > 40; x -= step, val--) {
      ctx.beginPath();
      ctx.moveTo(x, cy - 3);
      ctx.lineTo(x, cy + 3);
      ctx.stroke();
      ctx.fillText(String(val), x - 7, cy + 15);
    }
    for (let y = cy - step, val = 1; y > 40; y -= step, val++) {
      ctx.beginPath();
      ctx.moveTo(cx - 3, y);
      ctx.lineTo(cx + 3, y);
      ctx.stroke();
      ctx.fillText(String(val), cx + 7, y + 4);
    }
    for (let y = cy + step, val = -1; y < height - 40; y += step, val--) {
      ctx.beginPath();
      ctx.moveTo(cx - 3, y);
      ctx.lineTo(cx + 3, y);
      ctx.stroke();
      ctx.fillText(String(val), cx + 7, y + 4);
    }
    ctx.fillText('0', cx - 10, cy + 14);
    ctx.restore();
  }
}
