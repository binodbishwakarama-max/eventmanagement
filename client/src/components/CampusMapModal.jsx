import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  CheckCircle2,
  Building2,
  ArrowRight
} from 'lucide-react';
import { apiClient } from '../api/client';

export const DSU_CAMPUS_VENUES = [
  {
    id: 'sir-mv-auditorium',
    name: 'Sir M. Visvesvaraya Auditorium',
    block: 'Dr. Premachandra Sagar Academic Block',
    campus: 'Harohalli Main Campus',
    capacity: 850,
    type: 'Auditorium',
    features: ['Line-array acoustics', 'Stage lighting & green rooms', 'Central air conditioning', '850 seated capacity'],
    coords: { x: 43, y: 35 },
    shuttleDist: 'Central Academic Block'
  },
  {
    id: 'cse-innovation-lab',
    name: 'CSE Innovation & Hackathon Lab',
    block: 'Engineering Block 3',
    campus: 'Harohalli Main Campus',
    capacity: 120,
    type: 'Laboratory',
    features: ['Gigabit LAN drops', 'Dual-screen workstations', 'IoT prototyping benches', 'UPS battery backup'],
    coords: { x: 72, y: 53 },
    shuttleDist: 'Tech Corridor - 3 min walk'
  },
  {
    id: 'premachandra-sagar-seminar-hall',
    name: 'Dr. Premachandra Sagar Seminar Hall',
    block: 'Academic Block 1',
    campus: 'Harohalli Main Campus',
    capacity: 300,
    type: 'Seminar Hall',
    features: ['Tiered executive seating', 'Surround sound system', 'Dual 4K projection', 'High-speed campus Wi-Fi'],
    coords: { x: 61, y: 32 },
    shuttleDist: 'Academic Block 1 - 1st Floor'
  },
  {
    id: 'harohalli-central-turf',
    name: 'Harohalli Athletics Complex & Central Turf',
    block: 'Sports Complex',
    campus: 'Harohalli Main Campus',
    capacity: 1500,
    type: 'Sports Arena',
    features: ['FIFA-grade synthetic turf', 'Night match floodlighting', 'Covered spectator pavilion', 'Athletic track'],
    coords: { x: 85, y: 72 },
    shuttleDist: 'East Gate Athletic Pavilion'
  },
  {
    id: 'design-creative-studio',
    name: 'School of Design Creative Studio',
    block: 'Design Block 2',
    campus: 'Harohalli Main Campus',
    capacity: 80,
    type: 'Creative Studio',
    features: ['Modular critique tables', 'Large-format presentation displays', 'Wacom drafting stations', 'Natural daylighting'],
    coords: { x: 20, y: 48 },
    shuttleDist: 'West Wing Design Center'
  },
  {
    id: 'harohalli-open-air-amphitheater',
    name: 'Harohalli Open-Air Amphitheater',
    block: 'Central Quadrangle',
    campus: 'Harohalli Main Campus',
    capacity: 500,
    type: 'Amphitheater',
    features: ['Acoustic performance shell', 'Tiered stone seating', 'Ambient stage lighting', 'Open-air venue'],
    coords: { x: 35, y: 65 },
    shuttleDist: 'Central Quadrangle'
  }
];

export const SAMPLE_VENUES = DSU_CAMPUS_VENUES;

export function CampusMapModal({ isOpen, onClose, onSelectVenue, currentEvents = [] }) {
  const [venues, setVenues] = useState(DSU_CAMPUS_VENUES);
  const [selectedVenue, setSelectedVenue] = useState(DSU_CAMPUS_VENUES[0]);

  useEffect(() => {
    let isMounted = true;
    async function loadVenues() {
      try {
        const res = await apiClient.get('/venues');
        const apiVenues = res.data?.data || [];
        if (isMounted && Array.isArray(apiVenues) && apiVenues.length > 0) {
          // Merge API venues with spatial coordinates
          const mapped = apiVenues.map((v, idx) => {
            const fallback = DSU_CAMPUS_VENUES.find(
              (f) => f.name.toLowerCase() === v.name.toLowerCase() || f.id === v.slug
            ) || DSU_CAMPUS_VENUES[idx % DSU_CAMPUS_VENUES.length];

            return {
              id: v.slug || v._id || `venue-${idx}`,
              name: v.name,
              block: v.building || fallback.block,
              campus: v.campus || fallback.campus,
              capacity: v.capacity || fallback.capacity,
              type: v.venueType || fallback.type,
              features: v.amenities && v.amenities.length > 0 ? v.amenities : fallback.features,
              coords: fallback.coords,
              shuttleDist: fallback.shuttleDist
            };
          });
          setVenues(mapped);
          setSelectedVenue(mapped[0]);
        }
      } catch {
        // Fall back to default DSU_CAMPUS_VENUES
      }
    }

    if (isOpen) {
      loadVenues();
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Find events scheduled at the selected venue
  const scheduledEvents = currentEvents.filter((ev) =>
    ev.venue?.toLowerCase().includes(selectedVenue.name.toLowerCase()) ||
    selectedVenue.name.toLowerCase().includes(ev.venue?.toLowerCase())
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Harohalli Main Campus Venue Explorer"
      onClick={onClose}
      className="fixed inset-0 z-50 dsu-overlay flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-5xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]"
      >
        {/* Map header */}
        <div className="bg-[#002B55] text-white px-6 py-4 flex items-center justify-between border-b border-[#D9A521]/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#001B36] border border-[#D9A521]/40 flex items-center justify-center text-[#D9A521] font-bold text-xs">
              DSU
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                <span>DSU Campus Venue Explorer</span>
              </h2>
              <p className="text-[11px] text-slate-300">
                Harohalli Main Campus (130-Acre Campus) venue locator with live scheduled gatherings.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition"
            aria-label="Close Map"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Explorer Body - Scrollable on mobile, split-panel on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto lg:overflow-hidden min-h-0">
          {/* Left/Main Column: Stylized Campus Vector Map */}
          <div className="lg:col-span-7 bg-[#001B36] relative overflow-hidden flex flex-col items-center justify-center p-6 border-b lg:border-b-0 lg:border-r border-slate-200">
            {/* Campus Plan SVG Canvas */}
            <div className="w-full aspect-[4/3] max-w-lg relative bg-[#002447] rounded-2xl border border-blue-900/50 shadow-inner overflow-hidden p-4">
              {/* Campus Roads and Landscape Grid */}
              <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
                {/* Background Grid Pattern */}
                <defs>
                  <pattern id="campus-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#campus-grid)" />

                {/* Illustrative paths */}
                <path d="M 0 50 Q 50 48 100 50" stroke="#1E3A8A" strokeWidth="4" opacity="0.6" />
                <path d="M 50 0 L 50 100" stroke="#1E3A8A" strokeWidth="4" opacity="0.6" />
                <circle cx="50" cy="50" r="14" stroke="#D9A521" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />

                {/* Zones Outline */}
                <rect x="34" y="26" width="18" height="18" rx="3" fill="#002B55" stroke="#3B82F6" strokeWidth="0.8" opacity="0.8" />
                <text x="43" y="36" fill="#93C5FD" fontSize="3" fontWeight="bold" textAnchor="middle">MAIN AUDITORIUM</text>

                <rect x="52" y="24" width="18" height="16" rx="3" fill="#002B55" stroke="#3B82F6" strokeWidth="0.8" opacity="0.8" />
                <text x="61" y="33" fill="#93C5FD" fontSize="3" fontWeight="bold" textAnchor="middle">SEMINAR HALL</text>

                <rect x="62" y="44" width="20" height="18" rx="3" fill="#002B55" stroke="#3B82F6" strokeWidth="0.8" opacity="0.8" />
                <text x="72" y="54" fill="#93C5FD" fontSize="3" fontWeight="bold" textAnchor="middle">TECH BLOCK</text>

                <circle cx="35" cy="65" r="10" fill="#064E3B" stroke="#10B981" strokeWidth="0.8" opacity="0.7" />
                <text x="35" y="66" fill="#A7F3D0" fontSize="2.5" fontWeight="bold" textAnchor="middle">AMPHITHEATER</text>

                <rect x="74" y="64" width="22" height="16" rx="3" fill="#78350F" stroke="#F59E0B" strokeWidth="0.8" opacity="0.7" />
                <text x="85" y="73" fill="#FDE68A" fontSize="2.8" fontWeight="bold" textAnchor="middle">SPORTS TURF</text>

                <circle cx="20" cy="48" r="8" fill="#581C87" stroke="#A855F7" strokeWidth="0.8" opacity="0.7" />
                <text x="20" y="49" fill="#E9D5FF" fontSize="2.5" fontWeight="bold" textAnchor="middle">DESIGN STUDIO</text>

                {/* Entry marker */}
                <rect x="0" y="45" width="8" height="10" fill="#002B55" rx="1" />
                <text x="4" y="58" fill="#FFFFFF" fontSize="2" fontWeight="bold" textAnchor="middle">MAIN GATE</text>
              </svg>

              {/* Interactive Venue Pins */}
              {venues.map((venue) => {
                const isSelected = selectedVenue.id === venue.id;
                return (
                  <button
                    key={venue.id}
                    type="button"
                    onClick={() => setSelectedVenue(venue)}
                    style={{ left: `${venue.coords.x}%`, top: `${venue.coords.y}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-transform duration-200 z-10 ${
                      isSelected ? 'scale-125 z-20' : 'hover:scale-110'
                    }`}
                    title={venue.name}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shadow-lg transition-colors ${
                        isSelected
                          ? 'bg-[#D9A521] text-[#001B36] ring-4 ring-amber-300/40 animate-pulse'
                          : 'bg-white text-[#002B55] hover:bg-[#D9A521]'
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5 fill-current" />
                    </div>
                    <span
                      className={`absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-0.5 rounded text-[9px] font-mono font-bold whitespace-nowrap shadow-md pointer-events-none ${
                        isSelected
                          ? 'bg-[#D9A521] text-[#001B36]'
                          : 'bg-slate-900/90 text-white backdrop-blur-sm'
                      }`}
                    >
                      {venue.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Map Legend */}
            <div className="w-full max-w-lg mt-3 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#D9A521]"></span>
                <span>Click any venue marker to inspect facilities</span>
              </span>
              <span>Dayananda Sagar University</span>
            </div>
          </div>

          {/* Right Column: Venue Detail Panel & Scheduled Events */}
          <div className="lg:col-span-5 p-6 overflow-y-auto flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-[#002B55] text-[#D9A521]">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{selectedVenue.type}</span>
                </span>
                <h3 className="text-xl font-extrabold text-[#002B55] mt-2 leading-tight">
                  {selectedVenue.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{selectedVenue.block} ({selectedVenue.campus})</span>
                </p>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Auditorium / Lab Capacity</span>
                  <span className="text-base font-extrabold font-mono text-[#002B55]">
                    {selectedVenue.capacity} Seats
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Campus Location</span>
                  <span className="text-xs font-semibold text-slate-700 block mt-0.5">
                    {selectedVenue.shuttleDist}
                  </span>
                </div>
              </div>

              {/* Venue Features */}
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-2">
                  Campus Facilities & Equipment
                </span>
                <ul className="space-y-1.5">
                  {selectedVenue.features.map((feat, i) => (
                    <li key={i} className="text-xs text-slate-600 flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Scheduled Events at this Venue */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-2">
                  Live Scheduled Gatherings ({scheduledEvents.length})
                </span>
                {scheduledEvents.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">
                    No active events currently scheduled at this venue.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {scheduledEvents.map((ev) => (
                      <div
                        key={ev._id}
                        className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-xs"
                      >
                        <p className="font-bold text-[#002B55]">{ev.title.replace(/^DEMO:\s*/, '')}</p>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {new Date(ev.startsAt).toLocaleDateString('en-IN', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
              {onSelectVenue && (
                <button
                  type="button"
                  onClick={() => {
                    onSelectVenue(selectedVenue.name);
                    onClose();
                  }}
                  className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-[#002B55] hover:bg-[#001B36] text-white text-xs font-bold transition shadow-sm flex items-center justify-center gap-2"
                >
                  <span>Filter Events for this Venue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              <p className="text-[11px] text-slate-500 text-center">
                Dayananda Sagar University Official Venue Map.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
