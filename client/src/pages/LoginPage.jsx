import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { DsuLogo } from '../components/DsuLogo';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { loginSchema, forgotPasswordSchema } from '../features/auth/schemas';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [emailInput, setEmailInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showCredentialsForm, setShowCredentialsForm] = useState(false);

  // Forgot password modal state
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSentToken, setForgotSentToken] = useState(null);
  const [forgotError, setForgotError] = useState('');

  const handleGoogleSuccess = ({ user, isNew }) => {
    if (isNew) {
      navigate('/onboarding');
    } else {
      const returnTo = location.state?.from;
      const fallback =
        user?.role === 'admin' || user?.role === 'organizer' ? '/admin' : '/dashboard';
      navigate(returnTo ? `${returnTo.pathname}${returnTo.search || ''}` : fallback, {
        replace: true
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    const normalizedEmail = emailInput.includes('@')
      ? emailInput.trim().toLowerCase()
      : `${emailInput.trim().toLowerCase()}@dsu.edu.in`;

    const validation = loginSchema.safeParse({ email: normalizedEmail, password });
    if (!validation.success) {
      const errors = {};
      for (const issue of validation.error.issues) {
        const field = issue.path[0];
        if (!errors[field]) errors[field] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const user = await login(normalizedEmail, password);
      const returnTo = location.state?.from;
      const fallback =
        user.role === 'admin' || user.role === 'organizer' ? '/admin' : '/dashboard';
      navigate(returnTo ? `${returnTo.pathname}${returnTo.search || ''}` : fallback, {
        replace: true
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');

    const targetEmail = forgotEmail.includes('@')
      ? forgotEmail.trim()
      : `${forgotEmail.trim()}@dsu.edu.in`;

    const validation = forgotPasswordSchema.safeParse({ email: targetEmail });
    if (!validation.success) {
      setForgotError(validation.error.issues[0].message);
      return;
    }

    setForgotLoading(true);
    try {
      const res = await apiClient.post('/auth/forgot-password', { email: targetEmail });
      toast.success('Password reset link dispatched!');
      if (res.data?.data?.resetToken) {
        setForgotSentToken(res.data.data.resetToken);
      } else {
        setForgotModalOpen(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request password reset');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-16 selection:bg-[#002B55] selection:text-white">
      <div className="w-full max-w-md mx-auto">
        {/* Main Card Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,43,85,0.06)] border border-slate-100">
          {/* Logo & Headline */}
          <div className="text-center mb-7">
            <div className="flex justify-center mb-4">
              <DsuLogo size="lg" className="mx-auto" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Welcome to DSU Campus Events
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
              Official student and faculty events portal
            </p>
          </div>

          {/* Primary Action: Official Google Sign-In */}
          <div className="space-y-4">
            <GoogleSignInButton onSuccess={handleGoogleSuccess} />

            {/* Subtle Divider */}
            <div className="relative flex items-center justify-center my-5">
              <div className="border-t border-slate-200 w-full" />
              <button
                type="button"
                onClick={() => setShowCredentialsForm(!showCredentialsForm)}
                className="bg-white px-3 text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition absolute flex items-center gap-1 active:scale-95"
              >
                <span>{showCredentialsForm ? 'Hide password sign-in' : 'or sign in with password'}</span>
              </button>
            </div>

            {/* Collapsible Secondary Institutional Credentials Form */}
            {showCredentialsForm && (
              <form onSubmit={handleSubmit} className="space-y-3.5 pt-2" noValidate>
                <div>
                  <label htmlFor="login-email" className="block text-xs font-semibold text-slate-700 mb-1">
                    DSU Email or Roll Number
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      id="login-email"
                      name="email"
                      autoComplete="username"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="e.g. ENG25CS0453 or name@dsu.edu.in"
                      className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002B55]/20 focus:border-[#002B55] transition ${
                        fieldErrors.email ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                      }`}
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{fieldErrors.email}</span>
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setForgotModalOpen(true)}
                      className="text-[11px] font-medium text-[#002B55] hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="login-password"
                      name="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002B55]/20 focus:border-[#002B55] transition ${
                        fieldErrors.password ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{fieldErrors.password}</span>
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#002B55] hover:bg-[#001D3A] text-white text-xs sm:text-sm font-semibold shadow-xs active:scale-98 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Sign In with Password'
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Minimal Footnote & Register Link */}
          <div className="mt-8 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              New to Dayananda Sagar University?{' '}
              <Link
                to="/register"
                className="font-semibold text-[#002B55] hover:underline"
              >
                Create Account
              </Link>
            </p>
            <div className="flex items-center justify-center gap-1.5 mt-3 text-[10px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Official Institutional Authentication • Harohalli Campus</span>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Reset Account Password</h3>
              <button
                type="button"
                onClick={() => {
                  setForgotModalOpen(false);
                  setForgotSentToken(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!forgotSentToken ? (
              <form onSubmit={handleForgotSubmit} className="space-y-3.5 mt-4">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Enter your registered institutional email to receive a secure password reset link.
                </p>
                <div>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="student@dsu.edu.in"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#002B55]/20 focus:border-[#002B55]"
                  />
                  {forgotError && (
                    <p className="text-[11px] text-rose-600 mt-1">{forgotError}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-2.5 rounded-xl bg-[#002B55] hover:bg-[#001D3A] text-white text-xs font-semibold shadow-xs transition"
                >
                  {forgotLoading ? 'Dispatched...' : 'Send Password Reset Link'}
                </button>
              </form>
            ) : (
              <div className="mt-4 space-y-3 text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-900">Reset instructions dispatched!</p>
                <p className="text-[11px] text-slate-500">
                  Follow the instructions sent to your institutional email to complete password recovery.
                </p>
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(false)}
                  className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginPage;
