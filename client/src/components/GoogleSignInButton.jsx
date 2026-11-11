import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export function GoogleSignInButton({ onSuccess, className = '' }) {
  const { loginWithGoogle } = useAuth();
  const buttonRef = useRef(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [initError, setInitError] = useState(null);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    let interval = null;

    function initGoogle() {
      if (!window.google?.accounts?.id) {
        return false;
      }

      if (!googleClientId) {
        setInitError('VITE_GOOGLE_CLIENT_ID is not configured in client environment.');
        return true;
      }

      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response) => {
            if (!response.credential) {
              toast.error('No credential token received from Google.');
              return;
            }
            try {
              const result = await loginWithGoogle({ credential: response.credential });
              if (onSuccess) onSuccess(result);
            } catch (err) {
              const msg = err.response?.data?.message || 'Google account verification failed';
              toast.error(msg);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true
        });

        if (buttonRef.current) {
          buttonRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(buttonRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            width: buttonRef.current.offsetWidth || 340
          });
        }

        setSdkLoaded(true);
        setInitError(null);
        return true;
      } catch (err) {
        console.error('Google Sign-In initialization error:', err);
        setInitError(err.message);
        return true;
      }
    }

    if (!initGoogle()) {
      interval = setInterval(() => {
        if (initGoogle()) {
          clearInterval(interval);
        }
      }, 300);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [googleClientId]);

  const handleManualClick = () => {
    if (!googleClientId) {
      toast((t) => (
        <div className="text-xs">
          <p className="font-bold text-slate-900 mb-1">Google OAuth Configuration Needed</p>
          <p className="text-slate-600 mb-2">
            Please set <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">VITE_GOOGLE_CLIENT_ID</code> in Render/Client environment.
          </p>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-2.5 py-1 bg-[#002B55] text-white text-[11px] rounded font-semibold"
          >
            Dismiss
          </button>
        </div>
      ), { duration: 6000 });
      return;
    }

    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    }
  };

  return (
    <div className={`w-full flex flex-col items-center justify-center ${className}`}>
      {/* Official Google Button Container */}
      <div ref={buttonRef} className="w-full flex justify-center min-h-[44px]">
        {/* Fallback button while Google SDK initializes or if client ID needs setup */}
        <button
          type="button"
          onClick={handleManualClick}
          className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 transition shadow-xs flex items-center justify-center gap-3 text-xs sm:text-sm font-semibold text-slate-700"
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
          <span>Continue with Google</span>
        </button>
      </div>

      {initError && (
        <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1 mt-2 text-center">
          Notice: {initError}
        </p>
      )}
    </div>
  );
}
