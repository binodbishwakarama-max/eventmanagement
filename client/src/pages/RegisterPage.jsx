import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DsuLogo } from '../components/DsuLogo';
import {
  Eye,
  EyeOff,
  Ticket,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  GraduationCap
} from 'lucide-react';
import toast from 'react-hot-toast';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    usn: '',
    department: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({
        ...formData,
        rollNumber: formData.usn
      });
      toast.success('Student account registered successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickStudentDemo = (num) => {
    setFormData({
      name: `Student Demo ${num}`,
      email: `newstudent${num}@dsu.edu.in`,
      password: 'Student@123',
      usn: `1DS22CS0${50 + num}`,
      department: 'School of Engineering (Computer Science)'
    });
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-4 sm:p-6 lg:p-12">
      <div className="max-w-5xl w-full dsu-card overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-xl border border-[#E5E7EB]">
        {/* Left Visual Panel: Pass & Campus Benefits */}
        <div className="lg:col-span-5 bg-[#001B36] text-white p-8 sm:p-10 flex flex-col justify-between relative border-r border-[#D9A521]/20">
          <div>
            <div className="mb-8">
              <DsuLogo variant="white" size="md" />
            </div>

            <span className="text-xs font-semibold uppercase tracking-wider text-[#D9A521] block mb-2">
              Student Registration
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              One university pass for all campus symposia.
            </h2>
            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              Register hackathon passes, workshop seats, and cultural showcase tickets with instant USN check-in.
            </p>
          </div>

          {/* Interactive Digital Pass Mockup Preview */}
          <div className="my-8 bg-[#002447] border border-blue-900/50 rounded-2xl p-5 shadow-inner">
            <div className="flex items-center justify-between pb-3 border-b border-blue-900/40 text-xs">
              <div className="flex items-center gap-2 font-bold tracking-wider text-[#D9A521]">
                <Ticket className="w-4 h-4" />
                <span className="text-xs uppercase font-semibold">STUDENT PASS</span>
              </div>
              <span className="font-mono text-slate-300 text-xs">DSU-PASS-2026</span>
            </div>

            <div className="pt-3.5 space-y-2">
              <p className="text-sm font-extrabold text-white">
                {formData.name || 'Sample Student Pass'}
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                <div>
                  <span className="block text-slate-400 text-xs uppercase tracking-wider font-medium">University USN</span>
                  <span className="font-mono font-bold text-[#D9A521]">{formData.usn || '1DS22CS042'}</span>
                </div>
                <div>
                  <span className="block text-slate-400 text-xs uppercase tracking-wider font-medium">Access Tier</span>
                  <span className="font-semibold text-emerald-400">Verified Scholar</span>
                </div>
              </div>
            </div>

            {/* Perforated divider */}
            <div className="mt-4 pt-3 border-t border-dashed border-slate-700 flex items-center justify-between text-xs text-slate-300">
              <span className="uppercase tracking-wider font-semibold">Scan Desk Pass</span>
              <span className="text-emerald-400 font-bold">READY</span>
            </div>
          </div>

          {/* Student Benefits Highlights */}
          <div className="space-y-2 text-xs text-slate-300 border-t border-blue-900/50 pt-5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#D9A521] shrink-0" />
              <span>Instant digital passes & gate verification codes</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#D9A521] shrink-0" />
              <span>Priority reservations for limited-capacity symposiums</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#D9A521] shrink-0" />
              <span>Harohalli Main Campus & Kudlu Innovation Campus</span>
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="lg:col-span-7 p-8 sm:p-10 lg:p-12 flex flex-col justify-between bg-white">
          <div>
            <div className="flex items-center justify-between gap-4 mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#002B55] block mb-1">
                  New Student Registration
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#002B55]">
                  Create Student Profile
                </h1>
              </div>

              <Link
                to="/login"
                className="text-xs font-semibold text-[#002B55] hover:text-[#D9A521] transition"
              >
                Sign In Instead →
              </Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label htmlFor="register-name" className="block font-semibold text-slate-700 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  id="register-name"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] focus:border-[#002B55] rounded-xl text-sm text-[#172033] placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#002B55] transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="register-usn" className="block font-semibold text-slate-700 mb-1.5">
                    University USN / ID *
                  </label>
                  <input
                    type="text"
                    name="usn"
                    id="register-usn"
                    required
                    placeholder="e.g. 1DS22CS042"
                    value={formData.usn}
                    onChange={(e) => setFormData({ ...formData, usn: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] focus:border-[#002B55] rounded-xl text-sm font-mono text-[#172033] placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#002B55] transition"
                  />
                </div>

                <div>
                  <label htmlFor="register-department" className="block font-semibold text-slate-700 mb-1.5">
                    School / Department
                  </label>
                  <input
                    type="text"
                    name="department"
                    id="register-department"
                    placeholder="e.g. School of Engineering (CSE)"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] focus:border-[#002B55] rounded-xl text-sm text-[#172033] placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#002B55] transition"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="register-email" className="block font-semibold text-slate-700 mb-1.5">
                  Student Email *
                </label>
                <input
                  type="email"
                  name="email"
                  id="register-email"
                  required
                  placeholder="e.g. student@dsu.edu.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] focus:border-[#002B55] rounded-xl text-sm text-[#172033] placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#002B55] transition"
                />
              </div>

              <div>
                <label htmlFor="register-password" className="block font-semibold text-slate-700 mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    id="register-password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-4 pr-11 py-2.5 bg-white border border-[#E5E7EB] focus:border-[#002B55] rounded-xl text-sm text-[#172033] placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#002B55] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-[#002B55] hover:bg-[#001B36] text-white font-semibold text-xs py-3 rounded-full transition shadow-xs active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? 'Creating Student Profile...' : 'Complete Registration & Enter'}
              </button>
            </form>

            {/* Quick Demo Pre-fills */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-2">
                Evaluation Demo Student Pre-fills
              </span>
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleQuickStudentDemo(num)}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-[#E5E7EB] text-xs font-medium text-slate-700 transition text-center"
                  >
                    Student {num}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
