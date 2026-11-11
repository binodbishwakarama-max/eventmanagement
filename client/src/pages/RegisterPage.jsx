import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DsuLogo } from '../components/DsuLogo';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { parseDsuIdentity } from '../utils/dsuRollParser';
import { registerSchema } from '../features/auth/schemas';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  GraduationCap,
  Building2,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const DEPARTMENTS = [
  'School of Engineering',
  'School of Computer Applications',
  'School of Commerce & Management Studies',
  'School of Basic & Applied Sciences',
  'School of Health Sciences',
  'School of Design',
  'School of Law',
  'School of Arts & Humanities'
];

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
    setFormData((prev) => {
      const next = {
        ...prev,
        [name]: name === 'usn' ? value.toUpperCase().trim() : value
      };
      if (name === 'email') {
        const parsed = parseDsuIdentity(value);
        if (parsed) {
          if (!prev.usn || prev.usn.length < 5) next.usn = parsed.usn;
          if (parsed.department) next.department = parsed.department;
        }
      }
      return next;
    });
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleGoogleSuccess = ({ isNew }) => {
    if (isNew) {
      navigate('/onboarding');
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    const normalizedEmail = formData.email.includes('@')
      ? formData.email.toLowerCase().trim()
      : `${formData.email.toLowerCase().trim()}@dsu.edu.in`;

    const validation = registerSchema.safeParse({
      ...formData,
      email: normalizedEmail
    });
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
        email: normalizedEmail,
        password: formData.password,
        usn: formData.usn,
        rollNumber: formData.usn,
        department: formData.department.trim()
      });
      toast.success('Registration successful! Welcome to DSU Campus.');
      navigate('/onboarding');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-14 selection:bg-[#002B55] selection:text-white">
      <div className="w-full max-w-lg mx-auto">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,43,85,0.06)] border border-slate-100">
          {/* Logo & Headline */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <DsuLogo size="lg" className="mx-auto" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Create Student Account
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Join official Dayananda Sagar University campus events
            </p>
          </div>

          {/* Quick Sign-In with Google */}
          <div className="mb-5">
            <GoogleSignInButton onSuccess={handleGoogleSuccess} />

            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 absolute">
                or register with institutional email
              </span>
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
            {/* Full Name */}
            <div>
              <label htmlFor="reg-name" className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  id="reg-name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Aarav Sharma"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002B55]/20 focus:border-[#002B55] transition ${
                    fieldErrors.name ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                  }`}
                />
              </div>
              {fieldErrors.name && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{fieldErrors.name}</span>
                </p>
              )}
            </div>

            {/* University Email */}
            <div>
              <label htmlFor="reg-email" className="block text-xs font-semibold text-slate-700 mb-1">
                Institutional Email (@dsu.edu.in) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  id="reg-email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. eng25cs0453@dsu.edu.in"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002B55]/20 focus:border-[#002B55] transition ${
                    fieldErrors.email ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                  }`}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{fieldErrors.email}</span>
                </p>
              )}
            </div>

            {/* USN / Roll Number & Department in 2 columns on tablet, 1 on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="reg-usn" className="block text-xs font-semibold text-slate-700 mb-1">
                  USN / Roll Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    id="reg-usn"
                    name="usn"
                    required
                    value={formData.usn}
                    onChange={handleChange}
                    placeholder="ENG25CS0453"
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 uppercase focus:outline-none focus:ring-2 focus:ring-[#002B55]/20 focus:border-[#002B55] transition ${
                      fieldErrors.usn ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                    }`}
                  />
                </div>
                {fieldErrors.usn && (
                  <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{fieldErrors.usn}</span>
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="reg-department" className="block text-xs font-semibold text-slate-700 mb-1">
                  School / Faculty <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    id="reg-department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#002B55]/20 focus:border-[#002B55] transition appearance-none"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="block text-xs font-semibold text-slate-700 mb-1">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="reg-password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 8 characters, 1 uppercase, 1 number"
                  className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002B55]/20 focus:border-[#002B55] transition ${
                    fieldErrors.password ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{fieldErrors.password}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#002B55] hover:bg-[#001D3A] text-white text-xs sm:text-sm font-semibold shadow-xs active:scale-98 transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Create Student Account'
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-[#002B55] hover:underline">
                Sign In
              </Link>
            </p>
            <div className="flex items-center justify-center gap-1.5 mt-2.5 text-[10px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Dayananda Sagar University • Academic Security</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
