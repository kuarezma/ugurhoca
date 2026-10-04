BEGIN;

SET LOCAL lock_timeout = '5s';

ALTER TABLE public.assignment_submissions
  ADD COLUMN IF NOT EXISTS late boolean NOT NULL DEFAULT false;

-- Only new deliveries calculate lateness. Existing late values are not changed.
-- assignments.due_date is timestamptz (20260408170000); compare the exact deadline.
CREATE OR REPLACE FUNCTION public.set_assignment_submission_late()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
BEGIN
  -- coalesce: if RLS hides the assignment the row must still insert (late NOT NULL).
  NEW.late := coalesce((
    SELECT a.due_date IS NOT NULL AND now() > a.due_date
    FROM public.assignments a
    WHERE a.id = NEW.assignment_id
  ), false);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS assignment_submission_late ON public.assignment_submissions;
CREATE TRIGGER assignment_submission_late
BEFORE INSERT ON public.assignment_submissions
FOR EACH ROW EXECUTE FUNCTION public.set_assignment_submission_late();

-- Permit cleanup of a losing concurrent upload, never a recorded delivery.
DROP POLICY IF EXISTS submissions_student_delete_orphan ON storage.objects;
CREATE POLICY submissions_student_delete_orphan ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'submissions'
  AND (SELECT auth.uid())::text = (storage.foldername(name))[1]
  AND NOT EXISTS (
    SELECT 1 FROM public.assignment_submissions s
    WHERE s.student_id = (SELECT auth.uid())
      AND right(s.file_url, length('/submissions/' || name)) = '/submissions/' || name
  )
);

-- Retain every existing submission. Duplicates require a separate data decision.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.assignment_submissions
    GROUP BY assignment_id, student_id
    HAVING count(*) > 1
  ) THEN
    RAISE NOTICE 'assignment_submissions contains duplicate (assignment_id, student_id) rows; unique constraint was not added. No rows were changed.';
  ELSE
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conrelid = 'public.assignment_submissions'::regclass
        AND conname = 'assignment_submissions_assignment_student_key'
    ) THEN
      ALTER TABLE public.assignment_submissions
        ADD CONSTRAINT assignment_submissions_assignment_student_key
        UNIQUE (assignment_id, student_id);
    END IF;
  END IF;
END;
$$;

COMMIT;
