#!/usr/bin/env node
/**
 * Haftalık Yaprak Test Senkronizasyon Betiği (Google Drive Desktop -> Supabase)
 *
 * Kullanım:
 *   node scripts/sync-weekly-worksheets.mjs --week "19-23 Ekim Haftası" [--dry-run]
 *
 * Görevleri:
 *   1. /Users/ugurmac/Desktop/OKUL/2026-2027_Egitim_Ogretim_Yili/{5,6,7,8}. Sınıf Matematik/Yaprak Testler/<hafta>/
 *      altındaki *_Ogrenci.pdf ve *_Ogretmen_Cozumlu.pdf dosyalarını bulur.
 *   2. pdftotext ile zorunlu gizlilik denetiminden geçirir (Okul Müdürü, Mustafa ÖZKAN,
 *      Ali Rıza HACIOĞLU, özel ders vb. ibareleri reddeder).
 *   3. Dosyaları Google Drive Desktop klasörüne (/Drive'ım/web sitesi/yaprak test/2026-2027/{Sınıf}/)
 *      kopyalar ve com.google.drivefs.item-id#S xattr değerinden Drive File ID'sini okur.
 *   4. Supabase public.documents tablosuna standart başlık, kazanım kodu, worksheet_order
 *      ve __WS_META__ açıklamasıyla kaydeder.
 */

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const FORBIDDEN_PATTERNS = [
  /Okul\s+Müdürü/i,
  /Mustafa\s+ÖZKAN/i,
  /Ali\s+Rıza\s+HACIOĞLU/i,
  /özel\s+ders/i,
];

const OKUL_BASE = "/Users/ugurmac/Desktop/OKUL/2026-2027_Egitim_Ogretim_Yili";
const DRIVE_BASE =
  "/Users/ugurmac/Library/CloudStorage/GoogleDrive-yasayanugur@gmail.com/Drive'ım/web sitesi/yaprak test/2026-2027";

function loadEnv(envPath) {
  const env = {};
  if (!fs.existsSync(envPath)) return env;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, "");
    }
  }
  return env;
}

function checkPdfPrivacy(pdfPath) {
  try {
    const text = execFileSync("pdftotext", [pdfPath, "-"], {
      encoding: "utf8",
    });
    for (const pattern of FORBIDDEN_PATTERNS) {
      if (pattern.test(text)) {
        throw new Error(
          `Gizlilik ihlali tespit edildi (${pattern}): ${pdfPath}`
        );
      }
    }
  } catch (err) {
    if (err.message?.startsWith("Gizlilik ihlali")) throw err;
    throw new Error(`pdftotext çalıştırılamadı (${pdfPath}): ${err.message}`);
  }
}

function ensureDriveAppRunning() {
  try {
    execFileSync("pgrep", ["-f", "Google Drive"], { stdio: "ignore" });
  } catch {
    try {
      execFileSync("open", ["-a", "Google Drive"], { stdio: "ignore" });
    } catch {
      // ignore if app launch fails
    }
  }
}

function getDriveItemId(filePath, retries = 25) {
  ensureDriveAppRunning();
  for (let i = 0; i < retries; i++) {
    try {
      const id = execFileSync(
        "xattr",
        ["-p", "com.google.drivefs.item-id#S", filePath],
        { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }
      ).trim();
      if (id && !id.startsWith("local-")) return id;
    } catch {
      // DriveFS henüz senkronize etmemiş olabilir
    }
    execFileSync("sleep", ["2"]);
  }
  throw new Error(`Google Drive ID alınamadı: ${filePath}`);
}

async function main() {
  const args = process.argv.slice(2);
  const weekIdx = args.indexOf("--week");
  const dryRun = args.includes("--dry-run");

  if (weekIdx === -1 || !args[weekIdx + 1]) {
    console.error(
      'Kullanım: node scripts/sync-weekly-worksheets.mjs --week "19-23 Ekim Haftası" [--dry-run]'
    );
    process.exit(1);
  }

  const weekFolder = args[weekIdx + 1];
  const env = loadEnv(path.resolve(process.cwd(), ".env.local"));
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error(".env.local içinde NEXT_PUBLIC_SUPABASE_URL veya SUPABASE_SERVICE_ROLE_KEY eksik.");
  }

  console.log(`Hafta taranıyor: ${weekFolder} (dryRun=${dryRun})`);

  for (const grade of [5, 6, 7, 8]) {
    const srcDir = path.join(
      OKUL_BASE,
      `${grade}. Sınıf Matematik`,
      "Yaprak Testler",
      weekFolder
    );
    if (!fs.existsSync(srcDir)) {
      console.warn(`[${grade}. Sınıf] Klasör bulunamadı: ${srcDir}`);
      continue;
    }

    const files = fs.readdirSync(srcDir).sort();
    const studentPdfs = files.filter((f) => f.endsWith("_Yaprak_Test_Ogrenci.pdf"));

    if (studentPdfs.length === 0) {
      console.warn(`[${grade}. Sınıf] Öğrenci PDF bulunamadı: ${srcDir}`);
      continue;
    }

    for (const studentPdf of studentPdfs) {
      const prefix = studentPdf.replace(/_Ogrenci\.pdf$/, "");
      const teacherCandidate = `${prefix}_Ogretmen_Cozumlu.pdf`;
      const teacherPdf = files.includes(teacherCandidate) ? teacherCandidate : null;

      const studentSrc = path.join(srcDir, studentPdf);
      checkPdfPrivacy(studentSrc);

      let teacherSrc = null;
      if (teacherPdf) {
        teacherSrc = path.join(srcDir, teacherPdf);
        checkPdfPrivacy(teacherSrc);
      }

      console.log(`[${grade}. Sınıf] Gizlilik denetimi BAŞARILI: ${studentPdf}`);

      if (dryRun) continue;

      const destDir = path.join(DRIVE_BASE, `${grade}. Sınıf`);
      fs.mkdirSync(destDir, { recursive: true });

      const studentDest = path.join(destDir, studentPdf);
      fs.copyFileSync(studentSrc, studentDest);
      const studentDriveId = getDriveItemId(studentDest);

      let teacherDriveId = null;
      if (teacherSrc && teacherPdf) {
        const teacherDest = path.join(destDir, teacherPdf);
        fs.copyFileSync(teacherSrc, teacherDest);
        teacherDriveId = getDriveItemId(teacherDest);
      }

      console.log(
        `[${grade}. Sınıf] (${studentPdf}) Drive ID -> Öğrenci: ${studentDriveId}, Çözümlü: ${teacherDriveId ?? "-"}`
      );
    }
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
