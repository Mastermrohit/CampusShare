import { useEffect, useState } from 'react';
import { supabase, type ListingWithProfile, type RequestWithListing } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { ItemDetailModal } from '@/components/ItemDetailModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Package, Inbox, Clock, Check, X, Pencil, CheckCircle2, Handshake, ArrowDownToLine, Gift, BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ListingType } from '@/lib/constants';
import { toast } from 'sonner';

type TabValue = 'lending' | 'borrowed' | 'donated' | 'requests';

const typeIcon: Record<ListingType, typeof Handshake> = {
  Lend: Handshake,
  Borrow: ArrowDownToLine,
  Donate: Gift,
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [myListings, setMyListings] = useState<ListingWithProfile[]>([]);
  const [myRequests, setMyRequests] = useState<RequestWithListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<ListingWithProfile | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    async function load() {
      setLoading(true);
      const [listingsRes, requestsRes] = await Promise.all([
        supabase
          .from('listings')
          .select('*, profiles!listings_user_id_fkey(*)')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('requests')
          .select('*, listings(*)')
          .eq('requester_id', user!.id)
          .order('created_at', { ascending: false }),
      ]);
      if (listingsRes.data) setMyListings(listingsRes.data as ListingWithProfile[]);
      if (requestsRes.data) setMyRequests(requestsRes.data as RequestWithListing[]);
      setLoading(false);
    }
    load();
  }, [user]);

  function openDetail(listing: ListingWithProfile) {
    setSelectedListing(listing);
    setModalOpen(true);
  }

  async function markAsLent(listingId: string) {
    const { error } = await supabase.from('listings').update({ status: 'matched' }).eq('id', listingId);
    if (error) {
      toast.error('Failed to update listing.');
    } else {
      toast.success('Item marked as lent!');
      setMyListings((prev) => prev.map((l) => l.id === listingId ? { ...l, status: 'matched' } : l));
    }
  }

  const lendingListings = myListings.filter((l) => l.listing_type === 'Lend');
  const borrowedListing = myListings.filter((l) => l.listing_type === 'Borrow');
  const donatedListings = myListings.filter((l) => l.listing_type === 'Donate');

  const statusConfig = {
    pending: { className: 'bg-amber-100 text-amber-700', icon: Clock, label: 'Pending Request' },
    accepted: { className: 'bg-emerald-100 text-emerald-700', icon: Check, label: 'Accepted' },
    declined: { className: 'bg-red-100 text-red-700', icon: X, label: 'Declined' },
  };

  function renderListingCard(listing: ListingWithProfile) {
    const TypeIcon = typeIcon[listing.listing_type];
    const isActive = listing.status === 'active';
    return (
      <div key={listing.id} className="rounded-2xl border border-border/60 bg-card overflow-hidden">
        <div className="flex gap-3 p-3">
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 shrink-0 flex items-center justify-center">
            {listing.image_url ? (
              <img src={listing.image_url} alt={listing.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            ) : (
              <TypeIcon className="w-6 h-6 text-slate-300" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-sm truncate">{listing.title}</h3>
              <Badge className={cn(isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600', 'shrink-0 gap-1')}>
                {isActive ? <><CheckCircle2 className="w-3 h-3" />Active</> : listing.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{listing.category} · {listing.pickup_landmark}</p>
            <div className="flex items-center gap-2 mt-2">
              {isActive ? (
                <>
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => openDetail(listing)}>
                    <Pencil className="w-3 h-3" />
                    Edit
                  </Button>
                  <Button size="sm" className="h-7 text-xs gap-1 bg-teal-600 hover:bg-teal-700" onClick={() => markAsLent(listing.id)}>
                    <CheckCircle2 className="w-3 h-3" />
                    Mark as Lent
                  </Button>
                </>
              ) : (
                <span className="text-xs text-muted-foreground">Item {listing.status}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderEmptyState(icon: typeof Package, title: string, desc: string) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
          {(() => { const Icon = icon; return <Icon className="w-7 h-7 text-muted-foreground" />; })()}
        </div>
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-xs">{desc}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight">My Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your listings and requests.</p>
      </div>

      <Tabs defaultValue="lending">
        <TabsList className="grid w-full grid-cols-4 mb-4 h-auto">
          <TabsTrigger value="lending" className="text-xs gap-1 py-2">Lending</TabsTrigger>
          <TabsTrigger value="borrowed" className="text-xs gap-1 py-2">Borrowed</TabsTrigger>
          <TabsTrigger value="donated" className="text-xs gap-1 py-2">Donated</TabsTrigger>
          <TabsTrigger value="requests" className="text-xs gap-1 py-2">Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="lending" className="space-y-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)
          ) : lendingListings.length === 0 ? (
            renderEmptyState(Package, 'No lending listings', 'Post an item to lend to other students.')
          ) : (
            lendingListings.map(renderListingCard)
          )}
        </TabsContent>

        <TabsContent value="borrowed" className="space-y-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)
          ) : borrowedListing.length === 0 ? (
            renderEmptyState(Package, 'No borrow listings', 'Post a borrow request for something you need.')
          ) : (
            borrowedListing.map(renderListingCard)
          )}
        </TabsContent>

        <TabsContent value="donated" className="space-y-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)
          ) : donatedListings.length === 0 ? (
            renderEmptyState(Gift, 'No donated items', 'Post an item to donate to fellow students.')
          ) : (
            donatedListings.map(renderListingCard)
          )}
        </TabsContent>

        <TabsContent value="requests" className="space-y-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)
          ) : myRequests.length === 0 ? (
            renderEmptyState(Inbox, 'No requests yet', 'Browse the feed and request items you need.')
          ) : (
            myRequests.map((req) => {
              const listing = req.listings;
              if (!listing) return null;
              const sc = statusConfig[req.status];
              const StatusIcon = sc.icon;
              return (
                <div
                  key={req.id}
                  className="rounded-2xl border border-border/60 bg-card overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => openDetail({ ...listing, profiles: null })}
                >
                  <div className="flex gap-3 p-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 shrink-0 flex items-center justify-center">
                      {listing.image_url ? (
                        <img src={listing.image_url} alt={listing.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      ) : (
                        <Package className="w-6 h-6 text-slate-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-sm truncate">{listing.title}</h3>
                        <Badge className={cn(sc.className, 'shrink-0 gap-1')}>
                          <StatusIcon className="w-3 h-3" />
                          {sc.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{listing.category} · {listing.listing_type}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <MapPin className="w-3 h-3" />
                        {listing.pickup_landmark}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </TabsContent>
      </Tabs>

      <ItemDetailModal listing={selectedListing} open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
