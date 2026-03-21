import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/services/useAuth';
import {
  deriveKeyEncryptionKey,
  generateMasterKey,
  generateSalt,
  wrapMasterKey,
  unwrapMasterKey,
} from '@/lib/crypto';
import { useToast } from '@/hooks/use-toast';

interface VaultContextType {
  isUnlocked: boolean;
  hasVaultAccount: boolean | null;
  masterKey: CryptoKey | null;
  checkVaultStatus: () => Promise<void>;
  setupVault: (password: string) => Promise<void>;
  unlockVault: (password: string) => Promise<void>;
  lockVault: () => void;
  isLoading: boolean;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export const VaultProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [masterKey, setMasterKey] = useState<CryptoKey | null>(null);
  const [hasVaultAccount, setHasVaultAccount] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isUnlocked = masterKey !== null;

  const checkVaultStatus = async () => {
    if (!user) {
      setHasVaultAccount(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_vault_keys')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setHasVaultAccount(data !== null);
    } catch (error) {
      console.error('Error checking vault status:', error);
      toast({
        title: "Error checking vault",
        description: "Could not connect to the secure vault server.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkVaultStatus();
    } else {
      setMasterKey(null);
      setHasVaultAccount(null);
      setIsLoading(false);
    }
  }, [user]);

  const setupVault = async (password: string) => {
    if (!user) throw new Error("Must be logged in to setup vault.");
    setIsLoading(true);

    try {
      // 1. Generate new Master Key
      const newMasterKey = await generateMasterKey();

      // 2. Generate Salt & Derive KEK from password
      const salt = generateSalt();
      const kek = await deriveKeyEncryptionKey(password, salt);

      // 3. Wrap Master Key with KEK
      const { encryptedKeyBase64, ivBase64 } = await wrapMasterKey(newMasterKey, kek);

      // 4. Save to Database
      const { error } = await supabase.from('user_vault_keys').insert({
        user_id: user.id,
        salt,
        encrypted_master_key: encryptedKeyBase64,
        iv: ivBase64,
        auth_hash: 'v1' // Can be used for migrations later
      });

      if (error) throw error;

      setMasterKey(newMasterKey);
      setHasVaultAccount(true);

      toast({
        title: "Vault Secured",
        description: "Your vault is now ready.",
      });
    } catch (error: any) {
      console.error('Error setting up vault:', error);
      toast({
        title: "Setup Failed",
        description: error.message || "Failed to setup secure vault.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const unlockVault = async (password: string) => {
    if (!user) throw new Error("Must be logged in to unlock vault.");
    setIsLoading(true);

    try {
      // 1. Fetch encrypted key and salt from DB
      const { data, error } = await supabase
        .from('user_vault_keys')
        .select('salt, encrypted_master_key, iv')
        .eq('user_id', user.id)
        .single();

      if (error || !data) throw new Error("Could not find your vault data.");

      // 2. Derive KEK from password and salt
      const kek = await deriveKeyEncryptionKey(password, data.salt);

      // 3. Unwrap Master Key
      // This will throw a generic "OperationError" if the password was wrong!
      const unwrappedKey = await unwrapMasterKey(
        data.encrypted_master_key,
        data.iv,
        kek
      );

      setMasterKey(unwrappedKey);

      toast({
        title: "Vault Unlocked",
        description: "Your session is now secure.",
      });
    } catch (error: any) {
      console.error('Error unlocking vault:', error);

      toast({
        title: "Unlock Failed",
        description: "Incorrect Vault Password. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const lockVault = () => {
    setMasterKey(null);
    toast({
      title: "Vault Locked",
      description: "Your data is secured.",
    });
  };

  return (
    <VaultContext.Provider
      value={{
        isUnlocked,
        hasVaultAccount,
        masterKey,
        checkVaultStatus,
        setupVault,
        unlockVault,
        lockVault,
        isLoading
      }}
    >
      {children}
    </VaultContext.Provider>
  );
};

export const useVaultContext = () => {
  const context = useContext(VaultContext);
  if (context === undefined) {
    throw new Error('useVaultContext must be used within a VaultProvider');
  }
  return context;
};
