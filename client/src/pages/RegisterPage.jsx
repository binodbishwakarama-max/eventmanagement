import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DsuLogo } from '../components/DsuLogo';
import { registerSchema } from '../features/auth/schemas';
import {
  Eye,
  EyeOff,
  Ticket,
  CheckCircle2,
  ArrowRight,
  ShieldCheck
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
    department: 'School of Engineering'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'usn' ? value.toUpperCase().trim() : value
    }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    const validation = registerSchema.safeParse(formData);
    if (!validation.success) {
      const errors = {};
      for (const issue of validation.error.issues) {
        const field = issue.path[0];
        if (!errors[field]) errors[field] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        usn: formData.usn,
        rollNumber: formData.usn,
        department: formData.department.trim()
      });
      toast.success('Student account registered successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] min-h-[calc(100dvh-140px)] flex items-center justify-center p-3 sm:p-6 lg:p-12 bg-slate-50">
      <div className="max-w-5xl w-full bg-white rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-xl border border-slate-200">
        {/* Left Column: Brand & Digital Pass preview */}
        {/* Institutional brand column with authentic DSU Harohalli Campus Backdrop */}
        <div className="lg:col-span-5 bg-blue-950 text-white p-6 sm:p-8 lg:p-10 flex flex-col justify-between relative border-r border-amber-500/20 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30 pointer-events-none dsu-auth-backdrop"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#00142A] via-[#001B36]/85 to-[#002244]/80 pointer-events-none" />

          <div className="relative z-10">
            <div className="mb-8">
              <DsuLogo variant="white" size="md" />
            </div>

            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 block mb-2">
              Official Student Enrollment
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              DSU Campus Life & Event Gateway
            </h2>
            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              Enroll with your Dayananda Sagar University credentials to participate in varsity
              hackathons, academic symposiums, and cultural festivals.
            </p>
          </div>

          {/* Interactive Digital Pass Preview */}
          <div className="my-8 bg-blue-900/60 border border-blue-800 rounded-2xl p-5 shadow-inner">
            <div className="flex items-center justify-between pb-3 border-b border-blue-800/80 text-xs">
              <div className="flex items-center gap-2 font-bold tracking-wider text-amber-400">
                <Ticket className="w-4 h-4" />
                <span className="text-xs uppercase font-semibold">DIGITAL PASS PREVIEW</span>
              </div>
              <span className="font-mono text-emerald-400 text-xs flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                VERIFIED ID
              </span>
            </div>

            <div className="pt-3.5 space-y-2">
              <p className="text-sm font-extrabold text-white">
                {formData.name || 'Student Name'}
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                <div>
                  <span className="block text-slate-400 text-[10px] uppercase tracking-wider font-semibold">
                    University USN
                  </span>
                  <span className="font-mono font-bold text-amber-400">
                    {formData.usn || '1DS23CS001'}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-400 text-[10px] uppercase tracking-wider font-semibold">
                    Department
                  </span>
                  <span className="font-semibold text-slate-200 truncate block">
                    {formData.department || 'School of Engineering'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-dashed border-blue-700/80 flex items-center justify-between text-xs text-slate-300">
              <span className="uppercase tracking-wider font-semibold text-[10px]">DSU Event Pass</span>
              <span className="text-emerald-400 font-bold text-[10px]">ENCRYPTED QR</span>
            </div>
          </div>

          {/* Student Benefits Highlights */}
          <div className="space-y-2 text-xs text-slate-300 border-t border-blue-900/60 pt-5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Official admission QR passes with tamper-proof hashing</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Real-time seat quotas & live venue coordination</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Harohalli Main Campus, Kanakapura Road (130-Acre Grounds)</span>
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="lg:col-span-7 p-8 sm:p-10 lg:p-12 flex flex-col justify-between bg-white">
          <div>
            <div className="flex items-center justify-between gap-4 mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-900 block mb-1">
                  Student Enrollment
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                  Create Student Profile
                </h1>
              </div>

              <Link
                to="/login"
                className="text-xs font-bold text-blue-900 hover:text-blue-800 underline decoration-slate-300 hover:decoration-blue-900 underline-offset-4"
              >
                Sign In Instead →
              </Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs" noValidate>
              {/* Full Name */}
              <div>
                <label
                  htmlFor="register-name"
                  className="block font-semibold text-slate-700 mb-1.5"
                >
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  id="register-name"
                  required
                  placeholder="e.g. Aarav Sharma"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition ${
                    fieldErrors.name
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-300 focus:ring-blue-900 focus:border-blue-900'
                  }`}
                />
                {fieldErrors.name && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.name}</p>
                )}
              </div>

              {/* USN & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="register-usn"
                    className="block font-semibold text-slate-700 mb-1.5"
                  >
                    DSU USN <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="usn"
                    id="register-usn"
                    required
                    placeholder="e.g. 1DS23CS045"
                    value={formData.usn}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition ${
                      fieldErrors.usn
                        ? 'border-rose-400 focus:ring-rose-200'
                        : 'border-slate-300 focus:ring-blue-900 focus:border-blue-900'
                    }`}
                  />
                  {fieldErrors.usn && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.usn}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="register-department"
                    className="block font-semibold text-slate-700 mb-1.5"
                  >
                    School / Department <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="department"
                    id="register-department"
                    required
                    placeholder="e.g. Computer Science"
                    value={formData.department}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition ${
                      fieldErrors.department
                        ? 'border-rose-400 focus:ring-rose-200'
                        : 'border-slate-300 focus:ring-blue-900 focus:border-blue-900'
                    }`}
                  />
                  {fieldErrors.department && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">
                      {fieldErrors.department}
                    </p>
                  )}
                </div>
              </div>

              {/* University Email */}
              <div>
                <label
                  htmlFor="register-email"
                  className="block font-semibold text-slate-700 mb-1.5"
                >
                  Student Email (@dsu.edu.in) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  id="register-email"
                  required
                  placeholder="e.g. aarav.sharma@dsu.edu.in"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition ${
                    fieldErrors.email
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-300 focus:ring-blue-900 focus:border-blue-900'
                  }`}
                />
                {fieldErrors.email && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="register-password"
                  className="block font-semibold text-slate-700 mb-1.5"
                >
                  Password (min 8 characters, uppercase, number) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    id="register-password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-4 pr-11 py-2.5 bg-white border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition ${
                      fieldErrors.password
                        ? 'border-rose-400 focus:ring-rose-200'
                        : 'border-slate-300 focus:ring-blue-900 focus:border-blue-900'
                    }`}
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
                {fieldErrors.password && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.password}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 bg-blue-900 hover:bg-blue-800 text-white font-semibold text-sm py-3 rounded-xl transition shadow flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating Student Profile...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Enrollment & Enter</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Dayananda Sagar University Official Portal</span>
            <Link to="/login" className="hover:text-blue-900 font-medium">
              Existing Account Sign In →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
