/**
 * Dayananda Sagar University (DSU) Academic Identity & Roll Parser
 * Parses college emails (e.g., eng25cs0453@dsu.edu.in) and USNs (e.g., 1DS23CS045, ENG25AIML012)
 * to automatically extract branch, department, school, batch, and enrollment details.
 */

const BRANCH_MAP = {
  // Computer Science & Core IT
  cs: { name: 'Computer Science & Engineering', short: 'CSE', degree: 'B.Tech', school: 'School of Engineering & Technology' },
  cse: { name: 'Computer Science & Engineering', short: 'CSE', degree: 'B.Tech', school: 'School of Engineering & Technology' },
  aiml: { name: 'Artificial Intelligence & Machine Learning', short: 'AI & ML', degree: 'B.Tech', school: 'School of Engineering & Technology' },
  ai: { name: 'Artificial Intelligence & Machine Learning', short: 'AI & ML', degree: 'B.Tech', school: 'School of Engineering & Technology' },
  ds: { name: 'Data Science & Big Data Analytics', short: 'Data Science', degree: 'B.Tech', school: 'School of Engineering & Technology' },
  cnds: { name: 'Computer Networks & Data Science', short: 'CNDS', degree: 'B.Tech', school: 'School of Engineering & Technology' },
  cy: { name: 'Cyber Security & Forensic Computing', short: 'Cyber Security', degree: 'B.Tech', school: 'School of Engineering & Technology' },
  cscy: { name: 'Cyber Security & Forensic Computing', short: 'Cyber Security', degree: 'B.Tech', school: 'School of Engineering & Technology' },
  is: { name: 'Information Science & Technology', short: 'ISE', degree: 'B.Tech', school: 'School of Engineering & Technology' },
  ise: { name: 'Information Science & Technology', short: 'ISE', degree: 'B.Tech', school: 'School of Engineering & Technology' },

  // Electronics & Emerging Hardware
  ec: { name: 'Electronics & Communication Engineering', short: 'ECE', degree: 'B.Tech', school: 'School of Engineering & Technology' },
  ece: { name: 'Electronics & Communication Engineering', short: 'ECE', degree: 'B.Tech', school: 'School of Engineering & Technology' },
  ee: { name: 'Electrical & Electronics Engineering', short: 'EEE', degree: 'B.Tech', school: 'School of Engineering & Technology' },
  eee: { name: 'Electrical & Electronics Engineering', short: 'EEE', degree: 'B.Tech', school: 'School of Engineering & Technology' },

  // Mechanical, Aerospace, Biotech
  ae: { name: 'Aerospace Engineering', short: 'Aerospace', degree: 'B.Tech', school: 'School of Engineering & Technology' },
  aero: { name: 'Aerospace Engineering', short: 'Aerospace', degree: 'B.Tech', school: 'School of Engineering & Technology' },
  me: { name: 'Mechanical Engineering', short: 'Mechanical', degree: 'B.Tech', school: 'School of Engineering & Technology' },
  mech: { name: 'Mechanical Engineering', short: 'Mechanical', degree: 'B.Tech', school: 'School of Engineering & Technology' },
  bt: { name: 'Biotechnology & Bioinformatics', short: 'Biotech', degree: 'B.Tech', school: 'School of Basic & Applied Sciences' },
  cv: { name: 'Civil Engineering', short: 'Civil', degree: 'B.Tech', school: 'School of Engineering & Technology' },

  // Design, Management, Pharmacy, Law
  des: { name: 'User Experience & Interaction Design', short: 'B.Des', degree: 'B.Des', school: 'School of Design' },
  ux: { name: 'User Experience & Interaction Design', short: 'B.Des UX', degree: 'B.Des', school: 'School of Design' },
  bba: { name: 'Bachelor of Business Administration', short: 'BBA', degree: 'BBA', school: 'School of Commerce & Management Studies' },
  mba: { name: 'Master of Business Administration', short: 'MBA', degree: 'MBA', school: 'School of Commerce & Management Studies' },
  phar: { name: 'Pharmaceutical Sciences', short: 'Pharmacy', degree: 'B.Pharm', school: 'College of Pharmaceutical Sciences' },
  law: { name: 'School of Law', short: 'Law', degree: 'BA LLB / BBA LLB', school: 'School of Law' }
};

export function parseDsuIdentity(input = '') {
  if (!input || typeof input !== 'string') return null;

  const raw = input.trim().toLowerCase();
  // Strip @dsu.edu.in if present
  const cleaned = raw.split('@')[0];

  // Pattern 1: DSU Enrollment Format e.g. "eng25cs0453", "eng24aiml012", "eng23ds088", "des24ux019"
  // ^(eng|des|som|phar|law)?(\d{2})([a-z]{2,5})(\d{2,5})$
  const match1 = cleaned.match(/^(?:([a-z]{3,4})_?)?(\d{2})([a-z]{2,5})_?(\d{2,5})$/i);
  if (match1) {
    const [, schoolPrefix, yearDigits, branchCode, rollDigits] = match1;
    const branchInfo = BRANCH_MAP[branchCode.toLowerCase()];

    const admissionYear = 2000 + parseInt(yearDigits, 10);
    const graduationYear = admissionYear + (branchInfo?.degree?.includes('MBA') ? 2 : 4);

    return {
      usn: (cleaned).toUpperCase(),
      email: `${cleaned}@dsu.edu.in`,
      department: branchInfo ? branchInfo.name : 'School of Engineering & Technology',
      shortBranch: branchInfo ? branchInfo.short : branchCode.toUpperCase(),
      school: branchInfo ? branchInfo.school : 'School of Engineering & Technology',
      degree: branchInfo ? branchInfo.degree : 'B.Tech',
      admissionYear,
      graduationYear,
      rollNumber: rollDigits,
      badgeText: `🎓 ${branchInfo ? branchInfo.short : branchCode.toUpperCase()} • Class of ${graduationYear}`
    };
  }

  // Pattern 2: Traditional DSU/VTU USN Format e.g. "1DS23CS045", "1DS22AIML012"
  const match2 = cleaned.match(/^1ds(\d{2})([a-z]{2,5})(\d{3,4})$/i);
  if (match2) {
    const [, yearDigits, branchCode, rollDigits] = match2;
    const branchInfo = BRANCH_MAP[branchCode.toLowerCase()];
    const admissionYear = 2000 + parseInt(yearDigits, 10);
    const graduationYear = admissionYear + 4;

    return {
      usn: cleaned.toUpperCase(),
      email: `${cleaned}@dsu.edu.in`,
      department: branchInfo ? branchInfo.name : 'School of Engineering & Technology',
      shortBranch: branchInfo ? branchInfo.short : branchCode.toUpperCase(),
      school: branchInfo ? branchInfo.school : 'School of Engineering & Technology',
      degree: branchInfo ? branchInfo.degree : 'B.Tech',
      admissionYear,
      graduationYear,
      rollNumber: rollDigits,
      badgeText: `🎓 ${branchInfo ? branchInfo.short : branchCode.toUpperCase()} • Class of ${graduationYear}`
    };
  }

  return null;
}
