// Utilities for base64 encoding/decoding ArrayBuffers
export const bufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

export const base64ToBuffer = (base64: string): ArrayBuffer => {
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

// Generate a random salt
export const generateSalt = (): string => {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  return bufferToBase64(salt.buffer);
};

// Derive Key Encryption Key (KEK) from user password
export const deriveKeyEncryptionKey = async (password: string, saltBase64: string): Promise<CryptoKey> => {
  const enc = new TextEncoder();
  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const saltBuffer = base64ToBuffer(saltBase64);

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['wrapKey', 'unwrapKey']
  );
};

// Generate a new random Master Key
export const generateMasterKey = async (): Promise<CryptoKey> => {
  return window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey']
  );
};

// Wrap (encrypt) the Master Key using the KEK
export const wrapMasterKey = async (
  masterKey: CryptoKey,
  kek: CryptoKey
): Promise<{ encryptedKeyBase64: string; ivBase64: string }> => {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const wrappedKey = await window.crypto.subtle.wrapKey(
    'raw',
    masterKey,
    kek,
    { name: 'AES-GCM', iv }
  );

  return {
    encryptedKeyBase64: bufferToBase64(wrappedKey),
    ivBase64: bufferToBase64(iv.buffer),
  };
};

// Unwrap (decrypt) the Master Key using the KEK
export const unwrapMasterKey = async (
  encryptedKeyBase64: string,
  ivBase64: string,
  kek: CryptoKey
): Promise<CryptoKey> => {
  const wrappedKeyBuffer = base64ToBuffer(encryptedKeyBase64);
  const ivBuffer = base64ToBuffer(ivBase64);

  return window.crypto.subtle.unwrapKey(
    'raw',
    wrappedKeyBuffer,
    kek,
    { name: 'AES-GCM', iv: ivBuffer },
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey']
  );
};

// Generate a random Data Encryption Key (DEK)
const generateDEK = async (): Promise<CryptoKey> => {
  return window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
};

export interface FileEncryptionResult {
  encryptedBlob: Blob;
  encryptedDEKBase64: string;
  dekIvBase64: string;
  fileIvBase64: string;
}

// Encrypt a file
export const encryptFile = async (
  file: File,
  masterKey: CryptoKey
): Promise<FileEncryptionResult> => {
  // 1. Generate DEK for this specific file
  const dek = await generateDEK();

  // 2. Encrypt the file content with the DEK
  const arrayBuffer = await file.arrayBuffer();
  const fileIv = window.crypto.getRandomValues(new Uint8Array(12));
  const encryptedFileBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: fileIv },
    dek,
    arrayBuffer
  );

  // 3. Wrap (encrypt) the DEK using the Master Key
  const dekIv = window.crypto.getRandomValues(new Uint8Array(12));
  const wrappedDEK = await window.crypto.subtle.wrapKey(
    'raw',
    dek,
    masterKey,
    { name: 'AES-GCM', iv: dekIv }
  );

  return {
    encryptedBlob: new Blob([encryptedFileBuffer], { type: 'application/octet-stream' }),
    encryptedDEKBase64: bufferToBase64(wrappedDEK),
    dekIvBase64: bufferToBase64(dekIv.buffer),
    fileIvBase64: bufferToBase64(fileIv.buffer),
  };
};

// Decrypt a file
export const decryptFile = async (
  encryptedBlob: Blob,
  encryptedDEKBase64: string,
  dekIvBase64: string,
  fileIvBase64: string,
  masterKey: CryptoKey,
  mimeType: string
): Promise<Blob> => {
  // 1. Unwrap the DEK using the Master Key
  const wrappedDEKBuffer = base64ToBuffer(encryptedDEKBase64);
  const dekIvBuffer = base64ToBuffer(dekIvBase64);

  const dek = await window.crypto.subtle.unwrapKey(
    'raw',
    wrappedDEKBuffer,
    masterKey,
    { name: 'AES-GCM', iv: dekIvBuffer },
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  // 2. Decrypt the file content
  const encryptedFileBuffer = await encryptedBlob.arrayBuffer();
  const fileIvBuffer = base64ToBuffer(fileIvBase64);

  const decryptedFileBuffer = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: fileIvBuffer },
    dek,
    encryptedFileBuffer
  );

  return new Blob([decryptedFileBuffer], { type: mimeType });
};

// Simple text encryption/decryption for arbitrary data using Master Key
export const encryptText = async (data: string, masterKey: CryptoKey): Promise<{ cipherTextBase64: string; ivBase64: string }> => {
  const enc = new TextEncoder();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const cipherBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    masterKey,
    enc.encode(data)
  );

  return {
    cipherTextBase64: bufferToBase64(cipherBuffer),
    ivBase64: bufferToBase64(iv.buffer)
  };
};

export const decryptText = async (
  cipherTextBase64: string,
  ivBase64: string,
  masterKey: CryptoKey
): Promise<string> => {
  const cipherBuffer = base64ToBuffer(cipherTextBase64);
  const iv = base64ToBuffer(ivBase64);

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    masterKey,
    cipherBuffer
  );

  const dec = new TextDecoder();
  return dec.decode(decryptedBuffer);
};
