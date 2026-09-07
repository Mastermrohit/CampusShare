import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ListingTypeBadge } from '@/components/ListingTypeBadge';
import type { ListingWithProfile } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { MapPin, Flame, BookOpen, Cpu, FlaskConical, Package, Dumbbell, MessageSquare, Send, Check, BadgeCheck } from 'lucide-react';
import { toast } from 'sonner';
import type { Category } from '@/lib/constants';

const categoryIcons: Record<Category, typeof BookOpen> = {
  Textbooks: BookOpen,
  Electronics: Cpu,
  'Lab Gear': FlaskConical,
  Sports: Dumbbell,
  Misc: Package,
};

export function ItemDetailModal({
  listing,
  open,
  onOpenChange,
}: {
  listing: ListingWithProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [requested, setRequested] = useState(false);

  if (!listing) return null;

  const Icon = categoryIcons[listing.category];
  const ownerName = listing.profiles?.full_name ?? 'Unknown student';
  const isOwn = user?.id === listing.user_id;

  async function handleRequest() {
    if (!listing || !user) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from('requests').insert({
        listing_id: listing.id,
        requester_id: user.id,
        message: message.trim(),
        status: 'pending',
      });
      if (error) throw error;
      toast.success('Request sent! The owner will be notified.');
      setRequested(true);
      setMessage('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send request.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden gap-0 rounded-2xl">
        {listing.image_url ? (
          <div className="aspect-[16/10] overflow-hidden bg-muted">
            <img
              src={listing.image_url}
              alt={listing.title}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        ) : (
          <div className="aspect-[16/10] bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
            <Icon className="w-16 h-16 text-slate-300" />
          </div>
        )}

        <DialogHeader className="px-5 pt-5">
          <div className="flex items-center gap-2 mb-2">
            <ListingTypeBadge type={listing.listing_type} />
            {listing.is_urgent && (
              <Badge className="bg-amber-500 text-white hover:bg-amber-500 gap-1">
                <Flame className="w-3 h-3" />
                Urgent
              </Badge>
            )}
            <Badge variant="secondary" className="gap-1">
              <Icon className="w-3 h-3" />
              {listing.category}
            </Badge>
          </div>
          <DialogTitle className="text-xl">{listing.title}</DialogTitle>
          <DialogDescription>{listing.description || 'No description provided.'}</DialogDescription>
        </DialogHeader>

        <div className="px-5 py-4 space-y-4">
          {/* Owner info */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-border/40">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-gradient-to-br from-teal-400 to-teal-600 text-white font-semibold">
                {ownerName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <p className="font-medium text-sm truncate">{ownerName}</p>
                <BadgeCheck className="w-4 h-4 text-teal-500 shrink-0" />
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {listing.pickup_landmark}
              </p>
            </div>
          </div>

          {/* Request / chat section */}
          {!isOwn ? (
            requested ? (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-sm text-emerald-900">Request sent successfully</p>
                  <p className="text-xs text-emerald-700">The owner will get back to you soon.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="message" className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Message to owner (optional)
                  </Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={`Hi! I'd love to borrow this. When can I pick it up?`}
                    rows={3}
                  />
                </div>
                <Button
                  onClick={handleRequest}
                  disabled={submitting}
                  className="w-full gap-2 bg-teal-600 hover:bg-teal-700"
                  size="lg"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? 'Sending…' : 'Request Item / Chat'}
                </Button>
              </div>
            )
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 border border-border/40 text-center">
              <p className="text-sm text-muted-foreground">This is your listing. You'll receive requests from other students here.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
