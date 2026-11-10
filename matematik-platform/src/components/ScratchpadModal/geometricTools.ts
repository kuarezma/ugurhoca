export function drawCoordinatePlaneOnCanvas(
  canvas: HTMLCanvasElement,
  color: string,
  lineWidth: number,
  onAfterDraw: () => void,
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const rect = canvas.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  const cx = Math.round(width / 2);
  const cy = Math.round(height / 2);

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(1.5, lineWidth);
  ctx.font = '12px ui-monospace, SFMono-Regular, monospace';

  // X Ekseni
  ctx.beginPath();
  ctx.moveTo(25, cy);
  ctx.lineTo(width - 25, cy);
  // X oku
  ctx.lineTo(width - 33, cy - 5);
  ctx.moveTo(width - 25, cy);
  ctx.lineTo(width - 33, cy + 5);
  ctx.stroke();
  ctx.fillText('x', width - 20, cy - 8);

  // Y Ekseni
  ctx.beginPath();
  ctx.moveTo(cx, height - 25);
  ctx.lineTo(cx, 25);
  // Y oku
  ctx.lineTo(cx - 5, 33);
  ctx.moveTo(cx, 25);
  ctx.lineTo(cx + 5, 33);
  ctx.stroke();
  ctx.fillText('y', cx + 10, 25);

  // Çentikler
  const step = 35;
  for (let x = cx + step, val = 1; x < width - 40; x += step, val++) {
    ctx.beginPath();
    ctx.moveTo(x, cy - 4);
    ctx.lineTo(x, cy + 4);
    ctx.stroke();
    ctx.fillText(String(val), x - 4, cy + 16);
  }
  for (let x = cx - step, val = -1; x > 40; x -= step, val--) {
    ctx.beginPath();
    ctx.moveTo(x, cy - 4);
    ctx.lineTo(x, cy + 4);
    ctx.stroke();
    ctx.fillText(String(val), x - 8, cy + 16);
  }
  for (let y = cy - step, val = 1; y > 40; y -= step, val++) {
    ctx.beginPath();
    ctx.moveTo(cx - 4, y);
    ctx.lineTo(cx + 4, y);
    ctx.stroke();
    ctx.fillText(String(val), cx + 8, y + 4);
  }
  for (let y = cy + step, val = -1; y < height - 40; y += step, val--) {
    ctx.beginPath();
    ctx.moveTo(cx - 4, y);
    ctx.lineTo(cx + 4, y);
    ctx.stroke();
    ctx.fillText(String(val), cx + 8, y + 4);
  }
  // Orijin
  ctx.fillText('0', cx - 12, cy + 14);
  ctx.restore();
  onAfterDraw();
}

export function drawNumberLineOnCanvas(
  canvas: HTMLCanvasElement,
  color: string,
  lineWidth: number,
  onAfterDraw: () => void,
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const rect = canvas.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  const cx = Math.round(width / 2);
  const cy = Math.round(height / 2);

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(2, lineWidth);
  ctx.font = '12px ui-monospace, SFMono-Regular, monospace';

  // Sayı Doğrusu Ana Çizgi
  ctx.beginPath();
  ctx.moveTo(35, cy);
  ctx.lineTo(width - 35, cy);
  // Sol ok
  ctx.moveTo(35, cy);
  ctx.lineTo(45, cy - 6);
  ctx.moveTo(35, cy);
  ctx.lineTo(45, cy + 6);
  // Sağ ok
  ctx.moveTo(width - 35, cy);
  ctx.lineTo(width - 45, cy - 6);
  ctx.moveTo(width - 35, cy);
  ctx.lineTo(width - 45, cy + 6);
  ctx.stroke();

  const step = 45;
  const count = Math.min(5, Math.floor((width - 120) / (2 * step)));
  for (let i = -count; i <= count; i++) {
    const x = cx + i * step;
    ctx.beginPath();
    ctx.moveTo(x, cy - 6);
    ctx.lineTo(x, cy + 6);
    ctx.stroke();
    ctx.fillText(String(i), x - (i < 0 ? 8 : 4), cy + 22);
  }
  ctx.restore();
  onAfterDraw();
}

export function drawGeometricShapeOnCanvas(
  canvas: HTMLCanvasElement,
  shape: 'triangle' | 'circle' | 'rectangle',
  color: string,
  lineWidth: number,
  onAfterDraw: () => void,
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const rect = canvas.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  const cx = Math.round(width / 2);
  const cy = Math.round(height / 2);

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(2, lineWidth);
  ctx.font = '12px ui-monospace, SFMono-Regular, monospace';

  if (shape === 'triangle') {
    // Dik Üçgen
    const x1 = cx - 90;
    const y1 = cy + 70;
    const x2 = cx + 90;
    const y2 = cy + 70;
    const x3 = cx - 90;
    const y3 = cy - 70;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.closePath();
    ctx.stroke();

    // Dik açı simgesi (90°)
    const s = 14;
    ctx.beginPath();
    ctx.moveTo(x1 + s, y1);
    ctx.lineTo(x1 + s, y1 - s);
    ctx.lineTo(x1, y1 - s);
    ctx.stroke();
    // Nokta
    ctx.beginPath();
    ctx.arc(x1 + s / 2, y1 - s / 2, 2, 0, Math.PI * 2);
    ctx.fill();

    // Köşe Harfleri
    ctx.fillText('A', x3 - 15, y3);
    ctx.fillText('B', x1 - 15, y1 + 5);
    ctx.fillText('C', x2 + 8, y2 + 5);
  } else if (shape === 'circle') {
    // Çember & Yarıçap
    const radius = Math.min(width, height) * 0.22;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Merkez Noktası
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText('M', cx - 14, cy - 8);

    // Yarıçap çizgisi
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + radius, cy);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillText('r', cx + radius / 2 - 4, cy - 6);
  } else if (shape === 'rectangle') {
    // Dikdörtgen
    const rw = 200;
    const rh = 120;
    const rx = cx - rw / 2;
    const ry = cy - rh / 2;

    ctx.beginPath();
    ctx.strokeRect(rx, ry, rw, rh);

    // Köşegen
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx + rw, ry + rh);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillText('a', cx, ry + rh + 16);
    ctx.fillText('b', rx + rw + 8, cy + 4);
  }

  ctx.restore();
  onAfterDraw();
}
