import { useState } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import AuthPage from '@/pages/AuthPage';
import FeedPage from '@/pages/FeedPage';
import DashboardPage from '@/pages/DashboardPage';
import { PostItemModal } from '@/components/PostItemModal';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { Skeleton } from '@/components/ui/skeleton';
import {
  GraduationCap, Home, Plus, Search, Bell, User,
  BadgeCheck, LogOut, MapPin, X,
} from 'lucide-react';
import { CAMPUS_NAMES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export type Page = 'feed' | 'dashboard';

function AppContent() {
  const { user, profile, loading, signOut } = useAuth();
  const [page, setPage] = useState<Page>('feed');
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [campusIndex, setCampusIndex] = useState(0);
  const [campusSwitcherOpen, setCampusSwitcherOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-4 w-full max-w-md px-4">
          <Skeleton className="h-12 w-48 mx-auto" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-3/4" />
        </div>
      </div>
    );
  }

  if (!user) return <AuthPage />;

  const campusName = CAMPUS_NAMES[campusIndex];
  const initials = (profile?.full_name ?? user.email ?? '?').charAt(0).toUpperCase();

  function handlePosted() {
    setPage('feed');
  }

  const bottomNavItems: { id: Page | 'post' | 'search' | 'notifications'; label: string; icon: typeof Home }[] = [
    { id: 'feed', label: 'Feed', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'post', label: 'Post', icon: Plus },
    { id: 'notifications', label: 'Alerts', icon: Bell },
    { id: 'dashboard', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/90 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          {/* Logo + Title */}
          <button onClick={() => setPage('feed')} className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-base hidden sm:block">CampusShare</span>
          </button>

          {/* Campus Switcher */}
          <button
            onClick={() => setCampusSwitcherOpen(!campusSwitcherOpen)}
            className="relative inline-flex items-center gap-1.5 rounded-full border border-border bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-teal-300 hover:bg-teal-50"
          >
            <MapPin className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden sm:inline">{campusName}</span>
            <span className="sm:hidden">Campus</span>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-sm font-bold">
                {initials}
              </div>
              <BadgeCheck className="w-4 h-4 text-teal-500 absolute -bottom-0.5 -right-0.5 bg-card rounded-full" />
            </div>
            <Button variant="ghost" size="icon" onClick={signOut} title="Sign out" className="h-8 w-8">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Campus switcher dropdown */}
        {campusSwitcherOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setCampusSwitcherOpen(false)} />
            <div className="absolute left-1/2 -translate-x-1/2 top-14 z-50 w-72 rounded-2xl border border-border bg-card shadow-xl p-2">
              <p className="text-xs font-semibold text-muted-foreground px-3 py-1.5 uppercase tracking-wide">Switch Campus</p>
              {CAMPUS_NAMES.map((name, i) => (
                <button
                  key={name}
                  onClick={() => { setCampusIndex(i); setCampusSwitcherOpen(false); }}
                  className={cn(
                    'w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-left transition-colors',
                    i === campusIndex ? 'bg-teal-50 text-teal-700 font-medium' : 'hover:bg-muted',
                  )}
                >
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  {name}
                  {i === campusIndex && <BadgeCheck className="w-4 h-4 ml-auto text-teal-500" />}
                </button>
              ))}
            </div>
          </>
        )}
      </header>

      {/* Search bar overlay */}
      {searchOpen && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border/40 p-4">
          <div className="max-w-2xl mx-auto flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for textbooks, calculators, lab kits…"
                className="w-full rounded-xl border border-border bg-slate-50 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-teal-400 focus:bg-white"
              />
            </div>
            <Button variant="ghost" size="icon" onClick={() => { setSearchOpen(false); setSearchQuery(''); }}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-4 pb-24 md:pb-8">
        {page === 'feed' && <FeedPage searchQuery={searchQuery} />}
        {page === 'dashboard' && <DashboardPage />}
      </main>

      {/* Floating Action Button (desktop) */}
      <button
        onClick={() => setPostModalOpen(true)}
        className="hidden md:flex fixed bottom-8 right-8 z-30 w-14 h-14 rounded-full bg-teal-600 text-white shadow-lg shadow-teal-500/30 items-center justify-center transition-all hover:scale-110 hover:bg-teal-700 hover:shadow-xl"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/40 bg-background/90 backdrop-blur-lg">
        <div className="max-w-2xl mx-auto flex items-center justify-around px-2 h-16">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              (item.id === 'feed' && page === 'feed') ||
              (item.id === 'dashboard' && page === 'dashboard');
            const isPost = item.id === 'post';
            const isSearch = item.id === 'search';

            if (isPost) {
              return (
                <button
                  key={item.id}
                  onClick={() => setPostModalOpen(true)}
                  className="flex flex-col items-center justify-center -mt-4 w-12 h-12 rounded-full bg-teal-600 text-white shadow-lg shadow-teal-500/30 transition-all hover:scale-110 hover:bg-teal-700"
                >
                  <Icon className="w-5 h-5" />
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (isSearch) setSearchOpen(true);
                  else if (item.id === 'feed') setPage('feed');
                  else if (item.id === 'dashboard') setPage('dashboard');
                  else if (item.id === 'notifications') toast('No new notifications');
                }}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 w-12 h-12 rounded-lg text-xs font-medium transition-colors',
                  isActive ? 'text-teal-600' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className={cn('w-5 h-5', isActive && 'text-teal-600')} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <PostItemModal open={postModalOpen} onOpenChange={setPostModalOpen} onPosted={handlePosted} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster richColors position="top-center" />
    </AuthProvider>
  );
}

export default App;
