import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { playSuccessChime, playErrorBuzzer } from '../utils/audio';
import { QrCameraScannerModal } from '../components/QrCameraScannerModal';
import {
  ArrowLeft,
  Check,
  Download,
  Users,
  CheckCircle2,
  Search,
  QrCode,
  Ticket,
  Volume2,
  GraduationCap,
  Building,
  Camera,
  ShieldCheck,
  Clock,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AttendancePage = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [checkingIn, setCheckingIn] = useState(false);
  const [updatingRegistration, setUpdatingRegistration] = useState(null);
  const [ticketInput, setTicketInput] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [tabFilter, setTabFilter] = useState('all'); // 'all' | 'attended' | 'pending'
  const [scannerOpen, setScannerOpen] = useState(false);
  const [lastVerifiedStudent, setLastVerifiedStudent] = useState(null);

  const fetchRegistrations = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [evRes, regRes] = await Promise.all([
        apiClient.get(`/events/${id}`),
        apiClient.get(`/events/${id}/registrations`)
      ]);
      setEvent(evRes.data.data);
      setRegistrations(regRes.data.data);
    } catch (err) {
      setLoadError(err.response?.data?.message || 'Failed to load attendees. Please try again.');
      toast.error('Failed to load attendees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [id]);

  const toggleAttendance = async (regId, currentVal) => {
    if (currentVal || updatingRegistration) return;
    setUpdatingRegistration(regId);
    try {
      await apiClient.patch(`/events/${id}/registrations/${regId}/attendance`, {
        attended: true
      });
      playSuccessChime();
      toast.success('Attendance verified');
      fetchRegistrations();
    } catch (err) {
      playErrorBuzzer();
      toast.error(err.response?.data?.message || 'Failed to update attendance');
    } finally {
      setUpdatingRegistration(null);
    }
  };

  const exportCSV = () => {
    if (registrations.length === 0) return toast.error('No attendees to export');
    const csvCell = (value) => {
      const text = String(value ?? '');
      const safeText = /^[\s]*[=+\-@]/.test(text) ? `'${text}` : text;
      return `"${safeText.replace(/"/g, '""')}"`;
    };
    const headers = ['Student Name', 'University USN', 'Student Email', 'Department / School', 'Pass Code', 'Attendance Verified', 'Verified At']
      .map(csvCell)
      .join(',');
    const rows = registrations
      .map((registration) =>
        [
          registration.student?.name,
          registration.student?.usn || registration.student?.rollNumber,
          registration.student?.email,
          registration.student?.department,
          registration.ticketCode,
          registration.attended ? 'Yes' : 'No',
          registration.attendedAt ? new Date(registration.attendedAt).toLocaleString('en-IN') : 'N/A'
        ]
          .map(csvCell)
          .join(',')
      )
      .join('\r\n');
    const blob = new Blob([`${headers}\r\n${rows}`], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DSU_Attendance_${event?.title?.replace(/[^a-z0-9_-]+/gi, '_').slice(0, 40) || 'Event'}.csv`;
    a.click();
    window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    toast.success('Official attendee CSV roster downloaded');
  };

  const verifyTicket = async (rawCode) => {
    const code = rawCode.trim().toUpperCase();
    if (!code) return;

    setCheckingIn(true);
    try {
      const res = await apiClient.post(`/events/${id}/verify-pass`, {
        ticketCode: code
      });
      playSuccessChime();
      const verified = res.data?.data;
      setLastVerifiedStudent(verified);
      toast.success(`Check-in verified: ${verified.student?.name || 'Student'} (${verified.student?.usn || code})`, {
        icon: '✅',
        duration: 4000
      });
      setTicketInput('');
      fetchRegistrations();
    } catch (err) {
      playErrorBuzzer();
      const msg = err.response?.data?.message || 'Verification failed';
      toast.error(msg, { icon: '⚠️', duration: 4500 });
    } finally {
      setCheckingIn(false);
    }
  };

  const handleTicketCheckIn = async (e) => {
    e.preventDefault();
    if (!ticketInput.trim()) return;
    await verifyTicket(ticketInput);
  };

  const attendedCount = registrations.filter((r) => r.attended).length;
  const pendingCount = Math.max(0, registrations.length - attendedCount);
  const turnoutRate = registrations.length > 0 ? Math.round((attendedCount / registrations.length) * 100) : 0;

  const filteredRegistrations = registrations.filter((r) => {
    if (tabFilter === 'attended' && !r.attended) return false;
    if (tabFilter === 'pending' && r.attended) return false;

    if (!searchFilter) return true;
    const term = searchFilter.toLowerCase();
    return (
      r.student?.name?.toLowerCase().includes(term) ||
      r.student?.usn?.toLowerCase().includes(term) ||
      r.student?.email?.toLowerCase().includes(term) ||
      r.ticketCode?.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-28 text-center">
        <div className="w-10 h-10 border-2 border-[#002B55] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-slate-500 font-mono">Loading attendance verification roster...</p>
      </div>
    );
  }

  if (!event && loadError) {
    return (
      <div className="mx-auto max-w-xl px-4 py-28 text-center">
        <p className="text-xs text-rose-600">{loadError}</p>
        <button
          type="button"
          onClick={fetchRegistrations}
          className="mt-6 px-6 py-2.5 rounded-full bg-[#002B55] text-white text-xs font-semibold hover:bg-[#001B36] transition shadow-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Link
        to="/admin"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#002B55] mb-6 transition group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Operations Console</span>
      </Link>

      {/* Main Attendance Control Card */}
      <div className="dsu-card p-6 sm:p-8 mb-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#002B55] block mb-1">
              Dayananda Sagar University • Verification Desk
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#002B55]">
              {event?.title.replace(/^DEMO:\s*/, '')}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Venue: <span className="text-slate-800 font-semibold">{event?.venue}</span> · Starts:{' '}
              {new Date(event?.startsAt).toLocaleString('en-IN', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setScannerOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#002B55] hover:bg-[#001B36] text-white text-xs font-bold transition shadow-xs flex-1 sm:flex-initial"
            >
              <Camera className="w-4 h-4 text-[#D9A521]" /> Scan Pass QR
            </button>

            <button
              type="button"
              onClick={exportCSV}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 transition shadow-xs"
            >
              <Download className="w-4 h-4 text-slate-500" /> Export CSV Roster
            </button>
          </div>
        </div>

        {/* 4 Metric Shelves with Circular Turnout Progress */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-100">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-widest block">
              Registered
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#002B55] font-mono mt-1">{registrations.length}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-widest block">
              Checked In
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono mt-1">{attendedCount}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-widest block">
              Pending
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 font-mono mt-1">{pendingCount}</p>
          </div>

          {/* Circular Turnout Ring */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-widest block">
                Turnout
              </span>
              <p className="text-xs text-slate-500 mt-1 font-mono">Live Ratio</p>
            </div>
            <div className="relative w-12 h-12 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-200"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#002B55] transition-all duration-500 ease-out"
                  strokeDasharray={`${turnoutRate}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-extrabold font-mono text-[11px] text-[#002B55]">
                {turnoutRate}%
              </div>
            </div>
          </div>
        </div>

        {/* Rapid Code Check-In Input & Filter Bar */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <form onSubmit={handleTicketCheckIn} className="flex-1 flex gap-2.5">
            <div className="relative flex-1">
              <Ticket className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                aria-label="Ticket code check-in"
                placeholder="Scan QR or enter ticket code (e.g. TKT-2490-X)..."
                value={ticketInput}
                onChange={(e) => setTicketInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono uppercase font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#002B55] transition"
              />
            </div>
            <button
              type="submit"
              disabled={checkingIn || !ticketInput.trim()}
              className="px-5 py-2.5 rounded-xl bg-[#002B55] hover:bg-[#001B36] text-white text-xs font-bold transition active:scale-[0.98] disabled:opacity-50 whitespace-nowrap shadow-xs"
            >
              {checkingIn ? 'Verifying...' : 'Log Check-In'}
            </button>
          </form>

          <div className="w-full sm:w-64">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                aria-label="Filter attendee list"
                placeholder="Filter by name, USN, ticket..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#002B55] transition"
              />
            </div>
          </div>
        </div>

        {/* Live Verified Attendee Banner */}
        {lastVerifiedStudent && (
          <div className="p-4 bg-emerald-50/90 border border-emerald-200 rounded-2xl flex items-center justify-between gap-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-950 font-sans">
                    {lastVerifiedStudent.student?.name}
                  </span>
                  <span className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                    {lastVerifiedStudent.student?.usn || lastVerifiedStudent.ticketCode}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  {lastVerifiedStudent.student?.department || 'Dayananda Sagar University'} • Check-in recorded at{' '}
                  {new Date(lastVerifiedStudent.attendedAt || Date.now()).toLocaleTimeString('en-IN')}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setLastVerifiedStudent(null)}
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 underline px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Roster Segmented Tabs & Attendees Table */}
      <div className="dsu-card overflow-hidden">
        {/* Filter Tabs */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {[
              { id: 'all', label: `All Attendees (${registrations.length})` },
              { id: 'attended', label: `Checked In (${attendedCount})` },
              { id: 'pending', label: `Pending (${pendingCount})` }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTabFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                  tabFilter === tab.id
                    ? 'bg-[#002B55] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className="text-[11px] font-mono text-emerald-700 flex items-center gap-1.5 hidden sm:flex">
            <Volume2 className="w-3.5 h-3.5" /> Web Audio Chime Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200/80">
                <th className="py-3 px-6 font-mono font-semibold uppercase tracking-wider text-[10px]">Student Name</th>
                <th className="py-3 px-4 font-mono font-semibold uppercase tracking-wider text-[10px]">University USN</th>
                <th className="py-3 px-4 font-mono font-semibold uppercase tracking-wider text-[10px]">Department</th>
                <th className="py-3 px-4 font-mono font-semibold uppercase tracking-wider text-[10px]">Pass Code</th>
                <th className="py-3 px-6 font-mono font-semibold uppercase tracking-wider text-[10px] text-center">Attended</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400 font-mono">
                    No matching student passes found for this filter.
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((reg) => (
                  <tr key={reg._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-6 font-bold text-slate-900">{reg.student?.name}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {reg.student?.usn || reg.student?.rollNumber || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{reg.student?.department || 'DSU'}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-[#002B55] bg-blue-50/80 px-2 py-0.5 rounded border border-blue-200/60">
                        {reg.ticketCode}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <button
                        type="button"
                        onClick={() => toggleAttendance(reg._id, reg.attended)}
                        disabled={reg.attended || updatingRegistration === reg._id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition ${
                          reg.attended
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                            : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-300'
                        }`}
                      >
                        {reg.attended ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Checked In</span>
                          </>
                        ) : (
                          <span>Mark Present</span>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Real-time Camera QR Scanner Modal */}
      <QrCameraScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={async (scannedCode) => {
          await verifyTicket(scannedCode);
        }}
        isProcessing={checkingIn}
      />
    </div>
  );
};
