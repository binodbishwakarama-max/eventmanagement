import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '../api/client';
import { DsuLogo } from '../components/DsuLogo';
import { resetPasswordSchema } from '../features/auth/schemas';
import { Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!token) {
      toast.error('Password reset token is missing from the link');
      return;
    }

    const validation = resetPasswordSchema.safeParse({
      newPassword: password,
      confirmPassword
    });

    if (!validation.success) {
      setErrorMsg(validation.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/auth/reset-password', {
        token,
        password
      });
      setSuccess(true);
      toast.success('Password reset successfully! Please sign in with your new password.');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Password reset failed. The link may have expired.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-4 sm:p-6 lg:p-12 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-200">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <DsuLogo variant="navy" size="md" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-900 block mb-1">
            Account Security
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Reset Your Password
          </h1>
          <p className="text-xs text-slate-500 mt-2">
            Enter and confirm your new institutional credentials below.
          </p>
        </div>

        {!token ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-xs text-rose-800 space-y-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center mx-auto text-rose-600">
              <AlertCircle className="w-5 h-5" />
            </div>
            <p className="font-semibold text-sm">Missing Reset Token</p>
            <p className="text-slate-600">
              This password reset link is invalid or incomplete. Please request a new password reset link.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 mt-2 font-semibold text-blue-900 hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Sign In
            </Link>
          </div>
        ) : success ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center text-xs text-emerald-900 space-y-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="font-semibold text-sm">Password Updated!</p>
            <p className="text-slate-600">
              Your password has been reset. All prior active sessions have been invalidated. Redirecting to sign in...
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-blue-900 text-white text-xs font-semibold hover:bg-blue-800 transition"
            >
              Go to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs" noValidate>
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-medium">
                {errorMsg}
              </div>
            )}

            <div>
              <label htmlFor="reset-new-password" className="block font-semibold text-slate-700 mb-1.5">
                New Password (min 8 characters, uppercase, number)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="reset-new-password"
                  name="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-4 pr-11 py-2.5 bg-white border border-slate-300 focus:border-blue-900 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="reset-confirm-password" className="block font-semibold text-slate-700 mb-1.5">
                Confirm New Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="reset-confirm-password"
                name="confirmPassword"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 focus:border-blue-900 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs transition shadow disabled:opacity-50"
            >
              {loading ? 'Updating Credentials...' : 'Save New Password & Invalidate Sessions'}
            </button>

            <div className="text-center pt-2">
              <Link to="/login" className="text-xs text-slate-500 hover:text-blue-900 font-semibold">
                ← Return to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
