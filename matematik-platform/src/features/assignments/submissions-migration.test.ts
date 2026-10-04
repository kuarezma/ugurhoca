import fs from 'node:fs';
import path from 'node:path';

const migrationPath = path.join(
  process.cwd(),
  'supabase/migrations/20261004140000_assignment_submissions_unique_late.sql',
);

it('adds an idempotent late column and unique constraint without deleting duplicate deliveries', () => {
  expect(fs.existsSync(migrationPath)).toBe(true);
  const sql = fs
    .readFileSync(migrationPath, 'utf8')
    .replace(/--[^\n]*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  expect(sql).toContain("SET lock_timeout = '5s'");
  // The runner owns the transaction; an inner COMMIT would end it early.
  expect(sql).not.toMatch(/\b(BEGIN|COMMIT)\s*;/i);
  expect(sql).toMatch(
    /ADD COLUMN IF NOT EXISTS late boolean NOT NULL DEFAULT false/i,
  );
  expect(sql).toMatch(/DO \$\$/i);
  expect(sql).toMatch(
    /GROUP BY assignment_id, student_id HAVING count\(\*\) > 1/i,
  );
  expect(sql).toMatch(/THEN RAISE NOTICE .* ELSE/i);
  expect(sql).toMatch(/pg_constraint/);
  expect(sql).toMatch(/UNIQUE \(assignment_id, student_id\)/i);
  expect(sql).not.toMatch(
    /\b(DELETE FROM|TRUNCATE|UPDATE public\.assignment_submissions|FOR UPDATE)\b/i,
  );
});

it('overwrites client lateness for every new row with an invoker trigger and fixed search path', () => {
  const sql = fs
    .readFileSync(migrationPath, 'utf8')
    .replace(/--[^\n]*/g, '')
    .replace(/\s+/g, ' ');
  expect(sql).toMatch(
    /CREATE OR REPLACE FUNCTION public\.set_assignment_submission_late\(\) RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = pg_catalog, public/i,
  );
  expect(sql).not.toMatch(/SECURITY DEFINER/i);
  expect(sql).toMatch(
    /NEW\.late := coalesce\(\( SELECT a\.due_date IS NOT NULL AND now\(\) > a\.due_date FROM public\.assignments a WHERE a\.id = NEW\.assignment_id \), false\); RETURN NEW;/i,
  );
  expect(sql).toMatch(
    /DROP TRIGGER IF EXISTS assignment_submission_late ON public\.assignment_submissions/i,
  );
  expect(sql).toMatch(
    /CREATE TRIGGER assignment_submission_late BEFORE INSERT ON public\.assignment_submissions FOR EACH ROW EXECUTE FUNCTION public\.set_assignment_submission_late\(\)/i,
  );
  const schema = fs.readFileSync(
    path.join(
      process.cwd(),
      'supabase/migrations/20260408170000_assignment_submissions.sql',
    ),
    'utf8',
  );
  expect(schema).toMatch(/due_date TIMESTAMP WITH TIME ZONE/i);
  expect(fs.readFileSync(migrationPath, 'utf8')).toContain(
    'Existing late values are not changed.',
  );
});

it('permits storage cleanup only for owned files without a delivery and grants no submission update', () => {
  const sql = fs
    .readFileSync(migrationPath, 'utf8')
    .replace(/--[^\n]*/g, '')
    .replace(/\s+/g, ' ');
  expect(sql).toContain(
    'DROP POLICY IF EXISTS submissions_student_delete_orphan ON storage.objects',
  );
  expect(sql).toMatch(
    /CREATE POLICY submissions_student_delete_orphan ON storage\.objects FOR DELETE TO authenticated/i,
  );
  expect(sql).toContain("bucket_id = 'submissions'");
  expect(sql).toContain(
    '(SELECT auth.uid())::text = (storage.foldername(name))[1]',
  );
  expect(sql).toMatch(
    /AND NOT EXISTS \( SELECT 1 FROM public\.assignment_submissions s WHERE s\.student_id = \(SELECT auth\.uid\(\)\)/i,
  );
  expect(sql).toContain(
    "right(s.file_url, length('/submissions/' || name)) = '/submissions/' || name",
  );
  expect(sql).not.toMatch(/FOR UPDATE|GRANT UPDATE/i);
});
