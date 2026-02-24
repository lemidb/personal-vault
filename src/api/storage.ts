import { supabase } from '@/integrations/supabase/client';
import { encryptFile, decryptFile } from '@/lib/crypto';

export const uploadEncryptedFile = async (
  userId: string,
  file: File
): Promise<string> => {

  const encryptedBlob = await encryptFile(file, userId);

  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `${userId}/${timestamp}_${safeName}.encrypted`;

  const { error } = await supabase.storage
    .from('vault')
    .upload(path, encryptedBlob, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;
  return path;
};

export const getDecryptedFileUrl = async (
  userId: string,
  storagePath: string,
  mimeType: string
): Promise<string> => {

  const { data: signedUrlData, error: signedError } = await supabase.storage
    .from('vault')
    .createSignedUrl(storagePath, 3600);

  if (signedError) throw signedError;

  const response = await fetch(signedUrlData.signedUrl);
  const encryptedBlob = await response.blob();

  const decryptedBlob = await decryptFile(encryptedBlob, userId, mimeType);

  return URL.createObjectURL(decryptedBlob);
};

export const deleteFile = async (storagePath: string): Promise<void> => {
  const { error } = await supabase.storage.from('vault').remove([storagePath]);
  if (error) throw error;
};
