import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  ShieldCheck,
  Building,
  GraduationCap,
  Globe,
  Award
} from 'lucide-react';
import { DsuLogo } from './DsuLogo';

export function Footer() {
  return (
    <footer className="bg-[#001B36] text-white border-t-2 border-[#D9A521]/30">
      {/* Top Gold Accent Line */}
      <div className="dsu-gold-bar"></div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-10 border-b border-blue-900/40">
          {/* Col 1: University Identity & Trust */}
          <div className="lg:col-span-4 space-y-4">
            <DsuLogo variant="white" size="lg" />

            <p className="text-xs text-slate-300 leading-relaxed pt-2">
              Established under the Karnataka Act No. 20 of 2014. Dayananda Sagar University is part of the Mahatma Gandhi Vidya Peetha (MGVP) trust legacy, dedicated to excellence in education, transformative research, and holistic student development.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <span className="px-2.5 py-1 rounded bg-[#002B55] border border-[#D9A521]/40 text-[11px] font-semibold text-[#D9A521]">
                UGC Recognized
              </span>
              <span className="px-2.5 py-1 rounded bg-[#002B55] border border-[#D9A521]/40 text-[11px] font-semibold text-[#D9A521]">
                AICTE Approved
              </span>
              <span className="px-2.5 py-1 rounded bg-[#002B55] border border-[#D9A521]/40 text-[11px] font-semibold text-[#D9A521]">
                NAAC Accredited
              </span>
            </div>
          </div>

          {/* Col 2: Campuses & Address */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#D9A521] flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5" />
              <span>University Campuses</span>
            </h4>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3.5 rounded-xl bg-[#002447] border border-blue-900/60">
                <p className="font-bold text-white flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#D9A521]" /> Main Campus (Harohalli)
                </p>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Devarakaggalahalli, Harohalli, Kanakapura Road, Ramanagara District, Bengaluru, Karnataka – 562112
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#002447] border border-blue-900/60">
                <p className="font-bold text-white flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#D9A521]" /> City Innovation Campus
                </p>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Kudlu Gate, Hosur Main Road, Bengaluru, Karnataka – 560114
                </p>
              </div>
            </div>
          </div>

          {/* Col 3: Examination & Admission Codes */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#D9A521] flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              <span>Official Institutional Codes</span>
            </h4>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-2.5 rounded-lg bg-[#002447] flex justify-between items-center border border-blue-900/30">
                <span className="text-slate-400">CET Code (Engg):</span>
                <strong className="text-white font-mono font-bold">E240</strong>
              </div>
              <div className="p-2.5 rounded-lg bg-[#002447] flex justify-between items-center border border-blue-900/30">
                <span className="text-slate-400">COMED-K Code:</span>
                <strong className="text-white font-mono font-bold">E182</strong>
              </div>
              <div className="p-2.5 rounded-lg bg-[#002447] flex justify-between items-center border border-blue-900/30">
                <span className="text-slate-400">PGCET Code (MBA):</span>
                <strong className="text-white font-mono font-bold">B365MB</strong>
              </div>
              <div className="p-2.5 rounded-lg bg-[#002447] flex justify-between items-center border border-blue-900/30">
                <span className="text-slate-400">PGCET Code (MCA):</span>
                <strong className="text-white font-mono font-bold">C520MC</strong>
              </div>
            </div>
          </div>

          {/* Col 4: Quick Links & Contact */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#D9A521] flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              <span>Contact & Portals</span>
            </h4>

            <div className="space-y-2 text-xs">
              <a
                href="https://www.dsu.edu.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-white flex items-center justify-between transition-colors"
              >
                <span>Official Website</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
              <a
                href="https://www.dsu.edu.in/admissions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-white flex items-center justify-between transition-colors"
              >
                <span>DSAT Admissions</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
              <Link to="/events" className="text-slate-300 hover:text-white block transition-colors">
                Browse Campus Events
              </Link>
              <Link to="/dashboard" className="text-slate-300 hover:text-white block transition-colors">
                Student Passbook
              </Link>
              <Link to="/admin" className="text-slate-300 hover:text-white block transition-colors">
                Organizer Desk
              </Link>
            </div>

            <div className="pt-2 text-xs text-slate-300 space-y-1.5">
              <p className="flex items-center gap-1.5 font-medium">
                <Phone className="w-3.5 h-3.5 text-[#D9A521]" /> 080 46461800
              </p>
              <p className="flex items-center gap-1.5 truncate font-medium">
                <Mail className="w-3.5 h-3.5 text-[#D9A521]" /> events@dsu.edu.in
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Dayananda Sagar University (DSU). All rights reserved.</p>
          <p className="text-slate-400">
            Dayananda Sagar Institutions • Mahatma Gandhi Vidya Peetha Trust
          </p>
        </div>
      </div>
    </footer>
  );
}
