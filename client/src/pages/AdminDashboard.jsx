import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Users,
  CheckCircle,
  Plus,
  Trash2,
  Edit,
  CheckSquare,
  Search,
  ShieldCheck,
  TrendingUp,
  Ticket,
  GraduationCap,
  Building2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({ search: '', status: '' });

  const fetchData = async (activeFilters = filters) => {
    setLoading(true);
    setLoadError('');
    try {
      const eventParams = { limit: 100 };
      if (activeFilters.search) eventParams.search = activeFilters.search;
      if (activeFilters.status) eventParams.status = activeFilters.status;
      const requests = [
        apiClient.get('/admin/stats'),
        apiClient.get('/events/admin/list', { params: eventParams })
      ];
      if (user?.role === 'admin') {
        requests.push(apiClient.get('/admin/users', { params: { limit: 100 } }));
      }
      const [statsRes, eventsRes, usersRes] = await Promise.all(requests);
      setStats(statsRes.data.data);
      setEvents(eventsRes.data.data.items);
      setAccounts(usersRes?.data?.data?.items || []);
    } catch (err) {
      setLoadError(err.response?.data?.message || 'Management data could not be loaded. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const submitSearch = (event) => {
    event.preventDefault();
    const nextFilters = { ...filters, search: searchText.trim() };
    setFilters(nextFilters);
    fetchData(nextFilters);
  };

  const updateStatusFilter = (status) => {
    const nextFilters = { ...filters, status };
    setFilters(nextFilters);
    fetchData(nextFilters);
  };

  const handleDelete = async (id, registeredCount) => {
    if (registeredCount > 0) {
      toast.error(`Cannot delete event with ${registeredCount} registrations. Set status to cancelled instead.`);
      return;
    }
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await apiClient.delete(`/events/${id}`);
      toast.success('Event deleted successfully');
      fetchData(filters);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const togglePublish = async (event) => {
    const nextStatus = event.status === 'published' ? 'draft' : 'published';
    try {
      await apiClient.put(`/events/${event._id}`, { status: nextStatus });
      toast.success(`Event status updated to ${nextStatus}`);
      fetchData(filters);
    } catch (err) {
      toast.error('Status update failed');
    }
  };

  if (loading && !stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-28 text-center">
        <div className="w-10 h-10 border-2 border-[#002B55] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-slate-500 font-mono">Loading university operations console...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Console Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span className="uppercase tracking-wider">{user?.role === 'admin' ? 'University Administration Desk' : 'Faculty Organizer Desk'}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#002B55] tracking-tight">
            Campus Operations & Logistics Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Authorize schedules, monitor Harohalli hall occupancy, track student registrations, and manage check-in desks.
          </p>
        </div>

        <Link
          to="/admin/events/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#002B55] hover:bg-[#001B36] text-white text-xs font-bold shadow-xs transition active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 text-[#D9A521]" /> Create Gathering
        </Link>
      </div>

      {loadError && (
        <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800" role="alert">
          <span>{loadError}</span>
          <button type="button" className="font-semibold underline text-rose-900" onClick={() => fetchData(filters)}>
            Retry
          </button>
        </div>
      )}

      {/* 5-Metric Operations Analytics Shelf */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="dsu-card p-5">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider block">
              Total Gatherings
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#002B55] mt-1">{stats.totalEvents}</p>
          </div>
          <div className="dsu-card p-5">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider block">
              Published Live
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-blue-600 mt-1">{stats.publishedEvents}</p>
          </div>
          <div className="dsu-card p-5">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider block">
              Upcoming
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-indigo-600 mt-1">{stats.upcomingEvents}</p>
          </div>
          <div className="dsu-card p-5">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider block">
              Student Passes
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1">{stats.totalRegistrations}</p>
          </div>
          <div className="dsu-card p-5 col-span-2 lg:col-span-1">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider block">
              Verified Turnout
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">{stats.attendanceRate}%</p>
          </div>
        </div>
      )}

      {/* Events Table Container */}
      <div className="dsu-card overflow-hidden mb-10">
        {/* Table Toolbar */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-[#002B55]">University Events Master Roster</h2>
            <p className="text-xs text-slate-500 mt-0.5">Control publishing state, venue logistics, and desk access.</p>
          </div>

          <form onSubmit={submitSearch} className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                id="event-search"
                aria-label="Search events"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search by title..."
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#002B55]"
              />
            </div>

            <select
              id="event-status"
              aria-label="Filter status"
              value={filters.status}
              onChange={(e) => updateStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#002B55]"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <button
              type="submit"
              className="px-3.5 py-1.5 rounded-xl bg-[#002B55] text-white text-xs font-semibold hover:bg-[#001B36] transition shadow-xs"
            >
              Search
            </button>
          </form>
        </div>

        {/* High-Craft Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <th className="py-3 px-6 font-semibold uppercase tracking-wider text-xs">Event Title & Venue</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider text-xs">Category</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider text-xs">Capacity</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider text-xs">Status</th>
                <th className="py-3 px-6 font-semibold uppercase tracking-wider text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {events.map((ev) => (
                <tr key={ev._id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-6">
                    <p className="font-bold text-slate-900 hover:text-[#002B55] transition text-sm">
                      <Link to={`/events/${ev._id}`}>{ev.title.replace(/^DEMO:\s*/, '')}</Link>
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                      <span>{ev.venue}</span>
                      <span className="text-slate-300">·</span>
                      <span>{new Date(ev.startsAt).toLocaleDateString()}</span>
                    </p>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="bg-[#002B55]/5 text-[#002B55] px-2.5 py-0.5 rounded-full text-xs font-semibold border border-[#002B55]/10">
                      {ev.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <span className="font-bold text-[#002B55]">{ev.registeredCount}</span> / {ev.capacity}
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      type="button"
                      onClick={() => togglePublish(ev)}
                      title="Click to toggle publish status"
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wide transition ${
                        ev.status === 'published'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                          : ev.status === 'draft'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {ev.status}
                    </button>
                  </td>
                  <td className="py-3.5 px-6 text-right space-x-2">
                    <Link
                      to={`/admin/events/${ev._id}/edit`}
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 transition shadow-xs"
                    >
                      <Edit className="w-3 h-3 text-slate-500" /> Edit
                    </Link>
                    <Link
                      to={`/admin/events/${ev._id}/attendance`}
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-white bg-[#002B55] hover:bg-[#001B36] px-3 py-1.5 rounded-xl transition shadow-xs"
                    >
                      <CheckSquare className="w-3 h-3 text-[#D9A521]" /> Attendance
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(ev._id, ev.registeredCount)}
                      className="inline-flex items-center text-slate-400 hover:text-rose-600 p-1.5 rounded-xl hover:bg-rose-50 transition"
                      title="Delete Event"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr>
                  <td className="px-6 py-12 text-center text-slate-400 font-mono" colSpan="5">
                    No campus events match these search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Administrator Accounts Oversight Table */}
      {user?.role === 'admin' && (
        <section className="dsu-card overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-base font-bold text-[#002B55]">DSU Campus User Directory</h2>
            <p className="text-xs text-slate-500 mt-0.5">Authorized university profiles, USNs, and permissions on DSU Events.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <th className="px-6 py-3 font-semibold uppercase tracking-wider text-xs">User Name</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-xs">Email</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-xs">Role</th>
                  <th className="px-6 py-3 font-semibold uppercase tracking-wider text-xs">Department / Faculty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accounts.map((acc) => (
                  <tr key={acc._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-3.5 font-bold text-slate-900">{acc.name}</td>
                    <td className="px-4 py-3.5 text-slate-500 font-medium">{acc.email}</td>
                    <td className="px-4 py-3.5">
                      <span className="capitalize px-2.5 py-0.5 rounded-full bg-[#002B55]/5 text-xs font-semibold text-[#002B55] border border-[#002B55]/10">
                        {acc.role}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">
                      {acc.department || acc.clubName || 'Dayananda Sagar University'}
                    </td>
                  </tr>
                ))}
                {accounts.length === 0 && (
                  <tr>
                    <td className="px-6 py-10 text-center text-slate-400 font-mono" colSpan="4">
                      No accounts listed.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};
