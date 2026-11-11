import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useAuth } from './context/AuthContext';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { EventsPage } from './pages/EventsPage';

const EventDetailPage = lazy(() =>
  import('./pages/EventDetailPage').then((m) => ({ default: m.EventDetailPage }))
);
const StudentDashboard = lazy(() =>
  import('./pages/StudentDashboard').then((m) => ({ default: m.StudentDashboard }))
);
const AdminDashboard = lazy(() =>
  import('./pages/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);
const AttendancePage = lazy(() =>
  import('./pages/AttendancePage').then((m) => ({ default: m.AttendancePage }))
);
const CreateEventPage = lazy(() =>
  import('./pages/CreateEventPage').then((m) => ({ default: m.CreateEventPage }))
);
const EditEventPage = lazy(() =>
  import('./pages/EditEventPage').then((m) => ({ default: m.EditEventPage }))
);
const LoginPage = lazy(() =>
  import('./pages/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const RegisterPage = lazy(() =>
  import('./pages/RegisterPage').then((m) => ({ default: m.RegisterPage }))
);
const ResetPasswordPage = lazy(() =>
  import('./pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage }))
);
const OnboardingPage = lazy(() =>
  import('./pages/OnboardingPage').then((m) => ({ default: m.OnboardingPage }))
);

function PageLoadingFallback() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center min-h-[40vh]">
      <div className="w-8 h-8 border-2 border-[#002B55] border-t-transparent rounded-full animate-spin mb-3" />
      <p className="text-xs text-slate-500 font-mono">Loading campus portal...</p>
    </div>
  );
}

function ProtectedRoute({ children, allowedRoles }) {
  const { user, isBootstrapping } = useAuth();
  const location = useLocation();

  if (isBootstrapping) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-8 h-8 border-2 border-[#002B55] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-slate-500 font-mono">Restoring university session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/events" replace />;
  }

  return children;
}

export function App() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F7F8FA] text-[#172033]">
      <Navbar />
      <main className="flex-1 flex flex-col pb-20 md:pb-0">
        <ErrorBoundary>
          <Suspense fallback={<PageLoadingFallback />}>
            <Routes>
            <Route path="/" element={<EventsPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />

            {/* Student Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['student', 'admin', 'organizer']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin & Organizer Protected Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin', 'organizer']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/events/new"
              element={
                <ProtectedRoute allowedRoles={['admin', 'organizer']}>
                  <CreateEventPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/events/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['admin', 'organizer']}>
                  <EditEventPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/events/:id/attendance"
              element={
                <ProtectedRoute allowedRoles={['admin', 'organizer']}>
                  <AttendancePage />
                </ProtectedRoute>
              }
            />

            {/* Auth & Duolingo Onboarding */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* 404 Catch All */}
            <Route
              path="*"
              element={
                <div className="flex-1 flex flex-col items-center justify-center py-28 px-4 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 text-[#002B55] mx-auto">
                    <ShieldAlert className="w-7 h-7 text-rose-600" />
                  </div>
                  <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                    Page Not Found (404)
                  </h1>
                  <p className="text-slate-500 text-xs mt-1.5 max-w-sm mx-auto leading-relaxed">
                    The requested university event page or administrative console does not exist.
                  </p>
                  <Link
                    to="/events"
                    className="mt-6 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#002B55] hover:bg-[#001B36] text-white text-xs font-semibold shadow-xs transition"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Return to Events
                  </Link>
                </div>
              }
            />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </main>
    <Footer />
    <MobileBottomNav />
    </div>
  );
}
