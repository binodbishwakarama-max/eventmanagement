import React, { useState } from 'react';
import {
  X,
  MapPin,
  Navigation,
  ExternalLink,
  Users,
  Compass,
  CheckCircle2,
  Calendar,
  Building2,
  ArrowRight
} from 'lucide-react';

export const HAROHALLI_VENUES = [
  {
    id: 'visvesvaraya-auditorium',
    name: 'Sir M. Visvesvaraya Auditorium',
    block: 'Central Academic Block 1, Ground Floor',
    capacity: 250,
    type: 'Keynote & Academic Plenary',
    features: ['Central Air-Conditioned', 'Tiered Amphitheatre Seating', 'Surround Sound & 4K AV'],
    coords: { x: 42, y: 35 },
    shuttleDist: '2 mins walk from Main Gate'
  },
  {
    id: 'premachandra-hall',
    name: 'Dr. Premachandra Sagar Seminar Hall',
    block: 'Academic Block 2, 2nd Floor',
    capacity: 120,
    type: 'Symposium & Faculty Colloquium',
    features: ['Interactive Smart Board', 'Hybrid Video Conferencing', 'Acoustic Paneling'],
    coords: { x: 58, y: 32 },
    shuttleDist: '3 mins walk from Shuttle Drop'
  },
  {
    id: 'cse-innovation-lab',
    name: 'CSE Innovation & AI Research Lab',
    block: 'School of Engineering, Block 3, 3rd Floor',
    capacity: 60,
    type: 'Hackathons & Technical Labs',
    features: ['High-Performance GPU Nodes', 'Dual Gigabit Ethernet', 'IoT Hardware Prototyping Benches'],
    coords: { x: 68, y: 52 },
    shuttleDist: '4 mins walk from East Gate'
  },
  {
    id: 'campus-amphitheatre',
    name: 'Central Campus Open Air Amphitheatre',
    block: 'Student Activity Plaza & Lakefront Walk',
    capacity: 500,
    type: 'Cultural Shows & Student Fests',
    features: ['Open-Sky Acoustic Shell', 'Stage Lighting Truss', 'Surround Green Lawns'],
    coords: { x: 35, y: 65 },
    shuttleDist: '3 mins walk from Main Plaza'
  },
  {
    id: 'sports-arena',
    name: 'DSU Indoor Sports Arena & Turf',
    block: 'Harohalli Sports Complex & Athletics Ground',
    capacity: 300,
    type: 'Sports Tournaments & Athletic Meets',
    features: ['Synthetic Badminton Courts', 'Hardwood Basketball Court', 'FIFA-Standard 7s Turf'],
    coords: { x: 80, y: 70 },
    shuttleDist: '5 mins walk from Sports Gate'
  },
  {
    id: 'kuvempu-theatre',
    name: 'Kaviguru Kuvempu Cultural Pavilion',
    block: 'Harohalli Central Grounds, South Wing',
    capacity: 400,
    type: 'Literary & Dramatic Arts',
    features: ['Proscenium Arch Stage', 'Green Rooms', 'Audio Mixing Booth'],
    coords: { x: 20, y: 48 },
    shuttleDist: '4 mins walk from West Gate'
  }
];

export function CampusMapModal({ isOpen, onClose, onSelectVenue, currentEvents = [] }) {
  const [selectedVenue, setSelectedVenue] = useState(HAROHALLI_VENUES[0]);

  if (!isOpen) return null;

  // Find events scheduled at the selected venue
  const scheduledEvents = currentEvents.filter((ev) =>
    ev.venue?.toLowerCase().includes(selectedVenue.name.toLowerCase().split(' ')[0]) ||
    ev.venue?.toLowerCase().includes(selectedVenue.id)
  );

  return (
    <div className="fixed inset-0 z-50 dsu-overlay flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-5xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Modal University Header */}
        <div className="bg-[#002B55] text-white px-6 py-4 flex items-center justify-between border-b border-[#D9A521]/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#001B36] border border-[#D9A521]/40 flex items-center justify-center text-[#D9A521] font-bold text-xs">
              DSU
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                <span>Harohalli Main Campus — Interactive Venue Navigator</span>
              </h2>
              <p className="text-[11px] text-slate-300">
                Dayananda Sagar University • Kanakapura Road, Ramanagara District, Bengaluru 562112
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

        {/* Map Explorer Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden min-h-0">
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

                {/* Main Campus Boulevards */}
                <path d="M 0 50 Q 50 48 100 50" stroke="#1E3A8A" strokeWidth="4" opacity="0.6" />
                <path d="M 50 0 L 50 100" stroke="#1E3A8A" strokeWidth="4" opacity="0.6" />
                <circle cx="50" cy="50" r="14" stroke="#D9A521" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />

                {/* Zones Outline */}
                <rect x="34" y="26" width="18" height="18" rx="3" fill="#002B55" stroke="#3B82F6" strokeWidth="0.8" opacity="0.8" />
                <text x="43" y="36" fill="#93C5FD" fontSize="3" fontWeight="bold" textAnchor="middle">BLOCK 1</text>

                <rect x="52" y="24" width="18" height="16" rx="3" fill="#002B55" stroke="#3B82F6" strokeWidth="0.8" opacity="0.8" />
                <text x="61" y="33" fill="#93C5FD" fontSize="3" fontWeight="bold" textAnchor="middle">BLOCK 2</text>

                <rect x="62" y="44" width="20" height="18" rx="3" fill="#002B55" stroke="#3B82F6" strokeWidth="0.8" opacity="0.8" />
                <text x="72" y="54" fill="#93C5FD" fontSize="3" fontWeight="bold" textAnchor="middle">ENGG (SOE)</text>

                <circle cx="35" cy="65" r="10" fill="#064E3B" stroke="#10B981" strokeWidth="0.8" opacity="0.7" />
                <text x="35" y="66" fill="#A7F3D0" fontSize="2.5" fontWeight="bold" textAnchor="middle">AMPHI</text>

                <rect x="74" y="64" width="22" height="16" rx="3" fill="#78350F" stroke="#F59E0B" strokeWidth="0.8" opacity="0.7" />
                <text x="85" y="73" fill="#FDE68A" fontSize="2.8" fontWeight="bold" textAnchor="middle">SPORTS ARENA</text>

                <circle cx="20" cy="48" r="8" fill="#581C87" stroke="#A855F7" strokeWidth="0.8" opacity="0.7" />
                <text x="20" y="49" fill="#E9D5FF" fontSize="2.5" fontWeight="bold" textAnchor="middle">KUVEMPU</text>

                {/* Main Gate Landmark */}
                <rect x="0" y="45" width="8" height="10" fill="#002B55" rx="1" />
                <text x="4" y="58" fill="#FFFFFF" fontSize="2" fontWeight="bold" textAnchor="middle">GATE</text>
              </svg>

              {/* Interactive Venue Pins */}
              {HAROHALLI_VENUES.map((venue) => {
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
                <span>Click a venue pin to inspect</span>
              </span>
              <span>Main Gate • Kanakapura Road Entrance</span>
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
                  <span>{selectedVenue.block}</span>
                </p>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Seating Capacity</span>
                  <span className="text-base font-extrabold font-mono text-[#002B55]">
                    {selectedVenue.capacity} Seats
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Campus Transit</span>
                  <span className="text-xs font-semibold text-slate-700 block mt-0.5">
                    {selectedVenue.shuttleDist}
                  </span>
                </div>
              </div>

              {/* Venue Features */}
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-2">
                  Hall Infrastructure & Amenities
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
                  Scheduled Events at this Venue ({scheduledEvents.length})
                </span>
                {scheduledEvents.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">
                    No active events currently scheduled at this specific hall.
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

              <a
                href={`https://maps.google.com/?q=Dayananda+Sagar+University+Harohalli+Campus+${encodeURIComponent(
                  selectedVenue.name
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition flex items-center justify-center gap-1.5"
              >
                <Navigation className="w-3.5 h-3.5 text-blue-600" />
                <span>Google Maps</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

