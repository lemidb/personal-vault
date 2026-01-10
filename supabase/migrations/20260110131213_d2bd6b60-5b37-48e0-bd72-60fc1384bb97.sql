-- Create vault entry type enum
CREATE TYPE public.vault_type AS ENUM (
  'password',
  'note',
  'link',
  'transaction_screenshot',
  'password_screenshot',
  'image'
);

-- Create vault_entries table
CREATE TABLE public.vault_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type vault_type NOT NULL,
  title TEXT NOT NULL,
  encrypted_data TEXT NOT NULL,
  storage_path TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vault_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for vault_entries
CREATE POLICY "Users can view their own entries"
ON public.vault_entries
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own entries"
ON public.vault_entries
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own entries"
ON public.vault_entries
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own entries"
ON public.vault_entries
FOR DELETE
USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_vault_entries_updated_at
BEFORE UPDATE ON public.vault_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for vault files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('vault', 'vault', false);

-- Storage RLS policies
CREATE POLICY "Users can upload their own files"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'vault' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'vault' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own files"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'vault' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files"
ON storage.objects
FOR DELETE
USING (bucket_id = 'vault' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Enable realtime for vault_entries
ALTER PUBLICATION supabase_realtime ADD TABLE public.vault_entries;