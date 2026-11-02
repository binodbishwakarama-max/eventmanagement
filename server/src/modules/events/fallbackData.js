// In-memory fallback dataset for offline/sandbox development when MongoDB Atlas is unreachable.
// Accurately reflects the DSU Campus Events schema and seed data.

const day = 24 * 60 * 60 * 1000;
const now = Date.now();

export const FALLBACK_EVENTS = [
  {
    _id: '67bb10000000000000000001',
    title: 'Maker Sprint — Build for a Better Campus',
    description: 'A 24-hour hands-on hardware and software sprint for engineering students. Teams build smart IoT prototypes, automated campus solutions, and accessibility tools.',
    category: 'Technical',
    venue: 'CSE Innovation Lab, Block 3, Harohalli Campus',
    startsAt: new Date(now + 3 * day).toISOString(),
    endsAt: new Date(now + 3 * day + 12 * 60 * 60 * 1000).toISOString(),
    capacity: 30,
    registeredCount: 14,
    status: 'published',
    phase: 'upcoming',
    organizerClub: 'DSU Developer Student Club',
    createdAt: new Date(now - 2 * day).toISOString()
  },
  {
    _id: '67bb10000000000000000002',
    title: 'Shape, Type & Interface Design Workshop',
    description: 'Master typographic rhythm, spatial scales, and iOS HIG design systems. Learn hands-on micro-interaction engineering and component tokens.',
    category: 'Workshop',
    venue: 'School of Design Studio, 4th Floor, Academic Block',
    startsAt: new Date(now + 7 * day).toISOString(),
    endsAt: new Date(now + 7 * day + 4 * 60 * 60 * 1000).toISOString(),
    capacity: 24,
    registeredCount: 18,
    status: 'published',
    phase: 'upcoming',
    organizerClub: 'DSU Design Guild',
    createdAt: new Date(now - 3 * day).toISOString()
  },
  {
    _id: '67bb10000000000000000003',
    title: 'Open Stage Sessions & Cultural Night',
    description: 'An evening of live student performances, acoustic solos, spoken word poetry, and instrumental music celebrating creative expressions across all schools.',
    category: 'Cultural',
    venue: 'Campus Open Air Amphitheatre, Harohalli',
    startsAt: new Date(now + 14 * day).toISOString(),
    endsAt: new Date(now + 14 * day + 5 * 60 * 60 * 1000).toISOString(),
    capacity: 60,
    registeredCount: 42,
    status: 'published',
    phase: 'upcoming',
    organizerClub: 'Music & Cultural Society',
    createdAt: new Date(now - 1 * day).toISOString()
  },
  {
    _id: '67bb10000000000000000004',
    title: 'Inter-Department Friendly Football Round',
    description: 'Knockout football match between Schools of Engineering and Basic Sciences. Spectators welcome.',
    category: 'Sports',
    venue: 'DSU Sports Arena & Central Ground',
    startsAt: new Date(now + 2 * day).toISOString(),
    endsAt: new Date(now + 2 * day + 3 * 60 * 60 * 1000).toISOString(),
    capacity: 50,
    registeredCount: 35,
    status: 'published',
    phase: 'upcoming',
    organizerClub: 'DSU Athletics Council',
    createdAt: new Date(now - 4 * day).toISOString()
  },
  {
    _id: '67bb10000000000000000005',
    title: 'Notes on Emerging Ideas in Tech & AI',
    description: 'Distinguished faculty lecture and research colloquium exploring large reasoning models, agentic workflows, and ethical considerations for university researchers.',
    category: 'Seminar',
    venue: 'Sir M. Visvesvaraya Auditorium, Harohalli',
    startsAt: new Date(now + 9 * day).toISOString(),
    endsAt: new Date(now + 9 * day + 2 * 60 * 60 * 1000).toISOString(),
    capacity: 80,
    registeredCount: 65,
    status: 'published',
    phase: 'upcoming',
    organizerClub: 'Faculty of Engineering & Technology',
    createdAt: new Date(now - 5 * day).toISOString()
  },
  {
    _id: '67bb10000000000000000006',
    title: 'The Open Creative Studio',
    description: 'Hands-on exploratory session with generative visuals, creative coding, and collaborative design sprint.',
    category: 'Workshop',
    venue: 'Student Activity Center, Harohalli Campus',
    startsAt: new Date(now + 10 * day).toISOString(),
    endsAt: new Date(now + 10 * day + 4 * 60 * 60 * 1000).toISOString(),
    capacity: 25,
    registeredCount: 16,
    status: 'published',
    phase: 'upcoming',
    organizerClub: 'Creative Arts Club',
    createdAt: new Date(now - 1 * day).toISOString()
  }
];

