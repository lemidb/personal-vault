-- Create table for storing User Master Keys (encrypted with Vault Password KEK)
CREATE TABLE user_vault_keys (
  user_id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  salt TEXT NOT NULL,
  encrypted_master_key TEXT NOT NULL,
  iv TEXT NOT NULL,
  auth_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Secure the table with RLS (Row Level Security)
ALTER TABLE user_vault_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own vault key" 
  ON user_vault_keys FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own vault key" 
  ON user_vault_keys FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own vault key" 
  ON user_vault_keys FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create table for storing File Data Encryption Keys (DEKs, encrypted with User Master Key)
CREATE TABLE file_data_keys (
  storage_path TEXT NOT NULL PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  encrypted_dek TEXT NOT NULL,
  iv TEXT NOT NULL,
  file_iv TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Secure the table with RLS
ALTER TABLE file_data_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own file keys" 
  ON file_data_keys FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own file keys" 
  ON file_data_keys FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own file keys" 
  ON file_data_keys FOR DELETE
  USING (auth.uid() = user_id);

-- Optional: Function to automatically update `updated_at` timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_vault_keys_modtime
    BEFORE UPDATE ON user_vault_keys
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();
