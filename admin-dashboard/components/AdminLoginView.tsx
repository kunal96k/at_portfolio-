import { ArrowLeft, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { isValidEmail, PUBLIC_INPUT_LIMITS } from '../../src/utils/scrollMath';

interface AdminLoginViewProps {
  onSuccess: (email: string) => void;
}

export function AdminLoginView({ onSuccess }: AdminLoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!isValidEmail(email)) {
      setError('Please enter a valid admin email address.');
      return;
    }
    if (password.trim().length < 4) {
      setError('Please enter your password (at least 4 characters).');
      return;
    }
    setError(null);
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      onSuccess(email.trim());
    }, 220);
  };

  return (
    <div className="flex min-h-screen flex-col justify-between bg-[#F5F7FC] px-4 py-8 text-[#0B1736] sm:px-6">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <a
          href="/"
          className="mb-6 inline-flex min-h-[44px] items-center gap-2 self-start rounded-xl px-2 text-sm font-semibold text-[#475569] transition-colors hover:text-[#145BFF]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Back to Public Website</span>
        </a>

        <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
          <div className="bg-[#0B1736] px-6 py-6 text-white">
            <div className="flex items-center gap-3.5">
              <img
                src="/favicon.png"
                alt="Arvind Thevar"
                referrerPolicy="no-referrer"
                className="h-12 w-12 shrink-0 rounded-xl border border-white/20 object-cover"
              />
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-white">Arvind Thevar</h1>
                <p className="text-xs text-white/70">
                  Admin Workspace · Website Management
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4 p-6">
            <div>
              <h2 className="text-base font-bold text-[#0B1736]">
                Sign in to Admin Dashboard
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-[#64748B]">
                Enter your administrator email and password to manage batches, courses, notes, and enquiries.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-3.5 py-2.5 text-xs font-medium text-[#B91C1C]"
              >
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="admin-login-email"
                className="block text-sm font-semibold text-[#0B1736]"
              >
                Admin Email
              </label>
              <div className="relative mt-1.5">
                <Mail
                  className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#64748B]"
                  aria-hidden="true"
                />
                <input
                  id="admin-login-email"
                  type="email"
                  maxLength={PUBLIC_INPUT_LIMITS.emailMax}
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  placeholder="Enter your email address"
                  className="min-h-[46px] w-full rounded-xl border border-[#E2E8F0] bg-white py-2 pr-3.5 pl-10 text-sm text-[#0B1736] focus:border-[#145BFF] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-login-password"
                className="block text-sm font-semibold text-[#0B1736]"
              >
                Password
              </label>
              <div className="relative mt-1.5">
                <Lock
                  className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#64748B]"
                  aria-hidden="true"
                />
                <input
                  id="admin-login-password"
                  type={showPassword ? 'text' : 'password'}
                  maxLength={128}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  placeholder="Enter your password"
                  className="min-h-[46px] w-full rounded-xl border border-[#E2E8F0] bg-white py-2 pr-12 pl-10 text-sm text-[#0B1736] focus:border-[#145BFF] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute top-1/2 right-1.5 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F5F7FC] hover:text-[#0B1736]"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 min-h-[48px] w-full rounded-xl bg-[#145BFF] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0F4AD6] disabled:opacity-60"
            >
              {submitting ? 'Signing in…' : 'Sign In to Dashboard'}
            </button>
          </form>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-[#64748B]">
        Arvind Thevar Admin Workspace
      </p>
    </div>
  );
}
