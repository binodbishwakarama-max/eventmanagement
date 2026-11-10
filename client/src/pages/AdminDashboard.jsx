import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ConfirmModal } from '../components/ConfirmModal';
import { Skeleton } from '../components/ui';
import {
  CheckCircle,
  Plus,
  Trash2,
  Edit,
  CheckSquare,
  Search,
  ShieldCheck,
  UserCheck,
  XCircle,
  Clock
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
  const [activeTab, setActiveTab] = useState('events'); // 'events' | 'verification' | 'users'
  const [verifyingUserId, setVerifyingUserId] = useState(null);
  const [rejectModalUser, setRejectModalUser] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [deleteTargetEvent, setDeleteTargetEvent] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteClick = (event) => {
    if (event.registeredCount > 0) {
      toast.error(`Cannot delete event with ${event.registeredCount} active registrations. Set status to cancelled instead.`);
      return;
    }
    setDeleteTargetEvent(event);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetEvent) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/events/${deleteTargetEvent._id}`);
      toast.success('Event deleted successfully');
      setDeleteTargetEvent(null);
      fetchData(filters);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setIsDeleting(false);
    }
  };

  const togglePublish = async (event) => {
    const nextStatus = event.status === 'published' ? 'draft' : 'published';
    try {
      await apiClient.put(`/events/${event._id}`, { status: nextStatus });
      toast.success(`Event status updated to ${nextStatus}`);
      fetchData(filters);
    } catch {
      toast.error('Status update failed');
    }
  };

  const handleVerifyStudent = async (studentId, status, reason = '') => {
    setVerifyingUserId(studentId);
    try {
      await apiClient.patch(`/admin/users/${studentId}/verify`, {
        status,
        rejectionReason: reason
      });
      if (status === 'verified') {
        toast.success('Demo profile marked as reviewed');
      } else {
        toast('Demo profile review rejected', { icon: 'ℹ️' });
      }
      setRejectModalUser(null);
      setRejectionReason('');
      fetchData(filters);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification update failed');
    } finally {
      setVerifyingUserId(null);
    }
  };

  const pendingStudents = accounts.filter(
    (acc) => acc.role === 'student' && (acc.verificationStatus === 'pending' || !acc.isVerified)
  );

  if (loading && !stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-pulse">
        <div className="space-y-2">
          <Skeleton className="h-5 w-48 rounded-md" />
          <Skeleton className="h-8 w-72 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-2xl" />
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
            <span className="uppercase tracking-wider">
              {user?.role === 'admin' ? 'University Administrator' : 'Authorized Organizer'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#002B55] tracking-tight">
            University Operations Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage campus events, review student verification rosters, and audit institutional attendance.
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
        <div
          className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800"
          role="alert"
        >
          <span>{loadError}</span>
          <button type="button" className="font-semibold underline text-rose-900" onClick={() => fetchData(filters)}>
            Retry
          </button>
        </div>
      )}

      {/* 5-Metric Operations Analytics Shelf */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
          <div className="dsu-card p-3.5 sm:p-5">
            <span className="text-[10px] sm:text-xs font-semibold uppercase text-slate-500 tracking-wider block">
              Total Gatherings
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#002B55] mt-1">{stats.totalEvents}</p>
          </div>
          <div className="dsu-card p-3.5 sm:p-5">
            <span className="text-[10px] sm:text-xs font-semibold uppercase text-slate-500 tracking-wider block">
              Published Live
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-blue-600 mt-1">{stats.publishedEvents}</p>
          </div>
          <div className="dsu-card p-3.5 sm:p-5">
            <span className="text-[10px] sm:text-xs font-semibold uppercase text-slate-500 tracking-wider block">
              Upcoming
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-indigo-600 mt-1">{stats.upcomingEvents}</p>
          </div>
          <div className="dsu-card p-3.5 sm:p-5">
            <span className="text-[10px] sm:text-xs font-semibold uppercase text-slate-500 tracking-wider block">
              Student Passes
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1">{stats.totalRegistrations}</p>
          </div>
          <div className="dsu-card p-3.5 sm:p-5 col-span-2 sm:col-span-1 lg:col-span-1">
            <span className="text-[10px] sm:text-xs font-semibold uppercase text-slate-500 tracking-wider block">
              Verified Attendance
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">{stats.attendanceRate}%</p>
          </div>
        </div>
      )}

      {/* Console Tab Navigation */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-3 overflow-x-auto scrollbar-none flex-nowrap overscroll-x-contain">
        <button
          type="button"
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition ${
            activeTab === 'events'
              ? 'bg-[#002B55] text-white shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Master Events Roster ({events.length})
        </button>

        {user?.role === 'admin' && (
          <>
            <button
              type="button"
              onClick={() => setActiveTab('verification')}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition flex items-center gap-1.5 ${
                activeTab === 'verification'
                  ? 'bg-[#002B55] text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Student Verification Queue</span>
              {pendingStudents.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#D9A521] text-[#001B36] text-[10px] font-extrabold">
                  {pendingStudents.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition ${
                activeTab === 'users'
                  ? 'bg-[#002B55] text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              User Directory ({accounts.length})
            </button>
          </>
        )}
      </div>

      {/* Tab 1: Events Table */}
      {activeTab === 'events' && (
        <div className="dsu-card overflow-hidden mb-10">
          {/* Table Toolbar */}
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-[#002B55]">University Events Catalog</h2>
              <p className="text-xs text-slate-500 mt-0.5">Manage published university events, configure venues, and monitor real-time attendee registrations.</p>
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
                      <p className="text-slate-500 text-xs mt-0.5">
                        {ev.venue} • {new Date(ev.startsAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
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
                        <CheckSquare className="w-3 h-3 text-[#D9A521]" /> Attendance Desk
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(ev)}
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
      )}

      {/* Tab 2: Student Verification Queue */}
      {activeTab === 'verification' && user?.role === 'admin' && (
        <section className="dsu-card overflow-hidden mb-10">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#002B55] flex items-center gap-2">
                <span>Student Enrollment Verification Queue</span>
                {pendingStudents.length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                    {pendingStudents.length} Pending Review
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Verify submitted student credentials and USN against official Dayananda Sagar University enrollment records.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <th className="px-6 py-3 font-semibold uppercase tracking-wider text-xs">Student Name</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-xs">University USN</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-xs">Email</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-xs">Department / School</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-xs">Profile Status</th>
                  <th className="px-6 py-3 font-semibold uppercase tracking-wider text-xs text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-3.5 font-bold text-slate-900">{student.name}</td>
                    <td className="px-4 py-3.5 font-mono font-bold text-[#002B55]">
                      {student.usn || student.rollNumber || '—'}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 font-medium">{student.email}</td>
                    <td className="px-4 py-3.5 text-slate-600">{student.department || '—'}</td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        <Clock className="w-3 h-3 text-amber-600" /> Pending Review
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => handleVerifyStudent(student._id, 'verified')}
                        disabled={verifyingUserId === student._id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition shadow-xs disabled:opacity-50"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => setRejectModalUser(student)}
                        disabled={verifyingUserId === student._id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 text-[11px] font-bold transition disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </td>
                  </tr>
                ))}
                {pendingStudents.length === 0 && (
                  <tr>
                    <td className="px-6 py-12 text-center text-slate-400 font-mono" colSpan="6">
                      No student enrollment requests currently pending verification.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Tab 3: Complete User Directory */}
      {activeTab === 'users' && user?.role === 'admin' && (
        <section className="dsu-card overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-base font-bold text-[#002B55]">DSU User Directory & Roles</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Institutional user directory with role-based access control (RBAC).
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <th className="px-6 py-3 font-semibold uppercase tracking-wider text-xs">User Name</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-xs">Email</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-xs">University USN</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-xs">Role</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-xs">Verification Status</th>
                  <th className="px-6 py-3 font-semibold uppercase tracking-wider text-xs">Department / School</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accounts.map((acc) => (
                  <tr key={acc._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-3.5 font-bold text-slate-900">{acc.name}</td>
                    <td className="px-4 py-3.5 text-slate-500 font-medium">{acc.email}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-700">{acc.usn || acc.rollNumber || '—'}</td>
                    <td className="px-4 py-3.5">
                      <span className="capitalize px-2.5 py-0.5 rounded-full bg-[#002B55]/5 text-xs font-semibold text-[#002B55] border border-[#002B55]/10">
                        {acc.role}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {acc.isVerified || acc.verificationStatus === 'verified' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3 text-emerald-600" /> Verified Student
                        </span>
                      ) : acc.verificationStatus === 'rejected' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                          <XCircle className="w-3 h-3 text-rose-600" /> Rejected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3 text-amber-600" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">
                      {acc.department || acc.clubName || '—'}
                    </td>
                  </tr>
                ))}
                {accounts.length === 0 && (
                  <tr>
                    <td className="px-6 py-10 text-center text-slate-400 font-mono" colSpan="6">
                      No accounts listed.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Reject Reason Modal */}
      {rejectModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-rose-700 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-sm">Reject Student Verification</h3>
              <button
                type="button"
                onClick={() => setRejectModalUser(null)}
                className="text-white/80 hover:text-white text-xs"
              >
                Cancel
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs text-slate-800">
              <p>
                Please specify the reason for rejecting <strong>{rejectModalUser.name}</strong> (USN:{' '}
                <span className="font-mono">{rejectModalUser.usn}</span>). This feedback will be presented to the student for resubmission.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Rejection Reason</label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Please provide your official 10-digit university USN (1DS...)"
                  className="w-full p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-rose-600 text-xs text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalUser(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleVerifyStudent(
                      rejectModalUser._id,
                      'rejected',
                      rejectionReason || 'Please verify and resubmit with your official Dayananda Sagar University credentials.'
                    )
                  }
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Event Deletion Confirmation Dialog */}
      <ConfirmModal
        isOpen={Boolean(deleteTargetEvent)}
        title="Delete Campus Event"
        message={`Are you sure you want to permanently delete "${deleteTargetEvent?.title}"? This action cannot be undone.`}
        confirmText="Delete Event"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetEvent(null)}
      />
    </div>
  );
};
