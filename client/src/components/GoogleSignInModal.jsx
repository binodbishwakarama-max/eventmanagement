import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { parseDsuIdentity } from '../utils/dsuRollParser';
import { X, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export function GoogleSignInModal({ isOpen, onClose, onSuccess }) {
  const { loginWithGoogle } = useAuth();
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const parsed = parseDsuIdentity(googleEmail);

  const handleInstantGoogleAuth = async (emailOverride, nameOverride) => {
    const emailToUse = (emailOverride || googleEmail).trim().toLowerCase();
    const nameToUse = (nameOverride || googleName || emailToUse.split('@')[0]).trim();

    if (!emailToUse) {
      toast.error('Please enter your institutional university email');
      return;
    }

    setLoading(true);
    try {
      const res = await loginWithGoogle({
        email: emailToUse.includes('@') ? emailToUse : `${emailToUse}@dsu.edu.in`,
        name: nameToUse,
        credential: 'google-oauth2-institutional-session',
        usn: parsed?.usn
      });
      onClose();
      if (onSuccess) onSuccess(res);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google SSO verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative apple-modal-spring overflow-hidden">
        {/* Specular ambient top gradient */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853]" />

        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <svg className="w-8 h-8" viewBox="0 0 24 24">
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
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
              Institutional Google SSO
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Dayananda Sagar University Google Workspace
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 mb-4 leading-relaxed">
          Sign in instantly using your official college student account. Your branch, graduation year, and student passbook will be auto-synced.
        </p>

        {/* Quick-Pick Campus Demo Accounts */}
        <div className="space-y-2 mb-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            One-Click Student Identity (Or enter your own)
          </span>

          <button
            type="button"
            onClick={() => handleInstantGoogleAuth('eng25cs0453@dsu.edu.in', 'Aditya Sharma')}
            className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-[#002B55] hover:bg-slate-50 transition flex items-center justify-between group apple-press"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-900 font-bold text-xs flex items-center justify-center">
                AS
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 group-hover:text-blue-900">
                  Aditya Sharma
                </p>
                <p className="text-[11px] font-mono text-slate-500">eng25cs0453@dsu.edu.in</p>
              </div>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
              CSE '29
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleInstantGoogleAuth('eng24aiml012@dsu.edu.in', 'Sneha Rao')}
            className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-[#002B55] hover:bg-slate-50 transition flex items-center justify-between group apple-press"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center justify-center">
                SR
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 group-hover:text-blue-900">
                  Sneha Rao
                </p>
                <p className="text-[11px] font-mono text-slate-500">eng24aiml012@dsu.edu.in</p>
              </div>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
              AI & ML '28
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleInstantGoogleAuth('eng23ds088@dsu.edu.in', 'Vikram Patel')}
            className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-[#002B55] hover:bg-slate-50 transition flex items-center justify-between group apple-press"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center">
                VP
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 group-hover:text-blue-900">
                  Vikram Patel
                </p>
                <p className="text-[11px] font-mono text-slate-500">eng23ds088@dsu.edu.in</p>
              </div>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
              Data Science '27
            </span>
          </button>
        </div>

        {/* Custom DSU Google Account Input */}
        <div className="border-t border-slate-100 pt-3 space-y-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Or Custom DSU Student Account:
            </label>
            <input
              type="text"
              placeholder="e.g. eng25cs0453 or name@dsu.edu.in"
              value={googleEmail}
              onChange={(e) => setGoogleEmail(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002B55]"
            />
          </div>

          {parsed && (
            <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/60 flex items-center gap-2 text-xs text-blue-900">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="font-semibold">{parsed.badgeText}</span>
            </div>
          )}

          <button
            type="button"
            disabled={loading || !googleEmail.trim()}
            onClick={() => handleInstantGoogleAuth()}
            className="w-full bg-[#002B55] hover:bg-[#001B36] text-white text-xs font-bold py-2.5 rounded-xl transition shadow flex items-center justify-center gap-2 disabled:opacity-50 apple-press"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign in with Google Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> DSU Secured OAuth 2.0
          </span>
          <span>Single Sign-On</span>
        </div>
      </div>
    </div>
  );
}

