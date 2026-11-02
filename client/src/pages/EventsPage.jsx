import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiClient } from '../api/client';
import { EventArtwork } from '../components/EventArtwork';
import { CampusMapModal } from '../components/CampusMapModal';
import {
  getSavedEventIds,
  toggleSaveEvent
} from '../utils/bookmarks';
import {
  Search,
  MapPin,
  Calendar,
  Clock,
  Building,
  ArrowRight,
  SlidersHorizontal,
  X,
  Ticket,
  ChevronRight,
  LayoutGrid,
  List,
  Bookmark,
  Share2,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['All', 'Technical', 'Workshop', 'Cultural', 'Sports', 'Seminar'];

export function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchDraft, setSearchDraft] = useState(searchParams.get('search') || '');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'schedule'
  const [savedIds, setSavedIds] = useState(getSavedEventIds());
  const [mapModalOpen, setMapModalOpen] = useState(false);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || 'All';
  const schoolParam = searchParams.get('school') || '';
  const venueParam = searchParams.get('venue') || '';
  const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1);
  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const sort = searchParams.get('sort') || 'soonest';

  useEffect(() => {
    const handleBookmarkUpdate = () => setSavedIds(getSavedEventIds());
    window.addEventListener('dsu-bookmarks-updated', handleBookmarkUpdate);
    return () => window.removeEventListener('dsu-bookmarks-updated', handleBookmarkUpdate);
  }, []);

  useEffect(() => setSearchDraft(search), [search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (searchDraft === search) return;
      setSearchParams((previous) => {
        const next = new URLSearchParams(previous);
        if (searchDraft.trim()) next.set('search', searchDraft.trim());
        else next.delete('search');
        next.delete('page');
        return next;
      });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchDraft, search, setSearchParams]);

  useEffect(() => {
    const controller = new AbortController();
    async function fetchEvents() {
      setLoading(true);
      setError('');
      try {
        const params = { page, limit: 12 };
        if (search) params.search = search;
        if (category && category !== 'All' && category !== 'Saved') params.category = category;
        if (from) params.from = from;
        if (to) params.to = `${to.slice(0, 10)}T23:59:59.999`;
        if (sort !== 'soonest') params.sort = sort;

        const res = await apiClient.get('/events', { params, signal: controller.signal });
        const items = res.data?.data?.items || [];
        setEvents(items);
        setTotalPages(res.data?.data?.totalPages || 1);
        setTotalCount(res.data?.data?.total || items.length);
      } catch (err) {
        if (err.code !== 'ERR_CANCELED') {
          setError(
            err.response?.data?.message ||
              'Unable to load events from the server. Please verify your connection.'
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    fetchEvents();
    return () => controller.abort();
  }, [search, category, page, from, to, sort, retry]);

  const updateFilter = (key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      if (key !== 'page') next.delete('page');
      return next;
    });
  };

  const handleCategoryChange = (cat) => {
    updateFilter('category', cat === 'All' ? '' : cat);
  };

  const clearFilters = () => {
    setSearchDraft('');
    setSearchParams({});
  };

  const handleToggleBookmark = (e, eventId) => {
    e.preventDefault();
    e.stopPropagation();
    const saved = toggleSaveEvent(eventId);
    setSavedIds(getSavedEventIds());
    if (saved) {
      toast.success('Event saved to your bookmarks');
    } else {
      toast('Removed from bookmarks');
    }
  };

  const handleShare = (e, event) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/events/${event._id}`;
    if (navigator.share) {
      navigator.share({
        title: event.title.replace(/^DEMO:\s*/, ''),
        text: `Check out ${event.title} at Dayananda Sagar University!`,
        url
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Event link copied to clipboard');
    }
  };

  const hasActiveFilters = Boolean(
    search ||
    (category && category !== 'All') ||
    schoolParam ||
    venueParam ||
    from ||
    to ||
    sort !== 'soonest'
  );

  let displayedEvents = category === 'Saved'
    ? events.filter((ev) => savedIds.includes(ev._id))
    : events;

  if (schoolParam) {
    displayedEvents = displayedEvents.filter((ev) =>
      ev.organizerClub?.toLowerCase().includes(schoolParam.toLowerCase()) ||
      ev.description?.toLowerCase().includes(schoolParam.toLowerCase())
    );
  }

  if (venueParam) {
    displayedEvents = displayedEvents.filter((ev) =>
      ev.venue?.toLowerCase().includes(venueParam.toLowerCase())
    );
  }

  const featuredEvent = displayedEvents.length > 0 && page === 1 && !hasActiveFilters && category !== 'Saved'
    ? displayedEvents[0]
    : null;
  const gridEvents = featuredEvent ? displayedEvents.slice(1) : displayedEvents;

  const groupedSchedule = gridEvents.reduce((acc, ev) => {
    const d = new Date(ev.startsAt);
    const dateKey = d.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(ev);
    return acc;
  }, {});

  return (
    <div className="min-h-screen pb-20 bg-[#F7F8FA]">
      {/* Refined Institutional Hero Section */}
      <section className="bg-white border-b border-[#E5E7EB] pt-8 pb-8">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-3">
            <span>Dayananda Sagar University</span>
            <span>/</span>
            <span className="text-[#002B55] font-semibold">Campus Events</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-3xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#002B55] tracking-tight leading-tight">
                Discover Campus Events
              </h1>
              <p className="mt-3 text-base text-slate-600 leading-relaxed max-w-2xl">
                Explore upcoming academic seminars, technical hackathons, cultural festivals, and sports tournaments across Dayananda Sagar University. Book your digital pass using your university USN.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMapModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-[#E5E7EB] bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition"
              >
                <MapPin className="w-4 h-4 text-[#D9A521]" />
                <span>Harohalli Campus Map</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                id="campus-event-search"
                type="text"
                aria-label="Search campus events"
                placeholder="Search by event title, organizer club, or venue..."
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#E5E7EB] focus:border-[#002B55] rounded-lg text-sm text-[#172033] placeholder-slate-400 focus:outline-none transition shadow-2xs"
              />
              {searchDraft && (
                <button
                  type="button"
                  onClick={() => setSearchDraft('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold border transition ${
                filtersOpen || from || to || sort !== 'soonest'
                  ? 'bg-[#002B55] text-white border-[#002B55]'
                  : 'bg-white text-slate-700 border-[#E5E7EB] hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Dates & Filters</span>
            </button>
          </div>

          {/* Date Filter Drawer */}
          {filtersOpen && (
            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-[#E5E7EB] space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Filter by Date & Schedule</span>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-normal text-slate-500 hover:text-[#002B55] underline"
                >
                  Reset filters
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label htmlFor="filter-from" className="block text-slate-600 font-medium mb-1">
                    From Date
                  </label>
                  <input
                    type="date"
                    id="filter-from"
                    value={from}
                    onChange={(e) => updateFilter('from', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#E5E7EB] text-slate-800 focus:outline-none focus:border-[#002B55]"
                  />
                </div>
                <div>
                  <label htmlFor="filter-to" className="block text-slate-600 font-medium mb-1">
                    To Date
                  </label>
                  <input
                    type="date"
                    id="filter-to"
                    value={to}
                    onChange={(e) => updateFilter('to', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#E5E7EB] text-slate-800 focus:outline-none focus:border-[#002B55]"
                  />
                </div>
                <div>
                  <label htmlFor="filter-sort" className="block text-slate-600 font-medium mb-1">
                    Sort Order
                  </label>
                  <select
                    id="filter-sort"
                    value={sort}
                    onChange={(e) => updateFilter('sort', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#E5E7EB] text-slate-800 focus:outline-none focus:border-[#002B55]"
                  >
                    <option value="soonest">Chronological (Soonest first)</option>
                    <option value="latest">Latest scheduled</option>
                    <option value="title">Alphabetical (A - Z)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Category Navigation Pills */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
                    category === cat || (cat === 'All' && !category)
                      ? 'bg-[#002B55] text-white'
                      : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-[#E5E7EB]'
                  }`}
                >
                  {cat}
                </button>
              ))}

              <button
                type="button"
                onClick={() => updateFilter('category', 'Saved')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                  category === 'Saved'
                    ? 'bg-[#002B55] text-white'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-[#E5E7EB]'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5 text-[#D9A521]" />
                <span>Saved ({savedIds.length})</span>
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-[#E5E7EB] text-slate-500">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition ${
                  viewMode === 'grid' ? 'bg-white text-[#002B55] shadow-xs' : 'hover:text-slate-900'
                }`}
                title="Grid View"
                aria-label="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('schedule')}
                className={`p-1.5 rounded-md transition ${
                  viewMode === 'schedule' ? 'bg-white text-[#002B55] shadow-xs' : 'hover:text-slate-900'
                }`}
                title="Schedule View"
                aria-label="Schedule View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Filter Indicators */}
          {(schoolParam || venueParam) && (
            <div className="mt-3 flex items-center gap-2 text-xs">
              <span className="text-slate-500">Active filter:</span>
              {schoolParam && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-blue-50 text-[#002B55] font-medium border border-blue-200">
                  School: {schoolParam}
                  <button type="button" onClick={() => updateFilter('school', '')} className="hover:text-rose-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {venueParam && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-amber-50 text-[#001B36] font-medium border border-amber-200">
                  Venue: {venueParam}
                  <button type="button" onClick={() => updateFilter('venue', '')} className="hover:text-rose-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-2 border-[#002B55] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500">Loading university events...</p>
          </div>
        ) : error ? (
          <div className="dsu-card p-8 text-center max-w-lg mx-auto">
            <p className="text-sm font-medium text-rose-600">{error}</p>
            <button
              type="button"
              onClick={() => setRetry((r) => r + 1)}
              className="mt-4 px-4 py-2 rounded-lg bg-[#002B55] text-white text-xs font-semibold hover:bg-[#001B36] transition"
            >
              Retry
            </button>
          </div>
        ) : displayedEvents.length === 0 ? (
          <div className="dsu-card p-12 text-center max-w-md mx-auto">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-900">No Events Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              There are no campus events matching your criteria. Try adjusting your search or category filters.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 px-4 py-2 rounded-lg bg-[#002B55] text-white text-xs font-medium"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Featured Event Section - Balanced Editorial Composition */}
            {featuredEvent && (
              <section className="dsu-card overflow-hidden shadow-xs hover:shadow-md transition-shadow duration-200">
                <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
                  {/* Left Column (5/12): Carefully proportioned photographic cover */}
                  <div className="lg:col-span-5 relative overflow-hidden bg-slate-100 min-h-[240px] sm:min-h-[280px] lg:min-h-full">
                    <EventArtwork
                      category={featuredEvent.category}
                      title={featuredEvent.title}
                      posterUrl={featuredEvent.posterUrl}
                      className="w-full h-full object-cover object-center"
                      featured={true}
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-md bg-[#002B55] text-white text-xs font-bold shadow-xs">
                        Featured Gathering
                      </span>
                    </div>

                    <div className="absolute top-4 right-4 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => handleToggleBookmark(e, featuredEvent._id)}
                        aria-label={savedIds.includes(featuredEvent._id) ? 'Remove bookmark' : 'Save event'}
                        className="w-8 h-8 rounded-lg bg-white/95 hover:bg-white text-slate-700 flex items-center justify-center shadow-xs transition"
                      >
                        <Bookmark
                          className={`w-4 h-4 ${
                            savedIds.includes(featuredEvent._id) ? 'fill-[#D9A521] text-[#D9A521]' : 'text-slate-600'
                          }`}
                        />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleShare(e, featuredEvent)}
                        aria-label="Share event"
                        className="w-8 h-8 rounded-lg bg-white/95 hover:bg-white text-slate-700 flex items-center justify-center shadow-xs transition"
                      >
                        <Share2 className="w-4 h-4 text-slate-600" />
                      </button>
                    </div>
                  </div>

                  {/* Right Column (7/12): Well-structured editorial metadata & connected CTA */}
                  <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#002B55]/10 text-[#002B55]">
                          {featuredEvent.category}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-md bg-slate-100 text-xs font-semibold text-slate-700">
                          <Calendar className="w-3.5 h-3.5 text-[#002B55]" />
                          <span>
                            {new Date(featuredEvent.startsAt).toLocaleDateString('en-IN', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            })} • {new Date(featuredEvent.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST
                          </span>
                        </span>
                      </div>

                      <h2 className="text-2xl sm:text-3xl font-extrabold text-[#002B55] leading-snug tracking-tight">
                        <Link to={`/events/${featuredEvent._id}`} className="hover:underline">
                          {featuredEvent.title.replace(/^DEMO:\s*/, '')}
                        </Link>
                      </h2>

                      <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                        {featuredEvent.description}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-2 truncate">
                          <MapPin className="w-3.5 h-3.5 text-[#002B55] shrink-0" />
                          <span className="truncate">{featuredEvent.venue}</span>
                        </div>
                        <div className="flex items-center gap-2 truncate">
                          <Building className="w-3.5 h-3.5 text-[#002B55] shrink-0" />
                          <span className="truncate">{featuredEvent.organizerClub || 'Dayananda Sagar University'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Coupled Registration & Availability Bar */}
                    <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50/80 -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 p-5 sm:px-8 rounded-b-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span className="font-bold text-slate-800">
                            {Math.max(0, featuredEvent.capacity - featuredEvent.registeredCount)} of {featuredEvent.capacity} seats remaining
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Free admission with Dayananda Sagar University student USN
                        </p>
                      </div>

                      <Link
                        to={`/events/${featuredEvent._id}`}
                        className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#002B55] hover:bg-[#001B36] text-white text-xs font-bold transition shadow-xs whitespace-nowrap active:scale-[0.98]"
                      >
                        <span>View Details & Register</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Event Listing Grid */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                {gridEvents.map((ev) => {
                  const starts = new Date(ev.startsAt);
                  const isSaved = savedIds.includes(ev._id);
                  const available = Math.max(0, ev.capacity - ev.registeredCount);

                  return (
                    <div
                      key={ev._id}
                      className="dsu-card overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all duration-200"
                    >
                      <div>
                        {/* Cover Image - Strict 16:9 Aspect Ratio with Unique Asset */}
                        <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                          <EventArtwork
                            category={ev.category}
                            title={ev.title}
                            posterUrl={ev.posterUrl}
                            className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-500"
                          />

                          <div className="absolute top-3 left-3">
                            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-[#002B55] text-white shadow-xs">
                              {ev.category}
                            </span>
                          </div>

                          {/* Quick Actions */}
                          <div className="absolute top-3 right-3 flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => handleToggleBookmark(e, ev._id)}
                              aria-label={isSaved ? 'Remove bookmark' : 'Save event'}
                              className="w-7 h-7 rounded-md bg-white/95 hover:bg-white text-slate-700 flex items-center justify-center shadow-xs transition"
                            >
                              <Bookmark
                                className={`w-3.5 h-3.5 ${
                                  isSaved ? 'fill-[#D9A521] text-[#D9A521]' : 'text-slate-600'
                                }`}
                              />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleShare(e, ev)}
                              aria-label="Share event"
                              className="w-7 h-7 rounded-md bg-white/95 hover:bg-white text-slate-700 flex items-center justify-center shadow-xs transition"
                            >
                              <Share2 className="w-3.5 h-3.5 text-slate-600" />
                            </button>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 space-y-2.5">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#002B55]">
                            <Calendar className="w-3.5 h-3.5 text-[#002B55]" />
                            <span>
                              {starts.toLocaleDateString('en-IN', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })} IST
                            </span>
                          </div>

                          <h3 className="font-bold text-[#172033] text-base leading-snug group-hover:text-[#002B55] transition line-clamp-2 min-h-[2.75rem]">
                            <Link to={`/events/${ev._id}`}>{ev.title.replace(/^DEMO:\s*/, '')}</Link>
                          </h3>

                          <div className="space-y-1 text-xs text-slate-500 pt-1">
                            <div className="flex items-center gap-1.5 truncate">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{ev.venue}</span>
                            </div>
                            <div className="flex items-center gap-1.5 truncate">
                              <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{ev.organizerClub || 'Dayananda Sagar University'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer - Consistent Action Placement */}
                      <div className="px-5 py-3.5 border-t border-slate-100 mt-auto flex items-center justify-between">
                        <div className="text-xs font-semibold">
                          {available > 0 ? (
                            <span className="inline-flex items-center gap-1.5 text-emerald-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              <span>{available} seats left</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-rose-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                              <span>Full Capacity</span>
                            </span>
                          )}
                        </div>

                        <Link
                          to={`/events/${ev._id}`}
                          className="px-3.5 py-1.5 rounded-lg bg-slate-50 hover:bg-[#002B55] hover:text-white text-[#002B55] border border-[#E5E7EB] text-xs font-bold transition flex items-center gap-1"
                        >
                          <span>View Details</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Schedule View */
              <div className="space-y-6">
                {Object.entries(groupedSchedule).map(([dateLabel, items]) => (
                  <div key={dateLabel} className="space-y-3">
                    <div className="sticky top-20 z-20 bg-[#F7F8FA]/95 py-2 border-b border-[#E5E7EB]">
                      <span className="text-xs font-semibold text-[#002B55] bg-white px-3 py-1 rounded-md border border-[#E5E7EB]">
                        {dateLabel}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {items.map((ev) => (
                        <div
                          key={ev._id}
                          className="dsu-card p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                        >
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="font-semibold text-[#002B55]">{ev.category}</span>
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-500">
                                {new Date(ev.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST
                              </span>
                            </div>

                            <h4 className="font-semibold text-base text-[#172033] hover:text-[#002B55] transition truncate">
                              <Link to={`/events/${ev._id}`}>{ev.title.replace(/^DEMO:\s*/, '')}</Link>
                            </h4>

                            <p className="text-xs text-slate-500 flex items-center gap-3 truncate">
                              <span>{ev.venue}</span>
                              <span className="text-slate-300">•</span>
                              <span>{ev.organizerClub || 'DSU Department'}</span>
                            </p>
                          </div>

                          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                            <span className="text-xs text-slate-500">
                              {Math.max(0, ev.capacity - ev.registeredCount)} seats remaining
                            </span>
                            <Link
                              to={`/events/${ev._id}`}
                              className="px-4 py-2 rounded-lg bg-[#002B55] text-white text-xs font-semibold hover:bg-[#001B36] transition"
                            >
                              View Event
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Campus Map Navigator Modal */}
      <CampusMapModal
        isOpen={mapModalOpen}
        onClose={() => setMapModalOpen(false)}
        currentEvents={events}
        onSelectVenue={(venueName) => {
          updateFilter('venue', venueName);
        }}
      />
    </div>
  );
}
