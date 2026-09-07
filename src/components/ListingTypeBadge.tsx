import { cn } from '@/lib/utils';
import type { ListingType } from '@/lib/constants';

const config: Record<ListingType, { className: string; label: string }> = {
  Lend: {
    className: 'bg-blue-100 text-blue-700',
    label: 'LEND',
  },
  Borrow: {
    className: 'bg-amber-100 text-amber-700',
    label: 'BORROW',
  },
  Donate: {
    className: 'bg-emerald-100 text-emerald-700',
    label: 'DONATE',
  },
};

export function ListingTypeBadge({ type, className }: { type: ListingType; className?: string }) {
  const { className: badgeClass, label } = config[type];
  return (
    <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold tracking-wide', badgeClass, className)}>
      {label}
    </span>
  );
}
