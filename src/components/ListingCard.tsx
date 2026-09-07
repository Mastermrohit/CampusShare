import { Badge } from '@/components/ui/badge';
import { ListingTypeBadge } from '@/components/ListingTypeBadge';
import type { ListingWithProfile } from '@/lib/supabase';
import type { Category } from '@/lib/constants';
import { MapPin, Clock, Flame, BookOpen, Cpu, FlaskConical, Package, Dumbbell, BadgeCheck, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const categoryIcons: Record<Category, typeof BookOpen> = {
  Textbooks: BookOpen,
  Electronics: Cpu,
  'Lab Gear': FlaskConical,
  Sports: Dumbbell,
  Misc: Package,
};

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export function ListingCard({
  listing,
  onClick,
  onConnect,
}: {
  listing: ListingWithProfile;
  onClick?: () => void;
  onConnect?: () => void;
}) {
  const Icon = categoryIcons[listing.category];
  const ownerName = listing.profiles?.full_name ?? 'Unknown student';

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/10 hover:-translate-y-0.5 hover:border-teal-300/50"
    >
      {/* Image container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
        {listing.image_url ? (
          <img
            src={listing.image_url}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon className="w-10 h-10 text-slate-300" />
          </div>
        )}
        {/* Overlay badge */}
        <div className="absolute top-2 left-2">
          <ListingTypeBadge type={listing.listing_type} className="shadow-sm" />
        </div>
        {listing.is_urgent && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-amber-500 text-white hover:bg-amber-500 gap-1 shadow-sm">
              <Flame className="w-3 h-3" />
              SOS
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        <h3 className="font-semibold text-sm leading-tight line-clamp-1">{listing.title}</h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="truncate">{listing.pickup_landmark}</span>
          <span className="ml-auto flex items-center gap-0.5 shrink-0">
            <Clock className="w-3 h-3" />
            {timeAgo(listing.created_at)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 pt-1 border-t border-border/40">
          <div className="relative">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-[10px] font-bold">
              {ownerName.charAt(0).toUpperCase()}
            </div>
            <BadgeCheck className="w-3 h-3 text-teal-500 absolute -bottom-0.5 -right-0.5 bg-card rounded-full" />
          </div>
          <span className="text-xs text-muted-foreground truncate flex-1">{ownerName}</span>
          <button
            onClick={(e) => { e.stopPropagation(); onConnect?.(); }}
            className="inline-flex items-center gap-1 rounded-lg bg-teal-600 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-teal-700"
          >
            <Link2 className="w-3 h-3" />
            Connect
          </button>
        </div>
      </div>
    </div>
  );
}
