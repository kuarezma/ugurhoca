# Program Data Import

This folder contains JSON snapshots used by the import scripts:

- `lgs_school_targets_2021_2025.json`
- `lgs_school_targets_2025.json`
- `lgs_school_targets_2024.json`
- `lgs_school_targets_2026.json`
- `yks_program_targets_2025.json`

## Refresh source snapshots

```bash
npm run fetch:lgs
npm run fetch:yks
```

`fetch:lgs` scrapes the province pages under `https://tabanpuanlari.tr/lise`, extracts `2025-2022` rows from the HTML tables, supplements `2021` from the official MEB PDF, and produces a combined `2021-2025` LGS history snapshot. It also refreshes the `2025` subset snapshot.

`fetch:yks` pulls the 2025 YOK Atlas preference wizard tables for `TYT`, `SAY`, `EA` and `SOZ` directly from `yokatlas.yok.gov.tr`.

## Run in dry mode

```bash
npm run import:lgs:dry
npm run import:yks:dry
```

## Run actual upsert

Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`, then:

```bash
npm run import:lgs
npm run import:yks
```

## Optional flags

- `--file=...` custom source file
- `--year=2026` force year for all rows
- `--truncate` delete existing rows for target years before import
- `--dry-run` parse/validate without DB write

Examples:

```bash
npm run import:lgs -- --file=data/import/lgs_school_targets_2021_2025.json --truncate
npm run import:yks -- --year=2025 --dry-run
```

## Required JSON fields

### LGS rows

- `year`
- `school_name`
- `province`
- `district`
- `school_type`
- `base_score`

Optional fields:

- `placement_mode`
- `instruction_language`
- `boarding`
- `prep_class`
- `national_percentile`
- `quota_total`
- `source_url`
- `source_year`

### YKS rows

- `year`
- `program_code`
- `university_name`
- `university_type`
- `program_name`
- `level` (`lisans` | `onlisans`)
- `city`
- `score_type` (`TYT` | `SAY` | `EA` | `SOZ`)

Optional fields:

- `faculty_or_school`
- `teaching_type`
- `scholarship_rate`
- `instruction_language`
- `quota_total`
- `base_rank`
- `base_score`
- `source_url_osym`
- `source_url_yokatlas`
