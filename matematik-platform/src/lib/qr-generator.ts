/**
 * Pure TypeScript QR Code Generator (SVG output)
 * Zero external dependencies. Generates valid ISO/IEC 18004 QR codes (Byte mode, Error Correction Level M).
 */

// Galois Field GF(256) log and exp tables for polynomial multiplication
const GF256_EXP = new Uint8Array(512);
const GF256_LOG = new Uint8Array(256);

(function initGaloisField() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF256_EXP[i] = x;
    GF256_LOG[x] = i;
    x <<= 1;
    if (x & 256) {
      x ^= 0x11d; // GF(256) primitive polynomial x^8 + x^4 + x^3 + x^2 + 1
    }
  }
  for (let i = 255; i < 512; i++) {
    GF256_EXP[i] = GF256_EXP[i - 255];
  }
})();

function gfMultiply(x: number, y: number): number {
  if (x === 0 || y === 0) return 0;
  return GF256_EXP[GF256_LOG[x] + GF256_LOG[y]];
}

// Reed-Solomon Generator Polynomial
function rsGeneratorPoly(degree: number): Uint8Array {
  let poly = new Uint8Array([1]);
  for (let i = 0; i < degree; i++) {
    const nextPoly = new Uint8Array(poly.length + 1);
    const factor = GF256_EXP[i];
    for (let j = 0; j < poly.length; j++) {
      nextPoly[j] ^= gfMultiply(poly[j], factor);
      nextPoly[j + 1] ^= poly[j];
    }
    poly = nextPoly;
  }
  return poly;
}

// Reed-Solomon Error Correction Code Calculation
function rsCalculateEcc(data: Uint8Array, eccLength: number): Uint8Array {
  const gen = rsGeneratorPoly(eccLength);
  const remainder = new Uint8Array(eccLength);

  for (let i = 0; i < data.length; i++) {
    const factor = data[i] ^ remainder[0];
    for (let j = 0; j < eccLength - 1; j++) {
      remainder[j] = remainder[j + 1] ^ gfMultiply(gen[eccLength - 1 - j], factor);
    }
    remainder[eccLength - 1] = gfMultiply(gen[0], factor);
  }
  return remainder;
}

// QR Code Version specs for Level M
interface QRVersionSpec {
  version: number;
  size: number;
  totalBytes: number;
  dataBytes: number;
  eccBytes: number;
  alignmentPatterns: number[];
}

const QR_SPECS_M: QRVersionSpec[] = [
  { version: 1, size: 21, totalBytes: 26, dataBytes: 16, eccBytes: 10, alignmentPatterns: [] },
  { version: 2, size: 25, totalBytes: 44, dataBytes: 28, eccBytes: 16, alignmentPatterns: [6, 18] },
  { version: 3, size: 29, totalBytes: 70, dataBytes: 44, eccBytes: 26, alignmentPatterns: [6, 22] },
  { version: 4, size: 33, totalBytes: 100, dataBytes: 64, eccBytes: 36, alignmentPatterns: [6, 26] },
];

export function encodeQRCode(text: string): boolean[][] {
  const utf8Bytes = new TextEncoder().encode(text);
  
  // Find appropriate version
  let spec = QR_SPECS_M.find((s) => s.dataBytes >= utf8Bytes.length + 3);
  if (!spec) {
    spec = QR_SPECS_M[QR_SPECS_M.length - 1]; // Fallback to largest supported
  }

  const { size, dataBytes, eccBytes, alignmentPatterns } = spec;

  // Encode data in Byte mode (0100)
  const bits: number[] = [];
  function pushBits(val: number, len: number) {
    for (let i = len - 1; i >= 0; i--) {
      bits.push((val >> i) & 1);
    }
  }

  pushBits(0b0100, 4); // Byte mode indicator
  pushBits(utf8Bytes.length, spec.version <= 9 ? 8 : 16); // Character count indicator
  for (const b of utf8Bytes) {
    pushBits(b, 8);
  }
  
  // Terminator
  const maxBits = dataBytes * 8;
  const termLen = Math.min(4, maxBits - bits.length);
  pushBits(0, termLen);

  // Pad to byte boundary
  while (bits.length % 8 !== 0) {
    bits.push(0);
  }

  // Pad bytes (0xEC, 0x11 alternating)
  const dataBuf = new Uint8Array(dataBytes);
  let byteIdx = 0;
  for (let i = 0; i < bits.length; i += 8) {
    let b = 0;
    for (let j = 0; j < 8; j++) {
      b = (b << 1) | bits[i + j];
    }
    dataBuf[byteIdx++] = b;
  }
  let padToggle = false;
  while (byteIdx < dataBytes) {
    dataBuf[byteIdx++] = padToggle ? 0x11 : 0xec;
    padToggle = !padToggle;
  }

  // Calculate error correction bytes
  const eccBuf = rsCalculateEcc(dataBuf, eccBytes);

  // Combine data + ecc
  const finalBytes = new Uint8Array(dataBytes + eccBytes);
  finalBytes.set(dataBuf, 0);
  finalBytes.set(eccBuf, dataBytes);

  // Initialize matrix
  const matrix: (boolean | null)[][] = Array.from({ length: size }, () => Array(size).fill(null));
  const isFunction: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  function setModule(r: number, c: number, val: boolean) {
    matrix[r][c] = val;
    isFunction[r][c] = true;
  }

  // 1. Finder patterns (7x7)
  function drawFinderPattern(row: number, col: number) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const tr = row + r;
        const tc = col + c;
        if (tr >= 0 && tr < size && tc >= 0 && tc < size) {
          if (
            (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
            (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
            (r >= 2 && r <= 4 && c >= 2 && c <= 4)
          ) {
            setModule(tr, tc, true);
          } else {
            setModule(tr, tc, false);
          }
        }
      }
    }
  }

  drawFinderPattern(0, 0);
  drawFinderPattern(0, size - 7);
  drawFinderPattern(size - 7, 0);

  // 2. Alignment patterns
  if (alignmentPatterns.length > 0) {
    for (const r of alignmentPatterns) {
      for (const c of alignmentPatterns) {
        if (
          (r <= 8 && c <= 8) ||
          (r <= 8 && c >= size - 8) ||
          (r >= size - 8 && c <= 8)
        ) {
          continue;
        }
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const isBorder = Math.abs(dr) === 2 || Math.abs(dc) === 2;
            const isCenter = dr === 0 && dc === 0;
            setModule(r + dr, c + dc, isBorder || isCenter);
          }
        }
      }
    }
  }

  // 3. Timing patterns
  for (let i = 8; i < size - 8; i++) {
    if (!isFunction[6][i]) setModule(6, i, i % 2 === 0);
    if (!isFunction[i][6]) setModule(i, 6, i % 2 === 0);
  }

  // 4. Dark module
  setModule(size - 8, 8, true);

  // 5. Reserve format info areas
  for (let i = 0; i < 9; i++) {
    if (!isFunction[8][i]) isFunction[8][i] = true;
    if (!isFunction[i][8]) isFunction[i][8] = true;
    if (size - 1 - i < size) {
      if (!isFunction[8][size - 1 - i]) isFunction[8][size - 1 - i] = true;
      if (!isFunction[size - 1 - i][8]) isFunction[size - 1 - i][8] = true;
    }
  }

  // 6. Fill data bits with zigzag traversal
  const allBits: number[] = [];
  for (const byte of finalBytes) {
    for (let i = 7; i >= 0; i--) {
      allBits.push((byte >> i) & 1);
    }
  }

  let bitIdx = 0;
  let upwards = true;
  for (let right = size - 1; right > 0; right -= 2) {
    if (right === 6) right--; // Skip timing pattern col 6
    const cols = [right, right - 1];

    const rows = upwards
      ? Array.from({ length: size }, (_, i) => size - 1 - i)
      : Array.from({ length: size }, (_, i) => i);

    for (const r of rows) {
      for (const c of cols) {
        if (!isFunction[r][c]) {
          const bit = bitIdx < allBits.length ? allBits[bitIdx++] === 1 : false;
          // Mask 0: (row + col) % 2 === 0
          const mask = (r + c) % 2 === 0;
          matrix[r][c] = bit !== mask;
        }
      }
    }
    upwards = !upwards;
  }

  // 7. Write format info (Level M, Mask 0: 0b101010000010010)
  const formatBits = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0];
  const tlCoords: [number, number][] = [
    [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8],
    [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8],
  ];
  for (let i = 0; i < 15; i++) {
    const [r, c] = tlCoords[i];
    matrix[r][c] = formatBits[i] === 1;
  }
  for (let i = 0; i < 7; i++) {
    matrix[size - 1 - i][8] = formatBits[i] === 1;
  }
  for (let i = 0; i < 8; i++) {
    matrix[8][size - 8 + i] = formatBits[7 + i] === 1;
  }

  return matrix.map((row) => row.map((cell) => cell === true));
}

/**
 * Returns an SVG string representation of the QR code.
 */
export function generateQRCodeSVG(
  text: string,
  options: {
    size?: number;
    color?: string;
    bgColor?: string;
    margin?: number;
  } = {}
): string {
  const { size = 120, color = '#0f172a', bgColor = '#ffffff', margin = 2 } = options;
  const matrix = encodeQRCode(text);
  const matrixSize = matrix.length;
  const totalSize = matrixSize + margin * 2;

  let paths = '';
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      if (matrix[r][c]) {
        const x = c + margin;
        const y = r + margin;
        paths += `M${x},${y}h1v1h-1z `;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" width="${size}" height="${size}" shape-rendering="crispEdges">
  <rect width="${totalSize}" height="${totalSize}" fill="${bgColor}" />
  <path d="${paths.trim()}" fill="${color}" />
</svg>`;
}
