import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import AdminDashboard from './pages/dashboards/AdminDashboard.jsx';
import DoctorDashboard from './pages/dashboards/DoctorDashboard.jsx';
import TherapistDashboard from './pages/dashboards/TherapistDashboard.jsx';
import PatientDashboard from './pages/dashboards/PatientDashboard.jsx';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 to-green-900">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white font-medium">Loading...</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/dashboard/${user.role}`} replace />;
  }
  return children;
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={user ? <Navigate to={`/dashboard/${user.role}`} replace /> : <LoginPage />} />
      <Route
        path="/dashboard/admin"
        element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>}
      />
      <Route
        path="/dashboard/doctor"
        element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>}
      />
      <Route
        path="/dashboard/therapist"
        element={<ProtectedRoute allowedRoles={['therapist']}><TherapistDashboard /></ProtectedRoute>}
      />
      <Route
        path="/dashboard/patient"
        element={<ProtectedRoute allowedRoles={['patient']}><PatientDashboard /></ProtectedRoute>}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
