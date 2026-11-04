import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Calendar,
  Ticket,
  Shield,
  Search,
  ChevronDown,
  LogOut,
  Menu,
  X,
  MapPin,
  ExternalLink,
  Phone,
  GraduationCap,
  Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { DsuLogo } from './DsuLogo';
import { CampusMapModal } from './CampusMapModal';

const DSU_SCHOOLS = [
  { id: 'soe', name: 'School of Engineering (SOE)', fests: 'Hack Forge / Invento' },
  { id: 'soca', name: 'School of Computer Applications (SOCA)', fests: 'ByteCraft Code Jam' },
  { id: 'scms', name: 'School of Commerce & Management (SCMS)', fests: 'Feiern Conclave' },
  { id: 'soadh', name: 'School of Arts, Design & Humanities (SOADH)', fests: 'Transmedia Showcase' },
  { id: 'sbas', name: 'School of Basic & Applied Sciences (SBAS)', fests: 'Science Colloquium' },
  { id: 'sol', name: 'School of Law (SOL)', fests: 'National Moot Court' },
  { id: 'cdsimer', name: 'Dr. CDSIMER (Medical & Health Sciences)', fests: 'Health Innovation Summit' }
];

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [schoolsDropdownOpen, setSchoolsDropdownOpen] = useState(false);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const dropdownRef = useRef(null);
  const schoolsRef = useRef(null);
  const notifRef = useRef(null);

  const [activePassCount, setActivePassCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(2);

  const campusNotifications = [
    {
      id: 1,
      title: 'Invento 2026 Keynote Registrations Live',
      desc: 'Sir M. Visvesvaraya Auditorium bookings open for school tech symposium.',
      time: '10m ago'
    },
    {
      id: 2,
      title: 'Harohalli Central Turf Scheduling',
      desc: 'Inter-department sports rounds updated on campus calendar.',
      time: '1h ago'
    },
    {
      id: 3,
      title: 'DSU Digital Pass Gate Verifications Active',
      desc: 'Organizers can now scan student QR passes with high-speed camera verification.',
      time: '3h ago'
    }
  ];

  const fetchActivePassCount = async () => {
    if (!user) {
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
      <header className="sticky top-0 z-40 bg-white border-b border-[#E5E7EB] shadow-xs">
        {/* Level 1: Slim Top Institutional Strip */}
        <div className="bg-[#001B36] text-slate-200 px-4 py-1.5 text-xs">
          <div className="max-w-[1280px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">Dayananda Sagar University</span>
              <span className="text-slate-500 hidden sm:inline">•</span>
              <span className="text-slate-300 hidden sm:inline">Harohalli Main Campus, Bengaluru</span>
            </div>

            <div className="flex items-center gap-4 text-slate-300">
              <span className="hidden md:inline">Admissions Helpline: 080 46461800</span>
              <span className="text-slate-600 hidden md:inline">|</span>
              <a
                href="https://www.dsu.edu.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition flex items-center gap-1 font-medium"
              >
                <span>dsu.edu.in</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>
        </div>

        {/* Level 2: Primary University Navigation */}
        <nav className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 py-2">
            {/* Authentic DSU Logo */}
            <Link
              to="/events"
              className="flex items-center group focus:outline-none"
              aria-label="Dayananda Sagar University Campus Events Home"
            >
              <DsuLogo variant="with-tag" size="lg" />
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-1.5 text-sm font-medium text-slate-700">
              <Link
                to="/events"
                className={`px-3.5 py-2 rounded-lg transition-colors duration-150 ${
                  isActive('/events')
                    ? 'bg-[#002B55] text-white font-semibold shadow-xs'
                    : 'hover:bg-slate-100 hover:text-[#002B55]'
                }`}
              >
                Campus Events
              </Link>

              {/* Schools Dropdown */}
              <div className="relative" ref={schoolsRef}>
                <button
                  type="button"
                  onClick={() => setSchoolsDropdownOpen(!schoolsDropdownOpen)}
                  className={`px-3.5 py-2 rounded-lg transition-colors duration-150 flex items-center gap-1.5 ${
                    schoolsDropdownOpen
                      ? 'bg-slate-100 text-[#002B55]'
                      : 'hover:bg-slate-100 hover:text-[#002B55]'
                  }`}
                >
                  <span>Schools & Fests</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {schoolsDropdownOpen && (
                  <div className="absolute left-0 top-full mt-2 w-84 rounded-xl bg-white border border-[#E5E7EB] shadow-xl p-2 text-xs z-50 animate-in fade-in duration-150">
                    <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Academic Schools & Fests
                    </div>
                    <div className="space-y-0.5 py-1">
                      {DSU_SCHOOLS.map((school) => (
                        <Link
                          key={school.id}
                          to={`/events?school=${encodeURIComponent(school.name)}`}
                          onClick={() => setSchoolsDropdownOpen(false)}
                          className="w-full text-left p-2.5 rounded-lg hover:bg-slate-50 transition block"
                        >
                          <p className="font-semibold text-slate-900 text-xs">{school.name}</p>
                          <p className="text-[11px] text-[#002B55] font-medium mt-0.5">{school.fests}</p>
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
                className="px-3.5 py-2 rounded-lg hover:bg-slate-100 hover:text-[#002B55] transition-colors duration-150 flex items-center gap-1.5"
              >
                <MapPin className="w-4 h-4 text-[#D9A521]" />
                <span>Harohalli Map</span>
              </button>

              {/* My Passes Link */}
              <Link
                to="/dashboard"
                className={`px-3.5 py-2 rounded-lg transition-colors duration-150 flex items-center gap-1.5 ${
                  isActive('/dashboard')
                    ? 'bg-[#002B55] text-white font-semibold shadow-xs'
                    : 'hover:bg-slate-100 hover:text-[#002B55]'
                }`}
              >
                <Ticket className="w-4 h-4" />
                <span>My Passes</span>
                {activePassCount > 0 && (
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-[#D9A521] text-[#001B36] text-[11px] font-bold">
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
              {/* Institutional Notifications Popover */}
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={() => {
                    setNotificationsOpen(!notificationsOpen);
                    setUnreadNotifications(0);
                  }}
                  className="relative p-2 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition bg-white text-slate-600 shadow-2xs"
                  aria-label="Campus announcements and alerts"
                  title="Campus announcements & updates"
                >
                  <Bell className="w-4 h-4 text-slate-600" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white" />
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl bg-white border border-[#E5E7EB] shadow-xl p-3 text-xs z-50 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                      <span className="font-bold text-[#002B55] text-xs uppercase tracking-wider">Campus Alerts</span>
                      <span className="text-[10px] text-slate-400 font-mono">Live DSU Feed</span>
                    </div>
                    <div className="space-y-2">
                      {campusNotifications.map((n) => (
                        <div
                          key={n.id}
                          className="p-2.5 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100"
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
                    className="flex items-center gap-2.5 p-1.5 pr-3.5 rounded-full border border-slate-200 hover:border-slate-300 transition bg-white shadow-2xs"
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
                    <div className="absolute right-0 top-full mt-2 w-64 rounded-xl bg-white border border-[#E5E7EB] shadow-xl p-2 text-xs z-50 animate-in fade-in duration-150">
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

            {/* Mobile Hamburger Button */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </nav>

        {/* Level 3: Slim Announcement Strip */}
        <div className="bg-[#F8FAFC] border-t border-b border-[#E5E7EB] px-4 py-2 overflow-hidden flex items-center text-xs group" title="Hover to pause announcement ticker">
          <div className="flex items-center gap-1.5 shrink-0 bg-[#002B55] text-[#D9A521] px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase mr-3">
            <span>CIRCULARS</span>
          </div>

          <div className="overflow-hidden relative w-full">
            <div className="animate-ticker group-hover:[animation-play-state:paused] text-slate-700 text-xs font-medium flex items-center gap-8">
              <span>
                <strong className="text-[#002B55]">Hack Forge 2026</strong>: Registration open for School of Engineering & Computer Applications.
              </span>
              <span className="text-slate-300">•</span>
              <span>
                <strong className="text-[#002B55]">Sir M. Visvesvaraya Auditorium</strong>: Semester events and keynote hall bookings live.
              </span>
              <span className="text-slate-300">•</span>
              <span>
                <strong className="text-[#002B55]">Sports Meet</strong>: Inter-department athletics round scheduled at Harohalli Central Turf.
              </span>
              <span className="text-slate-300">•</span>
              <span>
                <strong className="text-[#002B55]">Admissions 2026</strong>: DSAT Entrance & KCET (Code: E240) applications underway at dsu.edu.in.
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E5E7EB] bg-white p-4 space-y-2 text-sm font-medium">
            <Link
              to="/events"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2 rounded-lg text-slate-800 hover:bg-slate-100"
            >
              Campus Events
            </Link>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setMapModalOpen(true);
              }}
              className="w-full text-left p-2 rounded-lg text-slate-800 hover:bg-slate-100 flex items-center justify-between"
            >
              <span>Harohalli Campus Map</span>
              <MapPin className="w-4 h-4 text-[#D9A521]" />
            </button>
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2 rounded-lg text-slate-800 hover:bg-slate-100"
            >
              My Passes ({activePassCount})
            </Link>
            {user && (user.role === 'admin' || user.role === 'organizer') && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block p-2 rounded-lg text-[#002B55] hover:bg-slate-100"
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
                  className="w-full text-left p-2 rounded-lg text-rose-600 hover:bg-rose-50"
                >
                  Sign Out ({user.name})
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-lg text-center font-semibold text-slate-700 bg-slate-100"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-lg text-center font-semibold text-white bg-[#002B55]"
                  >
                    Register
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
