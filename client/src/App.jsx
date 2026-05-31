import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar, ToastContainer, ApplyGateModal } from './components/Shared';

import Landing          from './pages/Landing';
import BrowseJobs       from './pages/BrowseJobs';
import JobDetail        from './pages/JobDetail';
import Login            from './pages/Login';
import SignUp           from './pages/SignUp';
import SeekerDashboard  from './pages/SeekerDashboard';
import EmployerDashboard from './pages/EmployerDashboard';
import Analytics        from './pages/Analytics';
import InterviewPrep    from './pages/InterviewPrep';

// Protected route — redirects to /login if not authenticated
function ProtectedRoute({ children, role }) {
  const { user } = useApp();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <ApplyGateModal />
      <ToastContainer />
      <Routes>
        <Route path="/"              element={<Landing />} />
        <Route path="/browse"        element={<BrowseJobs />} />
        <Route path="/job/:id"       element={<JobDetail />} />
        <Route path="/login"         element={<Login />} />
        <Route path="/signup"        element={<SignUp />} />
        <Route path="/dashboard"     element={<ProtectedRoute role="seeker"><SeekerDashboard /></ProtectedRoute>} />
        <Route path="/employer"      element={<ProtectedRoute role="employer"><EmployerDashboard /></ProtectedRoute>} />
        <Route path="/analytics"     element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/interview-prep" element={<ProtectedRoute><InterviewPrep /></ProtectedRoute>} />
        <Route path="*"             element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
