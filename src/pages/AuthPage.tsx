import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CAMPUS_LOCATIONS } from '@/lib/constants';
import { GraduationCap, BookOpen, Cpu, FlaskConical, AlertCircle, BadgeCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function AuthPage() {
  const { refreshProfile } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [campusLocation, setCampusLocation] = useState<string>(CAMPUS_LOCATIONS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!emailValid) { setError('Please enter a valid email address.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setSubmitting(true);
    try {
      if (mode === 'signup') {
        if (!fullName.trim()) { setError('Please enter your full name.'); setSubmitting(false); return; }
        const { data, error: signUpError } = await supabase.auth.signUp({ email: email.trim().toLowerCase(), password });
        if (signUpError) throw signUpError;
        if (data.user) {
          await supabase.from('profiles').insert({ id: data.user.id, full_name: fullName.trim(), campus_location: campusLocation });
        }
        toast.success('Account created! Welcome to CampusShare.');
        await refreshProfile();
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
        if (signInError) throw signInError;
        toast.success('Welcome back!');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-teal-50 p-4">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Branding */}
        <div className="hidden lg:flex flex-col gap-6 p-8">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/30">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">CampusShare</h1>
              <p className="text-sm text-muted-foreground">Share smarter, campus together.</p>
            </div>
          </div>
          <div className="space-y-4 mt-4">
            <h2 className="text-3xl font-bold leading-tight tracking-tight">
              The campus marketplace for borrowing, lending & donating.
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Forgot your textbook? Need a lab kit? Want to donate old electronics? Connect with students on your campus in seconds.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="flex -space-x-2">
                {['bg-teal-400', 'bg-teal-500', 'bg-cyan-400', 'bg-sky-400'].map((c, i) => (
                  <div key={i} className={`w-9 h-9 rounded-full ${c} border-2 border-white`} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">Join hundreds of students on campus</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6">
            {[
              { icon: BookOpen, label: 'Textbooks' },
              { icon: FlaskConical, label: 'Lab Gear' },
              { icon: Cpu, label: 'Electronics' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/80 border border-border/40">
                <Icon className="w-6 h-6 text-teal-600" />
                <span className="text-xs font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Auth form */}
        <Card className="shadow-xl border-border/50">
          <CardHeader>
            <div className="flex items-center gap-2 lg:hidden mb-2">
              <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-lg">CampusShare</span>
            </div>
            <CardTitle className="text-2xl">{mode === 'signup' ? 'Create your account' : 'Welcome back'}</CardTitle>
            <CardDescription>{mode === 'signup' ? 'Sign up with your email to get started.' : 'Sign in to your campus account.'}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={mode} onValueChange={(v) => { setMode(v as 'signin' | 'signup'); setError(''); }}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
                <TabsTrigger value="signin">Sign In</TabsTrigger>
              </TabsList>
              <TabsContent value={mode}>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === 'signup' && (
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Alex Johnson" autoComplete="name" />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" autoComplete="email" />
                    {email.length > 0 && !emailValid && (
                      <p className="text-xs text-amber-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Please enter a valid email address
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} />
                  </div>
                  {mode === 'signup' && (
                    <div className="space-y-2">
                      <Label htmlFor="campusLocation">Default Pickup Location</Label>
                      <Select value={campusLocation} onValueChange={setCampusLocation}>
                        <SelectTrigger id="campusLocation"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {CAMPUS_LOCATIONS.map((loc) => (
                            <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {error && (
                    <div className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
                  <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={submitting}>
                    {submitting ? 'Please wait…' : mode === 'signup' ? 'Create Account' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
