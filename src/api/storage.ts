import { supabase } from '@/integrations/supabase/client';
import { encryptFile, decryptFile } from '@/lib/crypto';

export const uploadEncryptedFile = async (
  userId: string,
  file: File,
  masterKey: CryptoKey
): Promise<string> => {

  const { encryptedBlob, encryptedDEKBase64, dekIvBase64, fileIvBase64 } = await encryptFile(file, masterKey);

  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `${userId}/${timestamp}_${safeName}.encrypted`;

  // 1. Upload the encrypted file to Storage
  const { error: storageError } = await supabase.storage
    .from('vault')
    .upload(path, encryptedBlob, {
      cacheControl: '3600',
      upsert: false,
    });

  if (storageError) throw storageError;

  // 2. Insert the DEK metadata into the generated database table
  const { error: dbError } = await supabase.from('file_data_keys').insert({
    storage_path: path,
    user_id: userId,
    encrypted_dek: encryptedDEKBase64,
    iv: dekIvBase64,
    file_iv: fileIvBase64
  });

  if (dbError) {
    // Attempt rollback
    await supabase.storage.from('vault').remove([path]);
    throw dbError;
  }

  return path;
};

export const getDecryptedFileUrl = async (
  userId: string,
  storagePath: string,
  mimeType: string,
  masterKey: CryptoKey
): Promise<string> => {

  // 1. Fetch DEK metadata from database
  const { data: keyData, error: keyError } = await supabase
    .from('file_data_keys')
    .select('encrypted_dek, iv, file_iv')
    .eq('storage_path', storagePath)
    .single();

  if (keyError || !keyData) throw new Error("Could not find decryption keys for this file.");

  // 2. Generate signed URL for download
  const { data: signedUrlData, error: signedError } = await supabase.storage
    .from('vault')
    .createSignedUrl(storagePath, 3600);

  if (signedError) throw signedError;

  const response = await fetch(signedUrlData.signedUrl);
  const encryptedBlob = await response.blob();

  // 3. Decrypt the file using the Master Key and DEK info
  const decryptedBlob = await decryptFile(
    encryptedBlob,
    keyData.encrypted_dek,
    keyData.iv,
    keyData.file_iv,
    masterKey,
    mimeType
  );

  return URL.createObjectURL(decryptedBlob);
};

export const deleteFile = async (storagePath: string): Promise<void> => {
  // Database row should ideally map cascade delete, but we handle just in case
  await supabase.from('file_data_keys').delete().eq('storage_path', storagePath);

  const { error } = await supabase.storage.from('vault').remove([storagePath]);
  if (error) throw error;
};
