import { VaultEntryCard } from './VaultEntryCard';
import { Skeleton } from '@/components/ui/skeleton';
import type { DecryptedVaultEntry } from '@/types/vault';
import { Shield } from 'lucide-react';

interface VaultListProps {
  entries: DecryptedVaultEntry[] | undefined;
  isLoading: boolean;
  onDelete: (id: string, storagePath?: string) => void;
  isDeleting?: boolean;
}

export const VaultList = ({ entries, isLoading, onDelete, isDeleting }: VaultListProps) => {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-[180px] rounded-xl" />
        ))}
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 py-16">
        <div className="rounded-full bg-secondary p-4">
          <Shield className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-medium">No entries yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Add your first secure entry to get started
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {entries.map((entry) => (
        <VaultEntryCard
          key={entry.id}
          entry={entry}
          onDelete={onDelete}
          isDeleting={isDeleting}
        />
      ))}
    </div>
  );
};
