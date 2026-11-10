function slugify(text: string): string {
  const trMap: Record<string, string> = {
    ç: 'c',
    Ç: 'c',
    ğ: 'g',
    Ğ: 'g',
    ı: 'i',
    I: 'i',
    İ: 'i',
    i: 'i',
    ö: 'o',
    Ö: 'o',
    ş: 's',
    Ş: 's',
    ü: 'u',
    Ü: 'u',
  };

  const replaced = text.replace(/[çÇğĞıIİöÖşŞüÜ]/g, (c) => trMap[c] || c);
  return replaced
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function buildDocumentSlug(doc: {
  id: string;
  title: string;
  grade?: (number | string)[] | null;
}): string {
  const baseSlug = slugify(doc.title || '');
  let gradePrefix = '';

  if (Array.isArray(doc.grade) && doc.grade.length > 0) {
    const rawGrade = doc.grade[0];
    if (rawGrade !== undefined && rawGrade !== null) {
      const gradeStr = String(rawGrade).trim();
      if (gradeStr.toLowerCase() === 'mezun') {
        gradePrefix = 'mezun';
      } else {
        const num = Number.parseInt(gradeStr, 10);
        if (!Number.isNaN(num) && num > 0) {
          gradePrefix = `${num}-sinif`;
        } else if (gradeStr) {
          gradePrefix = slugify(gradeStr);
        }
      }
    }
  }

  let fullSlug = baseSlug;
  if (gradePrefix) {
    if (!baseSlug.startsWith(gradePrefix)) {
      fullSlug = baseSlug ? `${gradePrefix}-${baseSlug}` : gradePrefix;
    }
  }

  if (!fullSlug) {
    fullSlug = 'icerik';
  }

  return `${fullSlug}--${doc.id}`;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function extractDocumentIdFromSlug(slug: string): string | null {
  if (!slug || typeof slug !== 'string') {
    return null;
  }

  const trimmed = slug.trim();
  if (!trimmed) {
    return null;
  }

  if (UUID_REGEX.test(trimmed)) {
    return trimmed;
  }

  const separatorIndex = trimmed.lastIndexOf('--');
  if (separatorIndex !== -1) {
    const candidateId = trimmed.slice(separatorIndex + 2).trim();
    if (UUID_REGEX.test(candidateId)) {
      return candidateId;
    }
  }

  return null;
}
