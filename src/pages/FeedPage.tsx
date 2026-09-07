import { useEffect, useState, useMemo } from 'react';
import { supabase, type ListingWithProfile } from '@/lib/supabase';
import { CATEGORIES, type Category } from '@/lib/constants';
import { ListingCard } from '@/components/ListingCard';
import { ItemDetailModal } from '@/components/ItemDetailModal';
import { Skeleton } from '@/components/ui/skeleton';
import { Flame, BookOpen, Cpu, FlaskConical, Package, Dumbbell, HandHeart, ChevronRight, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

const categoryIcons: Record<Category, typeof BookOpen> = {
  Textbooks: BookOpen,
  Electronics: Cpu,
  'Lab Gear': FlaskConical,
  Sports: Dumbbell,
  Misc: Package,
};

export default function FeedPage({ searchQuery }: { searchQuery: string }) {
  const [listings, setListings] = useState<ListingWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [selectedListing, setSelectedListing] = useState<ListingWithProfile | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from('listings')
        .select('*, profiles!listings_user_id_fkey(*)')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      if (!error && data) {
        setListings(data as ListingWithProfile[]);
      }
      setLoading(false);
    }
    load();
  }, []);

  const urgentListings = useMemo(() => listings.filter((l) => l.is_urgent), [listings]);

  const filtered = useMemo(() => {
    return listings.filter((l) => {
      if (selectedCategory !== 'All' && l.category !== selectedCategory) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!l.title.toLowerCase().includes(q) && !l.description.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [listings, selectedCategory, searchQuery]);

  function openDetail(listing: ListingWithProfile) {
    setSelectedListing(listing);
    setModalOpen(true);
  }

  return (
    <div className="space-y-5">
      {/* Urgent Requests Banner */}
      {urgentListings.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1.5 text-amber-700">
              <Flame className="w-4 h-4" />
              <h2 className="text-sm font-bold tracking-wide uppercase">Urgent Requests</h2>
            </div>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1">
            {urgentListings.map((listing) => (
              <div
                key={listing.id}
                className="shrink-0 w-72 rounded-2xl border border-amber-200 bg-amber-50 p-3 cursor-pointer transition-all hover:shadow-md hover:border-amber-300"
                onClick={() => openDetail(listing)}
              >
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-amber-100 shrink-0 flex items-center justify-center">
                    {listing.image_url ? (
                      <img
                        src={listing.image_url}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <Flame className="w-6 h-6 text-amber-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm leading-tight line-clamp-2">{listing.title}</p>
                    <p className="text-xs text-amber-700 mt-1 flex items-center gap-1">
                      <HandHeart className="w-3 h-3" />
                      {listing.pickup_landmark}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); openDetail(listing); }}
                  className="mt-2.5 w-full rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-amber-600 flex items-center justify-center gap-1"
                >
                  Lend This
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Category Filter Pills */}
      <section>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
          <button
            onClick={() => setSelectedCategory('All')}
            className={cn(
              'shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all',
              selectedCategory === 'All'
                ? 'bg-teal-600 text-white'
                : 'bg-white border border-border text-foreground hover:border-teal-300',
            )}
          >
            All
          </button>
          {CATEGORIES.map((cat) => {
            const Icon = categoryIcons[cat];
            const selected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all',
                  selected
                    ? 'bg-teal-600 text-white'
                    : 'bg-white border border-border text-foreground hover:border-teal-300',
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* Product Grid */}
      <section>
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-1">No listings found</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Try adjusting your filters or search. You can also post a new item.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onClick={() => openDetail(listing)}
                onConnect={() => openDetail(listing)}
              />
            ))}
          </div>
        )}
      </section>

      <ItemDetailModal listing={selectedListing} open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
