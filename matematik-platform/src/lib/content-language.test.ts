import fs from 'node:fs';
import path from 'node:path';

const PROJECT_ROOT = process.cwd();
const SCAN_ROOTS = ['src/app', 'src/components', 'src/features', 'public'];
const SCAN_EXTENSIONS = new Set([
  '.css',
  '.html',
  '.json',
  '.ts',
  '.tsx',
]);
const EXCLUDED_SUFFIXES = [
  '.test.ts',
  '.test.tsx',
  '.spec.ts',
  '.spec.tsx',
  '.d.ts',
];
const WORD_CHARS = 'A-Za-zÇĞİÖŞÜçğıöşü0-9_';

const prohibitedPatterns = [
  'abonelik',
  'odeme',
  'ödeme',
  'paket',
  'premium',
  'satin al',
  'satın al',
  'ucretli plan',
  'ücretli plan',
  'veli',
].map((term) => ({
  pattern: new RegExp(
    `(^|[^${WORD_CHARS}])${term.replace(/\s+/g, '\\s+')}([^${WORD_CHARS}]|$)`,
    'iu',
  ),
  term,
}));

const walkTextFiles = (root: string): string[] => {
  const absoluteRoot = path.join(PROJECT_ROOT, root);
  if (!fs.existsSync(absoluteRoot)) return [];

  const files: string[] = [];
  const entries = fs.readdirSync(absoluteRoot, { withFileTypes: true });

  for (const entry of entries) {
    const absolutePath = path.join(absoluteRoot, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkTextFiles(path.relative(PROJECT_ROOT, absolutePath)));
      continue;
    }

    const extension = path.extname(entry.name);
    const isExcluded = EXCLUDED_SUFFIXES.some((suffix) =>
      entry.name.endsWith(suffix),
    );

    if (entry.isFile() && SCAN_EXTENSIONS.has(extension) && !isExcluded) {
      files.push(absolutePath);
    }
  }

  return files;
};

describe('content language rules', () => {
  it('keeps public application copy free of paid or parent-focused wording', () => {
    const violations = SCAN_ROOTS.flatMap(walkTextFiles).flatMap((filePath) => {
      const content = fs.readFileSync(filePath, 'utf8');
      return prohibitedPatterns
        .filter(({ pattern }) => pattern.test(content))
        .map(({ term }) => `${path.relative(PROJECT_ROOT, filePath)}: ${term}`);
    });

    expect(violations).toEqual([]);
  });
});
