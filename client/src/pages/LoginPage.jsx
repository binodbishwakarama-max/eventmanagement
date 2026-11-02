import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DsuLogo } from '../components/DsuLogo';
import { Eye, EyeOff, Lock, Mail, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      const returnTo = location.state?.from;
      const fallback = user.role === 'admin' || user.role === 'organizer' ? '/admin' : '/dashboard';
      navigate(returnTo ? `${returnTo.pathname}${returnTo.search || ''}` : fallback, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoEmail, demoPw) => {
    setEmail(demoEmail);
    setPassword(demoPw);
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-4 sm:p-6 lg:p-12">
      <div className="max-w-4xl w-full dsu-card overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-xl border border-[#E5E7EB]">
        {/* Left Side: University Brand & Credentials Context */}
        <div className="lg:col-span-5 bg-[#001B36] text-white p-8 sm:p-10 flex flex-col justify-between relative border-r border-[#D9A521]/20">
          <div>
            <div className="mb-8">
              <DsuLogo variant="white" size="md" />
            </div>

            <span className="text-xs font-semibold uppercase tracking-wider text-[#D9A521] block mb-2">
              Dayananda Sagar University
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Campus Events & Passbook Portal
            </h2>
            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              Sign in to manage your active campus event passes, download official hall ticket vouchers, or coordinate university fests.
            </p>
          </div>

          <div className="my-8 space-y-3">
            <div className="p-4 rounded-xl bg-[#002447] border border-blue-900/50 text-xs text-slate-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-[#D9A521]">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Verified DSU Authentication</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Passes sync with your university seat number (USN) for instant desk check-in at Harohalli campus venues.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#D9A521] shrink-0" />
              <span>Harohalli Main Campus, Bengaluru</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#D9A521] shrink-0" />
              <span>NAAC 'A+' Accredited Institution</span>
            </div>
          </div>

          <div className="text-xs text-slate-400 border-t border-blue-900/50 pt-4">
            Mahatma Gandhi Vidya Peetha (MGVP) Trust
          </div>
        </div>

        {/* Right Side: Sign In Form */}
        <div className="lg:col-span-7 p-8 sm:p-10 lg:p-12 flex flex-col justify-between bg-white">
          <div>
            <div className="flex items-center justify-between gap-4 mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#002B55] block mb-1">
                  University Single Sign-On
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#002B55]">
                  Sign In
                </h1>
              </div>

              <Link
                to="/register"
                className="text-xs font-semibold text-[#002B55] hover:text-[#D9A521] transition"
              >
                Create Student Account →
              </Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label htmlFor="login-email" className="block font-semibold text-slate-700 mb-1.5">
                  University Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    id="login-email"
                    name="email"
                    autoComplete="email"
                    required
                    placeholder="e.g. student1@example.test or student@dsu.edu.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E7EB] focus:border-[#002B55] rounded-xl text-sm text-[#172033] placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#002B55] transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="login-password" className="block font-semibold text-slate-700">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="login-password"
                    name="password"
                    autoComplete="current-password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-2.5 bg-white border border-[#E5E7EB] focus:border-[#002B55] rounded-xl text-sm text-[#172033] placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#002B55] transition"
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

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-[#002B55] hover:bg-[#001B36] text-white font-semibold text-xs py-3 rounded-full transition shadow-xs active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In to Campus Portal'}
              </button>
            </form>

            {/* Quick Demo Logins Pill Strip */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-2.5">
                Evaluation Demo Accounts (1-Click Fill)
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('student1@example.test', 'Student@123')}
                  className="px-2.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-[#E5E7EB] text-xs font-medium text-slate-700 transition text-center"
                >
                  <span className="block font-semibold text-[#002B55]">Student</span>
                  <span className="text-[10px] text-slate-400 font-mono">1DS22CS042</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('organizer@example.test', 'Organizer@123')}
                  className="px-2.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-[#E5E7EB] text-xs font-medium text-slate-700 transition text-center"
                >
                  <span className="block font-semibold text-[#002B55]">Organizer</span>
                  <span className="text-[10px] text-slate-400 font-mono">Faculty Club</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('admin@example.test', 'Admin@123')}
                  className="px-2.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-[#E5E7EB] text-xs font-medium text-slate-700 transition text-center"
                >
                  <span className="block font-semibold text-[#002B55]">Admin</span>
                  <span className="text-[10px] text-slate-400 font-mono">University Desk</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
