import {
  chunk,
  createAdminClient,
  loadEnv,
  loadJsonArray,
  optionalString,
  parseArgs,
  printSummary,
  requiredString,
  rootPath,
  toFloat,
  toInt,
} from './import/utils.mjs';

const allowedLevels = new Set(['lisans', 'onlisans']);
const allowedScoreTypes = new Set(['TYT', 'SAY', 'EA', 'SOZ']);

function normalizeScoreType(value, index) {
  const type = requiredString(value, 'score_type', index).toUpperCase();
  if (!allowedScoreTypes.has(type)) {
    throw new Error(`Invalid score_type '${type}' at row ${index + 1}. Allowed: TYT, SAY, EA, SOZ`);
  }
  return type;
}

function normalizeLevel(value, index) {
  const level = requiredString(value, 'level', index).toLowerCase();
  if (!allowedLevels.has(level)) {
    throw new Error(`Invalid level '${level}' at row ${index + 1}. Allowed: lisans, onlisans`);
  }
  return level;
}

function normalizeRow(row, index, forcedYear) {
  const year = forcedYear ?? toInt(row.year, null);
  if (!year) {
    throw new Error(`Missing 'year' at row ${index + 1}`);
  }

  const programCode = requiredString(row.program_code ?? row.programCode, 'program_code', index);

  return {
    year,
    program_code: programCode,
    university_name: requiredString(row.university_name ?? row.universityName, 'university_name', index),
    university_type: requiredString(row.university_type ?? row.universityType, 'university_type', index),
    faculty_or_school: optionalString(row.faculty_or_school ?? row.facultyOrSchool),
    program_name: requiredString(row.program_name ?? row.programName, 'program_name', index),
    level: normalizeLevel(row.level, index),
    city: requiredString(row.city, 'city', index),
    score_type: normalizeScoreType(row.score_type ?? row.scoreType, index),
    teaching_type: optionalString(row.teaching_type ?? row.teachingType) ?? 'Orgun',
    scholarship_rate: toInt(row.scholarship_rate ?? row.scholarshipRate, 0),
    instruction_language: optionalString(row.instruction_language ?? row.instructionLanguage) ?? 'Turkce',
    quota_total: toInt(row.quota_total ?? row.quotaTotal, null),
    base_rank: toInt(row.base_rank ?? row.baseRank, null),
    base_score: toFloat(row.base_score ?? row.baseScore, null),
    source_url_osym: optionalString(row.source_url_osym ?? row.sourceUrlOsym),
    source_url_yokatlas: optionalString(row.source_url_yokatlas ?? row.sourceUrlYokatlas),
  };
}

async function run() {
  loadEnv();
  const args = parseArgs(process.argv.slice(2));

  const dryRun = Boolean(args['dry-run']);
  const truncate = Boolean(args.truncate);
  const forcedYear = args.year ? toInt(args.year, null) : null;

  const filePath = args.file
    ? rootPath(String(args.file))
    : rootPath('data/import/yks_program_targets_2025.json');

  const rawRows = await loadJsonArray(filePath);
  const dedup = new Map();

  rawRows.forEach((row, index) => {
    const normalized = normalizeRow(row, index, forcedYear);
    const uniqueKey = `${normalized.year}-${normalized.program_code}`;
    dedup.set(uniqueKey, normalized);
  });

  const rows = [...dedup.values()];
  const years = [...new Set(rows.map((row) => row.year))].sort((a, b) => a - b);
  const scoreTypes = [...new Set(rows.map((row) => row.score_type))].sort();

  printSummary('YKS import summary', rows, {
    years,
    extra: [
      `Score types: ${scoreTypes.join(', ')}`,
      `Source file: ${filePath}`,
      `Mode: ${dryRun ? 'dry-run' : 'upsert'}`,
    ],
  });

  if (!rows.length) {
    throw new Error('No rows found in source file.');
  }

  if (dryRun) {
    console.log('Dry-run completed. No database write performed.');
    return;
  }

  const supabase = createAdminClient();

  if (truncate) {
    console.log(`Deleting existing rows for years: ${years.join(', ')}`);
    const { error: deleteError } = await supabase.from('yks_program_targets').delete().in('year', years);
    if (deleteError) throw deleteError;
  }

  const batches = chunk(rows, 200);

  for (let i = 0; i < batches.length; i += 1) {
    const batch = batches[i];
    const { error } = await supabase
      .from('yks_program_targets')
      .upsert(batch, { onConflict: 'year,program_code' });

    if (error) {
      throw error;
    }

    console.log(`Upserted batch ${i + 1}/${batches.length} (${batch.length} rows)`);
  }

  for (const year of years) {
    const { count, error } = await supabase
      .from('yks_program_targets')
      .select('id', { count: 'exact', head: true })
      .eq('year', year);

    if (error) throw error;
    console.log(`Year ${year}: ${count ?? 0} rows in table`);
  }
}

run().catch((error) => {
  console.error('\nYKS import failed:');
  console.error(error.message || error);
  process.exit(1);
});
