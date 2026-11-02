import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { EventArtwork } from '../components/EventArtwork';
import {
  ArrowLeft,
  Calendar,
  Building,
  MapPin,
  Users,
  Clock,
  Sparkles,
  ArrowRight,
  Eye,
  Info,
  GraduationCap
} from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Other'];

const CAMPUS_VENUE_PRESETS = [
  { name: 'Sir M. Visvesvaraya Auditorium', capacity: 250, desc: 'Central Academic Block 1' },
  { name: 'Dr. Premachandra Sagar Seminar Hall', capacity: 120, desc: 'Academic Block 2' },
  { name: 'CSE Innovation & AI Research Lab', capacity: 60, desc: 'Engineering Block 3' },
  { name: 'Central Campus Amphitheatre', capacity: 150, desc: 'Student Activity Plaza' },
  { name: 'DSU Indoor Sports Arena & Turf', capacity: 300, desc: 'Sports Complex' },
  { name: 'Kaviguru Kuvempu Cultural Pavilion', capacity: 400, desc: 'Harohalli Grounds' }
];

export const CreateEventPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Technical',
    venue: '',
    startsAt: '',
    endsAt: '',
    capacity: 60,
    organizerClub: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleApplyPreset = (preset) => {
    setFormData((prev) => ({
      ...prev,
      venue: preset.name,
      capacity: preset.capacity
    }));
    toast.success(`Preset applied: ${preset.name} (${preset.capacity} seats)`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (new Date(formData.endsAt) <= new Date(formData.startsAt)) {
      toast.error('Event end time must be after start time');
      return;
    }
    setLoading(true);
    try {
      await apiClient.post('/events', formData);
      toast.success('Event draft created successfully!');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const previewStarts = formData.startsAt ? new Date(formData.startsAt) : new Date(Date.now() + 86400000 * 3);
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
        {/* Left Column: Form & Presets */}
        <div className="lg:col-span-7 dsu-card p-6 sm:p-8 space-y-6">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#002B55] block mb-1">
              Dayananda Sagar University • Event Studio
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#002B55]">
              Create Campus Gathering
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Publish schedule, assign Harohalli campus venues, and establish attendance caps for DSU students.
            </p>
          </div>

          {/* Quick Select Venue Presets */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#002B55] block mb-2.5">
              Harohalli Campus Venue Presets
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
              <label htmlFor="create-event-title" className="block font-semibold text-slate-700 mb-1.5">
                Event Title *
              </label>
              <input
                type="text"
                name="title"
                id="create-event-title"
                required
                placeholder="e.g. AI Innovation Summit 2026"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 focus:border-[#002B55] rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#002B55] transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="create-event-category" className="block font-semibold text-slate-700 mb-1.5">
                  Category *
                </label>
                <select
                  name="category"
                  id="create-event-category"
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
                <label htmlFor="create-event-organizer" className="block font-semibold text-slate-700 mb-1.5">
                  Organizing Club or Faculty
                </label>
                <input
                  type="text"
                  name="organizerClub"
                  id="create-event-organizer"
                  placeholder="e.g. Developer Student Club / School of Engineering"
                  value={formData.organizerClub}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 focus:border-[#002B55] rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#002B55] transition"
                />
              </div>
            </div>

            <div>
              <label htmlFor="create-event-venue" className="block font-semibold text-slate-700 mb-1.5">
                Venue Location *
              </label>
              <input
                type="text"
                name="venue"
                id="create-event-venue"
                required
                placeholder="e.g. Sir M. Visvesvaraya Auditorium, Academic Block 1"
                value={formData.venue}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 focus:border-[#002B55] rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#002B55] transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="create-event-start" className="block font-semibold text-slate-700 mb-1.5">
                  Starts At *
                </label>
                <input
                  type="datetime-local"
                  name="startsAt"
                  id="create-event-start"
                  required
                  value={formData.startsAt}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#002B55] transition"
                />
              </div>

              <div>
                <label htmlFor="create-event-end" className="block font-semibold text-slate-700 mb-1.5">
                  Ends At *
                </label>
                <input
                  type="datetime-local"
                  name="endsAt"
                  id="create-event-end"
                  required
                  value={formData.endsAt}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#002B55] transition"
                />
              </div>

              <div>
                <label htmlFor="create-event-capacity" className="block font-semibold text-slate-700 mb-1.5">
                  Capacity Seats *
                </label>
                <input
                  type="number"
                  name="capacity"
                  id="create-event-capacity"
                  required
                  min="1"
                  max="10000"
                  value={formData.capacity}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#002B55] transition"
                />
              </div>
            </div>

            <div>
              <label htmlFor="create-event-description" className="block font-semibold text-slate-700 mb-1.5">
                Event Description & Academic Syllabus *
              </label>
              <textarea
                name="description"
                id="create-event-description"
                required
                rows="4"
                placeholder="Outline schedule, speaker bios, topics covered, and prerequisites..."
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
                disabled={loading}
                className="px-6 py-2.5 rounded-full bg-[#002B55] hover:bg-[#001B36] text-white text-xs font-bold shadow-xs transition active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? 'Creating Draft...' : 'Publish Gathering'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Card Preview */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="uppercase tracking-wider font-semibold text-[#002B55]">Live Student Pass Preview</span>
            <span className="text-[11px] text-slate-400">Real-time sync</span>
          </div>

          <div className="dsu-card overflow-hidden">
            <div className="relative h-48 bg-slate-100 overflow-hidden">
              <EventArtwork
                category={formData.category}
                title={formData.title || 'Event Title Preview'}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#002B55] text-white shadow-xs">
                  {formData.category}
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
                  <span>{formData.capacity} student seats</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
