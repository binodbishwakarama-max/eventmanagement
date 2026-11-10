import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { DsuLogo } from '../components/DsuLogo';
import { GoogleSignInModal } from '../components/GoogleSignInModal';
import { parseDsuIdentity } from '../utils/dsuRollParser';
import { loginSchema, forgotPasswordSchema } from '../features/auth/schemas';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  X,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Compass,
  GraduationCap
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
  const [portalMode, setPortalMode] = useState('student'); // 'student' | 'admin'

  // Google SSO Modal
  const [googleModalOpen, setGoogleModalOpen] = useState(false);

  // Forgot password modal state
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSentToken, setForgotSentToken] = useState(null);
  const [forgotError, setForgotError] = useState('');

  // Live Smart Academic Identity Parser
  const parsedIdentity = parseDsuIdentity(emailInput);

  const handleQuickAppendDomain = () => {
    if (!emailInput.includes('@')) {
      setEmailInput(`${emailInput.trim()}@dsu.edu.in`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    // Auto-normalize email: if user just typed roll number like "eng25cs0453", append @dsu.edu.in
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

  const handleGoogleSuccess = ({ user, isNew }) => {
    if (isNew) {
      navigate('/onboarding');
    } else {
      const returnTo = location.state?.from;
      const fallback =
        user.role === 'admin' || user.role === 'organizer' ? '/admin' : '/dashboard';
      navigate(returnTo ? `${returnTo.pathname}${returnTo.search || ''}` : fallback, {
        replace: true
      });
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
    <div className="min-h-[calc(100vh-140px)] min-h-[calc(100dvh-140px)] flex items-center justify-center p-3 sm:p-6 lg:p-12 bg-slate-50 selection:bg-[#002B55] selection:text-white">
      <GoogleSignInModal
        isOpen={googleModalOpen}
        onClose={() => setGoogleModalOpen(false)}
        onSuccess={handleGoogleSuccess}
      />

      <div className="max-w-4xl w-full bg-white rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-2xl border border-slate-200 apple-card apple-modal-spring">
        {/* Left Column: Authentic DSU Harohalli Campus Backdrop & Institutional Identity */}
        <div className="lg:col-span-5 bg-[#00142A] text-white p-6 sm:p-8 lg:p-10 flex flex-col justify-between relative border-r border-amber-500/20 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-35 pointer-events-none dsu-auth-backdrop"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#00142A] via-[#001B36]/85 to-[#002244]/80 pointer-events-none" />

          <div className="relative z-10">
            <div className="mb-6">
              <DsuLogo variant="white" size="xl" />
            </div>

            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
              Institutional Access Portal
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              Dayananda Sagar University
            </h2>
            <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
              Official campus events, digital entry passbooks, and verified student credentials for Harohalli Main Campus.
            </p>
          </div>

          <div className="my-6 space-y-3 relative z-10">
            {/* Campus Roll format banner */}
            <div className="p-3.5 rounded-2xl bg-blue-900/60 border border-blue-800/80 text-xs text-slate-200 space-y-1.5 backdrop-blur-sm">
              <div className="font-bold text-amber-400 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-[11px] uppercase tracking-wider">
                  Student Email Format
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-mono leading-relaxed">
                eng25cs0453@dsu.edu.in<br />
                eng24aiml012@dsu.edu.in<br />
                eng23ds088@dsu.edu.in
              </p>
            </div>

            {/* Duolingo-style onboarding callout */}
            <Link
              to="/onboarding"
              className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-blue-900/60 border border-amber-400/40 text-xs text-white flex items-center justify-between group hover:border-amber-400 transition apple-press"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">🦅</span>
                <div>
                  <p className="font-extrabold text-amber-300 text-xs">New to DSU Campus?</p>
                  <p className="text-[11px] text-slate-300">Launch 60-Second Onboarding</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition" />
            </Link>
          </div>

          <div className="text-[11px] text-slate-400 border-t border-white/10 pt-3 relative z-10 flex items-center justify-between">
            <span>Harohalli Main Campus, Bengaluru</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> SSO Active
            </span>
          </div>
        </div>

        {/* Right Side: Sign In Form with Google SSO & Smart Roll Parser */}
        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-white">
          <div>
            {/* Top Bar: DSU Logo & Enroll link */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-950 block mb-0.5">
                  University Authentication
                </span>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                  Sign In
                </h1>
              </div>

              <Link
                to="/register"
                className="text-xs font-bold text-blue-900 hover:text-blue-800 underline decoration-slate-300 hover:decoration-blue-900 underline-offset-4"
              >
                Enroll as Student →
              </Link>
            </div>

            {/* Portal Role Tabs */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => {
                  setPortalMode('student');
                  if (emailInput === 'admin@dsu.edu.in') setEmailInput('');
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition apple-press ${
                  portalMode === 'student'
                    ? 'bg-white text-blue-950 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                🎓 Student Portal
              </button>
              <button
                type="button"
                onClick={() => {
                  setPortalMode('admin');
                  setEmailInput('admin@dsu.edu.in');
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition apple-press ${
                  portalMode === 'admin'
                    ? 'bg-white text-blue-950 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                🛡️ Faculty & Admin
              </button>
            </div>

            {/* PRIMARY: Continue with Google Button */}
            {portalMode === 'student' && (
              <div className="mb-6 space-y-3">
                <button
                  type="button"
                  onClick={() => setGoogleModalOpen(true)}
                  className="w-full py-3 px-4 rounded-2xl border-2 border-slate-200 hover:border-[#4285F4] bg-white hover:bg-slate-50/80 transition-all shadow-sm flex items-center justify-center gap-3 group apple-press"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-[#4285F4]">
                    Continue with Google Workspace
                  </span>
                </button>

                <div className="relative flex items-center justify-center">
                  <div className="border-t border-slate-200 w-full" />
                  <span className="bg-white px-3 text-[10px] uppercase font-bold tracking-wider text-slate-400 absolute">
                    or sign in with college ID
                  </span>
                </div>
              </div>
            )}

            {/* Standard Credentials Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* College Email or Roll Number */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="login-email"
                    className="block text-xs font-bold text-slate-700"
                  >
                    College Email / Student Roll Number <span className="text-rose-500">*</span>
                  </label>
                  {!emailInput.includes('@') && emailInput.trim().length >= 3 && (
                    <button
                      type="button"
                      onClick={handleQuickAppendDomain}
                      className="text-[10px] font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-full transition apple-press"
                    >
                      + @dsu.edu.in
                    </button>
                  )}
                </div>

                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    id="login-email"
                    name="email"
                    autoComplete="username"
                    required
                    placeholder={
                      portalMode === 'admin'
                        ? 'admin@dsu.edu.in'
                        : 'e.g. eng25cs0453, eng24aiml012, or eng23ds088'
                    }
                    value={emailInput}
                    onChange={(e) => {
                      setEmailInput(e.target.value);
                      if (fieldErrors.email) {
                        setFieldErrors((prev) => ({ ...prev, email: null }));
                      }
                    }}
                    className={`w-full pl-10 pr-4 py-2.5 bg-white border-2 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition ${
                      fieldErrors.email
                        ? 'border-rose-400 focus:border-rose-500'
                        : 'border-slate-200 focus:border-[#002B55] focus:ring-2 focus:ring-[#002B55]/10'
                    }`}
                  />
                </div>

                {/* Real-time Branch / Department Detection Badge */}
                {parsedIdentity && (
                  <div className="mt-2 p-2 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-[#002B55] flex items-center gap-2 apple-modal-spring">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="font-bold text-[11px]">{parsedIdentity.badgeText}</span>
                    <span className="text-[10px] text-slate-500 ml-auto hidden sm:inline">
                      {parsedIdentity.degree}
                    </span>
                  </div>
                )}

                {fieldErrors.email && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="login-password"
                    className="block text-xs font-bold text-slate-700"
                  >
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(true)}
                    className="text-xs font-semibold text-blue-900 hover:underline"
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
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) {
                        setFieldErrors((prev) => ({ ...prev, password: null }));
                      }
                    }}
                    className={`w-full pl-10 pr-11 py-2.5 bg-white border-2 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition ${
                      fieldErrors.password
                        ? 'border-rose-400 focus:border-rose-500'
                        : 'border-slate-200 focus:border-[#002B55] focus:ring-2 focus:ring-[#002B55]/10'
                    }`}
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
                {fieldErrors.password && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.password}</p>
                )}
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-[#002B55] hover:bg-[#001B36] text-white font-extrabold text-sm py-3 rounded-xl transition shadow border-b-4 border-[#00142A] active:border-b-0 active:translate-y-1 flex items-center justify-center gap-2 disabled:opacity-50 apple-press"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to DSU Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Dayananda Sagar University</span>
            <Link to="/events" className="hover:text-blue-900 font-bold">
              Browse Public Events →
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative apple-modal-spring">
            <button
              type="button"
              onClick={() => {
                setForgotModalOpen(false);
                setForgotSentToken(null);
                setForgotError('');
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-900 flex items-center justify-center mx-auto mb-3">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Forgot Your Password?</h3>
              <p className="text-xs text-slate-500 mt-1.5">
                Enter your college email or student roll number to receive password reset instructions.
              </p>
            </div>

            {forgotSentToken ? (
              <div className="text-center space-y-4">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                  <p className="font-bold">Instructions Sent!</p>
                  <p className="text-[11px] mt-1">
                    Check your university inbox for the secure reset link.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setForgotModalOpen(false);
                    setForgotSentToken(null);
                  }}
                  className="w-full bg-[#002B55] text-white font-bold text-xs py-2.5 rounded-xl transition apple-press"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    College Email or Roll Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. eng25cs0453@dsu.edu.in"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 border rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#002B55]"
                  />
                  {forgotError && (
                    <p className="text-xs text-rose-600 mt-1">{forgotError}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full bg-[#002B55] hover:bg-[#001B36] text-white font-bold text-xs py-3 rounded-xl transition shadow disabled:opacity-50 apple-press"
                >
                  {forgotLoading ? 'Processing...' : 'Send Password Reset Link'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
