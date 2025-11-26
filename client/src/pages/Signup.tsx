import { useState, FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import AuthLayout from '@/components/AuthLayout';

export default function Signup() {
  const [, setLocation] = useLocation();
  const { signUp, isSupabaseEnabled } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Redirect if Supabase not configured
  if (!isSupabaseEnabled) {
    setLocation('/');
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const { user, error } = await signUp(email, password, nickname || undefined);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (user) {
      // Check if email confirmation is required
      if (error?.message.includes('check your email')) {
        setSuccess('Account created! Please check your email to confirm your account.');
        setLoading(false);
      } else {
        // Successful signup and auto-login - redirect to home
        setLocation('/');
      }
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
          <p className="text-muted-foreground">
            Sign up to sync your progress across devices
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-500 text-green-700 dark:text-green-400">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="nickname">
              Nickname <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Input
              id="nickname"
              type="text"
              placeholder="What should we call you?"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              autoComplete="nickname"
              disabled={loading || !!success}
              maxLength={50}
              className="h-11"
            />
            <p className="text-xs text-muted-foreground">
              This will be your avatar's name
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={loading || !!success}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              disabled={loading || !!success}
              minLength={6}
              className="h-11"
            />
            <p className="text-xs text-muted-foreground">
              Must be at least 6 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              disabled={loading || !!success}
              minLength={6}
              className="h-11"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-11"
            disabled={loading || !!success}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : success ? (
              'Check your email'
            ) : (
              'Create account'
            )}
          </Button>
        </form>

        {/* Footer Links */}
        <div className="space-y-4 text-center">
          <div className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Button
              type="button"
              variant="link"
              className="px-1 h-auto font-semibold"
              onClick={() => setLocation('/login')}
              disabled={loading}
            >
              Sign in
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            Or{' '}
            <Button
              type="button"
              variant="link"
              className="px-1 h-auto font-normal text-xs"
              onClick={() => setLocation('/')}
              disabled={loading}
            >
              continue as guest
            </Button>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
