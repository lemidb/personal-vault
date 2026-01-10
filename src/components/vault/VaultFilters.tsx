import { Search, Key, FileText, Link2, CreditCard, Image, LayoutGrid } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { VaultType } from '@/types/vault';

interface VaultFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedType: VaultType | null;
  onTypeChange: (type: VaultType | null) => void;
}

const filterOptions: { type: VaultType | null; icon: React.ElementType; label: string }[] = [
  { type: null, icon: LayoutGrid, label: 'All' },
  { type: 'password', icon: Key, label: 'Passwords' },
  { type: 'note', icon: FileText, label: 'Notes' },
  { type: 'link', icon: Link2, label: 'Links' },
  { type: 'transaction_screenshot', icon: CreditCard, label: 'Transactions' },
  { type: 'image', icon: Image, label: 'Images' },
];

export const VaultFilters = ({
  search,
  onSearchChange,
  selectedType,
  onTypeChange,
}: VaultFiltersProps) => {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search entries..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {filterOptions.map(({ type, icon: Icon, label }) => (
          <Button
            key={type ?? 'all'}
            variant={selectedType === type ? 'default' : 'outline'}
            size="sm"
            onClick={() => onTypeChange(type)}
            className={cn(
              'gap-2',
              selectedType === type && 'shadow-md shadow-primary/20'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
};
