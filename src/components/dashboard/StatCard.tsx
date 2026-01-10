import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: 'password' | 'note' | 'link' | 'transaction' | 'image';
  className?: string;
}

const colorMap = {
  password: 'text-vault-password',
  note: 'text-vault-note',
  link: 'text-vault-link',
  transaction: 'text-vault-transaction',
  image: 'text-vault-image',
};

const bgMap = {
  password: 'bg-vault-password/10',
  note: 'bg-vault-note/10',
  link: 'bg-vault-link/10',
  transaction: 'bg-vault-transaction/10',
  image: 'bg-vault-image/10',
};

export const StatCard = ({ title, value, icon: Icon, color, className }: StatCardProps) => {
  return (
    <Card className={cn('stat-card group', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-semibold tracking-tight">{value}</p>
          </div>
          <div
            className={cn(
              'rounded-xl p-3 transition-transform group-hover:scale-110',
              bgMap[color]
            )}
          >
            <Icon className={cn('h-6 w-6', colorMap[color])} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
