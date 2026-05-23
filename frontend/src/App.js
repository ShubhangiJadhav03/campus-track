import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Layout
import DashboardLayout from './pages/DashboardLayout';

// Student pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentComplaints from './pages/student/StudentComplaints';
import NewComplaintPage from './pages/student/NewComplaintPage';
import ComplaintDetailPage from './pages/student/ComplaintDetailPage';
import StudentNotifications from './pages/student/StudentNotifications';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminComplaints from './pages/admin/AdminComplaints';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCategories from './pages/admin/AdminCategories';

// Staff pages
import StaffDashboard from './pages/staff/StaffDashboard';
import StaffComplaints from './pages/staff/StaffComplaints';

// Shared
import ProfilePage from './pages/ProfilePage';

// ── Route Guards ───────────────────────────────────────────────
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
        <p className="text-slate-500">Loading...</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace/>;
  if (roles && !roles.includes(user.role)) return <Navigate to={getDefaultRoute(user.role)} replace/>;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to={getDefaultRoute(user.role)} replace/>;
  return children;
};

const getDefaultRoute = (role) => {
  if (role === 'ADMIN')   return '/admin/dashboard';
  if (role === 'STAFF')   return '/staff/dashboard';
  if (role === 'STUDENT') return '/student/dashboard';
  return '/login';
};

// ── App ────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login"           element={<PublicRoute><LoginPage/></PublicRoute>}/>
      <Route path="/register"        element={<PublicRoute><RegisterPage/></PublicRoute>}/>
      <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage/></PublicRoute>}/>
      <Route path="/"                element={<Navigate to="/login" replace/>}/>

      {/* Protected — shared layout */}
      <Route element={<ProtectedRoute><DashboardLayout/></ProtectedRoute>}>
        {/* Profile — all roles */}
        <Route path="/profile" element={<ProfilePage/>}/>

        {/* Student */}
        <Route path="/student/dashboard"     element={<ProtectedRoute roles={['STUDENT']}><StudentDashboard/></ProtectedRoute>}/>
        <Route path="/student/complaints"    element={<ProtectedRoute roles={['STUDENT']}><StudentComplaints/></ProtectedRoute>}/>
        <Route path="/student/new-complaint" element={<ProtectedRoute roles={['STUDENT']}><NewComplaintPage/></ProtectedRoute>}/>
        <Route path="/student/notifications" element={<ProtectedRoute roles={['STUDENT']}><StudentNotifications/></ProtectedRoute>}/>
        <Route path="/complaints/:id"        element={<ProtectedRoute roles={['STUDENT','ADMIN','STAFF']}><ComplaintDetailPage/></ProtectedRoute>}/>

        {/* Admin */}
        <Route path="/admin/dashboard"   element={<ProtectedRoute roles={['ADMIN']}><AdminDashboard/></ProtectedRoute>}/>
        <Route path="/admin/complaints"  element={<ProtectedRoute roles={['ADMIN']}><AdminComplaints/></ProtectedRoute>}/>
        <Route path="/admin/analytics"   element={<ProtectedRoute roles={['ADMIN']}><AdminAnalytics/></ProtectedRoute>}/>
        <Route path="/admin/users"       element={<ProtectedRoute roles={['ADMIN']}><AdminUsers/></ProtectedRoute>}/>
        <Route path="/admin/categories"  element={<ProtectedRoute roles={['ADMIN']}><AdminCategories/></ProtectedRoute>}/>

        {/* Staff */}
        <Route path="/staff/dashboard"   element={<ProtectedRoute roles={['STAFF']}><StaffDashboard/></ProtectedRoute>}/>
        <Route path="/staff/complaints"  element={<ProtectedRoute roles={['STAFF']}><StaffComplaints/></ProtectedRoute>}/>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace/>}/>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes/>
        <ToastContainer
          position="top-right"
          autoClose={3500}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="light"
          toastClassName="rounded-xl shadow-lg"
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
