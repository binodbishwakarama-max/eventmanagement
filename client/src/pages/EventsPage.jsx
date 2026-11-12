import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiClient } from '../api/client';
import { EventArtwork } from '../components/EventArtwork';
import { CampusMapModal } from '../components/CampusMapModal';
import {
  Button,
  EventCardSkeleton,
  EmptyState,
  ErrorState
} from '../components/ui';
import {
  buildEventQueryParams,
  cleanEventTitle
} from '../features/events/utils/eventFilters';
import {
  getSavedEventIds,
  toggleSaveEvent
} from '../utils/bookmarks';
import {
  Search,
  MapPin,
  Calendar,
  Building,
  ArrowRight,
  SlidersHorizontal,
  X,
  LayoutGrid,
  List,
  Bookmark,
  Share2,
  Sparkles,
  Code2,
  Palette,
  Music2,
  Trophy,
  GraduationCap,
  Compass,
  Play,
  Youtube,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORY_ITEMS = [
  { name: 'All', label: 'All Gatherings', icon: Sparkles },
  { name: 'Technical', label: 'Technical & AI', icon: Code2 },
  { name: 'Workshop', label: 'Design & Labs', icon: Palette },
  { name: 'Cultural', label: 'Cultural & Music', icon: Music2 },
  { name: 'Sports', label: 'Varsity Sports', icon: Trophy },
  { name: 'Seminar', label: 'Conferences', icon: GraduationCap }
];

const DSU_OFFICIAL_VIDEOS = [
  {
    id: 'e_ggPsSGwu0',
    title: 'TARANGA 2026 | Annual Collegiate Cultural Extravaganza',
    category: 'Cultural Fest',
    organizer: 'Centre for Performing Arts (CPA)',
    duration: 'Festival Highlights',
    description: "Dayananda Sagar University's flagship cultural extravaganza featuring music ensembles, fashion spectacles, battle of the bands, and celebrity concert nights.",
    thumbnail: '/thumb-taranga.jpg'
  },
  {
    id: 'V-GfxWGafvo',
    title: 'Harohalli Main Campus | World-Class 130-Acre Campus Tour',
    category: 'Campus Tour',
    organizer: 'Dayananda Sagar University Official',
    duration: 'Aerial & Ground Tour',
    description: "Experience the sprawling green Harohalli Main Campus on Kanakapura Road, advanced research centers, School of Engineering, and modern sports complexes.",
    thumbnail: '/thumb-campus-tour.jpg'
  },
  {
    id: 'Ob7ysjkBJsk',
    title: 'DSU Engineering & Innovation Showcase | Tech Labs & Maker Spaces',
    category: 'Technical Symposium',
    organizer: 'School of Engineering & Technology',
    duration: 'Collegiate Sprint',
    description: 'HackGrid maker sprint highlights, AI & autonomous systems demonstrations, student robotics exhibitions, and faculty keynote colloquiums.',
    thumbnail: '/thumb-engineering.jpg'
  }
];

const DSU_CAMPUS_VIEWS = [
  {
    id: 'dsu-main-campus-admission',
    title: 'Harohalli Main Campus & Academic Blocks',
    subheading: 'Dayananda Sagar University Main Campus',
    caption: 'Official 130-Acre Harohalli Campus Architecture & Academic Blocks',
    description: 'The sprawling official campus along Kanakapura Road, Bengaluru, housing world-class engineering, health sciences, computing laboratories, and innovation research centers.',
    image: '/dsu-main-campus-admission.jpg',
    tag: 'Flagship Campus'
  },
  {
    id: 'engineering-main',
    title: 'School of Engineering & Main Gate',
    subheading: 'Main Entrance & Administrative Tower',
    caption: 'Iconic 8-Story Academic & Administrative Complex',
    description: 'State-of-the-art engineering laboratories, high-performance computing centers, executive dean offices, and modern lecture theaters at Harohalli.',
    image: '/dsu-harohalli-main.jpg',
    tag: 'Academic Landmark'
  },
  {
    id: 'campus-aerial',
    title: '130-Acre Harohalli Main Campus',
    subheading: 'Kanakapura Road, Bengaluru',
    caption: 'Panoramic Aerial Grounds & Green Terraces',
    description: 'Vast lush green grounds housing collegiate stadiums, student residential complexes, innovation parks, and central manicured lawns.',
    image: '/dsu-campus-aerial.jpg',
    tag: 'Sprawling Campus'
  },
  {
    id: 'campus-quad',
    title: 'Academic Quadrangle & Innovation Labs',
    subheading: 'Central Academic Plaza',
    caption: 'Student Collaboration Courtyards & Tech Corridors',
    description: 'Home to the AIC-DSU Innovation Foundation, startup incubation cells, robotics maker studios, and open-air student amphitheater plazas.',
    image: '/dsu-campus-quad.jpg',
    tag: 'Innovation Hub'
  },
  {
    id: 'auditorium-arenas',
    title: 'Sir M. Visvesvaraya Auditorium & Arenas',
    subheading: 'Cultural & Athletics Complex',
    caption: 'Cultural & Collegiate Varsity Athletic Arenas',
    description: 'Acoustically engineered 850-seat auditorium for Taranga cultural fests and FIFA-spec synthetic athletic turf for inter-varsity championships.',
    image: '/dsu-campus-auditorium.jpg',
    tag: 'Events & Athletics'
  }
];

export function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchDraft, setSearchDraft] = useState(searchParams.get('search') || '');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'schedule'
  const [savedIds, setSavedIds] = useState(getSavedEventIds());
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);
  const [activeCampusViewIdx, setActiveCampusViewIdx] = useState(0);

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

  useEffect(() => {
    if (!activeVideo) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveVideo(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeVideo]);

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
        const params = buildEventQueryParams({
          page,
          limit: 12,
          search,
          category,
          school: schoolParam,
          venue: venueParam,
          from,
          to,
          sort
        });

        const res = await apiClient.get('/events', { params, signal: controller.signal });
        const items = res.data?.data?.items || [];
        setEvents(items);
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
  }, [search, category, schoolParam, venueParam, page, from, to, sort, retry]);

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
    const cleanTitle = cleanEventTitle(event.title);
    const url = `${window.location.origin}/events/${event._id}`;
    if (navigator.share) {
      navigator.share({
        title: cleanTitle,
        text: `Explore ${cleanTitle} at Dayananda Sagar University`,
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
    <div className="min-h-screen pb-24 bg-[#F8FAFC] relative">
      {/* Subtle Panoramic DSU Campus Backdrop Watermark across the page body (Desktop only to prevent redundant mobile downloads) */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat opacity-[0.06] filter grayscale-0 hidden sm:block dsu-campus-watermark"
      />

      {/* Mobile-First Streamlined Hero Section */}
      <section className="relative overflow-hidden bg-[#000E1C] text-white pt-6 sm:pt-10 pb-8 sm:pb-16 border-b border-[#002B55] z-10">
        <picture>
          <source
            media="(max-width: 767px)"
            type="image/webp"
            srcSet="/dsu-campus-hero-mobile.webp 800w, /dsu-campus-hero-mobile-2x.webp 1280w"
            sizes="(max-width: 767px) 100vw, 800px"
          />
          <source
            media="(max-width: 767px)"
            srcSet="/dsu-campus-hero-mobile.jpg 800w, /dsu-campus-hero-mobile-2x.jpg 1280w"
            sizes="(max-width: 767px) 100vw, 800px"
          />
          <source
            media="(min-width: 1921px)"
            type="image/webp"
            srcSet="/dsu-campus-hero-2560.webp 2560w, /dsu-campus-hero-4k.webp 3840w"
            sizes="100vw"
          />
          <source
            media="(min-width: 1921px)"
            srcSet="/dsu-campus-hero-2560.jpg 2560w, /dsu-campus-hero-4k.jpg 3840w"
            sizes="100vw"
          />
          <source
            media="(min-width: 768px)"
            type="image/webp"
            srcSet="/dsu-campus-hero-tablet.webp 1280w, /dsu-campus-hero-desktop.webp 1920w"
            sizes="(max-width: 1280px) 100vw, 1920px"
          />
          <source
            media="(min-width: 768px)"
            srcSet="/dsu-campus-hero-tablet.jpg 1280w, /dsu-campus-hero-desktop.jpg 1920w"
            sizes="(max-width: 1280px) 100vw, 1920px"
          />
          <img
            src="/dsu-main-campus-admission.jpg"
            alt="Dayananda Sagar University Harohalli Main Campus"
            className="absolute inset-0 w-full h-full object-cover object-center sm:object-[right_center] opacity-40 sm:opacity-50 pointer-events-none"
            fetchPriority="high"
            decoding="async"
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-[#000E1C] via-[#000E1C]/85 to-transparent pointer-events-none" />

        <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            {/* Left Column: Clean Streamlined Headline & Copy */}
            <div className="md:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[11px] font-semibold backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-[#D9A521] animate-pulse" />
                <span>Dayananda Sagar University • Official Events</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                DSU Campus Events
              </h1>
              <p className="text-slate-300 text-xs sm:text-base leading-relaxed max-w-xl font-normal">
                Discover university hackathons, conferences, and cultural festivals across Harohalli Main Campus.
              </p>
            </div>

            {/* Right Column: Lightweight Campus Card */}
            <div className="md:col-span-4 hidden md:flex justify-end">
              <div className="w-full max-w-xs p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#F5C84C] uppercase text-[10px] tracking-wider">Harohalli Campus</span>
                  <span className="px-1.5 py-0.5 rounded bg-black/40 text-[10px] font-mono border border-white/20">NAAC A+</span>
                </div>
                <p className="text-xs text-slate-200 leading-snug">
                  130-Acre Campus • Kanakapura Road, Bengaluru
                </p>
                <button
                  type="button"
                  onClick={() => setMapModalOpen(true)}
                  className="w-full py-2 px-3 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#F5C84C]" />
                  <span>Campus Map & Venues</span>
                </button>
              </div>
            </div>
          </div>

          {/* Full-Width Search & Filter Command Bar (Cleanly separated below 2-column grid) */}
          <div className="w-full bg-white/95 backdrop-blur-xl rounded-2xl p-2.5 sm:p-3 shadow-2xl border border-white/20 apple-stagger-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              {/* Search input with shortcut hint */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="campus-event-search"
                  type="text"
                  aria-label="Search campus events"
                  placeholder="Search events by title, organizing club, department, or venue..."
                  value={searchDraft}
                  onChange={(e) => setSearchDraft(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-white border border-slate-200 focus:border-[#002B55] rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002B55]/10 transition-all duration-200 shadow-2xs font-medium"
                />
                {searchDraft ? (
                  <button
                    type="button"
                    onClick={() => setSearchDraft('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 apple-press"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <kbd className="hidden sm:inline-flex absolute right-3.5 top-1/2 -translate-y-1/2 px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-400 bg-slate-100 border border-slate-200 rounded">
                    /
                  </kbd>
                )}
              </div>

              {/* Action Buttons: Side-by-side on mobile phones, flex row on tablet/desktop */}
              <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setMapModalOpen(true)}
                  className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition shrink-0 apple-press"
                >
                  <Compass className="w-4 h-4 text-[#D9A521] shrink-0" />
                  <span className="truncate">Campus Venues</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFiltersOpen(!filtersOpen)}
                  className={`inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs font-bold border transition shrink-0 apple-press ${
                    filtersOpen || from || to || sort !== 'soonest'
                      ? 'bg-[#002B55] text-white border-[#002B55] shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4 shrink-0" />
                  <span>Filters {hasActiveFilters && '•'}</span>
                </button>
              </div>
            </div>

            {/* Expandable Filter Drawer */}
            {filtersOpen && (
              <div className="mt-3 pt-3 border-t border-slate-200 p-3 rounded-xl bg-slate-50 space-y-3 apple-modal-spring">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>Filter by Date & Schedule</span>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-xs font-semibold text-[#002B55] hover:underline"
                  >
                    Reset all filters
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label htmlFor="filter-from" className="block text-slate-600 font-semibold mb-1">
                      From Date
                    </label>
                    <input
                      type="date"
                      id="filter-from"
                      value={from}
                      onChange={(e) => updateFilter('from', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-[#002B55] font-medium"
                    />
                  </div>
                  <div>
                    <label htmlFor="filter-to" className="block text-slate-600 font-semibold mb-1">
                      To Date
                    </label>
                    <input
                      type="date"
                      id="filter-to"
                      value={to}
                      onChange={(e) => updateFilter('to', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-[#002B55] font-medium"
                    />
                  </div>
                  <div>
                    <label htmlFor="filter-sort" className="block text-slate-600 font-semibold mb-1">
                      Sort Order
                    </label>
                    <select
                      id="filter-sort"
                      value={sort}
                      onChange={(e) => updateFilter('sort', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-[#002B55] font-medium"
                    >
                      <option value="soonest">Chronological (Soonest first)</option>
                      <option value="latest">Latest scheduled</option>
                      <option value="title">Alphabetical (A - Z)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Modern Category Selector & View Switcher Bar */}
      <section className="sticky top-16 sm:top-20 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3">
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            {/* Category Pills with Icons (Fluid horizontal scroll with momentum) */}
            <div className="flex-1 min-w-0 flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none overscroll-x-contain">
              {CATEGORY_ITEMS.map((item) => {
                const Icon = item.icon;
                const isSelected = category === item.name || (item.name === 'All' && !category);

                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => handleCategoryChange(item.name)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap apple-press ${
                      isSelected
                        ? 'bg-[#002B55] text-white shadow-soft scale-[1.02]'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#F5C84C]' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              {/* Saved Bookmarks Pill */}
              <button
                type="button"
                onClick={() => updateFilter('category', 'Saved')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap apple-press ${
                  category === 'Saved'
                    ? 'bg-[#002B55] text-white shadow-soft scale-[1.02]'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${category === 'Saved' ? 'fill-[#F5C84C] text-[#F5C84C]' : 'text-[#D9A521]'}`} />
                <span>Saved ({savedIds.length})</span>
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-slate-500">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 apple-press ${
                  viewMode === 'grid' ? 'bg-white text-[#002B55] shadow-xs' : 'hover:text-slate-900'
                }`}
                title="Grid View"
                aria-label="Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('schedule')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 apple-press ${
                  viewMode === 'schedule' ? 'bg-white text-[#002B55] shadow-xs' : 'hover:text-slate-900'
                }`}
                title="Schedule View"
                aria-label="Schedule View"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Schedule</span>
              </button>
            </div>
          </div>

          {/* Active Filter Indicators */}
          {(schoolParam || venueParam) && (
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Active filter:</span>
              {schoolParam && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#002B55] font-semibold border border-blue-200">
                  School: {schoolParam}
                  <button type="button" onClick={() => updateFilter('school', '')} className="hover:text-rose-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {venueParam && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-[#001B36] font-semibold border border-amber-200">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="py-12">
            <ErrorState
              title="Campus Events Unavailable"
              message={error}
              onRetry={() => setRetry((r) => r + 1)}
            />
          </div>
        ) : displayedEvents.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={Calendar}
              title="No Campus Events Found"
              description="There are no university symposiums, workshops, or activities matching your criteria. Try adjusting your query or resetting all filters."
              action={
                <Button variant="secondary" onClick={clearFilters}>
                  Reset All Filters
                </Button>
              }
            />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Featured Event Section - Editorial Showcase */}
            {featuredEvent && (() => {
              const starts = new Date(featuredEvent.startsAt);
              const available = Math.max(0, featuredEvent.capacity - featuredEvent.registeredCount);
              const fillPercent = Math.min(100, Math.round((featuredEvent.registeredCount / featuredEvent.capacity) * 100));
              const title = cleanEventTitle(featuredEvent.title);

              return (
                <section className="dsu-card overflow-hidden border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all duration-300">
                  <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
                    {/* Left Column (5/12): Photographic Cover */}
                    <div className="lg:col-span-5 relative overflow-hidden bg-slate-100 min-h-[260px] sm:min-h-[300px] lg:min-h-full group">
                      <EventArtwork
                        category={featuredEvent.category}
                        title={featuredEvent.title}
                        posterUrl={featuredEvent.posterUrl}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                        featured={true}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                      {/* Top Badges */}
                      <div className="absolute top-4 left-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00142A]/90 backdrop-blur-md text-[#F5C84C] text-xs font-bold border border-[#D9A521]/40 shadow-xs">
                          <Sparkles className="w-3.5 h-3.5 text-[#D9A521]" />
                          <span>Featured Gathering</span>
                        </span>
                      </div>

                      <div className="absolute top-4 right-4 flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => handleToggleBookmark(e, featuredEvent._id)}
                          aria-label={savedIds.includes(featuredEvent._id) ? 'Remove bookmark' : 'Save event'}
                          className="w-8 h-8 rounded-full bg-white/95 hover:bg-white text-slate-700 flex items-center justify-center shadow-xs transition active:scale-95"
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
                          className="w-8 h-8 rounded-full bg-white/95 hover:bg-white text-slate-700 flex items-center justify-center shadow-xs transition active:scale-95"
                        >
                          <Share2 className="w-4 h-4 text-slate-600" />
                        </button>
                      </div>

                      {/* Bottom Floating Pill inside Photo */}
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <span className="text-[11px] font-mono tracking-wider uppercase text-slate-200 block mb-0.5">
                          Official Campus Schedule
                        </span>
                        <div className="flex items-center gap-2 text-xs font-semibold">
                          <Calendar className="w-3.5 h-3.5 text-[#F5C84C]" />
                          <span>
                            {starts.toLocaleDateString('en-IN', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            })} • {starts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Clean Metadata & Primary Action */}
                    <div className="lg:col-span-7 p-5 sm:p-7 flex flex-col justify-between space-y-4 bg-white">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#002B55] text-white">
                            {featuredEvent.category}
                          </span>
                          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            {available > 0 ? `${available} seats remaining` : 'Full capacity'}
                          </span>
                        </div>

                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug tracking-tight">
                          <Link to={`/events/${featuredEvent._id}`} className="hover:text-[#002B55]">
                            {title}
                          </Link>
                        </h2>

                        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                          {featuredEvent.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-2 border-t border-slate-100">
                          <div className="flex items-center gap-1.5 font-medium text-slate-800">
                            <Calendar className="w-3.5 h-3.5 text-[#002B55] shrink-0" />
                            <span>
                              {starts.toLocaleDateString('en-IN', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{featuredEvent.venue}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500">
                          {featuredEvent.organizerClub || 'DSU Student Affairs'}
                        </span>
                        <Link
                          to={`/events/${featuredEvent._id}`}
                          className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#002B55] hover:bg-[#001D3A] text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-xs active:scale-95"
                        >
                          <span>Register for Event</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </section>
              );
            })()}

            {/* Event Listing Grid */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                {gridEvents.map((ev) => {
                  const starts = new Date(ev.startsAt);
                  const isSaved = savedIds.includes(ev._id);
                  const available = Math.max(0, ev.capacity - ev.registeredCount);
                  const fillPercent = Math.min(100, Math.round((ev.registeredCount / ev.capacity) * 100));
                  const cleanTitleText = cleanEventTitle(ev.title);

                  return (
                    <div
                      key={ev._id}
                      className="apple-card bg-white rounded-2xl overflow-hidden flex flex-col justify-between group border border-slate-200/90 shadow-soft"
                    >
                      <div>
                        {/* Cover Image - 16:9 Aspect Ratio with Unique Asset */}
                        <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                          <EventArtwork
                            category={ev.category}
                            title={ev.title}
                            posterUrl={ev.posterUrl}
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />

                          {/* Floating Date Badge (Top-Left) */}
                          <div className="absolute top-3 left-3 rounded-xl bg-white/95 backdrop-blur-md px-2.5 py-1 text-center shadow-xs border border-white/60">
                            <span className="block text-[10px] font-mono font-extrabold text-[#D9A521] uppercase leading-none">
                              {starts.toLocaleDateString('en-IN', { month: 'short' })}
                            </span>
                            <span className="block text-sm font-extrabold text-[#002B55] leading-tight">
                              {starts.getDate()}
                            </span>
                          </div>

                          {/* Floating Category Badge (Top-Right) */}
                          <div className="absolute top-3 right-3 flex items-center gap-1.5">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#00142A]/85 backdrop-blur-md text-white border border-white/20 shadow-xs">
                              {ev.category}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleToggleBookmark(e, ev._id)}
                              aria-label={isSaved ? 'Remove bookmark' : 'Save event'}
                              className="w-7 h-7 rounded-full bg-white/95 hover:bg-white text-slate-700 flex items-center justify-center shadow-xs transition apple-press"
                            >
                              <Bookmark
                                className={`w-3.5 h-3.5 transition-transform active:scale-125 ${
                                  isSaved ? 'fill-[#D9A521] text-[#D9A521]' : 'text-slate-600'
                                }`}
                              />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleShare(e, ev)}
                              aria-label="Share event"
                              className="w-7 h-7 rounded-full bg-white/95 hover:bg-white text-slate-700 flex items-center justify-center shadow-xs transition apple-press"
                            >
                              <Share2 className="w-3.5 h-3.5 text-slate-600" />
                            </button>
                          </div>
                        </div>

                        {/* Card Body - Streamlined: Image, Title, Date, Venue, Registration Status / Seats */}
                        <div className="p-4 sm:p-5 space-y-2.5">
                          {/* Event Title */}
                          <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-[#002B55] transition line-clamp-2 min-h-[2.5rem]">
                            <Link to={`/events/${ev._id}`}>{cleanTitleText}</Link>
                          </h3>

                          {/* Date & Venue */}
                          <div className="space-y-1 text-xs text-slate-600">
                            <div className="flex items-center gap-1.5 font-medium text-slate-700">
                              <Calendar className="w-3.5 h-3.5 text-[#002B55] shrink-0" />
                              <span>
                                {starts.toLocaleDateString('en-IN', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric'
                                })} • {starts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 truncate text-slate-500">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{ev.venue}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer: Registration Status & 1 Primary Action */}
                      <div className="px-4 sm:px-5 py-3 border-t border-slate-100 mt-auto flex items-center justify-between bg-slate-50/50">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                          available > 0
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {available > 0 ? `${available} seats open` : 'Full capacity'}
                        </span>

                        <Link
                          to={`/events/${ev._id}`}
                          className="min-h-[38px] px-4 py-1.5 rounded-xl bg-[#002B55] hover:bg-[#001D3A] text-white text-xs font-semibold transition flex items-center gap-1 shadow-xs active:scale-95"
                        >
                          <span>Register</span>
                          <ArrowRight className="w-3.5 h-3.5" />
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
                    <div className="sticky top-20 z-20 bg-[#F8FAFC]/95 backdrop-blur-md py-2 border-b border-slate-200">
                      <span className="text-xs font-extrabold text-[#002B55] bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-2xs">
                        {dateLabel}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {items.map((ev) => {
                        const cleanTitleText = cleanEventTitle(ev.title);
                        const available = Math.max(0, ev.capacity - ev.registeredCount);

                        return (
                          <div
                            key={ev._id}
                            className="dsu-card p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-200"
                          >
                            <div className="space-y-1.5 min-w-0 flex-1">
                              <div className="flex items-center gap-2 text-xs">
                                <span className="font-bold text-[#002B55] bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                                  {ev.category}
                                </span>
                                <span className="text-slate-300">•</span>
                                <span className="text-slate-600 font-medium">
                                  {new Date(ev.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST
                                </span>
                              </div>

                              <h4 className="font-extrabold text-base text-slate-900 hover:text-[#002B55] transition truncate">
                                <Link to={`/events/${ev._id}`}>{cleanTitleText}</Link>
                              </h4>

                              <p className="text-xs text-slate-500 flex items-center gap-3 truncate">
                                <span>{ev.venue}</span>
                                <span className="text-slate-300">•</span>
                                <span>{ev.organizerClub || 'DSU Student Affairs'}</span>
                              </p>
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                              <span className="text-xs font-semibold text-slate-600">
                                {available > 0 ? `${available} seats left` : 'Full Capacity'}
                              </span>
                              <Link
                                to={`/events/${ev._id}`}
                                className="px-4 py-2 rounded-xl bg-[#002B55] text-white text-xs font-bold hover:bg-[#001B36] transition shadow-xs"
                              >
                                View Event
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* DSU in Action: Official Event Videos & Campus Highlights */}
        <section className="mt-20 pt-12 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-200 mb-3">
                <Youtube className="w-3.5 h-3.5 text-red-600" />
                <span>DSU Media & Event Highlights</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#002B55] tracking-tight">
                Experience DSU in Action
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-2xl">
                Watch official highlights from annual collegiate festivals, robotics sprints, technical symposia, and campus life across Harohalli Main Campus.
              </p>
            </div>

            <a
              href="https://www.youtube.com/results?search_query=Dayananda+Sagar+University"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#002B55] hover:text-[#D9A521] transition"
            >
              <span>Explore Official YouTube Channel</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DSU_OFFICIAL_VIDEOS.map((video) => (
              <div
                key={video.id}
                className="dsu-card overflow-hidden flex flex-col justify-between group hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 border border-slate-200/90"
              >
                <div>
                  {/* Video Thumbnail & Play Button Overlay */}
                  <div
                    onClick={() => setActiveVideo(video)}
                    className="relative aspect-video w-full overflow-hidden bg-slate-900 cursor-pointer"
                  >
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 group-hover:from-black/40 transition-colors pointer-events-none" />

                    {/* Category Pill */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#00142A]/85 backdrop-blur-md text-white border border-white/20 shadow-xs">
                        {video.category}
                      </span>
                    </div>

                    {/* Duration Chip */}
                    <div className="absolute bottom-3 right-3 bg-black/80 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                      {video.duration}
                    </div>

                    {/* Centered Pulsing Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-[#D9A521] text-[#001B36] flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-[#F5C84C] transition-all duration-300">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Video Body */}
                  <div className="p-5 space-y-2">
                    <span className="text-[11px] font-semibold text-slate-500 block truncate">
                      {video.organizer}
                    </span>
                    <h3
                      onClick={() => setActiveVideo(video)}
                      className="font-extrabold text-slate-900 text-sm leading-snug group-hover:text-[#002B55] transition line-clamp-2 cursor-pointer"
                    >
                      {video.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {video.description}
                    </p>
                  </div>
                </div>

                {/* Card Action */}
                <div className="px-5 py-3 border-t border-slate-100 mt-auto flex items-center justify-between bg-slate-50/50">
                  <a
                    href={`https://www.youtube.com/watch?v=${video.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-red-600 transition"
                    title="Watch directly on YouTube"
                  >
                    <Youtube className="w-3.5 h-3.5 text-red-600" />
                    <span>YouTube</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setActiveVideo(video)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#002B55] hover:text-[#001B36] active:scale-95 transition"
                  >
                    <span>Watch Highlight</span>
                    <Play className="w-3 h-3 fill-current" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Harohalli Main Campus Interactive Landmark Showcase */}
        <section className="mt-20 dsu-card overflow-hidden border border-slate-200/90 shadow-card">
          <div className="p-6 sm:p-8 bg-white border-b border-slate-200 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#002B55] text-xs font-bold border border-blue-200 mb-2.5">
                <Building className="w-3.5 h-3.5 text-[#D9A521]" />
                <span>Dayananda Sagar University • Main Campus Grounds</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#002B55] tracking-tight">
                Harohalli Main Campus Landmarks
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
                Explore authentic campus architecture, academic wings, the 850-seat auditorium, and collegiate athletics complex spanning 130 acres on Kanakapura Road, Bengaluru.
              </p>
            </div>

            {/* Quick Campus Switcher Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
              {DSU_CAMPUS_VIEWS.map((view, idx) => (
                <button
                  key={view.id}
                  type="button"
                  onClick={() => setActiveCampusViewIdx(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    activeCampusViewIdx === idx
                      ? 'bg-[#002B55] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  {view.title.split('&')[0].trim()}
                </button>
              ))}
            </div>
          </div>

          {/* Active Panoramic Landmark Feature */}
          {(() => {
            const currentView = DSU_CAMPUS_VIEWS[activeCampusViewIdx];
            return (
              <div className="relative min-h-[460px] sm:min-h-[520px] flex items-end p-6 sm:p-10 text-white overflow-hidden group">
                <img
                  key={currentView.id}
                  src={currentView.image}
                  alt={currentView.title}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000 animate-in fade-in"
                />
                {/* Lighter gradient overlay: keeps the top 75% of the photo 100% luminous & unobstructed */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#000E1C] via-transparent to-black/25 pointer-events-none" />

                {/* Floating Optical Glass Card for Details */}
                <div className="relative z-10 max-w-2xl bg-[#001020]/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/20 shadow-2xl space-y-3.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D9A521] text-[#001020] text-xs font-extrabold shadow-xs uppercase tracking-wider font-mono">
                      {currentView.tag}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/15 border border-white/20 text-white text-xs font-semibold backdrop-blur-md">
                      {currentView.subheading}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                    {currentView.caption}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-xl">
                    {currentView.description}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setMapModalOpen(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#002B55] text-xs font-bold hover:bg-slate-100 transition shadow-xs active:scale-95"
                    >
                      <Compass className="w-4 h-4 text-[#D9A521]" />
                      <span>Explore Interactive Campus Plan</span>
                    </button>
                    <Link
                      to="/events?venue=Harohalli"
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold backdrop-blur-md transition active:scale-95"
                    >
                      <span>Events at this Venue</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Interactive Thumbnail Gallery Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 p-3.5 bg-[#001020] border-t border-slate-800">
            {DSU_CAMPUS_VIEWS.map((view, idx) => (
              <button
                key={view.id}
                type="button"
                onClick={() => setActiveCampusViewIdx(idx)}
                className={`relative rounded-xl overflow-hidden aspect-[16/9] border-2 transition text-left group ${
                  activeCampusViewIdx === idx
                    ? 'border-[#D9A521] ring-2 ring-[#D9A521]/60 shadow-lg scale-[1.02]'
                    : 'border-white/10 opacity-75 hover:opacity-100 hover:border-white/30'
                }`}
              >
                <img
                  src={view.image}
                  alt={view.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <span className="absolute bottom-1.5 left-2 right-2 text-[10px] font-bold text-white truncate block drop-shadow-sm">
                  {view.title}
                </span>
              </button>
            ))}
          </div>
        </section>
      </main>

      {/* Interactive YouTube Video Modal */}
      {activeVideo && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="video-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveVideo(null);
          }}
        >
          <div className="relative w-full max-w-4xl bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/15 flex flex-col">
            <div className="p-4 bg-[#00142A] text-white flex items-center justify-between border-b border-white/10 gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <Youtube className="w-5 h-5 text-red-500 shrink-0" />
                <div className="min-w-0">
                  <h3 id="video-modal-title" className="font-bold text-sm text-white truncate max-w-xs sm:max-w-md lg:max-w-lg">
                    {activeVideo.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono truncate">{activeVideo.organizer}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`https://www.youtube.com/watch?v=${activeVideo.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition shadow-sm active:scale-95"
                  title="Open video on YouTube"
                >
                  <span className="hidden sm:inline">Watch on YouTube</span>
                  <span className="sm:hidden">YouTube</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => setActiveVideo(null)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
                  aria-label="Close video"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeVideo.id}?autoplay=1&rel=0&enablejsapi=1`}
                title={activeVideo.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>

            {/* Fallback & Context footer */}
            <div className="px-4 py-2.5 bg-[#000E1C] border-t border-white/10 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
              <p className="line-clamp-1 text-slate-300 max-w-xl">
                {activeVideo.description}
              </p>
              <a
                href={`https://www.youtube.com/watch?v=${activeVideo.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#D9A521] hover:underline font-semibold shrink-0 inline-flex items-center gap-1"
              >
                <span>Direct YouTube link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

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
