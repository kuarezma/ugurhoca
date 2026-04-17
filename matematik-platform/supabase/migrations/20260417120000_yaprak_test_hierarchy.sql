ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS learning_outcome TEXT;

ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS worksheet_order INTEGER;

CREATE INDEX IF NOT EXISTS idx_documents_type_learning_outcome
ON public.documents (type, learning_outcome);
