import { supabase } from '@/integrations/supabase/client';
import { encryptFile, decryptFile } from '@/lib/crypto';

export const uploadEncryptedFile = async (
  userId: string,
  file: File
): Promise<string> => {
  // Encrypt the file before uploading
  const encryptedBlob = await encryptFile(file, userId);
  
  // Generate unique path
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
  mimeType: string = 'image/png'
): Promise<string> => {
  // Get signed URL (1 hour expiry)
  const { data: signedUrlData, error: signedError } = await supabase.storage
    .from('vault')
    .createSignedUrl(storagePath, 3600);

  if (signedError) throw signedError;

  // Download the encrypted file
  const response = await fetch(signedUrlData.signedUrl);
  const encryptedBlob = await response.blob();

  // Decrypt the file
  const decryptedBlob = await decryptFile(encryptedBlob, userId, mimeType);

  // Create object URL for display
  return URL.createObjectURL(decryptedBlob);
};

export const deleteFile = async (storagePath: string): Promise<void> => {
  const { error } = await supabase.storage.from('vault').remove([storagePath]);
  if (error) throw error;
};
