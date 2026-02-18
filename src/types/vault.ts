export type VaultType =
  | 'password'
  | 'note'
  | 'link'
  | 'transaction_screenshot'
  | 'password_screenshot'
  | 'image';

export interface VaultEntry {
  id: string;
  user_id: string;
  type: VaultType;
  title: string;
  encrypted_data: string;
  storage_path: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface DecryptedVaultEntry extends Omit<VaultEntry, 'encrypted_data'> {
  data: VaultEntryData;
}

export type VaultEntryData =
  | PasswordData
  | NoteData
  | LinkData
  | ImageData;

export interface PasswordData {
  username: string;
  password: string;
  url?: string;
  notes?: string;
}

export interface NoteData {
  content: string;
}

export interface LinkData {
  url: string;
  description?: string;
}

export interface ImageData {
  description?: string;
  filename: string;
  mimeType: string;
}

export interface VaultStats {
  password: number;
  note: number;
  link: number;
  transaction_screenshot: number;
  password_screenshot: number;
  image: number;
  total: number;
}

export interface CreateVaultEntryInput {
  type: VaultType;
  title: string;
  data: VaultEntryData;
  tags?: string[];
  file?: File;
}

export interface UpdateVaultEntryInput {
  id: string;
  title?: string;
  data?: VaultEntryData;
  tags?: string[];
}
