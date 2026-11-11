import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Compass,
  Calendar,
  Ticket,
  MapPin,
  User,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/client';
import { CampusMapModal } from '../CampusMapModal';

/**
 * MobileBottomNav: Apple/Linear-inspired bottom tab bar for mobile viewports (< 768px).
 * Features:
 * - 44x44px minimum touch targets
 * - Native iOS home-indicator safe area inset
 * - Haptic-like visual transitions and active state indicators
 * - Live dynamic ticket badge
 */
export function MobileBottomNav() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mapOpen, setMapOpen] = useState(false);
  const [activePassCount, setActivePassCount] = useState(0);

  // Synchronize registered pass badge
  useEffect(() => {
    let isMounted = true;
    async function loadPasses() {
      if (!user || user.role !== 'student') {
        setActivePassCount(0);
        return;
      }
      try {
        const res = await apiClient.get('/registrations/me');
        if (isMounted) {
          const registered = (res.data?.data || []).filter((r) => r.status === 'registered');
          setActivePassCount(registered.length);
        }
      } catch {
        try {
          const cached = localStorage.getItem('dsu_cached_passes');
          if (cached && isMounted) {
            const parsed = JSON.parse(cached);
            setActivePassCount(parsed.filter((r) => r.status === 'registered').length);
          }
        } catch {
          if (isMounted) setActivePassCount(0);
        }
      }
    }
    loadPasses();
    const handleUpdate = () => loadPasses();
    window.addEventListener('dsu-registrations-updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('dsu-registrations-updated', handleUpdate);
    };
  }, [user, location.pathname]);

  // Tab definitions
  const isEventsActive = location.pathname === '/' || location.pathname === '/events';
  const isDashboardActive = location.pathname === '/dashboard';
  const isAdminActive = location.pathname.startsWith('/admin');

  return (
    <>
      <nav
        aria-label="Mobile Bottom Navigation"
        className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 backdrop-blur-2xl border-t border-slate-200/90 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] select-none"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="grid grid-cols-5 h-16 items-center px-1 max-w-md mx-auto">
          {/* 1. Discover / Home */}
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `min-h-[44px] flex flex-col items-center justify-center gap-1 transition-all duration-200 active:scale-95 ${
                isActive || isEventsActive
                  ? 'text-[#002B55] font-semibold'
                  : 'text-slate-400 hover:text-slate-600'
              }`
            }
          >
            <div className={`p-1 rounded-xl transition-colors ${isEventsActive ? 'bg-[#002B55]/10' : ''}`}>
              <Compass className={`w-5 h-5 transition-transform ${isEventsActive ? 'scale-110 text-[#002B55]' : ''}`} />
            </div>
            <span className="text-[10px] tracking-tight leading-none">Discover</span>
          </NavLink>

          {/* 2. Campus Venues / Map */}
          <button
            type="button"
            onClick={() => setMapOpen(true)}
            className="min-h-[44px] flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-slate-600 transition-all duration-200 active:scale-95"
          >
            <div className="p-1 rounded-xl">
              <MapPin className="w-5 h-5 text-slate-500" />
            </div>
            <span className="text-[10px] tracking-tight leading-none text-slate-500">Venues</span>
          </button>

          {/* 3. My Passes (Center highlighted action) */}
          <NavLink
            to={user ? '/dashboard' : '/login'}
            className={`min-h-[44px] flex flex-col items-center justify-center gap-1 transition-all duration-200 active:scale-95 relative ${
              isDashboardActive
                ? 'text-[#002B55] font-semibold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className={`p-1 rounded-xl relative transition-colors ${isDashboardActive ? 'bg-[#002B55]/10' : ''}`}>
              <Ticket className={`w-5 h-5 transition-transform ${isDashboardActive ? 'scale-110 text-[#002B55]' : ''}`} />
              {activePassCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#D9A521] text-[#00142A] text-[9px] font-black flex items-center justify-center shadow-xs">
                  {activePassCount}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight leading-none">My Passes</span>
          </NavLink>

          {/* 4. Admin / Organizer Console (if privileged) OR Gate Check-in OR Campus Info */}
          {user && (user.role === 'admin' || user.role === 'organizer') ? (
            <NavLink
              to="/admin"
              className={`min-h-[44px] flex flex-col items-center justify-center gap-1 transition-all duration-200 active:scale-95 ${
                isAdminActive
                  ? 'text-[#002B55] font-semibold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className={`p-1 rounded-xl transition-colors ${isAdminActive ? 'bg-[#002B55]/10' : ''}`}>
                <ShieldCheck className={`w-5 h-5 transition-transform ${isAdminActive ? 'scale-110 text-[#002B55]' : ''}`} />
              </div>
              <span className="text-[10px] tracking-tight leading-none">Console</span>
            </NavLink>
          ) : (
            <NavLink
              to="/events?filter=upcoming"
              className={`min-h-[44px] flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-slate-600 transition-all duration-200 active:scale-95`}
            >
              <div className="p-1 rounded-xl">
                <Calendar className="w-5 h-5 text-slate-500" />
              </div>
              <span className="text-[10px] tracking-tight leading-none text-slate-500">Schedule</span>
            </NavLink>
          )}

          {/* 5. Account / Profile */}
          <NavLink
            to={user ? '/dashboard' : '/login'}
            className={({ isActive }) =>
              `min-h-[44px] flex flex-col items-center justify-center gap-1 transition-all duration-200 active:scale-95 ${
                isActive && !isDashboardActive
                  ? 'text-[#002B55] font-semibold'
                  : 'text-slate-400 hover:text-slate-600'
              }`
            }
          >
            <div className="p-1 rounded-xl">
              {user ? (
                <div className="w-5 h-5 rounded-full bg-[#002B55] text-[#D9A521] text-[10px] font-bold flex items-center justify-center border border-[#D9A521]/40">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
              ) : (
                <User className="w-5 h-5 text-slate-500" />
              )}
            </div>
            <span className="text-[10px] tracking-tight leading-none">
              {user ? 'Profile' : 'Sign In'}
            </span>
          </NavLink>
        </div>
      </nav>

      {/* Venues Interactive Campus Modal */}
      {mapOpen && <CampusMapModal isOpen={mapOpen} onClose={() => setMapOpen(false)} />}
    </>
  );
}

export default MobileBottomNav;
