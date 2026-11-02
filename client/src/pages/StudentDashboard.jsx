import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { downloadIcsFile } from '../utils/calendar';
import { DsuLogo } from '../components/DsuLogo';
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
  UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export function StudentDashboard() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedPass, setSelectedPass] = useState(null);
  const [cancellingEventId, setCancellingEventId] = useState(null);

  const fetchRegistrations = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await apiClient.get('/registrations/me');
      setRegistrations(res.data.data || []);
    } catch (err) {
      setLoadError(err.response?.data?.message || 'Unable to load registrations. Please try again.');
      toast.error('Failed to load your registrations');
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
      await fetchRegistrations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed');
    } finally {
      setCancellingEventId(null);
    }
  };

  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    toast.success('Pass code copied to clipboard!', { icon: '📋' });
  };

  const now = new Date();
  const upcoming = registrations.filter((r) => r.status === 'registered' && new Date(r.event?.startsAt) > now);
  const attended = registrations.filter((r) => r.status === 'registered' && r.attended);
  const past = registrations.filter((r) => r.status === 'registered' && new Date(r.event?.startsAt) <= now);
  const cancelled = registrations.filter((r) => r.status === 'cancelled');

  const displayedList =
    activeTab === 'upcoming'
      ? upcoming
      : activeTab === 'past'
      ? past
      : cancelled;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 min-h-screen">
      {/* Student Profile & Pass Hub Header */}
      <section className="dsu-card p-6 sm:p-10 mb-8 border-t-4 border-t-[#002B55]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#002B55]/5 border border-[#002B55]/15 text-xs font-semibold text-[#002B55]">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Official DSU Student Passbook</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#002B55] tracking-tight">
              {user?.name}
            </h1>

            <div className="text-xs sm:text-sm text-slate-500 flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-700">Dayananda Sagar University</span>
              <span className="text-slate-300">·</span>
              <span className="font-mono text-[#002B55] font-bold">
                USN: {user?.usn || user?.rollNumber || '1DS22CS042'}
              </span>
              {user?.department && (
                <>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-600">{user.department}</span>
                </>
              )}
            </div>
          </div>

          <Link
            to="/events"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#002B55] hover:bg-[#001B36] text-white text-xs font-semibold shadow-xs transition active:scale-[0.98]"
          >
            <span>Explore Events</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 4 Stat Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100">
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
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">{attended.length}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider block">
              Total Bookings
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-blue-600 mt-1">
              {registrations.filter((r) => r.status === 'registered').length}
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
                        {starts.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
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
                        {reg.attended ? 'Attendance Record' : 'View Hall Ticket'}
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
          <div className="dsu-pass-voucher max-w-lg w-full overflow-hidden shadow-2xl flex flex-col bg-white">
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
                  Organized by <strong className="font-semibold text-slate-700">{selectedPass.event?.organizerClub || 'Dayananda Sagar University'}</strong>
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

              {/* Monospace Barcode & Ticket Code Block */}
              <div className="border-2 border-dashed border-[#002B55]/30 bg-blue-50/40 rounded-2xl p-4 text-center relative group">
                <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider block">
                  Gate Verification Code
                </span>
                <div className="flex items-center justify-center gap-2 my-1.5">
                  <div className="text-2xl sm:text-3xl font-black font-mono tracking-widest text-[#002B55] select-all">
                    {selectedPass.ticketCode}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(selectedPass.ticketCode)}
                    className="p-1.5 rounded-lg border border-slate-300 hover:bg-white text-slate-600 transition shadow-xs"
                    title="Copy verification code"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                {/* Perforated Divider */}
                <div className="my-2.5 border-t border-dashed border-slate-300 relative">
                  <div className="absolute -left-6 -top-2 w-4 h-4 rounded-full bg-white border border-slate-200"></div>
                  <div className="absolute -right-6 -top-2 w-4 h-4 rounded-full bg-white border border-slate-200"></div>
                </div>

                <p className="text-xs text-slate-600 font-medium">
                  Present this voucher or University USN at the event check-in desk
                </p>
              </div>

              {selectedPass.attended && (
                <div className="flex items-center gap-2.5 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold">
                  <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Verified attendance record on file for university credits.</span>
                </div>
              )}
            </div>

            {/* Pass Actions */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#002B55] hover:underline"
              >
                <Printer className="w-4 h-4" /> Print Pass Voucher
              </button>

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
