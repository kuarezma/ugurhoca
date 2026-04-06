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
  toBool,
  toFloat,
  toInt,
} from './import/utils.mjs';

function normalizeRow(row, index, forcedYear) {
  const year = forcedYear ?? toInt(row.year, null);
  if (!year) {
    throw new Error(`Missing 'year' at row ${index + 1}`);
  }

  const schoolName = requiredString(row.school_name ?? row.schoolName, 'school_name', index);
  const province = requiredString(row.province, 'province', index);
  const district = requiredString(row.district, 'district', index);
  const schoolType = requiredString(row.school_type ?? row.schoolType, 'school_type', index);
  const baseScore = toFloat(row.base_score ?? row.baseScore, null);

  if (baseScore === null) {
    throw new Error(`Missing/invalid 'base_score' at row ${index + 1}`);
  }

  return {
    year,
    school_name: schoolName,
    province,
    district,
    school_type: schoolType,
    placement_mode: optionalString(row.placement_mode ?? row.placementMode) ?? 'central',
    instruction_language: optionalString(row.instruction_language ?? row.instructionLanguage) ?? 'Turkce',
    boarding: toBool(row.boarding, false),
    prep_class: toBool(row.prep_class ?? row.prepClass, false),
    base_score: Number(baseScore.toFixed(2)),
    national_percentile: toFloat(row.national_percentile ?? row.nationalPercentile, null),
    quota_total: toInt(row.quota_total ?? row.quotaTotal, null),
    source_url: optionalString(row.source_url ?? row.sourceUrl),
    source_year: toInt(row.source_year ?? row.sourceYear, year),
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
    : rootPath('data/import/lgs_school_targets_2026.json');

  const rawRows = await loadJsonArray(filePath);
  const dedup = new Map();

  rawRows.forEach((row, index) => {
    const normalized = normalizeRow(row, index, forcedYear);
    const uniqueKey = `${normalized.year}-${normalized.school_name}-${normalized.district}`;
    dedup.set(uniqueKey, normalized);
  });

  const rows = [...dedup.values()];
  const years = [...new Set(rows.map((row) => row.year))].sort((a, b) => a - b);
  const provinces = [...new Set(rows.map((row) => row.province))].sort((a, b) => a.localeCompare(b, 'tr'));

  printSummary('LGS import summary', rows, {
    years,
    extra: [
      `Provinces: ${provinces.length}`,
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
    const { error: deleteError } = await supabase.from('lgs_school_targets').delete().in('year', years);
    if (deleteError) throw deleteError;
  }

  const batches = chunk(rows, 200);

  for (let i = 0; i < batches.length; i += 1) {
    const batch = batches[i];
    const { error } = await supabase
      .from('lgs_school_targets')
      .upsert(batch, { onConflict: 'year,school_name,district' });

    if (error) {
      throw error;
    }

    console.log(`Upserted batch ${i + 1}/${batches.length} (${batch.length} rows)`);
  }

  for (const year of years) {
    const { count, error } = await supabase
      .from('lgs_school_targets')
      .select('id', { count: 'exact', head: true })
      .eq('year', year);

    if (error) throw error;
    console.log(`Year ${year}: ${count ?? 0} rows in table`);
  }
}

run().catch((error) => {
  console.error('\nLGS import failed:');
  console.error(error.message || error);
  process.exit(1);
});
