import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { vaultKeys } from '@/queries/vault';

export const useVaultRealtime = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('vault-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vault_entries',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          // Invalidate queries to refetch fresh data
          queryClient.invalidateQueries({ queryKey: vaultKeys.all });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);
};
