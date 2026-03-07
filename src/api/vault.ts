import { supabase } from '@/integrations/supabase/client';
import { encryptText, decryptText } from '@/lib/crypto';
import type { VaultEntry, VaultType, VaultEntryData, VaultStats, DecryptedVaultEntry } from '@/types/vault';

export const serializeAndEncrypt = async (data: any, masterKey: CryptoKey): Promise<string> => {
  const jsonString = JSON.stringify(data);
  const { cipherTextBase64, ivBase64 } = await encryptText(jsonString, masterKey);
  return JSON.stringify({ iv: ivBase64, c: cipherTextBase64 });
};

export const deserializeAndDecrypt = async <T>(encryptedString: string, masterKey: CryptoKey): Promise<T> => {
  try {
    const { iv, c } = JSON.parse(encryptedString);
    const decryptedString = await decryptText(c, iv, masterKey);
    return JSON.parse(decryptedString) as T;
  } catch (err) {
    console.error("Failed to decrypt entry", err);
    throw new Error("Decryption failed for an entry.");
  }
};

export const fetchVaultEntries = async (
  userId: string,
  options: {
    type?: VaultType;
    search?: string;
    limit?: number;
    offset?: number;
  } | undefined,
  masterKey: CryptoKey
): Promise<DecryptedVaultEntry[]> => {
  let query = supabase
    .from('vault_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (options?.type) {
    query = query.eq('type', options.type);
  }

  if (options?.search) {
    query = query.ilike('title', `%${options.search}%`);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
  }

  const { data, error } = await query;

  if (error) throw error;

  const decryptedEntries = await Promise.all(
    (data as VaultEntry[]).map(async (entry) => {
      let decryptedData: any = {};
      try {
        decryptedData = await deserializeAndDecrypt<VaultEntryData>(entry.encrypted_data, masterKey);
      } catch (e) {
        decryptedData = { error: 'Failed to decrypt' };
      }
      return {
        ...entry,
        data: decryptedData,
      } as DecryptedVaultEntry;
    })
  );

  return decryptedEntries;
};

export const fetchVaultStats = async (userId: string): Promise<VaultStats> => {
  const { data, error } = await supabase
    .from('vault_entries')
    .select('type')
    .eq('user_id', userId);

  if (error) throw error;

  const stats: VaultStats = {
    password: 0,
    note: 0,
    link: 0,
    transaction_screenshot: 0,
    password_screenshot: 0,
    image: 0,
    total: 0,
  };

  (data as { type: VaultType }[]).forEach((entry) => {
    stats[entry.type]++;
    stats.total++;
  });

  return stats;
};

export const createVaultEntry = async (
  userId: string,
  type: VaultType,
  title: string,
  data: VaultEntryData,
  tags: string[] = [],
  storagePath?: string,
  masterKey?: CryptoKey
): Promise<VaultEntry> => {
  if (!masterKey) throw new Error("Vault locked");
  const encryptedData = await serializeAndEncrypt(data, masterKey);

  const { data: newEntry, error } = await supabase
    .from('vault_entries')
    .insert({
      user_id: userId,
      type,
      title,
      encrypted_data: encryptedData,
      tags,
      storage_path: storagePath || null,
    })
    .select()
    .single();

  if (error) throw error;
  return newEntry as VaultEntry;
};

export const updateVaultEntry = async (
  userId: string,
  id: string,
  updates: {
    title?: string;
    data?: VaultEntryData;
    tags?: string[];
    storagePath?: string;
  },
  masterKey?: CryptoKey
): Promise<VaultEntry> => {
  if (updates.data && !masterKey) throw new Error("Vault locked");
  const updatePayload: Record<string, unknown> = {};

  if (updates.title) {
    updatePayload.title = updates.title;
  }

  if (updates.data && masterKey) {
    updatePayload.encrypted_data = await serializeAndEncrypt(updates.data, masterKey);
  }

  if (updates.tags) {
    updatePayload.tags = updates.tags;
  }

  if (updates.storagePath) {
    updatePayload.storage_path = updates.storagePath;
  }


  const { data, error } = await supabase
    .from('vault_entries')
    .update(updatePayload)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as VaultEntry;
};

export const deleteVaultEntry = async (
  userId: string,
  id: string,
  storagePath?: string
): Promise<void> => {
  if (storagePath) {
    await supabase.storage.from('vault').remove([storagePath]);
  }

  const { error } = await supabase
    .from('vault_entries')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
};
