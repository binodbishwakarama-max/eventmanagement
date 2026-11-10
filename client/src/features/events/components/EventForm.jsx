import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../api/client';
import { EventArtwork } from '../../../components/EventArtwork';
import { EVENT_CATEGORIES, DEFAULT_VENUE_PRESETS } from '../constants';
import {
  MapPin,
  Users,
  Sparkles,
  ArrowRight,
  Eye,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';

export function EventForm({
  initialData = {},
  onSubmit,
  isSubmitting = false,
  isEdit = false,
  submitLabel = 'Save Event'
}) {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    category: initialData.category || 'Technical',
    venue: initialData.venue || '',
    startsAt: initialData.startsAt || '',
    endsAt: initialData.endsAt || '',
    capacity: initialData.capacity || 60,
    status: initialData.status || 'draft',
    organizerClub: initialData.organizerClub || ''
  });

  const [venues, setVenues] = useState(DEFAULT_VENUE_PRESETS);
  const [clubs, setClubs] = useState([]);

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        category: initialData.category || 'Technical',
        venue: initialData.venue || '',
        startsAt: initialData.startsAt || '',
        endsAt: initialData.endsAt || '',
        capacity: initialData.capacity || 60,
        status: initialData.status || 'draft',
        organizerClub: initialData.organizerClub || ''
      });
    }
  }, [initialData]);

  useEffect(() => {
    apiClient
      .get('/venues')
      .then((res) => {
        if (res.data?.data?.length > 0) {
          setVenues(res.data.data);
        }
      })
      .catch(() => {});

    apiClient
      .get('/clubs')
      .then((res) => {
        if (res.data?.data?.length > 0) {
          setClubs(res.data.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'capacity' ? (value ? Number.parseInt(value, 10) : '') : value
    }));
  };

  const handleApplyPreset = (preset) => {
    setFormData((prev) => ({
      ...prev,
      venue: preset.name,
      capacity: preset.capacity
    }));
    toast.success(`Preset applied: ${preset.name} (${preset.capacity} seats)`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Event title is required');
      return;
    }
    if (!formData.venue.trim()) {
      toast.error('Event venue is required');
      return;
    }
    if (!formData.startsAt) {
      toast.error('Start date and time is required');
      return;
    }
    if (!formData.endsAt) {
      toast.error('End date and time is required');
      return;
    }
    if (new Date(formData.endsAt) <= new Date(formData.startsAt)) {
      toast.error('Event end time must be chronologically after the start time');
      return;
    }
    if (Number(formData.capacity) < 1) {
      toast.error('Capacity must be at least 1 attendee');
      return;
    }

    onSubmit(formData);
  };

  const previewStarts = formData.startsAt
    ? new Date(formData.startsAt)
    : new Date(Date.now() + 86400000 * 3);
  const month = previewStarts.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const day = previewStarts.toLocaleDateString('en-US', { day: '2-digit' });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="event-title" className="block text-sm font-semibold text-slate-900 mb-1">
              Event Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="event-title"
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., National Hackathon: AI for Sustainability"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900 text-slate-900 font-medium placeholder-slate-400"
            />
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="event-category" className="block text-sm font-semibold text-slate-900 mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                id="event-category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900 text-slate-800 bg-white"
              >
                {EVENT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {isEdit ? (
              <div>
                <label htmlFor="event-status" className="block text-sm font-semibold text-slate-900 mb-1">
                  Lifecycle Status <span className="text-rose-500">*</span>
                </label>
                <select
                  id="event-status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900 text-slate-800 bg-white"
                >
                  <option value="draft">Draft (Visible only to Organizers)</option>
                  <option value="published">Published (Public to Campus)</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            ) : (
              <div>
                <label htmlFor="event-organizer-club" className="block text-sm font-semibold text-slate-900 mb-1">
                  Organizing Club / Dept
                </label>
                <input
                  id="event-organizer-club"
                  type="text"
                  name="organizerClub"
                  list="club-suggestions"
                  value={formData.organizerClub}
                  onChange={handleChange}
                  placeholder="e.g. IEEE Student Branch, ACM Chapter"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900 text-slate-800"
                />
                <datalist id="club-suggestions">
                  {clubs.map((c) => (
                    <option key={c._id || c.name} value={c.name} />
                  ))}
                </datalist>
              </div>
            )}
          </div>

          {isEdit && (
            <div>
              <label htmlFor="event-organizer-club-edit" className="block text-sm font-semibold text-slate-900 mb-1">
                Organizing Club / Department
              </label>
              <input
                id="event-organizer-club-edit"
                type="text"
                name="organizerClub"
                list="club-suggestions-edit"
                value={formData.organizerClub}
                onChange={handleChange}
                placeholder="e.g. IEEE Student Branch, ACM Chapter"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900 text-slate-800"
              />
              <datalist id="club-suggestions-edit">
                {clubs.map((c) => (
                  <option key={c._id || c.name} value={c.name} />
                ))}
              </datalist>
            </div>
          )}

          {/* Venue & Capacity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="event-venue" className="block text-sm font-semibold text-slate-900 mb-1">
                Campus Venue <span className="text-rose-500">*</span>
              </label>
              <input
                id="event-venue"
                type="text"
                name="venue"
                required
                list="venue-suggestions"
                value={formData.venue}
                onChange={handleChange}
                placeholder="Select or enter campus hall"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900 text-slate-800"
              />
              <datalist id="venue-suggestions">
                {venues.map((v) => (
                  <option key={v._id || v.name} value={v.name} />
                ))}
              </datalist>
            </div>

            <div>
              <label htmlFor="event-capacity" className="block text-sm font-semibold text-slate-900 mb-1">
                Capacity <span className="text-rose-500">*</span>
              </label>
              <input
                id="event-capacity"
                type="number"
                name="capacity"
                required
                min="1"
                value={formData.capacity}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900 text-slate-800"
              />
            </div>
          </div>

          {/* Venue Quick Presets */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-900" />
              Verified Campus Venues
            </p>
            <div className="flex flex-wrap gap-2">
              {venues.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                    formData.venue === preset.name
                      ? 'bg-blue-900 text-white border-blue-900 font-semibold'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  {preset.name} ({preset.capacity})
                </button>
              ))}
            </div>
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="event-starts-at" className="block text-sm font-semibold text-slate-900 mb-1">
                Starts At <span className="text-rose-500">*</span>
              </label>
              <input
                id="event-starts-at"
                type="datetime-local"
                name="startsAt"
                required
                value={formData.startsAt}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900 text-slate-800"
              />
            </div>

            <div>
              <label htmlFor="event-ends-at" className="block text-sm font-semibold text-slate-900 mb-1">
                Ends At <span className="text-rose-500">*</span>
              </label>
              <input
                id="event-ends-at"
                type="datetime-local"
                name="endsAt"
                required
                value={formData.endsAt}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900 text-slate-800"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="event-description" className="block text-sm font-semibold text-slate-900 mb-1">
              Event Description & Guidelines <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="event-description"
              name="description"
              required
              rows={5}
              value={formData.description}
              onChange={handleChange}
              placeholder="Outline event agenda, eligibility criteria, prerequisites, rules, and outcomes..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900 text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-900 text-white font-semibold shadow hover:bg-blue-800 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{submitLabel}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Live Preview Column */}
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-24">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-blue-900" />
              Live Student Preview
            </h3>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {formData.status || 'draft'}
            </span>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
            <EventArtwork
              category={formData.category}
              title={formData.title || 'Untitled Event Draft'}
              height="h-44"
              startsAt={formData.startsAt}
            />

            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1 text-center shrink-0">
                  <span className="block text-[10px] font-bold text-red-600 uppercase">
                    {month}
                  </span>
                  <span className="block text-lg font-black text-slate-900 leading-none mt-0.5">
                    {day}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900">
                    {formData.category}
                  </span>
                  <h4 className="text-base font-bold text-slate-900 line-clamp-1 mt-0.5">
                    {formData.title || 'Untitled Event Draft'}
                  </h4>
                </div>
              </div>

              <p className="text-xs text-slate-600 line-clamp-2 mt-3">
                {formData.description || 'Description will appear here as you type...'}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{formData.venue || 'Venue TBD'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{formData.capacity || 0} Total Capacity</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-950 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-900 shrink-0 mt-0.5" />
            <p>
              Changes are immediately reflected in the public campus calendar upon publishing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


