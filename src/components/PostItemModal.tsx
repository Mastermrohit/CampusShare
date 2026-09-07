import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { CATEGORIES, LISTING_TYPES, CAMPUS_LOCATIONS, type Category, type ListingType } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { BookOpen, Cpu, FlaskConical, Package, Dumbbell, Handshake, ArrowDownToLine, Gift, Flame } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const categoryIcons: Record<Category, typeof BookOpen> = {
  Textbooks: BookOpen,
  Electronics: Cpu,
  'Lab Gear': FlaskConical,
  Sports: Dumbbell,
  Misc: Package,
};

const typeConfig: Record<ListingType, { icon: typeof Handshake; className: string; activeClass: string }> = {
  Lend: { icon: Handshake, className: '', activeClass: 'border-blue-400 bg-blue-50 text-blue-700' },
  Borrow: { icon: ArrowDownToLine, className: '', activeClass: 'border-amber-400 bg-amber-50 text-amber-700' },
  Donate: { icon: Gift, className: '', activeClass: 'border-emerald-400 bg-emerald-50 text-emerald-700' },
};

export function PostItemModal({
  open,
  onOpenChange,
  onPosted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPosted: () => void;
}) {
  const { user, profile } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('Textbooks');
  const [listingType, setListingType] = useState<ListingType>('Lend');
  const [pickupLandmark, setPickupLandmark] = useState<string>(profile?.campus_location || CAMPUS_LOCATIONS[0]);
  const [imageUrl, setImageUrl] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!title.trim()) {
      toast.error('Please enter a title.');
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from('listings').insert({
        user_id: user.id,
        title: title.trim(),
        description: description.trim(),
        category,
        listing_type: listingType,
        pickup_landmark: pickupLandmark,
        image_url: imageUrl.trim(),
        is_urgent: isUrgent,
        status: 'active',
      });
      if (error) throw error;
      toast.success('Your item has been posted!');
      resetForm();
      onPosted();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to post item.');
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setTitle('');
    setDescription('');
    setCategory('Textbooks');
    setListingType('Lend');
    setImageUrl('');
    setIsUrgent(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Post a New Item</DialogTitle>
          <DialogDescription>Share something with your campus community.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Listing Type */}
          <div className="space-y-2">
            <Label>What do you want to do?</Label>
            <div className="grid grid-cols-3 gap-2">
              {LISTING_TYPES.map((type) => {
                const { icon: Icon, activeClass } = typeConfig[type];
                const selected = listingType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setListingType(type)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-sm font-medium',
                      selected ? activeClass : 'border-border hover:border-muted-foreground/30',
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Organic Chemistry Textbook" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Condition, availability, requirements…" rows={2} />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {CATEGORIES.map((cat) => {
                const Icon = categoryIcons[cat];
                const selected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={cn(
                      'flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all text-xs font-medium',
                      selected ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-border hover:border-muted-foreground/30',
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pickup">Pickup Landmark</Label>
            <Select value={pickupLandmark} onValueChange={setPickupLandmark}>
              <SelectTrigger id="pickup"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CAMPUS_LOCATIONS.map((loc) => (
                  <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Image URL (optional)</Label>
            <Input id="image" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/photo.jpg" />
            {imageUrl && (
              <div className="mt-2 aspect-video rounded-lg overflow-hidden bg-muted border border-border/40">
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
                <Flame className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <Label htmlFor="urgent" className="cursor-pointer text-sm">Mark as Urgent</Label>
                <p className="text-xs text-muted-foreground">Pin to top of feed as urgent</p>
              </div>
            </div>
            <Switch id="urgent" checked={isUrgent} onCheckedChange={setIsUrgent} />
          </div>

          <Button type="submit" disabled={submitting} className="w-full bg-teal-600 hover:bg-teal-700" size="lg">
            {submitting ? 'Posting…' : 'Post Item'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
