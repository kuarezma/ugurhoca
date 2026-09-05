import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const TARGET_URL = 'http://localhost:3000';
const OUTPUT_FILE = '/Users/ugurmac/Desktop/ugurhoca/docs/screenshots/homepage-desktop.jpg';
const PORT = 9222;

async function main() {
  console.log('Launching headless Chrome...');
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--window-size=1440,900',
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank'
  ]);

  let wsUrl = null;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 300));
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (res.ok) {
        const data = await res.json();
        wsUrl = data.webSocketDebuggerUrl;
        break;
      }
    } catch {
      // retry
    }
  }

  if (!wsUrl) {
    chrome.kill();
    throw new Error('Failed to connect to Chrome DevTools port ' + PORT);
  }

  console.log('Connected to Chrome via CDP:', wsUrl);
  const ws = new WebSocket(wsUrl);

  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  let id = 1;
  const pending = new Map();

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
  };

  const send = (method, params = {}) => {
    const msgId = id++;
    return new Promise((resolve, reject) => {
      pending.set(msgId, { resolve, reject });
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  };

  const { targetId } = await send('Target.createTarget', { url: TARGET_URL });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });

  const sendSession = (method, params = {}) => {
    const msgId = id++;
    return new Promise((resolve, reject) => {
      pending.set(msgId, { resolve, reject });
      ws.send(JSON.stringify({ id: msgId, sessionId, method, params }));
    });
  };

  await sendSession('Page.enable');
  await sendSession('Runtime.enable');
  await sendSession('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 1020,
    deviceScaleFactor: 2,
    mobile: false
  });

  await sendSession('Page.navigate', { url: TARGET_URL });

  // Wait for real content to be mounted (not skeleton)
  console.log('Waiting for page content to render...');
  for (let i = 0; i < 30; i++) {
    const { result } = await sendSession('Runtime.evaluate', {
      expression: `Boolean(document.body?.innerText?.includes('Matematiğe hoş geldin'))`
    });
    if (result && result.value) {
      console.log('Content rendered!');
      break;
    }
    await new Promise(r => setTimeout(r, 500));
  }

  // Allow animations and fonts to settle
  await new Promise(r => setTimeout(r, 2500));

  // Dismiss prompts cleanly
  await sendSession('Runtime.evaluate', {
    expression: `
      localStorage.setItem('ugurhoca:cookie-consent', 'accepted');
      localStorage.setItem('ugurhoca_pwa_dismissed', 'true');
      sessionStorage.setItem('ugurhoca_pwa_dismissed', 'true');

      document.querySelectorAll('button[aria-label*="kapat"], [aria-label="Çerez bildirimini kapat"]').forEach(b => b.click());
      
      // Remove PWA floating box
      document.querySelectorAll('.fixed').forEach(el => {
        if (el.textContent && el.textContent.includes('Uygulamasını Yükle')) {
          el.remove();
        }
      });
    `
  });

  await new Promise(r => setTimeout(r, 1000));

  console.log('Capturing screenshot...');
  const { data } = await sendSession('Page.captureScreenshot', {
    format: 'jpeg',
    quality: 92,
    clip: {
      x: 0,
      y: 0,
      width: 1440,
      height: 980,
      scale: 1
    }
  });

  const buffer = Buffer.from(data, 'base64');
  writeFileSync(OUTPUT_FILE, buffer);
  console.log(`Saved screenshot to ${OUTPUT_FILE} (${buffer.length} bytes)`);

  ws.close();
  chrome.kill();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
