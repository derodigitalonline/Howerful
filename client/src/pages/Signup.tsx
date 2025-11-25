import { useState, FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>
            Sign up to sync your progress and access Howerful from any device
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
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
              />
              <p className="text-xs text-muted-foreground">
                This will be your avatar's name. You can change it later.
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
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
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

            <div className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Button
                type="button"
                variant="link"
                className="px-1 h-auto font-normal"
                onClick={() => setLocation('/login')}
                disabled={loading}
              >
                Sign in
              </Button>
            </div>

            <div className="text-xs text-center text-muted-foreground">
              Or{' '}
              <Button
                type="button"
                variant="link"
                className="px-1 h-auto font-normal text-xs"
                onClick={() => setLocation('/')}
                disabled={loading}
              >
                continue without an account
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
