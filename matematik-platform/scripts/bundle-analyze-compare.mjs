#!/usr/bin/env node
/**
 * Önce/sonra webpack bundle raporu (client + nodejs + edge).
 *
 * Kullanım (matematik-platform kökünden):
 *   npm run analyze:compare -- HEAD~1
 *   npm run analyze:compare -- 30b413b
 *
 * - BASE_REF: karşılaştırılacaki eski commit (varsayılan: HEAD~1)
 * - "Güncel": çalışma ağacındaki (staged/unstaged dahil) kaynak + mevcut HEAD
 *
 * Not: Baseline derlemesinde bu repodaki next.config.js (bundle-analyzer) kopyalanır;
 * böylece analyzer paketi eski commit'te yoksa bile rapor üretilebilir. Kaynak dosyalar
 * seçilen commit'ten gelir.
 */

import { execSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MP = resolve(__dirname, '..');
const REPO_ROOT = resolve(MP, '..');

const baseRef = process.argv[2] ?? 'HEAD~1';

/** package.json'da "analyze" script'i olmayan commit'lerde de çalışır */
const ANALYZE_BUILD_CMD =
  'cross-env ANALYZE=true ANALYZE_OPEN=false npx next build --webpack';

function sh(cmd, opts = {}) {
  console.log(`\n→ ${cmd}\n`);
  execSync(cmd, { stdio: 'inherit', shell: '/bin/bash', ...opts });
}

function shOut(cmd, opts = {}) {
  return execSync(cmd, {
    encoding: 'utf8',
    shell: '/bin/bash',
    ...opts,
  }).trim();
}

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const outRoot = join(MP, 'bundle-reports', stamp);
mkdirSync(outRoot, { recursive: true });

const baseHash = shOut(`git rev-parse ${baseRef}`, { cwd: REPO_ROOT });
const headHash = shOut('git rev-parse HEAD', { cwd: REPO_ROOT });
const baseSubject = shOut(`git log -1 --format=%s ${baseRef}`, {
  cwd: REPO_ROOT,
});
const headSubject = shOut(`git log -1 --format=%s HEAD`, { cwd: REPO_ROOT });

const wt = mkdtempSync(join(tmpdir(), 'ugurhoca-bundle-'));

try {
  sh(`git worktree add --detach "${wt}" ${baseRef}`, { cwd: REPO_ROOT });

  const wtMp = join(wt, 'matematik-platform');
  if (!existsSync(wtMp)) {
    throw new Error(`Worktree içinde matematik-platform yok: ${wtMp}`);
  }

  // Aynı analyzer + webpack derlemesi için next.config kopyala
  cpSync(join(MP, 'next.config.js'), join(wtMp, 'next.config.js'));

  sh('npm install', { cwd: wtMp });
  sh(
    'npm install --save-dev @next/bundle-analyzer@^15 cross-env@^7 --no-fund --no-audit',
    { cwd: wtMp },
  );

  sh(ANALYZE_BUILD_CMD, { cwd: wtMp });

  const baseDest = join(outRoot, 'base');
  mkdirSync(baseDest, { recursive: true });
  cpSync(join(wtMp, '.next', 'analyze'), baseDest, { recursive: true });
} finally {
  try {
    sh(`git worktree remove --force "${wt}"`, { cwd: REPO_ROOT });
  } catch {
    sh('git worktree prune', { cwd: REPO_ROOT });
    rmSync(wt, { recursive: true, force: true });
  }
}

sh(ANALYZE_BUILD_CMD, { cwd: MP });
const currentDest = join(outRoot, 'current');
mkdirSync(currentDest, { recursive: true });
cpSync(join(MP, '.next', 'analyze'), currentDest, { recursive: true });

const indexHtml = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Bundle raporu — önce / sonra</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 56rem; margin: 2rem auto; padding: 0 1rem; line-height: 1.5; }
    h1 { font-size: 1.25rem; }
    table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
    th, td { border: 1px solid #cbd5e1; padding: 0.5rem 0.75rem; text-align: left; }
    th { background: #f1f5f9; }
    a { color: #4f46e5; }
    code { font-size: 0.85em; background: #f1f5f9; padding: 0.1rem 0.35rem; border-radius: 0.25rem; }
  </style>
</head>
<body>
  <h1>Webpack bundle analizi — önce / sonra</h1>
  <p>Aynı <code>next build --webpack</code> + bundle-analyzer ile üretildi.</p>
  <table>
    <tr><th></th><th>Commit</th><th>Özet</th></tr>
    <tr><td><strong>Önce (baseline)</strong></td><td><code>${baseHash}</code></td><td>${escapeHtml(baseSubject)}</td></tr>
    <tr><td><strong>Sonra (güncel)</strong></td><td><code>${headHash}</code></td><td>${escapeHtml(headSubject)}</td></tr>
  </table>
  <h2>Raporlar</h2>
  <ul>
    <li><strong>Client (tarayıcı)</strong><br />
      <a href="base/client.html">Önce — client</a> ·
      <a href="current/client.html">Sonra — client</a>
    </li>
    <li><strong>Node.js (sunucu)</strong><br />
      <a href="base/nodejs.html">Önce — nodejs</a> ·
      <a href="current/nodejs.html">Sonra — nodejs</a>
    </li>
    <li><strong>Edge</strong><br />
      <a href="base/edge.html">Önce — edge</a> ·
      <a href="current/edge.html">Sonra — edge</a>
    </li>
  </ul>
  <p><small>Klasör: <code>${outRoot}</code></small></p>
</body>
</html>
`;

writeFileSync(join(outRoot, 'index.html'), indexHtml, 'utf8');

console.log(`\n✓ Raporlar hazır:\n  ${join(outRoot, 'index.html')}\n`);

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
