import fs from 'node:fs/promises';
import path from 'node:path';

const rootDir = path.resolve(import.meta.dirname, '..');
const migrations = [
  '20260516120000_annual_plan_items.sql',
  '20260516123000_worksheet_candidates.sql',
  '20260517100000_google_drive_connections.sql',
];
const outputPath = path.join(rootDir, 'data', 'worksheet-automation-setup.sql');

const parts = [];

for (const migration of migrations) {
  const migrationPath = path.join(rootDir, 'supabase', 'migrations', migration);
  const sql = await fs.readFile(migrationPath, 'utf8');
  parts.push(`-- ${migration}\n${sql.trim()}\n`);
}

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(
  outputPath,
  [
    '-- Yaprak test otomasyonu Supabase SQL kurulumu',
    '-- Supabase Dashboard > SQL Editor içinde tek sefer çalıştırılabilir.',
    '',
    ...parts,
  ].join('\n'),
);

console.log(`Oluşturuldu: ${outputPath}`);
