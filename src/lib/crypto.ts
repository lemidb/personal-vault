import CryptoJS from 'crypto-js';

// In a production app, this would be derived from the user's password
// For now, we use a combination of user ID and a static key
// This ensures each user has unique encryption
const getEncryptionKey = (userId: string): string => {
  // In production, implement proper key derivation (PBKDF2, Argon2, etc.)
  return CryptoJS.SHA256(userId + '_vault_key_2024').toString();
};

export const encrypt = (data: unknown, userId: string): string => {
  const key = getEncryptionKey(userId);
  const jsonString = JSON.stringify(data);
  return CryptoJS.AES.encrypt(jsonString, key).toString();
};

export const decrypt = <T>(encryptedData: string, userId: string): T => {
  const key = getEncryptionKey(userId);
  const bytes = CryptoJS.AES.decrypt(encryptedData, key);
  const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
  return JSON.parse(decryptedString) as T;
};

export const encryptFile = async (file: File, userId: string): Promise<Blob> => {
  const key = getEncryptionKey(userId);
  const arrayBuffer = await file.arrayBuffer();
  const wordArray = CryptoJS.lib.WordArray.create(new Uint8Array(arrayBuffer) as any);
  const encrypted = CryptoJS.AES.encrypt(wordArray, key).toString();
  return new Blob([encrypted], { type: 'text/plain' });
};

export const decryptFile = async (
  encryptedBlob: Blob,
  userId: string,
  mimeType: string
): Promise<Blob> => {
  const key = getEncryptionKey(userId);
  const text = await encryptedBlob.text();
  const decrypted = CryptoJS.AES.decrypt(text, key);

  // Convert WordArray to Uint8Array
  const words = decrypted.words;
  const sigBytes = decrypted.sigBytes;
  const u8 = new Uint8Array(sigBytes);

  for (let i = 0; i < sigBytes; i++) {
    u8[i] = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
  }

  return new Blob([u8], { type: mimeType });
};
