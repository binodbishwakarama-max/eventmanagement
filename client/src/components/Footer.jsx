import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, MapPin, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#001B36] text-white border-t-2 border-[#D9A521]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Main Institution Info */}
          <div className="md:col-span-6 space-y-3">
            <div className="flex items-center gap-2.5 font-bold text-base text-white">
              <div className="w-8 h-8 rounded-lg bg-[#002B55] text-[#D9A521] border border-[#D9A521]/40 flex items-center justify-center">
                <CalendarDays className="w-4 h-4 text-[#D9A521]" aria-hidden="true" />
              </div>
              <span>Dayananda Sagar University • Campus Events</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-lg">
              The official centralized platform for technical symposiums, hackathons, cultural festivals,
              club gatherings, and varsity athletics across DSU Harohalli Main Campus.
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#D9A521]" />
                <span>Harohalli Main Campus, Kanakapura Road, Bengaluru</span>
              </span>
              <span className="hidden sm:inline text-slate-600">•</span>
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#D9A521]" />
                <span>events@dsu.edu.in</span>
              </span>
            </div>
          </div>

          {/* Quick Nav Links */}
          <div className="md:col-span-3 space-y-2.5">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#D9A521] block">
              Quick Navigation
            </span>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <Link to="/events" className="inline-block py-1 hover:text-white transition">Explore Gatherings</Link>
              </li>
              <li>
                <Link to="/dashboard" className="inline-block py-1 hover:text-white transition">Student E-Passbook</Link>
              </li>
              <li>
                <Link to="/admin" className="inline-block py-1 hover:text-white transition">Operations Console</Link>
              </li>
              <li>
                <Link to="/login" className="inline-block py-1 hover:text-white transition">Institutional Sign In</Link>
              </li>
              <li>
                <Link to="/register" className="inline-block py-1 hover:text-white transition">Student Registration</Link>
              </li>
            </ul>
          </div>

          {/* Campus Grounds Info */}
          <div className="md:col-span-3 space-y-2.5">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#D9A521] block">
              Main Campus Grounds
            </span>
            <div className="text-xs text-slate-300 space-y-2">
              <div>
                <p className="font-semibold text-white">Harohalli Main Campus (130 Acres)</p>
                <p className="text-[11px] text-slate-400">Kanakapura Road, Bengaluru South - 562112</p>
              </div>
              <div className="pt-1 text-[11px] text-slate-400 space-y-1">
                <p>• NAAC A+ Accredited University</p>
                <p>• Engineering, Design & Health Sciences</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-blue-900/50 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Dayananda Sagar University. All rights reserved. Office of Student Affairs & Campus Life.</p>
          <p className="text-[11px] text-slate-400 font-mono">Platform Version 2.0 • Institutional Deployment</p>
        </div>
      </div>
    </footer>
  );
}
