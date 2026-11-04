import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { downloadIcsFile, getGoogleCalendarUrl } from '../utils/calendar';
import { DsuLogo } from '../components/DsuLogo';
import { TicketQrCode } from '../components/TicketQrCode';
import {
  Calendar,
  MapPin,
  CheckCircle2,
  Clock,
  XCircle,
  Ticket,
  Printer,
  X,
  Award,
  ArrowRight,
  ShieldCheck,
  QrCode,
  CalendarPlus,
  Copy,
  ExternalLink,
  Sparkles,
  ChevronRight,
  GraduationCap,
  Building,
  UserCheck,
  WifiOff,
  Radio
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export function StudentDashboard() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedPass, setSelectedPass] = useState(null);
  const [cancellingEventId, setCancellingEventId] = useState(null);
  const [liveSec, setLiveSec] = useState(new Date());

  // Tick the security second clock for live voucher verification
  useEffect(() => {
    const timer = setInterval(() => setLiveSec(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchRegistrations = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await apiClient.get('/registrations/me');
      const items = res.data.data || [];
      setRegistrations(items);
      setIsOfflineMode(false);
      try {
        localStorage.setItem('dsu_cached_passes', JSON.stringify(items));
      } catch {}
      window.dispatchEvent(new Event('dsu-registrations-updated'));
    } catch (err) {
      // Offline fallback: check local cached passbook
      const cached = localStorage.getItem('dsu_cached_passes');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setRegistrations(parsed);
          setIsOfflineMode(true);
          toast('Loaded saved passes from offline storage', { icon: '📦' });
        } catch {
          setLoadError(err.response?.data?.message || 'Unable to load registrations. Please try again.');
        }
      } else {
        setLoadError(err.response?.data?.message || 'Unable to load registrations. Please try again.');
        toast.error('Failed to load your registrations');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleCancel = async (eventId) => {
    if (!window.confirm('Are you sure you want to cancel your seat for this event?')) return;
    setCancellingEventId(eventId);
    try {
      await apiClient.delete(`/events/${eventId}/register`);
      toast.success('Registration cancelled');
      fetchRegistrations();
      window.dispatchEvent(new Event('dsu-registrations-updated'));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel registration');
    } finally {
      setCancellingEventId(null);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Pass code copied to clipboard');
  };

  const upcoming = registrations.filter(
    (r) => r.status === 'registered' && (!r.event?.startsAt || new Date(r.event.startsAt) >= new Date())
  );
  const past = registrations.filter(
    (r) =>
      r.status === 'registered' &&
      r.event?.startsAt &&
      new Date(r.event.startsAt) < new Date()
  );
  const cancelled = registrations.filter((r) => r.status === 'cancelled');

  const displayedList =
    activeTab === 'upcoming' ? upcoming : activeTab === 'past' ? past : cancelled;

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Offline Alert Banner */}
      {isOfflineMode && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <WifiOff className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>Offline Mode Active:</strong> Displaying your previously synced passes from local storage. Your QR codes remain 100% scannable at campus gates.
            </span>
          </div>
          <button
            type="button"
            onClick={fetchRegistrations}
            className="font-semibold underline hover:text-amber-950 shrink-0"
          >
            Reconnect
          </button>
        </div>
      )}

      {/* Student Profile & Passbook Header */}
      <section className="dsu-card p-6 sm:p-8 mb-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#002B55] text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-sm">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'DS'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#002B55] tracking-tight">
                  {user?.name || 'DSU Student'}
                </h1>
                {user?.isVerified ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Student ID
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                    <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending Verification
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-mono mt-1">
                USN: <span className="text-slate-800 font-bold">{user?.usn || user?.rollNumber || '1DS22CS042'}</span> • {user?.email}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {user?.department || 'School of Computer Applications'} • Dayananda Sagar University
              </p>
            </div>
          </div>

          <Link
            to="/events"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#002B55] text-white text-xs font-semibold hover:bg-[#001B36] transition shadow-xs"
          >
            <Ticket className="w-4 h-4 text-[#D9A521]" />
            <span>Discover More Events</span>
          </Link>
        </div>

        {/* 3 Metric Shelves */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-6 border-t border-slate-100">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider block">
              Active Passes
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#002B55] mt-1">{upcoming.length}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider block">
              Attended
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">
              {registrations.filter((r) => r.attended).length}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider block">
              Cancelled
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-400 mt-1">{cancelled.length}</p>
          </div>
        </div>
      </section>

      {/* Segmented Control Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-3">
        {[
          { key: 'upcoming', label: `Active Passes (${upcoming.length})` },
          { key: 'past', label: `Past Activities (${past.length})` },
          { key: 'cancelled', label: `Cancelled (${cancelled.length})` }
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-150 ${
              activeTab === tab.key
                ? 'bg-[#002B55] text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Registrations List */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-2 border-[#002B55] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-mono">Loading university passbook records...</p>
        </div>
      ) : loadError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-xs text-rose-800">
          <p>{loadError}</p>
          <button type="button" onClick={fetchRegistrations} className="mt-3 font-semibold underline text-rose-900">
            Retry
          </button>
        </div>
      ) : displayedList.length === 0 ? (
        <div className="dsu-card p-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Ticket className="w-7 h-7 text-[#002B55]" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Passes in this Section</h3>
          <p className="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
            Reserve passes for upcoming campus symposiums, technical hackathons, guest keynotes, and varsity tournaments.
          </p>
          <Link
            to="/events"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#002B55] text-white text-xs font-semibold hover:bg-[#001B36] transition shadow-xs"
          >
            Browse Campus Events
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedList.map((reg) => {
            const ev = reg.event;
            if (!ev) return null;
            const starts = new Date(ev.startsAt);

            return (
              <div
                key={reg._id}
                className="dsu-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 group"
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#002B55] text-white">
                      {ev.category}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#002B55] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                      #{reg.ticketCode}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base sm:text-lg hover:text-[#002B55] transition truncate">
                    <Link to={`/events/${ev._id}`}>{ev.title.replace(/^DEMO:\s*/, '')}</Link>
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-0.5">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium text-slate-700">
                        {starts.toLocaleDateString('en-IN', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#002B55]" />
                      <span className="truncate text-slate-700">{ev.venue}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
                  {reg.status === 'registered' && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          downloadIcsFile(ev);
                          toast.success('Apple / Outlook .ics downloaded');
                        }}
                        aria-label="Add to Calendar (.ics)"
                        className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition shadow-xs"
                        title="Download Apple / Outlook .ics calendar file"
                      >
                        <CalendarPlus className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedPass(reg)}
                        className="inline-flex items-center gap-2 text-xs font-bold text-white bg-[#002B55] hover:bg-[#001B36] px-4 py-2.5 rounded-xl transition shadow-xs active:scale-[0.98]"
                      >
                        <QrCode className="w-3.5 h-3.5 text-[#D9A521]" />
                        {reg.attended ? 'Attendance Record' : 'View Digital Pass'}
                      </button>
                    </>
                  )}

                  {reg.attended ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Attended
                    </span>
                  ) : reg.status === 'cancelled' ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">
                      <XCircle className="w-3.5 h-3.5" /> Cancelled
                    </span>
                  ) : new Date() >= starts ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-800 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
                      <Clock className="w-3.5 h-3.5" /> Concluded
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleCancel(ev._id)}
                      disabled={cancellingEventId === ev._id}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-700 border border-rose-200 hover:bg-rose-50 px-3.5 py-1.5 rounded-full transition"
                    >
                      {cancellingEventId === ev._id ? 'Cancelling...' : 'Cancel'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Authentic DSU Digital Hall Ticket / Event Pass Modal */}
      {selectedPass && (
        <div className="fixed inset-0 z-50 dsu-overlay flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="dsu-pass-voucher max-w-lg w-full overflow-hidden shadow-2xl flex flex-col bg-white rounded-2xl border border-slate-300">
            {/* Pass Header Banner */}
            <div className="bg-[#002B55] text-white p-6 relative border-b-2 border-[#D9A521]">
              <button
                type="button"
                onClick={() => setSelectedPass(null)}
                className="absolute top-4 right-4 text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
                aria-label="Close pass"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <DsuLogo variant="white" size="sm" />
              </div>

              <div className="mt-4 pt-3 border-t border-blue-900/60 flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider text-[#D9A521] block font-semibold">
                    Official Student Entry Voucher
                  </span>
                  <h2 className="text-lg font-bold tracking-tight text-white">
                    {selectedPass.attended ? 'Attendance Verification Certificate' : 'Event Entry Pass'}
                  </h2>
                </div>
                <span className="text-xs bg-[#001B36] border border-[#D9A521]/40 text-[#D9A521] px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                  Verified DSU ID
                </span>
              </div>
            </div>

            {/* Live Security Anti-Screenshot Bar */}
            <div className="bg-slate-900 text-white px-6 py-2 flex items-center justify-between text-[11px] font-mono">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-emerald-400 font-semibold tracking-wider uppercase">Live Gate Pass</span>
              </div>
              <span className="text-slate-400">
                {liveSec.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })},{' '}
                {liveSec.toLocaleTimeString('en-IN')} IST
              </span>
            </div>

            {/* Pass Details Shelf */}
            <div className="p-6 space-y-4 text-slate-800">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                  Event Title
                </span>
                <h3 className="font-extrabold text-[#002B55] text-lg leading-snug mt-0.5">
                  {selectedPass.event?.title.replace(/^DEMO:\s*/, '')}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Organized by{' '}
                  <strong className="font-semibold text-slate-700">
                    {selectedPass.event?.organizerClub || 'Dayananda Sagar University'}
                  </strong>
                </p>
              </div>

              {/* Student Credential Grid */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block text-xs uppercase tracking-wider font-medium">Student Name</span>
                  <span className="font-bold text-[#002B55] text-xs">{user?.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs uppercase tracking-wider font-medium">University USN</span>
                  <span className="font-mono font-bold text-[#002B55] text-xs">
                    {user?.usn || user?.rollNumber || '1DS22CS042'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs uppercase tracking-wider font-medium">Schedule (IST)</span>
                  <span className="font-medium text-slate-800 text-xs">
                    {new Date(selectedPass.event?.startsAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs uppercase tracking-wider font-medium">Allocated Hall</span>
                  <span className="font-medium text-slate-800 truncate block text-xs">
                    {selectedPass.event?.venue}
                  </span>
                </div>
              </div>

              {/* 2D Scannable QR Code Block */}
              <div className="border-2 border-dashed border-[#002B55]/30 bg-blue-50/40 rounded-2xl p-5 text-center relative group">
                <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider block mb-3">
                  Gate Laser Verification Code
                </span>

                <TicketQrCode
                  ticketCode={selectedPass.ticketCode}
                  eventTitle={selectedPass.event?.title}
                  studentUsn={user?.usn}
                  size={170}
                />

                {/* Perforated Divider */}
                <div className="my-3 border-t border-dashed border-slate-300 relative">
                  <div className="absolute -left-7 -top-2 w-4 h-4 rounded-full bg-white border border-slate-200"></div>
                  <div className="absolute -right-7 -top-2 w-4 h-4 rounded-full bg-white border border-slate-200"></div>
                </div>

                <p className="text-[11px] text-slate-600 font-medium">
                  Scan this live pass at the gate or present your University USN card
                </p>
              </div>

              {selectedPass.attended && (
                <div className="flex items-center gap-2.5 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold">
                  <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Verified attendance record on file for university academic credits.</span>
                </div>
              )}
            </div>

            {/* Pass Actions */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#002B55] hover:underline"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Pass
                </button>

                <a
                  href={getGoogleCalendarUrl(selectedPass.event)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  <CalendarPlus className="w-3.5 h-3.5" /> Google Cal
                </a>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPass(null)}
                className="px-5 py-2 rounded-xl bg-[#002B55] text-white text-xs font-bold hover:bg-[#001B36] transition shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
