import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { downloadIcsFile, getGoogleCalendarUrl } from '../utils/calendar';
import { DsuLogo } from '../components/DsuLogo';
import { TicketQrCode } from '../components/TicketQrCode';
import { ConfirmModal } from '../components/ConfirmModal';
import { Skeleton, EmptyState, ErrorState, Button } from '../components/ui';
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
  ShieldCheck,
  QrCode,
  CalendarPlus,
  WifiOff
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export function StudentDashboard() {
  const { user, refreshUser } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedPass, setSelectedPass] = useState(null);
  const [cancellingEventId, setCancellingEventId] = useState(null);
  const [cancelTargetEventId, setCancelTargetEventId] = useState(null);
  const [liveSec, setLiveSec] = useState(new Date());

  // Resubmission modal state
  const [resubmitModalOpen, setResubmitModalOpen] = useState(false);
  const [resubmitUsn, setResubmitUsn] = useState('');
  const [resubmitDept, setResubmitDept] = useState('');
  const [resubmitLoading, setResubmitLoading] = useState(false);

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

  const handleCancel = (eventId) => {
    setCancelTargetEventId(eventId);
  };

  const handleConfirmCancel = async () => {
    if (!cancelTargetEventId) return;
    setCancellingEventId(cancelTargetEventId);
    try {
      await apiClient.delete(`/events/${cancelTargetEventId}/register`);
      toast.success('Registration cancelled successfully');
      setCancelTargetEventId(null);
      fetchRegistrations();
      window.dispatchEvent(new Event('dsu-registrations-updated'));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel registration');
    } finally {
      setCancellingEventId(null);
    }
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
              <strong>Showing cached demo data:</strong> These saved records may be stale. Changes require a server connection, and demo QR codes are not valid for real-world entry.
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

      {/* Verification Rejection Alert Banner */}
      {user?.verificationStatus === 'rejected' && (
        <div className="mb-6 p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-rose-950">Verification Review Rejected</p>
              <p className="text-rose-800 mt-1 leading-relaxed">
                <strong>Feedback from Desk:</strong> {user?.rejectionReason || 'Institutional USN or identity records could not be verified by registrar desk.'}
              </p>
              <p className="text-slate-500 text-[11px] mt-1">
                Please update your Dayananda Sagar University Serial Number (USN) to match registrar records (e.g. 1DS23CS045).
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setResubmitUsn(user?.usn || user?.rollNumber || '');
              setResubmitDept(user?.department || '');
              setResubmitModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shrink-0 transition shadow-xs"
          >
            Update & Resubmit
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
                {user?.isVerified || user?.verificationStatus === 'verified' ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified DSU Student
                  </span>
                ) : user?.verificationStatus === 'rejected' ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                    <XCircle className="w-3.5 h-3.5 text-rose-600" /> Verification Rejected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                    <Clock className="w-3.5 h-3.5 text-amber-600" /> Verification Pending
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-mono mt-1">
                University USN: <span className="text-slate-900 font-bold">{user?.usn || user?.rollNumber || '1DS23CS045'}</span> • {user?.email}
              </p>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">
                {user?.department || 'School of Computer Science & Engineering'} • Official Student Account
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-6 border-t border-slate-100">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 flex sm:flex-col items-center sm:items-start justify-between sm:justify-start">
            <span className="text-[11px] sm:text-xs font-semibold uppercase text-slate-500 tracking-wider block">
              Active Passes
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#002B55] sm:mt-1">{upcoming.length}</p>
          </div>
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 flex sm:flex-col items-center sm:items-start justify-between sm:justify-start">
            <span className="text-[11px] sm:text-xs font-semibold uppercase text-slate-500 tracking-wider block">
              Attended
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 sm:mt-1">
              {registrations.filter((r) => r.attended).length}
            </p>
          </div>
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 flex sm:flex-col items-center sm:items-start justify-between sm:justify-start">
            <span className="text-[11px] sm:text-xs font-semibold uppercase text-slate-500 tracking-wider block">
              Cancelled
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-400 sm:mt-1">{cancelled.length}</p>
          </div>
        </div>
      </section>

      {/* Segmented Control Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-3 overflow-x-auto scrollbar-none flex-nowrap overscroll-x-contain">
        {[
          { key: 'upcoming', label: `Active Passes (${upcoming.length})` },
          { key: 'past', label: `Past Activities (${past.length})` },
          { key: 'cancelled', label: `Cancelled (${cancelled.length})` }
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all duration-150 ${
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
        <div className="space-y-4 py-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-24 rounded-md" />
              </div>
              <Skeleton className="h-6 w-1/2 rounded-lg" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          ))}
        </div>
      ) : loadError ? (
        <div className="py-6">
          <ErrorState
            title="Passbook Unavailable"
            message={loadError}
            onRetry={fetchRegistrations}
            retryLabel="Reload Passes"
          />
        </div>
      ) : displayedList.length === 0 ? (
        <div className="py-6">
          <EmptyState
            icon={Ticket}
            title="No Passes in this Section"
            description="You have no registered events or passes under this tab. Browse upcoming university symposiums and workshops to book your seat."
            action={
              <Link to="/events">
                <Button variant="primary">Browse Campus Events</Button>
              </Link>
            }
          />
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

      {/* Authentic Institutional E-Pass Voucher Modal */}
      {selectedPass && (
        <div className="fixed inset-0 z-50 dsu-overlay flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="dsu-pass-voucher max-w-lg w-full overflow-hidden shadow-2xl flex flex-col bg-white rounded-3xl border border-slate-300 ticket-stub">
            {/* Pass Header Banner */}
            <div className="bg-[#001B36] text-white p-6 relative border-b-2 border-[#D9A521]">
              <button
                type="button"
                onClick={() => setSelectedPass(null)}
                className="absolute top-4 right-4 text-white/70 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition"
                aria-label="Close pass"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <DsuLogo variant="white" size="sm" />
              </div>

              <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#F5C84C] block font-bold font-mono">
                    Dayananda Sagar University Official E-Pass
                  </span>
                  <h2 className="text-lg font-extrabold tracking-tight text-white mt-0.5">
                    {selectedPass.attended ? 'Verified Attendance Record' : 'Official Admission Ticket'}
                  </h2>
                </div>
                <span className="text-[11px] bg-[#00142A] border border-[#D9A521]/60 text-[#F5C84C] px-3 py-1 rounded-full font-bold uppercase tracking-wider shadow-xs">
                  DSU Turnstile
                </span>
              </div>
            </div>

            {/* Live Security Anti-Screenshot Bar */}
            <div className="bg-slate-900 text-white px-6 py-2.5 flex items-center justify-between text-[11px] font-mono border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-emerald-400 font-bold tracking-wider uppercase">Live Turnstile Validated</span>
              </div>
              <span className="text-slate-400 font-medium">
                {liveSec.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })},{' '}
                {liveSec.toLocaleTimeString('en-IN')} IST
              </span>
            </div>

            {/* Pass Details Shelf */}
            <div className="p-6 space-y-4 text-slate-800 bg-white">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                  Event Title
                </span>
                <h3 className="font-extrabold text-[#002B55] text-lg leading-snug mt-0.5">
                  {selectedPass.event?.title.replace(/^DEMO:\s*/, '')}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Organized by{' '}
                  <strong className="font-bold text-slate-800">
                    {selectedPass.event?.organizerClub || 'DSU Student Affairs'}
                  </strong>
                </p>
              </div>

              {/* Student Credential Grid */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-bold font-mono">Student Name</span>
                  <span className="font-bold text-[#002B55] text-xs">{user?.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-bold font-mono">University USN</span>
                  <span className="font-mono font-bold text-[#002B55] text-xs">
                    {user?.usn || user?.rollNumber || '1DS23CS045'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-bold font-mono">Schedule (IST)</span>
                  <span className="font-bold text-slate-800 text-xs">
                    {new Date(selectedPass.event?.startsAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-bold font-mono">Campus Venue</span>
                  <span className="font-bold text-slate-800 truncate block text-xs">
                    {selectedPass.event?.venue}
                  </span>
                </div>
              </div>

              {/* Boarding Pass Perforated Notch Divider */}
              <div className="ticket-notch-divider my-2" />

              {/* 2D Scannable QR Code Block */}
              <div className="border border-slate-200 bg-slate-50/60 rounded-2xl p-5 text-center relative group">
                <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block mb-3 font-mono">
                  Official Admission Passcode: {selectedPass.ticketCode}
                </span>

                <TicketQrCode
                  ticketCode={selectedPass.ticketCode}
                  eventTitle={selectedPass.event?.title}
                  studentUsn={user?.usn}
                  size={170}
                />

                <p className="text-[11px] text-slate-500 font-medium mt-3">
                  Present this QR pass on your mobile device or printed copy at the entrance turnstile.
                </p>
              </div>

              {selectedPass.attended && (
                <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold">
                  <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Official Attendance Confirmed • Credited to DSU Student Activity Portfolio.</span>
                </div>
              )}
            </div>

            {/* Pass Actions */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 rounded-b-3xl">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#002B55] hover:underline"
                >
                  <Printer className="w-3.5 h-3.5" /> Print / Save PDF
                </button>

                <a
                  href={getGoogleCalendarUrl(selectedPass.event)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  <CalendarPlus className="w-3.5 h-3.5" /> Google Cal
                </a>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPass(null)}
                className="px-6 py-2.5 rounded-xl bg-[#002B55] text-white text-xs font-bold hover:bg-[#001B36] transition shadow-xs active:scale-[0.98]"
              >
                Close Pass
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resubmit Verification Modal */}
      {resubmitModalOpen && (
        <div className="fixed inset-0 z-50 dsu-overlay flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in duration-200">
            <button
              type="button"
              onClick={() => setResubmitModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#002B55] flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#002B55]">Update Verification Details</h3>
              <p className="text-xs text-slate-500 mt-1.5">
                Resubmit your Dayananda Sagar University enrollment credentials for registrar desk review.
              </p>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!resubmitUsn.trim()) return;
                setResubmitLoading(true);
                try {
                  await apiClient.patch('/users/resubmit/me', {
                    usn: resubmitUsn.trim().toUpperCase(),
                    department: resubmitDept.trim()
                  });
                  toast.success('Verification details resubmitted for admin review!');
                  setResubmitModalOpen(false);
                  if (refreshUser) await refreshUser();
                } catch (err) {
                  toast.error(err.response?.data?.message || 'Failed to resubmit details');
                } finally {
                  setResubmitLoading(false);
                }
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label htmlFor="resubmit-usn" className="block font-semibold text-slate-700 mb-1.5">
                  DSU Serial Number (USN) *
                </label>
                <input
                  type="text"
                  id="resubmit-usn"
                  required
                  placeholder="e.g. 1DS23CS045"
                  value={resubmitUsn}
                  onChange={(e) => setResubmitUsn(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] focus:border-[#002B55] rounded-xl text-sm font-mono text-[#172033] placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#002B55]"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Format: 1DS + 2-digit year + 2-3 char department + 3-digit roll (e.g. 1DS23CS045)
                </span>
              </div>

              <div>
                <label htmlFor="resubmit-dept" className="block font-semibold text-slate-700 mb-1.5">
                  School / Department
                </label>
                <input
                  type="text"
                  id="resubmit-dept"
                  placeholder="e.g. School of Computer Science & Engineering"
                  value={resubmitDept}
                  onChange={(e) => setResubmitDept(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] focus:border-[#002B55] rounded-xl text-sm text-[#172033] placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#002B55]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setResubmitModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resubmitLoading}
                  className="px-5 py-2.5 rounded-xl bg-[#002B55] hover:bg-[#001B36] text-white text-xs font-semibold transition shadow-xs disabled:opacity-50"
                >
                  {resubmitLoading ? 'Submitting...' : 'Submit to Review Queue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Cancellation Confirmation Dialog */}
      <ConfirmModal
        isOpen={Boolean(cancelTargetEventId)}
        title="Surrender Event Seat"
        message="Are you sure you want to cancel your seat for this event? Your digital admission pass will be revoked and your quota will be released back to the university."
        confirmText="Surrender Seat"
        cancelText="Keep My Seat"
        variant="danger"
        isLoading={Boolean(cancellingEventId)}
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelTargetEventId(null)}
      />
    </div>
  );
}
