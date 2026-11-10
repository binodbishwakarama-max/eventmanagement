import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { DsuLogo } from '../components/DsuLogo';
import { loginSchema, forgotPasswordSchema } from '../features/auth/schemas';
import { Eye, EyeOff, Lock, Mail, X, CheckCircle2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Forgot password modal state
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSentToken, setForgotSentToken] = useState(null);
  const [forgotError, setForgotError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    const validation = loginSchema.safeParse({ email, password });
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
      const user = await login(email.trim(), password);
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

    const validation = forgotPasswordSchema.safeParse({ email: forgotEmail });
    if (!validation.success) {
      setForgotError(validation.error.issues[0].message);
      return;
    }

    setForgotLoading(true);
    try {
      const res = await apiClient.post('/auth/forgot-password', { email: forgotEmail.trim() });
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
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-4 sm:p-6 lg:p-12 bg-slate-50">
      <div className="max-w-4xl w-full bg-white rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-xl border border-slate-200">
        {/* Institutional brand column with authentic DSU Harohalli Campus Backdrop */}
        <div className="lg:col-span-5 bg-blue-950 text-white p-8 sm:p-10 flex flex-col justify-between relative border-r border-amber-500/20 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30 pointer-events-none"
            style={{ backgroundImage: `url('/dsu-main-campus-admission.jpg')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#00142A] via-[#001B36]/85 to-[#002244]/80 pointer-events-none" />

          <div className="relative z-10">
            <div className="mb-8">
              <DsuLogo variant="white" size="md" />
            </div>

            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 block mb-2">
              Institutional Access Portal
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Dayananda Sagar University
            </h2>
            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              Sign in with your university account to register for collegiate conferences,
              download digital entry passes, or manage registered student activities.
            </p>
          </div>

          <div className="my-8 space-y-3">
            <div className="p-4 rounded-xl bg-blue-900/60 border border-blue-800 text-xs text-slate-200 space-y-2">
              <div className="font-bold text-amber-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Verified Campus Network
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Single sign-on gateway for students, registered student bodies, and department
                heads.
              </p>
            </div>

            <p className="text-xs text-slate-400">
              Harohalli Main Campus, Kanakapura Road, Bengaluru.
            </p>
          </div>

          <div className="text-xs text-slate-400 border-t border-blue-900/60 pt-4">
            Office of Campus Life & Student Affairs
          </div>
        </div>

        {/* Right Side: Sign In Form */}
        <div className="lg:col-span-7 p-8 sm:p-10 lg:p-12 flex flex-col justify-between bg-white">
          <div>
            <div className="flex items-center justify-between gap-4 mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-900 block mb-1">
                  University Authentication
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
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

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Email */}
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  University Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    id="login-email"
                    name="email"
                    autoComplete="email"
                    required
                    placeholder="student@dsu.edu.in"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) {
                        setFieldErrors((prev) => ({ ...prev, email: null }));
                      }
                    }}
                    className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition ${
                      fieldErrors.email
                        ? 'border-rose-400 focus:ring-rose-200'
                        : 'border-slate-300 focus:ring-blue-900 focus:border-blue-900'
                    }`}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="login-password"
                    className="block text-xs font-semibold text-slate-700"
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
                    className={`w-full pl-10 pr-11 py-2.5 bg-white border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition ${
                      fieldErrors.password
                        ? 'border-rose-400 focus:ring-rose-200'
                        : 'border-slate-300 focus:ring-blue-900 focus:border-blue-900'
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

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 bg-blue-900 hover:bg-blue-800 text-white font-semibold text-sm py-3 rounded-xl transition shadow flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Dayananda Sagar University</span>
            <Link to="/events" className="hover:text-blue-900 font-medium">
              Browse Public Events →
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in duration-200">
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
                Enter your university email address and we will issue password reset instructions.
              </p>
            </div>

            {forgotSentToken ? (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm">Reset link dispatched</p>
                    <p className="text-slate-600 mt-1">
                      Check your university email inbox for password reset instructions.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs break-all">
                  <Link
                    to={`/reset-password?token=${forgotSentToken}`}
                    onClick={() => setForgotModalOpen(false)}
                    className="text-blue-900 font-bold hover:underline"
                  >
                    Open Password Reset Page →
                  </Link>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setForgotModalOpen(false);
                    setForgotSentToken(null);
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4 text-xs" noValidate>
                <div>
                  <label
                    htmlFor="forgot-email"
                    className="block font-semibold text-slate-700 mb-1.5"
                  >
                    Account Email Address
                  </label>
                  <input
                    type="email"
                    id="forgot-email"
                    required
                    placeholder="student@dsu.edu.in"
                    value={forgotEmail}
                    onChange={(e) => {
                      setForgotEmail(e.target.value);
                      if (forgotError) setForgotError('');
                    }}
                    className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 ${
                      forgotError
                        ? 'border-rose-400 focus:ring-rose-200'
                        : 'border-slate-300 focus:ring-blue-900 focus:border-blue-900'
                    }`}
                  />
                  {forgotError && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">{forgotError}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs transition shadow disabled:opacity-50"
                >
                  {forgotLoading ? 'Submitting Request...' : 'Send Password Reset Link'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
