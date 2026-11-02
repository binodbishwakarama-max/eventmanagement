import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { EventArtwork } from '../components/EventArtwork';
import { downloadIcsFile, getGoogleCalendarUrl } from '../utils/calendar';
import { isEventSaved, toggleSaveEvent } from '../utils/bookmarks';
import { CampusMapModal } from '../components/CampusMapModal';
import {
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  Building,
  ArrowLeft,
  CheckCircle2,
  CalendarPlus,
  Users,
  ShieldAlert,
  Ticket,
  Bookmark,
  Share2,
  ExternalLink,
  Navigation,
  Sparkles,
  Award,
  ChevronDown,
  Info,
  Check,
  GraduationCap,
  ShieldCheck,
  Compass
} from 'lucide-react';
import toast from 'react-hot-toast';

export function EventDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [calendarMenuOpen, setCalendarMenuOpen] = useState(false);
  const [mapModalOpen, setMapModalOpen] = useState(false);

  const fetchEvent = async () => {
    setLoadError('');
    try {
      const res = await apiClient.get(`/events/${id}`);
      const ev = res.data.data;
      setEvent(ev);
      setSaved(isEventSaved(ev._id));
    } catch (err) {
      setLoadError(err.response?.data?.message || 'Unable to load event details. Please verify your connection.');
      toast.error('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id, user]);

  const handleRegister = async () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/events/${id}` } } });
      return;
    }
    setActionLoading(true);
    try {
      await apiClient.post(`/events/${id}/register`);
      toast.success('Registration confirmed! Official DSU pass issued.', { icon: '🎟️' });
      await fetchEvent();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel your pass registration for this event?')) return;
    setActionLoading(true);
    try {
      await apiClient.delete(`/events/${id}/register`);
      toast.success('Registration cancelled', { icon: 'ℹ️' });
      await fetchEvent();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleSave = () => {
    if (!event) return;
    const nowSaved = toggleSaveEvent(event._id);
    setSaved(nowSaved);
    if (nowSaved) {
      toast.success('Saved to your bookmarks', { icon: '🔖' });
    } else {
      toast('Removed from saved bookmarks', { icon: '🗑️' });
    }
  };

  const handleShare = () => {
    if (!event) return;
    const url = window.location.href;
    const title = event.title.replace(/^DEMO:\s*/, '');
    if (navigator.share) {
      navigator.share({
        title,
        text: `Join me at ${title} at Dayananda Sagar University!`,
        url
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Event link copied to clipboard!');
    }
  };

  const handleAppleCalendar = () => {
    if (!event) return;
    downloadIcsFile(event);
    toast.success('Apple iCal / Outlook (.ics) calendar downloaded');
    setCalendarMenuOpen(false);
  };

  const handleGoogleCalendar = () => {
    if (!event) return;
    window.open(getGoogleCalendarUrl(event), '_blank', 'noopener,noreferrer');
    setCalendarMenuOpen(false);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-28 text-center">
        <div className="w-10 h-10 border-2 border-[#002B55] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-xs font-mono">Loading university event specifications...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-md mx-auto px-4 py-28 text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
          <ShieldAlert className="w-7 h-7 text-rose-600" />
        </div>
        <h2 className="text-xl font-bold text-[#002B55]">Event Not Found</h2>
        <p className="text-xs text-slate-500 mt-1.5">{loadError || 'The event you are looking for is unavailable.'}</p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={fetchEvent}
            className="px-5 py-2.5 rounded-full border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Retry
          </button>
          <Link
            to="/events"
            className="px-5 py-2.5 rounded-full bg-[#002B55] text-white text-xs font-semibold hover:bg-[#001B36] transition"
          >
            All Events
          </Link>
        </div>
      </div>
    );
  }

  const starts = new Date(event.startsAt);
  const ends = new Date(event.endsAt);
  const now = new Date();
  const isStarted = now >= starts;
  const isFull = event.registeredCount >= event.capacity;
  const available = Math.max(0, event.capacity - event.registeredCount);
  const percentFull = Math.min(100, Math.round((event.registeredCount / event.capacity) * 100));
  const isRegistered = event.myRegistration && event.myRegistration.status === 'registered';
  const creatorId = event.createdBy?._id ?? event.createdBy;
  const isManager =
    user?.role === 'admin' ||
    (user?.role === 'organizer' && String(creatorId) === String(user._id));

  const cleanTitle = event.title.replace(/^DEMO:\s*/, '');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Top Breadcrumb & Quick Actions */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
        <Link
          to="/events"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-[#002B55] transition group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Campus Events</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleSave}
            aria-label={saved ? 'Remove bookmark' : 'Save event'}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition"
          >
            <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-[#D9A521] text-[#D9A521]' : 'text-slate-500'}`} />
            <span className="hidden sm:inline">{saved ? 'Saved' : 'Save'}</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            aria-label="Share event"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Academic Event Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column (65%): Artwork, Details, Faculty Info, Location */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-8">
          {/* Main Visual Cover */}
          <div className="overflow-hidden rounded-3xl border border-slate-200 shadow-sm bg-white relative">
            <EventArtwork
              category={event.category}
              title={event.title}
              posterUrl={event.posterUrl}
              className="w-full h-72 sm:h-96 object-cover"
            />
            {event.title.startsWith('DEMO:') && (
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#D9A521] text-[#001B36] shadow-sm">
                  Campus Preview
                </span>
              </div>
            )}
          </div>

          {/* Title & Faculty Organizer Info */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#002B55] text-white shadow-xs">
                {event.category}
              </span>
              <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                Phase: {event.phase || 'Official'}
              </span>
              {isFull && (
                <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200">
                  Full Capacity
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#002B55] tracking-tight leading-tight">
              {cleanTitle}
            </h1>

            {/* University Department Host Badge */}
            <div className="flex items-center gap-3.5 mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-12 h-12 rounded-xl bg-[#002B55] text-[#D9A521] flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                DSU
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {event.organizerClub || 'Dayananda Sagar University'}
                  </p>
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 text-white text-[10px]" title="Verified Campus Entity">
                    ✓
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Dayananda Sagar University • Harohalli Main Campus, Bengaluru
                </p>
              </div>
            </div>
          </div>

          {/* About This Event Block */}
          <div className="pt-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#002B55] mb-3 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#002B55]" />
              <span>Event Overview & Academic Syllabus</span>
            </h2>
            <div className="text-slate-700 leading-relaxed text-sm sm:text-base whitespace-pre-line bg-white p-7 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
              {event.description}
            </div>
          </div>

          {/* Harohalli Campus Location & Venue Guide */}
          <div className="p-7 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0 text-[#002B55]">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{event.venue}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Harohalli Main Campus, Kanakapura Road, Ramanagara District, Bengaluru 562112
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMapModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#002B55] text-xs font-bold transition"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Campus Plan</span>
                </button>

                <a
                  href={`https://maps.google.com/?q=Dayananda+Sagar+University+Harohalli+Campus+${encodeURIComponent(event.venue)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                >
                  <span>Navigation</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-3">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Campus shuttle bus services run frequently between Harohalli gate and the central auditorium.</span>
            </div>
          </div>

          {/* Social Proof / Registered Students Roster Counter */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-[#002B55] text-[#D9A521] font-bold text-xs flex items-center justify-center border-2 border-white">
                  DS
                </div>
                <div className="w-8 h-8 rounded-full bg-[#001B36] text-white font-bold text-xs flex items-center justify-center border-2 border-white">
                  SO
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center border-2 border-white">
                  UG
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">
                  {event.registeredCount} Students Confirmed
                </p>
                <p className="text-[11px] text-slate-500">
                  Open to all DSU schools & faculties with valid student ID
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-semibold text-[#002B55]">
                {available} seats remaining
              </span>
            </div>
          </div>
        </div>

        {/* Right Column (35-40%): Sticky University RSVP Card */}
        <div className="lg:col-span-5 xl:col-span-4 sticky top-24 space-y-4">
          <div className="dsu-card p-6 sm:p-7 space-y-6">
            {/* Header: Date and Calendar Block */}
            <div className="flex items-start gap-4 pb-5 border-b border-slate-100">
              <div className="w-12 h-14 rounded-2xl bg-[#002B55] text-white flex flex-col items-center justify-center shrink-0 shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#D9A521]">
                  {starts.toLocaleDateString('en-US', { month: 'short' })}
                </span>
                <span className="text-xl font-extrabold leading-none">
                  {starts.getDate()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900">
                  {starts.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {starts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {ends.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST
                </p>

                {/* Calendar Dropdown */}
                <div className="relative mt-2">
                  <button
                    type="button"
                    onClick={() => setCalendarMenuOpen(!calendarMenuOpen)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#002B55] hover:text-[#D9A521] transition"
                  >
                    <CalendarPlus className="w-3.5 h-3.5 text-[#D9A521]" />
                    <span>Sync with Calendar</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>

                  {calendarMenuOpen && (
                    <div className="absolute left-0 top-7 z-30 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl p-1.5 text-xs animate-in fade-in duration-150">
                      <button
                        type="button"
                        onClick={handleAppleCalendar}
                        className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-slate-50 text-slate-800 font-medium flex items-center justify-between transition"
                      >
                        <span>Apple / Outlook (.ics)</span>
                        <span className="text-xs text-slate-400">iCal</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleGoogleCalendar}
                        className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-slate-50 text-slate-800 font-medium flex items-center justify-between transition"
                      >
                        <span>Google Calendar</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Venue Location Preview */}
            <div className="flex items-start gap-3.5 pb-5 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 text-[#002B55]">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">{event.venue}</p>
                <p className="text-xs text-slate-500">Harohalli Main Campus, Bengaluru</p>
              </div>
            </div>

            {/* Admission & Capacity Gauge */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Student Admission</span>
                <span className="font-semibold text-emerald-700">Free Admission (Valid DSU USN)</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{event.registeredCount} of {event.capacity} registered</span>
                <span className="font-semibold text-slate-700">{available} remaining</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-rose-500' : 'bg-[#002B55]'}`}
                  style={{ width: `${percentFull}%` }}
                />
              </div>
            </div>

            {/* Dynamic RSVP CTA State */}
            <div className="pt-2">
              {isRegistered ? (
                /* Registered State - Official Pass Voucher Preview */
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Official Pass Issued</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-emerald-100 text-center">
                    <p className="text-xs uppercase text-slate-400 font-medium tracking-wide">Digital Pass Voucher</p>
                    <p className="text-sm font-mono font-bold text-[#002B55] mt-0.5 tracking-wider">
                      {event.myRegistration.ticketCode}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link
                      to="/dashboard"
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#002B55] hover:bg-[#001B36] text-white text-xs font-bold transition shadow-xs"
                    >
                      <Ticket className="w-3.5 h-3.5 text-[#D9A521]" /> View in Passbook
                    </Link>
                    {!isStarted && (
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={actionLoading}
                        className="w-full py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 transition"
                      >
                        Cancel registration
                      </button>
                    )}
                  </div>
                </div>
              ) : isManager ? (
                /* Manager Controls */
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-3">
                  <p className="text-xs font-bold text-[#002B55]">Faculty Organizer Controls</p>
                  <p className="text-[11px] text-slate-500">
                    You have administrative clearance to manage registrations and scan attendee passes.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to={`/admin/events/${event._id}/edit`}
                      className="inline-flex items-center justify-center py-2 px-3 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition text-center"
                    >
                      Edit Event
                    </Link>
                    <Link
                      to={`/admin/events/${event._id}/attendance`}
                      className="inline-flex items-center justify-center py-2 px-3 rounded-xl bg-[#002B55] text-white text-xs font-semibold hover:bg-[#001B36] transition text-center shadow-xs"
                    >
                      Check-in Desk
                    </Link>
                  </div>
                </div>
              ) : user && user.role !== 'student' ? (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <p className="text-xs text-slate-600">
                    Registration is reserved for student accounts. Sign in with a student account to book a pass.
                  </p>
                </div>
              ) : event.status !== 'published' ? (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                  <p className="text-xs font-medium text-amber-800">
                    This event is currently in review and not open for public registrations.
                  </p>
                </div>
              ) : isStarted ? (
                <div className="p-4 rounded-2xl bg-slate-100 text-center">
                  <p className="text-xs font-medium text-slate-600">
                    Event registration is closed because the scheduled start time has arrived.
                  </p>
                </div>
              ) : isFull ? (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-center">
                  <p className="text-xs font-bold text-rose-700">
                    All seats filled. Registration closed.
                  </p>
                </div>
              ) : user ? (
                <button
                  type="button"
                  onClick={handleRegister}
                  disabled={actionLoading}
                  className="w-full py-3.5 rounded-2xl bg-[#002B55] hover:bg-[#001B36] text-white text-sm font-bold shadow-md hover:shadow-lg transition active:scale-[0.98] disabled:opacity-50"
                >
                  {actionLoading ? 'Reserving Pass...' : 'Register for Student Pass'}
                </button>
              ) : (
                <Link
                  to="/login"
                  state={{ from: { pathname: `/events/${id}` } }}
                  className="w-full block py-3.5 rounded-2xl bg-[#002B55] hover:bg-[#001B36] text-white text-sm font-bold text-center shadow-md hover:shadow-lg transition active:scale-[0.98]"
                >
                  Sign in with USN to Register
                </Link>
              )}
            </div>

            {/* Trust badge */}
            <div className="pt-2 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Dayananda Sagar University Official Event</span>
            </div>
          </div>
        </div>
      </div>

      {/* Campus Map Navigator Modal */}
      <CampusMapModal
        isOpen={mapModalOpen}
        onClose={() => setMapModalOpen(false)}
        currentEvents={[event]}
      />
    </div>
  );
}
