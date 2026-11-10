import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { EventForm } from '../features/events/components/EventForm';
import { formatDateTimeForInput } from '../features/events/constants';
import { ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export function EditEventPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [event, setEvent] = useState(null);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await apiClient.get(`/events/${id}`);
        setEvent(res.data.data);
      } catch {
        toast.error('Failed to load event specifications');
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [id]);

  const handleSubmit = async (formData) => {
    // Rule R6: Capacity cannot drop below existing registrations count
    if (event && Number(formData.capacity) < event.registeredCount) {
      toast.error(`Capacity cannot be lower than current registered students (${event.registeredCount})`);
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
        <div className="w-10 h-10 border-2 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-slate-500 font-mono">Loading event specifications...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Event Not Found</h2>
        <p className="text-sm text-slate-500 mt-1 mb-6">
          The requested event record does not exist or has been removed.
        </p>
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-900 text-white text-sm font-semibold hover:bg-blue-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Administrative Desk
        </Link>
      </div>
    );
  }

  const initialFormData = {
    title: event.title || '',
    description: event.description || '',
    category: event.category || 'Technical',
    venue: event.venue || '',
    startsAt: formatDateTimeForInput(event.startsAt),
    endsAt: formatDateTimeForInput(event.endsAt),
    capacity: event.capacity || 60,
    status: event.status || 'draft',
    organizerClub: event.organizerClub || ''
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-900 transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Operations Console
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Edit Event Specifications
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Update institutional schedule, capacity quota ({event.registeredCount || 0} registered), or publication status.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-950">
            <Sparkles className="w-3.5 h-3.5 text-blue-900" />
            Active Registrations: {event.registeredCount || 0}
          </div>
        </div>
      </div>

      <EventForm
        initialData={initialFormData}
        onSubmit={handleSubmit}
        isSubmitting={saving}
        submitLabel="Save Changes"
        isEdit={true}
      />
    </div>
  );
}
