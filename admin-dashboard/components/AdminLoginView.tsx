import { ArrowLeft, Eye, EyeOff, Lock, ShieldCheck, UserCheck } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import {
  loginAdminBackend,
  type AdminSessionState,
} from '../../src/services/authService';

interface AdminLoginViewProps {
  onSuccess: (session: AdminSessionState) => void;
  sessionNotice?: string | null;
}

export function AdminLoginView({
  onSuccess,
  sessionNotice,
}: AdminLoginViewProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const cleanIdentifier = identifier.trim();
    if (cleanIdentifier.length < 2) {
      setError('Please enter your administrator username or email.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const session = await loginAdminBackend({
        identifier: cleanIdentifier,
        password,
      });
      setPassword('');
      onSuccess(session);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to authenticate with backend server.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-between bg-[#F5F7FC] px-4 py-8 pt-safe pb-safe text-[#0B1736] sm:px-6">
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
                  Admin Workspace · Session-Secured Access
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
                Authenticate with your administrator username or email and password to start a secured session.
              </p>
            </div>

            {sessionNotice && !error && (
              <div
                role="status"
                className="rounded-xl border border-[#FDE68A] bg-[#FFFBEB] px-3.5 py-2.5 text-xs font-medium text-[#92400E]"
              >
                {sessionNotice}
              </div>
            )}

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
                htmlFor="admin-login-identifier"
                className="block text-sm font-semibold text-[#0B1736]"
              >
                Username or Email
              </label>
              <div className="relative mt-1.5">
                <UserCheck
                  className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#64748B]"
                  aria-hidden="true"
                />
                <input
                  id="admin-login-identifier"
                  type="text"
                  maxLength={160}
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    setError(null);
                  }}
                  placeholder="Enter username or admin email"
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
                  maxLength={160}
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
              className="mt-2 min-h-[48px] w-full cursor-pointer rounded-xl bg-[#145BFF] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0F4AD6] disabled:opacity-60"
            >
              {submitting ? 'Signing in…' : 'Sign In to Dashboard'}
            </button>

            <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-[#64748B]">
              <ShieldCheck className="h-3.5 w-3.5 text-[#145BFF]" aria-hidden="true" />
              <span>HttpOnly Session Security · Up to 10 concurrent sessions</span>
            </div>
          </form>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-[#64748B]">
        Arvind Thevar Admin Workspace
      </p>
    </div>
  );
}
