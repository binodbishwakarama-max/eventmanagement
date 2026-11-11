import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Ticket,
  Shield,
  ChevronDown,
  LogOut,
  Menu,
  X,
  MapPin,
  Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { DsuLogo } from './DsuLogo';
import { CampusMapModal } from './CampusMapModal';

const EVENT_CATEGORIES = ['Technical', 'Workshop', 'Cultural', 'Sports', 'Seminar', 'Other'];

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [schoolsDropdownOpen, setSchoolsDropdownOpen] = useState(false);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const dropdownRef = useRef(null);
  const schoolsRef = useRef(null);
  const notifRef = useRef(null);

  const [activePassCount, setActivePassCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const campusNotifications = [
    {
      id: 1,
      title: 'Academic Year 2026 Event Registration Open',
      desc: 'Department conferences, technical symposiums, and varsity sports meet registrations are now live.',
      time: 'Campus Desk'
    },
    {
      id: 2,
      title: 'Digital Gate Entry Guidelines',
      desc: 'Students are requested to keep their encrypted admission QR code ready on mobile or printed passbook.',
      time: 'Student Affairs'
    }
  ];

  const fetchActivePassCount = async () => {
    if (!user || user.role !== 'student') {
      setActivePassCount(0);
      return;
    }
    try {
      const res = await apiClient.get('/registrations/me');
      const active = (res.data?.data || []).filter((r) => r.status === 'registered');
      setActivePassCount(active.length);
    } catch {
      try {
        const cached = localStorage.getItem('dsu_cached_passes');
        if (cached) {
          const parsed = JSON.parse(cached);
          setActivePassCount(parsed.filter((r) => r.status === 'registered').length);
        }
      } catch {
        setActivePassCount(0);
      }
    }
  };

  useEffect(() => {
    fetchActivePassCount();
    const handleUpdate = () => fetchActivePassCount();
    window.addEventListener('dsu-registrations-updated', handleUpdate);
    return () => window.removeEventListener('dsu-registrations-updated', handleUpdate);
  }, [user, location.pathname]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
      if (schoolsRef.current && !schoolsRef.current.contains(event.target)) {
        setSchoolsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path) => {
    if (path === '/events' && (location.pathname === '/' || location.pathname === '/events')) {
      return true;
    }
    return location.pathname === path;
  };

  const getInitials = (name) => {
    if (!name) return 'DS';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isScrolled
            ? 'bg-white/92 backdrop-blur-2xl border-b border-slate-200/90 shadow-[0_10px_30px_-10px_rgba(0,43,85,0.08)]'
            : 'glass-nav border-b border-slate-200/60 shadow-2xs'
        }`}
      >
        {/* University portal header bar - hidden on mobile for clean viewport */}
        <div className="hidden sm:block bg-[#00142A] text-slate-200 px-4 py-1.5 text-xs border-b border-white/5">
          <div className="max-w-[1280px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">Dayananda Sagar University</span>
              <span className="text-slate-500 hidden sm:inline">•</span>
              <span className="text-slate-300 hidden sm:inline">Harohalli Main Campus Events Portal</span>
            </div>
            <span className="text-slate-300 hidden sm:inline font-mono">Harohalli, Kanakapura Road • events@dsu.edu.in</span>
          </div>
        </div>

        {/* Primary project navigation */}
        <nav className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`flex items-center justify-between transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isScrolled ? 'h-16 py-1' : 'h-20 py-2'
            }`}
          >
            <Link
              to="/events"
              className="flex items-center group focus:outline-none apple-press"
              aria-label="Campus Events home"
            >
              <DsuLogo variant="with-tag" size={isScrolled ? 'md' : 'lg'} />
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-1.5 text-sm font-medium text-slate-700">
              <Link
                to="/events"
                className={`px-3.5 py-2 rounded-xl transition-all duration-200 apple-press ${
                  isActive('/events')
                    ? 'bg-[#002B55] text-white font-bold shadow-soft'
                    : 'hover:bg-slate-100/90 hover:text-[#002B55]'
                }`}
              >
                Campus Events
              </Link>

              {/* Event category filter */}
              <div className="relative" ref={schoolsRef}>
                <button
                  type="button"
                  onClick={() => setSchoolsDropdownOpen(!schoolsDropdownOpen)}
                  className={`px-3.5 py-2 rounded-xl transition-colors duration-150 flex items-center gap-1.5 apple-press ${
                    schoolsDropdownOpen
                      ? 'bg-slate-100 text-[#002B55]'
                      : 'hover:bg-slate-100/90 hover:text-[#002B55]'
                  }`}
                >
                  <span>Categories</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {schoolsDropdownOpen && (
                  <div className="absolute left-0 top-full mt-2 w-84 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200 shadow-xl p-2 text-xs z-50 apple-modal-spring">
                    <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                      Event Categories
                    </div>
                    <div className="space-y-0.5 py-1">
                      {EVENT_CATEGORIES.map((category) => (
                        <Link
                          key={category}
                          to={`/events?category=${encodeURIComponent(category)}`}
                          onClick={() => setSchoolsDropdownOpen(false)}
                          className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 transition block apple-press"
                        >
                          <p className="font-bold text-slate-900 text-xs">{category}</p>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">Explore university gatherings & symposiums</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Campus Map Trigger */}
              <button
                type="button"
                onClick={() => setMapModalOpen(true)}
                className="px-3.5 py-2 rounded-xl hover:bg-slate-100/90 hover:text-[#002B55] transition-colors duration-150 flex items-center gap-1.5 apple-press"
              >
                <MapPin className="w-4 h-4 text-[#D9A521]" />
                <span>Campus Map & Venues</span>
              </button>

              {/* My Passes Link */}
              <Link
                to="/dashboard"
                className={`px-3.5 py-2 rounded-xl transition-all duration-150 flex items-center gap-1.5 apple-press ${
                  isActive('/dashboard')
                    ? 'bg-[#002B55] text-white font-bold shadow-soft'
                    : 'hover:bg-slate-100/90 hover:text-[#002B55]'
                }`}
              >
                <Ticket className="w-4 h-4" />
                <span>My Passes</span>
                {activePassCount > 0 && (
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-[#D9A521] text-[#001B36] text-[11px] font-extrabold animate-pulse">
                    {activePassCount}
                  </span>
                )}
              </Link>

              {/* Operations Console for Organizers & Admins */}
              {user && (user.role === 'admin' || user.role === 'organizer') && (
                <Link
                  to="/admin"
                  className={`px-3.5 py-2 rounded-lg transition-colors duration-150 flex items-center gap-1.5 ${
                    isActive('/admin')
                      ? 'bg-[#002B55] text-white font-semibold shadow-xs'
                      : 'hover:bg-slate-100 hover:text-[#002B55]'
                  }`}
                >
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span>Operations</span>
                </Link>
              )}
            </div>

            {/* Right: Notifications & Profile */}
            <div className="hidden sm:flex items-center gap-3">
              {/* Static project notice */}
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={() => {
                    setNotificationsOpen(!notificationsOpen);
                    setUnreadNotifications(0);
                  }}
                  className="relative p-2 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition bg-white text-slate-600 shadow-2xs apple-press"
                  aria-label="Campus announcements"
                  title="Campus announcements"
                >
                  <Bell className="w-4 h-4 text-slate-600" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-blue-900 rounded-full border-2 border-white" />
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200 shadow-xl p-3 text-xs z-50 apple-modal-spring">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                      <span className="font-bold text-[#002B55] text-xs uppercase tracking-wider">Campus Desk</span>
                      <span className="text-[10px] text-slate-500 font-mono">Official Notices</span>
                    </div>
                    <div className="space-y-2">
                      {campusNotifications.map((n) => (
                        <div
                          key={n.id}
                          className="p-2.5 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100 apple-press"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-bold text-slate-800 text-xs">{n.title}</p>
                            <span className="text-[10px] text-slate-400 shrink-0 font-mono">{n.time}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{n.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2.5 p-1.5 pr-3.5 rounded-full border border-slate-200 hover:border-slate-300 transition bg-white shadow-2xs apple-press"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#002B55] text-white font-bold text-xs flex items-center justify-center">
                      {getInitials(user.name)}
                    </div>
                    <div className="text-left hidden md:block">
                      <p className="text-xs font-bold text-slate-900 leading-none truncate max-w-[120px]">
                        {user.name.split(' ')[0]}
                      </p>
                      <p className="text-[10px] text-slate-500 capitalize leading-none mt-1">
                        {user.role}
                      </p>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200 shadow-xl p-2 text-xs z-50 apple-modal-spring">
                      <div className="p-3 border-b border-slate-100 bg-slate-50 rounded-lg mb-1">
                        <p className="font-bold text-slate-900 text-sm truncate">{user.name}</p>
                        <p className="text-slate-500 text-[11px] font-mono truncate">{user.email}</p>
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#002B55] text-white">
                            {user.role}
                          </span>
                          {user.usn && (
                            <span className="text-[11px] font-mono text-slate-700 font-semibold">
                              USN: {user.usn}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <Link
                          to="/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700 font-medium flex items-center gap-2 transition"
                        >
                          <Ticket className="w-4 h-4 text-[#D9A521]" />
                          <span>My Passes & Records</span>
                        </Link>

                        {(user.role === 'admin' || user.role === 'organizer') && (
                          <Link
                            to="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700 font-medium flex items-center gap-2 transition"
                          >
                            <Shield className="w-4 h-4 text-blue-600" />
                            <span>Operations Desk</span>
                          </Link>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            logout();
                            setUserDropdownOpen(false);
                            navigate('/login');
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 text-rose-600 font-medium flex items-center gap-2 transition"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:text-[#002B55] hover:bg-slate-100 transition"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-lg bg-[#002B55] hover:bg-[#001B36] text-white text-xs font-semibold transition shadow-xs"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Actions: Notifications & Menu */}
            <div className="flex items-center gap-1.5 lg:hidden">
              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setUnreadNotifications(0);
                }}
                className="min-w-[40px] min-h-[40px] p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 relative active:scale-95 transition"
                aria-label="Campus announcements"
              >
                <Bell className="w-4 h-4 text-slate-700" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#D9A521] rounded-full ring-2 ring-white" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="min-w-[40px] min-h-[40px] flex items-center justify-center p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 active:scale-95 transition"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </nav>

        {/* University announcements ticker - desktop only */}
        <div className="hidden md:flex bg-[#F8FAFC] border-t border-b border-[#E5E7EB] px-3 sm:px-4 py-2 overflow-hidden items-center text-xs group" title="Live University Notices">
          <div className="flex items-center gap-1.5 shrink-0 bg-[#002B55] text-[#D9A521] px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase mr-2.5 sm:mr-3">
            <span>CAMPUS NOTICE</span>
          </div>

          <p className="text-slate-700 text-xs font-medium truncate sm:whitespace-normal">
            Registrations are open for university technical symposia, national hackathons, and varsity championships.
          </p>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E5E7EB] bg-white/95 backdrop-blur-xl p-4 space-y-2 text-sm font-medium max-h-[calc(100dvh-5rem)] overflow-y-auto overscroll-contain shadow-2xl apple-modal-spring">
            <Link
              to="/events"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 rounded-xl text-slate-800 hover:bg-slate-100 font-semibold apple-press"
            >
              Campus Events
            </Link>

            {/* Mobile Categories Accordion */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block px-1">
                Browse Categories
              </span>
              <div className="grid grid-cols-2 gap-1.5 pt-1 text-xs">
                {EVENT_CATEGORIES.map((cat) => (
                  <Link
                    key={cat}
                    to={`/events?category=${encodeURIComponent(cat)}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-2.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-[#002B55] hover:text-white transition font-medium text-center apple-press"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setMapModalOpen(true);
              }}
              className="w-full text-left p-2.5 rounded-xl text-slate-800 hover:bg-slate-100 flex items-center justify-between font-semibold apple-press"
            >
              <span>DSU Campus Map & Venues</span>
              <MapPin className="w-4 h-4 text-[#D9A521]" />
            </button>
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 rounded-xl text-slate-800 hover:bg-slate-100 font-semibold flex items-center justify-between apple-press"
            >
              <span>My Passes</span>
              {activePassCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#D9A521] text-[#001B36] text-[11px] font-extrabold animate-pulse">
                  {activePassCount} Active
                </span>
              )}
            </Link>
            {user && (user.role === 'admin' || user.role === 'organizer') && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block p-2.5 rounded-xl text-[#002B55] bg-blue-50/50 hover:bg-blue-50 font-bold apple-press"
              >
                Operations Console
              </Link>
            )}

            <div className="pt-3 border-t border-slate-100">
              {user ? (
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    navigate('/login');
                  }}
                  className="w-full text-left p-2.5 rounded-xl text-rose-600 hover:bg-rose-50 font-semibold flex items-center gap-2 apple-press"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out ({user.name})</span>
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-slate-100 text-slate-800 text-center font-bold apple-press"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-[#002B55] text-white text-center font-bold apple-press"
                  >
                    Join Portal
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Campus Map Modal */}
      <CampusMapModal
        isOpen={mapModalOpen}
        onClose={() => setMapModalOpen(false)}
        onSelectVenue={(venueName) => {
          navigate(`/events?venue=${encodeURIComponent(venueName)}`);
        }}
      />
    </>
  );
}
