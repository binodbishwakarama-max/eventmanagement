import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { EventForm } from '../features/events/components/EventForm';
import { ArrowLeft, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export function CreateEventPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-900 transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Administrative Desk
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Create Campus Event
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Publish university workshops, fests, hackathons, and sports tournaments.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-950">
            <Sparkles className="w-3.5 h-3.5 text-blue-900" />
            Official DSU Event Desk
          </div>
        </div>
      </div>

      <EventForm
        onSubmit={handleSubmit}
        isSubmitting={loading}
        submitLabel="Create Event Draft"
        isEdit={false}
      />
    </div>
  );
}
