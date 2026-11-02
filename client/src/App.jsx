import React from 'react';
import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { EventsPage } from './pages/EventsPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AttendancePage } from './pages/AttendancePage';
import { CreateEventPage } from './pages/CreateEventPage';
import { EditEventPage } from './pages/EditEventPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { useAuth } from './context/AuthContext';
import { ArrowLeft } from 'lucide-react';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, isBootstrapping } = useAuth();
  const location = useLocation();

  if (isBootstrapping) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-6 h-6 border-2 border-[#0071E3] border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs text-[#86868B] font-medium tracking-tight">Verifying DSU session...</p>
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
    <div className="flex flex-col min-h-screen bg-[#FAFAFC] text-[#1D1D1F]">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<Navigate to="/events" replace />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />

          {/* Student Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin & Organizer Routes */}
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

          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* 404 Catch All */}
          <Route
            path="*"
            element={
              <div className="flex-1 flex flex-col items-center justify-center py-28 px-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-black/[0.04] flex items-center justify-center mb-4 text-[#86868B] font-mono text-sm font-semibold">
                  404
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-[#1D1D1F]">Page Not Found</h1>
                <p className="text-[#86868B] text-sm mt-1 max-w-sm">
                  The requested campus event page or management destination does not exist.
                </p>
                <Link
                  to="/events"
                  className="mt-6 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1D1D1F] text-white text-xs font-medium hover:bg-black transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Return to Events
                </Link>
              </div>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
