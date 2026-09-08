/* eslint-disable */
/**
 * Web Worker & OffscreenCanvas İzolasyon Scripti
 * Ağır matematiksel hesaplamaları ve dinamik geometri/grafik çizimlerini
 * ana iş parçacığından (main thread) izole ederek 60/120 FPS akıcılık sağlar.
 */

self.onmessage = function (e) {
  var data = e.data || {};
  var type = data.type;

  if (type === 'INIT_CANVAS') {
    initOffscreenCanvas(data.canvas, data.width, data.height);
  } else if (type === 'RESIZE') {
    resizeCanvas(data.width, data.height);
  } else if (type === 'CALCULATE_PRIMES') {
    var max = data.max || 100000;
    var primes = findPrimes(max);
    self.postMessage({ type: 'PRIMES_RESULT', primes: primes, count: primes.length });
  } else if (type === 'FACTORIZE') {
    var num = data.number || 0;
    var factors = primeFactors(num);
    self.postMessage({ type: 'FACTORIZE_RESULT', number: num, factors: factors });
  } else if (type === 'START_ANIMATION') {
    startAnimation(data.speed || 1);
  } else if (type === 'STOP_ANIMATION') {
    stopAnimation();
  }
};

// --- OffscreenCanvas Rendering Engine ---
var canvas = null;
var ctx = null;
var animFrameId = null;
var angle = 0;
var animSpeed = 1;

function initOffscreenCanvas(offscreenCanvas, w, h) {
  if (!offscreenCanvas) return;
  canvas = offscreenCanvas;
  if (w) canvas.width = w;
  if (h) canvas.height = h;
  ctx = canvas.getContext('2d');
  if (ctx) {
    drawFrame();
  }
}

function resizeCanvas(w, h) {
  if (!canvas) return;
  if (w) canvas.width = w;
  if (h) canvas.height = h;
  if (!animFrameId && ctx) {
    drawFrame();
  }
}

function startAnimation(speed) {
  animSpeed = speed || 1;
  if (animFrameId) return;
  renderLoop();
}

function stopAnimation() {
  if (animFrameId) {
    if (typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(animFrameId);
    } else {
      clearTimeout(animFrameId);
    }
    animFrameId = null;
  }
}

function renderLoop() {
  angle += 0.02 * animSpeed;
  drawFrame();
  if (typeof requestAnimationFrame === 'function') {
    animFrameId = requestAnimationFrame(renderLoop);
  } else {
    animFrameId = setTimeout(renderLoop, 16);
  }
}

function drawFrame() {
  if (!ctx || !canvas) return;
  var w = canvas.width;
  var h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  var centerX = w / 2;
  var centerY = h / 2;
  var radius = Math.min(centerX, centerY) * 0.7;

  ctx.save();
  ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 2;

  var steps = 120;
  for (var i = 0; i <= steps; i++) {
    var t = (i / steps) * Math.PI * 2;
    var x = centerX + Math.sin(t * 3 + angle) * radius * 0.8;
    var y = centerY + Math.cos(t * 2 + angle) * radius * 0.8;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.stroke();

  var px = centerX + Math.sin(angle * 2) * radius * 0.8;
  var py = centerY + Math.cos(angle * 2) * radius * 0.8;
  ctx.fillStyle = '#60a5fa';
  ctx.beginPath();
  ctx.arc(px, py, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function findPrimes(max) {
  var limit = Math.min(max, 1000000);
  var sieve = new Uint8Array(limit + 1);
  var primes = [];
  for (var i = 2; i <= limit; i++) {
    if (sieve[i] === 0) {
      primes.push(i);
      for (var j = i * 2; j <= limit; j += i) {
        sieve[j] = 1;
      }
    }
  }
  return primes;
}

function primeFactors(n) {
  var factors = [];
  var d = 2;
  var num = Math.abs(Math.floor(n));
  if (num < 2) return [];

  while (d * d <= num) {
    if (num % d === 0) {
      factors.push(d);
      num = Math.floor(num / d);
    } else {
      d = d === 2 ? 3 : d + 2;
    }
  }
  if (num > 1) {
    factors.push(num);
  }
  return factors;
}
