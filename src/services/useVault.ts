import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vaultKeys, VAULT_QUERY_DEFAULTS } from '@/queries/vault';
import {
  fetchVaultEntries,
  fetchVaultStats,
  createVaultEntry,
  updateVaultEntry,
  deleteVaultEntry,
} from '@/api/vault';
import { uploadEncryptedFile, deleteFile } from '@/api/storage';
import type { VaultType, VaultEntryData, CreateVaultEntryInput, UpdateVaultEntryInput } from '@/types/vault';
import { useToast } from '@/hooks/use-toast';
import { useVaultContext } from '@/contexts/VaultContext';

export const useVaultEntries = (
  userId: string | undefined,
  filters?: { type?: VaultType; search?: string }
) => {
  const { masterKey } = useVaultContext();

  return useQuery({
    queryKey: vaultKeys.entriesList(filters || {}),
    queryFn: async () => {
      if (!masterKey) return [];
      return fetchVaultEntries(userId!, filters, masterKey);
    },
    enabled: !!userId && !!masterKey,
    ...VAULT_QUERY_DEFAULTS,
  });
};

export const useVaultStats = (userId: string | undefined) => {
  return useQuery({
    queryKey: vaultKeys.stats(),
    queryFn: () => fetchVaultStats(userId!),
    enabled: !!userId,
    ...VAULT_QUERY_DEFAULTS,
  });
};

export const useAddVaultEntry = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { masterKey } = useVaultContext();

  return useMutation({
    mutationFn: async ({
      userId,
      input,
    }: {
      userId: string;
      input: CreateVaultEntryInput;
    }) => {
      let storagePath: string | undefined;

      // Upload file if present
      if (input.file) {
        if (!masterKey) throw new Error("Vault is locked");
        storagePath = await uploadEncryptedFile(userId, input.file, masterKey);
      }

      return createVaultEntry(
        userId,
        input.type,
        input.title,
        input.data,
        input.tags,
        storagePath,
        masterKey || undefined
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vaultKeys.all });
      toast({
        title: 'Entry created',
        description: 'Your vault entry has been securely encrypted and saved.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateVaultEntry = () => {

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { masterKey } = useVaultContext();

  return useMutation({
    mutationFn: async ({
      userId,
      input,
    }: {
      userId: string;
      input: UpdateVaultEntryInput;
    }) => {
      let storagePath = undefined;
      if (input.file) {
        if (!masterKey) throw new Error("Vault is locked");
        storagePath = await uploadEncryptedFile(userId, input.file, masterKey);

        if (input.oldStoragePath) {
          try {
            await deleteFile(input.oldStoragePath);
          } catch (error) {
            console.error('Failed to delete old file:', error);
          }
        }
      }

      return updateVaultEntry(userId, input.id, {
        title: input.title,
        data: input.data,
        tags: input.tags,
        storagePath: storagePath,
      }, masterKey || undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vaultKeys.all });
      toast({
        title: 'Entry updated',
        description: 'Your changes have been saved.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};


export const useDeleteVaultEntry = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      userId,
      id,
      storagePath,
    }: {
      userId: string;
      id: string;
      storagePath?: string;
    }) => {
      return deleteVaultEntry(userId, id, storagePath);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vaultKeys.all });
      toast({
        title: 'Entry deleted',
        description: 'The entry has been permanently removed.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
