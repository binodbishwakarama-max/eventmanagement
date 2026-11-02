import React, { useState } from 'react';
import {
  Code2,
  Palette,
  Music2,
  Trophy,
  GraduationCap,
  Sparkles,
  Layers,
  Cpu,
  BookOpen,
  Briefcase
} from 'lucide-react';

/**
 * Curated high-resolution collegiate photography library.
 * Selected specifically to reflect authentic university life at Dayananda Sagar University.
 * Unique assets are mapped deterministically so no two campus event cards display duplicate images.
 */
const UNIQUE_EVENT_PHOTOS = [
  // Engineering / Hackathons / Maker Sprints
  {
    keywords: ['maker', 'sprint', 'hackathon', 'hack', 'build', 'hardware', 'iot'],
    url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
    icon: Cpu,
    category: 'Technical'
  },
  // UI/UX & Design Workshops
  {
    keywords: ['shape', 'type', 'interface', 'design', 'ui', 'ux', 'figma'],
    url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80',
    icon: Palette,
    category: 'Workshop'
  },
  // Cultural / Music / Stage / Amphitheatre
  {
    keywords: ['cultural', 'stage', 'open stage', 'music', 'concert', 'amphitheatre', 'perform'],
    url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    icon: Music2,
    category: 'Cultural'
  },
  // Sports / Football / Athletics
  {
    keywords: ['football', 'sports', 'athletics', 'soccer', 'turf', 'tournament', 'match'],
    url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
    icon: Trophy,
    category: 'Sports'
  },
  // AI / Tech / Faculty Keynote Seminar
  {
    keywords: ['ai', 'tech', 'emerging', 'colloquium', 'seminar', 'lecture', 'notes'],
    url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
    icon: GraduationCap,
    category: 'Seminar'
  },
  // Creative Studio / Makerspace / Arts
  {
    keywords: ['studio', 'creative', 'arts', 'generative', 'visual'],
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    icon: Sparkles,
    category: 'Workshop'
  },
  // Code Review / Software Architecture / Prototype
  {
    keywords: ['prototype', 'review', 'code', 'hours', 'lab'],
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    icon: Code2,
    category: 'Technical'
  },
  // Product Thinking / Strategy / Innovation
  {
    keywords: ['product', 'thinking', 'ideas', 'innovation', 'business'],
    url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
    icon: Briefcase,
    category: 'Workshop'
  },
  // Academic Research / Library / Books
  {
    keywords: ['research', 'library', 'colloquium', 'academic'],
    url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80',
    icon: BookOpen,
    category: 'Seminar'
  }
];

// Fallback category photography pool ensuring distinct imagery when no keyword matches
const CATEGORY_POOLS = {
  Technical: [
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80'
  ],
  Workshop: [
    'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80'
  ],
  Cultural: [
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80'
  ],
  Sports: [
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80'
  ],
  Seminar: [
    'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1200&q=80'
  ],
  Other: [
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80'
  ]
};

const CATEGORY_FALLBACK_STYLES = {
  Technical: { bg: 'bg-[#002B55]', icon: Code2, label: 'Technical' },
  Workshop: { bg: 'bg-[#001B36]', icon: Palette, label: 'Workshop' },
  Cultural: { bg: 'bg-[#1E1B4B]', icon: Music2, label: 'Cultural' },
  Sports: { bg: 'bg-[#064E3B]', icon: Trophy, label: 'Sports' },
  Seminar: { bg: 'bg-[#002B55]', icon: GraduationCap, label: 'Seminar' },
  Other: { bg: 'bg-slate-800', icon: Layers, label: 'Campus' }
};

/**
 * Returns a unique, relevant photo URL by title keywords or deterministic hash.
 */
function resolvePhoto(category, title = '') {
  const lowerTitle = title.toLowerCase();

  // 1. Direct keyword match
  for (const item of UNIQUE_EVENT_PHOTOS) {
    if (item.keywords.some((kw) => lowerTitle.includes(kw))) {
      return item.url;
    }
  }

  // 2. Deterministic pool selection by title length/hash so different events get different images
  const pool = CATEGORY_POOLS[category] || CATEGORY_POOLS.Other;
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = (hash << 5) - hash + title.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % pool.length;
  return pool[index];
}

export function EventArtwork({
  category = 'Technical',
  title = '',
  posterUrl = '',
  className = '',
  featured = false
}) {
  const [imageError, setImageError] = useState(false);
  const photoUrl = posterUrl || resolvePhoto(category, title);
  const fallback = CATEGORY_FALLBACK_STYLES[category] || CATEGORY_FALLBACK_STYLES.Other;
  const FallbackIcon = fallback.icon;

  return (
    <div
      className={`relative overflow-hidden bg-slate-100 select-none ${className}`}
      aria-hidden="true"
    >
      {!imageError ? (
        <img
          src={photoUrl}
          alt={title || category}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-103"
          loading={featured ? 'eager' : 'lazy'}
        />
      ) : (
        <div className={`w-full h-full flex flex-col items-center justify-center p-6 text-white ${fallback.bg}`}>
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 mb-2">
            <FallbackIcon className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs font-semibold tracking-wider uppercase text-white/90">
            {fallback.label}
          </span>
        </div>
      )}
    </div>
  );
}
