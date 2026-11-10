import { Router } from 'express';
import { Venue } from '../../models/Venue.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ok } from '../../utils/respond.js';

const router = Router();

export const DEFAULT_DSU_VENUES = [
  {
    name: 'Sir M. Visvesvaraya Auditorium',
    slug: 'sir-mv-auditorium',
    campus: 'Harohalli Main Campus',
    building: 'Dr. Premachandra Sagar Academic Block',
    floor: 'Ground Floor',
    venueType: 'Auditorium',
    capacity: 850,
    description: 'Premier collegiate auditorium equipped with line-array acoustics, motorized projection, and live stream broadcast nodes.',
    amenities: ['Audio-Visual Console', 'Stage Lighting', 'Green Rooms', 'Central Air Conditioning', 'High-Speed Wi-Fi'],
    availabilityStatus: 'available',
    verificationStatus: 'verified'
  },
  {
    name: 'CSE Innovation & Hackathon Lab',
    slug: 'cse-innovation-lab',
    campus: 'Harohalli Main Campus',
    building: 'Engineering Block 3',
    floor: '3rd Floor',
    venueType: 'Laboratory',
    capacity: 120,
    description: 'High-density maker and hackathon space featuring redundant Gigabit LAN, dual-display workstations, and IoT prototyping kits.',
    amenities: ['Gigabit Ethernet Drops', 'Workstations', 'Soldering Stations', 'Smart Whiteboards', 'Power Backups'],
    availabilityStatus: 'available',
    verificationStatus: 'verified'
  },
  {
    name: 'Dr. Premachandra Sagar Seminar Hall',
    slug: 'premachandra-sagar-seminar-hall',
    campus: 'Harohalli Main Campus',
    building: 'Academic Block 1',
    floor: '1st Floor',
    venueType: 'Seminar Hall',
    capacity: 300,
    description: 'Executive seminar space for industry colloquiums, guest lectures, and placement orientation.',
    amenities: ['Tiered Seating', 'Surround Sound', 'Podium System', 'Projector Screens', 'Wi-Fi'],
    availabilityStatus: 'available',
    verificationStatus: 'verified'
  },
  {
    name: 'Harohalli Athletics Complex & Central Turf',
    slug: 'harohalli-central-turf',
    campus: 'Harohalli Main Campus',
    building: 'Sports Complex',
    floor: 'Ground Level',
    venueType: 'Sports Ground',
    capacity: 1500,
    description: 'FIFA-standard synthetic turf sports arena with floodlights, covered spectator pavilions, and athletic track.',
    amenities: ['Floodlighting', 'Pavilion Seating', 'First-Aid Bay', 'Locker Rooms', 'Equipment Vault'],
    availabilityStatus: 'available',
    verificationStatus: 'verified'
  },
  {
    name: 'School of Design Creative Studio',
    slug: 'design-creative-studio',
    campus: 'Harohalli Main Campus',
    building: 'Design Block 2',
    floor: '2nd Floor',
    venueType: 'Smart Classroom',
    capacity: 80,
    description: 'Collaborative workshop space for UI/UX sprints, design critique, and generative media prototyping.',
    amenities: ['Drawing Easels', 'Large-Format Displays', 'Modular Tables', 'Color-Accurate Lighting'],
    availabilityStatus: 'available',
    verificationStatus: 'verified'
  },
  {
    name: 'Harohalli Open-Air Amphitheater',
    slug: 'harohalli-open-air-amphitheater',
    campus: 'Harohalli Main Campus',
    building: 'Central Quadrangle',
    floor: 'Open Air',
    venueType: 'Amphitheater',
    capacity: 500,
    description: 'Acoustically sheltered open-air forum for cultural fests, theatre productions, and university music ensembles.',
    amenities: ['Acoustic Shell', 'Performance Stage', 'Ambient Illumination', 'Tiered Stone Seating'],
    availabilityStatus: 'available',
    verificationStatus: 'verified'
  }
];

router.get(
  '/',
  asyncHandler(async (req, res) => {
    let venues = await Venue.find({ availabilityStatus: 'available' }).sort({ campus: 1, name: 1 }).lean();
    if (venues.length === 0) {
      venues = DEFAULT_DSU_VENUES;
    }
    return ok(res, venues);
  })
);

export default router;

