import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch {
      setError("Couldn't send the reset email. Check the address and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-moss font-display text-xl font-bold text-white">
            N
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink">Reset your password</h1>
          <p className="mt-1 text-sm text-ink-muted">We&apos;ll email you a link to choose a new one.</p>
        </div>

        {sent ? (
          <div className="rounded-xl border border-moss/30 bg-moss-soft px-4 py-4 text-sm text-moss">
            Check {email} for a reset link.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="email"
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
            {error && <p className="text-sm text-clay">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Sending…' : 'Send reset link'}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-ink-muted">
          <Link to="/signin" className="font-medium text-moss hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
