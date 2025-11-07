-- Add trigger_type and linked_action columns to mini_rules table
ALTER TABLE public.mini_rules 
ADD COLUMN IF NOT EXISTS trigger_type TEXT,
ADD COLUMN IF NOT EXISTS linked_action TEXT;