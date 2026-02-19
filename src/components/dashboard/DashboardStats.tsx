import { Key, FileText, Link2, CreditCard, Image } from 'lucide-react';
import { StatCard } from './StatCard';
import { Skeleton } from '@/components/ui/skeleton';
import type { VaultStats } from '@/types/vault';

interface DashboardStatsProps {
  stats: VaultStats | undefined;
  isLoading: boolean;
}

export const DashboardStats = ({ stats, isLoading }: DashboardStatsProps) => {
  if (isLoading) {
    return (
      <div className="vault-grid">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-[120px] rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="vault-grid">
      <StatCard
        title="Passwords"
        value={stats?.password || 0}
        icon={Key}
        color="password"
      />
      <StatCard
        title="Notes & Links"
        value={(stats?.note || 0) + (stats?.link || 0)}
        icon={FileText}
        color="note"
      />
      <StatCard
        title="Transactions"
        value={stats?.transaction_screenshot || 0}
        icon={CreditCard}
        color="transaction"
      />
      <StatCard
        title="Images"
        value={(stats?.image || 0) + (stats?.password_screenshot || 0)}
        icon={Image}
        color="image"
      />
    </div>
  );
};
