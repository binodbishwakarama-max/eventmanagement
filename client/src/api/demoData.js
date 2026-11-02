// Development-only fallback seed data matching Dayananda Sagar University campus context
// Automatically engaged when the backend API server is offline or unreachable

const now = Date.now();
const day = 24 * 60 * 60 * 1000;

export const INITIAL_DEMO_EVENTS = [
  {
    _id: 'dsu-evt-001',
    title: 'Maker Sprint — Build for a Better Campus',
    description: 'A 24-hour hands-on hardware and software sprint for engineering students. Teams build smart IoT prototypes, automated campus solutions, and accessibility tools using microcontrollers, sensors, and modern cloud stacks.',
    category: 'Technical',
    venue: 'CSE Innovation Lab, Block 3, Harohalli Campus',
    startsAt: new Date(now + 2 * day + 3 * 3600000).toISOString(),
    endsAt: new Date(now + 2 * day + 15 * 3600000).toISOString(),
    capacity: 45,
    registeredCount: 38,
    status: 'published',
    phase: 'upcoming',
    organizerClub: 'DSU Developer Student Club',
    featured: true,
    tags: ['IoT', 'Cloud', 'Hardware', 'Robotics']
  },
  {
    _id: 'dsu-evt-002',
    title: 'Shape, Type & Interface Design Workshop',
    description: 'Master typographic rhythm, spatial scales, and iOS HIG design systems. Learn hands-on micro-interaction engineering and component tokens from leading product design practitioners.',
    category: 'Workshop',
    venue: 'School of Design Studio, 4th Floor, Academic Block',
    startsAt: new Date(now + 4 * day + 4 * 3600000).toISOString(),
    endsAt: new Date(now + 4 * day + 8 * 3600000).toISOString(),
    capacity: 30,
    registeredCount: 22,
    status: 'published',
    phase: 'upcoming',
    organizerClub: 'DSU Design Guild',
    featured: true,
    tags: ['Figma', 'UI/UX', 'Design Systems']
  },
  {
    _id: 'dsu-evt-003',
    title: 'Open Stage Acoustic Sessions & Cultural Night',
    description: 'An evening of live student performances, acoustic solos, spoken word poetry, and instrumental music celebrating creative expressions across all schools and years.',
    category: 'Cultural',
    venue: 'Campus Open Air Amphitheatre, Harohalli',
    startsAt: new Date(now + 6 * day + 9 * 3600000).toISOString(),
    endsAt: new Date(now + 6 * day + 13 * 3600000).toISOString(),
    capacity: 120,
    registeredCount: 89,
    status: 'published',
    phase: 'upcoming',
    organizerClub: 'Music & Literary Society',
    featured: false,
    tags: ['Music', 'Acoustic', 'Poetry', 'Live']
  },
  {
    _id: 'dsu-evt-004',
    title: 'Inter-Department Football Tournament',
    description: 'Annual 7-a-side knockout tournament between the Schools of Engineering, Management, Pharmacy, and Basic Sciences. Spectator passes are required for seating admission.',
    category: 'Sports',
    venue: 'DSU Sports Arena & Central Turf Ground',
    startsAt: new Date(now + 3 * day + 6 * 3600000).toISOString(),
    endsAt: new Date(now + 3 * day + 11 * 3600000).toISOString(),
    capacity: 150,
    registeredCount: 142,
    status: 'published',
    phase: 'upcoming',
    organizerClub: 'DSU Athletics Council',
    featured: false,
    tags: ['Football', 'Athletics', 'Knockout']
  },
  {
    _id: 'dsu-evt-005',
    title: 'Notes on Modern AI Systems & Product Architectures',
    description: 'Distinguished faculty lecture and industry keynote exploring large reasoning models, agentic workflows, and ethical considerations for university researchers.',
    category: 'Seminar',
    venue: 'Sir M. Visvesvaraya Auditorium, Harohalli Campus',
    startsAt: new Date(now + 8 * day + 2 * 3600000).toISOString(),
    endsAt: new Date(now + 8 * day + 5 * 3600000).toISOString(),
    capacity: 100,
    registeredCount: 94,
    status: 'published',
    phase: 'upcoming',
    organizerClub: 'Faculty of Engineering & Technology',
    featured: false,
    tags: ['AI/ML', 'Research', 'Keynote']
  },
  {
    _id: 'dsu-evt-006',
    title: 'The Open Creative Studio: Generative Visuals',
    description: 'Interactive session exploring algorithmic art, shaders, and visual code experiments using WebGL and Canvas. Laptop with Chrome or Safari required.',
    category: 'Workshop',
    venue: 'Computing Center 2, 2nd Floor, Block 1',
    startsAt: new Date(now + 10 * day + 4 * 3600000).toISOString(),
    endsAt: new Date(now + 10 * day + 7 * 3600000).toISOString(),
    capacity: 35,
    registeredCount: 28,
    status: 'published',
    phase: 'upcoming',
    organizerClub: 'Creative Coding Circle',
    featured: false,
    tags: ['Creative Code', 'WebGL', 'Generative']
  },
  {
    _id: 'dsu-evt-007',
    title: 'Campus Leadership & Entrepreneurship Colloquium',
    description: 'Founders and alumni share their journey from university dorms to raising venture capital and scaling enterprise products in Bengaluru.',
    category: 'Seminar',
    venue: 'Management Studies Seminar Hall, Block 4',
    startsAt: new Date(now + 12 * day + 5 * 3600000).toISOString(),
    endsAt: new Date(now + 12 * day + 8 * 3600000).toISOString(),
    capacity: 80,
    registeredCount: 80,
    status: 'published',
    phase: 'upcoming',
    organizerClub: 'DSU Center for Innovation & E-Cell',
    featured: false,
    tags: ['Startups', 'Venture', 'Leadership']
  },
  {
    _id: 'dsu-evt-008',
    title: 'Cybersecurity Blue-Team Defense Drill',
    description: 'Capture-the-flag network security defense simulation. Identify live attack vectors, remediate vulnerabilities, and audit system defenses against credential stuffing.',
    category: 'Technical',
    venue: 'Advanced Cyber Range Lab, 3rd Floor',
    startsAt: new Date(now + 15 * day + 3 * 3600000).toISOString(),
    endsAt: new Date(now + 15 * day + 9 * 3600000).toISOString(),
    capacity: 25,
    registeredCount: 19,
    status: 'published',
    phase: 'upcoming',
    organizerClub: 'Information Security Society',
    featured: false,
    tags: ['Security', 'CTF', 'Blue Team']
  }
];

const DEMO_EVENTS_STORAGE_KEY = 'dsu_demo_events_v2';
const DEMO_REG_STORAGE_KEY = 'dsu_demo_registrations_v2';

export function getLocalEvents() {
  try {
    const raw = localStorage.getItem(DEMO_EVENTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(DEMO_EVENTS_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_EVENTS));
      return INITIAL_DEMO_EVENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DEMO_EVENTS;
  }
}

export function saveLocalEvent(eventData) {
  const current = getLocalEvents();
  const newEvent = {
    ...eventData,
    _id: `dsu-evt-${Date.now()}`,
    registeredCount: 0,
    status: eventData.status || 'draft',
    phase: 'upcoming',
    createdAt: new Date().toISOString()
  };
  const updated = [newEvent, ...current];
  try {
    localStorage.setItem(DEMO_EVENTS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed saving local event', err);
  }
  return newEvent;
}

export function updateLocalEvent(id, eventData) {
  const current = getLocalEvents();
  let updatedEvent = null;
  const updated = current.map((e) => {
    if (e._id === id) {
      updatedEvent = { ...e, ...eventData };
      return updatedEvent;
    }
    return e;
  });
  try {
    localStorage.setItem(DEMO_EVENTS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed updating local event', err);
  }
  return updatedEvent;
}

export function deleteLocalEvent(id) {
  const current = getLocalEvents();
  const updated = current.filter((e) => e._id !== id);
  try {
    localStorage.setItem(DEMO_EVENTS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed deleting local event', err);
  }
  return { success: true };
}

export function getLocalRegistrations() {
  try {
    const raw = localStorage.getItem(DEMO_REG_STORAGE_KEY);
    if (!raw) {
      const initial = [
        {
          _id: 'demo-reg-1',
          ticketCode: 'DSU-MS26-9042',
          status: 'registered',
          attended: false,
          registeredAt: new Date().toISOString(),
          student: {
            name: 'Arjun Sharma',
            usn: '1DS22CS042',
            email: 'student1@example.test',
            department: 'Computer Science & Engineering'
          },
          event: INITIAL_DEMO_EVENTS[0]
        },
        {
          _id: 'demo-reg-2',
          ticketCode: 'DSU-DSGN-8831',
          status: 'registered',
          attended: true,
          registeredAt: new Date(Date.now() - 3 * day).toISOString(),
          student: {
            name: 'Arjun Sharma',
            usn: '1DS22CS042',
            email: 'student1@example.test',
            department: 'Computer Science & Engineering'
          },
          event: INITIAL_DEMO_EVENTS[1]
        }
      ];
      localStorage.setItem(DEMO_REG_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveLocalRegistration(eventId) {
  const current = getLocalRegistrations();
  const events = getLocalEvents();
  const event = events.find((e) => e._id === eventId) || INITIAL_DEMO_EVENTS[0];
  const storedUser = localStorage.getItem('dsu_user');
  const user = storedUser
    ? JSON.parse(storedUser)
    : {
        name: 'Arjun Sharma',
        usn: '1DS22CS042',
        email: 'student1@example.test',
        department: 'Computer Science & Engineering'
      };

  const ticketCode = `DSU-${event?.category?.slice(0, 3).toUpperCase() || 'EVT'}-${Math.floor(1000 + Math.random() * 9000)}`;
  const newReg = {
    _id: `demo-reg-${Date.now()}`,
    ticketCode,
    status: 'registered',
    attended: false,
    registeredAt: new Date().toISOString(),
    student: user,
    event
  };

  // Increment event registeredCount
  updateLocalEvent(eventId, { registeredCount: (event.registeredCount || 0) + 1 });

  const updated = [newReg, ...current];
  try {
    localStorage.setItem(DEMO_REG_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed saving demo registration', err);
  }
  return newReg;
}

export function cancelLocalRegistration(eventId) {
  const current = getLocalRegistrations();
  const events = getLocalEvents();
  const event = events.find((e) => e._id === eventId);
  if (event && event.registeredCount > 0) {
    updateLocalEvent(eventId, { registeredCount: Math.max(0, event.registeredCount - 1) });
  }

  const updated = current.map((r) => {
    if (r.event?._id === eventId) {
      return { ...r, status: 'cancelled' };
    }
    return r;
  });
  try {
    localStorage.setItem(DEMO_REG_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed updating demo registration', err);
  }
  return updated;
}

export function getEventAttendees(eventId) {
  const allRegs = getLocalRegistrations();
  const eventRegs = allRegs.filter((r) => r.event?._id === eventId && r.status === 'registered');

  if (eventRegs.length > 0) {
    return eventRegs;
  }

  // Pre-seed mock attendees for the event roster so check-in is testable immediately
  return [
    {
      _id: `roster-${eventId}-1`,
      ticketCode: `DSU-${eventId.slice(-3).toUpperCase()}-1102`,
      status: 'registered',
      attended: true,
      student: {
        name: 'Pooja Reddy',
        usn: '1DS22EC014',
        email: 'pooja.reddy@dsu.edu.in',
        department: 'Electronics & Communication'
      }
    },
    {
      _id: `roster-${eventId}-2`,
      ticketCode: `DSU-${eventId.slice(-3).toUpperCase()}-4829`,
      status: 'registered',
      attended: false,
      student: {
        name: 'Rohan Deshmukh',
        usn: '1DS23CS089',
        email: 'rohan.deshmukh@dsu.edu.in',
        department: 'Computer Science & Engineering'
      }
    },
    {
      _id: `roster-${eventId}-3`,
      ticketCode: `DSU-${eventId.slice(-3).toUpperCase()}-7391`,
      status: 'registered',
      attended: false,
      student: {
        name: 'Sneha Kulkarni',
        usn: '1DS22AI031',
        email: 'sneha.k@dsu.edu.in',
        department: 'Artificial Intelligence & ML'
      }
    }
  ];
}

export function markLocalAttendance(eventId, regId) {
  const allRegs = getLocalRegistrations();
  const updated = allRegs.map((r) => {
    if (r._id === regId) {
      return { ...r, attended: true, attendedAt: new Date().toISOString() };
    }
    return r;
  });
  try {
    localStorage.setItem(DEMO_REG_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed marking attendance in demo mode', err);
  }
  return { success: true };
}

export const DEMO_CAMPUS_USERS = [
  {
    _id: 'usr-admin-01',
    name: 'Dr. Ramesh Kumar',
    email: 'admin@demo.dsu.edu',
    role: 'admin',
    department: 'Office of Student Affairs',
    clubName: 'DSU Central Administration'
  },
  {
    _id: 'usr-org-01',
    name: 'Vikram Joshi (Developer Club)',
    email: 'organizer@example.test',
    role: 'organizer',
    department: 'School of Computer Science',
    clubName: 'DSU Developer Student Club'
  },
  {
    _id: 'usr-org-02',
    name: 'Ananya Sen (Design Guild)',
    email: 'design.lead@dsu.edu.in',
    role: 'organizer',
    department: 'School of Design',
    clubName: 'DSU Design Guild'
  },
  {
    _id: 'usr-std-01',
    name: 'Arjun Sharma',
    email: 'student1@example.test',
    role: 'student',
    usn: '1DS22CS042',
    department: 'Computer Science & Engineering'
  },
  {
    _id: 'usr-std-02',
    name: 'Pooja Reddy',
    email: 'student2@example.test',
    role: 'student',
    usn: '1DS22EC014',
    department: 'Electronics & Communication'
  }
];
