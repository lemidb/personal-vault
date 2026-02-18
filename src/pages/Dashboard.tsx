import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/services/useAuth';
import { useVaultEntries, useVaultStats, useDeleteVaultEntry } from '@/services/useVault';
import { useVaultRealtime } from '@/hooks/useRealtime';
import { Header } from '@/components/layout/Header';
import { AddEntryDialog } from '@/components/layout/AddEntryDialog';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { VaultList } from '@/components/vault/VaultList';
import { VaultFilters } from '@/components/vault/VaultFilters';
import type { VaultType } from '@/types/vault';
import { useEffect } from 'react';

const Dashboard = () => {
  const { user, loading: authLoading, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<VaultType | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Enable realtime updates
  useVaultRealtime(user?.id);

  const filters = useMemo(
    () => ({
      type: selectedType || undefined,
      search: search || undefined,
    }),
    [selectedType, search]
  );

  const { data: entries, isLoading: entriesLoading } = useVaultEntries(user?.id, filters);
  const { data: stats, isLoading: statsLoading } = useVaultStats(user?.id);
  const { mutate: deleteEntry, isPending: isDeleting } = useDeleteVaultEntry();

  const handleDelete = (id: string, storagePath?: string) => {
    if (!user) return;
    deleteEntry({ userId: user.id, id, storagePath });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header email={user.email} onSignOut={handleSignOut} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
            <p className="mt-1 text-muted-foreground">
              Your encrypted vault at a glance
            </p>
          </div>
          <AddEntryDialog userId={user.id} />
        </div>

        <section className="mb-8">
          <DashboardStats stats={stats} isLoading={statsLoading} />
        </section>

        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Entries</h2>
            <span className="text-sm text-muted-foreground">
              {stats?.total || 0} total
            </span>
          </div>

          <div className="mb-6">
            <VaultFilters
              search={search}
              onSearchChange={setSearch}
              selectedType={selectedType}
              onTypeChange={setSelectedType}
            />
          </div>

          <VaultList
            entries={entries}
            isLoading={entriesLoading}
            onDelete={handleDelete}
            isDeleting={isDeleting}
          />
        </section>
      </main>

      {/* Mobile FAB */}
      <div className="fab md:hidden">
        <AddEntryDialog userId={user.id} />
      </div>
    </div>
  );
};

export default Dashboard;
