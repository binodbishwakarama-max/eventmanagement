import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { EventArtwork } from '../components/EventArtwork';
import {
  ArrowLeft,
  Save,
  Users,
  AlertCircle,
  Eye,
  MapPin,
  Clock,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Other'];

const CAMPUS_VENUE_PRESETS = [
  { name: 'Sir M. Visvesvaraya Auditorium', capacity: 250 },
  { name: 'Dr. Premachandra Sagar Seminar Hall', capacity: 120 },
  { name: 'CSE Innovation & AI Research Lab', capacity: 60 },
  { name: 'Central Campus Amphitheatre', capacity: 150 },
  { name: 'DSU Indoor Sports Arena & Turf', capacity: 300 },
  { name: 'Kaviguru Kuvempu Cultural Pavilion', capacity: 400 }
];

export const EditEventPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [event, setEvent] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Technical',
    venue: '',
    startsAt: '',
    endsAt: '',
    capacity: 60,
    status: 'draft',
    organizerClub: ''
  });

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await apiClient.get(`/events/${id}`);
        const ev = res.data.data;
        setEvent(ev);

        const formatForInput = (d) => {
          if (!d) return '';
          const date = new Date(d);
          const pad = (n) => String(n).padStart(2, '0');
          return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
            date.getHours()
          )}:${pad(date.getMinutes())}`;
        };

        setFormData({
          title: ev.title || '',
          description: ev.description || '',
          category: ev.category || 'Technical',
          venue: ev.venue || '',
          startsAt: formatForInput(ev.startsAt),
          endsAt: formatForInput(ev.endsAt),
          capacity: ev.capacity || 60,
          status: ev.status || 'draft',
          organizerClub: ev.organizerClub || ''
        });
      } catch {
        toast.error('Failed to load event details');
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleApplyPreset = (preset) => {
    setFormData((prev) => ({
      ...prev,
      venue: preset.name,
      capacity: Math.max(preset.capacity, event?.registeredCount || 0)
    }));
    toast.success(`Preset loaded: ${preset.name}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Rule R6 check: Capacity cannot drop below registeredCount
    if (event && Number(formData.capacity) < event.registeredCount) {
      toast.error(`Capacity cannot be lower than current registrations (${event.registeredCount})`);
      return;
    }

    if (new Date(formData.endsAt) <= new Date(formData.startsAt)) {
      toast.error('End date/time must be after start date/time');
      return;
    }

    setSaving(true);
    try {
      await apiClient.put(`/events/${id}`, {
        ...formData,
        capacity: Number(formData.capacity)
      });
      toast.success('Event updated successfully!');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update event');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-28 text-center">
        <div className="w-10 h-10 border-2 border-[#002B55] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-slate-500 font-mono">Loading event specifications...</p>
      </div>
    );
  }

  const previewStarts = formData.startsAt ? new Date(formData.startsAt) : new Date();
  const month = previewStarts.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const day = previewStarts.toLocaleDateString('en-US', { day: '2-digit' });
  const timeString = previewStarts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Link
        to="/admin"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#002B55] mb-6 transition group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Operations Console</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Form & Settings */}
        <div className="lg:col-span-7 dsu-card p-6 sm:p-8 space-y-6">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#002B55] block mb-1">
              Dayananda Sagar University • Event Studio
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#002B55]">
              Edit Event Specifications
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Update schedule, Harohalli venue assignment, student capacity, or publishing state.
            </p>
          </div>

          {/* Quick Select Venue Presets */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#002B55] block mb-2.5">
              Venue Presets
            </span>
            <div className="flex flex-wrap gap-2">
              {CAMPUS_VENUE_PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:text-[#002B55] hover:border-[#002B55] hover:bg-slate-50 transition shadow-xs text-left"
                >
                  <span>{p.name.split(' ')[0]}</span>
                  <span className="text-slate-400 ml-1 font-mono">({p.capacity})</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label htmlFor="edit-event-title" className="block font-semibold text-slate-700 mb-1.5">
                Event Title *
              </label>
              <input
                type="text"
                name="title"
                id="edit-event-title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 focus:border-[#002B55] rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#002B55] transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-event-category" className="block font-semibold text-slate-700 mb-1.5">
                  Category *
                </label>
                <select
                  name="category"
                  id="edit-event-category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-[#002B55] rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#002B55] transition"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="edit-event-organizer" className="block font-semibold text-slate-700 mb-1.5">
                  Organizing Club or Faculty
                </label>
                <input
                  type="text"
                  name="organizerClub"
                  id="edit-event-organizer"
                  value={formData.organizerClub}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 focus:border-[#002B55] rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#002B55] transition"
                />
              </div>
            </div>

            <div>
              <label htmlFor="edit-event-venue" className="block font-semibold text-slate-700 mb-1.5">
                Venue Location *
              </label>
              <input
                type="text"
                name="venue"
                id="edit-event-venue"
                required
                value={formData.venue}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 focus:border-[#002B55] rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#002B55] transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="edit-event-start" className="block font-semibold text-slate-700 mb-1.5">
                  Starts At *
                </label>
                <input
                  type="datetime-local"
                  name="startsAt"
                  id="edit-event-start"
                  required
                  value={formData.startsAt}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#002B55] transition"
                />
              </div>

              <div>
                <label htmlFor="edit-event-end" className="block font-semibold text-slate-700 mb-1.5">
                  Ends At *
                </label>
                <input
                  type="datetime-local"
                  name="endsAt"
                  id="edit-event-end"
                  required
                  value={formData.endsAt}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#002B55] transition"
                />
              </div>

              <div>
                <label htmlFor="edit-event-capacity" className="block font-semibold text-slate-700 mb-1.5">
                  Capacity (Min {event?.registeredCount || 1}) *
                </label>
                <input
                  type="number"
                  name="capacity"
                  id="edit-event-capacity"
                  required
                  min={event?.registeredCount || 1}
                  value={formData.capacity}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#002B55] transition"
                />
              </div>
            </div>

            <div>
              <label htmlFor="edit-event-status" className="block font-semibold text-slate-700 mb-1.5">
                Lifecycle Status *
              </label>
              <select
                name="status"
                id="edit-event-status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-[#002B55] rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#002B55] transition"
              >
                <option value="draft">Draft (Private to Department)</option>
                <option value="published">Published (Open for Student Pass Booking)</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label htmlFor="edit-event-description" className="block font-semibold text-slate-700 mb-1.5">
                Event Description & Syllabus *
              </label>
              <textarea
                name="description"
                id="edit-event-description"
                required
                rows="4"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 focus:border-[#002B55] rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#002B55] transition"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <Link
                to="/admin"
                className="px-5 py-2.5 rounded-full border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-full bg-[#002B55] hover:bg-[#001B36] text-white text-xs font-bold shadow-xs transition active:scale-[0.98] disabled:opacity-50"
              >
                {saving ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Card Preview */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="uppercase tracking-wider font-semibold text-[#002B55]">Live Pass Preview</span>
            <span className="text-[11px] text-slate-400">Synchronized</span>
          </div>

          <div className="dsu-card overflow-hidden">
            <div className="relative h-48 bg-slate-100 overflow-hidden">
              <EventArtwork
                category={formData.category}
                title={formData.title || 'Event Title'}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 flex gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#002B55] text-white shadow-xs">
                  {formData.category}
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#D9A521] text-[#001B36] uppercase">
                  {formData.status}
                </span>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-12 rounded-xl bg-[#002B55] text-white flex flex-col items-center justify-center shrink-0">
                  <span className="text-[9px] font-bold text-[#D9A521] uppercase leading-none">{month}</span>
                  <span className="text-base font-extrabold leading-tight">{day}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-slate-900 text-base leading-snug truncate">
                    {formData.title || 'Untitled Gathering'}
                  </h3>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {formData.organizerClub || 'Dayananda Sagar University'}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-500 pt-1 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono">{timeString} IST</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#002B55]" />
                  <span className="truncate">{formData.venue || 'Campus Venue Location'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>{event?.registeredCount || 0} / {formData.capacity} students registered</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
