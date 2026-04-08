-- Update chat_users table to use student info instead of TC
-- Add new fields for student authentication
ALTER TABLE public.chat_users 
ADD COLUMN IF NOT EXISTS grade INTEGER,
ADD COLUMN IF NOT EXISTS school_number TEXT;

-- Update existing records to have default values
UPDATE public.chat_users 
SET grade = 5, school_number = 'unknown' 
WHERE grade IS NULL OR school_number IS NULL;

-- Add constraints for new fields
ALTER TABLE public.chat_users 
ADD CONSTRAINT chat_users_grade_check CHECK (grade >= 1 AND grade <= 12),
ADD CONSTRAINT chat_users_school_number_not_empty CHECK (school_number IS NOT NULL AND school_number != '');

-- Drop the TC number column (will be done after data migration)
-- ALTER TABLE public.chat_users DROP COLUMN IF EXISTS tc_number;

-- Create new unique constraint for student identification
ALTER TABLE public.chat_users 
ADD CONSTRAINT chat_users_student_unique UNIQUE (full_name, grade, school_number);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_chat_users_student_lookup ON public.chat_users(full_name, grade, school_number);
