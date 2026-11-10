import { Router } from 'express';
import { Club } from '../../models/Club.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ok } from '../../utils/respond.js';

const router = Router();

export const DEFAULT_DSU_CLUBS = [
  {
    name: 'DSU Developer Student Club',
    slug: 'dsu-developer-student-club',
    category: 'Technical',
    campus: 'Harohalli Main Campus',
    description: 'Technical community dedicated to software architecture, open source contribution, mobile dev, and annual hackathons.',
    facultyAdvisorName: 'Dr. Ramesh K.',
    studentCoordinatorName: 'Rahul Sharma',
    membershipStatus: 'open',
    isActive: true,
    verificationStatus: 'verified'
  },
  {
    name: 'DSU Robotics & Automation Society',
    slug: 'dsu-robotics-society',
    category: 'Technical',
    campus: 'Harohalli Main Campus',
    description: 'Hardware, autonomous navigation, drone telemetry, and embedded systems makerspace.',
    facultyAdvisorName: 'Prof. S. Rao',
    studentCoordinatorName: 'Priya Verma',
    membershipStatus: 'open',
    isActive: true,
    verificationStatus: 'verified'
  },
  {
    name: 'DSU Design Guild',
    slug: 'dsu-design-guild',
    category: 'Cultural',
    campus: 'Harohalli Main Campus',
    description: 'Student designers, UI/UX researchers, visual artists, and digital animators from the School of Design.',
    facultyAdvisorName: 'Prof. Ananya Sen',
    studentCoordinatorName: 'Aditi Joshi',
    membershipStatus: 'open',
    isActive: true,
    verificationStatus: 'verified'
  },
  {
    name: 'DSU Cultural & Music Forum',
    slug: 'dsu-cultural-forum',
    category: 'Cultural',
    campus: 'Harohalli Main Campus',
    description: 'Fosters performing arts, western and classical music, theatrical drama, and annual university fests.',
    facultyAdvisorName: 'Dr. Meenakshi Sundaram',
    studentCoordinatorName: 'Karthik N.',
    membershipStatus: 'open',
    isActive: true,
    verificationStatus: 'verified'
  },
  {
    name: 'DSU Sports & Athletics Council',
    slug: 'dsu-sports-council',
    category: 'Sports',
    campus: 'Harohalli Main Campus',
    description: 'Coordinates varsity tournaments, inter-collegiate leagues, football, cricket, basketball, and fitness initiatives.',
    facultyAdvisorName: 'Capt. Vijay Kumar',
    studentCoordinatorName: 'Tanvi Patel',
    membershipStatus: 'open',
    isActive: true,
    verificationStatus: 'verified'
  }
];

router.get(
  '/',
  asyncHandler(async (req, res) => {
    let clubs = await Club.find({ isActive: true }).sort({ category: 1, name: 1 }).lean();
    if (clubs.length === 0) {
      clubs = DEFAULT_DSU_CLUBS;
    }
    return ok(res, clubs);
  })
);

export default router;

