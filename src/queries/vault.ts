import { VaultType } from '@/types/vault';

export const vaultKeys = {
  all: ['vault'] as const,
  entries: () => [...vaultKeys.all, 'entries'] as const,
  entriesList: (filters: { type?: VaultType; search?: string }) =>
    [...vaultKeys.entries(), filters] as const,
  entry: (id: string) => [...vaultKeys.entries(), id] as const,
  stats: () => [...vaultKeys.all, 'stats'] as const,
};

export const VAULT_QUERY_DEFAULTS = {
  staleTime: 1000 * 60 * 5, // 5 minutes
  gcTime: 1000 * 60 * 30, // 30 minutes
  refetchOnWindowFocus: true,
};
